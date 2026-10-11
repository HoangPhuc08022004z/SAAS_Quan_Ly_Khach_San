import { IApiService } from "../lib/api/contracts";
import { Room } from "../lib/api/types";
import { getDb, saveDb, nextId } from "./db";
import { simulateLatency, getForcePaymentStatus } from "./latency";
import {
  canActivateSubscription,
  canRenewSubscription,
  calculateNewEndDate,
} from "../rules/subscriptionRules";
import {
  canCreateProperty,
  canCreateRoom,
  canCreateUser,
  canUploadStorage,
} from "../rules/tenantRules";
import {
  isRoomAvailableForDates,
  calculateDepositRequired,
} from "../rules/bookingRules";
import { canCheckInReservation } from "../rules/checkinRules";
import { calculateBalance, canCheckOut } from "../rules/checkoutRules";
import { calculateCancellationQuote, canCancelReservation } from "../rules/cancellationRules";
import { isNoShowCandidate, calculateNoShowDepositSettlement, canConfirmNoShow } from "../rules/noShowRules";
import { calculateSellingPrice, canOrderFnb } from "../rules/fnbRules";
import { canConfirmDailyStats, validateAdjustment } from "../rules/statsRules";
import { BASE_DATE } from "@/config/constants";
import { useSessionStore } from "../lib/auth/session-store";

function getActiveTenantId(): string {
  const state = useSessionStore.getState();
  return state.tenant?.id || "tenant_abc";
}

function getActivePropertyId(): string {
  const state = useSessionStore.getState();
  return state.currentPropertyId || state.property?.id || "prop_abc_hn";
}

export const mockService: IApiService = {
  // ================= SCENARIO 1: SAAS PLATFORM (A1 - A38) =================
  async registerAccount(data) {
    await simulateLatency();
    const db = getDb();
    const existing = db.accounts.find((a: any) => a.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw { code: "EMAIL_EXISTS", message: "Email này đã được đăng ký trên hệ thống.", traceId: `ERR_${Date.now()}` };
    }
    const newAccount = {
      id: nextId("acc"),
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.accounts.push(newAccount as any);
    saveDb(db);
    return newAccount;
  },

  async loginAccount(data) {
    await simulateLatency();
    const db = getDb();
    const acc = db.accounts.find(
      (a: any) => a.email.toLowerCase() === data.email.toLowerCase() && (a.password === data.password || data.password === "123456" || data.password === "password123")
    );
    if (!acc) {
      throw { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không chính xác.", traceId: `ERR_${Date.now()}` };
    }
    const sub = db.subscriptions.find((s: any) => s.account_id === acc.id);
    const tenant = sub ? db.tenants.find((t: any) => t.id === sub.tenant_id) : db.tenants[0];

    return {
      token: `fake_jwt_${acc.id}`,
      account: acc as any,
      tenant: tenant as any,
      subscription: sub as any,
    };
  },

  async logoutAccount() {
    await simulateLatency(100, 200);
    return { success: true };
  },

  async refreshSession() {
    await simulateLatency(100, 200);
    const { account, tenant, subscription } = useSessionStore.getState();
    return {
      token: `refreshed_jwt_${account?.id || "anon"}`,
      account: account!,
      tenant: tenant || undefined,
      subscription: subscription || undefined,
    };
  },

  async getCurrentAccount() {
    await simulateLatency(100, 200);
    const { account, tenant, subscription } = useSessionStore.getState();
    return {
      account: account!,
      tenant: tenant || undefined,
      subscription: subscription || undefined,
    };
  },

  async listPublicPlans() {
    await simulateLatency();
    const db = getDb();
    return db.plans.filter((p: any) => p.status === "ACTIVE") as any;
  },

  async adminListPlans() {
    await simulateLatency();
    return getDb().plans as any;
  },

  async adminCreatePlan(data) {
    await simulateLatency();
    const db = getDb();
    const newPlan = {
      id: nextId("plan"),
      name: data.name || "Gói dịch vụ mới",
      description: data.description || "",
      price: Number(data.price) || 0,
      duration: Number(data.duration) || 1,
      duration_unit: data.duration_unit || "MONTH",
      max_users: Number(data.max_users) || 5,
      max_properties: Number(data.max_properties) || 1,
      max_rooms: Number(data.max_rooms) || 20,
      max_storage: Number(data.max_storage) || 1073741824,
      status: data.status || "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.plans.push(newPlan as any);
    saveDb(db);
    return newPlan as any;
  },

  async adminGetPlan(planId) {
    await simulateLatency();
    const plan = getDb().plans.find((p: any) => p.id === planId);
    if (!plan) throw { code: "NOT_FOUND", message: "Không tìm thấy gói dịch vụ.", traceId: `ERR_${Date.now()}` };
    return plan as any;
  },

  async adminUpdatePlan(planId, data) {
    await simulateLatency();
    const db = getDb();
    const idx = db.plans.findIndex((p: any) => p.id === planId);
    if (idx === -1) throw { code: "NOT_FOUND", message: "Không tìm thấy gói.", traceId: `ERR_${Date.now()}` };
    db.plans[idx] = { ...db.plans[idx], ...data, updated_at: new Date().toISOString() };
    saveDb(db);
    return db.plans[idx] as any;
  },

  async adminSetPlanStatus(planId, status) {
    await simulateLatency();
    const db = getDb();
    const p = db.plans.find((x: any) => x.id === planId);
    if (!p) throw { code: "NOT_FOUND", message: "Không tìm thấy gói.", traceId: `ERR_${Date.now()}` };
    p.status = status;
    p.updated_at = new Date().toISOString();
    saveDb(db);
    return p as any;
  },

  async createSubscriptionRequest(data) {
    await simulateLatency();
    const db = getDb();
    const plan = db.plans.find((p: any) => p.id === data.plan_id);
    if (!plan) throw { code: "NOT_FOUND", message: "Gói không tồn tại.", traceId: `ERR_${Date.now()}` };

    const state = useSessionStore.getState();
    const accountId = state.account?.id || "acc_owner_abc";

    const tenantId = nextId("tenant");
    const newTenant = {
      id: tenantId,
      name: data.tenant_name,
      description: data.tenant_description || "",
      status: "PENDING",
      max_properties: plan.max_properties,
      max_rooms: plan.max_rooms,
      max_users: plan.max_users,
      max_storage: plan.max_storage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.tenants.push(newTenant as any);

    const subId = nextId("sub");
    const newSub = {
      id: subId,
      account_id: accountId,
      plan_id: plan.id,
      tenant_id: tenantId,
      status: "PENDING",
      start_date: BASE_DATE,
      end_date: BASE_DATE,
      price: plan.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.subscriptions.push(newSub as any);
    saveDb(db);

    useSessionStore.getState().setAccountSession({
      account: state.account!,
      tenant: newTenant as any,
      subscription: newSub as any,
    });

    return newSub as any;
  },

  async getMySubscription() {
    await simulateLatency();
    const db = getDb();
    const state = useSessionStore.getState();
    const sub = db.subscriptions.find((s: any) => s.tenant_id === state.tenant?.id) || db.subscriptions[0];
    const plan = db.plans.find((p: any) => p.id === sub.plan_id) || db.plans[0];
    const tenant = db.tenants.find((t: any) => t.id === sub.tenant_id) || db.tenants[0];
    return { ...sub, plan, tenant } as any;
  },

  async getMyUsage() {
    await simulateLatency();
    const db = getDb();
    const tenantId = getActiveTenantId();
    const tenant = db.tenants.find((t: any) => t.id === tenantId) || db.tenants[0];

    const usersCount = db.users.filter((u: any) => u.tenant_id === tenantId).length;
    const properties = db.properties.filter((p: any) => p.tenant_id === tenantId);
    const roomsCount = db.rooms.filter((r: any) => properties.some((p: any) => p.id === r.property_id)).length;

    return {
      users: { current: Math.max(1, usersCount), max: tenant.max_users },
      properties: { current: properties.length, max: tenant.max_properties },
      rooms: { current: roomsCount, max: tenant.max_rooms },
      storage: { current: 157286400, max: tenant.max_storage }, // ~150MB
    };
  },

  async adminListSubscriptions(params) {
    await simulateLatency();
    const db = getDb();
    let list = db.subscriptions;
    if (params?.status) {
      list = list.filter((s: any) => s.status === params.status);
    }
    return list.map((s: any) => {
      const account = db.accounts.find((a: any) => a.id === s.account_id) || db.accounts[0];
      const plan = db.plans.find((p: any) => p.id === s.plan_id) || db.plans[0];
      const tenant = db.tenants.find((t: any) => t.id === s.tenant_id) || db.tenants[0];
      return { ...s, account, plan, tenant };
    }) as any;
  },

  async adminGetSubscription(id) {
    await simulateLatency();
    const db = getDb();
    const s = db.subscriptions.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Không tìm thấy yêu cầu thuê bao.", traceId: `ERR_${Date.now()}` };
    const account = db.accounts.find((a: any) => a.id === s.account_id) || db.accounts[0];
    const plan = db.plans.find((p: any) => p.id === s.plan_id) || db.plans[0];
    const tenant = db.tenants.find((t: any) => t.id === s.tenant_id) || db.tenants[0];
    const payments = db.subscription_payments.filter((sp: any) => sp.subscription_id === s.id);
    return { ...s, account, plan, tenant, payments } as any;
  },

  async adminApproveSubscription(id) {
    await simulateLatency();
    const db = getDb();
    const s = db.subscriptions.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Không tìm thấy thuê bao.", traceId: `ERR_${Date.now()}` };
    // Approval allows payment now
    s.updated_at = new Date().toISOString();
    saveDb(db);
    return s as any;
  },

  async adminRejectSubscription(id, reason) {
    await simulateLatency();
    const db = getDb();
    const s = db.subscriptions.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Không tìm thấy thuê bao.", traceId: `ERR_${Date.now()}` };
    s.status = "CANCELLED";
    s.updated_at = new Date().toISOString();
    const tenant = db.tenants.find((t: any) => t.id === s.tenant_id);
    if (tenant) tenant.status = "SUSPENDED";
    db._ext_audit_log.push({
      id: nextId("audit"),
      action: "REJECT_SUBSCRIPTION",
      entity: "SUBSCRIPTION",
      entity_id: id,
      user_email: "admin@hotelsaas.vn",
      details: `Lý do từ chối: ${reason}`,
      created_at: new Date().toISOString(),
    } as any);
    saveDb(db);
    return s as any;
  },

  async renewMySubscription() {
    await simulateLatency();
    const db = getDb();
    const sub = await this.getMySubscription();
    if (!canRenewSubscription(sub.status)) {
      throw { code: "CANNOT_RENEW", message: "Thuê bao hiện tại không thể gia hạn.", traceId: `ERR_${Date.now()}` };
    }
    const newEnd = calculateNewEndDate(sub.end_date, sub.plan.duration, sub.plan.duration_unit, BASE_DATE);
    const dbSub = db.subscriptions.find((s: any) => s.id === sub.id);
    if (dbSub) {
      dbSub.end_date = newEnd;
      dbSub.status = "ACTIVE";
      dbSub.updated_at = new Date().toISOString();
    }
    const tenant = db.tenants.find((t: any) => t.id === sub.tenant_id);
    if (tenant) tenant.status = "ACTIVE";
    saveDb(db);
    return dbSub as any;
  },

  async listMyReminders() {
    await simulateLatency();
    return getDb()._ext_renewal_reminder as any;
  },

  async createSubscriptionPayment(id, data) {
    await simulateLatency();
    const db = getDb();
    const sub = db.subscriptions.find((s: any) => s.id === id);
    if (!sub) throw { code: "NOT_FOUND", message: "Thuê bao không tồn tại.", traceId: `ERR_${Date.now()}` };
    const payId = nextId("spay");
    const newPayment = {
      id: payId,
      subscription_id: id,
      amount: sub.price,
      payment_method: data.payment_method || "MOMO",
      payment_gateway: data.gateway || "MOMO_GATEWAY",
      transaction_id: `TX_${Date.now()}`,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.subscription_payments.push(newPayment as any);
    saveDb(db);

    return {
      payment: newPayment as any,
      payUrl: `/owner/subscription/result?paymentId=${payId}`,
    };
  },

  async simulatePaymentWebhook(gateway, payload) {
    await simulateLatency();
    const db = getDb();
    const forceStatus = getForcePaymentStatus();
    const finalStatus = forceStatus === "AUTO" ? payload.status : forceStatus;

    const payment = db.subscription_payments.find((p: any) => p.transaction_id === payload.transaction_id || p.id === payload.transaction_id);
    if (!payment) throw { code: "NOT_FOUND", message: "Giao dịch không tồn tại.", traceId: `ERR_${Date.now()}` };

    payment.status = finalStatus;
    payment.updated_at = new Date().toISOString();
    if (finalStatus === "SUCCESS") {
      payment.paid_at = new Date().toISOString();
      const sub = db.subscriptions.find((s: any) => s.id === payment.subscription_id);
      if (sub) {
        sub.status = "ACTIVE";
        sub.start_date = BASE_DATE;
        const plan = db.plans.find((p: any) => p.id === sub.plan_id);
        if (plan) {
          sub.end_date = calculateNewEndDate(BASE_DATE, plan.duration, plan.duration_unit as any, BASE_DATE);
        }
        sub.updated_at = new Date().toISOString();
        const tenant = db.tenants.find((t: any) => t.id === sub.tenant_id);
        if (tenant) tenant.status = "ACTIVE";
      }
    }
    saveDb(db);
    const sub = db.subscriptions.find((s: any) => s.id === payment.subscription_id);
    return { success: finalStatus === "SUCCESS", subscription: sub as any };
  },

  async listMySubscriptionPayments() {
    await simulateLatency();
    const state = useSessionStore.getState();
    const subId = state.subscription?.id || "sub_abc";
    return getDb().subscription_payments.filter((sp: any) => sp.subscription_id === subId) as any;
  },

  async adminListSubscriptionPayments(params) {
    await simulateLatency();
    let payments = getDb().subscription_payments;
    if (params?.status) {
      payments = payments.filter((p: any) => p.status === params.status);
    }
    return payments as any;
  },

  async getSubscriptionPayment(id) {
    await simulateLatency();
    const payment = getDb().subscription_payments.find((p: any) => p.id === id);
    if (!payment) throw { code: "NOT_FOUND", message: "Giao dịch không tồn tại.", traceId: `ERR_${Date.now()}` };
    return payment as any;
  },

  async adminCreateTenant(data) {
    await simulateLatency();
    const db = getDb();
    const sub = db.subscriptions.find((s: any) => s.id === data.subscription_id);
    const plan = sub ? db.plans.find((p: any) => p.id === sub.plan_id) : db.plans[0];
    const newTenant = {
      id: nextId("tenant"),
      name: data.name,
      description: "",
      status: "ACTIVE",
      max_properties: plan?.max_properties || 3,
      max_rooms: plan?.max_rooms || 50,
      max_users: plan?.max_users || 10,
      max_storage: plan?.max_storage || 5368709120,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.tenants.push(newTenant as any);
    if (sub) {
      sub.tenant_id = newTenant.id;
      sub.status = "ACTIVE";
    }
    saveDb(db);
    return newTenant as any;
  },

  async getMyTenant() {
    await simulateLatency();
    const tenantId = getActiveTenantId();
    const tenant = getDb().tenants.find((t: any) => t.id === tenantId) || getDb().tenants[0];
    return tenant as any;
  },

  async updateMyTenant(data) {
    await simulateLatency();
    const db = getDb();
    const tenantId = getActiveTenantId();
    const tenant = db.tenants.find((t: any) => t.id === tenantId);
    if (!tenant) throw { code: "NOT_FOUND", message: "Tenant không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(tenant, data, { updated_at: new Date().toISOString() });
    saveDb(db);
    useSessionStore.getState().setAccountSession({
      account: useSessionStore.getState().account!,
      tenant: tenant as any,
    });
    return tenant as any;
  },

  async adminListTenants(params) {
    await simulateLatency();
    const db = getDb();
    let tenants = db.tenants;
    if (params?.status) {
      tenants = tenants.filter((t: any) => t.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      tenants = tenants.filter((t: any) => t.name.toLowerCase().includes(q));
    }
    return tenants.map((t: any) => {
      const sub = db.subscriptions.find((s: any) => s.tenant_id === t.id);
      const plan = sub ? db.plans.find((p: any) => p.id === sub.plan_id) : undefined;
      const propertiesCount = db.properties.filter((p: any) => p.tenant_id === t.id).length;
      return { ...t, subscription: sub, plan, propertiesCount };
    }) as any;
  },

  async adminGetTenant(id) {
    await simulateLatency();
    const db = getDb();
    const t = db.tenants.find((x: any) => x.id === id);
    if (!t) throw { code: "NOT_FOUND", message: "Không tìm thấy Tenant.", traceId: `ERR_${Date.now()}` };
    const sub = db.subscriptions.find((s: any) => s.tenant_id === t.id);
    const plan = sub ? db.plans.find((p: any) => p.id === sub.plan_id) : undefined;
    const properties = db.properties.filter((p: any) => p.tenant_id === t.id);
    const roomsCount = db.rooms.filter((r: any) => properties.some((p: any) => p.id === r.property_id)).length;
    const usersCount = db.users.filter((u: any) => u.tenant_id === t.id).length;

    return {
      ...t,
      subscription: sub,
      plan,
      properties,
      usage: {
        users: { current: usersCount, max: t.max_users },
        properties: { current: properties.length, max: t.max_properties },
        rooms: { current: roomsCount, max: t.max_rooms },
        storage: { current: 157286400, max: t.max_storage },
      },
    } as any;
  },

  async adminSetTenantStatus(id, status, reason) {
    await simulateLatency();
    const db = getDb();
    const t = db.tenants.find((x: any) => x.id === id);
    if (!t) throw { code: "NOT_FOUND", message: "Tenant không tồn tại.", traceId: `ERR_${Date.now()}` };
    t.status = status;
    t.updated_at = new Date().toISOString();
    db._ext_audit_log.push({
      id: nextId("audit"),
      action: status === "SUSPENDED" ? "SUSPEND_TENANT" : "ACTIVATE_TENANT",
      entity: "TENANT",
      entity_id: id,
      user_email: "admin@hotelsaas.vn",
      details: reason ? `Lý do: ${reason}` : `Đổi trạng thái sang ${status}`,
      created_at: new Date().toISOString(),
    } as any);
    saveDb(db);
    return t as any;
  },

  async adminGetOverview() {
    await simulateLatency();
    const db = getDb();
    const activeTenants = db.tenants.filter((t: any) => t.status === "ACTIVE").length;
    const suspendedTenants = db.tenants.filter((t: any) => t.status === "SUSPENDED").length;
    const pendingApprovals = db.subscriptions.filter((s: any) => s.status === "PENDING").length;
    const totalRevenue = db.subscription_payments
      .filter((p: any) => p.status === "SUCCESS")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return {
      activeTenants,
      suspendedTenants,
      pendingApprovals,
      totalRevenue,
      expiringSoonCount: 1,
      monthlyRevenue: [
        { month: "T05/26", revenue: 8500000 },
        { month: "T06/26", revenue: 12200000 },
        { month: "T07/26", revenue: 15600000 },
        { month: "T08/26", revenue: 18900000 },
        { month: "T09/26", revenue: 22400000 },
        { month: "T10/26", revenue: 26800000 },
      ],
    };
  },

  async runExpiryCheckJob() {
    await simulateLatency();
    const db = getDb();
    let expiredCount = 0;
    for (const sub of db.subscriptions) {
      if (sub.status === "ACTIVE" && new Date(sub.end_date) < new Date(BASE_DATE)) {
        sub.status = "EXPIRED";
        const tenant = db.tenants.find((t: any) => t.id === sub.tenant_id);
        if (tenant) tenant.status = "SUSPENDED";
        expiredCount++;
      }
    }
    const log = {
      id: nextId("job"),
      job_name: "subscription-expiry-check",
      status: "SUCCESS",
      details: `Đã quét và phát hiện ${expiredCount} subscription hết hạn`,
      processed_count: db.subscriptions.length,
      created_at: new Date().toISOString(),
    };
    db.job_logs.unshift(log as any);
    saveDb(db);
    return log as any;
  },

  async runRenewalReminderJob() {
    await simulateLatency();
    const db = getDb();
    const log = {
      id: nextId("job"),
      job_name: "renewal-reminders",
      status: "SUCCESS",
      details: "Đã gửi thông báo nhắc gia hạn cho các Tenant sắp hết hạn trong 7 ngày",
      processed_count: 1,
      created_at: new Date().toISOString(),
    };
    db.job_logs.unshift(log as any);
    saveDb(db);
    return log as any;
  },

  async adminListJobLogs() {
    await simulateLatency();
    return getDb().job_logs as any;
  },

  async listMyTickets() {
    await simulateLatency();
    const state = useSessionStore.getState();
    const accountId = state.account?.id || "acc_owner_abc";
    return getDb().support_tickets.filter((t: any) => t.account_id === accountId) as any;
  },

  async createTicket(data) {
    await simulateLatency();
    const db = getDb();
    const state = useSessionStore.getState();
    const newTicket = {
      id: nextId("tick"),
      account_id: state.account?.id || "acc_owner_abc",
      tenant_id: state.tenant?.id || "tenant_abc",
      title: data.title,
      message: data.message,
      status: "OPEN",
      priority: data.priority || "NORMAL",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.support_tickets.unshift(newTicket as any);
    saveDb(db);
    return newTicket as any;
  },

  async adminListTickets(params) {
    await simulateLatency();
    let tickets = getDb().support_tickets;
    if (params?.status) {
      tickets = tickets.filter((t: any) => t.status === params.status);
    }
    return tickets as any;
  },

  async adminGetTicket(id) {
    await simulateLatency();
    const db = getDb();
    const ticket = db.support_tickets.find((t: any) => t.id === id);
    if (!ticket) throw { code: "NOT_FOUND", message: "Ticket không tồn tại.", traceId: `ERR_${Date.now()}` };
    const replies = db._ext_ticket_reply.filter((r: any) => r.ticket_id === id);
    return { ...ticket, replies } as any;
  },

  async adminUpdateTicket(id, status) {
    await simulateLatency();
    const db = getDb();
    const ticket = db.support_tickets.find((t: any) => t.id === id);
    if (!ticket) throw { code: "NOT_FOUND", message: "Ticket không tồn tại.", traceId: `ERR_${Date.now()}` };
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    saveDb(db);
    return ticket as any;
  },

  async adminReplyTicket(id, message) {
    await simulateLatency();
    const db = getDb();
    db._ext_ticket_reply.push({
      id: nextId("reply"),
      ticket_id: id,
      sender_type: "ADMIN",
      message,
      created_at: new Date().toISOString(),
    } as any);
    saveDb(db);
    return { success: true };
  },

  async askSupportBot(message) {
    await simulateLatency(400, 700);
    const msg = message.toLowerCase();
    if (msg.includes("gia hạn") || msg.includes("subscription")) {
      return {
        answer: "Để gia hạn thuê bao, bạn vào mục 'Gói thuê bao' trên menu quản trị Owner, bấm nút 'Gia hạn gói' và chọn phương thức thanh toán. Thời hạn mới sẽ được cộng dồn tiếp vào hạn cũ.",
      };
    }
    if (msg.includes("momo") || msg.includes("cổng thanh toán")) {
      return {
        answer: "Cổng thanh toán MoMo yêu cầu nhập Partner Code, Access Key và Secret Key. Bạn có thể kiểm tra kết nối qua nút 'Kiểm tra kết nối' trong trang Cấu hình cổng thanh toán.",
      };
    }
    return {
      answer: "Tôi đã tìm kiếm trong tài liệu nền tảng nhưng chưa có câu trả lời phù hợp nhất cho câu hỏi này. Bạn có muốn gửi yêu cầu hỗ trợ trực tiếp đến đội ngũ kỹ thuật không?",
      canEscalateToTicket: true,
    };
  },

  async adminListKbFiles() {
    await simulateLatency();
    return getDb().file_metadata as any;
  },

  async adminUploadKbFile(file) {
    await simulateLatency();
    const db = getDb();
    const newFile = {
      id: nextId("fm"),
      filename: file.name,
      original_name: file.name,
      mime_type: file.type || "application/pdf",
      file_size: file.size || 1024000,
      file_url: `/uploads/${file.name}`,
      index_status: "INDEXED",
      created_at: new Date().toISOString(),
    };
    db.file_metadata.unshift(newFile as any);
    db._ext_file_link.push({
      id: nextId("fl"),
      file_id: newFile.id,
      entity_type: "KB",
      entity_id: "saas_platform",
      created_at: new Date().toISOString(),
    } as any);
    saveDb(db);
    return newFile as any;
  },

  async adminDeleteKbFile(fileId) {
    await simulateLatency();
    const db = getDb();
    db.file_metadata = db.file_metadata.filter((f: any) => f.id !== fileId);
    saveDb(db);
    return { success: true };
  },

  async adminReindexKbFile(fileId) {
    await simulateLatency(500, 1000);
    const db = getDb();
    const f = db.file_metadata.find((x: any) => x.id === fileId);
    if (!f) throw { code: "NOT_FOUND", message: "File không tồn tại.", traceId: `ERR_${Date.now()}` };
    f.index_status = "INDEXED";
    saveDb(db);
    return f as any;
  },

  // ================= SCENARIO 2: PROPERTY CONFIGURATION (B1 - B32) =================
  async listProperties() {
    await simulateLatency();
    const tenantId = getActiveTenantId();
    return getDb().properties.filter((p: any) => p.tenant_id === tenantId) as any;
  },

  async createProperty(data) {
    await simulateLatency();
    const db = getDb();
    const tenantId = getActiveTenantId();
    const tenant = db.tenants.find((t: any) => t.id === tenantId) || db.tenants[0];
    const currentProps = db.properties.filter((p: any) => p.tenant_id === tenantId);

    if (!canCreateProperty(currentProps.length, tenant.max_properties)) {
      throw {
        code: "LIMIT_EXCEEDED",
        message: `Bạn đã đạt giới hạn tối đa ${tenant.max_properties} khách sạn theo gói thuê bao hiện tại. Vui lòng nâng cấp gói để thêm khách sạn mới.`,
        traceId: `ERR_${Date.now()}`,
      };
    }

    const newProp = {
      id: nextId("prop"),
      tenant_id: tenantId,
      name: data.name || "Khách sạn mới",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      description: data.description || "",
      image_url: data.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.properties.push(newProp as any);
    saveDb(db);
    return newProp as any;
  },

  async getProperty(propertyId) {
    await simulateLatency();
    const prop = getDb().properties.find((p: any) => p.id === propertyId);
    if (!prop) throw { code: "NOT_FOUND", message: "Khách sạn không tồn tại.", traceId: `ERR_${Date.now()}` };
    return prop as any;
  },

  async updateProperty(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    const prop = db.properties.find((p: any) => p.id === propertyId);
    if (!prop) throw { code: "NOT_FOUND", message: "Khách sạn không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(prop, data, { updated_at: new Date().toISOString() });
    saveDb(db);
    return prop as any;
  },

  async deleteProperty(propertyId) {
    await simulateLatency();
    const db = getDb();
    db.properties = db.properties.filter((p: any) => p.id !== propertyId);
    saveDb(db);
    return { success: true };
  },

  async uploadPropertyImage(propertyId, imageUrl) {
    await simulateLatency();
    const db = getDb();
    const prop = db.properties.find((p: any) => p.id === propertyId);
    if (!prop) throw { code: "NOT_FOUND", message: "Khách sạn không tồn tại.", traceId: `ERR_${Date.now()}` };
    prop.image_url = imageUrl;
    saveDb(db);
    return prop as any;
  },

  async listPolicyFormulas(type) {
    await simulateLatency();
    let formulas = getDb().policy_formulas;
    if (type) formulas = formulas.filter((f: any) => f.type === type);
    return formulas as any;
  },

  async listPropertyPolicies(propertyId) {
    await simulateLatency();
    const db = getDb();
    const policies = db.property_policies.filter((pp: any) => pp.property_id === propertyId);
    return policies.map((pp: any) => {
      const formula = db.policy_formulas.find((pf: any) => pf.id === pp.policy_formula_id) || db.policy_formulas[0];
      return { ...pp, formula };
    }) as any;
  },

  async applyPolicy(propertyId, policyFormulaId, parameterValues) {
    await simulateLatency();
    const db = getDb();
    let policy = db.property_policies.find((p: any) => p.property_id === propertyId && p.policy_formula_id === policyFormulaId);
    if (policy) {
      policy.parameter_values = parameterValues as any;
      policy.is_active = true;
    } else {
      policy = {
        id: nextId("pp"),
        property_id: propertyId,
        policy_formula_id: policyFormulaId,
        parameter_values: parameterValues as any,
        is_active: true,
      };
      db.property_policies.push(policy as any);
    }
    saveDb(db);
    return policy as any;
  },

  async removePolicy(propertyId, policyFormulaId) {
    await simulateLatency();
    const db = getDb();
    db.property_policies = db.property_policies.filter(
      (pp: any) => !(pp.property_id === propertyId && pp.policy_formula_id === policyFormulaId)
    );
    saveDb(db);
    return { success: true };
  },

  async simulatePolicy(propertyId, policyFormulaId, params) {
    await simulateLatency();
    return calculateCancellationQuote(params.checkInDate, params.cancelDate, params.depositAmount);
  },

  async getCheckTimes(propertyId) {
    await simulateLatency();
    const db = getDb();
    const policy = db.property_policies.find(
      (pp: any) => pp.property_id === propertyId && pp.policy_formula_id === "pf_check_times"
    );
    return {
      check_in_time: policy?.parameter_values?.check_in_time || "14:00",
      check_out_time: policy?.parameter_values?.check_out_time || "12:00",
    };
  },

  async updateCheckTimes(propertyId, times) {
    await simulateLatency();
    await this.applyPolicy(propertyId, "pf_check_times", times);
    return times;
  },

  async listPropertyDocs(propertyId) {
    await simulateLatency();
    const db = getDb();
    const links = db._ext_file_link.filter((fl: any) => fl.entity_type === "PROPERTY" && fl.entity_id === propertyId);
    return db.file_metadata.filter((f: any) => links.some((l: any) => l.file_id === f.id)) as any;
  },

  async uploadPropertyDoc(propertyId, file) {
    await simulateLatency();
    const db = getDb();
    const newFile = {
      id: nextId("fm"),
      filename: file.name,
      original_name: file.name,
      mime_type: file.type || "application/pdf",
      file_size: file.size || 1024000,
      file_url: `/uploads/${file.name}`,
      index_status: "INDEXED",
      created_at: new Date().toISOString(),
    };
    db.file_metadata.unshift(newFile as any);
    db._ext_file_link.push({
      id: nextId("fl"),
      file_id: newFile.id,
      entity_type: "PROPERTY",
      entity_id: propertyId,
      created_at: new Date().toISOString(),
    } as any);
    saveDb(db);
    return newFile as any;
  },

  async deletePropertyDoc(propertyId, fileId) {
    await simulateLatency();
    const db = getDb();
    db._ext_file_link = db._ext_file_link.filter((fl: any) => !(fl.file_id === fileId && fl.entity_id === propertyId));
    saveDb(db);
    return { success: true };
  },

  async listRoomTypes(propertyId) {
    await simulateLatency();
    return getDb().room_types.filter((rt: any) => rt.property_id === propertyId) as any;
  },

  async createRoomType(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    const newRt = {
      id: nextId("rt"),
      property_id: propertyId,
      name: data.name || "Loại phòng mới",
      description: data.description || "",
      capacity: Number(data.capacity) || 2,
      bed_type: data.bed_type || "King Bed",
      num_beds: Number(data.num_beds) || 1,
      number_of_rooms: Number(data.number_of_rooms) || 5,
      image_url: data.image_url || "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60",
      amenities: data.amenities || ["Wifi", "Điều hòa"],
      status: data.status || "ACTIVE",
    };
    db.room_types.push(newRt as any);
    saveDb(db);
    return newRt as any;
  },

  async getRoomType(roomTypeId) {
    await simulateLatency();
    const rt = getDb().room_types.find((x: any) => x.id === roomTypeId);
    if (!rt) throw { code: "NOT_FOUND", message: "Loại phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    return rt as any;
  },

  async updateRoomType(roomTypeId, data) {
    await simulateLatency();
    const db = getDb();
    const rt = db.room_types.find((x: any) => x.id === roomTypeId);
    if (!rt) throw { code: "NOT_FOUND", message: "Loại phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(rt, data);
    saveDb(db);
    return rt as any;
  },

  async deleteRoomType(roomTypeId) {
    await simulateLatency();
    const db = getDb();
    db.room_types = db.room_types.filter((x: any) => x.id !== roomTypeId);
    saveDb(db);
    return { success: true };
  },

  async setRoomTypeStatus(roomTypeId, status) {
    await simulateLatency();
    const db = getDb();
    const rt = db.room_types.find((x: any) => x.id === roomTypeId);
    if (!rt) throw { code: "NOT_FOUND", message: "Loại phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    rt.status = status;
    saveDb(db);
    return rt as any;
  },

  async listRooms(roomTypeId) {
    await simulateLatency();
    return getDb().rooms.filter((r: any) => r.room_type_id === roomTypeId) as any;
  },

  async createRoom(roomTypeId, data) {
    await simulateLatency();
    const db = getDb();
    const rt = db.room_types.find((x: any) => x.id === roomTypeId);
    if (!rt) throw { code: "NOT_FOUND", message: "Loại phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const newRoom = {
      id: nextId("room"),
      room_type_id: roomTypeId,
      property_id: rt.property_id,
      room_number: data.room_number || "101",
      floor: Number(data.floor) || 1,
      status: "READY",
      is_available: true,
      description: data.description || "",
    };
    db.rooms.push(newRoom as any);
    saveDb(db);
    return newRoom as any;
  },

  async bulkCreateRooms(roomTypeId, data) {
    await simulateLatency();
    const db = getDb();
    const rt = db.room_types.find((x: any) => x.id === roomTypeId);
    if (!rt) throw { code: "NOT_FOUND", message: "Loại phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const created: Room[] = [];
    for (let i = data.startRoom; i <= data.endRoom; i++) {
      const roomNum = data.prefix ? `${data.prefix}${i}` : `${data.floor}${i < 10 ? "0" + i : i}`;
      const newRoom = {
        id: nextId("room"),
        room_type_id: roomTypeId,
        property_id: rt.property_id,
        room_number: roomNum,
        floor: data.floor,
        status: "READY" as const,
        is_available: true,
        description: `Phòng ${roomNum} tầng ${data.floor}`,
      };
      db.rooms.push(newRoom as any);
      created.push(newRoom as any);
    }
    saveDb(db);
    return created;
  },

  async getRoom(roomId) {
    await simulateLatency();
    const r = getDb().rooms.find((x: any) => x.id === roomId);
    if (!r) throw { code: "NOT_FOUND", message: "Phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    return r as any;
  },

  async updateRoom(roomId, data) {
    await simulateLatency();
    const db = getDb();
    const r = db.rooms.find((x: any) => x.id === roomId);
    if (!r) throw { code: "NOT_FOUND", message: "Phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(r, data);
    saveDb(db);
    return r as any;
  },

  async deleteRoom(roomId) {
    await simulateLatency();
    const db = getDb();
    db.rooms = db.rooms.filter((x: any) => x.id !== roomId);
    saveDb(db);
    return { success: true };
  },

  async getRoomRate(roomTypeId) {
    await simulateLatency();
    const rate = getDb().room_rates.find((rr: any) => rr.room_type_id === roomTypeId && rr.is_active);
    return (rate as any) || null;
  },

  async setRoomRate(roomTypeId, data) {
    await simulateLatency();
    const db = getDb();
    let rate = db.room_rates.find((rr: any) => rr.room_type_id === roomTypeId);
    if (rate) {
      rate.name = data.name;
      rate.price = data.price;
      rate.description = data.description || "";
      rate.is_active = true;
    } else {
      rate = {
        id: nextId("rr"),
        room_type_id: roomTypeId,
        name: data.name,
        price: data.price,
        description: data.description || "",
        is_active: true,
      };
      db.room_rates.push(rate as any);
    }
    saveDb(db);
    return rate as any;
  },

  async listServiceCatalog() {
    await simulateLatency();
    return getDb().service_catalog as any;
  },

  async listPropertyServices(propertyId) {
    await simulateLatency();
    const db = getDb();
    const svcs = db.property_services.filter((ps: any) => ps.property_id === propertyId);
    return svcs.map((ps: any) => {
      const catalogItem = db.service_catalog.find((sc: any) => sc.id === ps.service_catalog_id);
      return { ...ps, catalogItem };
    }) as any;
  },

  async createPropertyService(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    const cat = db.service_catalog.find((c: any) => c.id === data.service_catalog_id);
    const newSvc = {
      id: nextId("ps"),
      property_id: propertyId,
      service_catalog_id: data.service_catalog_id,
      custom_name: data.custom_name || cat?.name || "Dịch vụ mới",
      price: Number(data.price) || 0,
      unit: data.unit || cat?.default_unit || "lần",
      is_active: true,
      description: data.description || "",
    };
    db.property_services.push(newSvc as any);
    saveDb(db);
    return newSvc as any;
  },

  async updatePropertyService(propertyServiceId, data) {
    await simulateLatency();
    const db = getDb();
    const svc = db.property_services.find((x: any) => x.id === propertyServiceId);
    if (!svc) throw { code: "NOT_FOUND", message: "Dịch vụ không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(svc, data);
    saveDb(db);
    return svc as any;
  },

  async deletePropertyService(propertyServiceId) {
    await simulateLatency();
    const db = getDb();
    db.property_services = db.property_services.filter((x: any) => x.id !== propertyServiceId);
    saveDb(db);
    return { success: true };
  },

  async listFnbItems(propertyId) {
    await simulateLatency();
    return getDb().fnb_menu.filter((m: any) => m.property_id === propertyId) as any;
  },

  async createFnbItem(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    const purchase = Number(data.purchase_price) || 0;
    const profit = Number(data.profit_percent) || 0;
    const selling = calculateSellingPrice(purchase, profit);

    const newItem = {
      id: nextId("fnb"),
      property_id: propertyId,
      name: data.name,
      max_quantity: Number(data.max_quantity) || 10,
      actual_quantity: Number(data.actual_quantity) || 0,
      purchase_price: purchase,
      profit_percent: profit,
      selling_price: selling,
      status: data.status || "ACTIVE",
    };
    db.fnb_menu.push(newItem as any);
    saveDb(db);
    return newItem as any;
  },

  async updateFnbItem(fnbMenuId, data) {
    await simulateLatency();
    const db = getDb();
    const item = db.fnb_menu.find((x: any) => x.id === fnbMenuId);
    if (!item) throw { code: "NOT_FOUND", message: "Món F&B không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(item, data);
    if (data.purchase_price !== undefined || data.profit_percent !== undefined) {
      item.selling_price = calculateSellingPrice(item.purchase_price, item.profit_percent);
    }
    saveDb(db);
    return item as any;
  },

  async deleteFnbItem(fnbMenuId) {
    await simulateLatency();
    const db = getDb();
    db.fnb_menu = db.fnb_menu.filter((x: any) => x.id !== fnbMenuId);
    saveDb(db);
    return { success: true };
  },

  async listRoles() {
    await simulateLatency();
    return getDb().roles as any;
  },

  async listPermissions() {
    await simulateLatency();
    return getDb().permissions as any;
  },

  async listStaff(propertyId) {
    await simulateLatency();
    const db = getDb();
    const users = db.users.filter((u: any) => u.property_id === propertyId);
    return users.map((u: any) => {
      const role = db.roles.find((r: any) => r.id === u.role_id) || db.roles[0];
      return { ...u, role };
    }) as any;
  },

  async createStaff(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    const tenantId = getActiveTenantId();
    const tenant = db.tenants.find((t: any) => t.id === tenantId) || db.tenants[0];
    const staffCount = db.users.filter((u: any) => u.tenant_id === tenantId).length;

    if (!canCreateUser(staffCount, tenant.max_users)) {
      throw {
        code: "LIMIT_EXCEEDED",
        message: `Bạn đã đạt giới hạn tối đa ${tenant.max_users} tài khoản nhân viên.`,
        traceId: `ERR_${Date.now()}`,
      };
    }

    const newUser = {
      id: nextId("user"),
      tenant_id: tenantId,
      property_id: propertyId,
      role_id: data.role_id || "role_rec",
      email: data.email || `staff_${Date.now()}@hotel.vn`,
      password: "password123",
      full_name: data.full_name || "Nhân viên mới",
      phone: data.phone || "",
      status: "ACTIVE",
    };
    db.users.push(newUser as any);
    saveDb(db);
    return newUser as any;
  },

  async updateStaff(userId, data) {
    await simulateLatency();
    const db = getDb();
    const u = db.users.find((x: any) => x.id === userId);
    if (!u) throw { code: "NOT_FOUND", message: "Nhân viên không tồn tại.", traceId: `ERR_${Date.now()}` };
    Object.assign(u, data);
    saveDb(db);
    return u as any;
  },

  async setStaffRole(userId, roleId) {
    await simulateLatency();
    const db = getDb();
    const u = db.users.find((x: any) => x.id === userId);
    if (!u) throw { code: "NOT_FOUND", message: "Nhân viên không tồn tại.", traceId: `ERR_${Date.now()}` };
    u.role_id = roleId;
    saveDb(db);
    return u as any;
  },

  async setStaffStatus(userId, status) {
    await simulateLatency();
    const db = getDb();
    const u = db.users.find((x: any) => x.id === userId);
    if (!u) throw { code: "NOT_FOUND", message: "Nhân viên không tồn tại.", traceId: `ERR_${Date.now()}` };
    u.status = status;
    saveDb(db);
    return u as any;
  },

  async resetStaffPassword(userId) {
    await simulateLatency();
    const db = getDb();
    const u = db.users.find((x: any) => x.id === userId);
    if (!u) throw { code: "NOT_FOUND", message: "Nhân viên không tồn tại.", traceId: `ERR_${Date.now()}` };
    u.password = "123456";
    saveDb(db);
    return { success: true, tempPassword: "123456" };
  },

  async listGateways() {
    await simulateLatency();
    return getDb().payment_gateways as any;
  },

  async getGatewayConfig(propertyId) {
    await simulateLatency();
    const cfg = getDb().payment_gateway_config.find((c: any) => c.property_id === propertyId);
    if (!cfg) return null;
    return {
      ...cfg,
      secret_key: "••••••••••••••••", // masked secret key
    } as any;
  },

  async saveGatewayConfig(propertyId, data) {
    await simulateLatency();
    const db = getDb();
    let cfg = db.payment_gateway_config.find((c: any) => c.property_id === propertyId);
    if (cfg) {
      cfg.partner_code = data.partner_code;
      cfg.access_key = data.access_key;
      if (data.secret_key && !data.secret_key.includes("•••")) {
        cfg.secret_key = data.secret_key;
      }
      cfg.is_active = true;
    } else {
      cfg = {
        id: nextId("pgc"),
        property_id: propertyId,
        payment_gateway_id: data.payment_gateway_id,
        partner_code: data.partner_code,
        access_key: data.access_key,
        secret_key: data.secret_key,
        is_active: true,
      };
      db.payment_gateway_config.push(cfg as any);
    }
    saveDb(db);
    return { ...cfg, secret_key: "••••••••••••••••" } as any;
  },

  async deleteGatewayConfig(propertyId) {
    await simulateLatency();
    const db = getDb();
    db.payment_gateway_config = db.payment_gateway_config.filter((c: any) => c.property_id !== propertyId);
    saveDb(db);
    return { success: true };
  },

  async testGatewayConfig(propertyId) {
    await simulateLatency(400, 700);
    return { success: true, latencyMs: 342 };
  },

  async getSetupStatus(propertyId) {
    await simulateLatency();
    const db = getDb();
    const completed: string[] = ["info"];
    const missing: string[] = [];

    const hasTimes = db.property_policies.some((pp: any) => pp.property_id === propertyId && pp.policy_formula_id === "pf_check_times");
    if (hasTimes) completed.push("check_times"); else missing.push("Giờ nhận/trả phòng");

    const hasPolicies = db.property_policies.some((pp: any) => pp.property_id === propertyId && pp.policy_formula_id.includes("cancel"));
    if (hasPolicies) completed.push("policies"); else missing.push("Chính sách hủy/hoàn tiền");

    const roomTypes = db.room_types.filter((rt: any) => rt.property_id === propertyId);
    if (roomTypes.length > 0) completed.push("room_types"); else missing.push("Loại phòng");

    const rooms = db.rooms.filter((r: any) => r.property_id === propertyId);
    if (rooms.length > 0) completed.push("rooms"); else missing.push("Danh sách phòng");

    const hasRate = db.room_rates.some((rr: any) => roomTypes.some((rt: any) => rt.id === rr.room_type_id));
    if (hasRate) completed.push("rates"); else missing.push("Bảng giá phòng");

    const svcs = db.property_services.filter((ps: any) => ps.property_id === propertyId);
    if (svcs.length > 0) completed.push("services"); else missing.push("Dịch vụ khách sạn");

    const fnb = db.fnb_menu.filter((m: any) => m.property_id === propertyId);
    if (fnb.length > 0) completed.push("fnb"); else missing.push("Thực đơn F&B");

    const staff = db.users.filter((u: any) => u.property_id === propertyId);
    if (staff.length > 0) completed.push("staff"); else missing.push("Tài khoản nhân viên");

    const gw = db.payment_gateway_config.find((c: any) => c.property_id === propertyId);
    if (gw) completed.push("gateway"); else missing.push("Cổng thanh toán");

    return {
      completedSteps: completed,
      isFullyConfigured: missing.length === 0,
      missingItems: missing,
    };
  },

  // ================= SCENARIO 3: HOTEL OPERATIONS & CHATBOT (C1 - C52) =================
  async pmsLogin(data) {
    await simulateLatency();
    const db = getDb();
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === data.email.toLowerCase() && (u.password === data.password || data.password === "123456" || data.password === "password123")
    );
    if (!user) throw { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không đúng.", traceId: `ERR_${Date.now()}` };

    const tenant = db.tenants.find((t: any) => t.id === user.tenant_id);
    if (tenant?.status === "SUSPENDED") {
      throw { code: "TENANT_LOCKED", message: "Tài khoản khách sạn của bạn đang bị tạm khóa do hết hạn thuê bao. Vui lòng liên hệ chủ khách sạn để gia hạn.", traceId: `ERR_${Date.now()}` };
    }

    const role = db.roles.find((r: any) => r.id === user.role_id) || db.roles[0];
    const property = db.properties.find((p: any) => p.id === user.property_id) || db.properties[0];
    const permissions = db.permissions.map((p: any) => p.code);

    return {
      token: `pms_token_${user.id}`,
      user: user as any,
      role: role as any,
      permissions,
      property: property as any,
    };
  },

  async pmsLogout() {
    await simulateLatency(100, 200);
    return { success: true };
  },

  async pmsMe() {
    await simulateLatency(100, 200);
    const state = useSessionStore.getState();
    const user = state.user || (getDb().users[0] as any);
    const role = state.role || (getDb().roles[0] as any);
    const property = state.property || (getDb().properties[0] as any);
    return {
      user,
      role,
      permissions: state.permissions || [],
      property,
    };
  },

  async searchReservations(params) {
    await simulateLatency();
    const db = getDb();
    const propertyId = getActivePropertyId();
    let resList = db.reservations.filter((r: any) => r.property_id === propertyId);

    if (params?.status) {
      resList = resList.filter((r: any) => r.status === params.status);
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      resList = resList.filter((r: any) => {
        const guest = db.guests.find((g: any) => g.id === r.guest_id);
        return (
          r.code.toLowerCase().includes(q) ||
          guest?.full_name.toLowerCase().includes(q) ||
          guest?.phone.includes(q)
        );
      });
    }

    return resList.map((r: any) => {
      const guest = db.guests.find((g: any) => g.id === r.guest_id) || db.guests[0];
      const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === r.id);
      const rooms = db.rooms.filter((room: any) => resRooms.some((rr: any) => rr.room_id === room.id));
      return { ...r, guest, rooms };
    }) as any;
  },

  async getReservation(id) {
    await simulateLatency();
    const db = getDb();
    const r = db.reservations.find((x: any) => x.id === id);
    if (!r) throw { code: "NOT_FOUND", message: "Không tìm thấy đặt phòng.", traceId: `ERR_${Date.now()}` };
    const guest = db.guests.find((g: any) => g.id === r.guest_id) || db.guests[0];
    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === r.id);
    const rooms = db.rooms.filter((room: any) => resRooms.some((rr: any) => rr.room_id === room.id));
    const folios = db.folios.filter((f: any) => f.reservation_id === r.id);
    const payments = db.payments.filter((p: any) => p.reservation_id === r.id);
    const refunds = db.refunds.filter((ref: any) => ref.reservation_id === r.id);

    return { ...r, guest, rooms, folios, payments, refunds } as any;
  },

  async getAvailability(params) {
    await simulateLatency();
    const db = getDb();
    const propertyId = getActivePropertyId();
    let roomTypes = db.room_types.filter((rt: any) => rt.property_id === propertyId && rt.status === "ACTIVE");
    if (params.roomTypeId) {
      roomTypes = roomTypes.filter((rt: any) => rt.id === params.roomTypeId);
    }

    const existingRes = db.reservations.map((r: any) => {
      const resRoom = db.reservation_rooms.find((rr: any) => rr.reservation_id === r.id);
      return {
        roomId: resRoom?.room_id || "",
        checkIn: r.check_in_date,
        checkOut: r.check_out_date,
        status: r.status,
      };
    });

    return roomTypes.map((rt: any) => {
      const allRoomsOfType = db.rooms.filter((r: any) => r.room_type_id === rt.id);
      const availRooms = allRoomsOfType.filter((r: any) =>
        isRoomAvailableForDates(r.id, params.from, params.to, existingRes)
      );
      const rate = db.room_rates.find((rr: any) => rr.room_type_id === rt.id && rr.is_active);

      return {
        roomType: rt,
        availableRoomsCount: availRooms.length,
        rate: rate?.price || 1000000,
        rooms: availRooms,
      };
    }) as any;
  },

  async getRoomBoard(date) {
    await simulateLatency();
    const db = getDb();
    const propertyId = getActivePropertyId();
    const rooms = db.rooms.filter((r: any) => r.property_id === propertyId);

    return rooms.map((room: any) => {
      const roomType = db.room_types.find((rt: any) => rt.id === room.room_type_id) || db.room_types[0];
      const resRoom = db.reservation_rooms.find((rr: any) => rr.room_id === room.id);
      const res = resRoom
        ? db.reservations.find(
            (r: any) =>
              r.id === resRoom.reservation_id &&
              r.status !== "CANCELLED" &&
              r.status !== "CHECKED_OUT" &&
              date >= r.check_in_date &&
              date < r.check_out_date
          )
        : undefined;

      return {
        ...room,
        roomType,
        currentReservation: res,
      };
    }) as any;
  },

  async createReservation(data) {
    await simulateLatency();
    const db = getDb();
    const propertyId = getActivePropertyId();

    // Check conflict (409)
    for (const roomId of data.room_ids) {
      const existingRes = db.reservations.map((r: any) => {
        const rr = db.reservation_rooms.find((x: any) => x.reservation_id === r.id);
        return {
          roomId: rr?.room_id || "",
          checkIn: r.check_in_date,
          checkOut: r.check_out_date,
          status: r.status,
        };
      });
      if (!isRoomAvailableForDates(roomId, data.check_in_date, data.check_out_date, existingRes)) {
        throw {
          code: "CONFLICT",
          message: "Một hoặc nhiều phòng vừa được khách khác đặt hoặc đang bị khóa. Vui lòng chọn phòng khác.",
          traceId: `ERR_409_${Date.now()}`,
        };
      }
    }

    // Guest creation or reuse
    let guestId = data.guest.id;
    if (!guestId) {
      guestId = nextId("gst");
      const newGuest = {
        id: guestId,
        full_name: data.guest.full_name || "Khách vãng lai",
        email: data.guest.email || "",
        phone: data.guest.phone || "",
        id_card_number: data.guest.id_card_number || "",
        id_card_type: data.guest.id_card_type || "CCCD",
        nationality: data.guest.nationality || "Việt Nam",
        date_of_birth: data.guest.date_of_birth || "1990-01-01",
        address: data.guest.address || "",
      };
      db.guests.push(newGuest as any);
    }

    const resId = nextId("res");
    let total = 0;
    for (const rId of data.room_ids) {
      const rm = db.rooms.find((x: any) => x.id === rId);
      const rate = db.room_rates.find((x: any) => x.room_type_id === rm?.room_type_id)?.price || 1200000;
      total += rate;
      db.reservation_rooms.push({
        id: nextId("rr"),
        reservation_id: resId,
        room_id: rId,
        room_type_id: rm?.room_type_id || "",
        price_per_night: rate,
        nights: 1,
        amount: rate,
      } as any);
    }

    const deposit = calculateDepositRequired(total, 50);
    const newRes = {
      id: resId,
      property_id: propertyId,
      code: `RSV-${Date.now().toString().slice(-6)}`,
      guest_id: guestId,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      status: "CONFIRMED",
      total_amount: total,
      deposit_amount: deposit,
      balance_amount: total - deposit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.reservations.push(newRes as any);

    db.folios.push({
      id: nextId("fol"),
      reservation_id: resId,
      property_id: propertyId,
      charge_type: "ROOM",
      description: "Tiền phòng đặt trước",
      quantity: 1,
      unit_price: total,
      amount: total,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    saveDb(db);
    return newRes as any;
  },

  async createDepositPayment(id, method) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === id);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const pay = {
      id: nextId("pay"),
      reservation_id: id,
      property_id: res.property_id,
      payment_type: "DEPOSIT",
      amount: res.deposit_amount,
      payment_method: method || "MOMO",
      status: "SUCCESS",
      transaction_id: `MOMO_DEP_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.payments.push(pay as any);
    saveDb(db);
    return { payment: pay as any, payUrl: `/pms/reservations/${id}` };
  },

  async getCheckinCheck(id) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === id);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === id);
    const rooms = resRooms.map((rr: any) => {
      const room = db.rooms.find((r: any) => r.id === rr.room_id) || db.rooms[0];
      const hasIssue = db._ext_hk_issue.some((h: any) => h.room_id === room.id && h.status !== "RESOLVED");
      return {
        ...room,
        isReady: room.status === "READY" && !hasIssue,
        hasIssue,
      };
    });

    const check = canCheckInReservation(
      res.status,
      rooms.map((r: any) => ({
        roomId: r.id,
        roomNumber: r.room_number,
        status: r.status,
        hasUnresolvedIssue: r.hasIssue,
      }))
    );

    return {
      canCheckIn: check.canCheckIn,
      reasons: check.reasons,
      rooms: rooms as any,
    };
  },

  async saveReservationGuests(id, guests) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === id);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    for (const g of guests) {
      if (g.id) {
        const existing = db.guests.find((x: any) => x.id === g.id);
        if (existing) Object.assign(existing, g);
      } else {
        const newG = { id: nextId("gst"), ...g };
        db.guests.push(newG as any);
      }
    }
    saveDb(db);
    return { success: true };
  },

  async checkIn(id) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === id);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const check = await this.getCheckinCheck(id);
    if (!check.canCheckIn) {
      throw {
        code: "CHECKIN_PRECONDITION_FAILED",
        message: check.reasons.join(" "),
        traceId: `ERR_${Date.now()}`,
      };
    }

    res.status = "CHECKED_IN";
    res.updated_at = new Date().toISOString();

    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === id);
    for (const rr of resRooms) {
      const room = db.rooms.find((r: any) => r.id === rr.room_id);
      if (room) {
        room.status = "OCCUPIED";
        room.is_available = false;
      }
    }
    saveDb(db);
    return res as any;
  },

  async listPmsRooms(status) {
    await simulateLatency();
    const propertyId = getActivePropertyId();
    let rooms = getDb().rooms.filter((r: any) => r.property_id === propertyId);
    if (status) rooms = rooms.filter((r: any) => r.status === status);
    return rooms as any;
  },

  async setRoomStatus(roomId, status) {
    await simulateLatency();
    const db = getDb();
    const room = db.rooms.find((r: any) => r.id === roomId);
    if (!room) throw { code: "NOT_FOUND", message: "Phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    room.status = status;
    room.is_available = status === "READY";
    saveDb(db);
    return room as any;
  },

  async getHousekeepingSchedule(date) {
    await simulateLatency();
    const db = getDb();
    const propertyId = getActivePropertyId();
    const rooms = db.rooms.filter((r: any) => r.property_id === propertyId);

    return rooms.map((r: any) => {
      const issue = db._ext_hk_issue.find((h: any) => h.room_id === r.id && h.status !== "RESOLVED");
      return {
        ...r,
        cleaningStatus: r.status === "VACANT_DIRTY" ? "Cần dọn" : r.status === "CLEANING" ? "Đang dọn" : "Đã xong",
        hkIssue: issue,
      };
    }) as any;
  },

  async listHkIssues(propertyId) {
    await simulateLatency();
    const propId = propertyId || getActivePropertyId();
    return getDb()._ext_hk_issue.filter((h: any) => h.property_id === propId) as any;
  },

  async createHkIssue(data) {
    await simulateLatency();
    const db = getDb();
    const propId = getActivePropertyId();
    const newIssue = {
      id: nextId("hki"),
      property_id: propId,
      room_id: data.room_id,
      user_id: "user_hk_hn",
      issue_type: data.issue_type,
      description: data.description,
      status: "OPEN",
      created_at: new Date().toISOString(),
    };
    db._ext_hk_issue.unshift(newIssue as any);
    saveDb(db);
    return newIssue as any;
  },

  async resolveHkIssue(id, resolution) {
    await simulateLatency();
    const db = getDb();
    const issue = db._ext_hk_issue.find((h: any) => h.id === id);
    if (!issue) throw { code: "NOT_FOUND", message: "Sự cố không tồn tại.", traceId: `ERR_${Date.now()}` };
    issue.resolution = resolution;
    issue.status = "RESOLVED";
    saveDb(db);
    return issue as any;
  },

  async getCheckoutSummary(id) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === id);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const folios = db.folios.filter((f: any) => f.reservation_id === id);
    const payments = db.payments.filter((p: any) => p.reservation_id === id && p.status === "SUCCESS");

    const totalCharges = folios.reduce((s: number, f: any) => s + f.amount, 0);
    const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0);
    const balance = calculateBalance(totalCharges, totalPaid);

    const check = canCheckOut(res.status, balance);

    return {
      totalCharges,
      totalPaid,
      balance,
      canCheckOut: check.canCheckOut,
      requiresRefund: balance < 0,
      requiresPayment: balance > 0,
      folios: folios as any,
    };
  },

  async getFolio(reservationId) {
    await simulateLatency();
    return getDb().folios.filter((f: any) => f.reservation_id === reservationId) as any;
  },

  async addFolioCharge(reservationId, charge) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const amount = charge.quantity * charge.unit_price;
    const newFolio = {
      id: nextId("fol"),
      reservation_id: reservationId,
      property_id: res.property_id,
      charge_type: charge.charge_type,
      description: charge.description,
      quantity: charge.quantity,
      unit_price: charge.unit_price,
      amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.folios.push(newFolio as any);
    res.total_amount += amount;
    res.balance_amount += amount;
    saveDb(db);
    return newFolio as any;
  },

  async createBalancePayment(reservationId, amount, method) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const pay = {
      id: nextId("pay"),
      reservation_id: reservationId,
      property_id: res.property_id,
      payment_type: "BALANCE",
      amount,
      payment_method: method || "MOMO",
      status: "SUCCESS",
      transaction_id: `MOMO_BAL_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.payments.push(pay as any);
    res.balance_amount = Math.max(0, res.balance_amount - amount);
    saveDb(db);
    return { payment: pay as any, payUrl: `/pms/checkout?reservationId=${reservationId}` };
  },

  async simulatePmsPaymentWebhook(gateway, payload) {
    await simulateLatency();
    const db = getDb();
    const pay = db.payments.find((p: any) => p.id === payload.payment_id);
    if (pay) {
      pay.status = payload.status;
      saveDb(db);
    }
    return { success: true };
  },

  async checkOut(reservationId) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const summary = await this.getCheckoutSummary(reservationId);
    if (!summary.canCheckOut) {
      throw {
        code: "CHECKOUT_PRECONDITION_FAILED",
        message: "Không thể hoàn tất trả phòng vì công nợ chưa bằng 0.",
        traceId: `ERR_${Date.now()}`,
      };
    }

    res.status = "CHECKED_OUT";
    res.updated_at = new Date().toISOString();

    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === reservationId);
    for (const rr of resRooms) {
      const room = db.rooms.find((r: any) => r.id === rr.room_id);
      if (room) {
        room.status = "VACANT_DIRTY";
        room.is_available = false;
      }
    }
    saveDb(db);
    return res as any;
  },

  async listFnbMenu(propertyId) {
    await simulateLatency();
    const propId = propertyId || getActivePropertyId();
    return getDb().fnb_menu.filter((m: any) => m.property_id === propId) as any;
  },

  async createFnbRequest(data) {
    await simulateLatency();
    const db = getDb();
    const propId = getActivePropertyId();
    const newReq = {
      id: nextId("fnbr"),
      property_id: propId,
      user_id: "user_rec_hn",
      fnb_menu_id: data.fnb_menu_id,
      quantity: data.quantity,
      reason: data.reason,
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    db._ext_fnb_request.unshift(newReq as any);
    saveDb(db);
    return newReq as any;
  },

  async listFnbRequests(status) {
    await simulateLatency();
    const db = getDb();
    let reqs = db._ext_fnb_request;
    if (status) reqs = reqs.filter((r: any) => r.status === status);
    return reqs.map((r: any) => {
      const item = db.fnb_menu.find((m: any) => m.id === r.fnb_menu_id) || db.fnb_menu[0];
      const user = db.users.find((u: any) => u.id === r.user_id) || db.users[0];
      return { ...r, item, user };
    }) as any;
  },

  async approveFnbRequest(id) {
    await simulateLatency();
    const db = getDb();
    const req = db._ext_fnb_request.find((r: any) => r.id === id);
    if (!req) throw { code: "NOT_FOUND", message: "Yêu cầu F&B không tồn tại.", traceId: `ERR_${Date.now()}` };
    req.status = "APPROVED";
    saveDb(db);
    return req as any;
  },

  async rejectFnbRequest(id, reason) {
    await simulateLatency();
    const db = getDb();
    const req = db._ext_fnb_request.find((r: any) => r.id === id);
    if (!req) throw { code: "NOT_FOUND", message: "Yêu cầu F&B không tồn tại.", traceId: `ERR_${Date.now()}` };
    req.status = "REJECTED";
    (req as any).reject_reason = reason;
    saveDb(db);
    return req as any;
  },

  async updateFnbActual(id, data) {
    await simulateLatency();
    const db = getDb();
    const item = db.fnb_menu.find((m: any) => m.id === id);
    if (!item) throw { code: "NOT_FOUND", message: "Món F&B không tồn tại.", traceId: `ERR_${Date.now()}` };
    item.actual_quantity = data.actual_quantity;
    item.purchase_price = data.purchase_price;
    item.selling_price = calculateSellingPrice(data.purchase_price, item.profit_percent);
    saveDb(db);
    return item as any;
  },

  async createFnbOrder(reservationId, data) {
    await simulateLatency();
    const db = getDb();
    const item = db.fnb_menu.find((m: any) => m.id === data.fnb_menu_id);
    if (!item) throw { code: "NOT_FOUND", message: "Món không tồn tại.", traceId: `ERR_${Date.now()}` };

    if (!canOrderFnb(item.max_quantity, item.actual_quantity, data.quantity)) {
      throw {
        code: "FNB_LIMIT_EXCEEDED",
        message: `Số lượng đặt (${data.quantity}) vượt quá giới hạn khả dụng trong ngày (${item.max_quantity - item.actual_quantity} phần).`,
        traceId: `ERR_${Date.now()}`,
      };
    }

    const total = data.quantity * item.selling_price;
    db._ext_fnb_order.push({
      id: nextId("fnbo"),
      reservation_id: reservationId,
      fnb_menu_id: item.id,
      quantity: data.quantity,
      unit_price: item.selling_price,
      total_amount: total,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    } as any);

    item.actual_quantity += data.quantity;

    const folio = await this.addFolioCharge(reservationId, {
      charge_type: "FNB",
      description: `${item.name} (${data.quantity} phần)`,
      quantity: data.quantity,
      unit_price: item.selling_price,
    });

    saveDb(db);
    return { folio };
  },

  async listPmsServices(type) {
    await simulateLatency();
    const propId = getActivePropertyId();
    return getDb().property_services.filter((ps: any) => ps.property_id === propId) as any;
  },

  async createServiceRequest(reservationId, data) {
    await simulateLatency();
    const db = getDb();
    const svc = db.property_services.find((s: any) => s.id === data.property_service_id);
    if (!svc) throw { code: "NOT_FOUND", message: "Dịch vụ không tồn tại.", traceId: `ERR_${Date.now()}` };

    db._ext_service_request.push({
      id: nextId("sr"),
      reservation_id: reservationId,
      property_service_id: svc.id,
      scheduled_time: data.scheduled_time,
      notes: data.notes || "",
      price: svc.price,
      status: "PENDING",
      created_at: new Date().toISOString(),
    } as any);

    let folio;
    if (svc.price > 0) {
      folio = await this.addFolioCharge(reservationId, {
        charge_type: "SERVICE",
        description: `${svc.custom_name} - ${data.notes || "Yêu cầu dịch vụ"}`,
        quantity: 1,
        unit_price: svc.price,
      });
    }
    saveDb(db);
    return { folio };
  },

  async getCancellationQuote(reservationId) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };
    return calculateCancellationQuote(res.check_in_date, BASE_DATE, res.deposit_amount);
  },

  async cancelReservation(reservationId, reason) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    if (!canCancelReservation(res.status)) {
      throw { code: "CANNOT_CANCEL", message: `Không thể hủy đặt phòng ở trạng thái ${res.status}.`, traceId: `ERR_${Date.now()}` };
    }

    const quote = calculateCancellationQuote(res.check_in_date, BASE_DATE, res.deposit_amount);
    res.status = "CANCELLED";
    res.updated_at = new Date().toISOString();

    // Release rooms
    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === reservationId);
    for (const rr of resRooms) {
      const room = db.rooms.find((r: any) => r.id === rr.room_id);
      if (room && room.status === "OCCUPIED") {
        room.status = "READY";
        room.is_available = true;
      }
    }

    let refund;
    if (quote.refundAmount > 0) {
      const pay = db.payments.find((p: any) => p.reservation_id === reservationId && p.status === "SUCCESS");
      refund = {
        id: nextId("ref"),
        payment_id: pay?.id || "pay_0",
        reservation_id: reservationId,
        amount: quote.refundAmount,
        reason: reason || "Hủy theo chính sách hoàn tiền",
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.refunds.push(refund as any);
    }

    saveDb(db);
    return { reservation: res as any, refund: refund as any };
  },

  async sendNotification(reservationId, type, message) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    const guest = res ? db.guests.find((g: any) => g.id === res.guest_id) : db.guests[0];

    const notif = {
      id: nextId("notif"),
      reservation_id: reservationId,
      guest_name: guest?.full_name || "Khách hàng",
      guest_phone: guest?.phone || "0912345678",
      type: type as any,
      content: message,
      status: "SENT",
      sent_at: new Date().toISOString(),
    };
    db._ext_notification.push(notif as any);
    saveDb(db);
    return notif as any;
  },

  async listRefunds(status) {
    await simulateLatency();
    const db = getDb();
    let refunds = db.refunds;
    if (status) refunds = refunds.filter((r: any) => r.status === status);
    return refunds.map((rf: any) => {
      const reservation = db.reservations.find((r: any) => r.id === rf.reservation_id) || db.reservations[0];
      return { ...rf, reservation };
    }) as any;
  },

  async createRefundRequest(reservationId, data) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    const pay = db.payments.find((p: any) => p.reservation_id === reservationId && p.status === "SUCCESS");
    const newRef = {
      id: nextId("ref"),
      payment_id: pay?.id || "pay_0",
      reservation_id: reservationId,
      amount: data.amount,
      reason: data.reason,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.refunds.push(newRef as any);
    saveDb(db);
    return newRef as any;
  },

  async executeRefund(id) {
    await simulateLatency();
    const db = getDb();
    const rf = db.refunds.find((x: any) => x.id === id);
    if (!rf) throw { code: "NOT_FOUND", message: "Yêu cầu hoàn tiền không tồn tại.", traceId: `ERR_${Date.now()}` };
    rf.status = "SUCCESS";
    rf.executed_at = new Date().toISOString();
    rf.updated_at = new Date().toISOString();
    saveDb(db);
    return rf as any;
  },

  async setRefundStatus(id, status) {
    await simulateLatency();
    const db = getDb();
    const rf = db.refunds.find((x: any) => x.id === id);
    if (!rf) throw { code: "NOT_FOUND", message: "Yêu cầu không tồn tại.", traceId: `ERR_${Date.now()}` };
    rf.status = status;
    rf.updated_at = new Date().toISOString();
    saveDb(db);
    return rf as any;
  },

  async listNoShowCandidates() {
    await simulateLatency();
    const db = getDb();
    const propId = getActivePropertyId();
    const candidates = db.reservations.filter((r: any) => {
      return r.property_id === propId && isNoShowCandidate(r.check_in_date, "14:00", `${BASE_DATE}T18:00:00+07:00`, r.status);
    });

    return candidates.map((r: any) => {
      const guest = db.guests.find((g: any) => g.id === r.guest_id) || db.guests[0];
      const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === r.id);
      const rooms = db.rooms.filter((room: any) => resRooms.some((rr: any) => rr.room_id === room.id));
      return { ...r, guest, rooms, hoursOverdue: 4 };
    }) as any;
  },

  async confirmNoShow(reservationId, data) {
    await simulateLatency();
    const db = getDb();
    const res = db.reservations.find((r: any) => r.id === reservationId);
    if (!res) throw { code: "NOT_FOUND", message: "Đặt phòng không tồn tại.", traceId: `ERR_${Date.now()}` };

    if (!canConfirmNoShow(res.status)) {
      throw { code: "INVALID_STATE", message: "Đặt phòng không thể xác nhận No-Show.", traceId: `ERR_${Date.now()}` };
    }

    res.status = "NO_SHOW";
    res.updated_at = new Date().toISOString();

    // Release rooms
    const resRooms = db.reservation_rooms.filter((rr: any) => rr.reservation_id === reservationId);
    for (const rr of resRooms) {
      const room = db.rooms.find((r: any) => r.id === rr.room_id);
      if (room) {
        room.status = "READY";
        room.is_available = true;
      }
    }

    const { refundAmount } = calculateNoShowDepositSettlement(res.deposit_amount, 1200000);
    let refund;
    if (refundAmount > 0 && !data.keepFirstNight) {
      refund = {
        id: nextId("ref"),
        payment_id: "pay_noshow",
        reservation_id: reservationId,
        amount: refundAmount,
        reason: "Hoàn tiền phần dư cọc sau khi xác nhận No-Show",
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.refunds.push(refund as any);
    }

    saveDb(db);
    return { reservation: res as any, refund: refund as any };
  },

  async runNoShowDetectJob() {
    await simulateLatency();
    const db = getDb();
    const log = {
      id: nextId("job"),
      job_name: "no-show-detect",
      status: "SUCCESS",
      details: "Đã quét các đặt phòng quá giờ nhận phòng: tìm thấy 1 ứng viên No-Show",
      processed_count: 1,
      created_at: new Date().toISOString(),
    };
    db.job_logs.unshift(log as any);
    saveDb(db);
    return log as any;
  },

  async runDailyStatsJob(date) {
    await simulateLatency();
    const db = getDb();
    const statDate = date || BASE_DATE;
    const log = {
      id: nextId("job"),
      job_name: "daily-statistics",
      status: "SUCCESS",
      details: `Đã tổng hợp số liệu vận hành ngày ${statDate}`,
      processed_count: db.properties.length,
      created_at: new Date().toISOString(),
    };
    db.job_logs.unshift(log as any);
    saveDb(db);
    return log as any;
  },

  async listDailyStats(params) {
    await simulateLatency();
    const propId = getActivePropertyId();
    let stats = getDb().daily_statistics.filter((s: any) => s.property_id === propId);
    if (params?.from && params?.to) {
      stats = stats.filter((s: any) => s.stat_date >= params.from! && s.stat_date <= params.to!);
    }
    return stats as any;
  },

  async getDailyStats(id) {
    await simulateLatency();
    const s = getDb().daily_statistics.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Số liệu ngày không tồn tại.", traceId: `ERR_${Date.now()}` };
    return s as any;
  },

  async adjustDailyStats(id, data) {
    await simulateLatency();
    const db = getDb();
    const s = db.daily_statistics.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Số liệu không tồn tại.", traceId: `ERR_${Date.now()}` };

    const validation = validateAdjustment(data.adjustmentReason, (s as any)[data.field] || 0, data.newValue);
    if (!validation.valid) {
      throw { code: "VALIDATION_FAILED", message: validation.error!, traceId: `ERR_${Date.now()}` };
    }

    (s as any)[data.field] = data.newValue;
    s.status = "ADJUSTED";
    s.adjustment_reason = data.adjustmentReason;

    db._ext_audit_log.push({
      id: nextId("audit"),
      action: "ADJUST_DAILY_STATS",
      entity: "DAILY_STATISTICS",
      entity_id: id,
      user_email: "manager.hn@abc.vn",
      details: `Sửa trường ${data.field} thành ${data.newValue}. Lý do: ${data.adjustmentReason}`,
      created_at: new Date().toISOString(),
    } as any);

    saveDb(db);
    return s as any;
  },

  async confirmDailyStats(id) {
    await simulateLatency();
    const db = getDb();
    const s = db.daily_statistics.find((x: any) => x.id === id);
    if (!s) throw { code: "NOT_FOUND", message: "Số liệu không tồn tại.", traceId: `ERR_${Date.now()}` };

    if (!canConfirmDailyStats(s.status)) {
      throw { code: "ALREADY_CONFIRMED", message: "Số liệu ngày này đã được chốt sổ trước đó.", traceId: `ERR_${Date.now()}` };
    }

    s.status = "CONFIRMED";
    s.confirmed_at = new Date().toISOString();
    saveDb(db);
    return s as any;
  },

  async approveReport(id) {
    await simulateLatency();
    return { success: true };
  },

  async getOwnerOverview() {
    await simulateLatency();
    const db = getDb();
    const tenantId = getActiveTenantId();
    const props = db.properties.filter((p: any) => p.tenant_id === tenantId);

    return {
      todayRevenue: 42500000,
      occupancyRate: 78.5,
      properties: props.map((p: any, idx: number) => ({
        property: p,
        occupancy: 75 + idx * 5,
        revenue: 18000000 + idx * 4000000,
        unconfirmedReports: idx === 0 ? 1 : 0,
      })),
    };
  },

  async listOwnerReports(status) {
    await simulateLatency();
    let stats = getDb().daily_statistics;
    if (status) stats = stats.filter((s: any) => s.status === status);
    return stats as any;
  },

  async askGuestBot(propertyId, message) {
    await simulateLatency(400, 700);
    const msg = message.toLowerCase();
    const citations: string[] = ["Sổ tay quy định phòng và nội quy khách sạn ABC.pdf"];

    if (msg.includes("giờ") || msg.includes("nhận phòng") || msg.includes("trả phòng") || msg.includes("checkin")) {
      return {
        answer: "Giờ nhận phòng tiêu chuẩn là từ 14:00 và giờ trả phòng muộn nhất là 12:00 trưa. Khách nhận phòng sớm hoặc trả phòng muộn vui lòng thông báo trước với quầy lễ tân để được hỗ trợ tùy thuộc vào tình trạng phòng.",
        citations,
      };
    }

    if (msg.includes("hủy") || msg.includes("hoàn tiền") || msg.includes("chính sách")) {
      return {
        answer: "Chính sách hủy phòng: Khách hàng hủy trước 7 ngày so với ngày nhận phòng sẽ được hoàn lại 100% tiền đặt cọc. Hủy từ 3-6 ngày được hoàn 50%. Hủy trong vòng dưới 3 ngày sẽ không được hoàn cọc.",
        citations,
      };
    }

    if (msg.includes("phòng") || msg.includes("giá") || msg.includes("trống")) {
      return {
        answer: "Khách sạn hiện có phòng Deluxe King Ban Công (1.200.000 ₫/đêm) và Phòng Suite Hoàng Gia (2.400.000 ₫/đêm) còn sẵn sàng đón khách trong tuần này.",
        citations,
        liveAvailability: {
          deluxe: "Còn 4 phòng trống",
          suite: "Còn 2 phòng trống",
        },
      };
    }

    return {
      answer: "Cảm ơn quý khách đã quan tâm. Khách sạn luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc. Quý khách có thể xem thêm danh sách tiện ích hoặc liên hệ trực tiếp lễ tân qua số điện thoại 02438889999.",
      citations,
    };
  },

  async getPublicAvailability(propertyId, params) {
    await simulateLatency();
    return this.getAvailability({ from: params.checkIn, to: params.checkOut });
  },

  async askStaffBot(message, context) {
    await simulateLatency(400, 700);
    const msg = message.toLowerCase();

    if (msg.includes("doanh thu") || msg.includes("hôm nay") || msg.includes("số liệu")) {
      return {
        answer: "Theo thống kê sơ bộ hệ thống ngày 11/10/2026: Doanh thu phòng ước tính đạt 18.200.000 ₫, doanh thu F&B đạt 3.500.000 ₫, công suất phòng đạt 72.7% (16/22 phòng có khách).",
        citations: ["Báo cáo Night Audit ngày 11/10/2026", "Hệ thống PMS Live"],
        isOfficialDisclaimer: true,
      };
    }

    if (msg.includes("no-show") || msg.includes("vắng mặt")) {
      return {
        answer: "Quy trình xử lý No-Show: Đối với khách quá giờ nhận phòng quy định (sau 14:00), lễ tân gửi thông báo nhắc qua SMS/Zalo. Thời hạn chờ phản hồi là 12 tiếng. Nếu không có phản hồi, Quản lý (Manager) sẽ bấm xác nhận No-Show để giải phóng phòng và khấu trừ tiền cọc theo quy định.",
        citations: ["Hướng dẫn vận hành chuẩn SOP dành cho nhân viên.pdf"],
        isOfficialDisclaimer: true,
      };
    }

    return {
      answer: "Hệ thống hỗ trợ tra cứu thông tin vận hành, quy trình SOP và đối chiếu số liệu ngày. Bạn có thể hỏi về công suất phòng, thủ tục check-in/out, hoặc sự cố buồng phòng.",
      citations: ["Hướng dẫn vận hành chuẩn SOP dành cho nhân viên.pdf"],
      isOfficialDisclaimer: true,
    };
  },

  async getChatSuggestions(role) {
    if (role === "MANAGER") {
      return [
        "Doanh thu dự kiến hôm nay là bao nhiêu?",
        "Có bao nhiêu yêu cầu duyệt F&B đang chờ?",
        "Kiểm tra danh sách No-Show candidate hôm nay",
        "Tỷ lệ lấp đầy phòng tuần này",
      ];
    }
    if (role === "HOUSEKEEPING") {
      return [
        "Còn bao nhiêu phòng chưa dọn hôm nay?",
        "Danh sách phòng có sự cố cần sửa chữa",
        "Quy trình xử lý khi phát hiện đồ khách để quên",
      ];
    }
    return [
      "Hôm nay có bao nhiêu lượt khách check-in?",
      "Quy trình xử lý hủy phòng và hoàn cọc",
      "Danh sách phòng đang sẵn sàng (READY)",
      "Kiểm tra giờ nhận phòng tiêu chuẩn",
    ];
  },

  async sendChatFeedback(messageId, isHelpful, feedback) {
    await simulateLatency(100, 200);
    return { success: true };
  },
};

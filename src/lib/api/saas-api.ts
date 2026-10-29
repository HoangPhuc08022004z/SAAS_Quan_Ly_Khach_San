/**
 * SaaS PMS OpenAPI Client & API Service Implementation
 * Conforming directly to openapi.yaml
 * 
 * Provides both:
 * 1. `saasApi` singleton instance with grouped domain methods:
 *    - saasApi.auth.*
 *    - saasApi.plans.*
 *    - saasApi.subscriptions.*
 *    - saasApi.profile.*
 *    - saasApi.chatbot.*
 *    - saasApi.tickets.*
 *    - saasApi.files.*
 *    - saasApi.misc.*
 * 2. Standalone convenient helper functions for direct importing into components/pages.
 */

import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  SubscriptionPlan,
  SubscriptionPlanResponse,
  SubscriptionPlanCreateRequest,
  SubscriptionRequest,
  SubscriptionRequestResult,
  SendRequestResponse,
  ResubmitResponse,
  RetryPaymentResponse,
  PendingSubscription,
  PendingSubscriptionResponse,
  RenewalRequest,
  RenewalPaymentResponse,
  UserProfile,
  UserProfileResponse,
  SupportTicketAdminResponse,
  SupportTicketStatusRequest,
  FileMetadata,
  MessageResponse,
  ISaasOpenApiService,
} from "./types/openapi.interface";
import { DATA_SOURCE } from "@/config/constants";

// Trên browser: dùng URL rỗng → request đi qua Next.js proxy (tránh CORS)
// Trên server (SSR): dùng URL backend trực tiếp vì server-to-server không bị CORS
const DEFAULT_API_BASE_URL =
  typeof window === "undefined"
    ? // Server-side: gọi thẳng ngrok
      (process.env.NEXT_PUBLIC_SAAS_API_BASE_URL ||
       process.env.NEXT_PUBLIC_API_BASE_URL ||
       "http://localhost:8080")
    : // Client-side (browser): dùng URL tương đối → Next.js rewrite proxy
      "";

class SaasApiClient implements ISaasOpenApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, "");
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Lưu hoặc xóa JWT Token dùng cho Authorization Header
   */
  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("saas_jwt_token", token);
      } else {
        localStorage.removeItem("saas_jwt_token");
      }
    }
  }

  /**
   * Lấy token hiện tại từ bộ nhớ hoặc localStorage
   */
  public getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("saas_jwt_token");
      if (stored) {
        this.token = stored;
        return stored;
      }
    }
    return null;
  }

  /**
   * Wrapper gọi HTTP fetch với tự động gắn Authorization Header và xử lý lỗi
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    // Khôi phục dữ liệu khi backend trả JSON hỏng (xem salvageJsonObjects)
    salvage?: (raw: string) => T
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "ngrok-skip-browser-warning": "true",
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Do not set Content-Type if body is FormData (browser will set with boundary)
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const contentType = response.headers.get("content-type") || "";

      // Handle Errors
      if (!response.ok) {
        // Tunnel ngrok tắt → ngrok trả trang HTML 404 (không phải lỗi của API)
        const ngrokError = response.headers.get("ngrok-error-code");
        if (ngrokError) {
          throw new Error(
            `Backend đang offline (ngrok ${ngrokError}). Hãy bật lại backend/ngrok hoặc cập nhật NEXT_PUBLIC_SAAS_API_BASE_URL trong .env.`
          );
        }
        let errorMessage = `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
        if (contentType.includes("application/json")) {
          try {
            const errorJson = await response.json();
            errorMessage =
              errorJson.message || errorJson.error || JSON.stringify(errorJson);
          } catch {
            // fallback
          }
        } else {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = /^\s*<(!doctype|html)/i.test(errorText)
                ? `${errorMessage} (máy chủ trả về trang HTML)`
                : errorText;
            }
          } catch {
            // fallback
          }
        }
        throw new Error(errorMessage);
      }

      // Handle Successful Response
      if (contentType.includes("application/json")) {
        const raw = await response.text();
        if (!raw) return undefined as unknown as T;
        try {
          return JSON.parse(raw) as T;
        } catch (parseErr) {
          if (salvage) {
            const recovered = salvage(raw);
            if (recovered !== undefined) return recovered;
          }
          throw parseErr;
        }
      } else {
        return (await response.text()) as unknown as T;
      }
    } catch (err: unknown) {
      // In dev mode when DATA_SOURCE === "mock" or backend is not reachable, provide fallback or rethrow
      const error = err as Error;
      if (
        DATA_SOURCE === "mock" &&
        (error?.message?.includes("Failed to fetch") ||
          error?.message?.includes("fetch failed") ||
          error?.message?.includes("ECONNREFUSED"))
      ) {
        console.warn(`[SaasApi] Backend unreachable at ${url}, falling back to mock...`);
      }
      throw error;
    }
  }

  // ==========================================================================
  // AUTH
  // ==========================================================================

  /**
   * [PUBLIC] POST /api/v1/saas/user/register
   */
  public async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/v1/saas/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * [PUBLIC] POST /api/v1/saas/user/login
   */
  public async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.request<LoginResponse>("/api/v1/saas/user/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // ==========================================================================
  // SUBSCRIPTION PLANS
  // ==========================================================================

  /**
   * [PUBLIC] GET /api/v1/saas/user/Plan/List
   */
  public async listPlans(): Promise<SubscriptionPlan[]> {
    let salvaged = false;
    const plans = await this.request<SubscriptionPlan[]>(
      "/api/v1/saas/user/Plan/List",
      { method: "GET" },
      (raw) => {
        salvaged = true;
        return salvageJsonObjects(raw, 2, "subscriptions") as unknown as SubscriptionPlan[];
      }
    );
    if (!salvaged) return plans;

    // JSON bị cắt dở do vòng tham chiếu → các Plan phía sau bị mất.
    // Bù bằng Plan/Detail theo id tăng dần cho đến khi gặp 2 id liên tiếp không tồn tại.
    const result = [...plans];
    const seen = new Set(result.map((p) => p.planId));
    let misses = 0;
    for (let id = 1; id <= 100 && misses < 2; id++) {
      if (seen.has(id)) {
        misses = 0;
        continue;
      }
      try {
        const detail = await this.getPlanDetail(id);
        if (detail && typeof detail === "object" && detail.planId) {
          result.push(detail);
          misses = 0;
          continue;
        }
      } catch {
        // coi như không tồn tại
      }
      misses++;
    }
    return result.sort((a, b) => a.planId - b.planId);
  }

  /**
   * [PUBLIC] GET /api/v1/saas/user/Plan/Detail?id={id}
   */
  public async getPlanDetail(id: number): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(
      `/api/v1/saas/user/Plan/Detail?id=${id}`,
      { method: "GET" },
      (raw) => salvageJsonObjects(raw, 1, "subscriptions")?.[0] as unknown as SubscriptionPlan
    );
  }

  /**
   * [ADMIN] POST /api/v1/saas/admin/createPlan
   */
  public async createPlan(
    data: SubscriptionPlanCreateRequest
  ): Promise<SubscriptionPlanResponse> {
    return this.request<SubscriptionPlanResponse>("/api/v1/saas/admin/createPlan", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * [ADMIN] PUT /api/v1/saas/admin/Plan/{planId}
   */
  public async updatePlan(
    planId: number,
    data: SubscriptionPlanCreateRequest
  ): Promise<SubscriptionPlanResponse> {
    return this.request<SubscriptionPlanResponse>(`/api/v1/saas/admin/Plan/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==========================================================================
  // SUBSCRIPTIONS - OWNER
  // ==========================================================================

  /**
   * [OWNER] POST /api/v1/user/sendRequest
   */
  public async sendSubscriptionRequest(
    data: SubscriptionRequest
  ): Promise<SendRequestResponse> {
    return this.request<SendRequestResponse>("/api/v1/user/sendRequest", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * [OWNER] POST /api/v1/user/subscriptions/resubmit
   * Gửi lại yêu cầu Subscription bị từ chối (REJECTED -> PENDING_APPROVAL)
   */
  public async resubmitSubscription(): Promise<ResubmitResponse> {
    return this.request<ResubmitResponse>(
      "/api/v1/user/subscriptions/resubmit",
      {
        method: "POST",
      }
    );
  }

  /**
   * [OWNER] POST /api/v1/user/subscriptions/retry-payment
   * Thanh toán lại cho lần đăng ký ban đầu (PENDING_PAYMENT)
   */
  public async retryInitialPayment(): Promise<RetryPaymentResponse> {
    return this.request<RetryPaymentResponse>(
      "/api/v1/user/subscriptions/retry-payment",
      {
        method: "POST",
      }
    );
  }

  /**
   * [OWNER] POST /api/v1/user/subscriptions/early-renewal
   */
  public async earlyRenewal(
    data: RenewalRequest
  ): Promise<RenewalPaymentResponse> {
    return this.request<RenewalPaymentResponse>(
      "/api/v1/user/subscriptions/early-renewal",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * [OWNER] POST /api/v1/user/subscriptions/late-renewal
   */
  public async lateRenewal(
    data: RenewalRequest
  ): Promise<RenewalPaymentResponse> {
    return this.request<RenewalPaymentResponse>(
      "/api/v1/user/subscriptions/late-renewal",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // ==========================================================================
  // SUBSCRIPTIONS - ADMIN
  // ==========================================================================

  /**
   * [ADMIN] GET /api/v1/user/subscriptions/pending
   */
  public async listPendingSubscriptions(): Promise<PendingSubscription[]> {
    return this.request<PendingSubscription[]>("/api/v1/user/subscriptions/pending", {
      method: "GET",
    });
  }

  /**
   * [ADMIN] POST /api/admin/subscriptions/{subscriptionId}/approve
   */
  public async approveSubscription(
    subscriptionId: number
  ): Promise<MessageResponse> {
    return this.request<MessageResponse>(
      `/api/admin/subscriptions/${subscriptionId}/approve`,
      {
        method: "POST",
      }
    );
  }

  /**
   * [ADMIN] POST /api/admin/subscriptions/{subscriptionId}/reject
   */
  public async rejectSubscription(
    subscriptionId: number
  ): Promise<MessageResponse> {
    return this.request<MessageResponse>(
      `/api/admin/subscriptions/${subscriptionId}/reject`,
      {
        method: "POST",
      }
    );
  }

  // ==========================================================================
  // PROFILE
  // ==========================================================================

  /**
   * [OWNER] GET /api/v1/user/profile
   */
  public async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/api/v1/user/profile", {
      method: "GET",
    });
  }

  // ==========================================================================
  // CHATBOT RAG
  // ==========================================================================

  /**
   * [OWNER] GET /api/v1/chat/saas?question={question}
   */
  public async chatSaas(question: string): Promise<string> {
    // Không dùng request(): câu trả lời là văn bản tự do nên không được phép phụ thuộc vào Content-Type
    // (backend có thể gắn nhãn JSON cho chuỗi thuần). Đọc text rồi tự suy ra nội dung câu trả lời.
    const headers: Record<string, string> = {
      Accept: "text/plain, application/json, */*",
      "ngrok-skip-browser-warning": "true",
    };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${this.baseUrl}/api/v1/chat/saas?question=${encodeURIComponent(question)}`,
      { method: "GET", headers }
    );
    const raw = await response.text();

    if (!response.ok) {
      let message = raw;
      try {
        const parsed = JSON.parse(raw);
        message = parsed?.message || parsed?.error || raw;
      } catch {
        // thân phản hồi không phải JSON
      }
      throw new Error(`HTTP ${response.status}: ${message || response.statusText}`);
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "string") return parsed;
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        const text = obj.answer ?? obj.message ?? obj.content ?? obj.response;
        if (typeof text === "string") return text;
      }
    } catch {
      // chuỗi thuần → dùng nguyên văn
    }
    return raw;
  }

  // ==========================================================================
  // SUPPORT TICKETS - ADMIN
  // ==========================================================================

  /**
   * [ADMIN] GET /api/v1/saas/admin/support-tickets
   */
  public async listSupportTickets(): Promise<SupportTicketAdminResponse[]> {
    return this.request<SupportTicketAdminResponse[]>(
      "/api/v1/saas/admin/support-tickets",
      {
        method: "GET",
      }
    );
  }

  /**
   * [ADMIN] GET /api/v1/saas/admin/support-tickets/{ticketId}
   */
  public async getSupportTicket(
    ticketId: number
  ): Promise<SupportTicketAdminResponse> {
    return this.request<SupportTicketAdminResponse>(
      `/api/v1/saas/admin/support-tickets/${ticketId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * [ADMIN] PATCH /api/v1/saas/admin/support-tickets/{ticketId}/status
   */
  public async updateSupportTicketStatus(
    ticketId: number,
    data: SupportTicketStatusRequest
  ): Promise<SupportTicketAdminResponse> {
    return this.request<SupportTicketAdminResponse>(
      `/api/v1/saas/admin/support-tickets/${ticketId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  // ==========================================================================
  // FILES - ADMIN
  // ==========================================================================

  /**
   * [ADMIN] POST /api/files/pdf
   */
  public async uploadPdf(
    file: File | Blob,
    fileName?: string
  ): Promise<FileMetadata> {
    const formData = new FormData();
    if (fileName && !(file instanceof File)) {
      formData.append("file", file, fileName);
    } else {
      formData.append("file", file);
    }

    return this.request<FileMetadata>("/api/files/pdf", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * [ADMIN] DELETE /api/files/pdf/{fileId}
   */
  public async deletePdf(fileId: number): Promise<void> {
    return this.request<void>(`/api/files/pdf/${fileId}`, {
      method: "DELETE",
    });
  }

  /**
   * [ADMIN] GET /api/files/pdf/saas/content
   */
  public async readAllSaasPdfContents(): Promise<string> {
    return this.request<string>("/api/files/pdf/saas/content", {
      method: "GET",
    });
  }

  // ==========================================================================
  // MISC
  // ==========================================================================

  /**
   * [AUTH] GET /api/test/hello
   */
  public async hello(): Promise<string> {
    return this.request<string>("/api/test/hello", {
      method: "GET",
    });
  }

  // ==========================================================================
  // DOMAIN NAMESPACED ACCESSORS
  // ==========================================================================

  public readonly auth = {
    register: (data: RegisterRequest) => this.register(data),
    login: (data: LoginRequest) => this.login(data),
  };

  public readonly plans = {
    list: () => this.listPlans(),
    getDetail: (id: number) => this.getPlanDetail(id),
    create: (data: SubscriptionPlanCreateRequest) => this.createPlan(data),
    update: (planId: number, data: SubscriptionPlanCreateRequest) =>
      this.updatePlan(planId, data),
  };

  public readonly subscriptions = {
    sendRequest: (data: SubscriptionRequest) => this.sendSubscriptionRequest(data),
    resubmit: () => this.resubmitSubscription(),
    retryPayment: () => this.retryInitialPayment(),
    listPending: () => this.listPendingSubscriptions(),
    earlyRenewal: (data: RenewalRequest) => this.earlyRenewal(data),
    lateRenewal: (data: RenewalRequest) => this.lateRenewal(data),
    approve: (subscriptionId: number) => this.approveSubscription(subscriptionId),
    reject: (subscriptionId: number) => this.rejectSubscription(subscriptionId),
  };

  public readonly profile = {
    get: () => this.getProfile(),
  };

  public readonly chatbot = {
    ask: (question: string) => this.chatSaas(question),
  };

  public readonly tickets = {
    list: () => this.listSupportTickets(),
    get: (ticketId: number) => this.getSupportTicket(ticketId),
    updateStatus: (ticketId: number, status: "RESOLVED" | "CLOSED") =>
      this.updateSupportTicketStatus(ticketId, { status }),
  };

  public readonly files = {
    uploadPdf: (file: File | Blob, fileName?: string) =>
      this.uploadPdf(file, fileName),
    deletePdf: (fileId: number) => this.deletePdf(fileId),
    readAllSaasPdfContents: () => this.readAllSaasPdfContents(),
  };

  public readonly misc = {
    hello: () => this.hello(),
  };
}

// Export singleton instance
export const saasApi = new SaasApiClient();

// Standalone exported helper functions for direct import:
export const registerUser = (data: RegisterRequest) => saasApi.auth.register(data);
export const loginUser = (data: LoginRequest) => saasApi.auth.login(data);
export const fetchPlans = () => saasApi.plans.list();
export const fetchPlanDetail = (id: number) => saasApi.plans.getDetail(id);
export const createSubscriptionPlan = (data: SubscriptionPlanCreateRequest) =>
  saasApi.plans.create(data);
export const updateSubscriptionPlan = (
  planId: number,
  data: SubscriptionPlanCreateRequest
) => saasApi.plans.update(planId, data);
export const sendSubscriptionRequest = (data: SubscriptionRequest) =>
  saasApi.subscriptions.sendRequest(data);
export const resubmitSubscription = () => saasApi.subscriptions.resubmit();
export const retryInitialPayment = () => saasApi.subscriptions.retryPayment();
export const fetchPendingSubscriptions = () => saasApi.subscriptions.listPending();
export const earlyRenewalSubscription = (data: RenewalRequest) =>
  saasApi.subscriptions.earlyRenewal(data);
export const lateRenewalSubscription = (data: RenewalRequest) =>
  saasApi.subscriptions.lateRenewal(data);
export const approveSubscription = (subscriptionId: number) =>
  saasApi.subscriptions.approve(subscriptionId);
export const rejectSubscription = (subscriptionId: number) =>
  saasApi.subscriptions.reject(subscriptionId);
export const fetchUserProfile = () => saasApi.profile.get();
export const askChatbot = (question: string) => saasApi.chatbot.ask(question);
export const fetchSupportTickets = () => saasApi.tickets.list();
export const fetchSupportTicketDetail = (ticketId: number) =>
  saasApi.tickets.get(ticketId);
export const updateTicketStatus = (
  ticketId: number,
  status: "RESOLVED" | "CLOSED"
) => saasApi.tickets.updateStatus(ticketId, status);
export const uploadKnowledgePdf = (file: File | Blob, fileName?: string) =>
  saasApi.files.uploadPdf(file, fileName);
export const deleteKnowledgePdf = (fileId: number) =>
  saasApi.files.deletePdf(fileId);
export const readKnowledgePdfContents = () =>
  saasApi.files.readAllSaasPdfContents();

// ============================================================================
// DATA MAPPERS (OpenAPI <-> Internal Models)
// ============================================================================

export function toUiPlan(openApiPlan: SubscriptionPlan) {
  return {
    id: `plan_${openApiPlan.planId}`,
    name: openApiPlan.name,
    description: openApiPlan.description || "",
    price: openApiPlan.price,
    duration: openApiPlan.duration,
    duration_unit: openApiPlan.durationUnit,
    max_users: openApiPlan.maxUsers,
    max_properties: openApiPlan.maxProperties,
    max_rooms: openApiPlan.maxRooms,
    max_storage: openApiPlan.maxStorage,
    status: openApiPlan.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function toOpenApiPlanCreateRequest(
  plan: Partial<{
    name: string;
    description?: string;
    price: number;
    duration: number;
    duration_unit: "DAY" | "MONTH" | "YEAR";
    durationUnit: "DAY" | "MONTH" | "YEAR";
    max_users: number;
    maxUsers: number;
    max_properties: number;
    maxProperties: number;
    max_rooms: number;
    maxRooms: number;
    max_storage: number;
    maxStorage: number;
  }>
): SubscriptionPlanCreateRequest {
  return {
    name: plan.name || "",
    description: plan.description || null,
    price: Number(plan.price || 0),
    duration: Number(plan.duration || 1),
    durationUnit: plan.durationUnit || plan.duration_unit || "MONTH",
    maxUsers: Number(plan.maxUsers ?? plan.max_users ?? 5),
    maxProperties: Number(plan.maxProperties ?? plan.max_properties ?? 1),
    maxRooms: Number(plan.maxRooms ?? plan.max_rooms ?? 20),
    maxStorage: Number(plan.maxStorage ?? plan.max_storage ?? 2147483648),
  };
}

/**
 * Backend trả thẳng Entity nên Plan <-> Subscription tham chiếu vòng tròn (Plan.subscriptions[].plan.subscriptions...).
 * Jackson lặp đến khi StackOverflow nên JSON bị cắt dở và dính thêm đoạn lỗi → JSON.parse thất bại.
 * Hàm này giữ lại các field của từng Plan trước khóa `cycleKey` rồi bỏ phần lồng nhau.
 * (Cách sửa đúng là backend dùng DTO hoặc @JsonIgnore/@JsonManagedReference.)
 *
 * @param depthOfItem độ sâu của object cần giữ: 2 = phần tử của mảng gốc, 1 = object gốc
 */
export function salvageJsonObjects(
  raw: string,
  depthOfItem: number,
  cycleKey: string
): Record<string, unknown>[] | undefined {
  const items: Record<string, unknown>[] = [];
  let depth = 0;
  let start = -1;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < raw.length && raw[j] !== '"') j += raw[j] === "\\" ? 2 : 1;
      const isKey = raw.slice(j + 1).trimStart().startsWith(":");
      if (isKey && depth === depthOfItem && start >= 0 && raw.slice(i + 1, j) === cycleKey) {
        const body = raw.slice(start, i).trimEnd().replace(/,$/, "");
        try {
          items.push(JSON.parse(`${body}}`));
        } catch {
          // bỏ qua phần tử không khôi phục được
        }
        start = -1;
      }
      i = j + 1;
      continue;
    }
    if (ch === "{" || ch === "[") {
      depth++;
      if (ch === "{" && depth === depthOfItem) start = i;
    } else if (ch === "}" || ch === "]") {
      depth--;
    }
    i++;
  }
  return items.length ? items : undefined;
}

/**
 * Backend không đưa role vào JWT và không có endpoint "tôi là ai".
 * Suy ra role bằng cách thử endpoint theo quyền: /user/profile (OWNER) rồi /pending (ADMIN).
 */
export async function resolveAccountRole(): Promise<
  { role: "OWNER"; profile: UserProfile } | { role: "ADMIN" }
> {
  try {
    return { role: "OWNER", profile: await saasApi.profile.get() };
  } catch {
    // không phải Owner → thử Admin
  }
  try {
    await saasApi.subscriptions.listPending();
    return { role: "ADMIN" };
  } catch {
    throw new Error("Không xác định được quyền của tài khoản. Vui lòng thử lại.");
  }
}

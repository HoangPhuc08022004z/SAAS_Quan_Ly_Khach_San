import {
  Account,
  Plan,
  Subscription,
  SubscriptionPayment,
  Tenant,
  Property,
  PolicyFormula,
  PropertyPolicy,
  RoomType,
  Room,
  RoomRate,
  ServiceCatalog,
  PropertyService,
  FnbItem,
  Role,
  Permission,
  User,
  PaymentGateway,
  PaymentGatewayConfig,
  Guest,
  Reservation,
  Folio,
  Payment,
  Refund,
  DailyStatistics,
  SupportTicket,
  FileMetadata,
  JobLog,
  ExtFnbRequest,
  ExtHkIssue,
  ExtNotification,
  PaginatedResult,
} from "./types";

export interface IApiService {
  // Scenario 1: SaaS Platform (A1 - A38)
  registerAccount(data: { email: string; password: string; full_name: string }): Promise<Account>;
  loginAccount(data: { email: string; password: string }): Promise<{ token: string; account: Account; tenant?: Tenant; subscription?: Subscription }>;
  logoutAccount(): Promise<{ success: boolean }>;
  refreshSession(): Promise<{ token: string; account: Account; tenant?: Tenant; subscription?: Subscription }>;
  getCurrentAccount(): Promise<{ account: Account; tenant?: Tenant; subscription?: Subscription }>;
  listPublicPlans(): Promise<Plan[]>;
  adminListPlans(): Promise<Plan[]>;
  adminCreatePlan(data: Partial<Plan>): Promise<Plan>;
  adminGetPlan(planId: string): Promise<Plan>;
  adminUpdatePlan(planId: string, data: Partial<Plan>): Promise<Plan>;
  adminSetPlanStatus(planId: string, status: "ACTIVE" | "INACTIVE"): Promise<Plan>;
  createSubscriptionRequest(data: { plan_id: string; tenant_name: string; tenant_description?: string }): Promise<Subscription>;
  getMySubscription(): Promise<Subscription & { plan: Plan; tenant: Tenant }>;
  getMyUsage(): Promise<{
    users: { current: number; max: number };
    properties: { current: number; max: number };
    rooms: { current: number; max: number };
    storage: { current: number; max: number };
  }>;
  adminListSubscriptions(params?: { status?: string }): Promise<Array<Subscription & { account: Account; plan: Plan; tenant: Tenant }>>;
  adminGetSubscription(id: string): Promise<Subscription & { account: Account; plan: Plan; tenant: Tenant; payments: SubscriptionPayment[] }>;
  adminApproveSubscription(id: string): Promise<Subscription>;
  adminRejectSubscription(id: string, reason: string): Promise<Subscription>;
  renewMySubscription(): Promise<Subscription>;
  listMyReminders(): Promise<Array<{ id: string; subscription_id: string; reminder_type: string; due_date: string; status: string }>>;
  createSubscriptionPayment(id: string, data: { payment_method: string; gateway: string }): Promise<{ payment: SubscriptionPayment; payUrl: string }>;
  simulatePaymentWebhook(gateway: string, payload: { transaction_id: string; status: "SUCCESS" | "FAILED" }): Promise<{ success: boolean; subscription: Subscription }>;
  listMySubscriptionPayments(): Promise<SubscriptionPayment[]>;
  adminListSubscriptionPayments(params?: { status?: string; from?: string; to?: string }): Promise<SubscriptionPayment[]>;
  getSubscriptionPayment(id: string): Promise<SubscriptionPayment>;
  adminCreateTenant(data: { name: string; subscription_id: string }): Promise<Tenant>;
  getMyTenant(): Promise<Tenant>;
  updateMyTenant(data: Partial<Tenant>): Promise<Tenant>;
  adminListTenants(params?: { status?: string; search?: string }): Promise<Array<Tenant & { subscription?: Subscription; plan?: Plan; propertiesCount: number }>>;
  adminGetTenant(id: string): Promise<Tenant & { subscription?: Subscription; plan?: Plan; properties: Property[]; usage: any }>;
  adminSetTenantStatus(id: string, status: "ACTIVE" | "SUSPENDED", reason?: string): Promise<Tenant>;
  adminGetOverview(): Promise<{
    activeTenants: number;
    suspendedTenants: number;
    pendingApprovals: number;
    totalRevenue: number;
    expiringSoonCount: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  }>;
  runExpiryCheckJob(): Promise<JobLog>;
  runRenewalReminderJob(): Promise<JobLog>;
  adminListJobLogs(): Promise<JobLog[]>;
  listMyTickets(): Promise<SupportTicket[]>;
  createTicket(data: { title: string; message: string; priority?: "LOW" | "NORMAL" | "HIGH" }): Promise<SupportTicket>;
  adminListTickets(params?: { status?: string }): Promise<SupportTicket[]>;
  adminGetTicket(id: string): Promise<SupportTicket & { replies: Array<{ id: string; sender_type: string; message: string; created_at: string }> }>;
  adminUpdateTicket(id: string, status: string): Promise<SupportTicket>;
  adminReplyTicket(id: string, message: string): Promise<{ success: boolean }>;
  askSupportBot(message: string): Promise<{ answer: string; canEscalateToTicket?: boolean }>;
  adminListKbFiles(): Promise<FileMetadata[]>;
  adminUploadKbFile(file: { name: string; size: number; type: string }): Promise<FileMetadata>;
  adminDeleteKbFile(fileId: string): Promise<{ success: boolean }>;
  adminReindexKbFile(fileId: string): Promise<FileMetadata>;

  // Scenario 2: Property Configuration (B1 - B32)
  listProperties(): Promise<Property[]>;
  createProperty(data: Partial<Property>): Promise<Property>;
  getProperty(propertyId: string): Promise<Property>;
  updateProperty(propertyId: string, data: Partial<Property>): Promise<Property>;
  deleteProperty(propertyId: string): Promise<{ success: boolean }>;
  uploadPropertyImage(propertyId: string, imageUrl: string): Promise<Property>;
  listPolicyFormulas(type?: string): Promise<PolicyFormula[]>;
  listPropertyPolicies(propertyId: string): Promise<Array<PropertyPolicy & { formula: PolicyFormula }>>;
  applyPolicy(propertyId: string, policyFormulaId: string, parameterValues: Record<string, any>): Promise<PropertyPolicy>;
  removePolicy(propertyId: string, policyFormulaId: string): Promise<{ success: boolean }>;
  simulatePolicy(propertyId: string, policyFormulaId: string, params: { checkInDate: string; cancelDate: string; depositAmount: number }): Promise<{ refundAmount: number; penaltyAmount: number; policyDescription: string }>;
  getCheckTimes(propertyId: string): Promise<{ check_in_time: string; check_out_time: string }>;
  updateCheckTimes(propertyId: string, times: { check_in_time: string; check_out_time: string }): Promise<{ check_in_time: string; check_out_time: string }>;
  listPropertyDocs(propertyId: string): Promise<FileMetadata[]>;
  uploadPropertyDoc(propertyId: string, file: { name: string; size: number; type: string }): Promise<FileMetadata>;
  deletePropertyDoc(propertyId: string, fileId: string): Promise<{ success: boolean }>;
  listRoomTypes(propertyId: string): Promise<RoomType[]>;
  createRoomType(propertyId: string, data: Partial<RoomType>): Promise<RoomType>;
  getRoomType(roomTypeId: string): Promise<RoomType>;
  updateRoomType(roomTypeId: string, data: Partial<RoomType>): Promise<RoomType>;
  deleteRoomType(roomTypeId: string): Promise<{ success: boolean }>;
  setRoomTypeStatus(roomTypeId: string, status: "ACTIVE" | "INACTIVE"): Promise<RoomType>;
  listRooms(roomTypeId: string): Promise<Room[]>;
  createRoom(roomTypeId: string, data: Partial<Room>): Promise<Room>;
  bulkCreateRooms(roomTypeId: string, data: { floor: number; startRoom: number; endRoom: number; prefix?: string }): Promise<Room[]>;
  getRoom(roomId: string): Promise<Room>;
  updateRoom(roomId: string, data: Partial<Room>): Promise<Room>;
  deleteRoom(roomId: string): Promise<{ success: boolean }>;
  getRoomRate(roomTypeId: string): Promise<RoomRate | null>;
  setRoomRate(roomTypeId: string, data: { name: string; price: number; description?: string }): Promise<RoomRate>;
  listServiceCatalog(): Promise<ServiceCatalog[]>;
  listPropertyServices(propertyId: string): Promise<Array<PropertyService & { catalogItem?: ServiceCatalog }>>;
  createPropertyService(propertyId: string, data: { service_catalog_id: string; custom_name?: string; price: number; unit?: string; description?: string }): Promise<PropertyService>;
  updatePropertyService(propertyServiceId: string, data: Partial<PropertyService>): Promise<PropertyService>;
  deletePropertyService(propertyServiceId: string): Promise<{ success: boolean }>;
  listFnbItems(propertyId: string): Promise<FnbItem[]>;
  createFnbItem(propertyId: string, data: Omit<FnbItem, "id" | "property_id" | "selling_price">): Promise<FnbItem>;
  updateFnbItem(fnbMenuId: string, data: Partial<FnbItem>): Promise<FnbItem>;
  deleteFnbItem(fnbMenuId: string): Promise<{ success: boolean }>;
  listRoles(): Promise<Role[]>;
  listPermissions(): Promise<Permission[]>;
  listStaff(propertyId: string): Promise<Array<User & { role: Role }>>;
  createStaff(propertyId: string, data: Partial<User>): Promise<User>;
  updateStaff(userId: string, data: Partial<User>): Promise<User>;
  setStaffRole(userId: string, roleId: string): Promise<User>;
  setStaffStatus(userId: string, status: "ACTIVE" | "INACTIVE"): Promise<User>;
  resetStaffPassword(userId: string): Promise<{ success: boolean; tempPassword?: string }>;
  listGateways(): Promise<PaymentGateway[]>;
  getGatewayConfig(propertyId: string): Promise<PaymentGatewayConfig | null>;
  saveGatewayConfig(propertyId: string, data: { payment_gateway_id: string; partner_code: string; access_key: string; secret_key: string }): Promise<PaymentGatewayConfig>;
  deleteGatewayConfig(propertyId: string): Promise<{ success: boolean }>;
  testGatewayConfig(propertyId: string): Promise<{ success: boolean; latencyMs: number }>;
  getSetupStatus(propertyId: string): Promise<{
    completedSteps: string[];
    isFullyConfigured: boolean;
    missingItems: string[];
  }>;

  // Scenario 3: Hotel Operations & Chatbot (C1 - C52)
  pmsLogin(data: { email: string; password: string }): Promise<{ token: string; user: User; role: Role; permissions: string[]; property: Property }>;
  pmsLogout(): Promise<{ success: boolean }>;
  pmsMe(): Promise<{ user: User; role: Role; permissions: string[]; property: Property }>;
  searchReservations(params?: { q?: string; status?: string; from?: string; to?: string }): Promise<Array<Reservation & { guest: Guest; rooms: Room[] }>>;
  getReservation(id: string): Promise<Reservation & { guest: Guest; rooms: Room[]; folios: Folio[]; payments: Payment[]; refunds: Refund[] }>;
  getAvailability(params: { from: string; to: string; roomTypeId?: string }): Promise<Array<{ roomType: RoomType; availableRoomsCount: number; rate: number; rooms: Room[] }>>;
  getRoomBoard(date: string): Promise<Array<Room & { currentReservation?: Reservation; roomType: RoomType }>>;
  createReservation(data: {
    guest: Partial<Guest>;
    check_in_date: string;
    check_out_date: string;
    room_ids: string[];
  }): Promise<Reservation>;
  createDepositPayment(id: string, method?: string): Promise<{ payment: Payment; payUrl: string }>;
  getCheckinCheck(id: string): Promise<{
    canCheckIn: boolean;
    reasons: string[];
    rooms: Array<Room & { isReady: boolean; hasIssue: boolean }>;
  }>;
  saveReservationGuests(id: string, guests: Partial<Guest>[]): Promise<{ success: boolean }>;
  checkIn(id: string): Promise<Reservation>;
  listPmsRooms(status?: string): Promise<Room[]>;
  setRoomStatus(roomId: string, status: Room["status"]): Promise<Room>;
  getHousekeepingSchedule(date?: string): Promise<Array<Room & { cleaningStatus: string; hkIssue?: ExtHkIssue }>>;
  listHkIssues(propertyId?: string): Promise<ExtHkIssue[]>;
  createHkIssue(data: { room_id: string; issue_type: string; description: string }): Promise<ExtHkIssue>;
  resolveHkIssue(id: string, resolution: string): Promise<ExtHkIssue>;
  getCheckoutSummary(id: string): Promise<{
    totalCharges: number;
    totalPaid: number;
    balance: number;
    canCheckOut: boolean;
    requiresRefund: boolean;
    requiresPayment: boolean;
    folios: Folio[];
  }>;
  getFolio(reservationId: string): Promise<Folio[]>;
  addFolioCharge(reservationId: string, charge: { charge_type: Folio["charge_type"]; description: string; quantity: number; unit_price: number }): Promise<Folio>;
  createBalancePayment(reservationId: string, amount: number, method?: string): Promise<{ payment: Payment; payUrl: string }>;
  simulatePmsPaymentWebhook(gateway: string, payload: { payment_id: string; status: "SUCCESS" | "FAILED" }): Promise<{ success: boolean }>;
  checkOut(reservationId: string): Promise<Reservation>;
  listFnbMenu(propertyId?: string): Promise<FnbItem[]>;
  createFnbRequest(data: { fnb_menu_id: string; quantity: number; reason: string }): Promise<ExtFnbRequest>;
  listFnbRequests(status?: string): Promise<Array<ExtFnbRequest & { item: FnbItem; user: User }>>;
  approveFnbRequest(id: string): Promise<ExtFnbRequest>;
  rejectFnbRequest(id: string, reason: string): Promise<ExtFnbRequest>;
  updateFnbActual(id: string, data: { actual_quantity: number; purchase_price: number }): Promise<FnbItem>;
  createFnbOrder(reservationId: string, data: { fnb_menu_id: string; quantity: number }): Promise<{ folio: Folio }>;
  listPmsServices(type?: string): Promise<PropertyService[]>;
  createServiceRequest(reservationId: string, data: { property_service_id: string; scheduled_time: string; notes?: string }): Promise<{ folio?: Folio }>;
  getCancellationQuote(reservationId: string): Promise<{ daysBeforeCheckIn: number; depositAmount: number; refundAmount: number; penaltyAmount: number; policyDescription: string }>;
  cancelReservation(reservationId: string, reason: string): Promise<{ reservation: Reservation; refund?: Refund }>;
  sendNotification(reservationId: string, type: string, message: string): Promise<ExtNotification>;
  listRefunds(status?: string): Promise<Array<Refund & { reservation: Reservation }>>;
  createRefundRequest(reservationId: string, data: { amount: number; reason: string }): Promise<Refund>;
  executeRefund(id: string): Promise<Refund>;
  setRefundStatus(id: string, status: Refund["status"]): Promise<Refund>;
  listNoShowCandidates(): Promise<Array<Reservation & { guest: Guest; rooms: Room[]; hoursOverdue: number }>>;
  confirmNoShow(reservationId: string, data: { keepFirstNight: boolean }): Promise<{ reservation: Reservation; refund?: Refund }>;
  runNoShowDetectJob(): Promise<JobLog>;
  runDailyStatsJob(date?: string): Promise<JobLog>;
  listDailyStats(params?: { from?: string; to?: string }): Promise<DailyStatistics[]>;
  getDailyStats(id: string): Promise<DailyStatistics>;
  adjustDailyStats(id: string, data: { field: string; newValue: number; adjustmentReason: string }): Promise<DailyStatistics>;
  confirmDailyStats(id: string): Promise<DailyStatistics>;
  approveReport(id: string): Promise<{ success: boolean }>;
  getOwnerOverview(): Promise<{
    todayRevenue: number;
    occupancyRate: number;
    properties: Array<{ property: Property; occupancy: number; revenue: number; unconfirmedReports: number }>;
  }>;
  listOwnerReports(status?: string): Promise<DailyStatistics[]>;
  askGuestBot(propertyId: string, message: string): Promise<{ answer: string; citations?: string[]; liveAvailability?: any }>;
  getPublicAvailability(propertyId: string, params: { checkIn: string; checkOut: string }): Promise<any>;
  askStaffBot(message: string, context?: { role: string; propertyId: string }): Promise<{ answer: string; citations?: string[]; isOfficialDisclaimer: true }>;
  getChatSuggestions(role: string): Promise<string[]>;
  sendChatFeedback(messageId: string, isHelpful: boolean, feedback?: string): Promise<{ success: boolean }>;
}

/**
 * OpenAPI 3.0.3 TypeScript Interfaces for SaaS PMS with ChatBot API
 * Synchronized with openapi (1) (2).yaml (version 0.0.1-SNAPSHOT)
 * 
 * Backend: Spring Boot + Spring Security + Spring AI
 * Auth: Bearer JWT (HS256)
 * Server: http://localhost:8080
 */

// ============================================================================
// ENUMS
// ============================================================================

export type DurationUnit = "DAY" | "MONTH" | "YEAR";

export type PlanStatus = "ACTIVE" | "INACTIVE";

/**
 * Trạng thái của Subscription:
 * - PENDING: trạng thái cũ, giữ để tương thích dữ liệu (được xử lý như PENDING_APPROVAL)
 * - PENDING_APPROVAL: chờ SaaS Admin duyệt
 * - PENDING_PAYMENT: đã duyệt, chờ thanh toán ban đầu
 * - ACTIVE: đang hoạt động (Tenant ACTIVE)
 * - EXPIRED: đã hết hạn (Tenant INACTIVE)
 * - REJECTED: bị SaaS Admin từ chối
 */
export type SubscriptionStatus =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "REJECTED";

export type TenantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type TicketStatus = "OPEN" | "RESOLVED" | "CLOSED";

// ============================================================================
// COMMON & ERROR SCHEMAS
// ============================================================================

/**
 * Cấu trúc lỗi chuẩn từ GlobalExceptionHandler (Spring Boot)
 */
export interface ErrorResponse {
  /**
   * Thời điểm xảy ra lỗi (giờ máy chủ, ISO-8601 không kèm múi giờ), e.g. '2026-10-20T09:15:30.123456'
   */
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface MessageResponse {
  message: string;
}

export interface FileErrorResponse {
  message: string;
  error?: string;
}

export interface FileMessageResponse {
  message: string;
}

// ============================================================================
// AUTH SCHEMAS (/api/v1/saas/user/*)
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  /**
   * JWT HS256 token; null khi đăng nhập thất bại
   */
  token: string | null;
}

// ============================================================================
// SUBSCRIPTION PLANS SCHEMAS (/api/v1/saas/user/Plan/* & /api/v1/saas/admin/*)
// ============================================================================

export interface SubscriptionPlan {
  planId: number;
  name: string;
  description: string | null;
  /**
   * Giá của một kỳ (tiền tệ theo stripe.currency, mặc định VND)
   */
  price: number;
  /**
   * Số đơn vị thời hạn
   */
  duration: number;
  durationUnit: DurationUnit;
  maxUsers: number;
  maxProperties: number;
  /**
   * Dung lượng lưu trữ tối đa (bytes)
   */
  maxStorage: number;
  maxRooms: number;
  status: PlanStatus;
}

export type SubscriptionPlanResponse = SubscriptionPlan;

export interface SubscriptionPlanCreateRequest {
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  durationUnit: DurationUnit;
  maxUsers: number;
  maxProperties: number;
  maxStorage: number;
  maxRooms: number;
}

// ============================================================================
// SUBSCRIPTIONS SCHEMAS (/api/v1/user/* & /api/admin/subscriptions/*)
// ============================================================================

export interface SubscriptionRequest {
  planId: number;
  /**
   * Tên Tenant (Doanh nghiệp / Chuỗi khách sạn)
   */
  name: string;
  /**
   * Mô tả Tenant
   */
  description?: string | null;
}

/**
 * Phản hồi sau khi Owner gửi yêu cầu Subscription ban đầu
 */
export interface SendRequestResponse {
  tenantId: number;
  tenantName: string;
  tenantStatus: TenantStatus;
  subscriptionId: number;
  subscriptionStatus: SubscriptionStatus;
  planId: number;
}

export type SubscriptionRequestResult = SendRequestResponse;

/**
 * Phản hồi sau khi Owner gửi lại (resubmit) yêu cầu Subscription bị REJECTED
 */
export interface ResubmitResponse {
  message: string;
  tenantId: number;
  subscriptionId: number;
  subscriptionStatus: SubscriptionStatus;
}

/**
 * Phản hồi khi Owner thanh toán lại cho lần đăng ký ban đầu (PENDING_PAYMENT)
 */
export interface RetryPaymentResponse {
  message: string;
  subscriptionId: number;
  paymentId: number;
  /**
   * URL Stripe Checkout để thanh toán
   */
  checkoutUrl: string;
  /**
   * true nếu tái sử dụng Checkout Session đang còn hiệu lực
   */
  reusedCheckoutSession: boolean;
}

export interface EarlyRenewalRequest {
  /**
   * Plan cho kỳ kế tiếp (phải > 0)
   */
  planId: number;
}

export interface LateRenewalRequest {
  /**
   * Plan dùng để gia hạn
   */
  planId: number;
}

export type RenewalRequest = EarlyRenewalRequest | LateRenewalRequest;

/**
 * Kết quả tạo thanh toán gia hạn (sớm hoặc muộn) qua Stripe
 */
export interface RenewalPaymentResponse {
  paymentId: number;
  /**
   * Mã đơn nội bộ. Tiền tố SUB-EARLY-RENEW- (sớm) hoặc SUB-RENEW- (muộn)
   */
  orderId: string;
  paymentStatus: PaymentStatus;
  /**
   * URL Stripe Checkout để Owner thanh toán
   */
  paymentUrl: string;
  amount: number;
  currency: string;
}

export interface PendingSubscriptionResponse {
  subscriptionId: number;
  email: string;
  plan: string;
  tenantName: string;
  tenantDescription?: string | null;
}

export type PendingSubscription = PendingSubscriptionResponse;

// ============================================================================
// USER PROFILE SCHEMAS (/api/v1/user/profile)
// ============================================================================

export interface UserProfileResponse {
  userName: string;
  email: string;
  tenantName: string | null;
  /**
   * Chỉ có giá trị khi Subscription ACTIVE (YYYY-MM-DD)
   */
  startDate: string | null;
  /**
   * Chỉ có giá trị khi Subscription ACTIVE (YYYY-MM-DD)
   */
  endDate: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  /**
   * true khi Subscription REJECTED (hiển thị nút Gửi lại yêu cầu)
   */
  showResubmitButton: boolean;
  /**
   * true khi Subscription PENDING_PAYMENT (hiển thị nút Thanh toán lại)
   */
  showRetryPaymentButton: boolean;
}

export type UserProfile = UserProfileResponse;

// ============================================================================
// SUPPORT TICKETS SCHEMAS (/api/v1/saas/admin/support-tickets/*)
// ============================================================================

export interface SupportTicketAdminResponse {
  supportTicketId: number;
  content: string;
  status: TicketStatus;
  accountId: number;
  accountName: string;
  accountEmail: string;
}

export interface SupportTicketStatusRequest {
  status: "RESOLVED" | "CLOSED";
}

// ============================================================================
// FILES & KNOWLEDGE BASE SCHEMAS (/api/files/*)
// ============================================================================

export interface FileMetadata {
  fileId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  account?: Record<string, unknown> | null;
}

export type OpenApiFileMetadata = FileMetadata;

// ============================================================================
// COMPREHENSIVE SAAS OPENAPI SERVICE INTERFACE
// ============================================================================

export interface ISaasOpenApiService {
  // --- Auth ---
  /**
   * [PUBLIC] POST /api/v1/saas/user/register
   * Đăng ký tài khoản Owner mới
   */
  register(data: RegisterRequest): Promise<RegisterResponse>;

  /**
   * [PUBLIC] POST /api/v1/saas/user/login
   * Đăng nhập nhận JWT token
   */
  login(data: LoginRequest): Promise<LoginResponse>;

  // --- Plans ---
  /**
   * [PUBLIC] GET /api/v1/saas/user/Plan/List
   * Lấy danh sách toàn bộ gói dịch vụ (cả ACTIVE và INACTIVE)
   */
  listPlans(): Promise<SubscriptionPlan[]>;

  /**
   * [PUBLIC] GET /api/v1/saas/user/Plan/Detail?id={id}
   * Lấy chi tiết một gói dịch vụ
   */
  getPlanDetail(id: number): Promise<SubscriptionPlan>;

  /**
   * [ADMIN] POST /api/v1/saas/admin/createPlan
   * Tạo gói dịch vụ mới
   */
  createPlan(data: SubscriptionPlanCreateRequest): Promise<SubscriptionPlanResponse>;

  /**
   * [ADMIN] PUT /api/v1/saas/admin/Plan/{planId}
   * Cập nhật thông tin gói dịch vụ
   */
  updatePlan(planId: number, data: SubscriptionPlanCreateRequest): Promise<SubscriptionPlanResponse>;

  // --- Subscriptions (Owner) ---
  /**
   * [OWNER] POST /api/v1/user/sendRequest
   * Gửi yêu cầu đăng ký thuê bao mới (tạo Tenant INACTIVE + Subscription PENDING_APPROVAL)
   */
  sendSubscriptionRequest(data: SubscriptionRequest): Promise<SendRequestResponse>;

  /**
   * [OWNER] POST /api/v1/user/subscriptions/resubmit
   * Gửi lại yêu cầu Subscription khi bị SaaS Admin từ chối (REJECTED -> PENDING_APPROVAL)
   */
  resubmitSubscription(): Promise<ResubmitResponse>;

  /**
   * [OWNER] POST /api/v1/user/subscriptions/retry-payment
   * Thanh toán lại cho lần đăng ký ban đầu (khi Subscription ở trạng thái PENDING_PAYMENT)
   */
  retryInitialPayment(): Promise<RetryPaymentResponse>;

  /**
   * [OWNER] POST /api/v1/user/subscriptions/early-renewal
   * Thanh toán gia hạn sớm khi Subscription còn ACTIVE (tạo Stripe Checkout Session cho kỳ kế tiếp)
   */
  earlyRenewal(data: EarlyRenewalRequest): Promise<RenewalPaymentResponse>;

  /**
   * [OWNER] POST /api/v1/user/subscriptions/late-renewal
   * Thanh toán gia hạn muộn khi Subscription đã EXPIRED (tái kích hoạt qua Stripe Checkout)
   */
  lateRenewal(data: LateRenewalRequest): Promise<RenewalPaymentResponse>;

  // --- Subscriptions (Admin) ---
  /**
   * [ADMIN] GET /api/v1/user/subscriptions/pending
   * Lấy danh sách các Subscription đang chờ duyệt (PENDING_APPROVAL / PENDING)
   */
  listPendingSubscriptions(): Promise<PendingSubscriptionResponse[]>;

  /**
   * [ADMIN] POST /api/admin/subscriptions/{subscriptionId}/approve
   * Duyệt Subscription, chuyển sang PENDING_PAYMENT và tạo link Stripe gửi email cho Owner
   */
  approveSubscription(subscriptionId: number): Promise<MessageResponse>;

  /**
   * [ADMIN] POST /api/admin/subscriptions/{subscriptionId}/reject
   * Từ chối yêu cầu Subscription và gửi email thông báo cho Owner
   */
  rejectSubscription(subscriptionId: number): Promise<MessageResponse>;

  // --- Profile ---
  /**
   * [OWNER] GET /api/v1/user/profile
   * Thông tin tài khoản, trạng thái Subscription, và cờ hiển thị showResubmitButton, showRetryPaymentButton
   */
  getProfile(): Promise<UserProfileResponse>;

  // --- ChatBot RAG ---
  /**
   * [OWNER] GET /api/v1/chat/saas?question={question}
   * Hỏi ChatBot RAG sử dụng tài liệu MinIO + Qdrant + GPT-4o-mini
   */
  chatSaas(question: string): Promise<string>;

  // --- Support Tickets (Admin) ---
  /**
   * [ADMIN] GET /api/v1/saas/admin/support-tickets
   * Danh sách ticket hỗ trợ sắp xếp theo ID giảm dần
   */
  listSupportTickets(): Promise<SupportTicketAdminResponse[]>;

  /**
   * [ADMIN] GET /api/v1/saas/admin/support-tickets/{ticketId}
   * Chi tiết ticket hỗ trợ
   */
  getSupportTicket(ticketId: number): Promise<SupportTicketAdminResponse>;

  /**
   * [ADMIN] PATCH /api/v1/saas/admin/support-tickets/{ticketId}/status
   * Cập nhật trạng thái ticket (chỉ RESOLVED hoặc CLOSED)
   */
  updateSupportTicketStatus(
    ticketId: number,
    data: SupportTicketStatusRequest
  ): Promise<SupportTicketAdminResponse>;

  // --- Files / KB (Admin) ---
  /**
   * [ADMIN] POST /api/files/pdf
   * Upload PDF vào kho tri thức SaaS (MinIO)
   */
  uploadPdf(file: File | Blob, fileName?: string): Promise<FileMetadata>;

  /**
   * [ADMIN] DELETE /api/files/pdf/{fileId}
   * Xóa file PDF khỏi kho tri thức
   */
  deletePdf(fileId: number): Promise<void>;

  /**
   * [ADMIN] GET /api/files/pdf/saas/content
   * Đọc gộp toàn bộ nội dung text của các PDF trong cơ sở tri thức
   */
  readAllSaasPdfContents(): Promise<string>;

  // --- Misc ---
  /**
   * [AUTH] GET /api/test/hello
   */
  hello(): Promise<string>;
}

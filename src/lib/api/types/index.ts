export interface Account {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: "DAY" | "MONTH" | "YEAR";
  max_users: number;
  max_properties: number;
  max_rooms: number;
  max_storage: number; // bytes
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  account_id: string;
  plan_id: string;
  tenant_id: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  start_date: string;
  end_date: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  amount: number;
  payment_method: string;
  payment_gateway: string;
  transaction_id: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  max_properties: number;
  max_rooms: number;
  max_users: number;
  max_storage: number;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  image_url: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface PolicyFormula {
  id: string;
  name: string;
  code: string;
  type: "CANCELLATION" | "DEPOSIT" | "NO_SHOW" | "CHECK_TIME";
  formula_expression: string;
  description: string;
  is_active: boolean;
}

export interface PolicyFormulaParameter {
  id: string;
  policy_formula_id: string;
  name: string;
  code: string;
  data_type: "NUMBER" | "PERCENT" | "TIME" | "STRING";
  default_value: string;
  description: string;
}

export interface PropertyPolicy {
  id: string;
  property_id: string;
  policy_formula_id: string;
  parameter_values: Record<string, any>;
  is_active: boolean;
}

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  description: string;
  capacity: number;
  bed_type: string;
  num_beds: number;
  number_of_rooms: number;
  image_url: string;
  amenities: string[];
  status: "ACTIVE" | "INACTIVE";
}

export interface Room {
  id: string;
  room_type_id: string;
  property_id: string;
  room_number: string;
  floor: number;
  status: "READY" | "OCCUPIED" | "VACANT_DIRTY" | "CLEANING" | "MAINTENANCE";
  is_available: boolean;
  description: string;
}

export interface RoomRate {
  id: string;
  room_type_id: string;
  name: string;
  price: number;
  description: string;
  is_active: boolean;
}

export interface ServiceCatalog {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  default_unit: string;
}

export interface PropertyService {
  id: string;
  property_id: string;
  service_catalog_id: string;
  custom_name: string;
  price: number;
  unit: string;
  is_active: boolean;
  description: string;
}

export interface FnbItem {
  id: string;
  property_id: string;
  name: string;
  max_quantity: number;
  actual_quantity: number;
  purchase_price: number;
  profit_percent: number;
  selling_price: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface Role {
  id: string;
  name: string;
  code: "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPING";
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
}

export interface User {
  id: string;
  tenant_id: string;
  property_id: string;
  role_id: string;
  email: string;
  password?: string;
  full_name: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  property_id: string;
  payment_gateway_id: string;
  partner_code: string;
  access_key: string;
  secret_key: string;
  is_active: boolean;
}

export interface Guest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_card_number: string;
  id_card_type: "CCCD" | "PASSPORT" | "OTHER";
  nationality: string;
  date_of_birth: string;
  address: string;
}

export interface Reservation {
  id: string;
  property_id: string;
  code: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ReservationRoom {
  id: string;
  reservation_id: string;
  room_id: string;
  room_type_id: string;
  price_per_night: number;
  nights: number;
  amount: number;
}

export interface ReservationGuest {
  id: string;
  reservation_id: string;
  guest_id: string;
  is_primary: boolean;
}

export interface Folio {
  id: string;
  reservation_id: string;
  property_id: string;
  charge_type: "ROOM" | "FNB" | "SERVICE" | "DAMAGE" | "OTHER";
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reservation_id: string;
  property_id: string;
  payment_type: "DEPOSIT" | "BALANCE" | "REFUND";
  amount: number;
  payment_method: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  reservation_id: string;
  amount: number;
  reason: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyStatistics {
  id: string;
  property_id: string;
  stat_date: string;
  total_guests: number;
  occupied_rooms: number;
  available_rooms: number;
  successful_reservations: number;
  noshow_count: number;
  cancelled_count: number;
  refund_count: number;
  deposit_collected: number;
  expected_room_revenue: number;
  fnb_revenue: number;
  fnb_cost: number;
  status: "PENDING" | "CONFIRMED" | "ADJUSTED";
  confirmed_at?: string;
  adjustment_reason?: string;
}

export interface SupportTicket {
  id: string;
  account_id: string;
  tenant_id?: string;
  title: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH";
  created_at: string;
  updated_at: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_url: string;
  index_status: "PENDING" | "INDEXED" | "FAILED";
  created_at: string;
}

export interface JobLog {
  id: string;
  job_name: string;
  status: "SUCCESS" | "FAILED";
  details: string;
  processed_count: number;
  created_at: string;
}

// Extension Tables (_ext_*)
export interface ExtFnbRequest {
  id: string;
  property_id: string;
  user_id: string;
  fnb_menu_id: string;
  quantity: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reject_reason?: string;
  created_at: string;
}

export interface ExtFnbOrder {
  id: string;
  reservation_id: string;
  fnb_menu_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: "COMPLETED";
  created_at: string;
}

export interface ExtServiceRequest {
  id: string;
  reservation_id: string;
  property_service_id: string;
  scheduled_time: string;
  notes: string;
  price: number;
  status: "PENDING" | "COMPLETED";
  created_at: string;
}

export interface ExtHkIssue {
  id: string;
  property_id: string;
  room_id: string;
  user_id: string;
  issue_type: string;
  description: string;
  resolution?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  created_at: string;
}

export interface ExtNotification {
  id: string;
  reservation_id: string;
  guest_name: string;
  guest_phone: string;
  type: "CANCELLATION" | "NO_SHOW" | "BOOKING_CONFIRMATION";
  content: string;
  status: "SENT";
  sent_at: string;
}

export interface ExtAuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  user_email: string;
  details: string;
  created_at: string;
}

export interface ExtTicketReply {
  id: string;
  ticket_id: string;
  sender_type: "ADMIN" | "USER";
  message: string;
  created_at: string;
}

export interface ExtFileLink {
  id: string;
  file_id: string;
  entity_type: "TENANT" | "PROPERTY" | "KB";
  entity_id: string;
  created_at: string;
}

export interface ExtRenewalReminder {
  id: string;
  subscription_id: string;
  reminder_type: string;
  due_date: string;
  status: "PENDING" | "SENT";
  sent_at?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  traceId: string;
}

// Re-export OpenAPI Types
export type {
  DurationUnit,
  PlanStatus,
  SubscriptionStatus as OpenApiSubscriptionStatus,
  TenantStatus as OpenApiTenantStatus,
  PaymentStatus as OpenApiPaymentStatus,
  TicketStatus,
  ErrorResponse,
  MessageResponse,
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
  EarlyRenewalRequest,
  LateRenewalRequest,
  RenewalRequest,
  RenewalPaymentResponse,
  UserProfile,
  UserProfileResponse,
  SupportTicketAdminResponse,
  SupportTicketStatusRequest,
  OpenApiFileMetadata,
  FileMessageResponse,
  FileErrorResponse,
  ISaasOpenApiService,
} from "./openapi.interface";

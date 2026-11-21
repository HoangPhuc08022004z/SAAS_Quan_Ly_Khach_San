/**
 * Client cho các API vận hành PMS (check-in, buồng phòng, no-show, hủy/hoàn tiền, F&B của khách)
 * và cấu hình cổng thanh toán của Owner — theo SaaS_PMS_API_openapi.yaml (commit b2fb474).
 * Token nhân viên PMS (pmsBearer) hoặc Owner (saasBearer) được gắn tự động bởi saasApi.request.
 */
import { saasApi } from "./saas-api";
import type { GuestContact } from "./pms-public-api";

const request = <T>(endpoint: string, options?: RequestInit) => saasApi.request<T>(endpoint, options);
const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

const query = (params: Record<string, string | number | undefined | null>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};
const enc = encodeURIComponent;

// ============================================================================
// CHECK-IN  (token nhân viên; quyền: RESERVATION_VIEW / CHECKIN_EXECUTE / GUEST_VIEW / ROOM_VIEW)
// ============================================================================

export interface GuestDetailDto {
  guestId?: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  identityNumber?: string | null;
  identityType?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
}

export interface CheckInReservation {
  reservationId: number;
  reservationCode: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guest: GuestDetailDto;
  rooms: { roomId: number; roomNumber: string; floor: number; status: string }[];
}

export interface CheckInCompleted {
  reservationId: number;
  reservationCode: string;
  reservationStatus: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: { roomId: number; roomNumber: string; floor: number; roomStatus: string }[];
}

export interface CheckInGuestProfiles {
  reservationId: number;
  reservationCode: string;
  guestCount: number;
  guests: GuestDetailDto[];
}

export interface RoomReadiness {
  roomId: number;
  roomNumber: string;
  floor: number;
  roomStatus: string;
  isReady: boolean;
  isAvailable: boolean;
}

export const checkInApi = {
  /** GET /api/properties/{propertyId}/check-in/reservations/{reservationCode}?email=&phone= */
  search: (propertyId: number | string, reservationCode: string, contact: GuestContact = {}) =>
    request<CheckInReservation>(
      `/api/properties/${propertyId}/check-in/reservations/${enc(reservationCode)}${query({ ...contact })}`
    ),

  /** POST /api/properties/{propertyId}/check-in/reservations/{reservationCode}/complete */
  complete: (propertyId: number | string, reservationCode: string) =>
    request<CheckInCompleted>(
      `/api/properties/${propertyId}/check-in/reservations/${enc(reservationCode)}/complete`,
      send("POST")
    ),

  /** GET /api/properties/{propertyId}/check-in/reservations/{reservationCode}/guests */
  guests: (propertyId: number | string, reservationCode: string) =>
    request<CheckInGuestProfiles>(
      `/api/properties/${propertyId}/check-in/reservations/${enc(reservationCode)}/guests`
    ),

  /** GET /api/properties/{propertyId}/check-in/rooms/{roomId}/readiness */
  readiness: (propertyId: number | string, roomId: number | string) =>
    request<RoomReadiness>(`/api/properties/${propertyId}/check-in/rooms/${roomId}/readiness`),
};

// ============================================================================
// BUỒNG PHÒNG  (token nhân viên; role HOUSEKEEPER)
// ============================================================================

export type HousekeepingRoomStatus = "DIRTY" | "CLEANING" | "READY";

export interface HousekeepingIssue {
  issueId: number;
  roomId: number;
  roomNumber: string;
  issue: string;
  resolution?: string | null;
  createdBy?: number;
  createdByName?: string;
  createdAt: string;
}

export interface HousekeepingWorkItem {
  reservationId: number;
  reservationCode: string;
  roomId: number;
  roomNumber: string;
  floor: number;
  taskType: string;
  checkInDate: string;
  checkOutDate: string;
  reservationStatus: string;
}

export interface HousekeepingSchedule {
  propertyId: number;
  date: string;
  items: HousekeepingWorkItem[];
}

export interface RoomStatusChanged {
  roomId: number;
  roomNumber: string;
  previousStatus: string;
  currentStatus: string;
}

export const housekeepingApi = {
  /** GET /api/properties/{propertyId}/housekeeping/schedule?date=YYYY-MM-DD */
  schedule: (propertyId: number | string, date: string) =>
    request<HousekeepingSchedule>(`/api/properties/${propertyId}/housekeeping/schedule${query({ date })}`),

  /** PATCH /api/properties/{propertyId}/housekeeping/rooms/{roomId}/status — body { status } */
  updateRoomStatus: (propertyId: number | string, roomId: number | string, status: HousekeepingRoomStatus) =>
    request<RoomStatusChanged>(
      `/api/properties/${propertyId}/housekeeping/rooms/${roomId}/status`,
      send("PATCH", { status })
    ),

  /** GET /api/properties/{propertyId}/housekeeping/issues */
  issues: (propertyId: number | string) =>
    request<HousekeepingIssue[]>(`/api/properties/${propertyId}/housekeeping/issues`),

  /** POST /api/properties/{propertyId}/housekeeping/rooms/{roomId}/issues — body { issue } */
  createIssue: (propertyId: number | string, roomId: number | string, issue: string) =>
    request<HousekeepingIssue>(
      `/api/properties/${propertyId}/housekeeping/rooms/${roomId}/issues`,
      send("POST", { issue })
    ),

  /** PATCH /api/properties/{propertyId}/housekeeping/issues/{issueId}/resolution — body { resolution } */
  resolveIssue: (propertyId: number | string, issueId: number | string, resolution: string) =>
    request<HousekeepingIssue>(
      `/api/properties/${propertyId}/housekeeping/issues/${issueId}/resolution`,
      send("PATCH", { resolution })
    ),
};

// ============================================================================
// NO-SHOW  (token nhân viên; quyền RESERVATION_VIEW / RESERVATION_UPDATE)
// ============================================================================

export interface NoShowItem {
  reservationId: number;
  reservationCode: string;
  guestName: string;
  guestEmail?: string | null;
  checkInDate: string;
  checkOutDate: string;
  expectedCheckInAt?: string | null;
  status: string;
}

export interface NoShowTracking {
  propertyId: number;
  checkedAt: string;
  reservations: NoShowItem[];
}

export interface NoShowConfirmed {
  reservationCode: string;
  previousStatus: string;
  currentStatus: string;
  confirmedAt: string;
  message?: string;
}

export interface NoShowNotified {
  reservationCode: string;
  guestEmail?: string | null;
  propertyEmail?: string | null;
  sentAt: string;
  message?: string;
}

export const noShowApi = {
  /** GET /api/properties/{propertyId}/reservations/no-show */
  tracking: (propertyId: number | string) =>
    request<NoShowTracking>(`/api/properties/${propertyId}/reservations/no-show`),

  /** POST /api/properties/{propertyId}/reservations/{reservationCode}/no-show/notify */
  notify: (propertyId: number | string, reservationCode: string) =>
    request<NoShowNotified>(
      `/api/properties/${propertyId}/reservations/${enc(reservationCode)}/no-show/notify`,
      send("POST")
    ),

  /** POST /api/properties/{propertyId}/reservations/{reservationCode}/no-show/confirm */
  confirm: (propertyId: number | string, reservationCode: string) =>
    request<NoShowConfirmed>(
      `/api/properties/${propertyId}/reservations/${enc(reservationCode)}/no-show/confirm`,
      send("POST")
    ),
};

// ============================================================================
// HỦY ĐẶT PHÒNG & HOÀN TIỀN
// ============================================================================

export interface RefundQuote {
  reservationCode: string;
  reservationStatus: string;
  checkInDate: string;
  cancellationFormula?: string | null;
  freeCancellationDays?: number | null;
  daysBeforeCheckIn?: number | null;
  totalPaidAmount: number;
  totalRefundedAmount: number;
  pendingRefundAmount: number;
  refundableAmount: number;
  currency: string;
  eligibleForRefund: boolean;
}

export interface CancelReservationInput extends GuestContact {
  reason?: string;
}

export interface CancelReservationResult {
  reservationCode: string;
  status: string;
  refundAmount?: number | null;
  currency?: string | null;
  refundStatus?: string | null;
  message?: string;
}

export interface RefundRequestCreated {
  refundPaymentId: number;
  originalPaymentId: number;
  reservationCode: string;
  amount: number;
  currency: string;
  status: string;
  gatewayRefundId?: string | null;
}

export interface RefundStatus {
  refundPaymentId: number;
  reservationCode: string;
  amount: number;
  currency: string;
  status: string;
  gatewayRefundId?: string | null;
  paidAt?: string | null;
}

export const reservationStaffApi = {
  /** [PMS] GET /api/properties/{propertyId}/reservations/{reservationCode}/refund-quote (quyền REFUND_CALCULATE) */
  refundQuote: (propertyId: number | string, reservationCode: string, contact: GuestContact = {}) =>
    request<RefundQuote>(
      `/api/properties/${propertyId}/reservations/${enc(reservationCode)}/refund-quote${query({ ...contact })}`
    ),

  /** [PMS] POST /api/properties/{propertyId}/reservations/{reservationCode}/cancel (quyền RESERVATION_CANCEL) */
  cancel: (propertyId: number | string, reservationCode: string, data: CancelReservationInput = {}) =>
    request<CancelReservationResult>(
      `/api/properties/${propertyId}/reservations/${enc(reservationCode)}/cancel`,
      send("POST", data)
    ),

  /** [PMS] POST /api/properties/{propertyId}/reservations/{reservationCode}/refunds (quyền REFUND_CREATE) */
  createRefund: (
    propertyId: number | string,
    reservationCode: string,
    data: { reservationPaymentId: number; reason?: string }
  ) =>
    request<RefundRequestCreated>(
      `/api/properties/${propertyId}/reservations/${enc(reservationCode)}/refunds`,
      send("POST", data)
    ),

  /** [PMS] GET /api/properties/{propertyId}/refunds/{refundPaymentId} (quyền REFUND_VIEW) */
  refundStatus: (propertyId: number | string, refundPaymentId: number | string) =>
    request<RefundStatus>(`/api/properties/${propertyId}/refunds/${refundPaymentId}`),
};

export const guestReservationApi = {
  /** [PUBLIC] GET /api/public/reservations/{reservationCode}/refund-quote?email=&phone= */
  refundQuote: (reservationCode: string, contact: GuestContact) =>
    request<RefundQuote>(`/api/public/reservations/${enc(reservationCode)}/refund-quote${query({ ...contact })}`),

  /** [PUBLIC] POST /api/public/reservations/{reservationCode}/cancel — body { email|phone, reason } */
  cancel: (reservationCode: string, data: CancelReservationInput) =>
    request<CancelReservationResult>(
      `/api/public/reservations/${enc(reservationCode)}/cancel`,
      send("POST", data)
    ),
};

// ============================================================================
// GỌI MÓN F&B CỦA KHÁCH (công khai, xác thực bằng email/số điện thoại của đặt phòng)
// ============================================================================

export interface GuestFnbMenuItem {
  menuId: number;
  name: string;
  sellingPrice: number;
  availableQuantity: number;
}

export interface FnbOrderInput {
  items: { menuId: number; quantity: number }[];
  /** ISO date-time, ví dụ 2026-11-22T19:00:00 */
  serviceTime: string;
}

export interface FnbOrderResult {
  reservationCode: string;
  guestId: number;
  serviceTime: string;
  items: {
    menuId: number;
    menuName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    remainingQuantity: number;
    folioId?: number;
  }[];
  totalAmount: number;
  message?: string;
}

export const guestFnbApi = {
  /** GET /api/public/reservations/{reservationCode}/fnb-menu?email=&phone= */
  menu: (reservationCode: string, contact: GuestContact) =>
    request<GuestFnbMenuItem[]>(`/api/public/reservations/${enc(reservationCode)}/fnb-menu${query({ ...contact })}`),

  /** POST /api/public/reservations/{reservationCode}/fnb-orders?email=&phone= */
  placeOrder: (reservationCode: string, contact: GuestContact, data: FnbOrderInput) =>
    request<FnbOrderResult>(
      `/api/public/reservations/${enc(reservationCode)}/fnb-orders${query({ ...contact })}`,
      send("POST", data)
    ),
};

// ============================================================================
// CỔNG THANH TOÁN CỦA KHÁCH SẠN (Owner) — Stripe
// ============================================================================

export interface PaymentGatewayCatalogItem {
  gatewayId: number;
  name: string;
  description?: string | null;
  status: string;
}

export interface PaymentGatewayConfigView {
  gatewayConfigId: number;
  propertyId: number;
  propertyName?: string;
  gatewayId: number;
  gatewayName: string;
  status: string;
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
}

export interface PaymentGatewayConfigSaved {
  gatewayConfigId: number;
  propertyId: number;
  propertyName?: string;
  gatewayName: string;
  status: string;
  message?: string;
}

export const paymentGatewayApi = {
  /** [OWNER] GET /api/payment-gateways */
  catalog: () => request<PaymentGatewayCatalogItem[]>("/api/payment-gateways"),

  /** [OWNER] GET /api/properties/{propertyId}/payment-gateway (404 nếu chưa cấu hình) */
  get: (propertyId: number | string) =>
    request<PaymentGatewayConfigView>(`/api/properties/${propertyId}/payment-gateway`),

  /** [OWNER] POST /api/properties/{propertyId}/payment-gateway — secretKey: sk_(test|live)_…, webhookSecret: whsec_… */
  create: (propertyId: number | string, data: { secretKey: string; webhookSecret: string }) =>
    request<PaymentGatewayConfigSaved>(`/api/properties/${propertyId}/payment-gateway`, send("POST", data)),

  /** [OWNER] PUT /api/properties/{propertyId}/payment-gateway — mọi trường đều tùy chọn; status ACTIVE|INACTIVE */
  update: (
    propertyId: number | string,
    data: { secretKey?: string; webhookSecret?: string; status?: "ACTIVE" | "INACTIVE" }
  ) => request<PaymentGatewayConfigSaved>(`/api/properties/${propertyId}/payment-gateway`, send("PUT", data)),
};

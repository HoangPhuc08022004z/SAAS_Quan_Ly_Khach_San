/**
 * Client cho nhóm API PMS + đặt phòng công khai — theo openapi-saas-pms.yaml.
 * Spec chưa mô tả schema phản hồi nên kiểu trả về để lỏng (unknown/Record); chỉ request lấy từ DTO.
 */
import { saasApi } from "./saas-api";

const request = <T>(endpoint: string, options?: RequestInit) => saasApi.request<T>(endpoint, options);
const post = (body?: unknown): RequestInit => ({ method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export interface PmsEmployeeLoginInput {
  email: string;
  password: string;
}

export interface GuestInformation {
  fullName: string;
  email?: string;
  phone?: string;
  identityNumber?: string;
  identityType?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: string;
  nationality?: string;
  address?: string;
}

export interface CreateReservationInput {
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string;
  guestCount: number;
  rooms: { roomId: number; roomRateId: number }[];
  guest: GuestInformation;
}

/** POST /api/v1/pms/auth/login (không cần token) */
export const pmsAuthApi = {
  login: (data: PmsEmployeeLoginInput) => request<Record<string, unknown>>("/api/v1/pms/auth/login", post(data)),
};

/** [PMS] POST /api/pms/chat — body { question } */
export const pmsChatApi = {
  ask: (question: string) => request<unknown>("/api/pms/chat", post({ question })),
};

/** Nhóm công khai — không cần token */
export const publicApi = {
  /** POST /api/public/properties/{propertyId}/chat */
  chat: (propertyId: number | string, question: string) =>
    request<unknown>(`/api/public/properties/${propertyId}/chat`, post({ question })),
  /** GET /api/public/properties/{propertyId}/available-rooms */
  availableRooms: (propertyId: number | string) =>
    request<unknown>(`/api/public/properties/${propertyId}/available-rooms`),
  /** POST /api/public/properties/{propertyId}/reservations */
  createReservation: (propertyId: number | string, data: CreateReservationInput) =>
    request<Record<string, unknown>>(`/api/public/properties/${propertyId}/reservations`, post(data)),
  /** GET /api/public/reservations/{reservationCode} */
  getReservation: (reservationCode: string) =>
    request<Record<string, unknown>>(`/api/public/reservations/${encodeURIComponent(reservationCode)}`),
  /** POST /api/public/reservations/{reservationCode}/payments */
  createPayment: (reservationCode: string) =>
    request<Record<string, unknown>>(`/api/public/reservations/${encodeURIComponent(reservationCode)}/payments`, post()),
  /** POST .../payments/{paymentId}/checkout-session?email=&phone= */
  createCheckoutSession: (reservationCode: string, paymentId: number | string, contact?: { email?: string; phone?: string }) => {
    const qs = new URLSearchParams();
    if (contact?.email) qs.set("email", contact.email);
    if (contact?.phone) qs.set("phone", contact.phone);
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<Record<string, unknown>>(
      `/api/public/reservations/${encodeURIComponent(reservationCode)}/payments/${paymentId}/checkout-session${suffix}`,
      post()
    );
  },
};

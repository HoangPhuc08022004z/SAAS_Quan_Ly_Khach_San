/**
 * Client cho nhóm API PMS + đặt phòng công khai — theo "Tài liệu API — SaaS PMS With Chat Bot" (mục 5).
 */
import { saasApi } from "./saas-api";

const request = <T>(endpoint: string, options?: RequestInit) => saasApi.request<T>(endpoint, options);
const post = (body?: unknown): RequestInit => ({ method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

const query = (params: Record<string, string | number | undefined | null>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

// ============================================================================
// ĐĂNG NHẬP NHÂN VIÊN PMS
// ============================================================================

export interface PmsEmployeeLoginInput {
  email: string;
  password: string;
}

export interface PmsLoginResponse {
  message?: string;
  accessToken: string;
  user: {
    userId: number;
    fullName: string;
    email: string;
    propertyId: number;
    propertyName: string;
    tenantId: number;
    role: string;
  };
  permissions: string[];
}

/** POST /api/v1/pms/auth/login (không cần token) */
export const pmsAuthApi = {
  login: (data: PmsEmployeeLoginInput) => request<PmsLoginResponse>("/api/v1/pms/auth/login", post(data)),
};

// ============================================================================
// CHATBOT (backend trả văn bản thuần, có thể gắn nhãn JSON → tự suy ra nội dung)
// ============================================================================

async function askText(endpoint: string, init: RequestInit = {}): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "text/plain, application/json, */*",
    "ngrok-skip-browser-warning": "true",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (init.body) headers["Content-Type"] = "application/json";
  const token = saasApi.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${saasApi.getBaseUrl()}${endpoint}`, { ...init, headers });
  const raw = await response.text();

  if (!response.ok) {
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      message = parsed?.message || parsed?.error || raw;
    } catch {
      // thân phản hồi không phải JSON
    }
    throw new Error(message || `HTTP ${response.status}`);
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

/** [PMS] POST /api/pms/chat — body { question } */
export const pmsChatApi = {
  ask: (question: string) => askText("/api/pms/chat", post({ question })),
};

/** [OWNER] GET /api/properties/{propertyId}/chat?question= */
export const ownerChatApi = {
  ask: (propertyId: number | string, question: string) =>
    askText(`/api/properties/${propertyId}/chat${query({ question })}`),
};

// ============================================================================
// ĐẶT PHÒNG CÔNG KHAI (không cần token)
// ============================================================================

export interface AvailableRoomRate {
  roomRateId: number;
  rateName: string;
  price: number;
  description?: string | null;
}

export interface AvailableRoom {
  roomId: number;
  roomNumber: string;
  floor: number;
  description?: string | null;
}

export interface AvailableRoomType {
  roomTypeId: number;
  name: string;
  description?: string | null;
  capacity: number;
  bedType: string;
  numberOfBeds: number;
  image?: string | null;
  availableRoomCount: number;
  minimumRoomsRequired: number;
  roomRates: AvailableRoomRate[];
  rooms: AvailableRoom[];
}

export interface AvailableRoomsResponse {
  propertyId: number;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  roomTypes: AvailableRoomType[];
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

export interface ReservationCreated {
  reservationId: number;
  reservationCode: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guestCount: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  paymentExpiresAt: string;
  rooms: {
    roomId: number;
    roomNumber: string;
    roomRateId: number;
    rateName: string;
    nightlyPrice: number;
    totalPrice: number;
  }[];
}

export interface ReservationDetail {
  reservationId: number;
  reservationCode: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guestCount: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  createdAt: string;
  paymentExpiresAt?: string | null;
  paymentHoldExpired?: boolean;
  guest: GuestInformation;
  rooms: {
    roomId: number;
    roomNumber: string;
    floor: number;
    roomType: string;
    nightlyPrices: { stayDate: string; roomRateId: number; rateName: string; price: number }[];
    totalPrice: number;
  }[];
  payments: {
    reservationPaymentId: number;
    paymentType: string;
    amount: number;
    currency: string;
    status: string;
    paidAt?: string | null;
  }[];
}

export interface ReservationPaymentAttempt {
  reservationPaymentId: number;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
  reusedExistingAttempt?: boolean;
}

export interface CheckoutSessionResult {
  reservationPaymentId: number;
  reservationCode: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  reusedExistingSession?: boolean;
}

/** Khách chứng minh quyền bằng email hoặc số điện thoại trùng với khách trên reservation */
export interface GuestContact {
  email?: string;
  phone?: string;
}

const enc = encodeURIComponent;

export const publicApi = {
  /** POST /api/public/properties/{propertyId}/chat */
  chat: (propertyId: number | string, question: string) =>
    askText(`/api/public/properties/${propertyId}/chat`, post({ question })),

  /** GET /api/public/properties/{propertyId}/available-rooms */
  availableRooms: (
    propertyId: number | string,
    params: { checkInDate: string; checkOutDate: string; guestCount: number; roomTypeId?: number }
  ) => request<AvailableRoomsResponse>(`/api/public/properties/${propertyId}/available-rooms${query(params)}`),

  /** POST /api/public/properties/{propertyId}/reservations */
  createReservation: (propertyId: number | string, data: CreateReservationInput) =>
    request<ReservationCreated>(`/api/public/properties/${propertyId}/reservations`, post(data)),

  /** GET /api/public/reservations/{reservationCode}?email=&phone= */
  getReservation: (reservationCode: string, contact: GuestContact) =>
    request<ReservationDetail>(`/api/public/reservations/${enc(reservationCode)}${query({ ...contact })}`),

  /** POST /api/public/reservations/{reservationCode}/payments?email=&phone= */
  createPayment: (reservationCode: string, contact: GuestContact) =>
    request<ReservationPaymentAttempt>(
      `/api/public/reservations/${enc(reservationCode)}/payments${query({ ...contact })}`,
      post()
    ),

  /** POST /api/public/reservations/{reservationCode}/payments/{paymentId}/checkout-session?email=&phone= */
  createCheckoutSession: (reservationCode: string, paymentId: number | string, contact: GuestContact) =>
    request<CheckoutSessionResult>(
      `/api/public/reservations/${enc(reservationCode)}/payments/${paymentId}/checkout-session${query({ ...contact })}`,
      post()
    ),
};

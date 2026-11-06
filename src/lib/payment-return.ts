/**
 * Backend dùng chung một cặp URL thành công/hủy của Stripe cho cả thuê bao Owner lẫn đặt cọc của khách.
 * Trước khi chuyển sang Stripe, trình duyệt ghi lại đặt phòng đang thanh toán; trang /payments/return
 * dựa vào đó để biết phải đưa người dùng về trang nào.
 */
const KEY = "pending_reservation_payment";
const TTL_MS = 2 * 60 * 60 * 1000;

export interface PendingReservationPayment {
  code: string;
  email?: string;
  phone?: string;
  ts: number;
}

export function markReservationPayment(p: Omit<PendingReservationPayment, "ts">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, ts: Date.now() }));
  } catch {
    // trình duyệt chặn lưu trữ: bỏ qua, khách vẫn tra cứu được bằng mã đặt phòng
  }
}

export function readReservationPayment(): PendingReservationPayment | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingReservationPayment;
    return Date.now() - p.ts < TTL_MS ? p : null;
  } catch {
    return null;
  }
}

export function clearReservationPayment() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // bỏ qua
  }
}

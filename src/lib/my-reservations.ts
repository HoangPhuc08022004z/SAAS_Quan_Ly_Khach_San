/**
 * Ghi nhớ các đặt phòng của khách trên chính trình duyệt này (cookie) để lần sau tra cứu không phải
 * mở email lấy mã. API tra cứu bắt buộc kèm email hoặc SĐT nên lưu cả hai cùng mã đặt phòng.
 * Cookie chỉ nằm trên máy khách (không gửi lên backend), hết hạn sau 60 ngày, tối đa 10 đặt phòng.
 */
const COOKIE = "my_reservations";
const MAX_ITEMS = 10;
const MAX_AGE_SEC = 60 * 24 * 60 * 60;

export interface SavedReservation {
  code: string;
  email?: string;
  phone?: string;
  propertyName?: string;
  checkInDate?: string;
  ts: number;
}

function readAll(): SavedReservation[] {
  try {
    if (typeof document === "undefined") return [];
    const hit = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
    if (!hit) return [];
    const list = JSON.parse(decodeURIComponent(hit.slice(COOKIE.length + 1)));
    return Array.isArray(list) ? list.filter((x) => x && typeof x.code === "string") : [];
  } catch {
    return [];
  }
}

function writeAll(list: SavedReservation[]) {
  try {
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(list))}; Max-Age=${MAX_AGE_SEC}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // trình duyệt chặn cookie: bỏ qua, khách vẫn tra cứu thủ công được
  }
}

export function saveReservation(r: Omit<SavedReservation, "ts">) {
  const rest = readAll().filter((x) => x.code !== r.code);
  writeAll([{ ...r, ts: Date.now() }, ...rest].slice(0, MAX_ITEMS));
}

export function listSavedReservations(): SavedReservation[] {
  return readAll().sort((a, b) => b.ts - a.ts);
}

export function removeSavedReservation(code: string) {
  writeAll(readAll().filter((x) => x.code !== code));
}

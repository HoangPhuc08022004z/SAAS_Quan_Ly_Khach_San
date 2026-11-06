"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  publicApi,
  type AvailableRoomsResponse,
  type AvailableRoomType,
  type ReservationCreated,
} from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { markReservationPayment } from "@/lib/payment-return";
import { PaymentCountdown } from "@/features/public/components/PaymentCountdown";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Users, Bed, Search, Loader2, Hotel, CheckCircle2, CalendarClock, ExternalLink } from "lucide-react";

const toDateStr = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};

const inputClass =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

interface Selection {
  roomId: number;
  roomRateId: number;
  roomNumber: string;
  roomTypeName: string;
  nightlyPrice: number;
}

export function PropertyGuestView({ propertyId }: { propertyId: string }) {
  const [checkIn, setCheckIn] = useState(addDays(0));
  const [checkOut, setCheckOut] = useState(addDays(1));
  const [guestCount, setGuestCount] = useState("2");
  const [result, setResult] = useState<AvailableRoomsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Giá đã chọn cho từng loại phòng và danh sách phòng đã chọn
  const [rateByType, setRateByType] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<Selection[]>([]);

  // Thông tin khách + kết quả đặt phòng
  const [guest, setGuest] = useState({ fullName: "", email: "", phone: "", identityNumber: "" });
  const [isBooking, setIsBooking] = useState(false);
  const [reservation, setReservation] = useState<ReservationCreated | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const nights = useMemo(() => {
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  }, [checkIn, checkOut]);

  const search = useCallback(async () => {
    const guests = Number(guestCount);
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }
    if (!(guests > 0)) {
      toast.error("Số khách phải lớn hơn 0.");
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      // GET /api/public/properties/{propertyId}/available-rooms
      const res = await publicApi.availableRooms(propertyId, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: guests,
      });
      setResult(res);
      setSelected([]);
      setRateByType(Object.fromEntries(res.roomTypes.map((t) => [t.roomTypeId, t.roomRates?.[0]?.roomRateId ?? 0])));
    } catch (err: any) {
      setError(err?.message || "Không tra cứu được phòng trống.");
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  }, [propertyId, checkIn, checkOut, guestCount]);

  useEffect(() => {
    search();
    // chỉ tự tra cứu một lần khi mở trang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRoom = (type: AvailableRoomType, roomId: number, roomNumber: string) => {
    const roomRateId = rateByType[type.roomTypeId];
    const rate = type.roomRates.find((r) => r.roomRateId === roomRateId);
    if (!rate) {
      toast.error("Loại phòng này chưa có mức giá để đặt.");
      return;
    }
    setSelected((prev) =>
      prev.some((s) => s.roomId === roomId)
        ? prev.filter((s) => s.roomId !== roomId)
        : [
            ...prev,
            { roomId, roomRateId, roomNumber, roomTypeName: type.name, nightlyPrice: Number(rate.price) },
          ]
    );
  };

  const estimatedTotal = selected.reduce((sum, s) => sum + s.nightlyPrice * nights, 0);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phòng.");
      return;
    }
    if (!guest.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên.");
      return;
    }
    if (!guest.email.trim() && !guest.phone.trim()) {
      toast.error("Vui lòng nhập email hoặc số điện thoại để tra cứu và thanh toán sau này.");
      return;
    }
    setIsBooking(true);
    try {
      // POST /api/public/properties/{propertyId}/reservations
      const res = await publicApi.createReservation(propertyId, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: Number(guestCount),
        rooms: selected.map((s) => ({ roomId: s.roomId, roomRateId: s.roomRateId })),
        guest: {
          fullName: guest.fullName.trim(),
          email: guest.email.trim() || undefined,
          phone: guest.phone.trim() || undefined,
          identityNumber: guest.identityNumber.trim() || undefined,
        },
      });
      setReservation(res);
      toast.success(`Đã giữ phòng! Mã đặt phòng: ${res.reservationCode}`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tạo đặt phòng.");
    } finally {
      setIsBooking(false);
    }
  };

  const handlePay = async () => {
    if (!reservation) return;
    const contact = { email: guest.email.trim() || undefined, phone: guest.phone.trim() || undefined };
    setIsPaying(true);
    try {
      // 1) tạo lần thanh toán đặt cọc  2) tạo Stripe Checkout Session  3) chuyển khách tới checkoutUrl
      const payment = await publicApi.createPayment(reservation.reservationCode, contact);
      const session = await publicApi.createCheckoutSession(
        reservation.reservationCode,
        payment.reservationPaymentId,
        contact
      );
      markReservationPayment({ code: reservation.reservationCode, ...contact });
      window.location.href = session.checkoutUrl;
    } catch (err: any) {
      toast.error(err?.message || "Không thể khởi tạo thanh toán.");
      setIsPaying(false);
    }
  };

  const lookupHref = reservation
    ? `/p/reservation?code=${encodeURIComponent(reservation.reservationCode)}&${
        guest.email.trim() ? `email=${encodeURIComponent(guest.email.trim())}` : `phone=${encodeURIComponent(guest.phone.trim())}`
      }`
    : "/p/reservation";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100">
            <Hotel className="w-4 h-4" />
            <span>Đặt phòng trực tuyến</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {result?.propertyName ?? "Khách sạn"}
          </h1>
          <Link href="/p/reservation" className="inline-flex items-center gap-1 text-xs text-blue-100 hover:text-white underline">
            <ExternalLink className="w-3 h-3" />
            Tra cứu đặt phòng đã có
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Thanh tra cứu */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Nhận phòng</label>
              <input type="date" min={addDays(0)} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Trả phòng</label>
              <input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Số khách</label>
              <input type="number" min={1} value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={inputClass} />
            </div>
            <button
              type="button"
              onClick={search}
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isSearching ? "Đang tra cứu..." : "Tìm phòng trống"}</span>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{nights} đêm lưu trú</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Danh sách loại phòng */}
        {result && result.roomTypes.length === 0 && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Không còn phòng phù hợp trong khoảng ngày này. Vui lòng thử ngày khác hoặc đổi số khách.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {result?.roomTypes.map((rt) => (
            <div
              key={rt.roomTypeId}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {rt.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rt.image} alt={rt.name} className="h-40 w-full object-cover" />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{rt.name}</h3>
                    {rt.description && <p className="text-xs text-slate-500 mt-0.5">{rt.description}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-emerald-600">Còn {rt.availableRoomCount} phòng</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    {rt.capacity} người/phòng
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-indigo-500" />
                    {rt.numberOfBeds} × {rt.bedType}
                  </span>
                </div>

                {rt.minimumRoomsRequired > 1 && (
                  <p className="text-[11px] text-amber-600">
                    Với {guestCount} khách, bạn cần đặt tối thiểu {rt.minimumRoomsRequired} phòng loại này.
                  </p>
                )}

                {/* Mức giá */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Mức giá</label>
                  {rt.roomRates.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Chưa có mức giá.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rt.roomRates.map((rate) => (
                        <button
                          key={rate.roomRateId}
                          type="button"
                          onClick={() => {
                            setRateByType((prev) => ({ ...prev, [rt.roomTypeId]: rate.roomRateId }));
                            // đổi giá thì bỏ chọn các phòng đã chọn của loại này để chọn lại theo giá mới
                            setSelected((prev) => prev.filter((s) => !rt.rooms.some((r) => r.roomId === s.roomId)));
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-left text-xs ${
                            rateByType[rt.roomTypeId] === rate.roomRateId
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="font-semibold">{rate.rateName === "WEEKEND_RATE" ? "Cuối tuần" : "Tiêu chuẩn"}</div>
                          <MoneyText amount={rate.price} className="text-blue-600" />
                          <span className="text-[10px] text-slate-400"> /đêm</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phòng cụ thể */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Chọn phòng</label>
                  <div className="flex flex-wrap gap-2">
                    {rt.rooms.map((room) => {
                      const isOn = selected.some((s) => s.roomId === room.roomId);
                      return (
                        <button
                          key={room.roomId}
                          type="button"
                          onClick={() => toggleRoom(rt, room.roomId, room.roomNumber)}
                          title={room.description || `Tầng ${room.floor}`}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                            isOn
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {room.roomNumber}
                          <span className="ml-1 font-normal opacity-70">T{room.floor}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Thông tin khách & đặt phòng */}
        {result && selected.length > 0 && !reservation && (
          <form
            onSubmit={handleBook}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thông tin đặt phòng</h3>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {selected.length} phòng ({selected.map((s) => s.roomNumber).join(", ")}) × {nights} đêm ≈{" "}
                <MoneyText amount={estimatedTotal} className="font-extrabold text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Họ tên <span className="text-rose-500">*</span>
                </label>
                <input
                  value={guest.fullName}
                  maxLength={150}
                  onChange={(e) => setGuest({ ...guest, fullName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số CCCD/Hộ chiếu</label>
                <input
                  value={guest.identityNumber}
                  maxLength={50}
                  onChange={(e) => setGuest({ ...guest, identityNumber: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={guest.email}
                  maxLength={255}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input
                  value={guest.phone}
                  maxLength={20}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Cần ít nhất email hoặc số điện thoại. Bạn dùng thông tin này để tra cứu và thanh toán đặt cọc.
            </p>

            <button
              type="submit"
              disabled={isBooking}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md"
            >
              {isBooking && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isBooking ? "Đang giữ phòng..." : "Giữ phòng & tiếp tục"}</span>
            </button>
          </form>
        )}

        {/* Kết quả đặt phòng */}
        {reservation && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-lg dark:border-emerald-900 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">Đã giữ phòng — mã đặt phòng {reservation.reservationCode}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-slate-400">Tổng tiền</div>
                <MoneyText amount={reservation.totalAmount} className="font-extrabold" />
              </div>
              <div>
                <div className="text-slate-400">Tiền cọc cần thanh toán</div>
                <MoneyText amount={reservation.depositAmount} className="font-extrabold text-blue-600" />
                <span className="ml-1 text-slate-400">{reservation.currency}</span>
              </div>
              <div>
                <div className="text-slate-400 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" /> Giữ phòng đến
                </div>
                <div className="font-semibold">
                  {reservation.paymentExpiresAt
                    ? new Date(reservation.paymentExpiresAt).toLocaleString("vi-VN")
                    : "—"}
                </div>
                <PaymentCountdown expiresAt={reservation.paymentExpiresAt} />
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {reservation.rooms.map((r) => `${r.roomNumber} (${r.rateName})`).join(", ")} • {reservation.numberOfNights} đêm
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaying}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md"
              >
                {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isPaying ? "Đang chuyển tới cổng thanh toán..." : "Thanh toán đặt cọc"}</span>
              </button>
              <Link
                href={lookupHref}
                className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300"
              >
                Xem chi tiết đặt phòng
              </Link>
            </div>
            <p className="text-[11px] text-slate-500">
              Phòng chỉ được giữ trong 15 phút. Quá hạn mà chưa thanh toán, đặt phòng sẽ tự hết hạn.
            </p>
          </div>
        )}
      </div>

      <ChatWidget mode="guest" propertyId={propertyId} isFloating />
    </div>
  );
}

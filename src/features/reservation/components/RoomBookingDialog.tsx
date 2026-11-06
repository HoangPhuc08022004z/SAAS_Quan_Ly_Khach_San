"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Loader2, CheckCircle2, CreditCard, Search, Users, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { markReservationPayment } from "@/lib/payment-return";
import { PaymentCountdown } from "@/features/public/components/PaymentCountdown";
import { publicApi, type AvailableRoomType, type ReservationCreated } from "@/lib/api";

const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
const fmtTime = (s?: string) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

interface Props {
  propertyId: number | string;
  type: AvailableRoomType;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  initialRoomId?: number;
  onClose: () => void;
  /** Gọi sau khi tạo đặt phòng thành công để tải lại danh sách phòng trống */
  onBooked: () => void;
}

/**
 * Danh sách phòng của một loại + đặt phòng thật:
 *  POST /api/public/properties/{id}/reservations → POST .../payments → POST .../checkout-session
 */
export function RoomBookingDialog({ propertyId, type, checkIn, checkOut, nights, guestCount, initialRoomId, onClose, onBooked }: Props) {
  const [step, setStep] = useState<"PICK" | "GUEST" | "DONE">("PICK");
  const [picked, setPicked] = useState<number[]>(initialRoomId ? [initialRoomId] : []);
  const [rateId, setRateId] = useState<number>(
    (type.roomRates.find((r) => /STANDARD/i.test(r.rateName)) ?? type.roomRates[0])?.roomRateId ?? 0
  );
  const [guest, setGuest] = useState({ fullName: "", phone: "", email: "", identityNumber: "" });
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reservation, setReservation] = useState<ReservationCreated | null>(null);

  const rate = type.roomRates.find((r) => r.roomRateId === rateId);
  const estimated = (rate ? Number(rate.price) : 0) * nights * picked.length;
  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const inputCls = "block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";

  const goGuest = () => {
    if (!rate) return toast.error("Loại phòng này chưa có mức giá để đặt.");
    if (picked.length === 0) return toast.error("Vui lòng chọn ít nhất một phòng.");
    if (picked.length < type.minimumRoomsRequired) return toast.error(`Loại phòng này cần đặt tối thiểu ${type.minimumRoomsRequired} phòng.`);
    setStep("GUEST");
  };

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.fullName.trim()) return toast.error("Vui lòng nhập họ tên khách.");
    if (!guest.email.trim() && !guest.phone.trim()) return toast.error("Cần ít nhất email hoặc số điện thoại của khách.");
    setSaving(true);
    try {
      const res = await publicApi.createReservation(propertyId, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        rooms: picked.map((roomId) => ({ roomId, roomRateId: rateId })),
        guest: {
          fullName: guest.fullName.trim(),
          email: guest.email.trim() || undefined,
          phone: guest.phone.trim() || undefined,
          identityNumber: guest.identityNumber.trim() || undefined,
        },
      });
      setReservation(res);
      setStep("DONE");
      onBooked();
      toast.success(`Đã giữ phòng! Mã đặt phòng: ${res.reservationCode}`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tạo đặt phòng.");
    } finally {
      setSaving(false);
    }
  };

  const pay = async () => {
    if (!reservation) return;
    const contact = { email: guest.email.trim() || undefined, phone: guest.phone.trim() || undefined };
    setPaying(true);
    try {
      const payment = await publicApi.createPayment(reservation.reservationCode, contact);
      const session = await publicApi.createCheckoutSession(reservation.reservationCode, payment.reservationPaymentId, contact);
      markReservationPayment({ code: reservation.reservationCode, ...contact });
      window.open(session.checkoutUrl, "_blank", "noopener");
    } catch (err: any) {
      toast.error(err?.message || "Không thể khởi tạo thanh toán.");
    } finally {
      setPaying(false);
    }
  };

  const contactQuery = guest.email.trim() ? `email=${encodeURIComponent(guest.email.trim())}` : `phone=${encodeURIComponent(guest.phone.trim())}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {type.name} · {checkIn} → {checkOut} ({nights} đêm)
            </h3>
            <p className="text-slate-400 inline-flex items-center gap-3 mt-0.5">
              <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" />{type.numberOfBeds} {type.bedType}</span>
              <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />Tối đa {type.capacity}</span>
              <span>{guestCount} khách</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {step === "PICK" && (
          <>
            {type.roomRates.length > 0 && (
              <label className="block space-y-1 font-semibold text-slate-600 dark:text-slate-300">
                <span>Mức giá áp dụng</span>
                <select value={rateId} onChange={(e) => setRateId(Number(e.target.value))} className={inputCls}>
                  {type.roomRates.map((r) => (
                    <option key={r.roomRateId} value={r.roomRateId}>
                      {r.rateName} — {vnd(Number(r.price))}/đêm
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Phòng trống ({type.rooms.length}) {type.minimumRoomsRequired > 1 && <span className="text-amber-600">· đặt tối thiểu {type.minimumRoomsRequired} phòng</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {type.rooms.map((r) => {
                  const on = picked.includes(r.roomId);
                  return (
                    <button
                      key={r.roomId}
                      type="button"
                      onClick={() => toggle(r.roomId)}
                      className={`text-left rounded-xl border p-3 transition-colors ${
                        on
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-slate-200 hover:border-blue-300 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">Phòng {r.roomNumber}</span>
                        <span className={`text-[10px] font-bold ${on ? "text-blue-600" : "text-slate-400"}`}>{on ? "Đã chọn ✓" : "Bấm để chọn"}</span>
                      </div>
                      <div className="text-slate-500">Tầng {r.floor}</div>
                      {r.description && <div className="text-[11px] italic text-slate-400">{r.description}</div>}
                      {rate && <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{vnd(Number(rate.price) * nights)} / {nights} đêm</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-300">
                Đã chọn <b>{picked.length}</b> phòng · tạm tính <b>{vnd(estimated)}</b>
                <span className="block text-[10px] text-slate-400">Tổng chính thức do hệ thống tính (giá cuối tuần theo từng đêm).</span>
              </p>
              <button onClick={goGuest} className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                Đặt phòng
              </button>
            </div>
          </>
        )}

        {step === "GUEST" && (
          <form onSubmit={book} className="space-y-3">
            <p className="text-slate-500">
              {picked.length} phòng ({type.rooms.filter((r) => picked.includes(r.roomId)).map((r) => r.roomNumber).join(", ")}) · {rate?.rateName} · tạm tính <b>{vnd(estimated)}</b>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 font-semibold">
                <span>Họ tên khách *</span>
                <input value={guest.fullName} maxLength={150} onChange={(e) => setGuest({ ...guest, fullName: e.target.value })} className={inputCls} />
              </label>
              <label className="space-y-1 font-semibold">
                <span>Số CCCD/Hộ chiếu</span>
                <input value={guest.identityNumber} onChange={(e) => setGuest({ ...guest, identityNumber: e.target.value })} className={inputCls} />
              </label>
              <label className="space-y-1 font-semibold">
                <span>Số điện thoại</span>
                <input value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className={inputCls} />
              </label>
              <label className="space-y-1 font-semibold">
                <span>Email</span>
                <input type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className={inputCls} />
              </label>
            </div>
            <p className="text-[11px] text-slate-400">Cần ít nhất email hoặc số điện thoại để tra cứu và thanh toán đặt cọc sau này.</p>
            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setStep("PICK")} className="px-4 py-2 font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
                Quay lại
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận đặt phòng
              </button>
            </div>
          </form>
        )}

        {step === "DONE" && reservation && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Đã giữ phòng — mã {reservation.reservationCode}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p>Trạng thái<br /><b>{reservation.status}</b></p>
              <p>Số đêm<br /><b>{reservation.numberOfNights}</b></p>
              <p>Tổng tiền<br /><b>{vnd(Number(reservation.totalAmount))}</b></p>
              <p>Tiền đặt cọc<br /><b>{vnd(Number(reservation.depositAmount))}</b></p>
              <p className="col-span-2">Giữ chỗ đến<br /><b>{fmtTime(reservation.paymentExpiresAt)}</b> <PaymentCountdown expiresAt={reservation.paymentExpiresAt} /></p>
            </div>
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-300">
              {reservation.rooms.map((r) => (
                <li key={r.roomId}>Phòng {r.roomNumber} · {r.rateName} · {vnd(Number(r.nightlyPrice))}/đêm · {vnd(Number(r.totalPrice))}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={pay} disabled={paying} className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl">
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Thanh toán đặt cọc
              </button>
              <Link
                href={`/p/reservation?code=${encodeURIComponent(reservation.reservationCode)}&${contactQuery}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Search className="w-4 h-4" /> Tra cứu đặt phòng
              </Link>
              <button onClick={onClose} className="ml-auto px-4 py-2 font-semibold rounded-xl border border-slate-200 dark:border-slate-700">Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

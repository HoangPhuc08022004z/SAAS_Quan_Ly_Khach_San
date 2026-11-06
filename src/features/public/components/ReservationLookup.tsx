"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { markReservationPayment, clearReservationPayment } from "@/lib/payment-return";
import { PaymentCountdown } from "@/features/public/components/PaymentCountdown";
import { publicApi, type GuestContact, type ReservationDetail } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { Loader2, Search, CalendarClock } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán đặt cọc",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến (No-Show)",
  EXPIRED: "Đã hết hạn giữ phòng",
};
const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  SUCCEEDED: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

export function ReservationLookup() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [data, setData] = useState<ReservationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  // Quay về từ Stripe: success → theo dõi đến khi backend (webhook) xác nhận cọc; cancel → cho phép thanh toán lại
  const returned = params.get("payment");
  const [polls, setPolls] = useState(0);

  const contact = (): GuestContact => ({ email: email.trim() || undefined, phone: phone.trim() || undefined });

  const lookup = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã đặt phòng.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      toast.error("Vui lòng nhập email hoặc số điện thoại đã dùng khi đặt phòng.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // GET /api/public/reservations/{reservationCode}?email=&phone=
      setData(await publicApi.getReservation(code.trim(), { email: email.trim() || undefined, phone: phone.trim() || undefined }));
    } catch (err: any) {
      setData(null);
      setError(err?.message || "Không tra cứu được đặt phòng.");
    } finally {
      setLoading(false);
    }
  }, [code, email, phone]);

  // Mở từ link có sẵn mã + thông tin xác thực → tra cứu ngay
  useEffect(() => {
    if (params.get("code") && (params.get("email") || params.get("phone"))) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pay = async () => {
    if (!data) return;
    setPaying(true);
    try {
      const payment = await publicApi.createPayment(data.reservationCode, contact());
      const session = await publicApi.createCheckoutSession(data.reservationCode, payment.reservationPaymentId, contact());
      markReservationPayment({ code: data.reservationCode, ...contact() });
      window.location.href = session.checkoutUrl;
    } catch (err: any) {
      toast.error(err?.message || "Không thể khởi tạo thanh toán.");
      setPaying(false);
    }
  };

  // Webhook Stripe có thể đến chậm vài giây: tự làm mới tối đa ~60 giây
  useEffect(() => {
    if (returned !== "success" || !data || data.status !== "PENDING_PAYMENT" || polls >= 20) return;
    const id = setTimeout(async () => {
      try {
        setData(await publicApi.getReservation(data.reservationCode, contact()));
      } catch {
        // thử lại ở lần sau
      }
      setPolls((n) => n + 1);
    }, 3000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returned, data, polls]);

  useEffect(() => {
    if (data && (data.status === "CONFIRMED" || returned === "cancel")) clearReservationPayment();
  }, [data, returned]);

  const waitingConfirm = returned === "success" && data?.status === "PENDING_PAYMENT";

  const canPay = data?.status === "PENDING_PAYMENT" && !data.paymentHoldExpired;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tra cứu đặt phòng</h1>
        <p className="text-xs text-slate-500 mt-1">Nhập mã đặt phòng và email hoặc số điện thoại đã dùng khi đặt.</p>
      </div>

      {returned === "success" && data?.status === "CONFIRMED" && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          Thanh toán đặt cọc thành công! Đặt phòng của bạn đã được xác nhận.
        </div>
      )}
      {waitingConfirm && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300">
          {polls < 20
            ? "Đang chờ hệ thống xác nhận khoản đặt cọc từ cổng thanh toán, vui lòng giữ trang này trong giây lát..."
            : "Chưa nhận được xác nhận. Nếu bạn đã thanh toán, vui lòng tải lại trang sau ít phút hoặc liên hệ khách sạn kèm mã đặt phòng."}
        </div>
      )}
      {returned === "cancel" && data?.status === "PENDING_PAYMENT" && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
          Bạn đã hủy thanh toán. Phòng vẫn được giữ đến hết thời hạn, bạn có thể bấm "Thanh toán đặt cọc" để thử lại.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
      >
        <div className="space-y-1.5 sm:col-span-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã đặt phòng</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Tra cứu</span>
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {data && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] text-slate-400">Mã đặt phòng</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">{data.reservationCode}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {STATUS_LABEL[data.status] ?? data.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-400">Nhận phòng</div>
              <div className="font-semibold">{data.checkInDate}</div>
            </div>
            <div>
              <div className="text-slate-400">Trả phòng</div>
              <div className="font-semibold">{data.checkOutDate}</div>
            </div>
            <div>
              <div className="text-slate-400">Số đêm / khách</div>
              <div className="font-semibold">
                {data.numberOfNights} đêm / {data.guestCount} khách
              </div>
            </div>
            <div>
              <div className="text-slate-400">Khách</div>
              <div className="font-semibold">{data.guest?.fullName}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Phòng</h3>
            {data.rooms.map((r) => (
              <div
                key={r.roomId}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div>
                  <span className="font-bold">Phòng {r.roomNumber}</span>{" "}
                  <span className="text-slate-400">
                    • {r.roomType} • Tầng {r.floor}
                  </span>
                </div>
                <MoneyText amount={r.totalPrice} className="font-bold" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-slate-400">Tổng tiền</div>
              <MoneyText amount={data.totalAmount} className="text-base font-extrabold" />
            </div>
            <div>
              <div className="text-slate-400">Tiền cọc</div>
              <MoneyText amount={data.depositAmount} className="text-base font-extrabold text-blue-600" />
              <span className="ml-1 text-slate-400">{data.currency}</span>
            </div>
          </div>

          {data.payments?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Thanh toán</h3>
              {data.payments.map((p) => (
                <div
                  key={p.reservationPaymentId}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span>
                    {p.paymentType === "DEPOSIT" ? "Đặt cọc" : p.paymentType === "BALANCE" ? "Thanh toán còn lại" : "Hoàn tiền"}
                  </span>
                  <span className="flex items-center gap-3">
                    <MoneyText amount={p.amount} className="font-bold" />
                    <span className="font-semibold text-slate-500">{PAYMENT_LABEL[p.status] ?? p.status}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {canPay && (
            <div className="space-y-2">
              {data.paymentExpiresAt && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  Giữ phòng đến {new Date(data.paymentExpiresAt).toLocaleString("vi-VN")}
                  <PaymentCountdown expiresAt={data.paymentExpiresAt} />
                </p>
              )}
              <button
                type="button"
                onClick={pay}
                disabled={paying}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md"
              >
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{paying ? "Đang chuyển tới cổng thanh toán..." : "Thanh toán đặt cọc"}</span>
              </button>
            </div>
          )}
          {data.status === "PENDING_PAYMENT" && data.paymentHoldExpired && (
            <p className="text-xs text-rose-600">Thời gian giữ phòng đã hết hạn. Vui lòng đặt phòng lại.</p>
          )}
        </div>
      )}
    </div>
  );
}

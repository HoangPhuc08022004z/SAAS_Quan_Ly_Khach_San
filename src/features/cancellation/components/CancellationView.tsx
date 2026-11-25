"use client";

// API: GET .../check-in/reservations/{code} (tra cứu), GET .../reservations/{code}/refund-quote, POST .../reservations/{code}/cancel
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Calculator, Ban } from "lucide-react";
import {
  checkInApi,
  reservationStaffApi,
  type CheckInReservation,
  type RefundQuote,
  type CancelReservationResult,
} from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import { ReasonDialog } from "@/components/feedback/ReasonDialog";
import {
  Card, ErrorBox, Field, NoProperty, Pill, ReservationStatus, Spinner,
  btnDanger, btnGhost, btnPrimary, inputCls, usePmsProperty, vnd,
} from "@/features/pms-ops/ui";

export function CancellationView() {
  const { propertyId } = usePmsProperty();
  const [code, setCode] = useState("");
  // Mở từ trang đặt phòng: ?code=RSV-... → điền sẵn mã
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (c) setCode(c);
  }, []);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CheckInReservation | null>(null);
  const [quote, setQuote] = useState<RefundQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<CancelReservationResult | null>(null);

  if (!propertyId) return <NoProperty />;

  const contactParam = () => {
    const c = contact.trim();
    return c ? (c.includes("@") ? { email: c } : { phone: c }) : {};
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Nhập mã đặt phòng.");
    setLoading(true);
    setError(null);
    setReservation(null);
    setQuote(null);
    setQuoteError(null);
    setResult(null);
    try {
      const res = await checkInApi.search(propertyId, code.trim(), contactParam());
      setReservation(res);
      reservationStaffApi
        .refundQuote(propertyId, res.reservationCode, contactParam())
        .then(setQuote)
        .catch((e: any) => setQuoteError(e?.message || "Không tính được số tiền hoàn."));
    } catch (e: any) {
      setError(e?.message || "Không tìm thấy đặt phòng.");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (reason: string) => {
    if (!reservation) return;
    setCancelling(true);
    try {
      const res = await reservationStaffApi.cancel(propertyId, reservation.reservationCode, { ...contactParam(), reason });
      setResult(res);
      setReservation({ ...reservation, status: res.status });
      toast.success(res.message || "Đã hủy đặt phòng.");
      setReasonOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Không hủy được đặt phòng.");
      setReasonOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  const cancellable = reservation && ["PENDING_PAYMENT", "CONFIRMED"].includes(reservation.status);

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Mã đặt phòng">
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="RSV-XXXXXX" />
          </Field>
          <Field label="Email hoặc SĐT khách (tùy chọn)">
            <input value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} />
          </Field>
          <button type="submit" disabled={loading} className={btnPrimary}><Search className="h-4 w-4" /> Tra cứu</button>
        </form>
      </Card>

      {loading && <Spinner label="Đang tra cứu..." />}
      <ErrorBox message={error} />

      {reservation && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{reservation.reservationCode}</h3>
              <ReservationStatus status={reservation.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div><dt className="text-slate-400">Khách</dt><dd className="font-semibold">{reservation.guest.fullName}</dd></div>
              <div><dt className="text-slate-400">Số khách</dt><dd className="font-semibold">{reservation.guestCount}</dd></div>
              <div><dt className="text-slate-400">Nhận phòng</dt><dd><DateText date={reservation.checkInDate} /></dd></div>
              <div><dt className="text-slate-400">Trả phòng</dt><dd><DateText date={reservation.checkOutDate} /></dd></div>
            </dl>
            <p className="text-xs text-slate-500">Phòng: {reservation.rooms.map((r) => r.roomNumber).join(", ")}</p>
            <div className="flex justify-end">
              <button type="button" disabled={!cancellable || !!result} onClick={() => setReasonOpen(true)} className={btnDanger}>
                <Ban className="h-3.5 w-3.5" /> Hủy đặt phòng
              </button>
            </div>
            {!cancellable && !result && <p className="text-[11px] text-slate-400">Chỉ hủy được đặt phòng đang chờ cọc hoặc đã xác nhận.</p>}
          </Card>

          <Card className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold"><Calculator className="h-4 w-4 text-blue-600" /> Báo giá hoàn tiền</h3>
            {!quote && !quoteError && <Spinner />}
            <ErrorBox message={quoteError} />
            {quote && (
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-400">Đã thanh toán</dt><dd className="font-semibold">{vnd(quote.totalPaidAmount)}</dd></div>
                <div><dt className="text-slate-400">Đã hoàn</dt><dd className="font-semibold">{vnd(quote.totalRefundedAmount)}</dd></div>
                <div><dt className="text-slate-400">Đang chờ hoàn</dt><dd className="font-semibold">{vnd(quote.pendingRefundAmount)}</dd></div>
                <div><dt className="text-slate-400">Có thể hoàn</dt><dd className="font-bold text-emerald-600">{vnd(quote.refundableAmount)}</dd></div>
                <div><dt className="text-slate-400">Hủy miễn phí trước</dt><dd>{quote.freeCancellationDays ?? "-"} ngày</dd></div>
                <div><dt className="text-slate-400">Còn lại tới check-in</dt><dd>{quote.daysBeforeCheckIn ?? "-"} ngày</dd></div>
                <div className="col-span-2"><Pill tone={quote.eligibleForRefund ? "green" : "amber"}>{quote.eligibleForRefund ? "Đủ điều kiện hoàn tiền" : "Không đủ điều kiện hoàn tiền"}</Pill></div>
              </dl>
            )}
          </Card>
        </div>
      )}

      {result && (
        <Card className="space-y-2 border-emerald-200 bg-emerald-50/50 text-xs dark:border-emerald-900">
          <p className="text-sm font-bold text-emerald-700">Đã hủy {result.reservationCode}</p>
          <p>Hoàn tiền: {vnd(result.refundAmount)} · trạng thái {result.refundStatus ?? "-"}</p>
          <a href="#hoan-tien" className={btnGhost}>Tạo / theo dõi yêu cầu hoàn tiền</a>
        </Card>
      )}

      <ReasonDialog
        isOpen={reasonOpen}
        title="Hủy đặt phòng"
        description={`Hủy đặt phòng ${reservation?.reservationCode ?? ""}. Khách sẽ được hoàn tiền theo chính sách khách sạn nếu đủ điều kiện.`}
        confirmText="Hủy đặt phòng"
        isLoading={cancelling}
        onConfirm={cancel}
        onClose={() => setReasonOpen(false)}
      />
    </div>
  );
}

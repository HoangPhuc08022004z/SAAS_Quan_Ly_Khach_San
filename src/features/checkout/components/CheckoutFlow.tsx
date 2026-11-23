"use client";

// API: GET .../check-out/reservations/{code}/balance, GET .../folio, POST .../balance-payment, POST .../confirm
//      (token nhân viên PMS; quyền CHECKOUT_VIEW / PAYMENT_CREATE / CHECKOUT_EXECUTE)
// Link thanh toán số dư: POST /api/public/reservations/{code}/payments/{paymentId}/checkout-session (công khai, cần email/SĐT của khách)
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, LogOut, Receipt, RefreshCw, CreditCard, CheckCircle2, ExternalLink } from "lucide-react";
import {
  checkOutApi,
  publicApi,
  type CheckoutBalance,
  type CheckoutFolio,
  type CheckoutBalancePayment,
  type CheckOutConfirmed,
} from "@/lib/api";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  Card, ErrorBox, Field, NoProperty, Pill, ReservationStatus, Spinner,
  btnGhost, btnPrimary, inputCls, usePmsProperty, vnd,
} from "@/features/pms-ops/ui";

export function CheckoutFlow() {
  const { propertyId } = usePmsProperty();
  const params = useSearchParams();
  const initial = params.get("code") || params.get("reservationCode") || "";

  const [code, setCode] = useState(initial);
  const [active, setActive] = useState("");
  const [balance, setBalance] = useState<CheckoutBalance | null>(null);
  const [folio, setFolio] = useState<CheckoutFolio | null>(null);
  const [folioError, setFolioError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payment, setPayment] = useState<CheckoutBalancePayment | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [contact, setContact] = useState("");
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<CheckOutConfirmed | null>(null);

  const load = useCallback(
    async (reservationCode: string) => {
      if (!propertyId || !reservationCode) return;
      setLoading(true);
      setError(null);
      setFolioError(null);
      try {
        const [b, f] = await Promise.allSettled([
          checkOutApi.balance(propertyId, reservationCode),
          checkOutApi.folio(propertyId, reservationCode),
        ]);
        if (b.status === "rejected") throw b.reason;
        setBalance(b.value);
        if (f.status === "fulfilled") setFolio(f.value);
        else {
          setFolio(null);
          setFolioError(f.reason?.message || "Không tải được folio.");
        }
      } catch (e: any) {
        setBalance(null);
        setFolio(null);
        setError(e?.message || "Không tải được số dư check-out.");
      } finally {
        setLoading(false);
      }
    },
    [propertyId]
  );

  useEffect(() => {
    if (initial && propertyId) {
      setActive(initial);
      void load(initial);
    }
  }, [initial, propertyId, load]);

  if (!propertyId) return <NoProperty />;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return setError("Nhập mã đặt phòng.");
    setActive(c);
    setPayment(null);
    setPayUrl(null);
    setDone(null);
    void load(c);
  };

  const createPayment = async () => {
    setCreatingPayment(true);
    try {
      const p = await checkOutApi.createBalancePayment(propertyId, active);
      setPayment(p);
      toast.success(p.reusedExistingAttempt ? "Dùng lại giao dịch thanh toán số dư đang chờ." : "Đã tạo giao dịch thanh toán số dư.");
    } catch (e: any) {
      toast.error(e?.message || "Không tạo được giao dịch thanh toán số dư.");
    } finally {
      setCreatingPayment(false);
    }
  };

  const createLink = async () => {
    if (!payment) return;
    const c = contact.trim();
    if (!c) return toast.error("Nhập email hoặc SĐT của khách để tạo link thanh toán.");
    setCreatingLink(true);
    try {
      const s = await publicApi.createCheckoutSession(active, payment.reservationPaymentId, c.includes("@") ? { email: c } : { phone: c });
      setPayUrl(s.checkoutUrl);
    } catch (e: any) {
      toast.error(e?.message || "Không tạo được link thanh toán.");
    } finally {
      setCreatingLink(false);
    }
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      const res = await checkOutApi.confirm(propertyId, active);
      setDone(res);
      toast.success(`Đã trả phòng cho đặt phòng ${res.reservationCode}.`);
      setConfirmOpen(false);
      void load(active);
    } catch (e: any) {
      toast.error(e?.message || "Không thể xác nhận check-out.");
      setConfirmOpen(false);
    } finally {
      setConfirming(false);
    }
  };

  const due = balance ? Number(balance.balanceDue) : 0;
  const over = balance ? Number(balance.overpaidAmount) : 0;
  const checkedIn = balance?.reservationStatus === "CHECKED_IN";
  const canConfirm = checkedIn && due <= 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <LogOut className="h-6 w-6 text-rose-500" /> Thủ tục trả phòng (Check-out)
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">Xem số dư và folio, thu số dư còn lại, rồi xác nhận trả phòng.</p>
      </div>

      <Card>
        <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Mã đặt phòng đang ở (CHECKED_IN)">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ví dụ: RSV-XXXXXX" className={inputCls} />
          </Field>
          <button type="submit" disabled={loading} className={btnPrimary}>
            <Search className="h-4 w-4" /> Xem số dư
          </button>
        </form>
      </Card>

      {loading && <Spinner label="Đang tải số dư..." />}
      <ErrorBox message={error} />

      {balance && (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{balance.reservationCode}</h3>
                <ReservationStatus status={balance.reservationStatus} />
              </div>
              <div className="flex gap-2">
                <Link href={`/pms/folio/${encodeURIComponent(balance.reservationCode)}`} className={btnGhost}>
                  <Receipt className="h-3.5 w-3.5" /> Chi tiết folio <ExternalLink className="h-3 w-3" />
                </Link>
                <button type="button" onClick={() => load(active)} disabled={loading} className={btnGhost}>
                  <RefreshCw className="h-3.5 w-3.5" /> Tải lại
                </button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <Stat label="Tiền phòng" value={vnd(balance.roomAmount)} />
              <Stat label="Folio (phát sinh)" value={vnd(balance.folioTotal)} />
              <Stat label="Tổng chi phí" value={vnd(balance.totalCharge)} strong />
              <Stat label="Đã thu" value={vnd(balance.totalCapturedAmount)} />
              <Stat label="Đã hoàn" value={vnd(balance.totalRefundedAmount)} />
              <Stat label="Hoàn đang chờ" value={vnd(balance.pendingRefundAmount)} />
              <Stat label="Thực thu (net)" value={vnd(balance.netPaidAmount)} strong />
              <Stat label="Thu dư" value={vnd(balance.overpaidAmount)} />
            </dl>

            <div
              className={`rounded-xl border p-4 ${
                due > 0 ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Số dư cần thanh toán (balanceDue)</p>
              <p className={`text-2xl font-black ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>{vnd(due)}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {due > 0
                  ? "Khách còn thiếu, cần thu trước khi xác nhận trả phòng."
                  : over > 0
                    ? `Khách đã trả dư ${vnd(over)}. Hoàn phần dư ở mục Hoàn tiền nếu cần.`
                    : "Đã tất toán, có thể xác nhận trả phòng."}
              </p>
            </div>
          </Card>

          {!checkedIn && !done && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Đặt phòng đang ở trạng thái "{balance.reservationStatus}". Chỉ đặt phòng CHECKED_IN mới trả phòng được.
            </p>
          )}

          {checkedIn && due > 0 && (
            <Card className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CreditCard className="h-4 w-4 text-blue-600" /> Thu số dư
              </h3>
              {!payment ? (
                <button type="button" onClick={createPayment} disabled={creatingPayment} className={btnPrimary}>
                  {creatingPayment ? "Đang tạo..." : `Tạo giao dịch thanh toán ${vnd(due)}`}
                </button>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="flex flex-wrap items-center gap-2">
                    Giao dịch #{payment.reservationPaymentId} · {vnd(payment.amount)} <Pill tone="amber">{payment.status}</Pill>
                    {payment.reusedExistingAttempt && <Pill tone="slate">dùng lại giao dịch đang chờ</Pill>}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Field label="Email hoặc SĐT của khách (để tạo link thanh toán Stripe)">
                      <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="khach@email.com" className={inputCls} />
                    </Field>
                    <button type="button" onClick={createLink} disabled={creatingLink} className={btnPrimary}>
                      {creatingLink ? "Đang tạo..." : "Tạo link thanh toán"}
                    </button>
                  </div>
                  {payUrl && (
                    <p className="break-all rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <a href={payUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline">{payUrl}</a>
                    </p>
                  )}
                  <p className="text-slate-400">Sau khi khách thanh toán xong, bấm "Tải lại" để cập nhật số dư.</p>
                </div>
              )}
            </Card>
          )}

          <div className="flex justify-end">
            <button type="button" disabled={!canConfirm || confirming} onClick={() => setConfirmOpen(true)} className={btnPrimary}>
              <CheckCircle2 className="h-4 w-4" /> Xác nhận trả phòng
            </button>
          </div>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bảng kê phát sinh (Folio)</h3>
            {folioError && <ErrorBox message={folioError} />}
            {folio && <FolioTable folio={folio} />}
          </Card>
        </>
      )}

      {done && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900">
          <p className="text-sm font-bold text-emerald-700">Trả phòng thành công · {done.reservationCode}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {done.rooms.map((r) => (
              <li key={r.roomId}>Phòng {r.roomNumber}: {r.previousStatus} → {r.currentStatus}</li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xác nhận trả phòng?"
        description={`Đặt phòng ${active} sẽ chuyển sang CHECKED_OUT và các phòng chuyển sang DIRTY. Thao tác không hoàn tác được.`}
        confirmText="Trả phòng"
        isLoading={confirming}
        onConfirm={confirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className={strong ? "text-sm font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

export function FolioTable({ folio }: { folio: CheckoutFolio }) {
  if (folio.items.length === 0) return <p className="text-xs text-slate-400">Chưa có khoản phát sinh nào.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-slate-400">
          <tr>
            <th className="py-2">#</th>
            <th>Dịch vụ</th>
            <th className="text-right">SL</th>
            <th className="text-right">Đơn giá</th>
            <th className="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {folio.items.map((i) => (
            <tr key={i.folioId}>
              <td className="py-2">{i.folioId}</td>
              <td>
                {i.service}
                {i.serviceData && <span className="block text-[11px] text-slate-400">{i.serviceData}</span>}
              </td>
              <td className="text-right">{i.quantity}</td>
              <td className="text-right">{vnd(i.unitPrice)}</td>
              <td className="text-right font-semibold">{vnd(i.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 dark:border-slate-700">
            <td colSpan={4} className="py-2 text-right font-bold">Tổng folio</td>
            <td className="text-right font-bold">{vnd(folio.folioTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

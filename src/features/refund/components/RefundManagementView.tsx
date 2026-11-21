"use client";

// API: POST .../reservations/{code}/refunds (REFUND_CREATE), GET .../refunds/{refundPaymentId} (REFUND_VIEW)
// Backend không có API liệt kê hoàn tiền → các mã hoàn tiền đã tạo được lưu cục bộ trên trình duyệt để theo dõi.
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Search, RefreshCw } from "lucide-react";
import {
  publicApi,
  reservationStaffApi,
  type ReservationDetail,
  type RefundStatus,
  type RefundRequestCreated,
} from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import {
  Card, ErrorBox, Field, NoProperty, Pill, Spinner,
  btnGhost, btnPrimary, inputCls, usePmsProperty, vnd,
} from "@/features/pms-ops/ui";

const STORE_KEY = "pms_refund_ids";
const readIds = (propertyId: string): number[] => {
  try {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return Array.isArray(all[propertyId]) ? all[propertyId] : [];
  } catch {
    return [];
  }
};
const writeIds = (propertyId: string, ids: number[]) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    all[propertyId] = ids;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    /* không lưu được thì bỏ qua */
  }
};

const refundTone = (s: string) =>
  (({ SUCCEEDED: "green", PENDING: "amber", PROCESSING: "blue", FAILED: "rose", REFUNDED: "green" }) as const)[s as "PENDING"] ?? "slate";

export function RefundManagementView() {
  const { propertyId } = usePmsProperty();
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<RefundRequestCreated | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [ids, setIds] = useState<number[]>([]);
  const [statuses, setStatuses] = useState<Record<number, RefundStatus | { error: string }>>({});
  const [manualId, setManualId] = useState("");

  const track = async (id: number) => {
    try {
      const s = await reservationStaffApi.refundStatus(propertyId, id);
      setStatuses((p) => ({ ...p, [id]: s }));
    } catch (e: any) {
      setStatuses((p) => ({ ...p, [id]: { error: e?.message || "Không tải được trạng thái." } }));
    }
  };

  useEffect(() => {
    if (!propertyId) return;
    const saved = readIds(propertyId);
    setIds(saved);
    saved.forEach((id) => void track(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  if (!propertyId) return <NoProperty />;

  const remember = (id: number) => {
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 30);
    setIds(next);
    writeIds(propertyId, next);
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = contact.trim();
    if (!code.trim() || !c) return setLookupError("Nhập mã đặt phòng và email hoặc SĐT của khách (để xem các khoản đã thanh toán).");
    setLooking(true);
    setLookupError(null);
    setReservation(null);
    setCreated(null);
    setPaymentId("");
    try {
      const res = await publicApi.getReservation(code.trim(), c.includes("@") ? { email: c } : { phone: c });
      setReservation(res);
      const first = res.payments.find((p) => p.status === "SUCCEEDED" && p.paymentType !== "REFUND");
      if (first) setPaymentId(String(first.reservationPaymentId));
    } catch (e: any) {
      setLookupError(e?.message || "Không tìm thấy đặt phòng.");
    } finally {
      setLooking(false);
    }
  };

  const createRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation || !paymentId) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await reservationStaffApi.createRefund(propertyId, reservation.reservationCode, {
        reservationPaymentId: Number(paymentId),
        reason: reason.trim() || undefined,
      });
      setCreated(res);
      remember(res.refundPaymentId);
      setStatuses((p) => ({ ...p, [res.refundPaymentId]: { ...res, paidAt: null } }));
      toast.success(`Đã tạo yêu cầu hoàn tiền #${res.refundPaymentId}.`);
    } catch (e: any) {
      setCreateError(e?.message || "Không tạo được yêu cầu hoàn tiền.");
    } finally {
      setCreating(false);
    }
  };

  const addManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(manualId)) return toast.error("Mã hoàn tiền là một số.");
    const id = Number(manualId);
    remember(id);
    setManualId("");
    await track(id);
  };

  const refundable = reservation?.payments.filter((p) => p.status === "SUCCEEDED" && p.paymentType !== "REFUND") ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><RotateCcw className="h-4 w-4 text-blue-600" /> Tạo yêu cầu hoàn tiền</h3>
          <form onSubmit={lookup} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Mã đặt phòng"><input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} /></Field>
            <Field label="Email hoặc SĐT khách"><input value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} /></Field>
            <button type="submit" disabled={looking} className={btnPrimary}><Search className="h-4 w-4" /> Xem</button>
          </form>
          {looking && <Spinner />}
          <ErrorBox message={lookupError} />

          {reservation && (
            <form onSubmit={createRefund} className="space-y-3">
              <p className="text-xs text-slate-500">
                {reservation.reservationCode} · {reservation.guest.fullName} · {reservation.status}
              </p>
              {refundable.length === 0 ? (
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Đặt phòng này chưa có khoản thanh toán thành công nào để hoàn.</p>
              ) : (
                <>
                  <Field label="Khoản thanh toán cần hoàn">
                    <select value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className={inputCls}>
                      {refundable.map((p) => (
                        <option key={p.reservationPaymentId} value={p.reservationPaymentId}>
                          #{p.reservationPaymentId} · {p.paymentType} · {vnd(p.amount)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Lý do (tùy chọn)"><input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={inputCls} /></Field>
                  <button type="submit" disabled={creating || !paymentId} className={btnPrimary}>{creating ? "Đang tạo..." : "Tạo yêu cầu hoàn tiền"}</button>
                </>
              )}
              <ErrorBox message={createError} />
              {created && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                  Đã tạo hoàn tiền #{created.refundPaymentId}: {vnd(created.amount)} · trạng thái {created.status}.
                </p>
              )}
            </form>
          )}
        </Card>

        <Card className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><RefreshCw className="h-4 w-4 text-blue-600" /> Theo dõi hoàn tiền</h3>
          <form onSubmit={addManual} className="flex gap-2">
            <input value={manualId} onChange={(e) => setManualId(e.target.value)} inputMode="numeric" placeholder="Nhập mã hoàn tiền để theo dõi" className={inputCls} />
            <button type="submit" className={btnGhost}>Thêm</button>
          </form>
          {ids.length === 0 && <p className="text-xs text-slate-400">Chưa có yêu cầu hoàn tiền nào được theo dõi trên trình duyệt này.</p>}
          <div className="space-y-2">
            {ids.map((id) => {
              const s = statuses[id];
              return (
                <div key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800">
                  <div>
                    <p className="font-bold">Hoàn tiền #{id}</p>
                    {!s ? <span className="text-slate-400">Đang tải...</span> : "error" in s ? (
                      <span className="text-rose-600">{s.error}</span>
                    ) : (
                      <span className="text-slate-500">{s.reservationCode} · {vnd(s.amount)}{s.paidAt && <> · <DateText date={s.paidAt} type="datetime" /></>}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s && !("error" in s) && <Pill tone={refundTone(s.status)}>{s.status}</Pill>}
                    <button type="button" onClick={() => track(id)} className={btnGhost}>Làm mới</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

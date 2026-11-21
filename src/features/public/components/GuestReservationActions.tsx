"use client";

// Hành động của khách trên đặt phòng (không cần đăng nhập, xác thực bằng email/SĐT của đặt phòng):
//  - Hủy đặt phòng: GET /api/public/reservations/{code}/refund-quote, POST /api/public/reservations/{code}/cancel
//  - Gọi món F&B:   GET /api/public/reservations/{code}/fnb-menu, POST /api/public/reservations/{code}/fnb-orders
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Loader2, UtensilsCrossed, Minus, Plus } from "lucide-react";
import {
  guestReservationApi,
  guestFnbApi,
  type GuestContact,
  type RefundQuote,
  type GuestFnbMenuItem,
  type FnbOrderResult,
} from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";

const inputClass =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

export function GuestCancelPanel({
  code,
  contact,
  onChanged,
}: {
  code: string;
  contact: GuestContact;
  onChanged: () => void;
}) {
  const [quote, setQuote] = useState<RefundQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    guestReservationApi
      .refundQuote(code, contact)
      .then((q) => alive && setQuote(q))
      .catch((e: any) => alive && setQuoteError(e?.message || "Không tính được số tiền hoàn."));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await guestReservationApi.cancel(code, { ...contact, reason: reason.trim() || undefined });
      toast.success(res.message || "Đã hủy đặt phòng.");
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || "Không hủy được đặt phòng.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/10">
      <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
        <Ban className="h-4 w-4 text-rose-600" /> Hủy đặt phòng
      </h3>
      {quoteError && <p className="text-rose-600">{quoteError}</p>}
      {quote && (
        <div className="space-y-1 text-slate-600 dark:text-slate-300">
          <p>
            Đã thanh toán: <MoneyText amount={quote.totalPaidAmount} className="font-bold" /> · Số tiền được hoàn nếu hủy bây giờ:{" "}
            <MoneyText amount={quote.refundableAmount} className="font-bold text-emerald-600" />
          </p>
          <p className="text-slate-400">
            Hủy miễn phí trước {quote.freeCancellationDays ?? "-"} ngày so với ngày nhận phòng
            {quote.daysBeforeCheckIn != null && <> (còn {quote.daysBeforeCheckIn} ngày)</>}.{" "}
            {quote.eligibleForRefund ? "Đủ điều kiện hoàn tiền." : "Không đủ điều kiện hoàn tiền theo chính sách khách sạn."}
          </p>
        </div>
      )}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700">
          Hủy đặt phòng này
        </button>
      ) : (
        <div className="space-y-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Lý do hủy (tùy chọn)" className={inputClass} />
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={cancel} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-50">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Xác nhận hủy
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Giữ đặt phòng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function GuestFnbPanel({ code, contact }: { code: string; contact: GuestContact }) {
  const [menu, setMenu] = useState<GuestFnbMenuItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [serviceTime, setServiceTime] = useState(() => toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FnbOrderResult | null>(null);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      setMenu(await guestFnbApi.menu(code, contact));
    } catch (e: any) {
      setMenu(null);
      setError(e?.message || "Không tải được thực đơn.");
    } finally {
      setLoading(false);
    }
  };

  const chosen = Object.entries(qty).filter(([, n]) => n > 0);
  const total = chosen.reduce((sum, [id, n]) => sum + (menu?.find((m) => m.menuId === Number(id))?.sellingPrice ?? 0) * n, 0);

  const order = async () => {
    if (chosen.length === 0) return toast.error("Chọn ít nhất một món.");
    if (!serviceTime) return toast.error("Chọn thời gian phục vụ.");
    setBusy(true);
    try {
      const res = await guestFnbApi.placeOrder(code, contact, {
        items: chosen.map(([id, n]) => ({ menuId: Number(id), quantity: n })),
        serviceTime: serviceTime.length === 16 ? `${serviceTime}:00` : serviceTime,
      });
      setResult(res);
      setQty({});
      toast.success(res.message || "Đã gửi yêu cầu gọi món.");
      void loadMenu();
    } catch (e: any) {
      toast.error(e?.message || "Không đặt được món.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/10">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <UtensilsCrossed className="h-4 w-4 text-amber-600" /> Gọi món (F&amp;B)
        </h3>
        <button type="button" onClick={loadMenu} disabled={loading} className="rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {loading ? "Đang tải..." : menu ? "Tải lại thực đơn" : "Xem thực đơn"}
        </button>
      </div>
      {error && <p className="text-rose-600">{error}</p>}
      {menu && menu.length === 0 && <p className="text-slate-400">Khách sạn hiện chưa có món nào để gọi.</p>}
      {menu && menu.length > 0 && (
        <>
          <div className="space-y-2">
            {menu.map((m) => (
              <div key={m.menuId} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 dark:bg-slate-900">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-slate-400">
                    <MoneyText amount={m.sellingPrice} /> · còn {m.availableQuantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Giảm" onClick={() => setQty((q) => ({ ...q, [m.menuId]: Math.max(0, (q[m.menuId] ?? 0) - 1) }))} className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold">{qty[m.menuId] ?? 0}</span>
                  <button
                    type="button"
                    aria-label="Tăng"
                    disabled={(qty[m.menuId] ?? 0) >= m.availableQuantity}
                    onClick={() => setQty((q) => ({ ...q, [m.menuId]: (q[m.menuId] ?? 0) + 1 }))}
                    className="rounded-lg bg-slate-100 p-1.5 disabled:opacity-40 dark:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">Thời gian phục vụ</span>
              <input type="datetime-local" value={serviceTime} onChange={(e) => setServiceTime(e.target.value)} className={inputClass} />
            </label>
            <button type="button" disabled={busy || chosen.length === 0} onClick={order} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Đặt món · <MoneyText amount={total} />
            </button>
          </div>
        </>
      )}
      {result && (
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
          <p className="font-bold">Đã ghi nhận · tổng <MoneyText amount={result.totalAmount} /></p>
          <ul className="mt-1 list-disc pl-4">
            {result.items.map((i) => (
              <li key={i.menuId}>{i.menuName} × {i.quantity}</li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] opacity-80">Khoản này được cộng vào hóa đơn lưu trú của bạn.</p>
        </div>
      )}
    </div>
  );
}

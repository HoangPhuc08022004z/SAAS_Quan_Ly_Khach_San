"use client";

// API (token nhân viên, role MANAGER): GET .../daily-statistics?fromDate=&toDate=,
//   PATCH .../daily-statistics/{businessDate} (điều chỉnh), POST .../daily-statistics/{businessDate}/confirm
// Báo cáo do scheduler tự sinh lúc 17:00 (giờ Việt Nam) ở trạng thái REVIEWING; đã CONFIRMED thì không sửa/xác nhận lại được (409).
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Moon, RefreshCw, Lock, AlertTriangle, CheckCircle2, Edit3 } from "lucide-react";
import { nightAuditApi, type DailyStatisticsReport, type AdjustDailyStatisticsInput } from "@/lib/api";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Card, ErrorBox, Field, NoProperty, Pill, Spinner, btnGhost, btnPrimary, inputCls, todayIso, usePmsProperty, vnd } from "@/features/pms-ops/ui";

type MetricKey = Exclude<keyof AdjustDailyStatisticsInput, "adjustmentReason">;

const METRICS: { key: MetricKey; label: string; money?: boolean }[] = [
  { key: "guestCount", label: "Số khách" },
  { key: "occupiedRoomCount", label: "Phòng có khách" },
  { key: "availableRoomCount", label: "Phòng trống" },
  { key: "successfulReservationCount", label: "Đặt phòng thành công" },
  { key: "noShowCount", label: "No-show" },
  { key: "cancelledReservationCount", label: "Đặt phòng đã hủy" },
  { key: "depositAmount", label: "Tiền cọc phải thu", money: true },
  { key: "depositCollected", label: "Tiền cọc đã thu", money: true },
  { key: "refundTotal", label: "Tổng hoàn tiền", money: true },
  { key: "expectedRoomRevenue", label: "Doanh thu phòng dự kiến", money: true },
  { key: "fnbRevenue", label: "Doanh thu F&B", money: true },
  { key: "fnbExpense", label: "Chi phí F&B", money: true },
];

export function NightAuditView() {
  const { propertyId } = usePmsProperty();
  const [from, setFrom] = useState(todayIso(-14));
  const [to, setTo] = useState(todayIso());
  const [list, setList] = useState<DailyStatisticsReport[] | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!propertyId) return;
    if (from > to) return setError("Từ ngày không được sau đến ngày.");
    setLoading(true);
    setError(null);
    try {
      const res = await nightAuditApi.list(propertyId, from, to);
      setList(res);
      setSelected((cur) => (res.some((r) => r.businessDate === cur) ? cur : res[0]?.businessDate ?? ""));
    } catch (e: any) {
      setList(null);
      setError(e?.message || "Không tải được báo cáo Night Audit.");
    } finally {
      setLoading(false);
    }
  }, [propertyId, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!propertyId) return <NoProperty />;

  const current = list?.find((r) => r.businessDate === selected);
  const confirmed = current?.status === "CONFIRMED";

  const replace = (r: DailyStatisticsReport) => setList((l) => l?.map((x) => (x.businessDate === r.businessDate ? r : x)) ?? l);

  const confirm = async () => {
    if (!current) return;
    setBusy(true);
    try {
      const res = await nightAuditApi.confirm(propertyId, current.businessDate);
      replace(res.dailyStatistics);
      toast.success(res.message || `Đã chốt số liệu ngày ${current.businessDate}.`);
      setConfirmOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Không thể xác nhận báo cáo.");
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Moon className="h-6 w-6 text-indigo-500" /> Kiểm toán đêm &amp; chốt ngày (Night Audit)
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Báo cáo được hệ thống tự tạo lúc 17:00 mỗi ngày (trạng thái REVIEWING). Manager đối soát, điều chỉnh nếu cần rồi xác nhận.
        </p>
      </div>

      <Card>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Từ ngày"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} /></Field>
          <Field label="Đến ngày"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} /></Field>
          <button type="button" onClick={load} disabled={loading} className={btnPrimary}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Tải báo cáo
          </button>
        </div>
      </Card>

      {loading && !list && <Spinner label="Đang tải báo cáo..." />}
      <ErrorBox message={error} />

      {list && list.length === 0 && (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-900">Không có báo cáo nào trong khoảng ngày này.</p>
      )}

      {list && list.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <Card className="space-y-1 p-3">
            {list.map((r) => (
              <button
                key={r.dailyStatisticsId}
                type="button"
                onClick={() => {
                  setSelected(r.businessDate);
                  setAdjusting(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                  r.businessDate === selected ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {r.businessDate}
                <Pill tone={r.status === "CONFIRMED" ? "green" : "amber"}>{r.status === "CONFIRMED" ? "Đã chốt" : "Chờ xác nhận"}</Pill>
              </button>
            ))}
          </Card>

          {current && (
            <div className="space-y-4">
              <Card className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Ngày nghiệp vụ {current.businessDate}</p>
                    {confirmed ? (
                      <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Lock className="h-3.5 w-3.5" /> Đã chốt{current.confirmedByName ? ` bởi ${current.confirmedByName}` : ""}
                        {current.confirmedAt ? ` lúc ${new Date(current.confirmedAt).toLocaleString("vi-VN")}` : ""}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" /> Đang chờ xác nhận (REVIEWING)
                      </p>
                    )}
                  </div>
                  {!confirmed && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setAdjusting((v) => !v)} className={btnGhost}>
                        <Edit3 className="h-3.5 w-3.5" /> Điều chỉnh số liệu
                      </button>
                      <button type="button" onClick={() => setConfirmOpen(true)} className={btnPrimary}>
                        <CheckCircle2 className="h-4 w-4" /> Chốt sổ ngày
                      </button>
                    </div>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  {METRICS.map((m) => (
                    <div key={m.key}>
                      <dt className="text-slate-400">{m.label}</dt>
                      <dd className="text-sm font-bold">{m.money ? vnd(current[m.key]) : current[m.key]}</dd>
                    </div>
                  ))}
                </dl>

                {current.adjustmentReason && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <b>Lý do điều chỉnh gần nhất:</b> {current.adjustmentReason}
                  </p>
                )}
              </Card>

              {adjusting && !confirmed && (
                <AdjustForm
                  key={current.businessDate}
                  report={current}
                  onCancel={() => setAdjusting(false)}
                  onSubmit={async (data) => {
                    const res = await nightAuditApi.adjust(propertyId, current.businessDate, data);
                    replace(res.dailyStatistics);
                    toast.success(res.message || "Đã điều chỉnh số liệu.");
                    setAdjusting(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`Chốt sổ Night Audit ngày ${current?.businessDate ?? ""}?`}
        description="Báo cáo chuyển sang CONFIRMED và không thể điều chỉnh hay xác nhận lại. Bạn có chắc chắn?"
        confirmText="Xác nhận chốt sổ"
        isLoading={busy}
        onConfirm={confirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function AdjustForm({
  report,
  onSubmit,
  onCancel,
}: {
  report: DailyStatisticsReport;
  onSubmit: (data: AdjustDailyStatisticsInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Partial<Record<MetricKey, string>>>({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: AdjustDailyStatisticsInput = { adjustmentReason: reason.trim() };
    let changed = 0;
    for (const m of METRICS) {
      const raw = values[m.key];
      if (raw === undefined || raw === "") continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return setError(`"${m.label}" phải là số không âm.`);
      if (n !== Number(report[m.key])) {
        data[m.key] = n;
        changed++;
      }
    }
    if (changed === 0) return setError("Chưa có chỉ số nào thay đổi.");
    if (!data.adjustmentReason) return setError("Nhập lý do điều chỉnh.");
    if (data.adjustmentReason.length > 2000) return setError("Lý do tối đa 2000 ký tự.");
    setSaving(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err?.message || "Không thể điều chỉnh số liệu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Điều chỉnh số liệu</h3>
        <p className="text-[11px] text-slate-400">Chỉ nhập các chỉ số cần sửa; ô để trống sẽ được giữ nguyên.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {METRICS.map((m) => (
            <Field key={m.key} label={m.label}>
              <input
                type="number"
                min={0}
                step={m.money ? "any" : 1}
                value={values[m.key] ?? ""}
                placeholder={String(report[m.key])}
                onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
        <Field label="Lý do điều chỉnh (bắt buộc)">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={2000} className={inputCls} />
        </Field>
        <ErrorBox message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={btnGhost}>Hủy</button>
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Đang lưu..." : "Lưu điều chỉnh"}</button>
        </div>
      </form>
    </Card>
  );
}

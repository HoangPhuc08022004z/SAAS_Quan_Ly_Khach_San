"use client";

// API (token Owner): GET /api/owner/daily-statistics?propertyId=&businessDate= | &fromDate=&toDate=
// Chỉ xem: việc điều chỉnh và xác nhận báo cáo do Manager của từng khách sạn thực hiện (Night Audit).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ownerStatisticsApi, propertyApi, type ApiProperty, type DailyStatisticsReport, type TenantDailyStatistics } from "@/lib/api";
import { Card, ErrorBox, Field, Pill, Spinner, btnPrimary, inputCls, todayIso, vnd } from "@/features/pms-ops/ui";

type Mode = "all" | "day" | "range";

export function OwnerReportsView() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [mode, setMode] = useState<Mode>("range");
  const [day, setDay] = useState(todayIso());
  const [from, setFrom] = useState(todayIso(-14));
  const [to, setTo] = useState(todayIso());
  const [data, setData] = useState<TenantDailyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.list().then(setProperties).catch(() => setProperties([]));
  }, []);

  const names = useMemo(() => Object.fromEntries(properties.map((p) => [String(p.propertyId), p.name])), [properties]);

  const load = useCallback(async () => {
    if (mode === "range" && from > to) return setError("Từ ngày không được sau đến ngày.");
    setLoading(true);
    setError(null);
    try {
      setData(
        await ownerStatisticsApi.view({
          propertyId: propertyId || undefined,
          ...(mode === "day" ? { businessDate: day } : mode === "range" ? { fromDate: from, toDate: to } : {}),
        })
      );
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Không tải được báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [mode, propertyId, day, from, to]);

  useEffect(() => {
    void load();
    // chỉ tải lần đầu; các lần sau bấm nút "Xem báo cáo"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows: DailyStatisticsReport[] = data?.dailyStatistics ?? [];
  const total = (k: "expectedRoomRevenue" | "fnbRevenue" | "depositCollected") => rows.reduce((n, r) => n + Number(r[k] ?? 0), 0);

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_auto] lg:items-end">
          <Field label="Khách sạn">
            <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls}>
              <option value="">Tất cả khách sạn</option>
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Lọc theo">
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={inputCls}>
              <option value="range">Khoảng ngày</option>
              <option value="day">Một ngày</option>
              <option value="all">Tất cả</option>
            </select>
          </Field>
          {mode === "range" && (
            <>
              <Field label="Từ ngày"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} /></Field>
              <Field label="Đến ngày"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} /></Field>
            </>
          )}
          {mode === "day" && (
            <Field label="Ngày nghiệp vụ"><input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} /></Field>
          )}
          <button type="button" onClick={load} disabled={loading} className={btnPrimary}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Xem báo cáo
          </button>
        </div>
      </Card>

      {loading && !data && <Spinner label="Đang tải báo cáo..." />}
      <ErrorBox message={error} />

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Summary label="Số báo cáo" value={String(data.totalReports)} />
            <Summary label="Doanh thu phòng dự kiến" value={vnd(total("expectedRoomRevenue"))} />
            <Summary label="Doanh thu F&B" value={vnd(total("fnbRevenue"))} />
            <Summary label="Cọc đã thu" value={vnd(total("depositCollected"))} />
          </div>

          <Card className="overflow-x-auto p-0">
            {rows.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Không có báo cáo nào khớp bộ lọc.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60">
                  <tr>
                    {["Ngày", "Khách sạn", "Khách", "Phòng có khách / trống", "Đặt thành công", "No-show / Hủy", "Cọc thu", "Hoàn", "Phòng", "F&B (thu − chi)", "Trạng thái"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2.5 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((r) => (
                    <tr key={r.dailyStatisticsId}>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.businessDate}</td>
                      <td className="px-3 py-2.5">{names[String(r.propertyId)] ?? `#${r.propertyId}`}</td>
                      <td className="px-3 py-2.5">{r.guestCount}</td>
                      <td className="px-3 py-2.5">{r.occupiedRoomCount} / {r.availableRoomCount}</td>
                      <td className="px-3 py-2.5">{r.successfulReservationCount}</td>
                      <td className="px-3 py-2.5">{r.noShowCount} / {r.cancelledReservationCount}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{vnd(r.depositCollected)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{vnd(r.refundTotal)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{vnd(r.expectedRoomRevenue)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{vnd(r.fnbRevenue)} − {vnd(r.fnbExpense)}</td>
                      <td className="px-3 py-2.5" title={r.adjustmentReason ?? undefined}>
                        <Pill tone={r.status === "CONFIRMED" ? "green" : "amber"}>{r.status === "CONFIRMED" ? "Đã chốt" : "Chờ xác nhận"}</Pill>
                        {r.adjustmentReason && <span className="ml-1 text-[10px] text-slate-400">có điều chỉnh</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </Card>
  );
}

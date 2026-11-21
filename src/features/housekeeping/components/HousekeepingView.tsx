"use client";

// API: GET .../housekeeping/schedule?date=, PATCH .../housekeeping/rooms/{roomId}/status  (token nhân viên, role HOUSEKEEPER)
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Sparkles, RefreshCw, TriangleAlert } from "lucide-react";
import { housekeepingApi, type HousekeepingSchedule, type HousekeepingRoomStatus } from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import {
  Card, ErrorBox, Field, NoProperty, Pill, ReservationStatus, Spinner,
  btnGhost, inputCls, todayIso, usePmsProperty,
} from "@/features/pms-ops/ui";

const STATUS_BUTTONS: { value: HousekeepingRoomStatus; label: string; cls: string }[] = [
  { value: "DIRTY", label: "Bẩn", cls: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
  { value: "CLEANING", label: "Đang dọn", cls: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  { value: "READY", label: "Sẵn sàng", cls: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
];

export function HousekeepingView() {
  const { propertyId } = usePmsProperty();
  const [date, setDate] = useState(todayIso());
  const [data, setData] = useState<HousekeepingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [roomState, setRoomState] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await housekeepingApi.schedule(propertyId, date));
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Không tải được lịch buồng phòng.");
    } finally {
      setLoading(false);
    }
  }, [propertyId, date]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!propertyId) return <NoProperty />;

  const setStatus = async (roomId: number, status: HousekeepingRoomStatus) => {
    setBusy(roomId);
    try {
      const res = await housekeepingApi.updateRoomStatus(propertyId, roomId, status);
      setRoomState((s) => ({ ...s, [roomId]: res.currentStatus }));
      toast.success(`Phòng ${res.roomNumber}: ${res.previousStatus} → ${res.currentStatus}`);
    } catch (e: any) {
      toast.error(e?.message || "Không đổi được trạng thái phòng.");
    } finally {
      setBusy(null);
    }
  };

  const items = [...(data?.items ?? [])].sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber));

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Field label="Ngày làm việc">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} w-48`} />
          </Field>
          <div className="flex gap-2">
            <button type="button" onClick={load} className={btnGhost}>
              <RefreshCw className="h-3.5 w-3.5" /> Tải lại
            </button>
            <Link href="/pms/housekeeping/issues" className={btnGhost}>
              <TriangleAlert className="h-3.5 w-3.5" /> Sự cố phòng
            </Link>
          </div>
        </div>
      </Card>

      {loading && <Spinner label="Đang tải lịch buồng phòng..." />}
      <ErrorBox message={error} />

      {!loading && !error && (
        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-blue-600" /> Công việc ngày <DateText date={date} /> ({items.length})
          </h3>
          {items.length === 0 && <p className="text-xs text-slate-400">Không có công việc buồng phòng nào trong ngày này.</p>}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((w) => (
              <div key={`${w.reservationId}-${w.roomId}-${w.taskType}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Phòng {w.roomNumber} <span className="font-normal text-slate-400">· tầng {w.floor}</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-slate-500">
                    <Pill tone="blue">{w.taskType}</Pill>
                    <span>{w.reservationCode}</span>
                    <ReservationStatus status={w.reservationStatus} />
                    <span><DateText date={w.checkInDate} /> → <DateText date={w.checkOutDate} /></span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {roomState[w.roomId] && <Pill tone="slate">Hiện tại: {roomState[w.roomId]}</Pill>}
                  {STATUS_BUTTONS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      disabled={busy === w.roomId}
                      onClick={() => setStatus(w.roomId, b.value)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${b.cls}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

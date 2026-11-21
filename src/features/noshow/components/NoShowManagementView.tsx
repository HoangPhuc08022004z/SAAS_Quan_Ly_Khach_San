"use client";

// API: GET .../reservations/no-show, POST .../reservations/{code}/no-show/notify, POST .../no-show/confirm
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, UserX, RefreshCw } from "lucide-react";
import { noShowApi, type NoShowTracking, type NoShowItem } from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Card, ErrorBox, NoProperty, ReservationStatus, Spinner, btnDanger, btnGhost, usePmsProperty } from "@/features/pms-ops/ui";

export function NoShowManagementView() {
  const { propertyId } = usePmsProperty();
  const [data, setData] = useState<NoShowTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [target, setTarget] = useState<NoShowItem | null>(null);
  const [notified, setNotified] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await noShowApi.tracking(propertyId));
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Không tải được danh sách no-show.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!propertyId) return <NoProperty />;

  const notify = async (r: NoShowItem) => {
    setBusy(r.reservationCode);
    try {
      const res = await noShowApi.notify(propertyId, r.reservationCode);
      setNotified((n) => ({ ...n, [r.reservationCode]: res.sentAt }));
      toast.success(res.message || `Đã gửi thông báo tới ${res.guestEmail ?? "khách"}.`);
    } catch (e: any) {
      toast.error(e?.message || "Không gửi được thông báo.");
    } finally {
      setBusy(null);
    }
  };

  const confirm = async () => {
    if (!target) return;
    setBusy(target.reservationCode);
    try {
      const res = await noShowApi.confirm(propertyId, target.reservationCode);
      toast.success(res.message || `Đã xác nhận no-show: ${res.previousStatus} → ${res.currentStatus}.`);
      setTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Không xác nhận được no-show.");
      setTarget(null);
    } finally {
      setBusy(null);
    }
  };

  const list = data?.reservations ?? [];

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Các đặt phòng quá giờ nhận phòng dự kiến mà khách chưa đến.
          {data?.checkedAt && <> Kiểm tra lúc <DateText date={data.checkedAt} type="datetime" />.</>}
        </p>
        <button type="button" onClick={load} className={btnGhost}><RefreshCw className="h-3.5 w-3.5" /> Tải lại</button>
      </Card>

      {loading && <Spinner label="Đang kiểm tra no-show..." />}
      <ErrorBox message={error} />

      {!loading && !error && (
        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold"><UserX className="h-4 w-4 text-rose-600" /> Ứng viên no-show ({list.length})</h3>
          {list.length === 0 && <p className="text-xs text-slate-400">Hiện không có đặt phòng nào quá hạn nhận phòng.</p>}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((r) => (
              <div key={r.reservationId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">{r.reservationCode} · {r.guestName}</p>
                  <p className="flex flex-wrap items-center gap-2 text-slate-500">
                    <ReservationStatus status={r.status} />
                    <span>{r.guestEmail || "chưa có email"}</span>
                    <span><DateText date={r.checkInDate} /> → <DateText date={r.checkOutDate} /></span>
                    {r.expectedCheckInAt && <span>Dự kiến đến: <DateText date={r.expectedCheckInAt} type="datetime" /></span>}
                  </p>
                  {notified[r.reservationCode] && <p className="text-emerald-600">Đã gửi thông báo lúc <DateText date={notified[r.reservationCode]} type="datetime" /></p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={busy === r.reservationCode} onClick={() => notify(r)} className={btnGhost}><Mail className="h-3.5 w-3.5" /> Gửi thông báo</button>
                  <button type="button" disabled={busy === r.reservationCode} onClick={() => setTarget(r)} className={btnDanger}>Xác nhận no-show</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!target}
        title="Xác nhận khách no-show?"
        description={`Đặt phòng ${target?.reservationCode ?? ""} sẽ chuyển sang NO_SHOW và phòng được giải phóng theo chính sách khách sạn. Thao tác không hoàn tác.`}
        confirmText="Xác nhận no-show"
        variant="destructive"
        isLoading={!!busy}
        onConfirm={confirm}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}

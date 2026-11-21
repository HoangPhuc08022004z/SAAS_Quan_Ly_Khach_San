"use client";

// API: GET .../housekeeping/issues, POST .../housekeeping/rooms/{roomId}/issues, PATCH .../issues/{issueId}/resolution
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, TriangleAlert, CheckCircle2 } from "lucide-react";
import { housekeepingApi, publicApi, type HousekeepingIssue } from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import {
  Card, ErrorBox, Field, NoProperty, Pill, Spinner,
  btnGhost, btnPrimary, inputCls, todayIso, usePmsProperty,
} from "@/features/pms-ops/ui";

type RoomOption = { roomId: number; label: string };

export function HousekeepingIssuesView() {
  const { propertyId } = usePmsProperty();
  const [issues, setIssues] = useState<HousekeepingIssue[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      setIssues(await housekeepingApi.issues(propertyId));
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách sự cố.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Nhân viên không gọi được API danh sách phòng của Owner → lấy phòng từ lịch buồng phòng hôm nay + phòng trống công khai
  useEffect(() => {
    if (!propertyId) return;
    const map = new Map<number, RoomOption>();
    const add = (id: number, label: string) => map.set(id, { roomId: id, label });
    Promise.allSettled([
      housekeepingApi.schedule(propertyId, todayIso()).then((s) => s.items.forEach((i) => add(i.roomId, `Phòng ${i.roomNumber} · tầng ${i.floor}`))),
      publicApi
        .availableRooms(propertyId, { checkInDate: todayIso(), checkOutDate: todayIso(1), guestCount: 1 })
        .then((r) => r.roomTypes.forEach((t) => t.rooms.forEach((x) => add(x.roomId, `Phòng ${x.roomNumber} · tầng ${x.floor} (${t.name})`)))),
    ]).then(() => setRooms([...map.values()].sort((a, b) => a.label.localeCompare(b.label))));
  }, [propertyId]);

  const open = useMemo(() => issues.filter((i) => !i.resolution), [issues]);
  const closed = useMemo(() => issues.filter((i) => !!i.resolution), [issues]);

  if (!propertyId) return <NoProperty />;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(roomId)) return toast.error("Chọn phòng hoặc nhập mã phòng (roomId) là một số.");
    if (!text.trim()) return toast.error("Nhập mô tả sự cố.");
    setSaving(true);
    try {
      const created = await housekeepingApi.createIssue(propertyId, roomId, text.trim());
      setIssues((p) => [created, ...p]);
      setText("");
      toast.success(`Đã ghi nhận sự cố phòng ${created.roomNumber}.`);
    } catch (err: any) {
      toast.error(err?.message || "Không tạo được sự cố.");
    } finally {
      setSaving(false);
    }
  };

  const resolve = async (issueId: number) => {
    if (!resolutionText.trim()) return toast.error("Nhập cách xử lý.");
    try {
      const updated = await housekeepingApi.resolveIssue(propertyId, issueId, resolutionText.trim());
      setIssues((p) => p.map((i) => (i.issueId === issueId ? updated : i)));
      setResolving(null);
      setResolutionText("");
      toast.success("Đã đánh dấu đã xử lý.");
    } catch (err: any) {
      toast.error(err?.message || "Không cập nhật được cách xử lý.");
    }
  };

  const row = (i: HousekeepingIssue) => (
    <div key={i.issueId} className="space-y-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-slate-900 dark:text-white">Phòng {i.roomNumber}</p>
        <span className="text-slate-400">{i.createdByName} · <DateText date={i.createdAt} type="datetime" /></span>
      </div>
      <p>{i.issue}</p>
      {i.resolution ? (
        <p className="rounded-lg bg-emerald-50 p-2 text-emerald-800"><b>Đã xử lý:</b> {i.resolution}</p>
      ) : resolving === i.issueId ? (
        <div className="flex gap-2">
          <input value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} placeholder="Cách xử lý..." className={inputCls} />
          <button type="button" onClick={() => resolve(i.issueId)} className={btnPrimary}>Lưu</button>
          <button type="button" onClick={() => setResolving(null)} className={btnGhost}>Hủy</button>
        </div>
      ) : (
        <button type="button" onClick={() => { setResolving(i.issueId); setResolutionText(""); }} className={btnGhost}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Đánh dấu đã xử lý
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <Field label="Phòng" hint={rooms.length ? undefined : "Chưa lấy được danh sách phòng — nhập mã phòng (roomId)."}>
            {rooms.length ? (
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={inputCls}>
                <option value="">Chọn phòng...</option>
                {rooms.map((r) => <option key={r.roomId} value={r.roomId}>{r.label}</option>)}
              </select>
            ) : (
              <input value={roomId} onChange={(e) => setRoomId(e.target.value)} inputMode="numeric" placeholder="roomId" className={inputCls} />
            )}
          </Field>
          <Field label="Mô tả sự cố">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} placeholder="Ví dụ: Vòi sen bị rò nước" className={inputCls} />
          </Field>
          <button type="submit" disabled={saving} className={btnPrimary}><Plus className="h-4 w-4" /> Ghi nhận</button>
        </form>
      </Card>

      {loading && <Spinner label="Đang tải sự cố..." />}
      <ErrorBox message={error} />

      {!loading && !error && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold"><TriangleAlert className="h-4 w-4 text-amber-600" /> Đang chờ xử lý <Pill tone="amber">{open.length}</Pill></h3>
            {open.length === 0 && <p className="text-xs text-slate-400">Không có sự cố nào đang mở.</p>}
            {open.map(row)}
          </Card>
          <Card className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Đã xử lý <Pill tone="green">{closed.length}</Pill></h3>
            {closed.length === 0 && <p className="text-xs text-slate-400">Chưa có sự cố nào được xử lý.</p>}
            {closed.map(row)}
          </Card>
        </div>
      )}
    </div>
  );
}

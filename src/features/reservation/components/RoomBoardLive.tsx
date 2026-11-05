"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, X, Info, BedDouble, Users, Layers } from "lucide-react";
import { publicApi, roomApi, roomTypeApi, type AvailableRoomsResponse } from "@/lib/api";
import type { ApiRoomType, RoomConfiguration } from "@/lib/api/property-api";
import { useSession } from "@/lib/auth/use-session";

type RoomState = "FREE" | "BOOKED" | "NOT_READY";

interface BoardRoom {
  roomId: number;
  roomNumber: string;
  floor: number;
  roomTypeId: number;
  typeName: string;
  state: RoomState;
  configStatus?: string;
  description?: string | null;
  typeDescription?: string | null;
  capacity?: number;
  bedType?: string;
  numberOfBeds?: number;
  image?: string | null;
  rates: { rateName: string; price: number }[];
}

type TypeInfo = Pick<BoardRoom, "typeDescription" | "capacity" | "bedType" | "numberOfBeds" | "image" | "rates"> & { name: string };

const STATE_META: Record<RoomState, { label: string; cls: string }> = {
  FREE: { label: "Còn trống", cls: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  BOOKED: { label: "Đã có đặt", cls: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  NOT_READY: { label: "Chưa sẵn sàng", cls: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDay = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;

/**
 * Sơ đồ phòng từ API thật:
 *  - GET /api/public/properties/{id}/available-rooms  → phòng còn trống theo đêm (mọi tài khoản)
 *  - GET /api/properties/{id}/rooms/configuration     → danh sách đầy đủ + trạng thái phòng (chỉ Owner; nhân viên bị 403)
 */
export function RoomBoardLive() {
  const { currentPropertyId, property } = useSession();
  const propertyId = currentPropertyId || property?.id || "";
  const [date, setDate] = useState(iso(new Date()));
  const [typeFilter, setTypeFilter] = useState<number | "ALL">("ALL");
  const [selected, setSelected] = useState<BoardRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avail, setAvail] = useState<AvailableRoomsResponse | null>(null);
  const [config, setConfig] = useState<RoomConfiguration | null>(null);
  const [typeList, setTypeList] = useState<ApiRoomType[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      setError("Chưa xác định khách sạn của tài khoản. Vui lòng đăng nhập lại.");
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [a, c, t] = await Promise.all([
          publicApi.availableRooms(propertyId, { checkInDate: date, checkOutDate: addDay(date, 1), guestCount: 1 }),
          roomApi.configuration(propertyId).catch(() => null),
          roomTypeApi.list(propertyId).catch(() => [] as ApiRoomType[]),
        ]);
        if (!alive) return;
        setAvail(a);
        setConfig(c);
        setTypeList(t);
      } catch (err: any) {
        if (alive) setError(err?.message || "Không tải được sơ đồ phòng.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [propertyId, date, tick]);

  const rooms: BoardRoom[] = useMemo(() => {
    if (!avail) return [];
    // Thông tin loại phòng: ưu tiên API tìm phòng trống; bổ sung từ danh sách loại phòng (Owner) cho loại không còn phòng trống
    const info = new Map<number, TypeInfo>();
    typeList.forEach((t) =>
      info.set(t.roomTypeId, { name: t.name, typeDescription: t.description, capacity: t.capacity, bedType: t.bedType, numberOfBeds: t.numberOfBeds, image: t.image, rates: [] })
    );
    avail.roomTypes.forEach((t) =>
      info.set(t.roomTypeId, {
        name: t.name,
        typeDescription: t.description,
        capacity: t.capacity,
        bedType: t.bedType,
        numberOfBeds: t.numberOfBeds,
        image: t.image,
        rates: t.roomRates.map((r) => ({ rateName: r.rateName, price: r.price })),
      })
    );

    const freeIds = new Set<number>();
    const freeRooms: BoardRoom[] = [];
    avail.roomTypes.forEach((t) =>
      t.rooms.forEach((r) => {
        freeIds.add(r.roomId);
        freeRooms.push({ roomId: r.roomId, roomNumber: r.roomNumber, floor: r.floor, roomTypeId: t.roomTypeId, typeName: t.name, state: "FREE", description: r.description, ...info.get(t.roomTypeId)! });
      })
    );
    // Không đọc được cấu hình (nhân viên): chỉ biết các phòng còn trống
    if (!config) return freeRooms;
    const typeName = new Map(config.roomTypes.map((t) => [t.roomTypeId, t.name as string]));
    return config.rooms.map((r) => {
      const ready = r.isAvailable && /READY/i.test(r.status);
      const state: RoomState = !ready ? "NOT_READY" : freeIds.has(r.roomId) ? "FREE" : "BOOKED";
      const t = info.get(r.roomTypeId);
      return {
        roomId: r.roomId,
        roomNumber: r.roomNumber,
        floor: r.floor,
        roomTypeId: r.roomTypeId,
        state,
        configStatus: r.status,
        description: r.description,
        rates: [],
        ...t,
        typeName: t?.name ?? typeName.get(r.roomTypeId) ?? `Loại ${r.roomTypeId}`,
      };
    });
  }, [avail, config, typeList]);

  const types = useMemo(() => {
    const m = new Map<number, string>();
    rooms.forEach((r) => m.set(r.roomTypeId, r.typeName));
    return [...m.entries()];
  }, [rooms]);

  const shown = rooms.filter((r) => typeFilter === "ALL" || r.roomTypeId === typeFilter);
  const floors = [...new Set(shown.map((r) => r.floor))].sort((a, b) => a - b);
  const count = (s: RoomState) => shown.filter((r) => r.state === s).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Đêm lưu trú (ngày nhận phòng)</span>
          <input
            type="date"
            value={date}
            min={iso(new Date())}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="block px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Loại phòng</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="block px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="ALL">Tất cả</option>
            {types.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
        <div className="ml-auto flex flex-wrap gap-2 text-[11px] font-semibold">
          {(Object.keys(STATE_META) as RoomState[]).map((s) => (
            <span key={s} className={`px-2 py-1 rounded-lg border ${STATE_META[s].cls}`}>
              {STATE_META[s].label}: {config || s === "FREE" ? count(s) : "—"}
            </span>
          ))}
        </div>
      </div>

      {!loading && !error && !config && (
        <div className="flex gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Backend chưa có API danh sách phòng và trạng thái phòng cho nhân viên, nên sơ đồ chỉ hiện các phòng <b>còn trống</b> trong đêm đã chọn
            (từ API tìm phòng trống). Phòng đã có đặt hoặc chưa sẵn sàng không được liệt kê. Chủ khách sạn xem được đầy đủ ở cổng Owner.
          </p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Đang tải sơ đồ phòng...
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
          {error}
        </div>
      ) : shown.length === 0 ? (
        <p className="p-8 text-center text-xs text-slate-400">Không có phòng nào trong đêm này.</p>
      ) : (
        <div className="space-y-5">
          {floors.map((fl) => (
            <div key={fl} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="mb-3 text-xs font-bold text-slate-500">Tầng {fl}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {shown
                  .filter((r) => r.floor === fl)
                  .map((r) => (
                    <button
                      key={r.roomId}
                      onClick={() => setSelected(r)}
                      className={`text-left rounded-xl border p-3 space-y-1.5 transition-shadow hover:shadow-md ${STATE_META[r.state].cls}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-base font-black leading-none">{r.roomNumber}</span>
                        <span className="text-[10px] font-bold uppercase">{STATE_META[r.state].label}</span>
                      </div>
                      <div className="text-[11px] font-semibold">{r.typeName} · Tầng {r.floor}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] opacity-90">
                        {r.bedType && <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" />{r.numberOfBeds ?? 1} {r.bedType}</span>}
                        {r.capacity != null && <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{r.capacity} khách</span>}
                      </div>
                      {r.rates.length > 0 && (
                        <div className="text-[10px] opacity-90">
                          {r.rates.map((x) => (
                            <div key={x.rateName}>{x.rateName.replace("_RATE", "")}: <b>{vnd(x.price)}</b></div>
                          ))}
                        </div>
                      )}
                      {r.description && <div className="text-[10px] italic opacity-80 line-clamp-2">{r.description}</div>}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Phòng {selected.roomNumber} · Tầng {selected.floor}</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {selected.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image} alt={selected.typeName} className="w-full h-36 object-cover rounded-2xl" />
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p>Loại phòng<br /><b>{selected.typeName}</b></p>
              <p>Tầng<br /><b className="inline-flex items-center gap-1"><Layers className="w-3 h-3" />{selected.floor}</b></p>
              <p>Giường<br /><b>{selected.bedType ? `${selected.numberOfBeds ?? 1} ${selected.bedType}` : "—"}</b></p>
              <p>Sức chứa<br /><b>{selected.capacity != null ? `${selected.capacity} khách` : "—"}</b></p>
              <p>Đêm {date}<br /><b>{STATE_META[selected.state].label}</b></p>
              <p>Trạng thái cấu hình<br /><b>{selected.configStatus ?? "Chỉ Owner xem được"}</b></p>
            </div>
            {selected.typeDescription && <p><span className="font-semibold">Mô tả loại phòng:</span> {selected.typeDescription}</p>}
            {selected.description && <p><span className="font-semibold">Ghi chú phòng:</span> {selected.description}</p>}
            {selected.rates.length > 0 && (
              <div>
                <p className="font-semibold">Giá niêm yết</p>
                <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                  {selected.rates.map((r) => (
                    <li key={r.rateName}>{r.rateName}: {vnd(r.price)}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[11px] text-slate-400">Backend chưa có API đổi trạng thái buồng phòng cho nhân viên nên màn này chỉ để xem.</p>
          </div>
        </div>
      )}
    </div>
  );
}

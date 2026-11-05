"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Loader2, BedDouble, Users, DoorOpen, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { NumberInput } from "@/components/forms/NumberInput";
import { publicApi, type AvailableRoomsResponse } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const nightsBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;

/** Tìm phòng trống — GET /api/public/properties/{propertyId}/available-rooms */
export function AvailabilitySearch() {
  const { currentPropertyId, property } = useSession();
  const propertyId = currentPropertyId || property?.id || "";
  const today = iso(new Date());

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(shift(today, 1));
  const [guestCount, setGuestCount] = useState(1);
  const [typeId, setTypeId] = useState<number | "ALL">("ALL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailableRoomsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (v && checkOut <= v) setCheckOut(shift(v, 1));
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return toast.error("Chưa xác định khách sạn của tài khoản. Vui lòng đăng nhập lại.");
    if (!checkIn || !checkOut) return toast.error("Vui lòng chọn ngày nhận và trả phòng.");
    if (checkIn < today) return toast.error("Ngày nhận phòng không được ở quá khứ.");
    if (checkOut <= checkIn) return toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
    if (guestCount < 1) return toast.error("Số khách phải lớn hơn 0.");

    setLoading(true);
    setError(null);
    try {
      const res = await publicApi.availableRooms(propertyId, { checkInDate: checkIn, checkOutDate: checkOut, guestCount });
      setResult(res);
      setTypeId("ALL");
    } catch (err: any) {
      setResult(null);
      setError(err?.message || "Không tìm được phòng trống.");
    } finally {
      setLoading(false);
    }
  };

  const nights = result ? nightsBetween(result.checkInDate, result.checkOutDate) : 0;
  const types = result?.roomTypes.filter((t) => typeId === "ALL" || t.roomTypeId === typeId) ?? [];
  const totalFree = result?.roomTypes.reduce((n, t) => n + t.availableRoomCount, 0) ?? 0;
  const inputCls = "block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Ngày nhận phòng</span>
          <input type="date" value={checkIn} min={today} onChange={(e) => onCheckIn(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Ngày trả phòng</span>
          <input type="date" value={checkOut} min={shift(checkIn || today, 1)} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Số khách</span>
          <NumberInput value={guestCount} onValueChange={setGuestCount} emptyValue={0} min={1} className={inputCls} />
        </label>
        <div className="text-xs text-slate-500 pb-2">
          {checkIn && checkOut && checkOut > checkIn ? `${nightsBetween(checkIn, checkOut)} đêm` : "—"}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Tìm phòng trống
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">{error}</div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              <b>{result.propertyName}</b> · {result.checkInDate} → {result.checkOutDate} ({nights} đêm) · {result.guestCount} khách ·{" "}
              <b>{totalFree}</b> phòng trống
            </p>
            {result.roomTypes.length > 1 && (
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                className="ml-auto px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="ALL">Tất cả loại phòng</option>
                {result.roomTypes.map((t) => (
                  <option key={t.roomTypeId} value={t.roomTypeId}>{t.name}</option>
                ))}
              </select>
            )}
            <Link
              href={`/p/${result.propertyId}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
            >
              Đặt phòng cho khách <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {types.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">Không còn phòng trống phù hợp trong khoảng ngày này.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {types.map((t) => (
                <div key={t.roomTypeId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  {t.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt={t.name} className="h-36 w-full object-cover" />
                  )}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                        {t.description && <p className="text-slate-500">{t.description}</p>}
                      </div>
                      <span className="shrink-0 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300">
                        Còn {t.availableRoomCount} phòng
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{t.numberOfBeds} {t.bedType}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />Tối đa {t.capacity} khách</span>
                      {t.minimumRoomsRequired > 1 && <span>Cần đặt tối thiểu {t.minimumRoomsRequired} phòng</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">Giá mỗi đêm</p>
                      <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                        {t.roomRates.map((r) => (
                          <li key={r.roomRateId}>
                            {r.rateName}: <b>{vnd(r.price)}</b>
                            {r.description ? <span className="text-slate-400"> — {r.description}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" />Phòng trống</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {t.rooms.map((r) => (
                          <span key={r.roomId} title={r.description ?? undefined} className="px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {r.roomNumber} · T{r.floor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

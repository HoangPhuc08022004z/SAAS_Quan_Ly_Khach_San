"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hotel, Search, ArrowRight, Loader2, CalendarSearch, BedDouble } from "lucide-react";
import { publicApi, type AvailableRoomsResponse } from "@/lib/api";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
const inputCls =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

type Featured = { id: string; data?: AvailableRoomsResponse; error?: string };

/** Khách sạn nổi bật: tên, số phòng trống và giá thấp nhất hôm nay đọc từ GET /api/public/properties/{id}/available-rooms */
function FeaturedHotels({ ids }: { ids: string[] }) {
  const [items, setItems] = useState<Featured[]>(ids.map((id) => ({ id })));
  const [loading, setLoading] = useState(ids.length > 0);

  useEffect(() => {
    if (ids.length === 0) return;
    let alive = true;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    Promise.all(
      ids.map((id) =>
        publicApi
          .availableRooms(id, { checkInDate: iso(today), checkOutDate: iso(tomorrow), guestCount: 1 })
          .then((data): Featured => ({ id, data }))
          .catch((e: any): Featured => ({ id, error: e?.message || "Không tải được." }))
      )
    ).then((res) => {
      if (alive) {
        setItems(res);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ids.length === 0) return null;
  if (loading)
    return (
      <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải khách sạn...
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map(({ id, data, error }) => {
        const free = data?.roomTypes.reduce((n, t) => n + t.availableRoomCount, 0) ?? 0;
        const prices = data?.roomTypes.flatMap((t) => t.roomRates.map((r) => Number(r.price))) ?? [];
        const image = data?.roomTypes.find((t) => t.image)?.image;
        return (
          <div key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="aspect-video bg-slate-100 dark:bg-slate-800">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={data?.propertyName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300"><Hotel className="w-10 h-10" /></div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{data?.propertyName ?? `Khách sạn #${id}`}</h3>
              {error ? (
                <p className="text-xs text-rose-600">{error}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  {free > 0 ? `Hôm nay còn ${free} phòng` : "Hôm nay đã hết phòng"}
                  {prices.length > 0 && <> · từ <b>{vnd(Math.min(...prices))}</b>/đêm</>}
                </p>
              )}
              <Link href={`/p/${id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                Tìm phòng &amp; đặt ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CustomerPortal({ featuredIds }: { featuredIds: string[] }) {
  const router = useRouter();
  const [hotelCode, setHotelCode] = useState("");
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);

  const goHotel = (e: React.FormEvent) => {
    e.preventDefault();
    const id = hotelCode.trim().replace(/^#/, "");
    if (!/^\d+$/.test(id) || Number(id) <= 0) return setError("Mã khách sạn là một số, ví dụ 19.");
    setError(null);
    router.push(`/p/${id}`);
  };

  const goLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !contact.trim()) return setError("Nhập mã đặt phòng và email hoặc số điện thoại đã dùng khi đặt.");
    setError(null);
    const key = contact.includes("@") ? "email" : "phone";
    router.push(`/p/reservation?code=${encodeURIComponent(code.trim())}&${key}=${encodeURIComponent(contact.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/book" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
              <Hotel className="h-5 w-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">Đặt phòng trực tuyến</span>
          </Link>
          <Link href="/p/reservation" className="text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300">
            Tra cứu đặt phòng
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Tìm phòng trống và đặt phòng ngay</h1>
          <p className="text-sm text-blue-100">Không cần tạo tài khoản. Chọn khách sạn, chọn ngày, đặt cọc trực tuyến an toàn.</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {error && (
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <form onSubmit={goHotel} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><CalendarSearch className="w-5 h-5 text-blue-600" /> Đặt phòng</div>
            <p className="text-xs text-slate-500">Nhập mã khách sạn (khách sạn cung cấp trên website, hóa đơn hoặc mã QR) rồi chọn ngày và số khách ở bước tiếp theo.</p>
            <input value={hotelCode} onChange={(e) => setHotelCode(e.target.value)} inputMode="numeric" placeholder="Mã khách sạn, ví dụ 19" className={inputCls} />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
              Tìm phòng trống <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <form onSubmit={goLookup} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Search className="w-5 h-5 text-emerald-600" /> Tra cứu &amp; thanh toán cọc</div>
            <p className="text-xs text-slate-500">Đã đặt phòng? Nhập mã đặt phòng và email hoặc số điện thoại để xem chi tiết, thanh toán tiền cọc.</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Mã đặt phòng" className={inputCls} />
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email hoặc số điện thoại" className={inputCls} />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              Tra cứu <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {featuredIds.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><BedDouble className="w-5 h-5 text-blue-600" /> Khách sạn đang mở đặt phòng</h2>
            <FeaturedHotels ids={featuredIds} />
          </section>
        )}
      </main>
    </div>
  );
}

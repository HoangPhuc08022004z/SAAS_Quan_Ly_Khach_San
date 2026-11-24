"use client";

// API: GET .../check-in/reservations/{code}, GET .../guests, GET .../check-in/rooms/{roomId}/readiness,
//      POST .../check-in/reservations/{code}/complete  (token nhân viên PMS)
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, UserCheck, BedDouble, CheckCircle2, XCircle, RefreshCw, ShieldCheck } from "lucide-react";
import {
  checkInApi,
  type CheckInReservation,
  type CheckInGuestProfiles,
  type CheckInCompleted,
  type RoomReadiness,
} from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  Card, ErrorBox, Field, NoProperty, Pill, ReservationStatus, Spinner,
  btnGhost, btnPrimary, inputCls, usePmsProperty,
} from "@/features/pms-ops/ui";

export function CheckinFlow() {
  const { propertyId } = usePmsProperty();
  const [code, setCode] = useState("");
  // Mở từ trang đặt phòng: ?code=RSV-... → điền sẵn mã
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (c) setCode(c);
  }, []);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CheckInReservation | null>(null);
  const [guests, setGuests] = useState<CheckInGuestProfiles | null>(null);
  const [guestsError, setGuestsError] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<Record<number, RoomReadiness | { error: string }>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState<CheckInCompleted | null>(null);

  if (!propertyId) return <NoProperty />;

  const loadReadiness = async (res: CheckInReservation) => {
    const entries = await Promise.all(
      res.rooms.map(async (r): Promise<[number, RoomReadiness | { error: string }]> => {
        try {
          return [r.roomId, await checkInApi.readiness(propertyId, r.roomId)];
        } catch (e: any) {
          return [r.roomId, { error: e?.message || "Không kiểm tra được phòng." }];
        }
      })
    );
    setReadiness(Object.fromEntries(entries));
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Nhập mã đặt phòng.");
    setLoading(true);
    setError(null);
    setReservation(null);
    setGuests(null);
    setGuestsError(null);
    setReadiness({});
    setDone(null);
    try {
      const c = contact.trim();
      const res = await checkInApi.search(propertyId, code.trim(), c ? (c.includes("@") ? { email: c } : { phone: c }) : {});
      setReservation(res);
      void loadReadiness(res);
      checkInApi
        .guests(propertyId, res.reservationCode)
        .then(setGuests)
        .catch((e: any) => setGuestsError(e?.message || "Không tải được hồ sơ khách."));
    } catch (e: any) {
      setError(e?.message || "Không tìm thấy đặt phòng.");
    } finally {
      setLoading(false);
    }
  };

  const allReady =
    !!reservation &&
    reservation.rooms.length > 0 &&
    reservation.rooms.every((r) => {
      const x = readiness[r.roomId];
      return x && !("error" in x) && x.isReady;
    });
  const canComplete = reservation?.status === "CONFIRMED" && allReady;

  const complete = async () => {
    if (!reservation) return;
    setCompleting(true);
    try {
      const res = await checkInApi.complete(propertyId, reservation.reservationCode);
      setDone(res);
      setReservation({ ...reservation, status: res.reservationStatus });
      toast.success(`Đã nhận phòng cho đặt phòng ${res.reservationCode}.`);
      setConfirmOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Không thể hoàn tất check-in.");
      setConfirmOpen(false);
    } finally {
      setCompleting(false);
    }
  };

  const blockedReason =
    reservation && !canComplete
      ? reservation.status !== "CONFIRMED"
        ? `Đặt phòng đang ở trạng thái "${reservation.status}", chỉ đặt phòng đã xác nhận (đã cọc) mới nhận phòng được.`
        : "Có phòng chưa sẵn sàng (cần trạng thái READY) hoặc chưa kiểm tra được."
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Mã đặt phòng">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ví dụ: RSV-XXXXXX" className={inputCls} />
          </Field>
          <Field label="Email hoặc SĐT khách (tùy chọn)">
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="khach@email.com" className={inputCls} />
          </Field>
          <button type="submit" disabled={loading} className={btnPrimary}>
            <Search className="h-4 w-4" /> Tìm đặt phòng
          </button>
        </form>
      </Card>

      {loading && <Spinner label="Đang tìm đặt phòng..." />}
      <ErrorBox message={error} />

      {reservation && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="space-y-3 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <UserCheck className="h-4 w-4 text-blue-600" /> {reservation.reservationCode}
              </h3>
              <ReservationStatus status={reservation.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div><dt className="text-slate-400">Nhận phòng</dt><dd><DateText date={reservation.checkInDate} /></dd></div>
              <div><dt className="text-slate-400">Trả phòng</dt><dd><DateText date={reservation.checkOutDate} /></dd></div>
              <div><dt className="text-slate-400">Số khách</dt><dd className="font-semibold">{reservation.guestCount}</dd></div>
              <div><dt className="text-slate-400">Khách đặt</dt><dd className="font-semibold">{reservation.guest.fullName}</dd></div>
            </dl>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Phòng được gán</h4>
                <button type="button" onClick={() => loadReadiness(reservation)} className={btnGhost}>
                  <RefreshCw className="h-3.5 w-3.5" /> Kiểm tra lại
                </button>
              </div>
              {reservation.rooms.map((r) => {
                const x = readiness[r.roomId];
                return (
                  <div key={r.roomId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800">
                    <span className="flex items-center gap-2 font-semibold">
                      <BedDouble className="h-4 w-4 text-slate-400" /> Phòng {r.roomNumber} · tầng {r.floor}
                    </span>
                    {!x ? (
                      <Pill tone="slate">Đang kiểm tra...</Pill>
                    ) : "error" in x ? (
                      <span className="text-rose-600">{x.error}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Pill tone="slate">{x.roomStatus}</Pill>
                        {x.isReady ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Sẵn sàng</span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-rose-600"><XCircle className="h-4 w-4" /> Chưa sẵn sàng</span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {blockedReason && !done && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{blockedReason}</p>}

            <div className="flex justify-end">
              <button type="button" disabled={!canComplete || !!done} onClick={() => setConfirmOpen(true)} className={btnPrimary}>
                <ShieldCheck className="h-4 w-4" /> Hoàn tất check-in
              </button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hồ sơ khách</h3>
            {guestsError && <ErrorBox message={guestsError} />}
            {!guests && !guestsError && <Spinner />}
            {guests?.guests.map((g, i) => (
              <div key={g.guestId ?? i} className="space-y-0.5 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <p className="font-bold">{g.fullName}</p>
                {g.phone && <p>SĐT: {g.phone}</p>}
                {g.email && <p>Email: {g.email}</p>}
                <p>{g.identityType || "Giấy tờ"}: {g.identityNumber || "chưa có"}</p>
                {g.nationality && <p>Quốc tịch: {g.nationality}</p>}
              </div>
            ))}
            {guests && guests.guests.length === 0 && <p className="text-xs text-slate-400">Chưa có hồ sơ khách.</p>}
          </Card>
        </div>
      )}

      {done && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900">
          <p className="text-sm font-bold text-emerald-700">Check-in thành công · {done.reservationCode}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {done.rooms.map((r) => (
              <li key={r.roomId}>Phòng {r.roomNumber} (tầng {r.floor}) → {r.roomStatus}</li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Hoàn tất check-in?"
        description={`Xác nhận bàn giao phòng cho đặt phòng ${reservation?.reservationCode ?? ""}. Thao tác không hoàn tác được.`}
        confirmText="Hoàn tất"
        isLoading={completing}
        onConfirm={complete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  LogIn,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  DoorOpen,
  Key,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export function CheckinFlow({ initialReservations }: { initialReservations: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResId = searchParams.get("reservationId");

  const [reservations] = useState<any[]>(initialReservations);
  const [selectedResId, setSelectedResId] = useState<string>(
    queryResId || initialReservations.find((r) => r.status === "CONFIRMED")?.id || initialReservations[0]?.id || ""
  );

  const [reservation, setReservation] = useState<any | null>(null);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Guest profile fields
  const [guestName, setGuestName] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestNationality, setGuestNationality] = useState("Việt Nam");

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [handoverSlip, setHandoverSlip] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedResId) return;

    let isMounted = true;
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const [res, check] = await Promise.all([
          api.getReservation(selectedResId),
          api.getCheckinCheck(selectedResId),
        ]);
        if (isMounted) {
          setReservation(res);
          setReadiness(check);
          setGuestName(res.guest?.full_name || "");
          setGuestPhone(res.guest?.phone || "");
          setGuestIdNumber(res.guest?.id_card_number || "");
          setHandoverSlip(null);
        }
      } catch {
        // Ignored
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedResId]);

  const handleCompleteCheckin = async () => {
    if (!readiness?.canCheckIn) {
      toast.error("Không thể Check-in vì vẫn còn phòng chưa sẵn sàng.");
      return;
    }
    if (!guestName.trim() || !guestIdNumber.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên và số CCCD/Passport của khách.");
      return;
    }

    setIsCheckingIn(true);
    try {
      // Save guest info
      await api.saveReservationGuests(selectedResId, [
        {
          id: reservation.guest?.id,
          full_name: guestName.trim(),
          id_card_number: guestIdNumber.trim(),
          phone: guestPhone.trim(),
          nationality: guestNationality,
        },
      ]);

      // Complete Check-in
      const checkedIn = await api.checkIn(selectedResId);
      toast.success("Check-in hoàn tất! Bàn giao phòng thành công.");

      setHandoverSlip({
        reservationCode: checkedIn.code || checkedIn.id,
        guestName: guestName.trim(),
        rooms: readiness.rooms,
        checkInDate: checkedIn.check_in_date,
        checkOutDate: checkedIn.check_out_date,
        time: new Date().toLocaleTimeString("vi-VN"),
      });

      // Reload detail
      const updatedCheck = await api.getCheckinCheck(selectedResId);
      setReadiness(updatedCheck);
      setReservation((prev: any) => ({ ...prev, status: "CHECKED_IN" }));
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi hoàn tất Check-in.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Selector / Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quầy Tiếp Đón & Check-in</h3>
            <p className="text-xs text-slate-400">Kiểm tra phòng sẵn sàng và lưu hồ sơ lưu trú khách hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Chọn đặt phòng:</label>
          <select
            value={selectedResId}
            onChange={(e) => setSelectedResId(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
          >
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code || r.id} - {r.guest?.full_name} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {reservation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Room Readiness (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-blue-500" />
                    <span>Kiểm Tra Trạng Thái Sẵn Sàng Của Phòng (Readiness)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Quy tắc BR-OP-10: Chỉ được Check-in khi toàn bộ phòng thuộc đơn đều ở trạng thái READY và không có sự cố buồng phòng chưa xử lý.
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  readiness?.canCheckIn
                    ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-200"
                    : "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-200"
                }`}
              >
                {readiness?.canCheckIn ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {readiness?.canCheckIn
                      ? "Tất cả các phòng đều ĐÃ SẴN SÀNG đón khách"
                      : "Chưa đủ điều kiện hoàn tất Check-in"}
                  </div>
                  {readiness?.reasons?.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 opacity-90">
                      {readiness.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Rooms List */}
              <div className="space-y-2.5">
                {readiness?.rooms?.map((rm: any) => (
                  <div
                    key={rm.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-900 font-bold border border-slate-200 dark:border-slate-800">
                        {rm.room_number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Phòng {rm.room_number} (Tầng {rm.floor})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rm.hasIssue ? "⚠️ Có cảnh báo buồng phòng" : "Vệ sinh buồng phòng sạch sẽ"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge type="room" status={rm.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Guest Profile & Complete Action (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hồ Sơ Khách Lưu Trú (Khai báo tạm trú)
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Họ và tên khách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Số CCCD / Hộ chiếu (Bắt buộc) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestIdNumber}
                    onChange={(e) => setGuestIdNumber(e.target.value)}
                    placeholder="001201019283"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Quốc tịch</label>
                  <input
                    type="text"
                    value={guestNationality}
                    onChange={(e) => setGuestNationality(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteCheckin}
                disabled={!readiness?.canCheckIn || isCheckingIn || reservation.status === "CHECKED_IN"}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {reservation.status === "CHECKED_IN"
                    ? "Đã hoàn tất Check-in"
                    : isCheckingIn
                    ? "Đang hoàn tất..."
                    : "Hoàn tất Check-in & Bàn giao phòng"}
                </span>
              </button>
            </div>

            {/* Handover Slip (Phiếu Bàn Giao Khóa Phòng) */}
            {handoverSlip && (
              <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-900">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Key className="w-4 h-4" />
                    <span>Phiếu Bàn Giao Thẻ Khóa Phòng</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    title="In phiếu bàn giao"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div>Khách hàng: <strong>{handoverSlip.guestName}</strong></div>
                  <div>Mã đặt phòng: <strong>{handoverSlip.reservationCode}</strong></div>
                  <div>Phòng bàn giao: <strong>{handoverSlip.rooms?.map((r: any) => `P.${r.room_number}`).join(", ")}</strong></div>
                  <div>Thời gian bàn giao: {handoverSlip.time} ngày {handoverSlip.checkInDate}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 text-[11px] text-slate-500">
                  Chúc Quý khách có kỳ nghỉ thư thái và hài lòng tại khách sạn!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

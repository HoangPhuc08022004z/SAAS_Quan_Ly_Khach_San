"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { Countdown } from "@/components/feedback/Countdown";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { calculateDepositRequired } from "@/rules/bookingRules";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  DoorOpen,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";

export function BookingWizard({ guests }: { guests: any[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Dates & Guests
  const [checkIn, setCheckIn] = useState("2026-10-15");
  const [checkOut, setCheckOut] = useState("2026-10-17");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Step 2 & 3: Rooms
  const [availableRoomTypes, setAvailableRoomTypes] = useState<any[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedRoomsData, setSelectedRoomsData] = useState<any[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Step 4: Guest
  const [guestId, setGuestId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");

  // Step 5 & 6: Pricing, Conflict & Payment
  const [paymentMethod, setPaymentMethod] = useState("MOMO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

  const handleFetchAvailability = async () => {
    if (checkOut <= checkIn) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }
    setIsLoadingAvailability(true);
    try {
      const results = await api.getAvailability({ from: checkIn, to: checkOut });
      setAvailableRoomTypes(results);
      setStep(2);
    } catch {
      toast.error("Không thể kiểm tra phòng trống.");
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleToggleRoom = (room: any, roomType: any) => {
    if (selectedRoomIds.includes(room.id)) {
      setSelectedRoomIds((prev) => prev.filter((id) => id !== room.id));
      setSelectedRoomsData((prev) => prev.filter((r) => r.id !== room.id));
    } else {
      setSelectedRoomIds((prev) => [...prev, room.id]);
      setSelectedRoomsData((prev) => [...prev, { ...room, roomType }]);
    }
  };

  const totalPrice = selectedRoomsData.reduce((sum, r) => sum + (r.roomType?.rate || 1200000) * nights, 0);
  const depositAmount = calculateDepositRequired(totalPrice);

  const handleSelectExistingGuest = (id: string) => {
    setGuestId(id);
    const found = guests.find((g) => g.id === id);
    if (found) {
      setGuestName(found.full_name);
      setGuestPhone(found.phone);
      setGuestEmail(found.email || "");
      setGuestIdNumber(found.id_card_number || "");
    }
  };

  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.createReservation({
        check_in_date: checkIn,
        check_out_date: checkOut,
        room_ids: selectedRoomIds,
        guest: {
          id: guestId || undefined,
          full_name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
          id_card_number: guestIdNumber.trim() || undefined,
        },
      });

      await api.createDepositPayment(res.id, paymentMethod);
      toast.success("Đặt phòng & thanh toán đặt cọc thành công!");
      router.push(`/pms/reservations/${res.id}`);
    } catch (err: any) {
      if (err?.code === "CONFLICT") {
        setConflictMessage(err.message || "Phòng vừa bị khách khác giữ. Vui lòng chọn lại phòng.");
      } else {
        toast.error(err?.message || "Có lỗi xảy ra khi tạo đặt phòng.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Stepper */}
      <div className="flex items-center justify-between max-w-xl mx-auto px-4 py-2">
        {[1, 2, 3, 4, 5, 6].map((st) => (
          <React.Fragment key={st}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= st ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
              }`}
            >
              {st}
            </div>
            {st < 6 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  step > st ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Stay Dates */}
      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bước 1: Chọn Lịch Trình Lưu Trú & Khách</h3>
            <p className="text-xs text-slate-400">Kiểm tra khoảng thời gian lưu trú không trùng lặp</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Ngày Check-in (Nhận phòng)</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Ngày Check-out (Trả phòng)</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Số người lớn</label>
              <input
                type="number"
                min="1"
                max="10"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Số trẻ em</label>
              <input
                type="number"
                min="0"
                max="10"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleFetchAvailability}
              disabled={isLoadingAvailability}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              <span>{isLoadingAvailability ? "Đang tra cứu..." : "Tìm phòng trống"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Room Picker */}
      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Bước 2: Chọn Phòng Từ Kết Quả Trống</h3>
              <p className="text-xs text-slate-400">
                Khoảng ngày: {checkIn} → {checkOut} ({nights} đêm)
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">Đã chọn: {selectedRoomIds.length} phòng</span>
          </div>

          <div className="space-y-4">
            {availableRoomTypes.map((rt) => (
              <div key={rt.roomType.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rt.roomType.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      Giá niêm yết: <MoneyText amount={rt.rate} /> / đêm
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">Còn trống {rt.rooms.length} phòng</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rt.rooms.map((rm: any) => {
                    const isSelected = selectedRoomIds.includes(rm.id);
                    return (
                      <button
                        key={rm.id}
                        type="button"
                        onClick={() => handleToggleRoom(rm, rt.roomType)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                        }`}
                      >
                        P.{rm.room_number} (T.{rm.floor})
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => {
                if (selectedRoomIds.length === 0) {
                  toast.error("Vui lòng chọn ít nhất 1 phòng.");
                  return;
                }
                setStep(3);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Xác nhận danh sách phòng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Rooms */}
      {step === 3 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bước 3: Xác Nhận Danh Sách Phòng Đã Chọn</h3>
            <p className="text-xs text-slate-400">Kiểm tra số lượng và tổng chi phí tiền phòng</p>
          </div>

          <div className="space-y-2.5">
            {selectedRoomsData.map((rm) => (
              <div key={rm.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Phòng {rm.room_number} - Tầng {rm.floor}</div>
                  <div className="text-[11px] text-slate-400">{rm.roomType?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">
                    <MoneyText amount={(rm.roomType?.rate || 1200000) * nights} />
                  </div>
                  <span className="text-[10px] text-slate-400">{nights} đêm</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại chọn phòng</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Nhập thông tin khách</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Guest Info */}
      {step === 4 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bước 4: Thông Tin Khách Hàng Đại Diện</h3>
            <p className="text-xs text-slate-400">Chọn khách cũ đã có hồ sơ hoặc nhập khách lưu trú mới</p>
          </div>

          <div className="space-y-4 text-xs">
            {guests.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Chọn khách hàng cũ (nếu có):
                </label>
                <select
                  value={guestId}
                  onChange={(e) => handleSelectExistingGuest(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="">-- Nhập mới khách hàng --</option>
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.full_name} ({g.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Họ và tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Tuấn"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="0987 654 321"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Email (nhận xác nhận)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="tuan.hoang@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Số CCCD / Hộ chiếu</label>
                <input
                  type="text"
                  value={guestIdNumber}
                  onChange={(e) => setGuestIdNumber(e.target.value)}
                  placeholder="001201019283"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => {
                if (!guestName.trim() || !guestPhone.trim()) {
                  toast.error("Vui lòng nhập họ tên và số điện thoại khách hàng.");
                  return;
                }
                setStep(5);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Xem bảng tính giá & Cọc</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Pricing & Deposit */}
      {step === 5 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bước 5: Tóm Tắt Giá & Mức Cọc Yêu Cầu</h3>
            <p className="text-xs text-slate-400">Chính sách đặt cọc 50% bắt buộc để giữ phòng</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Khách hàng đại diện:</span>
              <span className="font-bold text-slate-900 dark:text-white">{guestName} ({guestPhone})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Thời gian:</span>
              <span>{checkIn} → {checkOut} ({nights} đêm)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Số phòng đặt ({selectedRoomIds.length}):</span>
              <span className="font-bold">{selectedRoomsData.map((r) => `P.${r.room_number}`).join(", ")}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Tổng tiền phòng:</span>
              <MoneyText amount={totalPrice} className="font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="font-bold text-blue-600">Tiền đặt cọc bắt buộc (50%):</span>
              <MoneyText amount={depositAmount} className="font-black text-blue-600" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => setStep(6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Thanh toán đặt cọc</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Deposit Payment & Hold Countdown */}
      {step === 6 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bước 6: Thu Tiền Cọc & Giữ Phòng</h3>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 py-1.5 px-4 rounded-full max-w-xs mx-auto dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Thời gian giữ phòng tạm: 15:00 phút</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Phương thức thu tiền cọc:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "CASH", name: "Tiền mặt" },
                { id: "MOMO", name: "Cổng MoMo QR" },
                { id: "BANK_TRANSFER", name: "Chuyển khoản" },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? "border-blue-600 bg-blue-50/30 text-blue-600 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  {m.name}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-500">Số tiền cọc thực thu:</span>
            <MoneyText amount={depositAmount} className="text-lg font-black text-emerald-600" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleCompleteBooking}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md"
            >
              <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận đặt phòng thành công"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conflict Dialog (409) */}
      <ConfirmDialog
        isOpen={!!conflictMessage}
        title="Xung đột phòng vừa bị đặt (409 Conflict)"
        description={conflictMessage || ""}
        confirmText="Chọn lại phòng khác"
        onConfirm={() => {
          setConflictMessage(null);
          setStep(2); // Keep guest data, return to room selection
        }}
        onClose={() => setConflictMessage(null)}
      />
    </div>
  );
}

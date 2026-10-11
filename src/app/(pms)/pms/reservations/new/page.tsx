// FR: FR-O03
// Service: api.getAvailability, api.createReservation, api.createDepositPayment
import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookingWizard } from "@/features/reservation/components/BookingWizard";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PmsNewReservationPage() {
  const reservations = await api.searchReservations({});
  const guests = reservations
    .map((r: any) => r.guest)
    .filter((g: any, idx: number, arr: any[]) => g && arr.findIndex((x: any) => x?.id === g.id) === idx);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/pms/reservations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đặt phòng</span>
        </Link>
      </div>

      <PageHeader
        title="Tạo Mới Đặt Phòng (Booking Wizard)"
        description="Quy trình đặt chỗ từng bước: kiểm tra phòng trống, gán phòng, nhập hồ sơ khách và thu cọc tự động."
      />

      <BookingWizard guests={guests} />
    </div>
  );
}

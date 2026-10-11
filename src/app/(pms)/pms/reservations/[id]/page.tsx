// FR: FR-O01
// Service: api.getReservation, api.getFolio
import React from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReservationDetail } from "@/features/reservation/components/ReservationDetail";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PmsReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await api.getReservation(id);

  if (!reservation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chi Tiết Đặt Phòng: ${reservation.code || reservation.id}`}
        description="Thông tin chi tiết lượt lưu trú, phân bổ phòng, hồ sơ khách và bảng kê tài chính Folio."
      />
      <ReservationDetail reservation={reservation} />
    </div>
  );
}

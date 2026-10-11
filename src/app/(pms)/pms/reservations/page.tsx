// FR: FR-O01, FR-O04, FR-O11, FR-O27
// Service: api.searchReservations
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReservationList } from "@/features/reservation/components/ReservationList";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PmsReservationsPage() {
  const reservations = await api.searchReservations({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Đặt Phòng (Reservations)"
        description="Quản lý toàn bộ các lượt đặt chỗ, tra cứu tình trạng phòng và kích hoạt luồng Check-in / Check-out."
      />
      <ReservationList initialReservations={reservations} />
    </div>
  );
}

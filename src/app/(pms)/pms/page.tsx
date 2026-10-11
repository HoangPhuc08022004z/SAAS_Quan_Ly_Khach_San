// FR: FR-O01
// Service: api.searchReservations, api.getRoomBoard, api.listNoShowCandidates, api.listFnbRequests
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PmsDashboard } from "@/features/reservation/components/PmsDashboard";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PmsDashboardPage() {
  const [reservations, roomBoard, noShowCandidates, fnbRequests] = await Promise.all([
    api.searchReservations({}),
    api.getRoomBoard("2026-10-11"),
    api.listNoShowCandidates(),
    api.listFnbRequests("PENDING"),
  ]);

  const arrivals = reservations.filter(
    (r: any) => r.check_in_date === "2026-10-11" && r.status === "CONFIRMED"
  );
  const departures = reservations.filter(
    (r: any) => r.check_out_date === "2026-10-11" && r.status === "CHECKED_IN"
  );
  const dirtyRooms = roomBoard.filter(
    (r: any) => r.status === "VACANT_DIRTY" || r.status === "CLEANING"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bàn Làm Việc Tiền Sảnh (PMS Overview)"
        description="Theo dõi danh sách khách đến, khách đi, trạng thái buồng phòng và các việc cần xử lý ngay trong ngày."
      />
      <PmsDashboard
        arrivals={arrivals}
        departures={departures}
        dirtyRooms={dirtyRooms}
        fnbRequests={fnbRequests}
        noShowCandidates={noShowCandidates}
      />
    </div>
  );
}

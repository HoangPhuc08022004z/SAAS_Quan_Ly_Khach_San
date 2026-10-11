// FR: FR-O04, FR-O05, FR-O06, FR-O07
// Service: api.searchReservations, api.getCheckinCheck, api.saveReservationGuests, api.checkIn
import React, { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckinFlow } from "@/features/checkin/components/CheckinFlow";
import { api } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PmsCheckinPage() {
  const reservations = await api.searchReservations({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nghiệp Vụ Lễ Tân: Nhận Phòng (Check-in)"
        description="Kiểm tra điều kiện sẵn sàng của phòng, tiếp nhận thông tin căn cước công dân và bàn giao chìa khóa cho khách."
      />
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Đang tải thông tin check-in...</span>
          </div>
        }
      >
        <CheckinFlow initialReservations={reservations} />
      </Suspense>
    </div>
  );
}

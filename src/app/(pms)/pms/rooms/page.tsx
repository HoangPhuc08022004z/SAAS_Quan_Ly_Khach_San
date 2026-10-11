// FR: FR-O02, FR-O08
// Service: api.getRoomBoard, api.listRoomTypes, api.setRoomStatus
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomBoardView } from "@/features/reservation/components/RoomBoardView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PmsRoomsPage() {
  const [roomBoard, properties] = await Promise.all([
    api.getRoomBoard("2026-10-11"),
    api.listProperties(),
  ]);

  const activePropId = properties[0]?.id || "prop_abc_hn";
  const roomTypes = await api.listRoomTypes(activePropId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sơ Đồ Tầng & Lịch Phòng Trực Quan (Room Board)"
        description="Theo dõi tình trạng dọn dẹp, buồng phòng có khách và chuyển đổi nhanh trạng thái sẵn sàng đón khách."
      />
      <RoomBoardView initialRooms={roomBoard} roomTypes={roomTypes} />
    </div>
  );
}

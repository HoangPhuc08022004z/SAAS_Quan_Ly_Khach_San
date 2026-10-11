// FR: FR-C06, FR-C13
// Service: api.getRoomType, api.listRooms, api.createRoom, api.bulkCreateRooms, api.deleteRoom
import React from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomConfig } from "@/features/property-config/components/RoomConfig";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoomTypeRoomsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [roomType, rooms] = await Promise.all([
    api.getRoomType(id),
    api.listRooms(id),
  ]);

  if (!roomType) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Danh Sách Phòng: ${roomType.name}`}
        description="Khởi tạo danh sách các phòng vật lý thực tế theo tầng và dải số phòng tương ứng."
      />

      <RoomConfig roomType={roomType} initialRooms={rooms} />
    </div>
  );
}

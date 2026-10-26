"use client";

// FR: FR-C06, FR-C13
// API: GET/PUT /api/properties/{propertyId}/rooms/configuration, GET .../room-types/{roomTypeId}
import React, { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { RoomConfig } from "@/features/property-config/components/RoomConfig";
import { roomApi, roomTypeApi } from "@/lib/api";
import { toUiRoomType } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

function RoomsContent({ roomTypeId }: { roomTypeId: string }) {
  const propertyId = useSearchParams().get("propertyId");
  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!propertyId) throw new Error("Thiếu propertyId. Vui lòng mở trang này từ danh sách loại phòng của khách sạn.");
    const [roomType, config] = await Promise.all([
      roomTypeApi.get(propertyId, roomTypeId),
      roomApi.configuration(propertyId),
    ]);
    return { roomType: toUiRoomType(roomType, propertyId), rooms: config.rooms };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Danh Sách Phòng: ${data?.roomType.name ?? ""}`}
        description="Khởi tạo danh sách các phòng vật lý thực tế theo tầng và dải số phòng tương ứng."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && propertyId && <RoomConfig propertyId={propertyId} roomType={data.roomType} initialAllRooms={data.rooms} />}
      </AsyncBoundary>
    </div>
  );
}

export default function RoomTypeRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <RoomsContent roomTypeId={id} />
    </Suspense>
  );
}

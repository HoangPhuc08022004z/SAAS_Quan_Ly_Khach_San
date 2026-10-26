"use client";

// FR: FR-C07
// API: GET/POST /api/properties/{propertyId}/room-rates, PUT .../{roomRateId}, PATCH .../{roomRateId}/deactivate
import React, { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { RoomRateConfig } from "@/features/property-config/components/RoomRateConfig";
import { roomRateApi, roomTypeApi } from "@/lib/api";
import { toUiRoomType } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

function RateContent({ roomTypeId }: { roomTypeId: string }) {
  const propertyId = useSearchParams().get("propertyId");
  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!propertyId) throw new Error("Thiếu propertyId. Vui lòng mở trang này từ danh sách loại phòng của khách sạn.");
    const [roomType, rates] = await Promise.all([roomTypeApi.get(propertyId, roomTypeId), roomRateApi.list(propertyId)]);
    return { roomType: toUiRoomType(roomType, propertyId), rates };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bảng Giá: ${data?.roomType.name ?? ""}`}
        description="Định giá niêm yết mỗi đêm lưu trú để hệ thống tự động tính toán tổng hóa đơn và tiền đặt cọc."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && propertyId && <RoomRateConfig propertyId={propertyId} roomType={data.roomType} initialRates={data.rates} />}
      </AsyncBoundary>
    </div>
  );
}

export default function RoomTypeRatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <RateContent roomTypeId={id} />
    </Suspense>
  );
}

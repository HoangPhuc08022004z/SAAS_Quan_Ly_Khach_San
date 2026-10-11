// FR: FR-C07
// Service: api.getRoomType, api.getRoomRate, api.setRoomRate
import React from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomRateConfig } from "@/features/property-config/components/RoomRateConfig";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoomTypeRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [roomType, rate] = await Promise.all([
    api.getRoomType(id),
    api.getRoomRate(id),
  ]);

  if (!roomType) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bảng Giá: ${roomType.name}`}
        description="Định giá niêm yết mỗi đêm lưu trú để hệ thống tự động tính toán tổng hóa đơn và tiền đặt cọc."
      />

      <RoomRateConfig roomType={roomType} initialRate={rate} />
    </div>
  );
}

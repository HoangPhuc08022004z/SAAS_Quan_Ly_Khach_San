"use client";

// FR: FR-C05, FR-C13
// API: GET/POST /api/properties/{id}/room-types, PUT/DELETE .../room-types/{roomTypeId}
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { RoomTypeConfig } from "@/features/property-config/components/RoomTypeConfig";
import { propertyApi, roomTypeApi } from "@/lib/api";
import { toUiRoomType } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyRoomTypesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, roomTypes] = await Promise.all([propertyApi.get(id), roomTypeApi.list(id)]);
    return { property, roomTypes: roomTypes.map((rt) => toUiRoomType(rt, id)) };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${id}/setup`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Wizard thiết lập</span>
        </Link>
      </div>

      <PageHeader
        title={`Quản Lý Loại Phòng: ${data?.property.name ?? ""}`}
        description="Định nghĩa các tiêu chuẩn loại phòng, chỉ tiêu số phòng và cấu hình tiện nghi phục vụ khách."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <RoomTypeConfig propertyId={id} initialRoomTypes={data.roomTypes} />}
      </AsyncBoundary>
    </div>
  );
}

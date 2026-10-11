// FR: FR-C05, FR-C13
// Service: api.listRoomTypes, api.createRoomType, api.updateRoomType, api.deleteRoomType, api.setRoomTypeStatus
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomTypeConfig } from "@/features/property-config/components/RoomTypeConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyRoomTypesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, roomTypes] = await Promise.all([
    api.getProperty(id),
    api.listRoomTypes(id),
  ]);

  if (!property) {
    notFound();
  }

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
        title={`Quản Lý Loại Phòng: ${property.name}`}
        description="Định nghĩa các tiêu chuẩn loại phòng, chỉ tiêu số phòng và cấu hình tiện nghi phục vụ khách."
      />

      <RoomTypeConfig propertyId={id} initialRoomTypes={roomTypes} />
    </div>
  );
}

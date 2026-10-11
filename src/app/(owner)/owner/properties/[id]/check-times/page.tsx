// FR: FR-C03
// Service: api.getCheckTimes, api.updateCheckTimes
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckTimeForm } from "@/features/property-config/components/CheckTimeForm";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyCheckTimesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, times] = await Promise.all([
    api.getProperty(id),
    api.getCheckTimes(id),
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
        title={`Giờ Nhận / Trả Phòng: ${property.name}`}
        description="Quy định mốc thời gian nhận phòng và trả phòng tiêu chuẩn hàng ngày cho khách lưu trú."
      />

      <CheckTimeForm propertyId={id} initialTimes={times} />
    </div>
  );
}

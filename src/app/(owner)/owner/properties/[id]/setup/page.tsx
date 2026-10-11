// FR: FR-C01 đến FR-C12
// Service: api.getProperty, api.getSetupStatus
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SetupWizard } from "@/features/property-config/components/SetupWizard";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertySetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, setupStatus] = await Promise.all([
    api.getProperty(id),
    api.getSetupStatus(id),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/owner/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khách sạn</span>
        </Link>
      </div>

      <PageHeader
        title={`Tiến Trình Thiết Lập: ${property.name}`}
        description="Danh sách các bước cấu hình cần thiết để đưa khách sạn vào trạng thái sẵn sàng đón khách."
      />

      <SetupWizard
        propertyId={id}
        propertyName={property.name}
        setupStatus={setupStatus}
      />
    </div>
  );
}

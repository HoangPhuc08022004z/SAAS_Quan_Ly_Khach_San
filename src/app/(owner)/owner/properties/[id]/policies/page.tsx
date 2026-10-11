// FR: FR-C02, FR-C13
// Service: api.listPolicyFormulas, api.listPropertyPolicies, api.applyPolicy, api.removePolicy, api.simulatePolicy
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PolicyConfig } from "@/features/property-config/components/PolicyConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyPoliciesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, formulas, applied] = await Promise.all([
    api.getProperty(id),
    api.listPolicyFormulas(),
    api.listPropertyPolicies(id),
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
        title={`Chính Sách & Quy Định: ${property.name}`}
        description="Cấu hình các công thức hủy phòng, đặt cọc và quy tắc xử lý vắng mặt (No-Show) tự động."
      />

      <PolicyConfig
        propertyId={id}
        initialFormulas={formulas}
        initialApplied={applied}
      />
    </div>
  );
}

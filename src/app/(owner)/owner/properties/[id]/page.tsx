// FR: FR-C01, FR-C13
// Service: api.getProperty, api.updateProperty, api.deleteProperty, api.uploadPropertyImage
import React from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyForm } from "@/features/property-config/components/PropertyForm";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await api.getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chỉnh Sửa Thông Tin: ${property.name}`}
        description="Cập nhật địa chỉ, thông tin hotline, email liên hệ và ảnh bìa khách sạn."
      />
      <PropertyForm initialData={property} isEdit={true} />
    </div>
  );
}

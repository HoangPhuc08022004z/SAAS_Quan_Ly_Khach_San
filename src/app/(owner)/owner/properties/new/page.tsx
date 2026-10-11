// FR: FR-C01
// Service: api.createProperty, api.uploadPropertyImage
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyForm } from "@/features/property-config/components/PropertyForm";

export const dynamic = "force-dynamic";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm Khách Sạn Mới"
        description="Khởi tạo cơ sở lưu trú mới thuộc tổ chức để bắt đầu quy trình cấu hình phòng và dịch vụ."
      />
      <PropertyForm isEdit={false} />
    </div>
  );
}

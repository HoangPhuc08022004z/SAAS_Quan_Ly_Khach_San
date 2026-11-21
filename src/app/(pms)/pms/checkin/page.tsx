"use client";

// API thật: GET/POST /api/properties/{propertyId}/check-in/... (token nhân viên PMS)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckinFlow } from "@/features/checkin/components/CheckinFlow";

export default function PmsCheckinPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nghiệp Vụ Lễ Tân: Nhận Phòng (Check-in)"
        description="Tìm đặt phòng theo mã, xem hồ sơ khách, kiểm tra phòng đã sẵn sàng (READY) rồi hoàn tất nhận phòng."
      />
      <CheckinFlow />
    </div>
  );
}

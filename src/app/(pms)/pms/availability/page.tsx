"use client";

// Tìm phòng trống — dữ liệu thật: GET /api/public/properties/{propertyId}/available-rooms
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AvailabilitySearch } from "@/features/reservation/components/AvailabilitySearch";

export default function PmsAvailabilityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tìm Phòng Trống"
        description="Tra cứu phòng còn trống theo khoảng ngày và số khách, kèm giá niêm yết của từng loại phòng."
      />
      <AvailabilitySearch />
    </div>
  );
}

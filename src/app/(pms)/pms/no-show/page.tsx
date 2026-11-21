"use client";

// API thật: GET /api/properties/{id}/reservations/no-show, POST .../no-show/notify, POST .../no-show/confirm
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NoShowManagementView } from "@/features/noshow/components/NoShowManagementView";

export default function NoShowPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Xử Lý No-Show" description="Theo dõi khách quá giờ nhận phòng, gửi thông báo và xác nhận vắng mặt." />
      <NoShowManagementView />
    </div>
  );
}

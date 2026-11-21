"use client";

// API thật: GET .../reservations/{code}/refund-quote, POST .../reservations/{code}/cancel (token nhân viên PMS)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CancellationView } from "@/features/cancellation/components/CancellationView";

export default function CancellationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hủy Đặt Phòng" description="Tra cứu đặt phòng, xem số tiền hoàn theo chính sách và thực hiện hủy." />
      <CancellationView />
    </div>
  );
}

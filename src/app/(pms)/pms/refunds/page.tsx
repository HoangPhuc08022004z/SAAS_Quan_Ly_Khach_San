"use client";

// API thật: POST /api/properties/{id}/reservations/{code}/refunds, GET /api/properties/{id}/refunds/{refundPaymentId}
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefundManagementView } from "@/features/refund/components/RefundManagementView";

export default function RefundsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hoàn Tiền" description="Tạo yêu cầu hoàn tiền cho khoản đã thanh toán và theo dõi trạng thái hoàn." />
      <RefundManagementView />
    </div>
  );
}

"use client";

// Một màn cho cả hủy và hoàn tiền.
// API thật: GET .../reservations/{code}/refund-quote, POST .../reservations/{code}/cancel,
//           POST .../reservations/{code}/refunds, GET .../refunds/{refundPaymentId}
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CancellationView } from "@/features/cancellation/components/CancellationView";
import { RefundManagementView } from "@/features/refund/components/RefundManagementView";
import { useCan } from "@/lib/auth/use-can";

export default function CancellationPage() {
  const canRefund = useCan("REFUND_VIEW");
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <PageHeader title="Hủy Đặt Phòng" description="Tra cứu đặt phòng, xem số tiền hoàn theo chính sách và thực hiện hủy." />
        <CancellationView />
      </div>
      {canRefund && (
        <div id="hoan-tien" className="space-y-6 border-t border-slate-200 pt-8 dark:border-slate-800">
          <PageHeader title="Hoàn Tiền" description="Tạo yêu cầu hoàn tiền cho khoản đã thanh toán và theo dõi trạng thái hoàn." />
          <RefundManagementView />
        </div>
      )}
    </div>
  );
}

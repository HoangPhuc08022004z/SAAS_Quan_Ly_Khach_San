// FR: FR-S10
// Service: api.listMySubscriptionPayments, api.getSubscriptionPayment
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MyPaymentHistory } from "@/features/subscription/components/MyPaymentHistory";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerSubscriptionPaymentsPage() {
  const payments = await api.listMySubscriptionPayments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Thanh Toán Thuê Bao Của Tôi"
        description="Tra cứu danh sách và trạng thái các hóa đơn thanh toán gia hạn hoặc kích hoạt gói dịch vụ."
      />
      <MyPaymentHistory initialPayments={payments} />
    </div>
  );
}

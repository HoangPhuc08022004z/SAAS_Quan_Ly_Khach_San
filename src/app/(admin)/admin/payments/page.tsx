// FR: FR-S10
// Service: api.adminListSubscriptionPayments, api.getSubscriptionPayment
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentManagement } from "@/features/admin/components/PaymentManagement";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await api.adminListSubscriptionPayments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Giao Dịch Thuê Bao (Subscription Payments)"
        description="Tra cứu và đối soát toàn bộ các giao dịch thanh toán gói dịch vụ của khách hàng qua cổng thanh toán."
      />
      <PaymentManagement initialPayments={payments} />
    </div>
  );
}

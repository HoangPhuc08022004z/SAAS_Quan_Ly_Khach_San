// FR: FR-S08
// Service: api.createSubscriptionPayment, api.getMySubscription
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentCheckout } from "@/features/subscription/components/PaymentFlow";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerSubscriptionPayPage() {
  const subscription = await api.getMySubscription();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thanh Toán Thuê Bao Dịch Vụ"
        description="Lựa chọn cổng thanh toán điện tử (MoMo, VNPAY, VietQR) để hoàn tất kích hoạt gói."
      />
      <PaymentCheckout subscription={subscription} />
    </div>
  );
}

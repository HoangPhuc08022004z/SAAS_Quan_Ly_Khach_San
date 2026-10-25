"use client";

// FR: FR-S08
// API: GET /api/v1/user/profile, POST /api/v1/user/subscriptions/retry-payment (Stripe Checkout)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PaymentCheckout } from "@/features/subscription/components/PaymentFlow";
import { fetchUserProfile } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerSubscriptionPayPage() {
  const { data, loading, error, reload } = useAsyncData(fetchUserProfile);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thanh Toán Thuê Bao Dịch Vụ"
        description="Thanh toán qua Stripe Checkout để kích hoạt gói sau khi yêu cầu được duyệt."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PaymentCheckout profile={data} />}
      </AsyncBoundary>
    </div>
  );
}

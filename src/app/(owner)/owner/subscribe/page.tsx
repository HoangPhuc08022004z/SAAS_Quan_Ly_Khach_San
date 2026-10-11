// FR: FR-S03
// Service: api.listPublicPlans, api.createSubscriptionRequest
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscribeWizard } from "@/features/subscription/components/SubscribeWizard";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerSubscribePage() {
  const plans = await api.listPublicPlans();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng Ký Thuê Bao Dịch Vụ SaaS"
        description="Đăng ký hoặc chuyển đổi gói dịch vụ quản trị khách sạn đa nền tảng."
      />
      <SubscribeWizard plans={plans} />
    </div>
  );
}

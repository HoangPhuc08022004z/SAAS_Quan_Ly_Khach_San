// FR: FR-S05, FR-S06, FR-S07, FR-S16
// Service: api.getMySubscription, api.getMyUsage, api.renewMySubscription, api.listMyReminders
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MySubscriptionView } from "@/features/subscription/components/MySubscriptionView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerSubscriptionPage() {
  const [subscription, usage, reminders] = await Promise.all([
    api.getMySubscription(),
    api.getMyUsage(),
    api.listMyReminders(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thuê Bao Dịch Vụ Của Tôi"
        description="Xem thông tin gói hiện tại, thời hạn hiệu lực, tình hình sử dụng tài nguyên và các tùy chọn gia hạn."
      />
      <MySubscriptionView
        initialSubscription={subscription}
        initialUsage={usage}
        initialReminders={reminders}
      />
    </div>
  );
}

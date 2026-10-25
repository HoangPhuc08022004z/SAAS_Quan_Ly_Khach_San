"use client";

// FR: FR-S05, FR-S06, FR-S07, FR-S16
// API thật: GET /api/v1/user/profile, GET /api/v1/saas/user/Plan/List
// Mock (chưa có API): api.getMyUsage, api.listMyReminders
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { MySubscriptionView } from "@/features/subscription/components/MySubscriptionView";
import { api, fetchPlans, fetchUserProfile } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerSubscriptionPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [profile, plans, usage, reminders] = await Promise.all([
      fetchUserProfile(),
      fetchPlans().then((list) => list.filter((p) => p.status === "ACTIVE").map(toPlan)),
      api.getMyUsage(),
      api.listMyReminders(),
    ]);
    return { profile, plans, usage, reminders };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thuê Bao Dịch Vụ Của Tôi"
        description="Xem trạng thái thuê bao, thời hạn hiệu lực và các tùy chọn thanh toán / gia hạn."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <MySubscriptionView
            profile={data.profile}
            plans={data.plans}
            usage={data.usage}
            reminders={data.reminders}
            onChanged={reload}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}

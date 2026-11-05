"use client";

// FR: FR-S05, FR-S06, FR-S07, FR-S16
// API thật: GET /api/v1/user/profile, GET /api/v1/saas/user/Plan/List, GET /api/properties (+ rooms, users để đếm mức sử dụng)
// Chưa có API: nhắc hạn (email do backend gửi, không có API đọc)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { MySubscriptionView } from "@/features/subscription/components/MySubscriptionView";
import { fetchPlans, fetchUserProfile, propertyApi, roomApi, userApi } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

// Đếm số khách sạn / phòng / nhân viên từ dữ liệu thật (chưa có API "usage" riêng); lỗi → null
async function countUsage() {
  try {
    const list = await propertyApi.list();
    const per = await Promise.all(
      list.map(async (p) => {
        const [config, users] = await Promise.allSettled([roomApi.configuration(p.propertyId), userApi.list(p.propertyId)]);
        return {
          rooms: config.status === "fulfilled" ? config.value.rooms?.length ?? 0 : 0,
          users: users.status === "fulfilled" ? users.value.length : 0,
        };
      })
    );
    return {
      properties: list.length,
      rooms: per.reduce((sum, x) => sum + x.rooms, 0),
      users: per.reduce((sum, x) => sum + x.users, 0),
    };
  } catch {
    return null;
  }
}

export default function OwnerSubscriptionPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [profile, plans, usage] = await Promise.all([
      fetchUserProfile(),
      fetchPlans().then((list) => list.filter((p) => p.status === "ACTIVE").map(toPlan)),
      countUsage(),
    ]);
    const reminders: any[] = [];
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

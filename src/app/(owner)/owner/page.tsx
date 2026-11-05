"use client";

// Tổng quan Owner — dữ liệu thật: GET /api/v1/user/profile, GET /api/properties,
// GET /api/properties/{id}/rooms/configuration và tiến độ thiết lập (computeSetupStatus).
// Doanh thu/công suất theo ngày chưa có API nên không hiển thị.
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { OwnerOverview, type OwnerOverviewData } from "@/features/owner-reports/components/OwnerOverview";
import { computeSetupStatus, propertyApi, roomApi, saasApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerDashboardPage() {
  const { data, loading, error, reload } = useAsyncData<OwnerOverviewData>(async () => {
    const [profile, list] = await Promise.all([saasApi.profile.get(), propertyApi.list()]);
    const properties = await Promise.all(
      list.map(async (p) => {
        const [config, setup] = await Promise.allSettled([roomApi.configuration(p.propertyId), computeSetupStatus(p.propertyId)]);
        return {
          id: String(p.propertyId),
          name: p.name,
          address: p.address,
          roomTypeCount: config.status === "fulfilled" ? config.value.roomTypes?.length ?? 0 : 0,
          roomCount: config.status === "fulfilled" ? config.value.rooms?.length ?? 0 : 0,
          setupCompleted: setup.status === "fulfilled" ? setup.value.completed.length : 1,
          setupTotal: setup.status === "fulfilled" ? setup.value.total : 10,
        };
      })
    );
    return { profile, properties };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng Quan Chuỗi Khách Sạn"
        description="Số lượng khách sạn, loại phòng, phòng và tiến độ cấu hình của tổ chức bạn."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <OwnerOverview data={data} />}
      </AsyncBoundary>
    </div>
  );
}

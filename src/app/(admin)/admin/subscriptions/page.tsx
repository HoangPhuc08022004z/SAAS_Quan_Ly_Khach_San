// FR-S04, FR-S05: Hàng đợi xét duyệt yêu cầu đăng ký thuê bao
// Service: api.adminListSubscriptions

import React from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionTable } from "@/features/admin/components/SubscriptionManagement";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await api.adminListSubscriptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xét Duyệt Yêu Cầu Thuê Bao"
        description="Xem xét hồ sơ doanh nghiệp khách sạn, duyệt đăng ký hoặc từ chối có lý do."
        breadcrumbs={[{ label: "SaaS Admin", href: "/admin" }, { label: "Duyệt đăng ký" }]}
      />

      <SubscriptionTable initialList={subscriptions} />
    </div>
  );
}

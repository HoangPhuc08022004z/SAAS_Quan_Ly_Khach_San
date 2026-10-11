// FR-S04, FR-S05: Chi tiết yêu cầu đăng ký thuê bao & Phê duyệt / Từ chối
// Service: api.adminGetSubscription, api.adminApproveSubscription, api.adminRejectSubscription, api.getSubscriptionPayment

import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionDetailView } from "@/features/admin/components/SubscriptionManagement";

export default async function AdminSubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const sub = await api.adminGetSubscription(id);

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Yêu Cầu Thuê Bao: ${sub.tenant?.name || sub.account?.full_name}`}
          description={`Mã đơn: ${sub.id} • Gửi ngày: ${sub.created_at.slice(0, 10)}`}
          breadcrumbs={[
            { label: "SaaS Admin", href: "/admin" },
            { label: "Duyệt đăng ký", href: "/admin/subscriptions" },
            { label: "Chi tiết yêu cầu" },
          ]}
        />

        <SubscriptionDetailView subscription={sub} />
      </div>
    );
  } catch {
    notFound();
  }
}

// FR: FR-S19
// Service: api.adminListTickets, api.adminGetTicket, api.adminUpdateTicket, api.adminReplyTicket
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SupportManagement } from "@/features/admin/components/SupportManagement";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const tickets = await api.adminListTickets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trung Tâm Hỗ Trợ & Khiếu Nại (Support Tickets)"
        description="Tiếp nhận, xử lý và phản hồi các yêu cầu trợ giúp kỹ thuật hoặc khiếu nại từ khách hàng doanh nghiệp."
      />
      <SupportManagement initialTickets={tickets} />
    </div>
  );
}

// FR: FR-S17, FR-S18, FR-S19
// Service: api.listMyTickets, api.createTicket, api.askSupportBot
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerSupportView } from "@/features/subscription/components/OwnerSupportView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerSupportPage() {
  const tickets = await api.listMyTickets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trung Tâm Hỗ Trợ Khách Hàng (Support Center)"
        description="Trò chuyện với trợ lý AI nền tảng hoặc gửi ticket yêu cầu hỗ trợ trực tiếp từ đội ngũ kỹ thuật."
      />
      <OwnerSupportView initialTickets={tickets} />
    </div>
  );
}

"use client";

// FR: FR-S19
// API: GET /api/v1/saas/admin/support-tickets, GET .../{id}, PATCH .../{id}/status
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SupportManagement } from "@/features/admin/components/SupportManagement";
import { fetchSupportTickets } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function AdminSupportPage() {
  const { data, loading, error, reload } = useAsyncData(fetchSupportTickets);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trung Tâm Hỗ Trợ & Khiếu Nại (Support Tickets)"
        description="Các câu hỏi mà chatbot không trả lời được sẽ tự động tạo ticket để Admin xử lý."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <SupportManagement initialTickets={data} />}
      </AsyncBoundary>
    </div>
  );
}

"use client";

// API: GET /api/properties/{propertyId}/chat?question= (OWNER, trả lời từ tài liệu chính sách của khách sạn)
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { propertyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyOwnerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(() => propertyApi.get(id));

  return (
    <div className="space-y-6">
      <Link
        href="/owner/properties"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách khách sạn</span>
      </Link>

      <PageHeader
        title={`Trợ Lý AI: ${data?.name ?? ""}`}
        description="Hỏi đáp dựa trên tài liệu chính sách (PDF) đã tải lên cho khách sạn này. Nếu chưa có tài liệu, hãy tải ở bước Tài liệu & Nội quy."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <ChatWidget mode="owner" propertyId={id} className="max-w-3xl h-[600px]" />}
      </AsyncBoundary>
    </div>
  );
}

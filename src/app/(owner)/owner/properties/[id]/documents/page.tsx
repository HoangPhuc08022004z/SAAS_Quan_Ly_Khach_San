"use client";

// FR: FR-C04, FR-C13
// API: GET/PUT /api/properties/{propertyId}/policy-documents
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { DocumentConfig } from "@/features/property-config/components/DocumentConfig";
import { propertyApi, policyDocumentApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, docs] = await Promise.all([propertyApi.get(id), policyDocumentApi.list(id)]);
    return { property, docs: docs.documents ?? [] };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${id}/setup`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Wizard thiết lập</span>
        </Link>
      </div>

      <PageHeader
        title={`Tài Liệu & Nội Quy Khách Sạn: ${data?.property.name ?? ""}`}
        description="Nạp cẩm nang hướng dẫn, tiện ích và quy định vào cơ sở dữ liệu tri thức của trợ lý ảo AI."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <DocumentConfig propertyId={id} initialDocs={data.docs} />}
      </AsyncBoundary>
    </div>
  );
}

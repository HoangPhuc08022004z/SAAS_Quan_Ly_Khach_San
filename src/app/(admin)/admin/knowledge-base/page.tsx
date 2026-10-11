// FR: FR-S22
// Service: api.adminListKbFiles, api.adminUploadKbFile, api.adminDeleteKbFile, api.adminReindexKbFile
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KbManagement } from "@/features/admin/components/KbManagement";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgeBasePage() {
  const files = await api.adminListKbFiles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Trị Cơ Sở Tri Thức (Knowledge Base RAG)"
        description="Nạp và quản lý các tài liệu chính sách, hướng dẫn vận hành nền tảng để cung cấp ngữ cảnh cho Chatbot AI."
      />
      <KbManagement initialFiles={files} />
    </div>
  );
}

// FR: FR-S22
// API: POST /api/files/pdf, DELETE /api/files/pdf/{fileId}
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KbManagement } from "@/features/admin/components/KbManagement";

export default function AdminKnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Trị Cơ Sở Tri Thức (Knowledge Base RAG)"
        description="Nạp tài liệu PDF chính sách, hướng dẫn vận hành nền tảng để cung cấp ngữ cảnh cho Chatbot AI."
      />
      <KbManagement />
    </div>
  );
}

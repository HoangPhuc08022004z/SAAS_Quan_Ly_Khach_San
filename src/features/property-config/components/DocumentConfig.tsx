"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatBytes } from "@/lib/utils/format";
import { policyDocumentApi, type ApiPolicyDocuments } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Trash2, Database } from "lucide-react";

export function DocumentConfig({
  propertyId,
  initialDocs,
}: {
  propertyId: string;
  initialDocs: ApiPolicyDocuments["documents"];
}) {
  type Doc = ApiPolicyDocuments["documents"][number];
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [docToDelete, setDocToDelete] = useState<Doc | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // PUT /api/properties/{propertyId}/policy-documents (multipart): thêm file và/hoặc xóa theo fileId
  const refresh = async () => setDocs((await policyDocumentApi.list(propertyId)).documents ?? []);

  const handleUpload = async (_meta: unknown, file: File) => {
    setIsUploading(true);
    try {
      const res = await policyDocumentApi.update(propertyId, [file], []);
      await refresh();
      toast.success(res?.message || `Đã tải lên tài liệu "${file.name}" thành công!`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải tài liệu lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await policyDocumentApi.update(propertyId, [], [docToDelete.fileId]);
      await refresh();
      toast.success("Đã xóa tài liệu khỏi khách sạn.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa tài liệu này.");
    } finally {
      setDocToDelete(null);
    }
  };

  const columns: Column<Doc>[] = [
    {
      key: "fileName",
      header: "Tên tài liệu chính sách",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">{d.fileName}</div>
            <div className="text-[11px] text-slate-400">{formatBytes(d.fileSize)} • {d.fileType}</div>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (d) => (
        <button
          onClick={() => setDocToDelete(d)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
          title="Xóa tài liệu"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tải Lên Nội Quy & Cẩm Nang Dịch Vụ Khách Sạn
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Các tài liệu tải lên sẽ được phân tích tự động để làm nguồn trả lời (RAG) cho Chatbot khi khách hàng hỏi đáp trên trang công khai của khách sạn.
        </p>

        <FileDropzone
          acceptedTypes={[".pdf", ".docx", ".txt"]}
          maxSizeBytes={10 * 1024 * 1024}
          onFileSelect={handleUpload}
        />
        {isUploading && <p className="text-xs text-blue-600">Đang tải lên...</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Danh mục tài liệu chính sách đã lưu ({docs.length})
        </h3>
        <DataTable columns={columns} data={docs} exportFileName="tai-lieu-khach-san" />
      </div>

      <ConfirmDialog
        isOpen={!!docToDelete}
        title="Xác nhận xóa tài liệu nội quy"
        description={`Bạn có chắc chắn muốn xóa tệp "${docToDelete?.fileName}"? Chatbot sẽ không thể tra cứu thông tin từ tài liệu này.`}
        confirmText="Xóa tài liệu"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setDocToDelete(null)}
      />
    </div>
  );
}

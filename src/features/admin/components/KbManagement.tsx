"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatBytes } from "@/lib/utils/format";
import { uploadKnowledgePdf, deleteKnowledgePdf } from "@/lib/api";
import type { FileMetadata } from "@/lib/api/types/openapi.interface";
import { toast } from "sonner";
import { FileText, Trash2, Database } from "lucide-react";

export function KbManagement() {
  // Backend không có API liệt kê file → chỉ hiển thị các file tải lên trong phiên làm việc này
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);

  const handleUpload = async (_meta: unknown, file: File) => {
    setIsUploading(true);
    try {
      // Gọi OpenAPI: POST /api/files/pdf
      const created = await uploadKnowledgePdf(file);
      setFiles((prev) => [created, ...prev]);
      toast.success(`Đã tải lên tài liệu "${created.fileName}" thành công.`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải tài liệu lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      // Gọi OpenAPI: DELETE /api/files/pdf/{fileId}
      await deleteKnowledgePdf(fileToDelete.fileId);
      setFiles((prev) => prev.filter((f) => f.fileId !== fileToDelete.fileId));
      toast.success("Đã xóa tài liệu khỏi cơ sở tri thức.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa tài liệu.");
    } finally {
      setFileToDelete(null);
    }
  };

  const columns: Column<FileMetadata>[] = [
    {
      key: "fileName",
      header: "Tên tài liệu",
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">{f.fileName}</div>
            <div className="text-[11px] text-slate-400">{formatBytes(f.fileSize)} • {f.fileType}</div>
          </div>
        </div>
      ),
    },
    {
      key: "storagePath",
      header: "Đường dẫn lưu trữ (MinIO)",
      render: (f) => <span className="font-mono text-[11px] text-slate-500 break-all">{f.storagePath}</span>,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (f) => (
        <button
          onClick={() => setFileToDelete(f)}
          title="Xóa tài liệu"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tải Lên Tài Liệu Tri Thức Hệ Thống</h3>
        </div>
        <p className="text-xs text-slate-400">
          Chỉ nhận file PDF (tối đa 100 MB). Lưu ý: chatbot chỉ nạp tài liệu mới vào vector store khi backend khởi động lại.
        </p>
        <FileDropzone acceptedTypes={[".pdf"]} maxSizeBytes={100 * 1024 * 1024} onFileSelect={handleUpload} />
        {isUploading && <p className="text-xs text-blue-600">Đang tải lên...</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Tài liệu đã tải lên trong phiên này ({files.length})
        </h3>
        <p className="text-[11px] text-slate-400">
          Hệ thống chưa có API liệt kê toàn bộ tài liệu nên danh sách chỉ gồm các file bạn vừa tải lên.
        </p>
        <DataTable columns={columns} data={files} exportFileName="tai-lieu-knowledge-base" />
      </div>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Xác nhận xóa tài liệu khỏi Knowledge Base"
        description={`Bạn có chắc chắn muốn xóa tệp "${fileToDelete?.fileName}"?`}
        confirmText="Xóa tài liệu"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setFileToDelete(null)}
      />
    </div>
  );
}

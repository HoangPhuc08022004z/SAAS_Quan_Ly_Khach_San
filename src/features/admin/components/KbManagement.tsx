"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatBytes } from "@/lib/utils/format";
import { DateText } from "@/components/data/DateText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FileText, RefreshCw, Trash2, Database, UploadCloud } from "lucide-react";

export function KbManagement({ initialFiles }: { initialFiles: any[] }) {
  const [files, setFiles] = useState<any[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);

  const handleUpload = async (fileObj: { name: string; size: number; type: string }) => {
    setIsUploading(true);
    try {
      const created = await api.adminUploadKbFile(fileObj as any);
      setFiles((prev) => [created, ...prev]);
      toast.success(`Đã tải lên tài liệu "${fileObj.name}" thành công.`);
    } catch {
      toast.error("Không thể tải tài liệu lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReindex = async (fileId: string) => {
    setReindexingId(fileId);
    try {
      const updated = await api.adminReindexKbFile(fileId);
      setFiles((prev) => prev.map((f) => (f.id === fileId ? updated : f)));
      toast.success("Đã hoàn tất phân tích & lập chỉ mục lại (Re-indexed).");
    } catch {
      toast.error("Lỗi khi lập chỉ mục lại.");
    } finally {
      setReindexingId(null);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      await api.adminDeleteKbFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      toast.success("Đã xóa tài liệu khỏi cơ sở tri thức.");
      setFileToDelete(null);
    } catch {
      toast.error("Không thể xóa tài liệu.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "filename",
      header: "Tên tài liệu",
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">{f.filename}</div>
            <div className="text-[11px] text-slate-400">{formatBytes(f.file_size)} • {f.mime_type}</div>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Ngày tải lên",
      sortable: true,
      render: (f) => <DateText date={f.created_at} type="datetime" className="text-xs text-slate-500" />,
    },
    {
      key: "index_status",
      header: "Trạng thái chỉ mục (RAG)",
      render: (f) => (
        <StatusBadge type="index" status={f.index_status || "INDEXED"} />
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (f) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReindex(f.id)}
            disabled={reindexingId === f.id}
            title="Lập chỉ mục lại"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reindexingId === f.id ? "animate-spin text-blue-500" : ""}`} />
          </button>
          <button
            onClick={() => setFileToDelete(f)}
            title="Xóa tài liệu"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tải Lên Tài Liệu Tri Thức Hệ Thống</h3>
        </div>
        <p className="text-xs text-slate-400">
          Các tài liệu PDF, DOCX, TXT sẽ được vector hóa và nạp vào cơ sở dữ liệu tri thức của Chatbot hỗ trợ SaaS.
        </p>
        <FileDropzone
          acceptedTypes={[".pdf", ".docx", ".txt"]}
          maxSizeBytes={10 * 1024 * 1024}
          onFileSelect={handleUpload}
        />
      </div>

      {/* Files list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Danh sách tài liệu đã lập chỉ mục ({files.length})
        </h3>
        <DataTable columns={columns} data={files} exportFileName="tai-lieu-knowledge-base" />
      </div>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Xác nhận xóa tài liệu khỏi Knowledge Base"
        description={`Bạn có chắc chắn muốn xóa tệp "${fileToDelete?.filename}"? Chatbot sẽ không thể truy xuất thông tin từ tài liệu này nữa.`}
        confirmText="Xóa tài liệu"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setFileToDelete(null)}
      />
    </div>
  );
}

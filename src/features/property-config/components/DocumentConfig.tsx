"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { DateText } from "@/components/data/DateText";
import { formatBytes } from "@/lib/utils/format";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Trash2, Database, UploadCloud } from "lucide-react";

export function DocumentConfig({
  propertyId,
  initialDocs,
}: {
  propertyId: string;
  initialDocs: any[];
}) {
  const [docs, setDocs] = useState<any[]>(initialDocs);
  const [docToDelete, setDocToDelete] = useState<any | null>(null);

  const handleUpload = async (fileObj: { name: string; size: number; type: string }) => {
    try {
      const created = await api.uploadPropertyDoc(propertyId, fileObj as any);
      setDocs((prev) => [created, ...prev]);
      toast.success(`Đã tải lên tài liệu "${fileObj.name}" thành công!`);
    } catch {
      toast.error("Không thể tải tài liệu lên.");
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await api.deletePropertyDoc(propertyId, docToDelete.id);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success("Đã xóa tài liệu khỏi khách sạn.");
      setDocToDelete(null);
    } catch {
      toast.error("Không thể xóa tài liệu này.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "filename",
      header: "Tên tài liệu chính sách",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">{d.filename}</div>
            <div className="text-[11px] text-slate-400">{formatBytes(d.file_size)} • {d.mime_type}</div>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Ngày tải lên",
      sortable: true,
      render: (d) => <DateText date={d.created_at} type="datetime" className="text-xs text-slate-500" />,
    },
    {
      key: "index_status",
      header: "Trạng thái Chatbot AI",
      render: (d) => <StatusBadge type="index" status={d.index_status || "INDEXED"} />,
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
        description={`Bạn có chắc chắn muốn xóa tệp "${docToDelete?.filename}"? Chatbot sẽ không thể tra cứu thông tin từ tài liệu này.`}
        confirmText="Xóa tài liệu"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setDocToDelete(null)}
      />
    </div>
  );
}

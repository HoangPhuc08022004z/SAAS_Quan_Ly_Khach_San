"use client";

import React, { useState } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";

interface FileDropzoneProps {
  onFileSelect: (file: { name: string; size: number; type: string }) => void;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  acceptedTypes = [".pdf", ".docx", ".txt"],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  className,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > maxSizeBytes) {
      setError(`Dung lượng file vượt quá giới hạn cho phép (${formatBytes(maxSizeBytes)}).`);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(ext)) {
      setError(`Định dạng file không hợp lệ. Chỉ chấp nhận: ${acceptedTypes.join(", ")}`);
      return;
    }

    setError(null);
    onFileSelect({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
          isDragOver
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Kéo thả file vào đây hoặc <span className="text-blue-600 underline">chọn từ thiết bị</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Hỗ trợ: {acceptedTypes.join(", ")} (Tối đa {formatBytes(maxSizeBytes)})
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

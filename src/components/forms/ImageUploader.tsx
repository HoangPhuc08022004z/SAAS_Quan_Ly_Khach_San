"use client";

import React, { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState(value || "");

  const handleApply = () => {
    if (urlInput.trim()) onChange(urlInput.trim());
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-video max-w-sm bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange("");
              setUrlInput("");
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2 max-w-md">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Dán đường dẫn ảnh (URL)..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Áp dụng</span>
          </button>
        </div>
      )}
    </div>
  );
}

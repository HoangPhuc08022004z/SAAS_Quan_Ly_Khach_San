"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Thêm tiện ích (nhấn Enter)...",
  className,
}: TagInputProps) {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 min-h-[38px] p-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 flex items-center min-w-[140px]">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : "Thêm tiếp..."}
            className="w-full text-xs px-2 py-1 bg-transparent focus:outline-none dark:text-white"
          />
          {inputVal && (
            <button
              type="button"
              onClick={addTag}
              className="p-1 text-slate-400 hover:text-blue-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

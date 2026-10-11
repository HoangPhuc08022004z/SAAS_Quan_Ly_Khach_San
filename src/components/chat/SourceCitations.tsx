import React from "react";
import { FileText } from "lucide-react";

export function SourceCitations({ citations }: { citations: string[] }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-1 font-semibold mb-1 text-slate-700 dark:text-slate-300">
        <FileText className="w-3 h-3 text-blue-500" />
        <span>Tài liệu tham chiếu (RAG):</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {citations.map((c, i) => (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

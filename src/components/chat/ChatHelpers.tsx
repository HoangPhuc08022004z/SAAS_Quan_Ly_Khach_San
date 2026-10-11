"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FeedbackButtons({ onFeedback }: { onFeedback: (isHelpful: boolean) => void }) {
  const [voted, setVoted] = useState<boolean | null>(null);

  const handleVote = (val: boolean) => {
    setVoted(val);
    onFeedback(val);
  };

  return (
    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
      <span>Hữu ích?</span>
      <button
        onClick={() => handleVote(true)}
        disabled={voted !== null}
        className={cn(
          "p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          voted === true && "text-emerald-600 font-bold"
        )}
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={voted !== null}
        className={cn(
          "p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          voted === false && "text-rose-600 font-bold"
        )}
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
    </div>
  );
}

export function RoleSuggestionChips({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (q: string) => void;
}) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800">
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s)}
          className="text-left px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all text-[11px]"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { getDb } from "@/mocks/db";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const db = getDb();
  const notifications = db._ext_notification.slice(0, 5);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        title="Thông báo hệ thống"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Thông báo gần đây
            </h4>
            <span className="text-[11px] text-slate-400">{notifications.length} tin</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto mt-1">
            {notifications.map((n: any) => (
              <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {n.guest_name}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">Hôm nay</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

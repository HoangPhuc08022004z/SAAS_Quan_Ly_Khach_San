"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield, Hotel, Sparkles, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";

export function UserMenu() {
  const { account, user, role, logoutAll, isAdmin, isOwner } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const displayName = user?.full_name || account?.full_name || "Người dùng";
  const displayEmail = user?.email || account?.email || "";
  const roleLabel = isAdmin ? "SaaS Admin" : isOwner ? "Chủ khách sạn (Owner)" : role?.name || "Nhân viên PMS";

  const handleLogout = () => {
    logoutAll();
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-xs shadow-sm">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
            <span className="mt-1 inline-block text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
              {roleLabel}
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cổng SaaS Admin</span>
            </Link>
            <Link
              href="/owner"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cổng Owner</span>
            </Link>
            <Link
              href="/pms"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
            >
              <Hotel className="w-3.5 h-3.5 text-blue-500" />
              <span>Cổng Vận hành PMS</span>
            </Link>
            <Link
              href="/dev/reset"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 rounded-lg"
            >
              <span>🛠️ Đặt lại dữ liệu mẫu</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

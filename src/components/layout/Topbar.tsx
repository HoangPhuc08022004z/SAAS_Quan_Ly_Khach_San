"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bot, Command } from "lucide-react";
import { PropertySwitcher } from "./PropertySwitcher";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "@/lib/auth/use-session";

interface TopbarProps {
  portal: "admin" | "owner" | "pms";
  onOpenMobileMenu?: () => void;
  onOpenChatbot?: () => void;
}

export function Topbar({ portal, onOpenMobileMenu, onOpenChatbot }: TopbarProps) {
  const [quickSearch, setQuickSearch] = useState("");
  const router = useRouter();
  const { isPmsStaff } = useSession();

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/pms/reservations?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {(portal === "owner" || portal === "pms") && <PropertySwitcher />}

        {/* Quick Search Reservation in PMS (Ctrl+K) */}
        {portal === "pms" && (
          <form onSubmit={handleQuickSearchSubmit} className="hidden md:flex relative items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Tìm nhanh đặt phòng (mã, tên, SĐT)..."
              className="w-64 lg:w-80 pl-9 pr-8 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
            <div className="pointer-events-none absolute right-2.5 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </form>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Open Chatbot Launcher in PMS */}
        {portal === "pms" && (
          <button
            type="button"
            onClick={onOpenChatbot || (() => router.push("/pms/chat"))}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-blue-500/20"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Trợ lý AI</span>
          </button>
        )}

        <NotificationBell />
        <ThemeToggle />
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
        <UserMenu />
      </div>
    </header>
  );
}

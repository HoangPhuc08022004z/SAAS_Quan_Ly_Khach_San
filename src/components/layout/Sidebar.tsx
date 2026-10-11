"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hotel, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { ADMIN_NAV, OWNER_NAV, PMS_NAV } from "@/config/nav";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  portal: "admin" | "owner" | "pms";
  className?: string;
}

export function Sidebar({ portal, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { subscription, isSubscriptionExpired } = useSession();

  const navItems = portal === "admin" ? ADMIN_NAV : portal === "owner" ? OWNER_NAV : PMS_NAV;
  const portalName =
    portal === "admin"
      ? "SaaS Admin"
      : portal === "owner"
      ? "Cổng Chủ Khách Sạn"
      : "Vận Hành Khách Sạn";

  const isExpiringSoon = portal === "owner" && subscription?.id === "sub_sunrise";

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 z-40 select-none",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand & Portal Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
        <Link href={portal === "admin" ? "/admin" : portal === "owner" ? "/owner" : "/pms"} className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Hotel className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                HotelSaaS
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {portalName}
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Subscription Warnings in Owner portal */}
      {portal === "owner" && !collapsed && (
        <>
          {isSubscriptionExpired && (
            <div className="m-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Thuê bao hết hạn</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight opacity-90">
                Hệ thống vận hành đang bị tạm khóa.
              </p>
              <Link
                href="/owner/subscription"
                className="mt-2 block text-center py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Gia hạn ngay
              </Link>
            </div>
          )}
          {isExpiringSoon && !isSubscriptionExpired && (
            <div className="m-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Hết hạn trong 5 ngày</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight opacity-90">
                Gia hạn sớm để không bị gián đoạn hoạt động.
              </p>
              <Link
                href="/owner/subscription"
                className="mt-2 block text-center py-1 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
              >
                Gia hạn thuê bao
              </Link>
            </div>
          )}
        </>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            title={item.title}
            href={item.href}
            iconName={item.icon}
            badge={item.badge}
            permission={item.permission}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-200/80 text-[11px] text-slate-400 dark:border-slate-800 text-center">
          HotelSaaS Platform v1.0.0
        </div>
      )}
    </aside>
  );
}

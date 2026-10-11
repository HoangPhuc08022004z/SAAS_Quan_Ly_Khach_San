"use client";

import React from "react";
import Link from "next/link";
import { X, Hotel } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { ADMIN_NAV, OWNER_NAV, PMS_NAV } from "@/config/nav";

interface MobileDrawerProps {
  portal: "admin" | "owner" | "pms";
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ portal, isOpen, onClose }: MobileDrawerProps) {
  if (!isOpen) return null;

  const navItems = portal === "admin" ? ADMIN_NAV : portal === "owner" ? OWNER_NAV : PMS_NAV;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col w-72 max-w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Hotel className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">HotelSaaS</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" onClick={onClose}>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              title={item.title}
              href={item.href}
              iconName={item.icon}
              badge={item.badge}
              permission={item.permission}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

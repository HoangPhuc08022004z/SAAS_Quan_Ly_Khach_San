"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCan } from "@/lib/auth/use-can";

interface SidebarItemProps {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  permission?: string;
  collapsed?: boolean;
}

export function SidebarItem({
  title,
  href,
  iconName,
  badge,
  permission,
  collapsed = false,
}: SidebarItemProps) {
  const pathname = usePathname();
  const canAccess = useCan(permission);

  if (!canAccess) return null;

  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 5);
  // @ts-expect-error icon dynamic lookup
  const IconComponent = Icons[iconName] || Icons.Circle;

  return (
    <Link
      href={href}
      title={collapsed ? title : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150",
        isActive
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white",
        collapsed && "justify-center px-2 py-2.5"
      )}
    >
      <IconComponent
        className={cn(
          "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
          isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
        )}
      />
      {!collapsed && <span className="truncate flex-1">{title}</span>}
      {!collapsed && badge && (
        <span
          className={cn(
            "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
            isActive
              ? "bg-white/20 text-white"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

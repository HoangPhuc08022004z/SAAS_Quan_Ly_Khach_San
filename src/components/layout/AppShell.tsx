"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileDrawer } from "./MobileDrawer";
import { useSession } from "@/lib/auth/use-session";
import { AlertOctagon } from "lucide-react";

interface AppShellProps {
  portal: "admin" | "owner" | "pms";
  children: React.ReactNode;
}

export function AppShell({ portal, children }: AppShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { isTenantSuspended, isSubscriptionExpired } = useSession();

  const isBlockedFromPms = portal === "pms" && (isTenantSuspended || isSubscriptionExpired);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <Sidebar portal={portal} className="hidden lg:flex" />

      {/* Mobile Drawer */}
      <MobileDrawer
        portal={portal}
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          portal={portal}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isBlockedFromPms ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30 my-8 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 mb-4">
                <AlertOctagon className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
                Tổ chức khách sạn đang bị tạm khóa
              </h2>
              <p className="mt-2 text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                Gói thuê bao của tổ chức này đã hết hạn hoặc bị tạm ngưng. Toàn bộ tính năng vận hành PMS tạm thời bị khóa cho đến khi gia hạn.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/owner/subscription"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Đến trang Gia hạn thuê bao
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                >
                  Đổi tài khoản khác
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

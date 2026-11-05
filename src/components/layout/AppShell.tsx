"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PMS_NAV } from "@/config/nav";
import { useCan } from "@/lib/auth/use-can";
import { useSessionStore } from "@/lib/auth/session-store";
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
  const { isTenantSuspended, isSubscriptionExpired, isAdmin, isOwner, isPmsStaff } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(() => useSessionStore.persist.hasHydrated());

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) setHydrated(true);
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  // Chặn vào sai cổng: mỗi cổng chỉ nhận đúng loại tài khoản (Admin / Owner / nhân viên PMS)
  const allowed = portal === "admin" ? isAdmin : portal === "owner" ? isOwner : isPmsStaff;
  useEffect(() => {
    if (hydrated && !allowed) router.replace(portal === "pms" ? "/pms/login" : "/login");
  }, [hydrated, allowed, portal, router]);

  // Trang PMS yêu cầu quyền cụ thể: lấy mục menu khớp đường dẫn dài nhất
  const required =
    portal === "pms"
      ? [...PMS_NAV]
          .filter((i) => i.permission && (pathname === i.href || pathname.startsWith(`${i.href}/`)))
          .sort((a, b) => b.href.length - a.href.length)[0]?.permission
      : undefined;
  const hasPermission = useCan(required);
  useEffect(() => {
    if (hydrated && allowed && !hasPermission) router.replace("/pms");
  }, [hydrated, allowed, hasPermission, router]);

  if (!hydrated || !allowed || !hasPermission) return null;

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
                Gói thuê bao của tổ chức này đã hết hạn hoặc bị tạm ngưng. Toàn bộ tính năng vận hành PMS tạm thời bị khóa. Vui lòng liên hệ chủ khách sạn để gia hạn.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/pms/login"
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

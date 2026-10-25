"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchUserProfile, saasApi } from "@/lib/api";
import { getOwnerLanding, OWNER_PUBLIC_PATHS } from "@/lib/auth/owner-landing";
import { Loader2 } from "lucide-react";

/**
 * Chặn các trang nghiệp vụ của Owner cho đến khi thuê bao ACTIVE:
 * chưa có gói → /owner/subscribe, đã gửi yêu cầu / chờ thanh toán / hết hạn → /owner/subscription.
 */
export function OwnerSubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isOpenPath = OWNER_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [checkedPath, setCheckedPath] = useState<string | null>(null);

  useEffect(() => {
    if (isOpenPath) return;
    let alive = true;
    // Token nằm trong localStorage nên chỉ đọc trong effect (đọc lúc render sẽ lệch HTML SSR → hydration error)
    const request = saasApi.getToken() ? fetchUserProfile() : Promise.reject(new Error("no token"));
    request
      .then((profile) => {
        if (!alive) return;
        const landing = getOwnerLanding(profile.subscriptionStatus);
        if (landing === "/owner") setCheckedPath(pathname);
        else router.replace(landing);
      })
      .catch(() => {
        // không xác định được → không chặn, để từng trang tự xử lý lỗi
        if (alive) setCheckedPath(pathname);
      });
    return () => {
      alive = false;
    };
  }, [pathname, isOpenPath, router]);

  if (!isOpenPath && checkedPath !== pathname) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Đang kiểm tra gói dịch vụ...</span>
      </div>
    );
  }
  return <>{children}</>;
}

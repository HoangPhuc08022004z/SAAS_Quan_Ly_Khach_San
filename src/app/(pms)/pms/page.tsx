"use client";

// Không có bảng điều khiển: /pms chuyển thẳng tới màn đầu tiên mà vai trò hiện tại dùng được
// (lễ tân → Tìm phòng trống, buồng phòng → Quản lý buồng phòng...).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PMS_NAV } from "@/config/nav";
import { matchesPmsRole, normalizePermission } from "@/config/roles";
import { useSessionStore } from "@/lib/auth/session-store";

export default function PmsLandingPage() {
  const router = useRouter();
  const { permissions, role, account } = useSessionStore();

  useEffect(() => {
    const granted = new Set(permissions.map(normalizePermission));
    const target =
      PMS_NAV.find(
        (i) =>
          i.permission &&
          (account?.is_admin || granted.has(i.permission)) &&
          (!i.roles || matchesPmsRole(role, i.roles))
      )?.href ?? "/pms/profile";
    router.replace(target);
  }, [permissions, role, account, router]);

  return <p className="text-sm text-muted-foreground">Đang chuyển trang...</p>;
}

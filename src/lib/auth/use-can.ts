"use client";

import { useSessionStore } from "./session-store";
import { PermissionCode } from "@/config/permissions";
import { normalizePermission } from "@/config/roles";

/** Admin: toàn quyền cổng Admin. Nhân viên PMS: chỉ theo danh sách `permissions` backend trả khi đăng nhập. Owner không có quyền PMS. */
export function useCan(permissionCode?: PermissionCode | string): boolean {
  const { account, user, permissions } = useSessionStore();

  if (!permissionCode) return true;
  if (account?.is_admin) return true;
  if (!user) return false;

  return permissions.some((p) => normalizePermission(p) === permissionCode);
}

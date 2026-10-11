"use client";

import { useSessionStore } from "./session-store";
import { PermissionCode } from "@/config/permissions";

export function useCan(permissionCode?: PermissionCode | string): boolean {
  const { account, permissions, role } = useSessionStore();

  if (!permissionCode) return true;
  if (account?.is_admin) return true;
  if (role?.code === "MANAGER") return true;

  return permissions.includes(permissionCode);
}

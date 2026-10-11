"use client";

import React from "react";
import { useCan } from "./use-can";
import { PermissionCode } from "@/config/permissions";

interface CanProps {
  permission: PermissionCode | string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const allowed = useCan(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

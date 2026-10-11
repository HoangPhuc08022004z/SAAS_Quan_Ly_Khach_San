import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell portal="admin">{children}</AppShell>;
}

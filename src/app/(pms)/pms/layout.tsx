import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function PmsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell portal="pms">{children}</AppShell>;
}

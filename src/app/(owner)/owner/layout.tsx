import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriptionBanner } from "@/features/subscription/components/SubscriptionBanner";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell portal="owner">
      <SubscriptionBanner />
      {children}
    </AppShell>
  );
}

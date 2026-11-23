"use client";

// API: GET/PATCH/POST .../daily-statistics (xem NightAuditView) — chỉ role MANAGER
import React from "react";
import { NightAuditView } from "@/features/night-audit/components/NightAuditView";

export default function NightAuditPage() {
  return <NightAuditView />;
}

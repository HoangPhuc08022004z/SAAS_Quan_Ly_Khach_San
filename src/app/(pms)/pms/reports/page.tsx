// FR: FR-O41, FR-O52
// Service: api.listDailyStats, api.approveReport

import { api } from "@/lib/api";
import { PmsReportsView } from "@/features/report/components/PmsReportsView";

export const dynamic = "force-dynamic";

export default async function PmsReportsPage() {
  const stats = await api.listDailyStats({ from: "2026-10-01", to: "2026-10-14" });

  return <PmsReportsView initialStats={stats} />;
}

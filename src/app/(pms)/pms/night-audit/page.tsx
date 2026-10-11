// FR: FR-O40, FR-O41, FR-O42, FR-O43
// Service: api.runDailyStatsJob, api.listDailyStats, api.getDailyStats, api.adjustDailyStats, api.confirmDailyStats

import { api } from "@/lib/api";
import { NightAuditView } from "@/features/night-audit/components/NightAuditView";

export const dynamic = "force-dynamic";

export default async function NightAuditPage() {
  const statsList = await api.listDailyStats();

  return <NightAuditView initialStats={statsList} />;
}

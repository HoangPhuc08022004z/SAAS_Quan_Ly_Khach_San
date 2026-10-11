// FR: FR-O08, FR-O10
// Service: api.listPmsRooms, api.setRoomStatus, api.getHousekeepingSchedule

import { api } from "@/lib/api";
import { HousekeepingView } from "@/features/housekeeping/components/HousekeepingView";

export const dynamic = "force-dynamic";

export default async function HousekeepingPage() {
  const [schedule, issues] = await Promise.all([
    api.getHousekeepingSchedule("2026-10-11"),
    api.listHkIssues(),
  ]);

  return <HousekeepingView initialSchedule={schedule} initialIssues={issues} />;
}

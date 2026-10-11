// FR: FR-O09
// Service: api.listHkIssues, api.createHkIssue, api.resolveHkIssue

import { api } from "@/lib/api";
import { HousekeepingIssuesView } from "@/features/housekeeping/components/HousekeepingIssuesView";

export const dynamic = "force-dynamic";

export default async function HousekeepingIssuesPage() {
  const [issues, rooms] = await Promise.all([
    api.listHkIssues(),
    api.listPmsRooms(),
  ]);

  return <HousekeepingIssuesView initialIssues={issues} rooms={rooms} />;
}

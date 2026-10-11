// FR: FR-O35, FR-O36, FR-O37, FR-O38, FR-O39
// Service: api.listNoShowCandidates, api.sendNotification, api.confirmNoShow, api.createRefundRequest, api.setRoomStatus, api.runNoShowDetectJob

import { api } from "@/lib/api";
import { NoShowManagementView } from "@/features/noshow/components/NoShowManagementView";

export const dynamic = "force-dynamic";

export default async function NoShowPage() {
  const candidates = await api.listNoShowCandidates();

  return <NoShowManagementView initialCandidates={candidates as any} />;
}

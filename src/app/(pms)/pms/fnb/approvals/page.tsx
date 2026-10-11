// FR: FR-O19
// Service: api.listFnbRequests, api.approveFnbRequest, api.rejectFnbRequest

import { api } from "@/lib/api";
import { FnbApprovalView } from "@/features/fnb/components/FnbApprovalView";

export const dynamic = "force-dynamic";

export default async function FnbApprovalsPage() {
  const requests = await api.listFnbRequests();

  return <FnbApprovalView initialRequests={requests as any} />;
}

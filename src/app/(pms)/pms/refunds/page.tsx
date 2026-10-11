// FR: FR-O32, FR-O33, FR-O34
// Service: api.listRefunds, api.createRefundRequest, api.executeRefund, api.setRefundStatus

import { api } from "@/lib/api";
import { RefundManagementView } from "@/features/refund/components/RefundManagementView";

export const dynamic = "force-dynamic";

export default async function RefundsPage() {
  const [refunds, reservations] = await Promise.all([
    api.listRefunds(),
    api.searchReservations(),
  ]);

  return (
    <RefundManagementView
      initialRefunds={refunds}
      reservations={reservations}
    />
  );
}

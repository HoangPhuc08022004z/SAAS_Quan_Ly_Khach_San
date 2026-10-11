// FR: FR-O27, FR-O28, FR-O29, FR-O30, FR-O31
// Service: api.searchReservations, api.getCancellationQuote, api.cancelReservation, api.sendNotification

import { api } from "@/lib/api";
import { CancellationView } from "@/features/cancellation/components/CancellationView";

export const dynamic = "force-dynamic";

export default async function CancellationPage() {
  const reservations = await api.searchReservations();

  return <CancellationView initialReservations={reservations as any} />;
}

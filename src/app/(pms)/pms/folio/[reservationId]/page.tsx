// FR: FR-O12, FR-O23, FR-O26
// Service: api.getFolio, api.addFolioCharge

import { api } from "@/lib/api";
import { FolioManager } from "@/features/checkout/components/FolioManager";

export const dynamic = "force-dynamic";

interface FolioPageProps {
  params: Promise<{ reservationId: string }>;
}

export default async function FolioDetailPage({ params }: FolioPageProps) {
  const { reservationId } = await params;
  const [reservation, folios] = await Promise.all([
    api.getReservation(reservationId),
    api.getFolio(reservationId),
  ]);

  return (
    <FolioManager
      initialReservation={reservation}
      initialFolios={folios}
    />
  );
}

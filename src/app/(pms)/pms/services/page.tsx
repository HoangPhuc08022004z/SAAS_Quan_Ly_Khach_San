// FR: FR-O24, FR-O25, FR-O26
// Service: api.listPmsServices, api.createServiceRequest

import { api } from "@/lib/api";
import { ServiceView } from "@/features/service/components/ServiceView";

export const dynamic = "force-dynamic";

export default async function PmsServicesPage() {
  const [services, reservations] = await Promise.all([
    api.listPmsServices(),
    api.searchReservations(),
  ]);

  return (
    <ServiceView
      initialServices={services}
      reservations={reservations as any}
    />
  );
}

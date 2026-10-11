// FR: FR-O20
// Service: api.updateFnbActual

import { api } from "@/lib/api";
import { FnbActualsView } from "@/features/fnb/components/FnbActualsView";

export const dynamic = "force-dynamic";

export default async function FnbActualsPage() {
  const items = await api.listFnbMenu();

  return <FnbActualsView initialItems={items} />;
}

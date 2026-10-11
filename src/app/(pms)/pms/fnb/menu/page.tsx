// FR: FR-O17, FR-O21
// Service: api.listFnbMenu

import { api } from "@/lib/api";
import { FnbMenuView } from "@/features/fnb/components/FnbMenuView";

export const dynamic = "force-dynamic";

export default async function FnbMenuPage() {
  const items = await api.listFnbMenu();

  return <FnbMenuView initialItems={items} />;
}

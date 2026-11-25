// FR: FR-O17, FR-O21
// Service: GET /api/properties/{id}/fnb-menu (fnbApi.list) — tải ở client vì cần token + propertyId của phiên nhân viên

import { FnbMenuView } from "@/features/fnb/components/FnbMenuView";

export default function FnbMenuPage() {
  return <FnbMenuView />;
}

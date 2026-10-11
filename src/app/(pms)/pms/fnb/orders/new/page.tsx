// FR: FR-O18, FR-O22, FR-O23
// Service: api.listFnbMenu, api.createFnbRequest, api.createFnbOrder

import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { OrderNewView } from "@/features/fnb/components/OrderNewView";

export const dynamic = "force-dynamic";

export default async function FnbOrderNewPage() {
  const [items, reservations] = await Promise.all([
    api.listFnbMenu(),
    api.searchReservations(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Đang tải biểu mẫu đặt món...</div>}>
      <OrderNewView initialItems={items} initialReservations={reservations as any} />
    </Suspense>
  );
}

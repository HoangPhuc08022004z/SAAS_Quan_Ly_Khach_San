// FR: FR-O11, FR-O12, FR-O13, FR-O14, FR-O15, FR-O16
// Service: api.searchReservations, api.getCheckoutSummary, api.getFolio, api.createBalancePayment, api.simulatePmsPaymentWebhook, api.checkOut, api.createRefundRequest

import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const reservations = await api.searchReservations();

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Đang tải thông tin quyết toán...</div>}>
      <CheckoutFlow initialReservations={reservations} />
    </Suspense>
  );
}

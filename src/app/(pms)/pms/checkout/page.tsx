"use client";

// API: check-out balance / folio / balance-payment / confirm (xem CheckoutFlow)
import React, { Suspense } from "react";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>}>
      <CheckoutFlow />
    </Suspense>
  );
}

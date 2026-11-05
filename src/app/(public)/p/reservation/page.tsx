// Tra cứu đặt phòng của khách & thanh toán đặt cọc
// API: GET /api/public/reservations/{code}?email=&phone=, POST .../payments, POST .../checkout-session
import React, { Suspense } from "react";
import { ReservationLookup } from "@/features/public/components/ReservationLookup";
import { PublicHeader, PublicFooter } from "@/features/public/components/PublicNav";

export default function ReservationLookupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Suspense fallback={null}>
          <ReservationLookup />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

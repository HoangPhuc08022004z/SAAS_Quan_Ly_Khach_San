"use client";

// API: GET .../check-out/reservations/{reservationCode}/folio — tham số đường dẫn giờ là MÃ ĐẶT PHÒNG
import React, { use } from "react";
import { FolioManager } from "@/features/checkout/components/FolioManager";

export default function FolioDetailPage({ params }: { params: Promise<{ reservationId: string }> }) {
  const { reservationId } = use(params);
  return <FolioManager reservationCode={decodeURIComponent(reservationId)} />;
}

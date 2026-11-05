// Trang đặt phòng công khai của khách sạn
// API: GET /api/public/properties/{id}/available-rooms, POST .../reservations, POST /api/public/properties/{id}/chat
import React from "react";
import { PropertyGuestView } from "@/features/public/components/PropertyGuestView";
import { PublicHeader, PublicFooter } from "@/features/public/components/PublicNav";

export default async function PropertyPublicPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <PropertyGuestView propertyId={propertyId} />
      </main>
      <PublicFooter />
    </div>
  );
}

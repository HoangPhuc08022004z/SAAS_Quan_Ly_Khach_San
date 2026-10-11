// FR-O45, FR-O46: Trang khách của khách sạn & Chatbot RAG cho khách
// Service: api.getProperty, api.listRoomTypes, api.askGuestBot, api.getPublicAvailability

import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PropertyGuestView } from "@/features/public/components/PropertyGuestView";
import { PublicHeader, PublicFooter } from "@/features/public/components/PublicNav";

export const dynamic = "force-dynamic";

export default async function PropertyPublicPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  try {
    const property = await api.getProperty(propertyId);
    const roomTypes = await api.listRoomTypes(propertyId);

    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1">
          <PropertyGuestView property={property} roomTypes={roomTypes} />
        </main>
        <PublicFooter />
      </div>
    );
  } catch {
    notFound();
  }
}

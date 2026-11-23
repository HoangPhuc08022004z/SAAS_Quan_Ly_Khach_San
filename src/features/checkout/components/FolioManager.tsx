"use client";

// API: GET /api/properties/{propertyId}/check-out/reservations/{reservationCode}/folio (token nhân viên, quyền CHECKOUT_VIEW)
// Backend chỉ cho XEM folio khi đặt phòng đang CHECKED_IN; chưa có API thêm khoản phát sinh thủ công.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, LogOut } from "lucide-react";
import { checkOutApi, type CheckoutFolio } from "@/lib/api";
import { Card, ErrorBox, NoProperty, ReservationStatus, Spinner, btnPrimary, usePmsProperty } from "@/features/pms-ops/ui";
import { FolioTable } from "./CheckoutFlow";

export function FolioManager({ reservationCode }: { reservationCode: string }) {
  const { propertyId } = usePmsProperty();
  const [folio, setFolio] = useState<CheckoutFolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    let alive = true;
    setFolio(null);
    setError(null);
    checkOutApi
      .folio(propertyId, reservationCode)
      .then((f) => alive && setFolio(f))
      .catch((e: any) => alive && setError(e?.message || "Không tải được folio."));
    return () => {
      alive = false;
    };
  }, [propertyId, reservationCode]);

  if (!propertyId) return <NoProperty />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Receipt className="h-6 w-6 text-blue-600" /> Folio · {reservationCode}
        </h1>
        <Link href={`/pms/checkout?code=${encodeURIComponent(reservationCode)}`} className={btnPrimary}>
          <LogOut className="h-4 w-4" /> Sang trả phòng
        </Link>
      </div>
      {!folio && !error && <Spinner />}
      <ErrorBox message={error} />
      {folio && (
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <ReservationStatus status={folio.reservationStatus} />
            <span className="text-slate-400">Tiền tệ: {folio.currency}</span>
          </div>
          <FolioTable folio={folio} />
        </Card>
      )}
    </div>
  );
}

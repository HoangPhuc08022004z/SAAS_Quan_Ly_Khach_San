"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Reservation, Folio, Guest } from "@/lib/api/types";
import { api } from "@/lib/api";
import { BalanceSummary } from "./BalanceSummary";
import { FolioGroupedTable } from "./FolioGroupedTable";
import { BalancePaymentPanel } from "./BalancePaymentPanel";
import { OverpaidRefundPrompt } from "./OverpaidRefundPrompt";
import { CheckoutCompleteButton } from "./CheckoutCompleteButton";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { toast } from "sonner";
import {
  Search,
  LogOut,
  Receipt,
  RotateCcw,
  User,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface CheckoutFlowProps {
  initialReservations: ExtendedReservation[];
}

export function CheckoutFlow({ initialReservations }: CheckoutFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResId = searchParams.get("reservationId");

  const [reservations, setReservations] = useState(initialReservations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResId, setSelectedResId] = useState<string>(
    queryResId ||
      initialReservations.find((r) => r.status === "CHECKED_IN")?.id ||
      initialReservations[0]?.id ||
      ""
  );

  const [summary, setSummary] = useState<{
    totalCharges: number;
    totalPaid: number;
    balance: number;
    canCheckOut: boolean;
    requiresRefund: boolean;
    requiresPayment: boolean;
    folios: Folio[];
  } | null>(null);

  const [reservation, setReservation] = useState<ExtendedReservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadReservationData(resId: string) {
    if (!resId) return;
    try {
      setIsLoading(true);
      const [res, sum] = await Promise.all([
        api.getReservation(resId),
        api.getCheckoutSummary(resId),
      ]);
      setReservation(res as any);
      setSummary(sum);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải dữ liệu quyết toán của đặt phòng");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (selectedResId) {
      loadReservationData(selectedResId);
    }
  }, [selectedResId]);

  // Filter reservations in dropdown/search
  const filteredReservations = reservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.guest?.full_name?.toLowerCase().includes(q) ||
      r.guest?.phone?.includes(q)
    );
  });

  const isAlreadyCheckedOut = reservation?.status === "CHECKED_OUT";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LogOut className="w-6 h-6 text-rose-500" />
            Thủ tục Trả phòng (Check-out)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tổng hợp hóa đơn Folio, tất toán công nợ và hoàn tất bàn giao phòng
          </p>
        </div>

        {selectedResId && (
          <div className="flex items-center gap-2">
            <Link
              href={`/pms/folio/${selectedResId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
            >
              <Receipt className="w-4 h-4 text-primary" />
              Chi tiết Folio & Hóa đơn
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Reservation Picker / Search */}
      <div className="p-4 bg-card border rounded-xl shadow-sm space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Chọn đơn đặt phòng cần thanh toán & trả phòng
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh theo mã đặt phòng, tên khách hoặc SĐT..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <select
            value={selectedResId}
            onChange={(e) => {
              setSelectedResId(e.target.value);
              router.push(`/pms/checkout?reservationId=${e.target.value}`);
            }}
            className="px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-medium"
          >
            {filteredReservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.guest?.full_name || "Khách vãng lai"} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reservation Detail Bar */}
      {reservation && (
        <div className="p-4 rounded-xl border bg-card shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {reservation.code.slice(-3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-base">
                  {reservation.code}
                </span>
                <StatusBadge status={reservation.status} type="reservation" />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {reservation.guest?.full_name || "Khách"}
                </span>
                {reservation.guest?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {reservation.guest.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <DateText date={reservation.check_in_date} /> → <DateText date={reservation.check_out_date} />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadReservationData(selectedResId)}
              disabled={isLoading}
              className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Tải lại số liệu"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Balance Summary & Actions */}
      {summary && reservation && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <BalanceSummary
            totalCharges={summary.totalCharges}
            totalPaid={summary.totalPaid}
            balance={summary.balance}
          />

          {/* If already checked out */}
          {isAlreadyCheckedOut && (
            <div className="p-4 rounded-xl bg-muted/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="text-sm font-semibold">
                Đơn đặt phòng này đã hoàn tất thủ tục Check-out.
              </div>
            </div>
          )}

          {/* Action panels if not yet checked out */}
          {!isAlreadyCheckedOut && (
            <>
              {/* Payment required panel */}
              {summary.requiresPayment && (
                <BalancePaymentPanel
                  reservationId={reservation.id}
                  balance={summary.balance}
                  onPaymentCompleted={() => loadReservationData(reservation.id)}
                />
              )}

              {/* Overpaid refund panel */}
              {summary.requiresRefund && (
                <OverpaidRefundPrompt
                  reservationId={reservation.id}
                  balance={summary.balance}
                  onRefundCompleted={() => loadReservationData(reservation.id)}
                />
              )}

              {/* Final checkout button */}
              <CheckoutCompleteButton
                reservationId={reservation.id}
                reservationCode={reservation.code}
                canCheckOut={summary.canCheckOut}
                balance={summary.balance}
                onSuccess={() => loadReservationData(reservation.id)}
              />
            </>
          )}

          {/* Detailed Folio list */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Bảng kê chi tiết các khoản phí (Folio)
            </h3>
            <FolioGroupedTable folios={summary.folios} />
          </div>
        </div>
      )}
    </div>
  );
}

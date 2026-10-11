"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Reservation, Folio, Guest } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { StatusBadge } from "@/components/data/StatusBadge";
import { AddChargeDialog } from "./AddChargeDialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Receipt,
  Plus,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface FolioManagerProps {
  initialReservation: ExtendedReservation;
  initialFolios: Folio[];
}

export function FolioManager({
  initialReservation,
  initialFolios,
}: FolioManagerProps) {
  const [reservation, setReservation] = useState(initialReservation);
  const [folios, setFolios] = useState(initialFolios);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshFolio() {
    try {
      setIsRefreshing(true);
      const [res, fol] = await Promise.all([
        api.getReservation(reservation.id),
        api.getFolio(reservation.id),
      ]);
      setReservation(res);
      setFolios(fol);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lại dữ liệu Folio");
    } finally {
      setIsRefreshing(false);
    }
  }

  const totalCharges = folios.reduce((sum, f) => sum + f.amount, 0);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/pms/checkout?reservationId=${reservation.id}`}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Hóa đơn Folio: {reservation.code}
              </h1>
              <StatusBadge status={reservation.status} type="reservation" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý chi tiết các khoản phí phát sinh của khách hàng trong kỳ lưu trú
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshFolio}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <Printer className="w-4 h-4" />
            In hóa đơn
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Thêm khoản phí
          </button>
        </div>
      </div>

      {/* Printable Invoice Header */}
      <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                PHIẾU CHI TIẾT TÀI KHOẢN (GUEST FOLIO)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mã giao dịch: <strong>{reservation.code}</strong> | Ngày in:{" "}
              <DateText date="2026-10-11T12:00:00Z" type="datetime" />
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground text-sm">
              Khách sạn ABC Hà Nội
            </div>
            <div>01 Tràng Tiền, Hoàn Kiếm, Hà Nội</div>
            <div>Hotline: +84 24 3933 1234</div>
          </div>
        </div>

        {/* Guest and Stay Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 bg-muted/30 rounded-xl">
          <div>
            <span className="text-muted-foreground block mb-0.5">Khách hàng:</span>
            <strong className="text-sm text-foreground">
              {reservation.guest?.full_name || "Khách lẻ"}
            </strong>
            <span className="block text-muted-foreground mt-0.5">
              SĐT: {reservation.guest?.phone || "Chưa cập nhật"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Thời gian lưu trú:</span>
            <strong className="text-foreground">
              <DateText date={reservation.check_in_date} /> →{" "}
              <DateText date={reservation.check_out_date} />
            </strong>
            <span className="block text-muted-foreground mt-0.5">
              Số đêm:{" "}
              {Math.max(
                1,
                Math.round(
                  (new Date(reservation.check_out_date).getTime() -
                    new Date(reservation.check_in_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Trạng thái đặt phòng:</span>
            <StatusBadge status={reservation.status} type="reservation" />
          </div>
        </div>

        {/* Folio Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-4 py-3">STT</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Diễn giải dịch vụ</th>
                <th className="px-4 py-3 text-center">SL</th>
                <th className="px-4 py-3 text-right">Đơn giá</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
                <th className="px-4 py-3 text-right">Thời điểm ghi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {folios.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-muted uppercase tracking-wider text-muted-foreground">
                      {item.charge_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground font-semibold">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    <MoneyText amount={item.unit_price} />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    <MoneyText amount={item.amount} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                    <DateText date={item.created_at} type="datetime" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end pt-4 border-t">
          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Tổng chi phí các khoản:</span>
              <strong className="text-foreground text-sm">
                <MoneyText amount={totalCharges} />
              </strong>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Đã thanh toán / Cọc:</span>
              <strong className="text-sm">
                <MoneyText amount={reservation.total_amount} />
              </strong>
            </div>
            <div className="flex justify-between pt-2 border-t text-sm font-bold text-foreground">
              <span>Công nợ thực tế:</span>
              <span>
                <MoneyText amount={Math.max(0, totalCharges - reservation.total_amount)} />
              </span>
            </div>
          </div>
        </div>

        {/* Signature Box for Print */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-xs">
          <div>
            <div className="font-semibold text-foreground">Chữ ký khách hàng</div>
            <div className="text-muted-foreground mt-0.5">(Ký và ghi rõ họ tên)</div>
            <div className="h-20" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Nhân viên lập phiếu</div>
            <div className="text-muted-foreground mt-0.5">(Ký và ghi rõ họ tên)</div>
            <div className="h-20" />
          </div>
        </div>
      </div>

      {/* Add Charge Dialog */}
      <AddChargeDialog
        reservationId={reservation.id}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refreshFolio}
      />
    </div>
  );
}

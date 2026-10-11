"use client";

import React, { useState } from "react";
import { PropertyService, Reservation, Guest } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { ServiceRequestDialog } from "./ServiceRequestDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Sparkles,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  Tag,
  ArrowRight,
} from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface ServiceViewProps {
  initialServices: PropertyService[];
  reservations: ExtendedReservation[];
}

export function ServiceView({
  initialServices,
  reservations,
}: ServiceViewProps) {
  const [services, setServices] = useState(initialServices);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<PropertyService | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshServices() {
    try {
      setIsRefreshing(true);
      const res = await api.listPmsServices();
      setServices(res);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách dịch vụ");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Dịch vụ & Tiện ích Khách sạn
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Đặt lịch các dịch vụ giặt ủi, dọn thêm, đưa đón sân bay hoặc spa cho phòng đang lưu trú
          </p>
        </div>

        <button
          type="button"
          onClick={refreshServices}
          disabled={isRefreshing}
          className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Làm mới"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6" />}
          title="Chưa có dịch vụ nào"
          description="Khách sạn chưa kích hoạt dịch vụ nào từ danh mục SaaS Service Catalog."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-foreground">
                      {svc.price > 0 ? (
                        <MoneyText amount={svc.price} />
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Đơn vị: {svc.unit || "lần"}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-foreground text-base tracking-tight mb-1">
                  {svc.custom_name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                  {svc.description || "Dịch vụ phục vụ theo yêu cầu của khách hàng."}
                </p>
              </div>

              <div className="pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedServiceForOrder(svc)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Đặt lịch cho phòng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Dialog */}
      <ServiceRequestDialog
        service={selectedServiceForOrder}
        reservations={reservations}
        isOpen={!!selectedServiceForOrder}
        onClose={() => setSelectedServiceForOrder(null)}
        onSuccess={refreshServices}
      />
    </div>
  );
}

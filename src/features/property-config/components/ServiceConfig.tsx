"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { MoneyText } from "@/components/data/MoneyText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { serviceApi, type ApiPropertyService, type ApiServiceCatalogItem } from "@/lib/api";
import { toast } from "sonner";
import { Briefcase, Plus, Power, CheckCircle2 } from "lucide-react";

export function ServiceConfig({
  propertyId,
  catalog,
  initialServices,
}: {
  propertyId: string;
  catalog: ApiServiceCatalogItem[];
  initialServices: ApiPropertyService[];
}) {
  const [services, setServices] = useState<ApiPropertyService[]>(initialServices);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [serviceToToggle, setServiceToToggle] = useState<ApiPropertyService | null>(null);

  const handleRegister = async (item: ApiServiceCatalogItem) => {
    setRegisteringId(item.serviceId);
    try {
      // Gọi OpenAPI: POST /api/properties/{propertyId}/services
      const res = await serviceApi.register(propertyId, item.serviceId);
      toast.success(res?.message || "Đã thêm dịch vụ vào khách sạn thành công!");
      setServices(await serviceApi.list(propertyId));
    } catch (err: any) {
      toast.error(err?.message || "Không thể đăng ký dịch vụ này.");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleToggle = async () => {
    if (!serviceToToggle) return;
    const next = serviceToToggle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      // Gọi OpenAPI: PATCH /api/properties/{propertyId}/services/{propertyServiceId}/status
      const updated = await serviceApi.setStatus(propertyId, serviceToToggle.propertyServiceId, next);
      setServices((prev) => prev.map((s) => (s.propertyServiceId === updated.propertyServiceId ? updated : s)));
      toast.success(next === "ACTIVE" ? "Đã bật lại dịch vụ." : "Đã tạm ngưng dịch vụ.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể đổi trạng thái dịch vụ.");
    } finally {
      setServiceToToggle(null);
    }
  };

  const columns: Column<ApiPropertyService>[] = [
    {
      key: "name",
      header: "Tên dịch vụ",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</div>
          <div className="text-[11px] text-slate-400 line-clamp-1">{s.description || s.serviceType || "Dịch vụ tiêu chuẩn"}</div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá niêm yết",
      render: (s) =>
        s.price != null ? (
          <MoneyText amount={Number(s.price)} className="font-bold text-xs text-slate-900 dark:text-white" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            s.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {s.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <button
          onClick={() => setServiceToToggle(s)}
          title={s.status === "ACTIVE" ? "Tạm ngưng dịch vụ" : "Bật lại dịch vụ"}
          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span>Danh Mục Dịch Vụ SaaS Toàn Hệ Thống (Service Catalog)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Khách sạn chỉ có thể đăng ký các dịch vụ có sẵn trong Catalog của nền tảng SaaS.
          </p>
        </div>

        {catalog.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Catalog hiện chưa có dịch vụ nào đang hoạt động.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((cat) => {
              const isAlreadyAdded = services.some((s) => s.serviceId === cat.serviceId);
              return (
                <div
                  key={cat.serviceId}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">{cat.serviceType}</span>
                    {isAlreadyAdded ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã thêm</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(cat)}
                        disabled={registeringId === cat.serviceId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg dark:bg-blue-950 dark:text-blue-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{registeringId === cat.serviceId ? "Đang thêm..." : "Thêm"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Dịch Vụ Đã Đăng Ký Của Khách Sạn ({services.length})
        </h3>
        <DataTable columns={columns} data={services} exportFileName="dich-vu-khach-san" />
      </div>

      <ConfirmDialog
        isOpen={!!serviceToToggle}
        title={serviceToToggle?.status === "ACTIVE" ? "Tạm ngưng dịch vụ" : "Bật lại dịch vụ"}
        description={
          serviceToToggle?.status === "ACTIVE"
            ? `Dịch vụ "${serviceToToggle?.name}" sẽ ngừng được cung cấp tại khách sạn. Bạn có thể bật lại bất cứ lúc nào.`
            : `Dịch vụ "${serviceToToggle?.name}" sẽ được cung cấp trở lại.`
        }
        confirmText="Xác nhận"
        onConfirm={handleToggle}
        onClose={() => setServiceToToggle(null)}
      />
    </div>
  );
}

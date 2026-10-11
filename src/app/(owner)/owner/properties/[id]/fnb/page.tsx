// FR: FR-C10, FR-C13
// Service: api.listFnbItems, api.createFnbItem, api.updateFnbItem, api.deleteFnbItem
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { FnbConfig } from "@/features/property-config/components/FnbConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyFnbPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, menu] = await Promise.all([
    api.getProperty(id),
    api.listFnbItems(id),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${id}/setup`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Wizard thiết lập</span>
        </Link>
      </div>

      <PageHeader
        title={`Thực Đơn Ẩm Thực (F&B): ${property.name}`}
        description="Quản lý danh mục món ăn đồ uống phục vụ tại phòng hoặc nhà hàng, tự động xác định giá bán theo tỷ suất lợi nhuận."
      />

      <FnbConfig propertyId={id} initialMenu={menu} />
    </div>
  );
}

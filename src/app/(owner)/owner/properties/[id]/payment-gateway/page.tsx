// FR: FR-C12, FR-C13
// Service: api.listGateways, api.getGatewayConfig, api.saveGatewayConfig, api.deleteGatewayConfig, api.testGatewayConfig
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GatewayConfig } from "@/features/property-config/components/GatewayConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyPaymentGatewayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, gateways, config] = await Promise.all([
    api.getProperty(id),
    api.listGateways(),
    api.getGatewayConfig(id),
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
        title={`Cấu Hình Cổng Thanh Toán: ${property.name}`}
        description="Kết nối đối tác cổng thanh toán trực tuyến (MoMo, VNPAY, ZaloPay) để tự động thu cọc và quyết toán."
      />

      <GatewayConfig
        propertyId={id}
        gateways={gateways}
        initialConfig={config}
      />
    </div>
  );
}

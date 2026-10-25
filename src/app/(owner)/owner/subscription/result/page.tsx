// FR: FR-S08, FR-S09
// API: poll GET /api/v1/user/profile đến khi Subscription ACTIVE
import React, { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentResultView } from "@/features/subscription/components/PaymentFlow";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OwnerSubscriptionResultPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết Quả Giao Dịch Thanh Toán"
        description="Trạng thái xác thực phản hồi từ cổng thanh toán đối với thuê bao của bạn."
      />
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Đang tải thông tin giao dịch...</span>
          </div>
        }
      >
        <PaymentResultView />
      </Suspense>
    </div>
  );
}

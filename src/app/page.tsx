// FR-S02, FR-S03: Trang chủ và bảng giá gói dịch vụ SaaS
// API: GET /api/v1/saas/user/Plan/List (public) — chỉ hiển thị gói lấy từ backend

import React from "react";
import Link from "next/link";
import { fetchPlans } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import type { Plan } from "@/lib/api/types";

export const dynamic = "force-dynamic";

async function loadPlans(): Promise<{ plans: Plan[]; failed: boolean }> {
  try {
    const plans = (await fetchPlans()).filter((p) => p.status === "ACTIVE").map(toPlan);
    return { plans, failed: false };
  } catch (err) {
    console.error("[home] Không tải được danh sách gói từ backend:", err);
    return { plans: [], failed: true };
  }
}
import { PublicHeader, PublicFooter } from "@/features/public/components/PublicNav";
import { HeroSection } from "@/features/public/components/HeroSection";
import { PlanGrid } from "@/features/public/components/PlanGrid";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const { plans, failed } = await loadPlans();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Pricing Plans Section */}
        <section id="pricing" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Bảng Giá Thuê Bao Minh Bạch, Linh Hoạt
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Chọn gói phù hợp với quy mô khách sạn hoặc chuỗi nghỉ dưỡng của bạn. Dễ dàng nâng cấp khi mở rộng kinh doanh.
              </p>
            </div>

            {plans.length > 0 ? (
              <PlanGrid plans={plans} />
            ) : (
              <p className="text-center text-sm text-slate-500">
                {failed
                  ? "Không thể tải bảng giá từ hệ thống lúc này. Vui lòng thử lại sau."
                  : "Hiện chưa có gói dịch vụ nào đang mở đăng ký."}
              </p>
            )}
          </div>
        </section>

        {/* Cổng đặt phòng cho khách */}
        <section id="demo-hotels" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bạn là khách muốn đặt phòng?</h3>
            <p className="text-xs text-slate-500">Tìm phòng trống và đặt phòng trực tuyến, không cần đăng nhập.</p>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <span>Đến cổng đặt phòng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

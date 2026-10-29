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
import { Building2, ArrowRight } from "lucide-react";

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

        {/* Demo Hotels Showcase */}
        <section id="demo-hotels" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Trang Đặt Phòng Khách Hàng (Demo Guest View)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trải nghiệm trang công khai của các khách sạn đối tác với trợ lý AI trả lời khách 24/7.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: "prop_abc_hn",
                  name: "Khách sạn ABC Grand Hà Nội",
                  address: "123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
                  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
                },
                {
                  id: "prop_abc_dn",
                  name: "ABC Ocean Resort Đà Nẵng",
                  address: "88 Đường Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng",
                  image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60",
                },
                {
                  id: "prop_sunrise_sg",
                  name: "Sunrise Central Hotel Sài Gòn",
                  address: "45 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                  image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60",
                },
              ].map((hotel) => (
                <div
                  key={hotel.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {hotel.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{hotel.address}</p>
                    <div className="pt-2">
                      <Link
                        href={`/p/${hotel.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Xem trang khách & thử Chatbot AI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

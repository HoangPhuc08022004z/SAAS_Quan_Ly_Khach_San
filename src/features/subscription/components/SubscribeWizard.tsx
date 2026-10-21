"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MoneyText } from "@/components/data/MoneyText";
import { formatBytes } from "@/lib/utils/format";
import { api, sendSubscriptionRequest } from "@/lib/api";
import { toast } from "sonner";
import { Check, CheckCircle2, Building, ShieldCheck, ArrowRight, ArrowLeft, Clock, Sparkles } from "lucide-react";

export function SubscribeWizard({ plans }: { plans: any[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [tenantName, setTenantName] = useState("");
  const [tenantDescription, setTenantDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleNextStep1 = () => {
    if (!selectedPlanId) {
      toast.error("Vui lòng chọn một gói dịch vụ.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) {
      toast.error("Vui lòng nhập tên khách sạn hoặc công ty quản lý.");
      return;
    }
    setStep(3);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      try {
        // Gọi OpenAPI: POST /api/v1/user/sendRequest
        const planIdNum = parseInt(String(selectedPlanId).replace(/\D/g, "") || "1", 10);
        await sendSubscriptionRequest({
          planId: planIdNum,
          name: tenantName.trim(),
          description: tenantDescription.trim(),
        });
      } catch (backendErr) {
        console.warn("Backend sendRequest error, using local fallback:", backendErr);
      }

      await api.createSubscriptionRequest({
        plan_id: selectedPlanId,
        tenant_name: tenantName.trim(),
        tenant_description: tenantDescription.trim(),
      });
      toast.success("Đã gửi yêu cầu đăng ký thuê bao thành công!");
      setStep(4);
    } catch {
      toast.error("Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stepper Header */}
      {step < 4 && (
        <div className="flex items-center justify-between max-w-xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>1</div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chọn gói</span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>2</div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thông tin tổ chức</span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>3</div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Xác nhận gửi</span>
          </div>
        </div>
      )}

      {/* Step 1: Select Plan */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bước 1: Lựa Chọn Gói Dịch Vụ SaaS</h2>
            <p className="text-xs text-slate-500">Chọn giải pháp phù hợp với quy mô chuỗi hoặc khách sạn của bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all space-y-4 relative ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/20 shadow-md dark:border-blue-500 dark:bg-blue-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                    <MoneyText amount={p.price} className="text-xl font-black text-slate-900 dark:text-white" />
                    <span className="text-xs text-slate-400"> / {p.duration_days} ngày</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Tối đa <strong>{p.max_properties}</strong> khách sạn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Tối đa <strong>{p.max_rooms}</strong> phòng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Tối đa <strong>{p.max_users}</strong> nhân viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Lưu trữ: <strong>{formatBytes(p.max_storage)}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextStep1}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Tiếp tục: Thông tin tổ chức</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Tenant Info */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bước 2: Thông Tin Tổ Chức / Khách Sạn</h2>
            <p className="text-xs text-slate-500">Cung cấp tên thương hiệu hoặc doanh nghiệp sở hữu chuỗi khách sạn.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tên tổ chức / Thương hiệu khách sạn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Ví dụ: Tập đoàn Khách sạn Hoa Sen (Lotus Group)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả hoặc ghi chú</label>
              <textarea
                rows={3}
                value={tenantDescription}
                onChange={(e) => setTenantDescription(e.target.value)}
                placeholder="Thông tin thêm về địa bàn hoạt động, số chi nhánh dự kiến..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <span>Tiếp tục: Xác nhận</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bước 3: Xác Nhận & Gửi Yêu Cầu</h2>
            <p className="text-xs text-slate-500">Kiểm tra lại thông tin gói và doanh nghiệp trước khi gửi cho Admin duyệt.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Gói đã chọn</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedPlan.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Phí dịch vụ</span>
                <div>
                  <MoneyText amount={selectedPlan.price} className="text-base font-black text-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tên tổ chức:</span>
                <span className="font-bold text-slate-900 dark:text-white">{tenantName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Thời hạn sử dụng:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlan.duration_days} ngày</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Giới hạn tài nguyên:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedPlan.max_properties} khách sạn • {selectedPlan.max_rooms} phòng • {selectedPlan.max_users} nhân viên
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900 text-xs dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Quy trình kích hoạt thuê bao</span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Yêu cầu đăng ký sẽ được SaaS Admin xét duyệt trong vòng 1-3 ngày làm việc. Sau khi được duyệt, bạn sẽ nhận được thông báo để tiến hành thanh toán kích hoạt chính thức.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              <span>{isSubmitting ? "Đang gửi..." : "Gửi yêu cầu đăng ký"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pending Approval Notice */}
      {step === 4 && (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-6 max-w-lg mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yêu Cầu Đang Chờ Xét Duyệt</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cảm ơn bạn đã tin tưởng nền tảng. Yêu cầu đăng ký gói <strong>{selectedPlan.name}</strong> cho tổ chức <strong>{tenantName}</strong> đã được chuyển tới ban quản trị SaaS.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white">Thời gian xét duyệt ước tính:</div>
            <div className="text-blue-600 font-bold">1 - 3 ngày làm việc</div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/owner/subscription")}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Về trang Subscription của tôi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

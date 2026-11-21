"use client";

// API: GET /api/payment-gateways, GET|POST|PUT /api/properties/{propertyId}/payment-gateway (OWNER)
// Backend chỉ hỗ trợ Stripe: secretKey (sk_test_/sk_live_) + webhookSecret (whsec_). Khóa không bao giờ được trả về,
// chỉ có cờ secretKeyConfigured / webhookSecretConfigured.
import React, { useState } from "react";
import {
  paymentGatewayApi,
  type PaymentGatewayCatalogItem,
  type PaymentGatewayConfigView,
} from "@/lib/api";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, AlertCircle, Save, Power, Eye, EyeOff } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono";

export function GatewayConfig({
  propertyId,
  gateways,
  initialConfig,
}: {
  propertyId: string;
  gateways: PaymentGatewayCatalogItem[];
  initialConfig: PaymentGatewayConfigView | null;
}) {
  const [config, setConfig] = useState<PaymentGatewayConfigView | null>(initialConfig);
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isActive = config?.status === "ACTIVE";

  const reload = async () => {
    try {
      setConfig(await paymentGatewayApi.get(propertyId));
    } catch {
      /* giữ nguyên dữ liệu đang hiển thị */
    }
  };

  const validate = (requireBoth: boolean) => {
    if (requireBoth && (!secretKey || !webhookSecret)) return "Nhập đủ Secret Key và Webhook Secret.";
    if (secretKey && !/^sk_(test|live)_.+$/.test(secretKey.trim()))
      return "Secret Key phải bắt đầu bằng sk_test_ hoặc sk_live_.";
    if (webhookSecret && !/^whsec_.+$/.test(webhookSecret.trim())) return "Webhook Secret phải bắt đầu bằng whsec_.";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(!config);
    if (err) return toast.error(err);
    if (config && !secretKey && !webhookSecret) return toast.error("Nhập khóa mới cần đổi (bỏ trống khóa giữ nguyên).");

    setIsSaving(true);
    try {
      const res = config
        ? await paymentGatewayApi.update(propertyId, {
            ...(secretKey ? { secretKey: secretKey.trim() } : {}),
            ...(webhookSecret ? { webhookSecret: webhookSecret.trim() } : {}),
          })
        : await paymentGatewayApi.create(propertyId, {
            secretKey: secretKey.trim(),
            webhookSecret: webhookSecret.trim(),
          });
      toast.success(res?.message || "Đã lưu cấu hình cổng thanh toán.");
      setSecretKey("");
      setWebhookSecret("");
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Không thể lưu cấu hình cổng thanh toán.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await paymentGatewayApi.update(propertyId, { status: isActive ? "INACTIVE" : "ACTIVE" });
      toast.success(res?.message || (isActive ? "Đã tạm tắt cổng thanh toán." : "Đã bật cổng thanh toán."));
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Không thể đổi trạng thái cổng.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {config ? config.gatewayName : "Chưa cấu hình cổng"}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {config ? config.status : "Chưa kích hoạt"}
              </span>
            </div>
            <p className="text-xs text-slate-400">Dùng để tạo link thanh toán tiền cọc khi khách đặt phòng online.</p>
          </div>
        </div>
        {config && (
          <button
            type="button"
            onClick={toggleStatus}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
          >
            <Power className="w-3.5 h-3.5" />
            {isActive ? "Tạm tắt" : "Bật lại"}
          </button>
        )}
      </div>

      {gateways.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gateways.map((gw) => (
            <div
              key={gw.gatewayId}
              className="p-3.5 rounded-2xl border border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20 space-y-1"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">{gw.name}</h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500">{gw.description || "Cổng thanh toán đang được hỗ trợ."}</p>
              <span className="text-[10px] text-slate-400">Trạng thái cổng: {gw.status}</span>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
      >
        {config && (
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span
              className={`px-2 py-1 rounded-lg font-semibold ${
                config.secretKeyConfigured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              Secret Key: {config.secretKeyConfigured ? "đã lưu" : "chưa có"}
            </span>
            <span
              className={`px-2 py-1 rounded-lg font-semibold ${
                config.webhookSecretConfigured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              Webhook Secret: {config.webhookSecretConfigured ? "đã lưu" : "chưa có"}
            </span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Stripe Secret Key {!config && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={config ? "Để trống nếu giữ nguyên" : "sk_test_••••••••"}
                autoComplete="off"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Hiện hoặc ẩn khóa"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Webhook Signing Secret {!config && <span className="text-rose-500">*</span>}
            </label>
            <input
              type={showSecret ? "text" : "password"}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={config ? "Để trống nếu giữ nguyên" : "whsec_••••••••"}
              autoComplete="off"
              className={inputCls}
            />
            <p className="text-[10px] text-slate-400">
              Lấy trong Stripe Dashboard → Developers → Webhooks. Endpoint webhook của backend: /api/webhooks/stripe/property.
              Khóa được mã hóa ở backend và không bao giờ hiển thị lại.
            </p>
          </div>
        </div>

        {!config && (
          <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Khách sạn cần cấu hình và bật cổng này thì khách mới thanh toán được tiền cọc.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : config ? "Cập nhật khóa" : "Lưu cấu hình cổng"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

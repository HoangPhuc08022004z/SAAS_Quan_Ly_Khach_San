"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Save,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

export function GatewayConfig({
  propertyId,
  gateways,
  initialConfig,
}: {
  propertyId: string;
  gateways: any[];
  initialConfig: any | null;
}) {
  const [config, setConfig] = useState<any | null>(initialConfig);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(
    initialConfig?.payment_gateway_id || gateways[0]?.id || ""
  );
  const [partnerCode, setPartnerCode] = useState(initialConfig?.partner_code || "");
  const [accessKey, setAccessKey] = useState(initialConfig?.access_key || "");
  const [secretKey, setSecretKey] = useState(initialConfig?.secret_key || "");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim() || !accessKey.trim()) {
      toast.error("Vui lòng điền Partner Code và Access Key.");
      return;
    }
    setIsSaving(true);
    try {
      const saved = await api.saveGatewayConfig(propertyId, {
        payment_gateway_id: selectedGatewayId,
        partner_code: partnerCode.trim(),
        access_key: accessKey.trim(),
        secret_key: secretKey.trim(),
      });
      setConfig(saved);
      toast.success("Đã lưu cấu hình cổng thanh toán thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình cổng thanh toán.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await api.testGatewayConfig(propertyId);
      if (res.success) {
        toast.success(`Kết nối thành công tới cổng đối tác (Độ trễ: ${res.latencyMs}ms)!`);
      } else {
        toast.error("Kết nối thất bại. Vui lòng kiểm tra lại Access Key hoặc Secret Key.");
      }
    } catch {
      toast.error("Lỗi khi kiểm tra kết nối tới cổng thanh toán.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteGatewayConfig(propertyId);
      setConfig(null);
      setPartnerCode("");
      setAccessKey("");
      setSecretKey("");
      toast.success("Đã xóa cấu hình cổng thanh toán.");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Không thể xóa cấu hình.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Gateway Status Banner */}
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Trạng Thái Kết Nối Cổng</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  config?.is_active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {config?.is_active ? "Đã kết nối" : "Chưa kích hoạt"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dùng để tạo link thanh toán cọc và quyết toán tiền phòng online cho khách.
            </p>
          </div>
        </div>

        {config && (
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-blue-500" : ""}`} />
            <span>Kiểm tra kết nối</span>
          </button>
        )}
      </div>

      {/* Gateway Form */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Lựa chọn nhà cung cấp cổng thanh toán:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {gateways.map((gw) => (
              <div
                key={gw.id}
                onClick={() => setSelectedGatewayId(gw.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  selectedGatewayId === gw.id
                    ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">{gw.name}</h4>
                  {selectedGatewayId === gw.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[10px] text-slate-400">{gw.code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Partner Code (Mã đối tác) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              placeholder="MOMO_ABC_HN_2026"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Access Key (Khóa truy cập API) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="AK_9384729184728"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Secret Key (Khóa bí mật - Chỉ ghi & Che giấu) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="SK_••••••••••••••••"
                className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Secret Key được lưu trữ mã hóa và che hiển thị theo chuẩn bảo mật an toàn cổng thanh toán.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {config ? (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl dark:bg-rose-950/40 dark:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gỡ bỏ cấu hình</span>
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu cấu hình cổng"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Xác nhận gỡ cấu hình cổng thanh toán"
        description="Khi gỡ bỏ, khách hàng sẽ không thể thanh toán đặt cọc trực tuyến cho khách sạn này nữa."
        confirmText="Gỡ cấu hình"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}

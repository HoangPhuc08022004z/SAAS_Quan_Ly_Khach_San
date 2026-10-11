"use client";

import React, { useState } from "react";
import { MoneyText } from "@/components/data/MoneyText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Trash2,
  Calculator,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export function PolicyConfig({
  propertyId,
  initialFormulas,
  initialApplied,
}: {
  propertyId: string;
  initialFormulas: any[];
  initialApplied: any[];
}) {
  const [formulas] = useState<any[]>(initialFormulas);
  const [applied, setApplied] = useState<any[]>(initialApplied);
  const [selectedType, setSelectedType] = useState<string>("CANCELLATION");
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(
    initialFormulas.find((f) => f.type === "CANCELLATION")?.id || initialFormulas[0]?.id || ""
  );
  const [paramValues, setParamValues] = useState<Record<string, any>>({
    days_before: 3,
    penalty_rate: 50,
  });

  // Simulator states
  const [simCheckIn, setSimCheckIn] = useState("2026-10-20");
  const [simCancelDate, setSimCancelDate] = useState("2026-10-15");
  const [simDeposit, setSimDeposit] = useState(1000000);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredFormulas = formulas.filter((f) => f.type === selectedType);
  const selectedFormula = formulas.find((f) => f.id === selectedFormulaId);

  const handleApply = async () => {
    if (!selectedFormulaId) return;
    try {
      const res = await api.applyPolicy(propertyId, selectedFormulaId, paramValues);
      setApplied((prev) => {
        const existing = prev.filter((p) => p.policy_formula_id !== selectedFormulaId);
        return [...existing, { ...res, formula: selectedFormula }];
      });
      toast.success(`Đã áp dụng chính sách "${selectedFormula?.name}" thành công!`);
    } catch {
      toast.error("Không thể lưu cấu hình chính sách.");
    }
  };

  const handleRemove = async (formulaId: string) => {
    try {
      await api.removePolicy(propertyId, formulaId);
      setApplied((prev) => prev.filter((p) => p.policy_formula_id !== formulaId));
      toast.success("Đã gỡ áp dụng chính sách.");
    } catch {
      toast.error("Không thể gỡ chính sách này.");
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await api.simulatePolicy(propertyId, selectedFormulaId, {
        checkInDate: simCheckIn,
        cancelDate: simCancelDate,
        depositAmount: simDeposit,
      });
      setSimResult(res);
      toast.success("Đã tính toán thử nghiệm mức phạt/hoàn tiền.");
    } catch {
      toast.error("Không thể chạy tính thử.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 2 Column: Config Formula & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formula Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thiết Lập Chính Sách Hoạt Động</h3>
            </div>

            {/* Type Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl dark:bg-slate-800">
              {["CANCELLATION", "DEPOSIT", "NO_SHOW"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    const firstOf = formulas.find((f) => f.type === type);
                    if (firstOf) setSelectedFormulaId(firstOf.id);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedType === type
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  {type === "CANCELLATION" ? "Hủy phòng" : type === "DEPOSIT" ? "Tiền cọc" : "Xử lý No-Show"}
                </button>
              ))}
            </div>

            {/* Formula Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Chọn công thức định sẵn:
              </label>
              <div className="space-y-2">
                {filteredFormulas.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFormulaId(f.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedFormulaId === f.id
                        ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{f.name}</h4>
                      {selectedFormulaId === f.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Parameter Inputs */}
            {selectedFormula && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tham số công thức ({selectedFormula.name})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Số ngày trước Check-in</label>
                    <input
                      type="number"
                      value={paramValues.days_before || 3}
                      onChange={(e) => setParamValues({ ...paramValues, days_before: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Tỷ lệ hoàn tiền (%)</label>
                    <input
                      type="number"
                      value={paramValues.penalty_rate || 50}
                      onChange={(e) => setParamValues({ ...paramValues, penalty_rate: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Lưu & Áp dụng chính sách này
                </button>
              </div>
            )}
          </div>

          {/* Applied Policies Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Các chính sách đang được kích hoạt ({applied.length})
            </h4>

            {applied.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 italic">Chưa áp dụng chính sách nào.</div>
            ) : (
              <div className="space-y-2">
                {applied.map((p) => (
                  <div
                    key={p.id || p.policy_formula_id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{p.formula?.name || p.policy_formula_id}</div>
                      <div className="text-[11px] text-slate-400">
                        Loại: <span className="font-semibold">{p.formula?.type || "POLICY"}</span> • Tham số: {JSON.stringify(p.parameter_values || {})}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(p.policy_formula_id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Gỡ bỏ chính sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Policy Simulator Panel (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleRunSimulation}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Panel Tính Thử Mức Phạt / Hoàn</h3>
                <p className="text-[11px] text-slate-400">Mô phỏng trường hợp khách hủy phòng thực tế</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Ngày Check-in dự kiến</label>
                <input
                  type="date"
                  value={simCheckIn}
                  onChange={(e) => setSimCheckIn(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Thời điểm khách thông báo hủy</label>
                <input
                  type="date"
                  value={simCancelDate}
                  onChange={(e) => setSimCancelDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Số tiền khách đã đặt cọc (VNĐ)</label>
                <input
                  type="number"
                  step="50000"
                  value={simDeposit}
                  onChange={(e) => setSimDeposit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy tính thử nghiệm</span>
            </button>

            {simResult && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-2 dark:bg-indigo-950/30 dark:border-indigo-900/40">
                <div className="font-bold text-slate-900 dark:text-white">Kết quả mô phỏng theo Policy:</div>
                <div className="flex justify-between py-1 border-b border-indigo-100 dark:border-indigo-900/60">
                  <span className="text-slate-500">Tỷ lệ hoàn tiền:</span>
                  <span className="font-bold text-emerald-600">{simResult.refundPercentage}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-100 dark:border-indigo-900/60">
                  <span className="text-slate-500">Số tiền hoàn lại cho khách:</span>
                  <MoneyText amount={simResult.refundAmount} className="font-bold text-emerald-600" />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Số tiền khách sạn giữ lại (phạt):</span>
                  <MoneyText amount={simResult.penaltyAmount} className="font-bold text-rose-600" />
                </div>
                <p className="text-[11px] text-slate-500 pt-1 italic">{simResult.reason}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { policyApi, type ApiHotelPolicies, type ApiPolicyFormula } from "@/lib/api";
import { toast } from "sonner";
import { ShieldAlert, Sliders, CheckCircle2, Trash2, Plus, X, Info } from "lucide-react";

type AppliedPolicy = ApiHotelPolicies["policies"][number];

const TYPE_LABELS: Record<string, string> = {
  CANCELLATION: "Hủy phòng",
  DEPOSIT: "Tiền cọc",
  NO_SHOW: "Xử lý No-Show",
};
const typeLabel = (type: string) => TYPE_LABELS[type] ?? type;

const paramsToRecord = (params?: { paramName: string; paramValue: string }[]) =>
  Object.fromEntries((params ?? []).map((p) => [p.paramName, p.paramValue]));

export function PolicyConfig({
  propertyId,
  formulas,
  initialApplied,
}: {
  propertyId: string;
  formulas: ApiPolicyFormula[];
  initialApplied: AppliedPolicy[];
}) {
  const types = Array.from(new Set(formulas.map((f) => f.policyType)));
  const [applied, setApplied] = useState<AppliedPolicy[]>(initialApplied);
  const [selectedType, setSelectedType] = useState<string>(types[0] ?? "");
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(
    formulas.find((f) => f.policyType === types[0])?.policyFormulaId ?? null
  );
  const [rows, setRows] = useState<{ name: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const filteredFormulas = formulas.filter((f) => f.policyType === selectedType);
  const selectedFormula = formulas.find((f) => f.policyFormulaId === selectedFormulaId);

  const selectFormula = (formulaId: number) => {
    setSelectedFormulaId(formulaId);
    // Nạp tham số đã cấu hình trước đó (nếu có) để chỉnh sửa
    const current = applied.find((p) => p.policyFormulaId === formulaId);
    setRows((current?.parameters ?? []).map((p) => ({ name: p.paramName, value: p.paramValue })));
  };

  // POST /hotel-policies gửi toàn bộ danh sách chính sách cần có của khách sạn
  const submit = async (policies: { policyFormulaId: number; parameters?: Record<string, string> }[]) => {
    await policyApi.configure(propertyId, { policies });
    setApplied((await policyApi.get(propertyId)).policies);
  };

  const handleApply = async () => {
    if (selectedFormulaId == null) return;
    const parameters = Object.fromEntries(rows.filter((r) => r.name.trim()).map((r) => [r.name.trim(), r.value]));
    const others = applied
      .filter((p) => p.policyFormulaId !== selectedFormulaId)
      .map((p) => ({ policyFormulaId: p.policyFormulaId, parameters: paramsToRecord(p.parameters) }));
    setIsSaving(true);
    try {
      await submit([...others, { policyFormulaId: selectedFormulaId, parameters }]);
      toast.success(`Đã áp dụng chính sách "${selectedFormula?.name}" thành công!`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu cấu hình chính sách.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (formulaId: number) => {
    const remaining = applied
      .filter((p) => p.policyFormulaId !== formulaId)
      .map((p) => ({ policyFormulaId: p.policyFormulaId, parameters: paramsToRecord(p.parameters) }));
    try {
      await submit(remaining);
      toast.success("Đã gỡ áp dụng chính sách.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gỡ chính sách này.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thiết Lập Chính Sách Hoạt Động</h3>
        </div>

        {formulas.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Hệ thống chưa có công thức chính sách nào.</p>
        ) : (
          <>
            <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl dark:bg-slate-800">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    const first = formulas.find((f) => f.policyType === type);
                    if (first) selectFormula(first.policyFormulaId);
                  }}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                    selectedType === type
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  {typeLabel(type)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn công thức định sẵn:</label>
              <div className="space-y-2">
                {filteredFormulas.map((f) => {
                  const isApplied = applied.some((p) => p.policyFormulaId === f.policyFormulaId);
                  return (
                    <div
                      key={f.policyFormulaId}
                      onClick={() => selectFormula(f.policyFormulaId)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedFormulaId === f.policyFormulaId
                          ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{f.name}</h4>
                        <div className="flex items-center gap-2">
                          {isApplied && <span className="text-[10px] font-bold text-emerald-600">Đang áp dụng</span>}
                          {selectedFormulaId === f.policyFormulaId && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedFormula && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tham số công thức ({selectedFormula.name})</span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Nhập tên tham số và giá trị theo đúng quy ước của công thức (ví dụ: days_before = 3).</span>
                </div>

                <div className="space-y-2">
                  {rows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={row.name}
                        onChange={(e) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))}
                        placeholder="Tên tham số"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <input
                        value={row.value}
                        onChange={(e) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)))}
                        placeholder="Giá trị"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRows((prev) => [...prev, { name: "", value: "" }])}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm tham số</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isSaving}
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {isSaving ? "Đang lưu..." : "Lưu & Áp dụng chính sách này"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
                key={p.policyFormulaId}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Loại: <span className="font-semibold">{typeLabel(p.policyType)}</span> • Tham số:{" "}
                    {p.parameters?.length ? p.parameters.map((x) => `${x.paramName}=${x.paramValue}`).join(", ") : "—"}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.policyFormulaId)}
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
  );
}

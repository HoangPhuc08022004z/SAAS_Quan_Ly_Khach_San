"use client";

import React, { useState } from "react";
import {
  policyApi,
  type ApiHotelPolicies,
  type ApiPolicyFormula,
  type ApiPolicyParamDef,
} from "@/lib/api";
import { toast } from "sonner";
import { ShieldAlert, Sliders, CheckCircle2, Trash2, Info } from "lucide-react";

type AppliedPolicy = ApiHotelPolicies["policies"][number];

const TYPE_LABELS: Record<string, string> = {
  CANCELLATION: "Hủy phòng",
  DEPOSIT: "Tiền cọc",
  NO_SHOW: "Xử lý No-Show",
  CHECK_TIME: "Giờ nhận/trả phòng",
};
const typeLabel = (type: string) => TYPE_LABELS[type] ?? type;

const paramsToRecord = (params?: { paramName: string; paramValue: string }[]) =>
  Object.fromEntries((params ?? []).map((p) => [p.paramName, p.paramValue]));

// Suy ra kiểu ô nhập từ `type` backend trả về cho từng tham số
type InputKind = "integer" | "number" | "time" | "date" | "boolean" | "text";
const inputKind = (type: string): InputKind => {
  const t = (type || "").toUpperCase();
  if (/BOOL/.test(t)) return "boolean";
  if (/INT|LONG|SHORT/.test(t)) return "integer";
  if (/DECIMAL|DOUBLE|FLOAT|NUMBER|PERCENT|BIG/.test(t)) return "number";
  if (/TIME/.test(t) && !/DATE/.test(t)) return "time";
  if (/DATE/.test(t)) return "date";
  return "text";
};

const rangeHint = (p: ApiPolicyParamDef) => {
  const parts: string[] = [];
  if (p.min != null) parts.push(`tối thiểu ${p.min}`);
  if (p.minExclusive != null) parts.push(`lớn hơn ${p.minExclusive}`);
  if (p.max != null) parts.push(`tối đa ${p.max}`);
  return parts.join(", ");
};

// Kiểm tra giá trị theo định nghĩa tham số trước khi gửi (backend vẫn kiểm tra lại)
const validateParam = (p: ApiPolicyParamDef, raw: string): string | null => {
  const value = raw.trim();
  if (!value) return p.required ? `Tham số "${p.name}" là bắt buộc.` : null;
  const kind = inputKind(p.type);
  if (kind === "integer" || kind === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return `"${p.name}" phải là số.`;
    if (kind === "integer" && !Number.isInteger(n)) return `"${p.name}" phải là số nguyên.`;
    if (p.min != null && n < Number(p.min)) return `"${p.name}" phải ≥ ${p.min}.`;
    if (p.minExclusive != null && n <= Number(p.minExclusive)) return `"${p.name}" phải > ${p.minExclusive}.`;
    if (p.max != null && n > Number(p.max)) return `"${p.name}" phải ≤ ${p.max}.`;
  }
  return null;
};

// "check": chỉ loại giờ nhận/trả phòng; "policy": các chính sách còn lại; "all": tất cả
const isCheckType = (type: string) => /CHECK/i.test(type);

export function PolicyConfig({
  propertyId,
  formulas: allFormulas,
  initialApplied,
  scope = "all",
}: {
  propertyId: string;
  formulas: ApiPolicyFormula[];
  initialApplied: AppliedPolicy[];
  scope?: "all" | "check" | "policy";
}) {
  const inScope = (type: string) =>
    scope === "all" ? true : scope === "check" ? isCheckType(type) : !isCheckType(type);
  const formulas = allFormulas.filter((f) => inScope(f.policyType));
  const types = Array.from(new Set(formulas.map((f) => f.policyType)));
  const [applied, setApplied] = useState<AppliedPolicy[]>(initialApplied);
  const [selectedType, setSelectedType] = useState<string>(types[0] ?? "");
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(
    formulas.find((f) => f.policyType === types[0])?.policyFormulaId ?? null
  );
  const [values, setValues] = useState<Record<string, string>>(() => {
    const firstId = formulas.find((f) => f.policyType === types[0])?.policyFormulaId;
    return paramsToRecord(initialApplied.find((p) => p.policyFormulaId === firstId)?.parameters);
  });
  const [isSaving, setIsSaving] = useState(false);

  const filteredFormulas = formulas.filter((f) => f.policyType === selectedType);
  const selectedFormula = formulas.find((f) => f.policyFormulaId === selectedFormulaId);
  const paramDefs = selectedFormula?.parameters ?? [];

  const selectFormula = (formulaId: number) => {
    setSelectedFormulaId(formulaId);
    // Nạp tham số đã cấu hình trước đó (nếu có) để chỉnh sửa
    setValues(paramsToRecord(applied.find((p) => p.policyFormulaId === formulaId)?.parameters));
  };

  // POST /hotel-policies gửi toàn bộ danh sách chính sách cần có của khách sạn
  const submit = async (policies: { policyFormulaId: number; parameters?: Record<string, string> }[]) => {
    await policyApi.configure(propertyId, { policies });
    setApplied((await policyApi.get(propertyId)).policies ?? []);
  };

  const handleApply = async () => {
    if (selectedFormulaId == null || !selectedFormula) return;

    for (const def of paramDefs) {
      const error = validateParam(def, values[def.name] ?? "");
      if (error) {
        toast.error(error);
        return;
      }
    }

    // Chỉ gửi các tham số có giá trị
    const parameters = Object.fromEntries(
      Object.entries(values)
        .map(([k, v]) => [k, String(v).trim()] as const)
        .filter(([, v]) => v !== "")
    );
    // Mỗi loại chính sách chỉ có một công thức → thay công thức cùng loại
    const others = applied
      .filter((p) => p.policyFormulaId !== selectedFormulaId && p.policyType !== selectedFormula.policyType)
      .map((p) => ({ policyFormulaId: p.policyFormulaId, parameters: paramsToRecord(p.parameters) }));

    setIsSaving(true);
    try {
      await submit([...others, { policyFormulaId: selectedFormulaId, parameters }]);
      toast.success(`Đã áp dụng chính sách "${selectedFormula.name}" thành công!`);
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

  const inputClass =
    "w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white";

  const renderInput = (def: ApiPolicyParamDef) => {
    const kind = inputKind(def.type);
    const value = values[def.name] ?? "";
    const onChange = (v: string) => setValues((prev) => ({ ...prev, [def.name]: v }));

    if (kind === "boolean") {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">-- Chọn --</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    const htmlType =
      kind === "integer" || kind === "number" ? "number" : kind === "time" ? "time" : kind === "date" ? "date" : "text";
    return (
      <input
        type={htmlType}
        step={kind === "integer" ? 1 : kind === "number" ? "any" : undefined}
        min={def.min != null ? String(def.min) : undefined}
        max={def.max != null ? String(def.max) : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {scope === "check" ? "Thiết Lập Giờ Nhận / Trả Phòng" : "Thiết Lập Chính Sách Hoạt Động"}
          </h3>
        </div>

        {formulas.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            {scope === "check"
              ? "Hệ thống chưa có công thức giờ nhận/trả phòng nào."
              : "Hệ thống chưa có công thức chính sách nào."}
          </p>
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

                {paramDefs.length === 0 ? (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Công thức này không có tham số. Bấm "Lưu & Áp dụng" để dùng luôn.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paramDefs.map((def) => (
                      <div key={def.name} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <code>{def.name}</code>
                          {def.required && <span className="text-rose-500"> *</span>}
                          <span className="ml-2 text-[10px] font-normal text-slate-400">
                            {def.type}
                            {rangeHint(def) ? ` • ${rangeHint(def)}` : ""}
                          </span>
                        </label>
                        {renderInput(def)}
                      </div>
                    ))}
                  </div>
                )}

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
          {scope === "check" ? "Giờ nhận/trả phòng đang áp dụng" : "Các chính sách đang được kích hoạt"} (
          {applied.filter((p) => inScope(p.policyType)).length})
        </h4>

        {applied.filter((p) => inScope(p.policyType)).length === 0 ? (
          <div className="text-xs text-slate-400 py-3 italic">Chưa áp dụng cấu hình nào.</div>
        ) : (
          <div className="space-y-2">
            {applied.filter((p) => inScope(p.policyType)).map((p) => (
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bảng quy chuẩn công thức & tham số (từ hệ thống)</h4>
        </div>
        {formulas.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Chưa có dữ liệu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-400">
                  <th className="py-2 pr-3 font-semibold">Loại</th>
                  <th className="py-2 pr-3 font-semibold">Công thức</th>
                  <th className="py-2 font-semibold">Tham số (kiểu, bắt buộc, giới hạn)</th>
                </tr>
              </thead>
              <tbody>
                {formulas.map((f) => (
                  <tr key={f.policyFormulaId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                    <td className="py-2.5 pr-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {typeLabel(f.policyType)}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700 dark:text-slate-300">{f.name}</td>
                    <td className="py-2.5 space-y-1">
                      {(f.parameters ?? []).length === 0 ? (
                        <span className="text-slate-400">Không có tham số</span>
                      ) : (
                        (f.parameters ?? []).map((p) => (
                          <div key={p.name}>
                            <code className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</code>{" "}
                            <span className="text-slate-400">
                              ({p.type}
                              {p.required ? ", bắt buộc" : ", tùy chọn"}
                              {rangeHint(p) ? `, ${rangeHint(p)}` : ""})
                            </span>
                          </div>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
  CHECK_TIME: "Giờ nhận/trả phòng",
};
// Quy chuẩn công thức theo loại chính sách (backend chỉ trả tên + loại nên danh mục tham số chuẩn giữ ở FE)
interface StandardParam {
  code: string;
  label: string;
  defaultValue: string;
  description: string;
}
interface StandardRule {
  expression: string;
  description: string;
  params: StandardParam[];
}
const STANDARD_RULES: Record<string, StandardRule> = {
  CANCELLATION: {
    expression: "days_before >= freeCancellationDays ? hoàn 100% : hoàn 0%",
    description: "Hoàn cọc nếu khách hủy trước số ngày quy định, sau mốc đó khách mất cọc.",
    params: [
      { code: "freeCancellationDays", label: "Số ngày tối thiểu để hoàn 100%", defaultValue: "3", description: "Hủy trước X ngày sẽ được hoàn toàn bộ tiền cọc" },
    ],
  },
  DEPOSIT: {
    expression: "total_amount * (deposit_percent / 100)",
    description: "Yêu cầu đặt cọc theo tỷ lệ phần trăm tổng giá trị đơn đặt phòng.",
    params: [
      { code: "deposit_percent", label: "Phần trăm tiền cọc", defaultValue: "50", description: "Tỷ lệ cọc từ 10% đến 100%" },
    ],
  },
  NO_SHOW: {
    expression: "keep_first_night ? min(deposit, giá đêm đầu) : deposit",
    description: "Khi khách không đến, giữ tiền cọc tương đương đêm đầu tiên và hoàn phần dư (nếu có).",
    params: [
      { code: "keep_first_night", label: "Giữ tiền đêm đầu tiên", defaultValue: "true", description: "true: chỉ giữ tương đương đêm đầu; false: giữ toàn bộ cọc" },
      { code: "response_hours", label: "Số giờ chờ khách phản hồi", defaultValue: "12", description: "Thời gian chờ trước khi đánh dấu No-Show" },
    ],
  },
  CHECK_TIME: {
    expression: "check_in_time, check_out_time",
    description: "Giờ nhận phòng và trả phòng tiêu chuẩn của khách sạn.",
    params: [
      { code: "check_in_time", label: "Giờ nhận phòng (Check-in)", defaultValue: "14:00", description: "Giờ bắt đầu cho phép nhận phòng" },
      { code: "check_out_time", label: "Giờ trả phòng (Check-out)", defaultValue: "12:00", description: "Giờ muộn nhất trả phòng" },
    ],
  },
};

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v === undefined || v === "" || Number.isNaN(n) ? fallback : n;
};

// Ví dụ minh họa kết quả công thức theo giá trị tham số người dùng đang nhập
const buildExample = (type: string, v: Record<string, string>): string[] => {
  switch (type) {
    case "CANCELLATION": {
      const d = num(v.freeCancellationDays, 3);
      return [
        `Khách hủy trước ${d} ngày hoặc hơn → hoàn 100% tiền cọc.`,
        `Khách hủy muộn hơn ${d} ngày → không hoàn cọc.`,
      ];
    }
    case "DEPOSIT": {
      const pct = num(v.deposit_percent, 50);
      const total = 2000000;
      return [`Đơn ${total.toLocaleString("vi-VN")}đ → cọc ${((total * pct) / 100).toLocaleString("vi-VN")}đ (${pct}%).`];
    }
    case "NO_SHOW": {
      const keep = (v.keep_first_night ?? "true") !== "false";
      return [
        keep
          ? "Khách không đến → giữ tiền cọc tương đương đêm đầu tiên, hoàn phần dư (nếu có)."
          : "Khách không đến → giữ toàn bộ tiền cọc.",
        `Chờ khách phản hồi tối đa ${num(v.response_hours, 12)} giờ trước khi đánh dấu No-Show.`,
      ];
    }
    case "CHECK_TIME":
      return [`Nhận phòng từ ${v.check_in_time || "14:00"}, trả phòng chậm nhất ${v.check_out_time || "12:00"}.`];
    default:
      return [];
  }
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
  const [rows, setRows] = useState<{ name: string; value: string }[]>(() => {
    const firstId = formulas.find((f) => f.policyType === types[0])?.policyFormulaId;
    const current = initialApplied.find((p) => p.policyFormulaId === firstId);
    return (current?.parameters ?? []).map((p) => ({ name: p.paramName, value: p.paramValue }));
  });
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
    setApplied((await policyApi.get(propertyId)).policies ?? []);
  };

  const handleApply = async () => {
    if (selectedFormulaId == null) return;
    const parameters = Object.fromEntries(rows.filter((r) => r.name.trim()).map((r) => [r.name.trim(), r.value]));
    const others = applied
      .filter((p) => p.policyFormulaId !== selectedFormulaId && p.policyType !== selectedFormula?.policyType)
      .map((p) => ({ policyFormulaId: p.policyFormulaId, parameters: paramsToRecord(p.parameters) }));
    const names = rows.map((r) => r.name.trim()).filter(Boolean);
    if (new Set(names).size !== names.length) {
      toast.error("Tên tham số bị trùng nhau, vui lòng kiểm tra lại.");
      return;
    }
    setIsSaving(true);
    try {
      await submit([...others, { policyFormulaId: selectedFormulaId, parameters }]);
      toast.success(`Đã áp dụng chính sách "${selectedFormula?.name}" thành công!`);
    } catch (err: any) {
      // Backend báo thiếu tham số bắt buộc: "Thieu tham so bat buoc: freeCancellationDays"
      const missing = String(err?.message || "").match(/tham so bat buoc:\s*([\w\s,]+)/i);
      if (missing) {
        const names = missing[1].split(",").map((n) => n.trim()).filter(Boolean);
        const standard = STANDARD_RULES[selectedFormula?.policyType ?? ""]?.params ?? [];
        setRows((prev) => [
          ...prev,
          ...names
            .filter((n) => !prev.some((r) => r.name.trim() === n))
            .map((n) => ({ name: n, value: standard.find((p) => p.code === n)?.defaultValue ?? "" })),
        ]);
        toast.error(`Công thức này bắt buộc có tham số: ${names.join(", ")}. Đã thêm vào form, hãy nhập giá trị rồi lưu lại.`);
      } else {
        toast.error(err?.message || "Không thể lưu cấu hình chính sách.");
      }
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

                {STANDARD_RULES[selectedFormula.policyType] && (
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30 space-y-2 text-xs">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300">Công thức & hướng dẫn</div>
                    <code className="block text-[11px] text-indigo-700 dark:text-indigo-300">
                      {STANDARD_RULES[selectedFormula.policyType].expression}
                    </code>
                    <p className="text-slate-600 dark:text-slate-400">{STANDARD_RULES[selectedFormula.policyType].description}</p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Chọn công thức ở trên, sau đó bấm "Điền tham số chuẩn" hoặc tự thêm tham số.</li>
                      <li>
                        Điều chỉnh giá trị:{" "}
                        {STANDARD_RULES[selectedFormula.policyType].params.map((p) => `${p.code} (${p.label})`).join("; ")}.
                      </li>
                      <li>Xem ví dụ bên dưới để kiểm tra kết quả rồi bấm "Lưu & Áp dụng".</li>
                    </ol>
                    <div className="pt-1 border-t border-indigo-200/70 dark:border-indigo-900 space-y-0.5">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Ví dụ với giá trị hiện tại:</div>
                      {buildExample(
                        selectedFormula.policyType,
                        Object.fromEntries(rows.filter((r) => r.name.trim()).map((r) => [r.name.trim(), r.value]))
                      ).map((line) => (
                        <div key={line} className="text-slate-600 dark:text-slate-400">• {line}</div>
                      ))}
                    </div>
                  </div>
                )}

                {STANDARD_RULES[selectedFormula.policyType] && (
                  <button
                    type="button"
                    onClick={() =>
                      setRows(
                        STANDARD_RULES[selectedFormula.policyType].params.map((p) => ({
                          name: p.code,
                          value: p.defaultValue,
                        }))
                      )
                    }
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Điền tham số chuẩn theo bảng quy chuẩn bên dưới
                  </button>
                )}

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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bảng quy chuẩn công thức & tham số</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-400">
                <th className="py-2 pr-3 font-semibold">Loại</th>
                <th className="py-2 pr-3 font-semibold">Công thức</th>
                <th className="py-2 pr-3 font-semibold">Tham số (mặc định)</th>
                <th className="py-2 font-semibold">Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(STANDARD_RULES).map(([type, rule]) => (
                <tr key={type} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                  <td className="py-2.5 pr-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{typeLabel(type)}</td>
                  <td className="py-2.5 pr-3">
                    <code className="text-[11px] text-indigo-600 dark:text-indigo-400">{rule.expression}</code>
                    <p className="mt-1 text-[11px] text-slate-400">{rule.description}</p>
                  </td>
                  <td className="py-2.5 pr-3 space-y-1">
                    {rule.params.map((p) => (
                      <div key={p.code}>
                        <code className="font-semibold text-slate-800 dark:text-slate-200">{p.code}</code> = {p.defaultValue}
                      </div>
                    ))}
                  </td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400 space-y-1">
                    {rule.params.map((p) => (
                      <div key={p.code}>{p.label}: {p.description}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Check, X } from "lucide-react";

export function PasswordStrengthHint({ password }: { password?: string }) {
  const pwd = password || "";
  const hasLength = pwd.length >= 8;
  const hasNumber = /\d/.test(pwd);
  const hasLetter = /[A-Za-z]/.test(pwd);
  const startsUpper = /^[A-Z]/.test(pwd);
  const rules = [
    { ok: hasLength, label: "Tối thiểu 8 ký tự" },
    { ok: startsUpper, label: "Chữ cái đầu viết hoa" },
    { ok: hasLetter, label: "Có chữ cái" },
    { ok: hasNumber, label: "Có ít nhất 1 chữ số" },
  ];

  return (
    <div className="space-y-1 text-[11px] text-slate-500 pt-1">
      {rules.map((r) => (
        <div key={r.label} className="flex items-center gap-1.5">
          {r.ok ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
          <span className={r.ok ? "text-emerald-600 font-medium" : ""}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

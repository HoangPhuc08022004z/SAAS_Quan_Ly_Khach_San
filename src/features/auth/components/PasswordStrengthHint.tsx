import React from "react";
import { Check, X } from "lucide-react";

export function PasswordStrengthHint({ password }: { password?: string }) {
  const pwd = password || "";
  const hasLength = pwd.length >= 6;
  const hasNumber = /\d/.test(pwd);

  return (
    <div className="space-y-1 text-[11px] text-slate-500 pt-1">
      <div className="flex items-center gap-1.5">
        {hasLength ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
        <span className={hasLength ? "text-emerald-600 font-medium" : ""}>Tối thiểu 6 ký tự</span>
      </div>
      <div className="flex items-center gap-1.5">
        {hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
        <span className={hasNumber ? "text-emerald-600 font-medium" : ""}>Có ít nhất 1 chữ số</span>
      </div>
    </div>
  );
}

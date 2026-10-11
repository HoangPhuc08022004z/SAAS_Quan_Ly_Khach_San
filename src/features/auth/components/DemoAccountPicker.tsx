import React from "react";
import { UserCheck } from "lucide-react";

interface DemoAccountPickerProps {
  onSelect: (email: string, pass: string) => void;
}

export function DemoAccountPicker({ onSelect }: DemoAccountPickerProps) {
  const accounts = [
    { email: "admin@hotelsaas.vn", label: "Admin SaaS", role: "admin" },
    { email: "owner.abc@gmail.com", label: "Owner ABC (Đang hoạt động)", role: "owner" },
    { email: "owner.sunrise@gmail.com", label: "Owner Sunrise (Còn 5 ngày)", role: "owner" },
    { email: "owner.lotus@gmail.com", label: "Owner Lotus (Đã hết hạn)", role: "owner" },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Chọn nhanh tài khoản Demo (Mật khẩu: 123456):</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {accounts.map((acc) => (
          <button
            key={acc.email}
            type="button"
            onClick={() => onSelect(acc.email, "123456")}
            className="text-left px-2.5 py-1.5 text-[11px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{acc.label}</div>
            <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

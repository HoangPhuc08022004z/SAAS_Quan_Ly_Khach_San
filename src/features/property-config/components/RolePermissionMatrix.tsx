"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, Minus } from "lucide-react";
import { userApi, type ApiRole, type ApiUserSummary } from "@/lib/api";
import { isOwnerRole, normalizePermission } from "@/config/roles";

type Perm = { code: string; name: string };

/**
 * Ma trận quyền lấy hoàn toàn từ backend: vai trò từ GET /api/roles, quyền của mỗi vai trò
 * đọc từ GET /api/properties/{id}/users/{userId} của một nhân viên đang giữ vai trò đó
 * (backend không có API liệt kê quyền theo vai trò).
 */
export function RolePermissionMatrix({
  propertyId,
  roles,
  staff,
}: {
  propertyId: string;
  roles: ApiRole[];
  staff: ApiUserSummary[];
}) {
  const staffRoles = roles.filter((r) => !isOwnerRole(r.name));
  const [perms, setPerms] = useState<Record<number, Perm[] | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        staffRoles.map(async (r) => {
          const sample = staff.find((s) => s.roleId === r.roleId && s.status === "ACTIVE") ?? staff.find((s) => s.roleId === r.roleId);
          if (!sample) return [r.roleId, null] as const;
          try {
            const d = await userApi.get(propertyId, sample.userId);
            return [r.roleId, (d.permissions ?? []).map((p) => ({ code: normalizePermission(p.code), name: p.name }))] as const;
          } catch {
            return [r.roleId, null] as const;
          }
        })
      );
      if (alive) {
        setPerms(Object.fromEntries(entries));
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, roles.length, staff.length]);

  const all = new Map<string, string>();
  Object.values(perms).forEach((list) => list?.forEach((p) => all.set(p.code, p.name)));
  const codes = [...all.keys()].sort();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quyền của từng vai trò (dữ liệu từ backend)</h4>
        <p className="text-xs text-slate-400">
          Backend chỉ cho đọc quyền qua nhân viên, nên vai trò chưa có nhân viên nào sẽ chưa hiển thị được quyền. Hãy tạo một nhân viên mẫu cho vai trò đó.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Đang đọc quyền…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 pr-3 font-semibold">Quyền</th>
                {staffRoles.map((r) => (
                  <th key={r.roleId} className="py-2 px-3 text-center font-semibold">
                    {r.name}
                    {perms[r.roleId] === null && <div className="text-[10px] font-normal text-amber-600">chưa có nhân viên</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="py-1.5 pr-3">
                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{c}</div>
                    {all.get(c) && all.get(c) !== c && <div className="text-[10px] text-slate-400">{all.get(c)}</div>}
                  </td>
                  {staffRoles.map((r) => (
                    <td key={r.roleId} className="py-1.5 px-3 text-center">
                      {perms[r.roleId]?.some((p) => p.code === c) ? (
                        <Check className="inline w-4 h-4 text-emerald-600" />
                      ) : (
                        <Minus className="inline w-4 h-4 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {codes.length === 0 && (
                <tr><td colSpan={staffRoles.length + 1} className="py-4 text-center text-slate-400">Chưa đọc được quyền nào từ backend.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

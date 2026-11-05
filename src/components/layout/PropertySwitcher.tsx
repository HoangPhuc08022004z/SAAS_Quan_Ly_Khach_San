"use client";

import React, { useEffect, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useSessionStore } from "@/lib/auth/session-store";
import { propertyApi } from "@/lib/api";

interface SwitcherProperty {
  id: string;
  name: string;
}

export function PropertySwitcher({ portal }: { portal: "owner" | "pms" }) {
  const { currentPropertyId, setCurrentPropertyId, property } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [ownerProperties, setOwnerProperties] = useState<SwitcherProperty[]>([]);

  // Owner: lấy danh sách khách sạn thật (GET /api/properties). Nhân viên PMS chỉ thuộc một khách sạn (lấy từ phiên đăng nhập).
  useEffect(() => {
    if (portal !== "owner") return;
    let alive = true;
    propertyApi
      .list()
      .then((list) => {
        if (alive) setOwnerProperties(list.map((p) => ({ id: String(p.propertyId), name: p.name })));
      })
      .catch(() => {
        if (alive) setOwnerProperties([]);
      });
    return () => {
      alive = false;
    };
  }, [portal]);

  const properties: SwitcherProperty[] =
    portal === "owner" ? ownerProperties : property ? [{ id: property.id, name: property.name }] : [];
  const currentProp = properties.find((p) => p.id === currentPropertyId) || properties[0];

  if (!currentProp) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentProp.name}</span>
        {properties.length > 1 && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isOpen && properties.length > 1 && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Chọn khách sạn vận hành
          </div>
          <div className="space-y-0.5 mt-1">
            {properties.map((p) => {
              const isSelected = p.id === currentProp.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentPropertyId(p.id);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span className="truncate">{p.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

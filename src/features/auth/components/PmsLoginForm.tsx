"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { api } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import { FormField } from "@/components/forms/FormField";
import { toast } from "sonner";
import { ArrowRight, Loader2, Hotel, AlertOctagon, UserCheck } from "lucide-react";

export function PmsLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const setPmsSession = useSessionStore((s) => s.setPmsSession);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "letan1.hn@abc.vn",
      password: "password123",
    },
  });

  const staffDemos = [
    { email: "manager.hn@abc.vn", label: "Quản lý (Manager)" },
    { email: "letan1.hn@abc.vn", label: "Lễ tân (Receptionist)" },
    { email: "buongphong.hn@abc.vn", label: "Buồng phòng (Housekeeping)" },
  ];

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLockError(null);
    try {
      const res = await api.pmsLogin(data);
      setPmsSession({
        user: res.user,
        role: res.role,
        permissions: res.permissions,
        property: res.property,
      });

      toast.success(`Đăng nhập thành công! Chào ${res.user.full_name} (${res.role.name})`);
      router.push("/pms");
    } catch (err: any) {
      if (err?.code === "TENANT_LOCKED") {
        setLockError(err.message);
      } else {
        toast.error(err?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Demo staff pickers */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Tài khoản Demo PMS (Mật khẩu: 123456):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {staffDemos.map((s) => (
            <button
              key={s.email}
              type="button"
              onClick={() => {
                setValue("email", s.email);
                setValue("password", "123456");
              }}
              className="text-left px-2.5 py-1.5 text-[11px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{s.email}</div>
            </button>
          ))}
        </div>
      </div>

      {lockError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs">
          <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold">Khách sạn đang bị tạm khóa vận hành</h5>
            <p className="leading-relaxed">{lockError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email nhân viên" error={errors.email?.message} required>
          <input
            {...register("email")}
            type="email"
            placeholder="letan@khachsan.vn"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message} required>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all mt-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng nhập ca làm việc</span>}
          {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← Quay lại đăng nhập nền tảng (Owner / Admin)
        </Link>
      </div>
    </div>
  );
}

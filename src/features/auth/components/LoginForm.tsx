"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { loginUser, resolveAccountRole, saasApi } from "@/lib/api";
import { getOwnerLanding } from "@/lib/auth/owner-landing";
import { useSessionStore } from "@/lib/auth/session-store";
import { FormField } from "@/components/forms/FormField";
import { toast } from "sonner";
import { ArrowRight, Loader2, Hotel } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAccountSession = useSessionStore((s) => s.setAccountSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Gọi API OpenAPI: POST /api/v1/saas/user/login
      const loginRes = await loginUser({
        email: data.email,
        password: data.password,
      });

      // token null = sai mật khẩu (backend trả 400 với token: null)
      if (!loginRes.token) {
        throw new Error(loginRes.message || "Sai email hoặc mật khẩu.");
      }

      saasApi.setToken(loginRes.token);

      // Backend không đưa role vào JWT → xác định role bằng cách thử endpoint theo quyền
      const resolved = await resolveAccountRole();
      const now = new Date().toISOString();
      const isAdmin = resolved.role === "ADMIN";
      const profile = resolved.role === "OWNER" ? resolved.profile : null;
      const account = {
        id: data.email,
        email: data.email,
        full_name: profile?.userName || (isAdmin ? "SaaS Admin" : data.email),
        is_admin: isAdmin,
        created_at: now,
        updated_at: now,
      };
      const currentTenant = useSessionStore.getState().tenant;
      setAccountSession({
        account,
        tenant:
          profile?.tenantName && currentTenant
            ? { ...currentTenant, name: profile.tenantName }
            : undefined,
      });
      const res = { account };

      toast.success(`Đăng nhập thành công! Chào mừng ${res.account.full_name}`);
      if (res.account.is_admin) {
        router.push("/admin");
      } else {
        router.push(getOwnerLanding(profile?.subscriptionStatus));
      }
    } catch (err: any) {
      saasApi.setToken(null);
      // Backend trả 500 khi email không tồn tại (NullPointerException)
      const msg = String(err?.message || "");
      toast.error(
        !msg || /nội bộ|HTTP 500/i.test(msg)
          ? "Email hoặc mật khẩu không chính xác."
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email tài khoản" error={errors.email?.message} required>
          <input
            {...register("email")}
            type="email"
            autoComplete="off"
            placeholder=""
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message} required>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all mt-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng nhập nền tảng</span>}
          {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <Link
          href="/pms/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400"
        >
          <Hotel className="w-3.5 h-3.5 text-blue-500" />
          <span>Bạn là nhân viên khách sạn? Đăng nhập cổng vận hành PMS →</span>
        </Link>
      </div>
    </div>
  );
}

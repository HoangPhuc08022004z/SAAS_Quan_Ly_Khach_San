"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { api, loginUser, saasApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import { FormField } from "@/components/forms/FormField";
import { DemoAccountPicker } from "./DemoAccountPicker";
import { toast } from "sonner";
import { ArrowRight, Loader2, Hotel } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAccountSession = useSessionStore((s) => s.setAccountSession);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner.abc@gmail.com",
      password: "password123",
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

      // Đồng bộ thông tin phiên làm việc cho giao diện (mock local session)
      const res = await api.loginAccount(data);
      setAccountSession({
        account: res.account,
        tenant: res.tenant,
        subscription: res.subscription,
      });

      toast.success(`Đăng nhập thành công! Chào mừng ${res.account.full_name}`);
      if (res.account.is_admin) {
        router.push("/admin");
      } else {
        router.push("/owner");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickDemo = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
  };

  return (
    <div className="space-y-5">
      <DemoAccountPicker onSelect={handlePickDemo} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email tài khoản" error={errors.email?.message} required>
          <input
            {...register("email")}
            type="email"
            placeholder="admin@hotelsaas.vn hoặc owner@gmail.com"
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

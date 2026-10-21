"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "../schemas/auth.schema";
import { registerUser } from "@/lib/api";
import { FormField } from "@/components/forms/FormField";
import { PasswordStrengthHint } from "./PasswordStrengthHint";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });

  const pwdWatch = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Gọi API OpenAPI: POST /api/v1/saas/user/register
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.full_name,
      });

      toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      router.push(`/login?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(err?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Họ và tên" error={errors.full_name?.message} required>
        <input
          {...register("full_name")}
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A"
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </FormField>

      <FormField label="Địa chỉ Email" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          placeholder="name@company.com"
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
        <PasswordStrengthHint password={pwdWatch} />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all mt-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng ký tài khoản</span>}
        {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </form>
  );
}

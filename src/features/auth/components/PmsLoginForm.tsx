"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { pmsAuthApi, saasApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import { useRedirectIfSignedIn } from "@/lib/auth/use-redirect-if-signed-in";
import { FormField } from "@/components/forms/FormField";
import { toast } from "sonner";
import { ArrowRight, Loader2, Hotel, AlertOctagon } from "lucide-react";

export function PmsLoginForm() {
  const router = useRouter();
  useRedirectIfSignedIn("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [lockError, setLockError] = useState<{ title: string; message: string } | null>(null);
  const setPmsSession = useSessionStore((s) => s.setPmsSession);

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
    setLockError(null);
    try {
      // POST /api/v1/pms/auth/login — token nhân viên PMS (claim actor_type=PMS_EMPLOYEE)
      const res = await pmsAuthApi.login(data);
      saasApi.setToken(res.accessToken);

      const now = new Date().toISOString();
      const roleName = res.user.role;
      setPmsSession({
        user: {
          id: String(res.user.userId),
          tenant_id: String(res.user.tenantId),
          property_id: String(res.user.propertyId),
          role_id: roleName,
          email: res.user.email,
          full_name: res.user.fullName,
          phone: "",
          status: "ACTIVE",
        },
        role: { id: roleName, name: roleName, code: roleName as any, description: "" },
        permissions: res.permissions ?? [],
        property: {
          id: String(res.user.propertyId),
          tenant_id: String(res.user.tenantId),
          name: res.user.propertyName,
          address: "",
          phone: "",
          email: "",
          description: "",
          image_url: "",
          status: "ACTIVE",
          created_at: now,
          updated_at: now,
        },
      });

      toast.success(`Đăng nhập thành công! Chào ${res.user.fullName} (${roleName})`);
      router.push("/pms");
    } catch (err: any) {
      saasApi.setToken(null);
      const msg = String(err?.message || "");
      const plain = msg.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();
      if (/mat khau|email hoac|401/.test(plain)) {
        toast.error("Email hoặc mật khẩu không chính xác.");
      } else if (/vai tro|role|owner/.test(plain)) {
        // Nhân viên bị gán vai trò OWNER hoặc vai trò đã ngừng hoạt động
        setLockError({ title: "Vai trò của tài khoản không được phép đăng nhập PMS", message: msg });
      } else if (/nhan vien|user|tai khoan/.test(plain)) {
        setLockError({ title: "Tài khoản nhân viên không hoạt động", message: msg });
      } else if (/tenant|subscription|goi|plan|het han|property|khach san/.test(plain)) {
        setLockError({ title: "Khách sạn / gói thuê bao đang bị tạm khóa vận hành", message: msg });
      } else {
        toast.error(msg || "Đăng nhập thất bại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {lockError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs">
          <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold">{lockError.title}</h5>
            <p className="leading-relaxed">Backend trả về: {lockError.message}</p>
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

    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
  ShieldAlert,
  Layers,
  DoorOpen,
  DollarSign,
  Briefcase,
  Utensils,
  Users,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";

export function SetupWizard({
  propertyId,
  propertyName,
  setupStatus,
}: {
  propertyId: string;
  propertyName: string;
  setupStatus: any;
}) {
  const completedList = (setupStatus?.completedSteps || setupStatus?.completed || ["info"]) as string[];

  const steps = [
    {
      id: "info",
      title: "1. Thông tin khách sạn",
      desc: "Tên, địa chỉ, ảnh đại diện, email và số hotline",
      icon: Layers,
      href: `/owner/properties/${propertyId}`,
      isDone: completedList.includes("info"),
    },
    {
      id: "check_times",
      title: "2. Giờ nhận / trả phòng",
      desc: "Quy định giờ Check-in tiêu chuẩn và Check-out",
      icon: Clock,
      href: `/owner/properties/${propertyId}/check-times`,
      isDone: completedList.includes("check_times"),
    },
    {
      id: "policies",
      title: "3. Chính sách & Policy",
      desc: "Công thức hủy phòng, đặt cọc và xử lý No-Show",
      icon: ShieldAlert,
      href: `/owner/properties/${propertyId}/policies`,
      isDone: completedList.includes("policies"),
    },
    {
      id: "documents",
      title: "4. Tài liệu & Nội quy (RAG)",
      desc: "Nạp cẩm nang khách sạn để Chatbot tư vấn cho khách",
      icon: FileText,
      href: `/owner/properties/${propertyId}/documents`,
      isDone: true, // Optional or always accessible
    },
    {
      id: "room_types",
      title: "5. Loại phòng & Phòng",
      desc: "Cấu hình loại phòng, tiện nghi và danh sách phòng",
      icon: DoorOpen,
      href: `/owner/properties/${propertyId}/room-types`,
      isDone: completedList.includes("room_types") && completedList.includes("rooms"),
    },
    {
      id: "rates",
      title: "6. Bảng giá phòng",
      desc: "Thiết lập mức giá niêm yết cho từng loại phòng",
      icon: DollarSign,
      href: `/owner/properties/${propertyId}/room-types`,
      isDone: completedList.includes("rates"),
    },
    {
      id: "services",
      title: "7. Dịch vụ khách sạn",
      desc: "Chọn các tiện ích giặt ủi, spa, đưa đón từ catalog",
      icon: Briefcase,
      href: `/owner/properties/${propertyId}/services`,
      isDone: completedList.includes("services"),
    },
    {
      id: "fnb",
      title: "8. Menu ẩm thực (F&B)",
      desc: "Danh mục món ăn, đồ uống và định mức phục vụ",
      icon: Utensils,
      href: `/owner/properties/${propertyId}/fnb`,
      isDone: completedList.includes("fnb"),
    },
    {
      id: "staff",
      title: "9. Tài khoản nhân viên",
      desc: "Tạo tài khoản phân quyền: Quản lý, Lễ tân, Buồng phòng",
      icon: Users,
      href: `/owner/properties/${propertyId}/staff`,
      isDone: completedList.includes("staff"),
    },
    {
      id: "gateway",
      title: "10. Cổng thanh toán",
      desc: "Kết nối cổng MoMo, VNPay để nhận cọc trực tuyến",
      icon: CreditCard,
      href: `/owner/properties/${propertyId}/payment-gateway`,
      isDone: completedList.includes("gateway"),
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overview progress card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
              Cấu hình vận hành
            </span>
            <span className="text-xs text-slate-400">({completedCount}/{steps.length} bước hoàn tất)</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Wizard Thiết Lập: {propertyName}
          </h2>
          <p className="text-xs text-slate-400 max-w-lg">
            Hoàn thiện 10 bước cấu hình bắt buộc bên dưới để khách sạn có thể mở cổng đặt phòng trực tuyến và kích hoạt phân hệ PMS.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-black text-blue-600">{percent}%</div>
            <div className="text-[11px] text-slate-400">Độ sẵn sàng</div>
          </div>
          <div className="h-14 w-14 rounded-full border-4 border-slate-100 flex items-center justify-center dark:border-slate-800 relative">
            <div
              className="absolute inset-0 rounded-full border-4 border-blue-600 transition-all"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${percent}%, 0 ${percent}%)`,
              }}
            />
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                s.isDone
                  ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/60 dark:bg-emerald-950/10"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    s.isDone
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{s.title}</h3>
                    {s.isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{s.desc}</p>
                </div>
              </div>

              <Link
                href={s.href}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                  s.isDone
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <span>{s.isDone ? "Sửa" : "Thiết lập"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

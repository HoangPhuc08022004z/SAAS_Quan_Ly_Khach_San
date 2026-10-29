import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileView } from "@/features/profile/components/ProfileView";

export default function PmsProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hồ Sơ Cá Nhân" description="Thông tin tài khoản đang đăng nhập." />
      <ProfileView portal="pms" />
    </div>
  );
}

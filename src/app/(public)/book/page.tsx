// Cổng đặt phòng cho khách (không cần đăng nhập)
// API: GET /api/public/properties/{id}/available-rooms, trang /p/{id} và /p/reservation dùng các API đặt phòng công khai
import React from "react";
import { CustomerPortal } from "@/features/public/components/CustomerPortal";

export default function BookingPortalPage() {
  // Danh sách mã khách sạn nổi bật cấu hình ở .env: NEXT_PUBLIC_FEATURED_PROPERTY_IDS=19,25
  const featuredIds = (process.env.NEXT_PUBLIC_FEATURED_PROPERTY_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
  const scanMax = Number(process.env.NEXT_PUBLIC_PROPERTY_SCAN_MAX ?? 40) || 40;
  return <CustomerPortal featuredIds={featuredIds} scanMax={scanMax} />;
}

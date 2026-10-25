import type { SubscriptionStatus } from "@/lib/api/types/openapi.interface";

/** Owner chưa đăng ký gói → trang chọn gói; đã có gói nhưng chưa ACTIVE → trang trạng thái thuê bao. */
export function getOwnerLanding(status: SubscriptionStatus | null | undefined): string {
  if (!status) return "/owner/subscribe";
  if (status === "ACTIVE") return "/owner";
  return "/owner/subscription";
}

// Các trang Owner vẫn truy cập được khi chưa có gói ACTIVE
export const OWNER_PUBLIC_PATHS = ["/owner/subscribe", "/owner/subscription", "/owner/support"];

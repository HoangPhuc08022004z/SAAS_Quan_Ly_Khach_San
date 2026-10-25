/**
 * Chuyển đổi dữ liệu OpenAPI (camelCase) sang shape mà các component hiện tại đang dùng (snake_case).
 */
import type { Plan } from "./types";
import type { SubscriptionPlan } from "./types/openapi.interface";

export const toPlan = (p: SubscriptionPlan): Plan => ({
  id: String(p.planId),
  name: p.name,
  description: p.description ?? "",
  price: Number(p.price),
  duration: p.duration,
  duration_unit: p.durationUnit,
  max_users: p.maxUsers,
  max_properties: p.maxProperties,
  max_rooms: p.maxRooms,
  max_storage: p.maxStorage, // backend lưu bytes (vd 1073741824 = 1 GB)
  status: p.status,
  created_at: "",
  updated_at: "",
});

export const durationUnitLabel = (unit: Plan["duration_unit"]) =>
  unit === "MONTH" ? "tháng" : unit === "YEAR" ? "năm" : "ngày";

/**
 * Chuyển đổi dữ liệu OpenAPI (camelCase) sang shape mà các component hiện tại đang dùng (snake_case).
 */
import type { Plan } from "./types";
import type { SubscriptionPlan } from "./types/openapi.interface";
import type { ApiProperty, ApiRoomType, ApiRoom, ApiRoomRate, ApiFnbMenu } from "./property-api";

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

// ============================================================================
// PROPERTY & CẤU HÌNH PHÒNG (openapi (2).yaml → shape UI cũ)
// ============================================================================

export const PLACEHOLDER_HOTEL_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
export const PLACEHOLDER_ROOM_IMAGE = "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800";

// Backend trả `image` dạng chuỗi (có thể là key MinIO) → chỉ hiển thị khi là URL dùng được
export const usableImage = (image: string | null | undefined, fallback: string) =>
  image && /^(https?:|data:|\/)/.test(image) ? image : fallback;

export const toUiProperty = (p: ApiProperty) => ({
  id: String(p.propertyId),
  name: p.name,
  address: p.address,
  phone: p.phone ?? "",
  email: p.email ?? "",
  description: p.description ?? "",
  image_url: usableImage(p.image, PLACEHOLDER_HOTEL_IMAGE),
  status: "ACTIVE" as const,
});

export const toUiRoomType = (rt: ApiRoomType, propertyId: string | number) => ({
  id: String(rt.roomTypeId),
  property_id: String(rt.propertyId ?? propertyId),
  name: rt.name,
  description: rt.description ?? "",
  capacity: rt.capacity,
  bed_type: rt.bedType,
  num_beds: rt.numberOfBeds,
  number_of_rooms: rt.numberOfRooms,
  image_url: usableImage(rt.image, PLACEHOLDER_ROOM_IMAGE),
  amenities: rt.amenities ?? [],
  status: rt.status === "INACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const),
});

export const toUiRoom = (r: ApiRoom) => ({
  id: String(r.roomId),
  room_type_id: String(r.roomTypeId),
  room_number: r.roomNumber,
  floor: r.floor,
  status: r.status,
  is_available: r.isAvailable,
  description: r.description ?? "",
});

export const toUiRoomRate = (r: ApiRoomRate) => ({
  id: String(r.roomRateId),
  room_type_id: String(r.roomTypeId),
  rate_name: r.rateName,
  price: Number(r.price),
  description: r.description ?? "",
  is_active: r.status !== "INACTIVE",
});

export const toUiFnb = (m: ApiFnbMenu) => ({
  id: String(m.fnbMenuId),
  property_id: String(m.propertyId),
  name: m.name,
  max_quantity: m.maxQuantity,
  actual_quantity: m.actualQuantity,
  purchase_price: Number(m.purchasePrice),
  profit_percent: Number(m.sellingPricePercent),
  selling_price: Number(m.sellingPrice),
  status: m.status,
});

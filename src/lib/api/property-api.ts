/**
 * Client cho nhóm API vận hành khách sạn của Owner (Property, Room Type, Room, Room Rate, F&B,
 * Service, Hotel Policy, Policy Document, User) — theo openapi (2).yaml.
 * Dùng chung HTTP client (JWT, proxy, xử lý lỗi) của saasApi.
 */
import { saasApi } from "./saas-api";

// ============================================================================
// TYPES
// ============================================================================

export type ActiveStatus = "ACTIVE" | "INACTIVE";

export interface ApiProperty {
  propertyId: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  image?: string | null;
}

export interface PropertyInput {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
  image?: File | null;
}

export type RoomTypeName =
  | "STANDARD"
  | "SUPERIOR"
  | "DELUXE"
  | "EXECUTIVE"
  | "SUITE"
  | "FAMILY"
  | "PRESIDENTIAL";

export const ROOM_TYPE_NAMES: RoomTypeName[] = [
  "STANDARD",
  "SUPERIOR",
  "DELUXE",
  "EXECUTIVE",
  "SUITE",
  "FAMILY",
  "PRESIDENTIAL",
];

export interface ApiRoomType {
  roomTypeId: number;
  propertyId?: number;
  name: RoomTypeName;
  description?: string | null;
  capacity: number;
  bedType: string;
  numberOfBeds: number;
  numberOfRooms: number;
  image?: string | null;
  status?: string;
  amenities?: string[] | null;
}

export interface RoomTypeInput {
  name: RoomTypeName;
  description?: string;
  capacity: number;
  bedType: string;
  numberOfBeds: number;
  numberOfRooms: number;
  image?: string;
  amenities?: string[];
}

export interface ApiRoom {
  roomId: number;
  roomNumber: string;
  floor: number;
  status: string;
  description?: string | null;
  isAvailable: boolean;
  roomTypeId: number;
}

export interface RoomConfiguration {
  propertyId: number;
  roomTypes: { roomTypeId: number; name: RoomTypeName; numberOfRooms: number }[];
  rooms: ApiRoom[];
}

export interface RoomItemInput {
  roomId?: number;
  roomNumber: string;
  floor: number;
  status: string;
  description?: string;
  isAvailable?: boolean;
  roomTypeId: number;
}

export interface ConfigureRoomsResult {
  propertyId: number;
  created: number;
  updated: number;
  deleted: number;
  message: string;
}

export type RateName = "STANDARD_RATE" | "WEEKEND_RATE";

export interface ApiRoomRate {
  roomRateId: number;
  propertyId: number;
  roomTypeId: number;
  roomTypeName?: RoomTypeName;
  rateName: RateName;
  price: number;
  status: string;
  description?: string | null;
}

export interface RoomRateInput {
  roomTypeId: number;
  rateName: RateName;
  price: number;
  description?: string;
}

export interface ApiFnbMenu {
  fnbMenuId: number;
  propertyId: number;
  name: string;
  maxQuantity: number;
  actualQuantity: number;
  purchasePrice: number;
  sellingPricePercent: number;
  sellingPrice: number;
  status: ActiveStatus;
}

export interface FnbMenuInput {
  name: string;
  maxQuantity: number;
  actualQuantity: number;
  purchasePrice: number;
  sellingPricePercent: number;
}

export interface ApiServiceCatalogItem {
  serviceId: number;
  name: string;
  serviceType?: string;
  description?: string | null;
}

export interface ApiPropertyService {
  propertyServiceId: number;
  propertyId: number;
  serviceId: number;
  name: string;
  serviceType?: string;
  description?: string | null;
  price?: number | null;
  status: ActiveStatus;
  catalogStatus?: string;
}

export interface ApiPolicyFormula {
  policyFormulaId: number;
  policyType: string;
  name: string;
  status?: string;
}

export interface ApiHotelPolicies {
  propertyId: number;
  policies: {
    policyFormulaId: number;
    policyType: string;
    name: string;
    status?: string;
    parameters?: { paramName: string; paramValue: string }[];
  }[];
}

export interface ConfigurePoliciesInput {
  policies: { policyFormulaId: number; parameters?: Record<string, string> }[];
}

export interface ApiPolicyDocuments {
  propertyId: number;
  documents: { fileId: number; fileName: string; fileType: string; fileSize: number }[];
}

export interface ApiRole {
  roleId: number;
  name: string;
  description?: string | null;
}

export interface ApiUserSummary {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  status: ActiveStatus;
  roleId: number;
  roleName: string;
}

export interface ApiUserDetail extends ApiUserSummary {
  permissions?: { code: string; name: string }[];
}

export interface ApiUserWithRole {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  status: ActiveStatus;
  role: ApiRole;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
}

export interface UpdateUserInput {
  fullName: string;
  phone?: string;
  roleId: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const request = <T>(endpoint: string, options?: RequestInit, salvage?: (raw: string) => T) =>
  saasApi.request<T>(endpoint, options, salvage);
const withBody = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

function propertyForm(data: Partial<PropertyInput>): FormData {
  const form = new FormData();
  (["name", "address", "phone", "email", "description"] as const).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) form.append(key, value);
  });
  if (data.image) form.append("image", data.image);
  return form;
}

// ============================================================================
// PROPERTY
// ============================================================================

export const propertyApi = {
  list: () => request<ApiProperty[]>("/api/properties"),
  get: (propertyId: number | string) => request<ApiProperty>(`/api/properties/${propertyId}`),
  create: (data: PropertyInput) => request<ApiProperty>("/api/properties", { method: "POST", body: propertyForm(data) }),
  update: (propertyId: number | string, data: Partial<PropertyInput>) =>
    request<ApiProperty>(`/api/properties/${propertyId}`, { method: "PUT", body: propertyForm(data) }),
  remove: (propertyId: number | string) => request<void>(`/api/properties/${propertyId}`, { method: "DELETE" }),
};

// ============================================================================
// ROOM TYPE / ROOM / ROOM RATE
// ============================================================================

export const roomTypeApi = {
  list: (propertyId: number | string) => request<ApiRoomType[]>(`/api/properties/${propertyId}/room-types`),
  get: (propertyId: number | string, roomTypeId: number | string) =>
    request<ApiRoomType>(`/api/properties/${propertyId}/room-types/${roomTypeId}`),
  create: (propertyId: number | string, data: RoomTypeInput) =>
    request<ApiRoomType>(`/api/properties/${propertyId}/room-types`, withBody("POST", data)),
  update: (propertyId: number | string, roomTypeId: number | string, data: RoomTypeInput) =>
    request<ApiRoomType>(`/api/properties/${propertyId}/room-types/${roomTypeId}`, withBody("PUT", data)),
  remove: (propertyId: number | string, roomTypeId: number | string) =>
    request<void>(`/api/properties/${propertyId}/room-types/${roomTypeId}`, { method: "DELETE" }),
};

export const roomApi = {
  configuration: (propertyId: number | string) =>
    request<RoomConfiguration>(`/api/properties/${propertyId}/rooms/configuration`),
  // Lưu TOÀN BỘ danh sách phòng của property trong một transaction (phòng không có trong danh sách sẽ bị xóa)
  configure: (propertyId: number | string, rooms: RoomItemInput[]) =>
    request<ConfigureRoomsResult>(`/api/properties/${propertyId}/rooms/configuration`, withBody("PUT", { rooms })),
  get: (propertyId: number | string, roomId: number | string) =>
    request<ApiRoom>(`/api/properties/${propertyId}/rooms/${roomId}`),
};

export const roomRateApi = {
  list: (propertyId: number | string) => request<ApiRoomRate[]>(`/api/properties/${propertyId}/room-rates`),
  get: (propertyId: number | string, roomRateId: number | string) =>
    request<ApiRoomRate>(`/api/properties/${propertyId}/room-rates/${roomRateId}`),
  create: (propertyId: number | string, data: RoomRateInput) =>
    request<ApiRoomRate>(`/api/properties/${propertyId}/room-rates`, withBody("POST", data)),
  update: (propertyId: number | string, roomRateId: number | string, data: RoomRateInput) =>
    request<ApiRoomRate>(`/api/properties/${propertyId}/room-rates/${roomRateId}`, withBody("PUT", data)),
  deactivate: (propertyId: number | string, roomRateId: number | string) =>
    request<ApiRoomRate>(`/api/properties/${propertyId}/room-rates/${roomRateId}/deactivate`, { method: "PATCH" }),
};

// ============================================================================
// F&B / SERVICE
// ============================================================================

export const fnbApi = {
  list: (propertyId: number | string) => request<ApiFnbMenu[]>(`/api/properties/${propertyId}/fnb-menu`),
  get: (propertyId: number | string, menuId: number | string) =>
    request<ApiFnbMenu>(`/api/properties/${propertyId}/fnb-menu/${menuId}`),
  create: (propertyId: number | string, data: FnbMenuInput) =>
    request<ApiFnbMenu>(`/api/properties/${propertyId}/fnb-menu`, withBody("POST", data)),
  update: (propertyId: number | string, menuId: number | string, data: Partial<FnbMenuInput>) =>
    request<ApiFnbMenu>(`/api/properties/${propertyId}/fnb-menu/${menuId}`, withBody("PATCH", data)),
  setStatus: (propertyId: number | string, menuId: number | string, status: ActiveStatus) =>
    request<ApiFnbMenu>(`/api/properties/${propertyId}/fnb-menu/${menuId}/status`, withBody("PATCH", { status })),
};

export const serviceApi = {
  catalog: async () => (await request<{ data: ApiServiceCatalogItem[] }>("/api/services/catalog"))?.data ?? [],
  list: (propertyId: number | string) => request<ApiPropertyService[]>(`/api/properties/${propertyId}/services`),
  get: (propertyId: number | string, propertyServiceId: number | string) =>
    request<ApiPropertyService>(`/api/properties/${propertyId}/services/${propertyServiceId}`),
  register: (propertyId: number | string, serviceId: number) =>
    request<{ propertyServiceId: number; message: string }>(
      `/api/properties/${propertyId}/services`,
      withBody("POST", { serviceId })
    ),
  setStatus: (propertyId: number | string, propertyServiceId: number | string, status: ActiveStatus) =>
    request<ApiPropertyService>(
      `/api/properties/${propertyId}/services/${propertyServiceId}/status`,
      withBody("PATCH", { status })
    ),
};

// ============================================================================
// POLICY / DOCUMENT
// ============================================================================

export const policyApi = {
  formulas: (policyType?: string) =>
    request<ApiPolicyFormula[]>(`/api/policy-formulas${policyType ? `?policyType=${encodeURIComponent(policyType)}` : ""}`),
  get: (propertyId: number | string) => request<ApiHotelPolicies>(`/api/properties/${propertyId}/hotel-policies`),
  configure: (propertyId: number | string, data: ConfigurePoliciesInput) =>
    request<{ propertyId: number; message: string }>(`/api/properties/${propertyId}/hotel-policies`, withBody("POST", data)),
};

export const policyDocumentApi = {
  list: (propertyId: number | string) => request<ApiPolicyDocuments>(`/api/properties/${propertyId}/policy-documents`),
  update: (propertyId: number | string, files: File[], deleteFileIds: number[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    deleteFileIds.forEach((id) => form.append("deleteFileIds", String(id)));
    return request<{ message: string; addedCount: number; deletedCount: number }>(
      `/api/properties/${propertyId}/policy-documents`,
      { method: "PUT", body: form }
    );
  },
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const userApi = {
  roles: () => request<ApiRole[]>("/api/roles"),
  list: (propertyId: number | string) => request<ApiUserSummary[]>(`/api/properties/${propertyId}/users`),
  get: (propertyId: number | string, userId: number | string) =>
    request<ApiUserDetail>(`/api/properties/${propertyId}/users/${userId}`),
  create: (propertyId: number | string, data: CreateUserInput) =>
    request<ApiUserWithRole>(`/api/properties/${propertyId}/users`, withBody("POST", data)),
  update: (propertyId: number | string, userId: number | string, data: UpdateUserInput) =>
    request<ApiUserWithRole>(`/api/properties/${propertyId}/users/${userId}`, withBody("PUT", data)),
  deactivate: (propertyId: number | string, userId: number | string) =>
    request<{ userId: number; status: string; message: string }>(`/api/properties/${propertyId}/users/${userId}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// CHATBOT THEO PROPERTY
// ============================================================================

export const askPropertyChatbot = async (propertyId: number | string, question: string): Promise<string> => {
  const answer = await request<unknown>(
    `/api/properties/${propertyId}/chat?question=${encodeURIComponent(question)}`,
    { headers: { Accept: "text/plain, application/json, */*" } },
    (raw) => raw
  );
  return typeof answer === "string" ? answer : JSON.stringify(answer);
};

// ============================================================================
// TIẾN ĐỘ THIẾT LẬP (tính từ dữ liệu thật — backend không có API setup-status)
// ============================================================================

export interface SetupStatus {
  completed: string[];
  total: number;
}

/** Suy ra các bước đã hoàn tất của Property từ các API cấu hình. Bước nào lỗi coi như chưa hoàn tất. */
export async function computeSetupStatus(propertyId: number | string): Promise<SetupStatus> {
  const [policies, roomTypes, config, rates, services, fnb, users] = await Promise.allSettled([
    policyApi.get(propertyId),
    roomTypeApi.list(propertyId),
    roomApi.configuration(propertyId),
    roomRateApi.list(propertyId),
    serviceApi.list(propertyId),
    fnbApi.list(propertyId),
    userApi.list(propertyId),
  ]);
  const ok = <T>(r: PromiseSettledResult<T>) => (r.status === "fulfilled" ? r.value : null);

  const completed = ["info"];
  const policyList = ok(policies)?.policies ?? [];
  if (policyList.some((p) => /CHECK/i.test(p.policyType))) completed.push("check_times");
  if (policyList.some((p) => !/CHECK/i.test(p.policyType))) completed.push("policies");
  if ((ok(roomTypes)?.length ?? 0) > 0) completed.push("room_types");
  if ((ok(config)?.rooms.length ?? 0) > 0) completed.push("rooms");
  if ((ok(rates)?.length ?? 0) > 0) completed.push("rates");
  if ((ok(services)?.length ?? 0) > 0) completed.push("services");
  if ((ok(fnb)?.length ?? 0) > 0) completed.push("fnb");
  if ((ok(users)?.length ?? 0) > 0) completed.push("staff");
  return { completed, total: 10 };
}

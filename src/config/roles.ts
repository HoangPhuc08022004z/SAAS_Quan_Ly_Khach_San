/** Ba nhóm tài khoản độc lập, mỗi nhóm có cổng và cách đăng nhập riêng */
export const ACCOUNT_KINDS = {
  ADMIN: { label: "SaaS Admin", portal: "/admin", login: "/login" },
  OWNER: { label: "Chủ khách sạn (Owner)", portal: "/owner", login: "/login" },
  STAFF: { label: "Nhân viên PMS", portal: "/pms", login: "/pms/login" },
} as const;

const strip = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();

/** Vai trò OWNER dành cho chủ khách sạn: backend chặn đăng nhập PMS bằng vai trò này nên không gán cho nhân viên */
export const isOwnerRole = (name?: string | null) => /^(role_)?owner$/.test(strip(name ?? ""));

export type PmsRoleKey = "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPER";
const ROLE_PATTERNS: Record<PmsRoleKey, RegExp> = {
  MANAGER: /manager|quan ly/,
  RECEPTIONIST: /receptionist|le tan/,
  HOUSEKEEPER: /housekeep|buong phong/,
};

/** Role hiện tại (mã hoặc tên backend trả về) có thuộc một trong các role yêu cầu không */
export const matchesPmsRole = (role: { code?: string | null; name?: string | null } | null | undefined, wanted: PmsRoleKey[]) =>
  wanted.some((k) => ROLE_PATTERNS[k].test(strip(role?.code ?? "")) || ROLE_PATTERNS[k].test(strip(role?.name ?? "")));

/** Quyền backend trả về có thể mang tiền tố PERM_ */
export const normalizePermission = (code: string) => code.replace(/^PERM_/, "");

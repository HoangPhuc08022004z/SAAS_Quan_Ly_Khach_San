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

/** Quyền backend trả về có thể mang tiền tố PERM_ */
export const normalizePermission = (code: string) => code.replace(/^PERM_/, "");

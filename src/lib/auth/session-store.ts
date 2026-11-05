import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Account, Tenant, Subscription, User, Role, Property } from "../api/types";

interface SessionState {
  account: Account | null;
  tenant: Tenant | null;
  subscription: Subscription | null;
  user: User | null;
  role: Role | null;
  permissions: string[];
  property: Property | null;
  currentPropertyId: string;

  setAccountSession: (data: { account: Account; tenant?: Tenant; subscription?: Subscription }) => void;
  setPmsSession: (data: { user: User; role: Role; permissions: string[]; property: Property }) => void;
  setCurrentPropertyId: (propertyId: string) => void;
  logoutAccount: () => void;
  logoutPms: () => void;
  logoutAll: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Không còn dữ liệu mẫu mặc định: mọi thông tin phiên chỉ có sau khi đăng nhập bằng API thật
      account: null,
      tenant: null,
      subscription: null,
      user: null,
      role: null,
      permissions: [],
      property: null,
      currentPropertyId: "",

      // Mỗi lần đăng nhập thay thế hoàn toàn phiên cũ: token chỉ có một, nên không giữ lại danh tính của loại tài khoản kia
      setAccountSession: ({ account, tenant, subscription }) =>
        set((state) => ({
          account,
          tenant: tenant || (state.account?.email === account.email ? state.tenant : null),
          subscription: subscription || (state.account?.email === account.email ? state.subscription : null),
          user: null,
          role: null,
          permissions: [],
          property: null,
          currentPropertyId: "",
        })),

      setPmsSession: ({ user, role, permissions, property }) =>
        set({
          account: null,
          tenant: null,
          subscription: null,
          user,
          role,
          permissions,
          property,
          currentPropertyId: property.id,
        }),

      setCurrentPropertyId: (currentPropertyId) => set({ currentPropertyId }),

      logoutAccount: () => set({ account: null, tenant: null, subscription: null }),
      logoutPms: () => set({ user: null, role: null, permissions: [], property: null }),
      logoutAll: () =>
        set({
          account: null,
          tenant: null,
          subscription: null,
          user: null,
          role: null,
          permissions: [],
          property: null,
        }),
    }),
    {
      name: "hotel_saas_auth_session",
      version: 2,
      // Phiên cũ (v1) chứa dữ liệu mẫu → bỏ để tránh hiển thị tên/khách sạn giả
      migrate: () => ({
        account: null,
        tenant: null,
        subscription: null,
        user: null,
        role: null,
        permissions: [],
        property: null,
        currentPropertyId: "",
      }),
    }
  )
);

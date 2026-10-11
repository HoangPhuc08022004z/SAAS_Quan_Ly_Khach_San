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
      account: {
        id: "acc_owner_abc",
        email: "owner.abc@gmail.com",
        full_name: "Nguyễn Văn ABC",
        is_admin: false,
        created_at: "2026-02-15T09:00:00+07:00",
        updated_at: "2026-02-15T09:00:00+07:00",
      },
      tenant: {
        id: "tenant_abc",
        name: "Tập đoàn Khách sạn ABC Hospitality",
        description: "Chuỗi khách sạn và resort sang trọng tại Hà Nội và Đà Nẵng",
        status: "ACTIVE",
        max_properties: 3,
        max_rooms: 50,
        max_users: 10,
        max_storage: 5368709120,
        created_at: "2026-02-15T09:30:00+07:00",
        updated_at: "2026-02-15T09:30:00+07:00",
      },
      subscription: {
        id: "sub_abc",
        account_id: "acc_owner_abc",
        plan_id: "plan_standard",
        tenant_id: "tenant_abc",
        status: "ACTIVE",
        start_date: "2026-09-20T00:00:00+07:00",
        end_date: "2026-12-20T23:59:59+07:00",
        price: 1890000,
        created_at: "2026-09-20T09:00:00+07:00",
        updated_at: "2026-09-20T09:15:00+07:00",
      },
      user: {
        id: "user_rec_hn",
        tenant_id: "tenant_abc",
        property_id: "prop_abc_hn",
        role_id: "role_rec",
        email: "letan1.hn@abc.vn",
        full_name: "Hoàng Thảo My (Lễ Tân)",
        phone: "0902345678",
        status: "ACTIVE",
      },
      role: {
        id: "role_rec",
        name: "Lễ tân (Receptionist)",
        code: "RECEPTIONIST",
        description: "Nhận/trả phòng, tạo đặt phòng, lập phiếu thu, đặt món",
      },
      permissions: [
        "RESERVATION_VIEW",
        "RESERVATION_CREATE",
        "RESERVATION_UPDATE",
        "RESERVATION_CANCEL",
        "CHECKIN_PERFORM",
        "CHECKOUT_PERFORM",
        "ROOM_VIEW",
        "HK_VIEW",
        "FOLIO_VIEW",
        "FOLIO_ADD_CHARGE",
        "FNB_VIEW",
        "FNB_ORDER",
        "SERVICE_VIEW",
        "SERVICE_REQUEST",
        "REFUND_VIEW",
        "REFUND_REQUEST",
        "CHAT_STAFF",
      ],
      property: {
        id: "prop_abc_hn",
        tenant_id: "tenant_abc",
        name: "Khách sạn ABC Grand Hà Nội",
        address: "123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
        phone: "02438889999",
        email: "grand.hn@abc.vn",
        description: "Khách sạn boutique chuẩn 4 sao ngay trung tâm phố cổ Hà Nội",
        image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
        status: "ACTIVE",
        created_at: "2026-02-16T10:00:00+07:00",
        updated_at: "2026-02-16T10:00:00+07:00",
      },
      currentPropertyId: "prop_abc_hn",

      setAccountSession: ({ account, tenant, subscription }) =>
        set((state) => ({
          account,
          tenant: tenant || state.tenant,
          subscription: subscription || state.subscription,
        })),

      setPmsSession: ({ user, role, permissions, property }) =>
        set({
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
    }
  )
);

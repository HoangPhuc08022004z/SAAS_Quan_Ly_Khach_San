export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  permission?: string;
}

export const ADMIN_NAV: NavItem[] = [
  { title: "Bảng điều khiển", href: "/admin", icon: "LayoutDashboard" },
  { title: "Gói dịch vụ", href: "/admin/plans", icon: "Layers" },
  { title: "Duyệt đăng ký", href: "/admin/subscriptions", icon: "CheckSquare" },
  { title: "Khách hàng (Tenant)", href: "/admin/tenants", icon: "Building2" },
  { title: "Giao dịch thanh toán", href: "/admin/payments", icon: "CreditCard" },
  { title: "Hộp thư hỗ trợ", href: "/admin/support", icon: "Headphones" },
  { title: "Knowledge Base", href: "/admin/knowledge-base", icon: "FileText" },
  { title: "Nhật ký tác vụ", href: "/admin/jobs", icon: "Clock" },
  { title: "Hồ sơ cá nhân", href: "/admin/profile", icon: "UserCircle" },
];

export const OWNER_NAV: NavItem[] = [
  { title: "Tổng quan", href: "/owner", icon: "LayoutDashboard" },
  { title: "Gói thuê bao", href: "/owner/subscription", icon: "Sparkles" },
  { title: "Tổ chức (Tenant)", href: "/owner/tenant", icon: "Shield" },
  { title: "Khách sạn & Cấu hình", href: "/owner/properties", icon: "Hotel" },
  { title: "Báo cáo chuỗi", href: "/owner/reports", icon: "BarChart3" },
  { title: "Trợ giúp & Hỗ trợ", href: "/owner/support", icon: "LifeBuoy" },
  { title: "Hồ sơ cá nhân", href: "/owner/profile", icon: "UserCircle" },
];

export const PMS_NAV: NavItem[] = [
  { title: "Bảng điều khiển", href: "/pms", icon: "LayoutDashboard" },
  { title: "Sơ đồ & Lịch phòng", href: "/pms/rooms", icon: "CalendarDays", permission: "ROOM_VIEW" },
  { title: "Tìm phòng trống", href: "/pms/availability", icon: "Search", permission: "RESERVATION_CREATE" },
  { title: "Danh sách đặt phòng", href: "/pms/reservations", icon: "BookmarkCheck", permission: "RESERVATION_VIEW" },
  { title: "Lễ tân Check-in", href: "/pms/checkin", icon: "UserCheck", permission: "CHECKIN_EXECUTE" },
  { title: "Thu ngân Check-out", href: "/pms/checkout", icon: "LogOut", permission: "CHECKOUT_VIEW" },
  { title: "Quản lý buồng phòng", href: "/pms/housekeeping", icon: "Sparkles", permission: "HOUSEKEEPING_VIEW" },
  { title: "Dịch vụ F&B", href: "/pms/fnb/menu", icon: "Utensils", permission: "MENU_VIEW" },
  { title: "Dịch vụ khách sạn", href: "/pms/services", icon: "ConciergeBell", permission: "GUEST_SERVICE_CREATE" },
  { title: "Hủy & Hoàn tiền", href: "/pms/cancellations", icon: "RotateCcw", permission: "RESERVATION_CANCEL" },
  { title: "Xử lý No-Show", href: "/pms/no-show", icon: "UserX", permission: "NO_SHOW_VIEW" },
  { title: "Chốt ngày (Night Audit)", href: "/pms/night-audit", icon: "Moon", permission: "NIGHT_AUDIT_VIEW" },
  { title: "Báo cáo vận hành", href: "/pms/reports", icon: "TrendingUp", permission: "PROPERTY_REPORT_CONFIRM" },
  { title: "Trợ lý Chatbot AI", href: "/pms/chat", icon: "Bot", permission: "CHATBOT_HOTEL_INFO" },
  { title: "Hồ sơ cá nhân", href: "/pms/profile", icon: "UserCircle" },
];

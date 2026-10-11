export interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  className?: string;
}

export const STATUS_MAP: Record<string, Record<string, StatusConfig>> = {
  subscription: {
    PENDING: { label: "Chờ duyệt", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    ACTIVE: { label: "Đang hoạt động", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    EXPIRED: { label: "Hết hạn", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
    CANCELLED: { label: "Đã hủy", variant: "secondary", className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300" },
  },
  tenant: {
    PENDING: { label: "Chờ kích hoạt", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    ACTIVE: { label: "Hoạt động", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    SUSPENDED: { label: "Bị khóa", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
  },
  payment: {
    PENDING: { label: "Chờ thanh toán", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    PROCESSING: { label: "Đang xử lý", variant: "info", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300" },
    SUCCESS: { label: "Thành công", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    FAILED: { label: "Thất bại", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
  },
  refund: {
    PENDING: { label: "Chờ duyệt hoàn tiền", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    PROCESSING: { label: "Đang hoàn tiền", variant: "info", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300" },
    SUCCESS: { label: "Đã hoàn tiền", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    FAILED: { label: "Hoàn tiền thất bại", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
  },
  room: {
    READY: { label: "Sẵn sàng", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    OCCUPIED: { label: "Có khách", variant: "info", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300" },
    VACANT_DIRTY: { label: "Trống bẩn", variant: "warning", className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300" },
    CLEANING: { label: "Đang dọn", variant: "info", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    MAINTENANCE: { label: "Bảo trì", variant: "destructive", className: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-400" },
  },
  reservation: {
    PENDING: { label: "Chờ giữ phòng", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    CONFIRMED: { label: "Đã xác nhận", variant: "info", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300" },
    CHECKED_IN: { label: "Đang ở", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    CHECKED_OUT: { label: "Đã trả phòng", variant: "secondary", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300" },
    CANCELLED: { label: "Đã hủy", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
    NO_SHOW: { label: "Vắng mặt (No-Show)", variant: "destructive", className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300" },
  },
  ticket: {
    OPEN: { label: "Mới mở", variant: "info", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300" },
    IN_PROGRESS: { label: "Đang xử lý", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    RESOLVED: { label: "Đã giải quyết", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    CLOSED: { label: "Đã đóng", variant: "secondary", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300" },
  },
  daily_statistics: {
    PENDING: { label: "Chờ xác nhận", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    CONFIRMED: { label: "Đã chốt", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    ADJUSTED: { label: "Đã điều chỉnh", variant: "info", className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300" },
  },
  index_status: {
    PENDING: { label: "Đang lập chỉ mục", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    INDEXED: { label: "Đã chỉ mục", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    FAILED: { label: "Lỗi chỉ mục", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
  },
  fnb_request: {
    PENDING: { label: "Chờ duyệt mua", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    APPROVED: { label: "Đã duyệt", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
    REJECTED: { label: "Từ chối", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
  },
  hk_issue: {
    OPEN: { label: "Chưa xử lý", variant: "destructive", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300" },
    IN_PROGRESS: { label: "Đang sửa/thay", variant: "warning", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300" },
    RESOLVED: { label: "Đã hoàn thành", variant: "success", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
  },
};

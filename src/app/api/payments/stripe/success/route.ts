import { NextRequest, NextResponse } from "next/server";

// Stripe quay về đây (stripe.success-url của backend trỏ vào domain FE). Trang /payments/return quyết định
// đưa người dùng về kết quả đặt cọc (khách) hay kết quả thuê bao (Owner).
// Route cụ thể này được ưu tiên hơn proxy catch-all /api/[...path].
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/payments/return?result=success", req.url));
}

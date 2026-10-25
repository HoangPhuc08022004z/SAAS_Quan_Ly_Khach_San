import { NextRequest, NextResponse } from "next/server";

// Stripe quay về đây (stripe.success-url của backend trỏ vào domain FE) → chuyển sang trang kết quả của Owner.
// Route cụ thể này được ưu tiên hơn proxy catch-all /api/[...path].
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/owner/subscription/result", req.url));
}

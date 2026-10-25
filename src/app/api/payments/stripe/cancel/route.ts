import { NextRequest, NextResponse } from "next/server";

// Owner hủy thanh toán trên Stripe → quay lại trang thuê bao để có thể bấm thanh toán lại.
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/owner/subscription", req.url));
}

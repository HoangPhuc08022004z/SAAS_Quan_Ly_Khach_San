import { NextRequest, NextResponse } from "next/server";

// Người dùng hủy thanh toán trên Stripe → /payments/return đưa về đúng nơi để thanh toán lại.
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/payments/return?result=cancel", req.url));
}

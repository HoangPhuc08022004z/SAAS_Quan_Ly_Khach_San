"use client";

import React, { useEffect, useState } from "react";

/** Đồng hồ đếm ngược thời gian giữ phòng (backend giữ 15 phút kể từ lúc tạo đặt phòng) */
export function PaymentCountdown({ expiresAt }: { expiresAt?: string | null }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (left === null) return null;
  if (left === 0) return <span className="ml-2 font-bold text-rose-600">Đã hết hạn giữ phòng</span>;
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className={`ml-2 font-bold tabular-nums ${left < 120000 ? "text-rose-600" : "text-amber-600"}`}>
      còn {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

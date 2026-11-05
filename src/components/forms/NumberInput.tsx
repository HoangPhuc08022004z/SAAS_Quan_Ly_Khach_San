"use client";

import React, { useEffect, useRef, useState } from "react";

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  /** Giá trị gửi lên state khi ô bị xóa trống (ô vẫn hiển thị trống để người dùng gõ số khác). Mặc định 0. */
  emptyValue?: number;
}

/**
 * Ô nhập số cho phép xóa hết rồi gõ lại.
 * `<input type="number" value={n}>` ép số 0 hiện lại ngay khi xóa trống → ở đây giữ chuỗi người dùng gõ ở state riêng.
 */
export function NumberInput({ value, onValueChange, emptyValue = 0, ...rest }: NumberInputProps) {
  const [text, setText] = useState(String(value));
  const lastEmitted = useRef(value);

  // Đồng bộ khi giá trị đổi từ bên ngoài (đặt lại form, nút +/-...)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(String(value));
    }
  }, [value]);

  return (
    <input
      {...rest}
      type="number"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const next = raw === "" || Number.isNaN(Number(raw)) ? emptyValue : Number(raw);
        lastEmitted.current = next;
        onValueChange(next);
      }}
    />
  );
}

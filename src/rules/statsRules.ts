export function canConfirmDailyStats(status: string): boolean {
  return status === "PENDING" || status === "ADJUSTED";
}

export function canAdjustDailyStats(status: string): boolean {
  // Can adjust at any time, but if CONFIRMED, requires explicit reason
  return true;
}

export function validateAdjustment(
  reason: string,
  oldValue: number,
  newValue: number
): { valid: boolean; error?: string } {
  if (!reason || reason.trim().length < 5) {
    return { valid: false, error: "Lý do điều chỉnh là bắt buộc và phải có ít nhất 5 ký tự." };
  }
  if (newValue < 0) {
    return { valid: false, error: "Giá trị mới không được âm." };
  }
  if (oldValue === newValue) {
    return { valid: false, error: "Giá trị mới phải khác giá trị cũ." };
  }
  return { valid: true };
}

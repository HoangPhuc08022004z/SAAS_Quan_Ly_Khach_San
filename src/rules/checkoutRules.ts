export function calculateBalance(totalCharges: number, totalPaid: number): number {
  return totalCharges - totalPaid;
}

export function canCheckOut(
  reservationStatus: string,
  balance: number
): { canCheckOut: boolean; reason?: string } {
  if (reservationStatus !== "CHECKED_IN") {
    return {
      canCheckOut: false,
      reason: `Đặt phòng đang ở trạng thái "${reservationStatus}", chỉ có thể trả phòng khi đang "CHECKED_IN".`,
    };
  }

  if (balance > 0) {
    return {
      canCheckOut: false,
      reason: `Khách còn nợ ${balance.toLocaleString("vi-VN")} ₫. Cần thanh toán hết công nợ trước khi trả phòng.`,
    };
  }

  if (balance < 0) {
    return {
      canCheckOut: false,
      reason: `Khách trả thừa ${Math.abs(balance).toLocaleString("vi-VN")} ₫. Cần tạo yêu cầu hoàn tiền phần dư trước khi trả phòng.`,
    };
  }

  return { canCheckOut: true };
}

export function needsRefundOnCheckout(balance: number): boolean {
  return balance < 0;
}

export function needsPaymentOnCheckout(balance: number): boolean {
  return balance > 0;
}

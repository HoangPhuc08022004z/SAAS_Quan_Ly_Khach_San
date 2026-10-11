import { parseISO, differenceInDays } from "date-fns";

export interface CancellationQuote {
  daysBeforeCheckIn: number;
  depositAmount: number;
  refundAmount: number;
  penaltyAmount: number;
  policyDescription: string;
}

export function canCancelReservation(status: string): boolean {
  return status === "CONFIRMED" || status === "PENDING";
}

export function calculateCancellationQuote(
  checkInDate: string,
  cancelDate: string,
  depositAmount: number
): CancellationQuote {
  const checkIn = parseISO(checkInDate);
  const cancel = parseISO(cancelDate);
  const daysDiff = differenceInDays(checkIn, cancel);

  let refundPercent = 0;
  let policyDesc = "";

  if (daysDiff >= 7) {
    refundPercent = 100;
    policyDesc = "Hủy trước 7 ngày: Hoàn 100% tiền cọc (không phạt)";
  } else if (daysDiff >= 3) {
    refundPercent = 50;
    policyDesc = "Hủy từ 3-6 ngày: Hoàn 50% tiền cọc (phạt 50%)";
  } else {
    refundPercent = 0;
    policyDesc = "Hủy dưới 3 ngày: Không hoàn cọc (phạt 100% tiền cọc)";
  }

  const refundAmount = Math.round((depositAmount * refundPercent) / 100);
  const penaltyAmount = depositAmount - refundAmount;

  return {
    daysBeforeCheckIn: Math.max(0, daysDiff),
    depositAmount,
    refundAmount,
    penaltyAmount,
    policyDescription: policyDesc,
  };
}

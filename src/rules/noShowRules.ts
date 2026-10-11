import { parseISO, isAfter } from "date-fns";

export function isNoShowCandidate(
  checkInDate: string,
  checkInTime: string = "14:00",
  nowIso: string,
  status: string
): boolean {
  if (status !== "CONFIRMED") return false;
  const deadline = parseISO(`${checkInDate}T${checkInTime}:00+07:00`);
  const current = parseISO(nowIso);
  return isAfter(current, deadline);
}

export function canConfirmNoShow(status: string): boolean {
  return status === "CONFIRMED";
}

export function calculateNoShowDepositSettlement(
  depositAmount: number,
  firstNightRate: number
): { keepAmount: number; refundAmount: number } {
  const keepAmount = Math.min(depositAmount, firstNightRate);
  const refundAmount = Math.max(0, depositAmount - keepAmount);
  return { keepAmount, refundAmount };
}

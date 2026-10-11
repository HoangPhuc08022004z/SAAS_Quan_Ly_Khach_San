import { parseISO, isBefore, isAfter, isEqual } from "date-fns";

export function isDateRangeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = parseISO(startA);
  const eA = parseISO(endA);
  const sB = parseISO(startB);
  const eB = parseISO(endB);

  // Interval [sA, eA) overlaps with [sB, eB) if:
  // sA < eB and eA > sB
  return isBefore(sA, eB) && isAfter(eA, sB);
}

export function isRoomAvailableForDates(
  roomId: string,
  checkIn: string,
  checkOut: string,
  existingReservations: Array<{
    roomId: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>
): boolean {
  const activeReservations = existingReservations.filter(
    (r) =>
      r.roomId === roomId &&
      r.status !== "CANCELLED" &&
      r.status !== "CHECKED_OUT" &&
      r.status !== "NO_SHOW"
  );

  for (const res of activeReservations) {
    if (isDateRangeOverlap(checkIn, checkOut, res.checkIn, res.checkOut)) {
      return false;
    }
  }

  return true;
}

export function calculateDepositRequired(totalAmount: number, depositPercent = 50): number {
  if (totalAmount <= 0) return 0;
  return Math.round((totalAmount * depositPercent) / 100);
}

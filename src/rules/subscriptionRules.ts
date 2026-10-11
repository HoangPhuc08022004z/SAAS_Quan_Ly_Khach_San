import { parseISO, isAfter, isBefore, addDays, addMonths, addYears, format } from "date-fns";

export interface SubscriptionRuleInput {
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  end_date: string;
}

export function canActivateSubscription(status: string, paymentStatus: string): boolean {
  return (status === "PENDING" || status === "EXPIRED") && paymentStatus === "SUCCESS";
}

export function canRenewSubscription(status: string): boolean {
  return status === "ACTIVE" || status === "EXPIRED";
}

export function canPaySubscription(status: string): boolean {
  return status === "PENDING";
}

export function isSubscriptionExpired(endDate: string, referenceDate: string): boolean {
  const end = parseISO(endDate);
  const ref = parseISO(referenceDate);
  return isBefore(end, ref);
}

export function calculateNewEndDate(
  currentEndDate: string,
  duration: number,
  unit: "DAY" | "MONTH" | "YEAR",
  referenceDate: string
): string {
  const currentEnd = parseISO(currentEndDate);
  const ref = parseISO(referenceDate);
  // If already expired, extend from reference date. If still active, extend from current end date.
  const baseDate = isAfter(currentEnd, ref) ? currentEnd : ref;

  let newDate = baseDate;
  if (unit === "DAY") newDate = addDays(baseDate, duration);
  else if (unit === "MONTH") newDate = addMonths(baseDate, duration);
  else if (unit === "YEAR") newDate = addYears(baseDate, duration);

  return format(newDate, "yyyy-MM-dd");
}

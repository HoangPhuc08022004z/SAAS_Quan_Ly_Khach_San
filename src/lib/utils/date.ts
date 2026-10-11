import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";

export function formatDate(date: string | Date | null | undefined, formatStr = "dd/MM/yyyy"): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "-";
    return format(d, formatStr, { locale: vi });
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function formatTime(date: string | Date | null | undefined): string {
  return formatDate(date, "HH:mm");
}

export function getTodayIso(): string {
  return "2026-10-11";
}

export function getNowIso(): string {
  return "2026-10-11T12:00:00+07:00";
}

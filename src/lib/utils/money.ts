export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "0 ₫";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

export function parseMoney(input: string): number {
  const clean = input.replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
}

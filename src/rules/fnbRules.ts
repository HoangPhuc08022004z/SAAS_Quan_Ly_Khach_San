export function calculateSellingPrice(purchasePrice: number, profitPercent: number): number {
  if (purchasePrice <= 0) return 0;
  return Math.round(purchasePrice * (1 + profitPercent / 100));
}

export function canOrderFnb(
  maxQuantity: number,
  actualQuantityOrdered: number,
  requestedQuantity: number
): boolean {
  if (requestedQuantity <= 0) return false;
  return actualQuantityOrdered + requestedQuantity <= maxQuantity;
}

export function requiresFnbApproval(
  quantity: number,
  totalAmount: number,
  thresholdAmount = 500000,
  thresholdQuantity = 5
): boolean {
  return quantity >= thresholdQuantity || totalAmount >= thresholdAmount;
}

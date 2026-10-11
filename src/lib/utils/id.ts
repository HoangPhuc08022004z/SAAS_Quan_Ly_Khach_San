export function generateId(prefix = "id"): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timePart = Date.now().toString().slice(-4);
  return `${prefix}_${randomPart}${timePart}`;
}

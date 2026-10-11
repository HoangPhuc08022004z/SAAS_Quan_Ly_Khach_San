export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function bytesToMB(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

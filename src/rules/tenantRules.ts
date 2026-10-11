export function canCreateProperty(currentCount: number, maxProperties: number): boolean {
  return currentCount < maxProperties;
}

export function canCreateRoom(currentCount: number, maxRooms: number): boolean {
  return currentCount < maxRooms;
}

export function canCreateUser(currentCount: number, maxUsers: number): boolean {
  return currentCount < maxUsers;
}

export function canUploadStorage(currentBytes: number, addedBytes: number, maxStorage: number): boolean {
  return currentBytes + addedBytes <= maxStorage;
}

export function isTenantOperational(tenantStatus: string, subscriptionStatus: string): boolean {
  return tenantStatus === "ACTIVE" && subscriptionStatus === "ACTIVE";
}

"use client";

import { useSessionStore } from "./session-store";

export function useSession() {
  const store = useSessionStore();
  const isAdmin = !!store.account?.is_admin;
  const isOwner = !!store.account && !store.account.is_admin;
  const isPmsStaff = !!store.user;

  const isTenantSuspended = store.tenant?.status === "SUSPENDED";
  const isSubscriptionExpired = store.subscription?.status === "EXPIRED";

  return {
    account: store.account,
    tenant: store.tenant,
    subscription: store.subscription,
    user: store.user,
    role: store.role,
    permissions: store.permissions,
    property: store.property,
    currentPropertyId: store.currentPropertyId,
    isAdmin,
    isOwner,
    isPmsStaff,
    isTenantSuspended,
    isSubscriptionExpired,
    setAccountSession: store.setAccountSession,
    setPmsSession: store.setPmsSession,
    setCurrentPropertyId: store.setCurrentPropertyId,
    logoutAccount: store.logoutAccount,
    logoutPms: store.logoutPms,
    logoutAll: store.logoutAll,
  };
}

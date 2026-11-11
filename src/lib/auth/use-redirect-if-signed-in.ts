"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "./session-store";

/** Trang đăng nhập: nếu đã đăng nhập đúng loại tài khoản thì chuyển thẳng vào cổng của mình */
export function useRedirectIfSignedIn(kind: "platform" | "staff") {
  const router = useRouter();
  const account = useSessionStore((s) => s.account);
  const user = useSessionStore((s) => s.user);

  useEffect(() => {
    const check = () => {
      const st = useSessionStore.getState();
      if (kind === "staff" && st.user) router.replace("/pms");
      if (kind === "platform" && st.account) router.replace(st.account.is_admin ? "/admin" : "/owner");
    };
    const persist = useSessionStore.persist;
    if (!persist) return;
    if (persist.hasHydrated()) check();
    return persist.onFinishHydration(check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, user, kind]);
}

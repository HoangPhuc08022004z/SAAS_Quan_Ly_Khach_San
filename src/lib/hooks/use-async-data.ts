"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Gọi API phía client (cần JWT trong localStorage nên không thể gọi ở Server Component).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const fetcherRef = useRef(fetcher);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fetcherRef
      .current()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err: any) => {
        if (alive) setError(err?.message || "Không thể tải dữ liệu.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);

  return { data, setData, error, loading, reload };
}

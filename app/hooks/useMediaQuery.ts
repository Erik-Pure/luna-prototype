"use client";

import { useSyncExternalStore } from "react";

export const WIDE_LAYOUT_QUERY = "(min-width: 1280px)";
export const EXTRA_WIDE_LAYOUT_QUERY = "(min-width: 1700px)";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

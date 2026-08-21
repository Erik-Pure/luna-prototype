"use client";

import { useEffect, useRef, useState } from "react";

export function useColumnHeaderMenu() {
  const [openHeaderMenuKey, setOpenHeaderMenuKey] = useState<string | null>(null);
  const [infoColumnKey, setInfoColumnKey] = useState<string | null>(null);
  const headerMenuWrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!openHeaderMenuKey) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerMenuWrapperRef.current && !headerMenuWrapperRef.current.contains(e.target as Node)) {
        setOpenHeaderMenuKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openHeaderMenuKey]);

  return {
    openHeaderMenuKey,
    setOpenHeaderMenuKey,
    infoColumnKey,
    setInfoColumnKey,
    headerMenuWrapperRef
  };
}

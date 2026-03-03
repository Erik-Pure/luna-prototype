"use client";

import { useState } from "react";

export function useRowSelection() {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const toggleRowSelection = (rowIndex: number) => {
    setSelectedRowIndex((previous) => (previous === rowIndex ? null : rowIndex));
  };

  const clearSelection = () => {
    setSelectedRowIndex(null);
  };

  return {
    selectedRowIndex,
    hasSelectedRow: selectedRowIndex !== null,
    toggleRowSelection,
    clearSelection
  };
}

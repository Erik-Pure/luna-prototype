"use client";

import { useMemo, useState } from "react";

export type ManagedColumn<TColumnKey extends string> = {
  key: TColumnKey;
  label: string;
  visible: boolean;
  pinned?: boolean;
};

export function useColumnManager<TColumnKey extends string>(
  initialColumns: Array<ManagedColumn<TColumnKey>>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedColumns, setAppliedColumns] = useState<Array<ManagedColumn<TColumnKey>>>(initialColumns);
  const [draftColumns, setDraftColumns] = useState<Array<ManagedColumn<TColumnKey>>>(initialColumns);

  const visibleColumns = useMemo(
    () => appliedColumns.filter((column) => column.visible),
    [appliedColumns]
  );

  const orderedVisibleColumns = useMemo(() => {
    const pinned = appliedColumns.filter((column) => column.visible && column.pinned);
    const regular = appliedColumns.filter((column) => column.visible && !column.pinned);
    return [...pinned, ...regular];
  }, [appliedColumns]);

  const open = () => {
    setDraftColumns(appliedColumns);
    setIsOpen(true);
  };

  const cancel = () => {
    setDraftColumns(appliedColumns);
    setIsOpen(false);
  };

  const save = () => {
    setAppliedColumns(draftColumns);
    setIsOpen(false);
  };

  const reset = () => {
    setDraftColumns(initialColumns);
  };

  const toggleVisibility = (key: TColumnKey) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const togglePin = (key: TColumnKey) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, pinned: !column.pinned } : column
      )
    );
  };

  const move = (key: TColumnKey, direction: "up" | "down") => {
    setDraftColumns((previous) => {
      const index = previous.findIndex((column) => column.key === key);
      if (index < 0) {
        return previous;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  return {
    isOpen,
    setIsOpen,
    appliedColumns,
    draftColumns,
    visibleColumns,
    orderedVisibleColumns,
    open,
    cancel,
    save,
    reset,
    toggleVisibility,
    togglePin,
    move
  };
}

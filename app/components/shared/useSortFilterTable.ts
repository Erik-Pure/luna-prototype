"use client";

import { useMemo, useState } from "react";

export type FilterOperator = "contains" | "notContains" | "equals" | "isEmpty" | "isNotEmpty";

export type ColumnFilter = {
  operator: FilterOperator;
  value: string;
};

export type ColumnSortState = { key: string; direction: "asc" | "desc" } | null;

export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: "Innehåller",
  notContains: "Innehåller inte",
  equals: "Är lika med",
  isEmpty: "Är tom",
  isNotEmpty: "Är inte tom"
};

export const FILTER_OPERATORS_WITHOUT_VALUE: FilterOperator[] = ["isEmpty", "isNotEmpty"];

export function isColumnFilterActive(filter: ColumnFilter | undefined): boolean {
  if (!filter) return false;
  if (FILTER_OPERATORS_WITHOUT_VALUE.includes(filter.operator)) return true;
  return filter.value.trim().length > 0;
}

export function matchesColumnFilter(cellValue: string, filter: ColumnFilter): boolean {
  const normalizedCell = cellValue.trim().toLowerCase();
  const isEmptyCell = normalizedCell.length === 0 || normalizedCell === "-";
  const normalizedFilterValue = filter.value.trim().toLowerCase();

  switch (filter.operator) {
    case "contains":
      return normalizedCell.includes(normalizedFilterValue);
    case "notContains":
      return !normalizedCell.includes(normalizedFilterValue);
    case "equals":
      return normalizedCell === normalizedFilterValue;
    case "isEmpty":
      return isEmptyCell;
    case "isNotEmpty":
      return !isEmptyCell;
    default:
      return true;
  }
}

export function useSortFilterTable<TRow>(
  rows: TRow[],
  getCellValue: (row: TRow, columnKey: string) => string
) {
  const [columnSort, setColumnSort] = useState<ColumnSortState>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilter>>({});

  const toggleColumnSort = (key: string, direction: "asc" | "desc") => {
    setColumnSort((prev) => (prev?.key === key && prev.direction === direction ? null : { key, direction }));
  };

  const setColumnFilterOperator = (key: string, operator: FilterOperator) => {
    setColumnFilters((prev) => ({ ...prev, [key]: { operator, value: prev[key]?.value ?? "" } }));
  };

  const setColumnFilterValue = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: { operator: prev[key]?.operator ?? "contains", value } }));
  };

  const displayRowEntries = useMemo(() => {
    let entries = rows.map((row, originalIndex) => ({ row, originalIndex }));

    const activeFilters = Object.entries(columnFilters).filter(([, filter]) => isColumnFilterActive(filter));
    if (activeFilters.length > 0) {
      entries = entries.filter(({ row }) =>
        activeFilters.every(([key, filter]) => matchesColumnFilter(getCellValue(row, key), filter))
      );
    }

    if (columnSort) {
      const { key, direction } = columnSort;
      entries = [...entries].sort((a, b) => {
        const comparison = getCellValue(a.row, key).localeCompare(getCellValue(b.row, key), "sv", {
          numeric: true,
          sensitivity: "base"
        });
        return direction === "asc" ? comparison : -comparison;
      });
    }

    return entries;
  }, [rows, columnFilters, columnSort, getCellValue]);

  const getDisplayRowIndex = (originalIndex: number | null) =>
    originalIndex === null ? null : displayRowEntries.findIndex((entry) => entry.originalIndex === originalIndex);

  return {
    columnSort,
    columnFilters,
    toggleColumnSort,
    setColumnFilterOperator,
    setColumnFilterValue,
    displayRowEntries,
    getDisplayRowIndex
  };
}

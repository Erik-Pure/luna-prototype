"use client";

import { Typography } from "@mui/material";
import type { ReactNode } from "react";
import styles from "../../page.module.scss";

type DataTableColumn = {
  key: string;
  label: string;
};

type DataTableVariant = "main" | "line";

type DataTableProps<TRow extends Record<string, string | undefined>> = {
  variant: DataTableVariant;
  columns: DataTableColumn[];
  rows: TRow[];
  rowKey: (row: TRow, index: number) => string;
  selectedRowIndex: number | null;
  onRowClick: (index: number) => void;
  renderCell?: (row: TRow, column: DataTableColumn, rowIndex: number, columnIndex: number) => ReactNode;
};

export function DataTable<TRow extends Record<string, string | undefined>>({
  variant,
  columns,
  rows,
  rowKey,
  selectedRowIndex,
  onRowClick,
  renderCell
}: DataTableProps<TRow>) {
  const headerClass = variant === "main" ? styles.tableHeader : styles.lineItemsHeaderRow;
  const rowClass = variant === "main" ? styles.tableRow : styles.lineItemsRow;
  const selectedClass = variant === "main" ? styles.tableRowSelected : styles.lineItemsRowSelected;
  const headerCellClass = variant === "main" ? styles.tableHeaderCell : styles.lineItemsHeaderCell;
  const cellClass = variant === "main" ? styles.tableCell : styles.lineItemsCell;
  const stickyHeaderClass = variant === "main" ? styles.stickyMainHeaderCell : styles.stickyLineHeaderCell;
  const stickyCellClass = variant === "main" ? styles.stickyMainCell : styles.stickyLineCell;

  return (
    <>
      <div className={headerClass}>
        {columns.map((column, columnIndex) => (
          <Typography
            key={column.key}
            className={`${headerCellClass} ${columnIndex === 0 ? stickyHeaderClass : ""}`}
          >
            {column.label}
          </Typography>
        ))}
      </div>

      {rows.map((row, rowIndex) => (
        <div
          key={rowKey(row, rowIndex)}
          className={`${rowClass} ${selectedRowIndex === rowIndex ? selectedClass : ""}`}
          onClick={() => onRowClick(rowIndex)}
        >
          {columns.map((column, columnIndex) => (
            <Typography
              key={`${rowKey(row, rowIndex)}-${column.key}`}
              className={`${cellClass} ${columnIndex === 0 ? stickyCellClass : ""}`}
            >
              {renderCell ? renderCell(row, column, rowIndex, columnIndex) : row[column.key]}
            </Typography>
          ))}
        </div>
      ))}
    </>
  );
}

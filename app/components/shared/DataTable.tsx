"use client";

import { Fragment, type ReactNode } from "react";
import type React from "react";
import styles from "../../page.module.scss";

type DataTableColumn = {
  key: string;
  label: string;
  pinned?: boolean;
  pinnedRight?: boolean;
  width?: number;
};

type DataTableVariant = "main" | "line";

type DataTableProps<TRow extends Record<string, string | boolean | undefined>> = {
  variant: DataTableVariant;
  columns: DataTableColumn[];
  rows: TRow[];
  rowKey: (row: TRow, index: number) => string;
  selectedRowIndex?: number | null;
  selectedRowIndices?: Set<number>;
  onRowClick?: (index: number, event?: React.MouseEvent) => void;
  renderCell?: (row: TRow, column: DataTableColumn, rowIndex: number, columnIndex: number) => ReactNode;
  renderHeaderCell?: (column: DataTableColumn, columnIndex: number) => ReactNode;
  getCellClassName?: (row: TRow, column: DataTableColumn, rowIndex: number, columnIndex: number) => string | undefined;
  fillRemainingSpace?: boolean;
};

export function DataTable<TRow extends Record<string, string | boolean | undefined>>({
  variant,
  columns,
  rows,
  rowKey,
  selectedRowIndex,
  selectedRowIndices,
  onRowClick,
  renderCell,
  renderHeaderCell,
  getCellClassName,
  fillRemainingSpace = false
}: DataTableProps<TRow>) {
  const headerClass = variant === "main" ? styles.tableHeader : styles.lineItemsHeaderRow;
  const rowClass = variant === "main" ? styles.tableRow : styles.lineItemsRow;
  const selectedClass = variant === "main" ? styles.tableRowSelected : styles.lineItemsRowSelected;
  const headerCellClass = variant === "main" ? styles.tableHeaderCell : styles.lineItemsHeaderCell;
  const cellClass = variant === "main" ? styles.tableCell : styles.lineItemsCell;
  const stickyHeaderClass = variant === "main" ? styles.stickyMainHeaderCell : styles.stickyLineHeaderCell;
  const stickyCellClass = variant === "main" ? styles.stickyMainCell : styles.stickyLineCell;
  const stickyRightHeaderClass = styles.stickyRightHeaderCell;
  const stickyRightCellClass = styles.stickyRightCell;
  const fillerHeaderCellClass = variant === "main" ? styles.tableHeaderFillerCell : styles.lineItemsHeaderFillerCell;
  const fillerCellClass = variant === "main" ? styles.tableFillerCell : styles.lineItemsFillerCell;
  const DEFAULT_COLUMN_WIDTH = 120;
  const firstPinnedRightIndex = columns.findIndex((column) => Boolean(column.pinnedRight));
  const shouldRenderFiller = fillRemainingSpace;

  const stickyMeta = columns.reduce<{
    items: Array<{ isSticky: boolean; left: number; order: number }>;
    offset: number;
    order: number;
  }>(
    (acc, column, columnIndex) => {
      const shouldStick = columnIndex === 0 || Boolean(column.pinned);
      if (!shouldStick) {
        acc.items.push({ isSticky: false, left: 0, order: -1 });
        return acc;
      }

      acc.items.push({ isSticky: true, left: acc.offset, order: acc.order });
      return {
        items: acc.items,
        offset: acc.offset + (column.width ?? DEFAULT_COLUMN_WIDTH),
        order: acc.order + 1,
      };
    },
    { items: [], offset: 0, order: 0 }
  ).items;

  const stickyRightMeta = columns.reduceRight<{
    items: Array<{ isSticky: boolean; right: number; order: number }>;
    offset: number;
    order: number;
  }>(
    (acc, column) => {
      const shouldStick = Boolean(column?.pinnedRight);
      if (!shouldStick) {
        acc.items.unshift({ isSticky: false, right: 0, order: -1 });
        return acc;
      }

      acc.items.unshift({ isSticky: true, right: acc.offset, order: acc.order });
      return {
        items: acc.items,
        offset: acc.offset + (column.width ?? DEFAULT_COLUMN_WIDTH),
        order: acc.order + 1,
      };
    },
    { items: [], offset: 0, order: 0 }
  ).items;

  return (
    <>
      <div className={headerClass}>
        {columns.map((column, columnIndex) => (
          <Fragment key={column.key}>
            {shouldRenderFiller && firstPinnedRightIndex >= 0 && columnIndex === firstPinnedRightIndex ? (
              <div className={fillerHeaderCellClass} aria-hidden="true" />
            ) : null}
            <div
              className={`${headerCellClass} ${stickyMeta[columnIndex]?.isSticky ? stickyHeaderClass : ""} ${stickyRightMeta[columnIndex]?.isSticky ? stickyRightHeaderClass : ""}`}
              style={
                stickyMeta[columnIndex]?.isSticky || stickyRightMeta[columnIndex]?.isSticky || Boolean(column.width)
                  ? {
                    ...(column.width
                      ? {
                        width: `${column.width}px`,
                        minWidth: `${column.width}px`,
                        maxWidth: `${column.width}px`,
                      }
                      : {}),
                    ...(stickyMeta[columnIndex]?.isSticky
                      ? {
                        left: `${stickyMeta[columnIndex].left}px`,
                        zIndex: 20 - stickyMeta[columnIndex].order,
                      }
                      : {}),
                    ...(stickyRightMeta[columnIndex]?.isSticky
                      ? {
                        right: `${stickyRightMeta[columnIndex].right}px`,
                        zIndex: 30 - stickyRightMeta[columnIndex].order,
                      }
                      : {}),
                  }
                  : undefined
              }
            >
              {renderHeaderCell ? renderHeaderCell(column, columnIndex) : column.label}
            </div>
          </Fragment>
        ))}
        {shouldRenderFiller && firstPinnedRightIndex < 0 ? (
          <div className={fillerHeaderCellClass} aria-hidden="true" />
        ) : null}
      </div>

      {rows.map((row, rowIndex) => (
        <div
          key={rowKey(row, rowIndex)}
          className={`${rowClass} ${(selectedRowIndex === rowIndex || selectedRowIndices?.has(rowIndex)) ? selectedClass : ""}`}
          onClick={(e) => onRowClick?.(rowIndex, e)}
        >
          {columns.map((column, columnIndex) => (
            <Fragment key={`${rowKey(row, rowIndex)}-${column.key}`}>
              {shouldRenderFiller && firstPinnedRightIndex >= 0 && columnIndex === firstPinnedRightIndex ? (
                <div className={fillerCellClass} aria-hidden="true" />
              ) : null}
              <div
                className={`${cellClass} ${stickyMeta[columnIndex]?.isSticky ? stickyCellClass : ""} ${stickyRightMeta[columnIndex]?.isSticky ? stickyRightCellClass : ""} ${getCellClassName?.(row, column, rowIndex, columnIndex) ?? ""}`}
                style={
                  stickyMeta[columnIndex]?.isSticky || stickyRightMeta[columnIndex]?.isSticky || Boolean(column.width)
                    ? {
                      ...(column.width
                        ? {
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                          maxWidth: `${column.width}px`,
                        }
                        : {}),
                      ...(stickyMeta[columnIndex]?.isSticky
                        ? {
                          left: `${stickyMeta[columnIndex].left}px`,
                          zIndex: 10 - stickyMeta[columnIndex].order,
                        }
                        : {}),
                      ...(stickyRightMeta[columnIndex]?.isSticky
                        ? {
                          right: `${stickyRightMeta[columnIndex].right}px`,
                          zIndex: 15 - stickyRightMeta[columnIndex].order,
                        }
                        : {}),
                    }
                    : undefined
                }
              >
                {renderCell ? renderCell(row, column, rowIndex, columnIndex) : row[column.key]}
              </div>
            </Fragment>
          ))}
          {shouldRenderFiller && firstPinnedRightIndex < 0 ? <div className={fillerCellClass} aria-hidden="true" /> : null}
        </div>
      ))}
    </>
  );
}

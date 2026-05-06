"use client";

import { Fragment, type ReactNode } from "react";
import styles from "../../page.module.scss";

type DataTableColumn = {
  key: string;
  label: string;
  pinned?: boolean;
  pinnedRight?: boolean;
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
  fillRemainingSpace?: boolean;
};

export function DataTable<TRow extends Record<string, string | undefined>>({
  variant,
  columns,
  rows,
  rowKey,
  selectedRowIndex,
  onRowClick,
  renderCell,
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
  const STICKY_COLUMN_WIDTH = 120;
  const firstPinnedRightIndex = columns.findIndex((column) => Boolean(column.pinnedRight));
  const shouldRenderFiller = fillRemainingSpace;

  const stickyMeta = columns.reduce<Array<{ isSticky: boolean; left: number; order: number }>>(
    (acc, column, columnIndex) => {
      const shouldStick = columnIndex === 0 || Boolean(column.pinned);
      if (!shouldStick) {
        acc.push({ isSticky: false, left: 0, order: -1 });
        return acc;
      }

      const stickyOrder = acc.filter((entry) => entry.isSticky).length;
      acc.push({
        isSticky: true,
        left: stickyOrder * STICKY_COLUMN_WIDTH,
        order: stickyOrder,
      });
      return acc;
    },
    []
  );

  const stickyRightMeta = columns.reduceRight<Array<{ isSticky: boolean; right: number; order: number }>>(
    (acc, column, columnIndex) => {
      const shouldStick = Boolean(column.pinnedRight);
      if (!shouldStick) {
        acc[columnIndex] = { isSticky: false, right: 0, order: -1 };
        return acc;
      }

      const stickyOrder = acc.filter((entry) => entry?.isSticky).length;
      acc[columnIndex] = {
        isSticky: true,
        right: stickyOrder * STICKY_COLUMN_WIDTH,
        order: stickyOrder,
      };
      return acc;
    },
    new Array(columns.length)
  );

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
                stickyMeta[columnIndex]?.isSticky || stickyRightMeta[columnIndex]?.isSticky
                  ? {
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
              {column.label}
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
          className={`${rowClass} ${selectedRowIndex === rowIndex ? selectedClass : ""}`}
          onClick={() => onRowClick(rowIndex)}
        >
          {columns.map((column, columnIndex) => (
            <Fragment key={`${rowKey(row, rowIndex)}-${column.key}`}>
              {shouldRenderFiller && firstPinnedRightIndex >= 0 && columnIndex === firstPinnedRightIndex ? (
                <div className={fillerCellClass} aria-hidden="true" />
              ) : null}
              <div
                className={`${cellClass} ${stickyMeta[columnIndex]?.isSticky ? stickyCellClass : ""} ${stickyRightMeta[columnIndex]?.isSticky ? stickyRightCellClass : ""}`}
                style={
                  stickyMeta[columnIndex]?.isSticky || stickyRightMeta[columnIndex]?.isSticky
                    ? {
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

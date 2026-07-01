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

  let leftStickyOffset = 0;
  let leftStickyOrder = 0;
  const stickyMeta = columns.map((column, columnIndex) => {
    const shouldStick = columnIndex === 0 || Boolean(column.pinned);
    if (!shouldStick) {
      return { isSticky: false, left: 0, order: -1 };
    }

    const meta = {
      isSticky: true,
      left: leftStickyOffset,
      order: leftStickyOrder,
    };
    leftStickyOffset += column.width ?? DEFAULT_COLUMN_WIDTH;
    leftStickyOrder += 1;
    return meta;
  });

  let rightStickyOffset = 0;
  let rightStickyOrder = 0;
  const stickyRightMeta = new Array<{ isSticky: boolean; right: number; order: number }>(columns.length);
  for (let columnIndex = columns.length - 1; columnIndex >= 0; columnIndex -= 1) {
    const column = columns[columnIndex];
    const shouldStick = Boolean(column?.pinnedRight);
    if (!shouldStick) {
      stickyRightMeta[columnIndex] = { isSticky: false, right: 0, order: -1 };
      continue;
    }

    stickyRightMeta[columnIndex] = {
      isSticky: true,
      right: rightStickyOffset,
      order: rightStickyOrder,
    };
    rightStickyOffset += column.width ?? DEFAULT_COLUMN_WIDTH;
    rightStickyOrder += 1;
  }

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
                className={`${cellClass} ${stickyMeta[columnIndex]?.isSticky ? stickyCellClass : ""} ${stickyRightMeta[columnIndex]?.isSticky ? stickyRightCellClass : ""}`}
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

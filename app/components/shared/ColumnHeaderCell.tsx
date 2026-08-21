"use client";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";
import type { RefObject } from "react";
import { COLUMN_INFO } from "./columnInfo";
import {
  FILTER_OPERATOR_LABELS,
  FILTER_OPERATORS_WITHOUT_VALUE,
  isColumnFilterActive,
  type ColumnFilter,
  type ColumnSortState,
  type FilterOperator
} from "./useSortFilterTable";
import styles from "../../page.module.scss";

type ColumnHeaderCellProps = {
  columnKey: string;
  columnLabel: string;
  columnSort: ColumnSortState;
  onToggleSort: (key: string, direction: "asc" | "desc") => void;
  columnFilter: ColumnFilter | undefined;
  onSetFilterOperator: (key: string, operator: FilterOperator) => void;
  onSetFilterValue: (key: string, value: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  headerMenuWrapperRef: RefObject<HTMLSpanElement | null>;
  onOpenInfo?: (key: string) => void;
  /** Key to look up COLUMN_INFO with, when it differs from columnKey (e.g. Säljstöd indexes COLUMN_INFO by label). Defaults to columnKey. */
  infoKey?: string;
};

export function ColumnHeaderCell({
  columnKey,
  columnLabel,
  columnSort,
  onToggleSort,
  columnFilter,
  onSetFilterOperator,
  onSetFilterValue,
  isMenuOpen,
  onToggleMenu,
  headerMenuWrapperRef,
  onOpenInfo,
  infoKey
}: ColumnHeaderCellProps) {
  const isSorted = columnSort?.key === columnKey;
  const isFiltered = isColumnFilterActive(columnFilter);
  const isActive = isMenuOpen || isSorted || isFiltered;
  const filterOperator = columnFilter?.operator ?? "contains";
  const filterNeedsValue = !FILTER_OPERATORS_WITHOUT_VALUE.includes(filterOperator);
  const info = COLUMN_INFO[infoKey ?? columnKey];
  const showInfoButton = Boolean(info && onOpenInfo);

  const handleSortClick = () => {
    if (isSorted && columnSort!.direction === "asc") {
      onToggleSort(columnKey, "desc");
    } else {
      onToggleSort(columnKey, isSorted ? "desc" : "asc");
    }
  };

  return (
    <span
      className={styles.tableHeaderCellContent}
      ref={isMenuOpen ? headerMenuWrapperRef : undefined}
      onClick={handleSortClick}
    >
      <Tooltip title={columnLabel} placement="top">
        <span className={`${styles.tableHeaderCellLabel} ${isActive ? styles.tableHeaderCellLabelTrimmed : ""}`}>
          {columnLabel}
        </span>
      </Tooltip>
      <span className={`${styles.tableHeaderCellIcons} ${isActive ? styles.tableHeaderCellIconsActive : ""}`}>
        <IconButton
          size="small"
          tabIndex={-1}
          className={`${styles.tableHeaderCellIcon} ${styles.tableHeaderCellSortIcon} ${isSorted ? `${styles.tableHeaderCellIconActive} ${styles.tableHeaderCellIconHighlighted}` : ""}`}
        >
          {isSorted && columnSort!.direction === "desc" ? (
            <ArrowDownwardIcon fontSize="inherit" />
          ) : (
            <ArrowUpwardIcon fontSize="inherit" />
          )}
        </IconButton>
        <IconButton
          size="small"
          className={`${styles.tableHeaderCellIcon} ${isFiltered ? styles.tableHeaderCellIconHighlighted : ""} ${isFiltered || isMenuOpen ? styles.tableHeaderCellIconActive : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
        >
          <FilterListOutlinedIcon fontSize="inherit" />
        </IconButton>
        {showInfoButton ? (
          <Tooltip title="Om kolumnen" placement="top">
            <IconButton
              size="small"
              className={styles.tableHeaderCellIcon}
              onClick={(event) => {
                event.stopPropagation();
                onOpenInfo!(infoKey ?? columnKey);
              }}
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
      </span>
      {isMenuOpen ? (
        <div className={styles.tableHeaderActionsPopover} onClick={(event) => event.stopPropagation()}>
          <div className={styles.tableHeaderPopoverFilterRow}>
            <select
              className={styles.tableHeaderFilterSelect}
              value={filterOperator}
              onChange={(event) => onSetFilterOperator(columnKey, event.target.value as FilterOperator)}
            >
              {Object.entries(FILTER_OPERATOR_LABELS).map(([operator, label]) => (
                <option key={operator} value={operator}>
                  {label}
                </option>
              ))}
            </select>
            {filterNeedsValue ? (
              <input
                type="text"
                className={styles.tableHeaderFilterInput}
                placeholder="Värde..."
                value={columnFilter?.value ?? ""}
                onChange={(event) => onSetFilterValue(columnKey, event.target.value)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </span>
  );
}

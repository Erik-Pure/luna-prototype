"use client";

import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ChevronRight";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { ActionRow } from "./shared/ActionRow";
import { ColumnHeaderCell } from "./shared/ColumnHeaderCell";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { useColumnHeaderMenu } from "./shared/useColumnHeaderMenu";
import { useSortFilterTable } from "./shared/useSortFilterTable";
import styles from "../page.module.scss";

type ContractListViewProps = {
  textFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  selectFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  checkboxFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  allTextFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  allSelectFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  allCheckboxFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox" }>;
  searchValues: Record<string, string | boolean>;
  globalSearchValue: string;
  isSearchMenuOpen: boolean;
  draftSearchFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox"; visible: boolean; favorite?: boolean }>;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  searchMenuRef: RefObject<HTMLDivElement | null>;
  getSelectOptions: (key: string) => string[];
  onOpenSearchMenu: () => void;
  onCancelSearchMenu: () => void;
  onToggleSearchFieldVisibility: (key: string) => void;
  onToggleSearchFieldFavorite: (key: string) => void;
  onSaveFavoriteKeys: (orderedKeys: string[]) => void;
  onSaveSearchFieldChanges: () => void;
  onClearSearchFieldChanges: () => void;
  onClearSearchValues: () => void;
  onGlobalSearchChange: (value: string) => void;
  onSearchTextChange: (key: string, value: string) => void;
  onSearchSelectChange: (key: string, value: string | string[]) => void;
  onSearchCheckboxChange: (key: string, checked: boolean) => void;
  actionItems: Array<{ label: string; icon: ReactNode; requiresSelection: boolean }>;
  onCreateContract: () => void;
  hasSelectedRows: boolean;
  isLineItemsTableVisible: boolean;
  onToggleLineItemsTable: () => void;
  isColumnsMenuOpen: boolean;
  draftColumns: Array<{ key: string; label: string; visible: boolean; pinned?: boolean; width?: number }>;
  columnsMenuRef: RefObject<HTMLDivElement | null>;
  columnsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenColumnsMenu: () => void;
  onCancelColumnsMenu: () => void;
  onToggleColumnVisibility: (key: string) => void;
  onMoveColumn: (key: string, direction: "up" | "down") => void;
  onSaveColumnChanges: () => void;
  onResetColumnChanges: () => void;
  onToggleColumnPin: (key: string) => void;
  getColumnWidth?: (key: string) => number | undefined;
  onIncreaseColumnWidth?: (key: string) => void;
  onDecreaseColumnWidth?: (key: string) => void;
  orderedVisibleColumns: Array<{ key: string; label: string; width?: number }>;
  tableRows: Array<Record<string, string | undefined>>;
  selectedRowId: number | null;
  onSelectMainTableRow: (rowIndex: number) => void;
  getCellValue: (row: Record<string, string | undefined>, columnKey: string) => string;
  onOpenContractDetail: (contractId: string) => void;
  getCustomerDetailHref: (customerName: string) => string;
  onOpenCustomerFordran: (customerName: string) => void;
  isLineColumnsMenuOpen: boolean;
  draftLineColumns: Array<{ key: string; label: string; visible: boolean }>;
  lineColumnsMenuRef: RefObject<HTMLDivElement | null>;
  lineColumnsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenLineColumnsMenu: () => void;
  onCancelLineColumnsMenu: () => void;
  onToggleLineColumnVisibility: (key: string) => void;
  onMoveLineColumn: (key: string, direction: "up" | "down") => void;
  onSaveLineColumnChanges: () => void;
  onResetLineColumnChanges: () => void;
  onToggleLineColumnPin: (key: string) => void;
  getLineColumnWidth?: (key: string) => number | undefined;
  onIncreaseLineColumnWidth?: (key: string) => void;
  onDecreaseLineColumnWidth?: (key: string) => void;
  visibleLineColumns: Array<{ key: string; label: string }>;
  lineItemRows: Array<Record<string, string>>;
};

export function ContractListView({
  textFields,
  selectFields,
  checkboxFields,
  allTextFields,
  allSelectFields,
  allCheckboxFields,
  searchValues,
  globalSearchValue,
  isSearchMenuOpen,
  draftSearchFields,
  searchButtonRef,
  searchMenuRef,
  getSelectOptions,
  onOpenSearchMenu,
  onCancelSearchMenu,
  onToggleSearchFieldVisibility,
  onToggleSearchFieldFavorite,
  onSaveFavoriteKeys,
  onSaveSearchFieldChanges,
  onClearSearchFieldChanges,
  onClearSearchValues,
  onGlobalSearchChange,
  onSearchTextChange,
  onSearchSelectChange,
  onSearchCheckboxChange,
  actionItems,
  onCreateContract,
  hasSelectedRows,
  isLineItemsTableVisible,
  onToggleLineItemsTable,
  isColumnsMenuOpen,
  draftColumns,
  columnsMenuRef,
  columnsButtonRef,
  onOpenColumnsMenu,
  onCancelColumnsMenu,
  onToggleColumnVisibility,
  onMoveColumn,
  onSaveColumnChanges,
  onResetColumnChanges,
  onToggleColumnPin,
  getColumnWidth,
  onIncreaseColumnWidth,
  onDecreaseColumnWidth,
  orderedVisibleColumns,
  tableRows,
  selectedRowId,
  onSelectMainTableRow,
  getCellValue,
  onOpenContractDetail,
  getCustomerDetailHref,
  onOpenCustomerFordran,
  isLineColumnsMenuOpen,
  draftLineColumns,
  lineColumnsMenuRef,
  lineColumnsButtonRef,
  onOpenLineColumnsMenu,
  onCancelLineColumnsMenu,
  onToggleLineColumnVisibility,
  onMoveLineColumn,
  onSaveLineColumnChanges,
  onResetLineColumnChanges,
  onToggleLineColumnPin,
  getLineColumnWidth,
  onIncreaseLineColumnWidth,
  onDecreaseLineColumnWidth,
  visibleLineColumns,
  lineItemRows
}: ContractListViewProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { openHeaderMenuKey, setOpenHeaderMenuKey, headerMenuWrapperRef } = useColumnHeaderMenu();
  const { columnSort, columnFilters, toggleColumnSort, setColumnFilterOperator, setColumnFilterValue, displayRowEntries, getDisplayRowIndex } =
    useSortFilterTable(tableRows, getCellValue);

  const selectedDisplayRowIndex = getDisplayRowIndex(selectedRowId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return !prev;
    });
  };

  return (
    <>
      <SearchFiltersPanel
        textFields={textFields}
        selectFields={selectFields}
        checkboxFields={checkboxFields}
        allTextFields={allTextFields}
        allSelectFields={allSelectFields}
        allCheckboxFields={allCheckboxFields}
        values={searchValues}
        globalSearchValue={globalSearchValue}
        isMenuOpen={isSearchMenuOpen}
        draftFields={draftSearchFields}
        searchButtonRef={searchButtonRef}
        searchMenuRef={searchMenuRef}
        getSelectOptions={getSelectOptions}
        useAdvancedFilterLayout
        onOpenMenu={onOpenSearchMenu}
        onCancelMenu={onCancelSearchMenu}
        onToggleFieldVisibility={onToggleSearchFieldVisibility}
        onToggleFieldFavorite={onToggleSearchFieldFavorite}
        onSaveFavoriteKeys={onSaveFavoriteKeys}
        onSaveMenu={onSaveSearchFieldChanges}
        onClearMenu={onClearSearchFieldChanges}
        onClearValues={onClearSearchValues}
        onGlobalSearchChange={onGlobalSearchChange}
        onTextChange={onSearchTextChange}
        onSelectChange={onSearchSelectChange}
        onCheckboxChange={onSearchCheckboxChange}
        hideGlobalSearch
      />

      <ActionRow
        items={actionItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          enabled: !item.requiresSelection || hasSelectedRows,
          onClick: item.label === "Kontrakt" ? onCreateContract : undefined,
          tone: item.label === "Kontrakt" ? "primary" : "default"
        }))}
        rightSlot={
          <>
            <div className={styles.tableSearchWrapper} ref={searchWrapperRef}>
              <Button
                className={`${styles.lineItemsToggleButton} ${isSearchOpen || globalSearchValue ? styles.tableSearchButtonActive : ""}`}
                variant="outlined"
                size="small"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleToggleSearch}
              >
                Filtrera
              </Button>
              {isSearchOpen ? (
                <div className={styles.tableSearchDropdown}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.tableSearchDropdownInput}
                    placeholder="Filtrera i tabell..."
                    value={globalSearchValue}
                    onChange={(e) => onGlobalSearchChange(e.target.value)}
                  />
                  {globalSearchValue ? (
                    <button
                      type="button"
                      className={styles.tableSearchDropdownClear}
                      onClick={() => onGlobalSearchChange("")}
                      aria-label="Rensa filtrering"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Tooltip title={"Skriv ut"} placement="top">
              <IconButton
                size="small"
                className={`${styles.columnsIconButton}`}
              >
                <PrintOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isLineItemsTableVisible ? "Dölj kontraktsrader" : "Visa kontraktsrader"} placement="top">
              <IconButton
                size="small"
                className={`${styles.columnsIconButton} ${isLineItemsTableVisible ? styles.columnsIconButtonActive : ""}`}
                onClick={onToggleLineItemsTable}
              >
                <TableRowsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ColumnManagerDropdown
              isOpen={isColumnsMenuOpen}
              columns={draftColumns}
              menuRef={columnsMenuRef}
              buttonRef={columnsButtonRef}
              onOpen={onOpenColumnsMenu}
              onCancel={onCancelColumnsMenu}
              onToggleVisibility={onToggleColumnVisibility}
              onMove={onMoveColumn}
              onSave={onSaveColumnChanges}
              onReset={onResetColumnChanges}
              onTogglePin={onToggleColumnPin}
              canAdjustWidth={getColumnWidth ? () => true : undefined}
              getColumnWidth={getColumnWidth}
              onDecreaseWidth={onDecreaseColumnWidth}
              onIncreaseWidth={onIncreaseColumnWidth}
              iconOnly
            />
          </>
        }
      />

      <div className={`${styles.tablesLayout} ${isLineItemsTableVisible ? styles.tablesLayoutSplit : ""}`}>
        <div className={`${styles.tableContainer} ${styles.contractTableCompact} ${isLineItemsTableVisible ? styles.tableContainerSplit : ""}`}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={orderedVisibleColumns}
                rows={displayRowEntries.map((entry) => entry.row)}
                rowKey={(row, idx) => `${row.kontrakt}-${idx}`}
                selectedRowIndex={selectedDisplayRowIndex}
                onRowClick={(displayIndex) => onSelectMainTableRow(displayRowEntries[displayIndex].originalIndex)}
                fillRemainingSpace
                renderHeaderCell={(column) => (
                  <ColumnHeaderCell
                    columnKey={column.key}
                    columnLabel={column.label}
                    columnSort={columnSort}
                    onToggleSort={toggleColumnSort}
                    columnFilter={columnFilters[column.key]}
                    onSetFilterOperator={setColumnFilterOperator}
                    onSetFilterValue={setColumnFilterValue}
                    isMenuOpen={openHeaderMenuKey === column.key}
                    onToggleMenu={() => setOpenHeaderMenuKey((prev) => (prev === column.key ? null : column.key))}
                    headerMenuWrapperRef={headerMenuWrapperRef}
                  />
                )}
                renderCell={(row, column) => {
                  if (column.key === "kontrakt") {
                    return (
                      <button
                        type="button"
                        className={styles.contractLinkButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenContractDetail(getCellValue(row, column.key));
                        }}
                      >
                        {getCellValue(row, column.key)}
                      </button>
                    );
                  }

                  if (column.key === "kund") {
                    const hasForfallenFordran = row["forfallenFordran"] === "true";
                    const customerName = getCellValue(row, column.key);
                    const nameValue = hasForfallenFordran ? (
                      <Tooltip title={`Förfallen fordran — ${customerName}`} placement="top">
                        <span className={`${styles.warningCellContent} ${styles.warningCellContentMedium}`}>
                          <WarningAmberOutlinedIcon className={styles.warningCellIcon} />
                          <span className={styles.warningCellText}>{customerName}</span>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={customerName} placement="top">
                        <span className={styles.warningCellText}>{customerName}</span>
                      </Tooltip>
                    );
                    return (
                      <span className={styles.limitCell}>
                        <span className={styles.limitCellValue}>{nameValue}</span>
                        <Link
                          href={getCustomerDetailHref(customerName)}
                          className={styles.limitLinkIconButton}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ArrowForwardIcon className={styles.limitLinkIcon} fontSize="small" />
                        </Link>
                      </span>
                    );
                  }

                  if (column.key === "limit") {
                    const limitStatus = row["limitStatus"];
                    const limitNumber = getCellValue(row, column.key).replace(/\s*SEK$/, "");
                    const customerName = getCellValue(row, "kund");
                    const limitValue =
                      limitStatus === "error" || limitStatus === "warning" ? (
                        <Tooltip title={`Överskriden limit — ${limitNumber} SEK`} placement="top">
                          <span
                            className={`${styles.warningCellContent} ${limitStatus === "error" ? styles.warningCellContentHigh : styles.warningCellContentOrange}`}
                          >
                            <WarningAmberOutlinedIcon className={styles.warningCellIcon} />
                            <span className={styles.warningCellText}>{limitNumber}</span>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title={`${limitNumber} SEK`} placement="top">
                          <span className={styles.warningCellText}>{limitNumber}</span>
                        </Tooltip>
                      );
                    return (
                      <span className={styles.limitCell}>
                        <span className={styles.limitCellValue}>{limitValue}</span>
                        <button
                          type="button"
                          className={styles.limitLinkIconButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenCustomerFordran(customerName);
                          }}
                        >
                          <ArrowForwardIcon className={styles.limitLinkIcon} fontSize="small" />
                        </button>
                      </span>
                    );
                  }

                  return getCellValue(row, column.key);
                }}
              />
            </div>
          </div>

          {!isLineItemsTableVisible ? <div className={styles.tableFiller} /> : null}
        </div>

        {isLineItemsTableVisible ? (
          <div className={`${styles.lineItemsSection} ${styles.lineItemsSectionSplit} ${styles.contractTableCompact}`}>
            <div className={styles.lineItemsHeader}>
              <div className={styles.lineItemsTitleGroup}>
                {selectedRowId !== null && tableRows[selectedRowId]?.["kontrakt"] ? (
                  <>
                    <span className={styles.contractSectionLabel}>
                      Kontrakt {tableRows[selectedRowId]["kontrakt"]} - Kontraktsrader
                    </span>
                  </>
                ) : (
                  <Typography className={styles.lineItemsTitle}>Kontraktsrader</Typography>
                )}
              </div>
              <ColumnManagerDropdown
                isOpen={isLineColumnsMenuOpen}
                columns={draftLineColumns}
                menuRef={lineColumnsMenuRef}
                buttonRef={lineColumnsButtonRef}
                onOpen={onOpenLineColumnsMenu}
                onCancel={onCancelLineColumnsMenu}
                onToggleVisibility={onToggleLineColumnVisibility}
                onMove={onMoveLineColumn}
                onSave={onSaveLineColumnChanges}
                onReset={onResetLineColumnChanges}
                onTogglePin={onToggleLineColumnPin}
                canAdjustWidth={getLineColumnWidth ? () => true : undefined}
                getColumnWidth={getLineColumnWidth}
                onDecreaseWidth={onDecreaseLineColumnWidth}
                onIncreaseWidth={onIncreaseLineColumnWidth}
                iconOnly
              />
            </div>

            <div className={styles.lineItemsTableWrap}>
              <div className={styles.lineItemsTable}>
                <DataTable
                  variant="line"
                  columns={visibleLineColumns}
                  rows={lineItemRows}
                  rowKey={(_row, index) => `line-item-${index}`}
                  selectedRowIndex={null}
                  onRowClick={() => { }}
                  renderCell={(row, column) =>
                    column.key === "idRad" ? (
                      <button type="button" className={styles.lineItemLinkButton}>
                        {row[column.key]}
                      </button>
                    ) : (
                      row[column.key]
                    )
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

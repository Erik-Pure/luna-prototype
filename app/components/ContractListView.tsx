"use client";

import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import { Button, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { ActionRow } from "./shared/ActionRow";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
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
  onSearchSelectChange: (key: string, value: string) => void;
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
  getColumnWidth: (key: string) => number | undefined;
  canAdjustColumnWidth: (key: string) => boolean;
  onIncreaseColumnWidth: (key: string) => void;
  onDecreaseColumnWidth: (key: string) => void;
  orderedVisibleColumns: Array<{ key: string; label: string; width?: number }>;
  tableRows: Array<Record<string, string | undefined>>;
  selectedRowId: number | null;
  onSelectMainTableRow: (rowIndex: number) => void;
  getCellValue: (row: Record<string, string | undefined>, columnKey: string) => string;
  onOpenContractDetail: (contractId: string) => void;
  getCustomerDetailHref: (customerName: string) => string;
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
  canAdjustColumnWidth,
  onIncreaseColumnWidth,
  onDecreaseColumnWidth,
  orderedVisibleColumns,
  tableRows,
  selectedRowId,
  onSelectMainTableRow,
  getCellValue,
  onOpenContractDetail,
  getCustomerDetailHref,
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
  visibleLineColumns,
  lineItemRows
}: ContractListViewProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
          onClick: item.label === "Nytt kontrakt" ? onCreateContract : undefined,
          tone: item.label === "Nytt kontrakt" ? "primary" : "default"
        }))}
        rightSlot={
          <>
            <div className={styles.tableSearchWrapper} ref={searchWrapperRef}>
              <Button
                className={`${styles.lineItemsToggleButton} ${isSearchOpen ? styles.tableSearchButtonActive : ""}`}
                variant="outlined"
                size="small"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleToggleSearch}
              >
                Sök
              </Button>
              {isSearchOpen ? (
                <div className={styles.tableSearchDropdown}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.tableSearchDropdownInput}
                    placeholder="Sök i tabell..."
                    value={globalSearchValue}
                    onChange={(e) => onGlobalSearchChange(e.target.value)}
                  />
                  {globalSearchValue ? (
                    <button
                      type="button"
                      className={styles.tableSearchDropdownClear}
                      onClick={() => onGlobalSearchChange("")}
                      aria-label="Rensa sökning"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
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
              getColumnWidth={getColumnWidth}
              canAdjustWidth={canAdjustColumnWidth}
              onDecreaseWidth={onDecreaseColumnWidth}
              onIncreaseWidth={onIncreaseColumnWidth}
              iconOnly
            />
          </>
        }
      />

      <div className={`${styles.tablesLayout} ${isLineItemsTableVisible ? styles.tablesLayoutSplit : ""}`}>
        <div className={`${styles.tableContainer} ${isLineItemsTableVisible ? styles.tableContainerSplit : ""}`}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={orderedVisibleColumns}
                rows={tableRows}
                rowKey={(row, idx) => `${row.kontrakt}-${idx}`}
                selectedRowIndex={selectedRowId}
                onRowClick={onSelectMainTableRow}
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
                    const limitStatus = row["limitStatus"];
                    const customerName = getCellValue(row, column.key);
                    return (
                      <Link
                        href={getCustomerDetailHref(customerName)}
                        className={styles.kundCellLink}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className={styles.kundCell}>
                          {limitStatus === "error" ? (
                            <span className={styles.kundStatusDotError} />
                          ) : limitStatus === "warning" ? (
                            <span className={styles.kundStatusDotWarning} />
                          ) : null}
                          {customerName}
                        </span>
                      </Link>
                    );
                  }

                  if (column.key === "limit") {
                    const limitStatus = row["limitStatus"];
                    const limitNumber = getCellValue(row, column.key);
                    if (limitStatus === "error") {
                      return (
                        <Chip
                          label={limitNumber}
                          size="small"
                          color="error"
                        />
                      );
                    }
                    if (limitStatus === "warning") {
                      return (
                        <Chip
                          label={limitNumber}
                          size="small"
                          color="warning"
                        />
                      );
                    }
                    return <span>{limitNumber}</span>;
                  }

                  return getCellValue(row, column.key);
                }}
              />
            </div>
          </div>

          {!isLineItemsTableVisible ? <div className={styles.tableFiller} /> : null}
        </div>

        {isLineItemsTableVisible ? (
          <div className={`${styles.lineItemsSection} ${styles.lineItemsSectionSplit}`}>
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

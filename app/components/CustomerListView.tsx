"use client";

import FileDownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Button, Chip, IconButton, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { AndraKundgruppDialog } from "./customer-tabs/AndraKundgruppDialog";
import { ExporteraExcelDialog } from "./customer-tabs/ExporteraExcelDialog";
import { ActionRow } from "./shared/ActionRow";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { getCustomerWarnings, getWarningTone } from "./shared/customerWarnings";
import styles from "../page.module.scss";

type FieldDef = { key: string; label: string; control: "text" | "date" | "select" | "checkbox"; multi?: boolean };

type CustomerListViewProps = {
  textFields: FieldDef[];
  selectFields: FieldDef[];
  checkboxFields: FieldDef[];
  allTextFields: FieldDef[];
  allSelectFields: FieldDef[];
  allCheckboxFields: FieldDef[];
  searchValues: Record<string, string | string[] | boolean>;
  globalSearchValue: string;
  isSearchMenuOpen: boolean;
  draftSearchFields: Array<FieldDef & { visible: boolean; favorite?: boolean }>;
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
  hasSelectedRows: boolean;
  onCreateCustomer: () => void;
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
  orderedVisibleColumns: Array<{ key: string; label: string; width?: number }>;
  tableRows: Array<Record<string, string | undefined>>;
  selectedRowId: number | null;
  onSelectRow: (rowIndex: number) => void;
  onOpenCustomerDetail: (customerNr: string) => void;
};

export function CustomerListView({
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
  hasSelectedRows,
  onCreateCustomer,
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
  orderedVisibleColumns,
  tableRows,
  selectedRowId,
  onSelectRow,
  onOpenCustomerDetail
}: CustomerListViewProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAndraKundgruppOpen, setIsAndraKundgruppOpen] = useState(false);
  const [isExporteraExcelOpen, setIsExporteraExcelOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedRow = selectedRowId !== null ? tableRows[selectedRowId] : null;

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
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 0);
      return !prev;
    });
  };

  const getOnClick = (label: string) => {
    if (label === "Kund") return onCreateCustomer;
    if (label === "Ändra kundgrupp") return () => setIsAndraKundgruppOpen(true);
    if (label === "Exportera till Excel") return () => setIsExporteraExcelOpen(true);
    return undefined;
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
          onClick: getOnClick(item.label),
          tone: item.label === "Kund" ? "primary" : "default"
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
            <Tooltip title="Exportera till Excel" placement="top">
              <IconButton size="small" className={styles.columnsIconButton} onClick={() => setIsExporteraExcelOpen(true)}>
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Skriv ut" placement="top">
              <IconButton size="small" className={styles.columnsIconButton}>
                <PrintOutlinedIcon fontSize="small" />
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
              iconOnly
            />
          </>
        }
      />

      <div className={styles.tablesLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={orderedVisibleColumns}
                rows={tableRows}
                rowKey={(row, idx) => `${row.kundnr ?? idx}`}
                selectedRowIndex={selectedRowId}
                onRowClick={onSelectRow}
                renderCell={(row, column) => {
                  if (column.key === "kundnr") {
                    return (
                      <button
                        type="button"
                        className={styles.contractLinkButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenCustomerDetail(row.kundnr ?? "");
                        }}
                      >
                        {row[column.key] ?? "-"}
                      </button>
                    );
                  }

                  if (column.key === "kortnamn") {
                    const kortnamn = row[column.key] ?? "-";
                    const tone = getWarningTone(row);
                    if (tone === "none") return kortnamn;
                    const tooltipText = getCustomerWarnings(row).map((w) => w.label).join(" · ");
                    const badgeClass = tone === "red" ? styles.kortnamnBadgeHigh : styles.kortnamnBadgeMedium;
                    return (
                      <Tooltip title={tooltipText} placement="top">
                        <span className={`${styles.kortnamnBadge} ${badgeClass}`}>
                          <WarningAmberOutlinedIcon className={styles.kortnamnBadgeIcon} />
                          {kortnamn}
                        </span>
                      </Tooltip>
                    );
                  }

                  if (column.key === "limit") {
                    const limitValue = row[column.key] ?? "-";
                    if (row["varningsnivaLimit"] === "Hög") {
                      const label = row["limitChipDisplay"] === "belopp" ? limitValue : "Överskriden";
                      return <Chip label={label} size="small" className={styles.limitErrorChip} />;
                    }
                    return limitValue;
                  }

                  return row[column.key] ?? "-";
                }}
              />
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>

      <AndraKundgruppDialog
        open={isAndraKundgruppOpen}
        kortnamn={selectedRow?.["kortnamn"] ?? ""}
        currentKundgrupp={selectedRow?.["kundgrupp"] ?? ""}
        onClose={() => setIsAndraKundgruppOpen(false)}
        onSave={() => setIsAndraKundgruppOpen(false)}
      />

      <ExporteraExcelDialog
        open={isExporteraExcelOpen}
        onClose={() => setIsExporteraExcelOpen(false)}
      />
    </>
  );
}

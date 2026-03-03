"use client";

import { Button, Typography } from "@mui/material";
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
  searchValues: Record<string, string | boolean>;
  isSearchMenuOpen: boolean;
  draftSearchFields: Array<{ key: string; label: string; control: "text" | "select" | "checkbox"; visible: boolean }>;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  searchMenuRef: RefObject<HTMLDivElement | null>;
  getSelectOptions: (key: string) => string[];
  onOpenSearchMenu: () => void;
  onCancelSearchMenu: () => void;
  onToggleSearchFieldVisibility: (key: string) => void;
  onSaveSearchFieldChanges: () => void;
  onClearSearchFieldChanges: () => void;
  onSearchTextChange: (key: string, value: string) => void;
  onSearchSelectChange: (key: string, value: string) => void;
  onSearchCheckboxChange: (key: string, checked: boolean) => void;
  actionItems: Array<{ label: string; icon: ReactNode; requiresSelection: boolean }>;
  hasSelectedRows: boolean;
  isLineItemsTableVisible: boolean;
  onToggleLineItemsTable: () => void;
  isColumnsMenuOpen: boolean;
  draftColumns: Array<{ key: string; label: string; visible: boolean; pinned?: boolean }>;
  columnsMenuRef: RefObject<HTMLDivElement | null>;
  columnsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenColumnsMenu: () => void;
  onCancelColumnsMenu: () => void;
  onToggleColumnVisibility: (key: string) => void;
  onMoveColumn: (key: string, direction: "up" | "down") => void;
  onSaveColumnChanges: () => void;
  onResetColumnChanges: () => void;
  onToggleColumnPin: (key: string) => void;
  orderedVisibleColumns: Array<{ key: string; label: string }>;
  tableRows: Array<Record<string, string | undefined>>;
  selectedRowId: number | null;
  onSelectMainTableRow: (rowIndex: number) => void;
  getCellValue: (row: Record<string, string | undefined>, columnKey: string) => string;
  onOpenContractDetail: (contractId: string) => void;
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
  visibleLineColumns: Array<{ key: string; label: string }>;
  lineItemRows: Array<Record<string, string>>;
};

export function ContractListView({
  textFields,
  selectFields,
  checkboxFields,
  searchValues,
  isSearchMenuOpen,
  draftSearchFields,
  searchButtonRef,
  searchMenuRef,
  getSelectOptions,
  onOpenSearchMenu,
  onCancelSearchMenu,
  onToggleSearchFieldVisibility,
  onSaveSearchFieldChanges,
  onClearSearchFieldChanges,
  onSearchTextChange,
  onSearchSelectChange,
  onSearchCheckboxChange,
  actionItems,
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
  orderedVisibleColumns,
  tableRows,
  selectedRowId,
  onSelectMainTableRow,
  getCellValue,
  onOpenContractDetail,
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
  visibleLineColumns,
  lineItemRows
}: ContractListViewProps) {
  return (
    <>
      <SearchFiltersPanel
        textFields={textFields}
        selectFields={selectFields}
        checkboxFields={checkboxFields}
        values={searchValues}
        isMenuOpen={isSearchMenuOpen}
        draftFields={draftSearchFields}
        searchButtonRef={searchButtonRef}
        searchMenuRef={searchMenuRef}
        getSelectOptions={getSelectOptions}
        onOpenMenu={onOpenSearchMenu}
        onCancelMenu={onCancelSearchMenu}
        onToggleFieldVisibility={onToggleSearchFieldVisibility}
        onSaveMenu={onSaveSearchFieldChanges}
        onClearMenu={onClearSearchFieldChanges}
        onTextChange={onSearchTextChange}
        onSelectChange={onSearchSelectChange}
        onCheckboxChange={onSearchCheckboxChange}
      />

      <div className={styles.ruleDivider} />

      <ActionRow
        items={actionItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          enabled: !item.requiresSelection || hasSelectedRows
        }))}
        rightSlot={
          <>
            <Button
              className={styles.lineItemsToggleButton}
              variant="outlined"
              size="small"
              onClick={onToggleLineItemsTable}
            >
              {isLineItemsTableVisible ? "Dölj rader" : "Visa rader"}
            </Button>
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
                renderCell={(row, column) =>
                  column.key === "kontrakt" ? (
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
                  ) : (
                    getCellValue(row, column.key)
                  )
                }
              />
            </div>
          </div>

          {!isLineItemsTableVisible ? <div className={styles.tableFiller} /> : null}
        </div>

        {isLineItemsTableVisible ? (
          <div className={`${styles.lineItemsSection} ${styles.lineItemsSectionSplit}`}>
            <div className={styles.lineItemsHeader}>
              <Typography className={styles.lineItemsTitle}>Kontraktsrader</Typography>
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
                  onRowClick={() => {}}
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

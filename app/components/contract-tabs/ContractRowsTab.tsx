"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ActionRow } from "../shared/ActionRow";
import { ColumnManagerDropdown } from "../shared/ColumnManagerDropdown";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

type ContractRowColumn = {
  key: "idRad" | string;
  label: string;
  pinned?: boolean;
};

type ContractRowsTabProps = {
  visibleColumns: ContractRowColumn[];
  rows: Array<Record<string, string>>;
  draftColumns: Array<{ key: string; label: string; visible: boolean }>;
  isColumnsMenuOpen: boolean;
  columnsMenuRef: RefObject<HTMLDivElement | null>;
  columnsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenColumnsMenu: () => void;
  onCancelColumnsMenu: () => void;
  onToggleColumnVisibility: (key: string) => void;
  onMoveColumn: (key: string, direction: "up" | "down") => void;
  onSaveColumnChanges: () => void;
  onResetColumnChanges: () => void;
  onToggleColumnPin: (key: string) => void;
  onOpenRowDetail: (rowId: string) => void;
  onCreateRow: () => void;
  onOpenContainer: () => void;
};

const tableActionItems = [
  { label: "Kontraktsrad", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Ändra pris", icon: <EditOutlinedIcon fontSize="small" />, requiresSelection: false },
];

const INVOICE_UNIT_OPTIONS = ["lpm", "m2", "m3 aktuell", "m3 nominell", "paket", "st"] as const;

const toIntegerPriceString = (value: string): string => {
  const normalized = value
    .replace(/\s+/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/,/g, ".");

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return String(Math.round(parsed));
};

const sanitizePriceInput = (value: string): string => value.replace(/[^\d-]/g, "");

export function ContractRowsTab({
  visibleColumns,
  rows,
  draftColumns,
  isColumnsMenuOpen,
  columnsMenuRef,
  columnsButtonRef,
  onOpenColumnsMenu,
  onCancelColumnsMenu,
  onToggleColumnVisibility,
  onMoveColumn,
  onSaveColumnChanges,
  onResetColumnChanges,
  onToggleColumnPin,
  onOpenRowDetail,
  onCreateRow,
  onOpenContainer
}: ContractRowsTabProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editedRowValues, setEditedRowValues] = useState<Record<number, Partial<Record<"aPris" | "enhet", string>>>>({});
  const [isPriceEditMode, setIsPriceEditMode] = useState(false);
  const [openSelectIndex, setOpenSelectIndex] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const priceEditTableRef = useRef<HTMLDivElement>(null);

  const selectRow = (rowIndex: number) => {
    setSelectedRow((previous) => (previous === rowIndex ? null : rowIndex));
  };

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

  const filteredRows = filterValue
    ? rows.filter((row) =>
      Object.values(row).some((cell) =>
        String(cell ?? "").toLowerCase().includes(filterValue.toLowerCase())
      )
    )
    : rows;

  const updateDraftRowField = (rowIndex: number, key: "aPris" | "enhet", value: string) => {
    const nextValue = key === "aPris" ? sanitizePriceInput(value) : value;
    setEditedRowValues((previous) => ({
      ...previous,
      [rowIndex]: {
        ...previous[rowIndex],
        [key]: nextValue
      }
    }));
  };

  const handleEditPrice = () => {
    setIsPriceEditMode(true);
    requestAnimationFrame(() => {
      const first = priceEditTableRef.current?.querySelector<HTMLElement>('[data-price-edit="true"]');
      first?.focus();
    });
  };

  const handleSavePrice = () => {
    setIsPriceEditMode(false);
  };

  const handleCancelPrice = () => {
    setEditedRowValues({});
    setIsPriceEditMode(false);
  };

  const handleRefreshList = () => {
    setSelectedRow(null);
    setEditedRowValues({});
    setIsPriceEditMode(false);
  };

  const handlePriceEditKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isPriceEditMode || e.key !== "Tab" || openSelectIndex !== null) return;
    const fields = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[data-price-edit="true"]')
    );
    if (fields.length === 0) return;
    const activeEl = document.activeElement as HTMLElement | null;
    const currentIndex = fields.findIndex((f) => f === activeEl || f.contains(activeEl));
    if (currentIndex === -1) return;
    e.preventDefault();
    const nextIndex = e.shiftKey
      ? (currentIndex - 1 + fields.length) % fields.length
      : (currentIndex + 1) % fields.length;
    fields[nextIndex]?.focus();
  };

  const actionRowItems = [
    {
      key: "new-row",
      label: tableActionItems[0].label,
      icon: tableActionItems[0].icon,
      enabled: !isPriceEditMode,
      tone: isPriceEditMode ? "default" as const : "primary" as const,
      onClick: onCreateRow
    },
    {
      key: "copy-row",
      label: "Kopiera",
      icon: <ContentCopyIcon fontSize="small" />,
      enabled: selectedRow !== null && !isPriceEditMode,
    },
    {
      key: "primary-secondary-divider",
      kind: "divider" as const,
      label: "|"
    },
    {
      key: "edit-price",
      label: isPriceEditMode ? "Spara pris" : "Ändra pris",
      icon: tableActionItems[1].icon,
      enabled: true,
      tone: isPriceEditMode ? "primary" as const : "default" as const,
      onClick: isPriceEditMode ? handleSavePrice : handleEditPrice
    },
    ...(isPriceEditMode
      ? [
        {
          key: "cancel-price",
          label: "Avbryt",
          icon: <CloseOutlinedIcon fontSize="small" />,
          enabled: true,
          onClick: handleCancelPrice
        }
      ]
      : [])
    ,
    {
      key: "container",
      label: "Container",
      enabled: !isPriceEditMode,
      onClick: onOpenContainer
    },
  ];

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={actionRowItems}
        rightSlot={
          <>
            <div className={styles.tableSearchWrapper} ref={searchWrapperRef}>
              <Button
                className={`${styles.lineItemsToggleButton} ${isSearchOpen || filterValue ? styles.tableSearchButtonActive : ""}`}
                variant="outlined"
                size="small"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleToggleSearch}
                disabled={isPriceEditMode}
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
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                  {filterValue ? (
                    <button
                      type="button"
                      className={styles.tableSearchDropdownClear}
                      onClick={() => setFilterValue("")}
                      aria-label="Rensa filtrering"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Tooltip title="Uppdatera" placement="top">
              <IconButton
                size="small"
                className={styles.contractHeaderDotsButton}
                onClick={handleRefreshList}
                disabled={isPriceEditMode}
              >
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <div style={{ opacity: isPriceEditMode ? 0.45 : 1, pointerEvents: isPriceEditMode ? "none" : "auto" }}>
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
            </div>
          </>
        }
      />

      <div className={styles.lineItemsTableWrap}>
        <div className={styles.lineItemsTable} ref={priceEditTableRef} onKeyDown={handlePriceEditKeyDown}>
          <DataTable
            variant="line"
            columns={visibleColumns}
            rows={filteredRows}
            rowKey={(_row, index) => `contract-row-${index}`}
            selectedRowIndex={selectedRow}
            onRowClick={selectRow}
            renderCell={(row, column, rowIndex) =>
              column.key === "idRad" ? (
                <button
                  type="button"
                  className={styles.lineItemLinkButton}
                  tabIndex={isPriceEditMode ? -1 : 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenRowDetail(row[column.key]);
                  }}
                >
                  {row[column.key]}
                </button>
              ) : isPriceEditMode && column.key === "aPris" ? (
                <TextField
                  value={editedRowValues[rowIndex]?.aPris ?? toIntegerPriceString(row.aPris ?? "")}
                  size="small"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateDraftRowField(rowIndex, column.key as "aPris" | "enhet", event.target.value)}
                  className={styles.contractRowInlineInput}
                  inputProps={{ "data-price-edit": "true" }}
                />
              ) : isPriceEditMode && column.key === "enhet" ? (
                <Select
                  value={editedRowValues[rowIndex]?.enhet ?? row.enhet ?? ""}
                  size="small"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateDraftRowField(rowIndex, "enhet", event.target.value)}
                  className={styles.contractRowInlineInput}
                  onOpen={() => setOpenSelectIndex(rowIndex)}
                  onClose={() => setOpenSelectIndex(null)}
                  SelectDisplayProps={{ "data-price-edit": "true" } as React.HTMLAttributes<HTMLDivElement>}
                >
                  {INVOICE_UNIT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                column.key === "aPris"
                  ? (editedRowValues[rowIndex]?.aPris ?? toIntegerPriceString(row.aPris ?? ""))
                  : (editedRowValues[rowIndex]?.[column.key as "aPris" | "enhet"] ?? row[column.key])
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

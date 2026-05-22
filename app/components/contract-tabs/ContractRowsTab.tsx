"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { useState, type RefObject } from "react";
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
};

const tableActionItems = [
  { label: "Ny kontraktsrad", icon: <AddIcon fontSize="small" />, requiresSelection: false },
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
  onCreateRow
}: ContractRowsTabProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editedRowValues, setEditedRowValues] = useState<Record<number, Partial<Record<"aPris" | "enhet", string>>>>({});
  const [isPriceEditMode, setIsPriceEditMode] = useState(false);
  const [isBulkUnitDialogOpen, setIsBulkUnitDialogOpen] = useState(false);
  const [bulkUnitValue, setBulkUnitValue] = useState<string>(INVOICE_UNIT_OPTIONS[0]);

  const selectRow = (rowIndex: number) => {
    setSelectedRow((previous) => (previous === rowIndex ? null : rowIndex));
  };

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

  const getRowInvoiceUnit = (row: Record<string, string>, rowIndex: number): string =>
    editedRowValues[rowIndex]?.enhet ?? row.enhet ?? "";

  const handleOpenBulkUnitDialog = () => {
    const firstExisting = rows.length > 0 ? getRowInvoiceUnit(rows[0], 0) : "";
    setBulkUnitValue(
      INVOICE_UNIT_OPTIONS.includes(firstExisting as (typeof INVOICE_UNIT_OPTIONS)[number])
        ? firstExisting
        : INVOICE_UNIT_OPTIONS[0]
    );
    setIsBulkUnitDialogOpen(true);
  };

  const handleCloseBulkUnitDialog = () => {
    setIsBulkUnitDialogOpen(false);
  };

  const handleApplyBulkUnit = () => {
    setEditedRowValues((previous) => {
      const next = { ...previous };
      rows.forEach((_row, rowIndex) => {
        next[rowIndex] = {
          ...next[rowIndex],
          enhet: bulkUnitValue,
        };
      });
      return next;
    });
    handleCloseBulkUnitDialog();
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
          key: "bulk-unit",
          label: "Ändra alla",
          enabled: true,
          onClick: handleOpenBulkUnitDialog
        },
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
      enabled: !isPriceEditMode
    },
  ];

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={actionRowItems}
        rightSlot={
          <>
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
        <div className={styles.lineItemsTable}>
          <DataTable
            variant="line"
            columns={visibleColumns}
            rows={rows}
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
                />
              ) : isPriceEditMode && column.key === "enhet" ? (
                <Select
                  value={editedRowValues[rowIndex]?.enhet ?? row.enhet ?? ""}
                  size="small"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateDraftRowField(rowIndex, "enhet", event.target.value)}
                  className={styles.contractRowInlineInput}
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

      <Dialog open={isBulkUnitDialogOpen} onClose={handleCloseBulkUnitDialog} maxWidth="xs" fullWidth>
        <DialogTitle fontSize={16}>Ändra Enhet faktura på alla rader</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>Välj enhet som ska sättas på samtliga rader</Typography>
          <Select
            value={bulkUnitValue}
            onChange={(event) => setBulkUnitValue(event.target.value)}
            size="small"
            fullWidth
          >
            {INVOICE_UNIT_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ margin: "0 12px 12px 0" }}>
          <button
            type="button"
            className={styles.actionItemPrimary}
            onClick={handleApplyBulkUnit}
          >
            Spara
          </button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            className={styles.lineItemsToggleButton}
            onClick={handleCloseBulkUnitDialog}
            sx={{ textTransform: "none" }}
          >
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

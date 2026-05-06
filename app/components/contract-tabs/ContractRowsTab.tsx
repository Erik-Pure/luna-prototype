"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { IconButton, TextField, Tooltip } from "@mui/material";
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

  const selectRow = (rowIndex: number) => {
    setSelectedRow((previous) => (previous === rowIndex ? null : rowIndex));
  };

  const updateDraftRowField = (rowIndex: number, key: "aPris" | "enhet", value: string) => {
    setEditedRowValues((previous) => ({
      ...previous,
      [rowIndex]: {
        ...previous[rowIndex],
        [key]: value
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

  const actionRowItems = [
    {
      key: "new-row",
      label: tableActionItems[0].label,
      icon: tableActionItems[0].icon,
      enabled: !isPriceEditMode,
      tone: "primary" as const,
      onClick: onCreateRow
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
    , {
      key: "edit-price",
      label: isPriceEditMode ? "Spara pris" : "Ändra pris",
      icon: tableActionItems[1].icon,
      enabled: true,
      onClick: isPriceEditMode ? handleSavePrice : handleEditPrice
    },
    {
      key: "primary-secondary-divider",
      kind: "divider" as const,
      label: "|"
    },
    {
      key: "container",
      label: "Container",
      enabled: true
    },
  ];

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={actionRowItems}
        rightSlot={
          <>
            <Tooltip title="Uppdatera" placement="top">
              <IconButton size="small" className={styles.contractHeaderDotsButton} onClick={handleRefreshList}>
                <RefreshOutlinedIcon fontSize="small" />
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
            />
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
              ) : isPriceEditMode && (column.key === "aPris" || column.key === "enhet") ? (
                <TextField
                  value={editedRowValues[rowIndex]?.[column.key] ?? row[column.key] ?? ""}
                  size="small"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateDraftRowField(rowIndex, column.key as "aPris" | "enhet", event.target.value)}
                  className={styles.contractRowInlineInput}
                />
              ) : (
                editedRowValues[rowIndex]?.[column.key as "aPris" | "enhet"] ?? row[column.key]
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

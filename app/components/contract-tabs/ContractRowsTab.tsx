"use client";

import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { useMemo, useState, type RefObject } from "react";
import { ActionRow } from "../shared/ActionRow";
import { ColumnManagerDropdown } from "../shared/ColumnManagerDropdown";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

type ContractRowColumn = {
  key: "idRad" | string;
  label: string;
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
  onOpenRowDetail: (rowId: string) => void;
  onCreateRow: () => void;
};

const tableActionItems = [
  { label: "Ny", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Ta bort", icon: <DeleteOutlineOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Skriv ut", icon: <PrintOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Kopiera", icon: <ContentCopyOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Inaktivera", icon: <BlockOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Ändra pris", icon: <EditOutlinedIcon fontSize="small" />, requiresSelection: true }
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
  onOpenRowDetail,
  onCreateRow
}: ContractRowsTabProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const hasSelectedRows = selectedRow !== null;

  const activeActions = useMemo(
    () =>
      tableActionItems.map((item) => ({
        ...item,
        enabled: !item.requiresSelection || hasSelectedRows
      })),
    [hasSelectedRows]
  );

  const selectRow = (rowIndex: number) => {
    setSelectedRow((previous) => (previous === rowIndex ? null : rowIndex));
  };

  const actionRowItems = activeActions.map((item) => ({
    label: item.label,
    icon: item.icon,
    enabled: item.enabled,
    onClick: item.label === "Ny" ? onCreateRow : undefined
  }));

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={actionRowItems}
        rightSlot={
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
          />
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
            renderCell={(row, column) =>
              column.key === "idRad" ? (
                <button
                  type="button"
                  className={styles.lineItemLinkButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenRowDetail(row[column.key]);
                  }}
                >
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
  );
}

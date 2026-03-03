"use client";

import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { Button, Checkbox, IconButton, Typography } from "@mui/material";
import { useMemo, useState, type RefObject } from "react";
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

  return (
    <div className={styles.lineItemsSection}>
      <div className={styles.actionRow}>
        {activeActions.map((item, index) =>
          item.label === "Ny" ? (
            <button
              key={item.label}
              type="button"
              className={`${styles.actionItem} ${styles.actionEnabled} ${styles.actionItemButton}`}
              onClick={onCreateRow}
            >
              {item.icon}
              <Typography className={styles.actionLabel}>{item.label}</Typography>
              {index !== activeActions.length - 1 ? <span className={styles.actionSeparator} /> : null}
            </button>
          ) : (
            <div
              key={item.label}
              className={`${styles.actionItem} ${item.enabled ? styles.actionEnabled : styles.actionDisabled}`}
            >
              {item.icon}
              <Typography className={styles.actionLabel}>{item.label}</Typography>
              {index !== activeActions.length - 1 ? <span className={styles.actionSeparator} /> : null}
            </div>
          )
        )}
        <div className={`${styles.columnsMenuWrapper} ${styles.rightControlRail}`}>
          <Button
            ref={columnsButtonRef}
            className={styles.columnsButton}
            variant="outlined"
            size="small"
            startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
            onClick={isColumnsMenuOpen ? onCancelColumnsMenu : onOpenColumnsMenu}
          >
            Kolumner
          </Button>

          {isColumnsMenuOpen ? (
            <div className={styles.columnsDropdown} ref={columnsMenuRef}>
              <div className={styles.columnsDropdownList}>
                {draftColumns.map((column, index) => (
                  <div key={column.key} className={styles.columnsDropdownRow}>
                    <button
                      type="button"
                      className={styles.columnsDropdownName}
                      onClick={() => onToggleColumnVisibility(column.key)}
                    >
                      <Checkbox
                        size="small"
                        checked={column.visible}
                        className={styles.dropdownCheckbox}
                      />
                      <Typography className={styles.columnsDropdownLabel}>
                        {column.label}
                      </Typography>
                    </button>

                    <div className={styles.columnsDropdownActions}>
                      <IconButton
                        size="small"
                        className={styles.columnsActionIcon}
                        onClick={() => onMoveColumn(column.key, "up")}
                        disabled={index === 0}
                      >
                        <KeyboardArrowUpIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        className={styles.columnsActionIcon}
                        onClick={() => onMoveColumn(column.key, "down")}
                        disabled={index === draftColumns.length - 1}
                      >
                        <KeyboardArrowDownIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.columnsDropdownFooter}>
                <Button className={styles.dropdownSave} size="small" onClick={onSaveColumnChanges}>
                  Spara
                </Button>
                <Button className={styles.dropdownCancel} size="small" onClick={onCancelColumnsMenu}>
                  Avbryt
                </Button>
                <Button className={styles.dropdownClear} size="small" onClick={onResetColumnChanges}>
                  Rensa
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.lineItemsTableWrap}>
        <div className={styles.lineItemsTable}>
          <div className={styles.lineItemsHeaderRow}>
            {visibleColumns.map((column, columnIndex) => (
              <Typography
                key={column.key}
                className={`${styles.lineItemsHeaderCell} ${
                  columnIndex === 0 ? styles.stickyLineHeaderCell : ""
                }`}
              >
                {column.label}
              </Typography>
            ))}
          </div>

          {rows.map((row, index) => (
            <div
              key={`contract-row-${index}`}
              className={`${styles.lineItemsRow} ${selectedRow === index ? styles.lineItemsRowSelected : ""}`}
              onClick={() => selectRow(index)}
            >
              {visibleColumns.map((column, columnIndex) => (
                column.key === "idRad" ? (
                  <Typography
                    key={column.key}
                    className={`${styles.lineItemsCell} ${columnIndex === 0 ? styles.stickyLineCell : ""}`}
                  >
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
                  </Typography>
                ) : (
                  <Typography
                    key={column.key}
                    className={`${styles.lineItemsCell} ${columnIndex === 0 ? styles.stickyLineCell : ""}`}
                  >
                    {row[column.key]}
                  </Typography>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

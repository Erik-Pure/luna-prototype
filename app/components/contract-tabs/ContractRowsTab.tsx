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
};

const tableActionItems = [
  { label: "NY", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "TA BORT", icon: <DeleteOutlineOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "SKRIV UT", icon: <PrintOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "KOPIERA", icon: <ContentCopyOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "INAKTIVERA", icon: <BlockOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "ÄNDRA PRIS", icon: <EditOutlinedIcon fontSize="small" />, requiresSelection: true }
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
  onOpenRowDetail
}: ContractRowsTabProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const hasSelectedRows = selectedRows.length > 0;
  const allRowsSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someRowsSelected = selectedRows.length > 0 && !allRowsSelected;

  const activeActions = useMemo(
    () =>
      tableActionItems.map((item) => ({
        ...item,
        enabled: !item.requiresSelection || hasSelectedRows
      })),
    [hasSelectedRows]
  );

  const toggleRow = (rowIndex: number, checked: boolean) => {
    setSelectedRows((previous) => {
      if (checked) {
        return previous.includes(rowIndex) ? previous : [...previous, rowIndex];
      }
      return previous.filter((id) => id !== rowIndex);
    });
  };

  const toggleAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(rows.map((_, index) => index));
      return;
    }
    setSelectedRows([]);
  };

  return (
    <div className={styles.lineItemsSection}>
      <div className={styles.actionRow}>
        {activeActions.map((item, index) => (
          <div
            key={item.label}
            className={`${styles.actionItem} ${item.enabled ? styles.actionEnabled : styles.actionDisabled}`}
          >
            {item.icon}
            <Typography className={styles.actionLabel}>{item.label}</Typography>
            {index !== activeActions.length - 1 ? <span className={styles.actionSeparator} /> : null}
          </div>
        ))}
        <div className={`${styles.columnsMenuWrapper} ${styles.rightControlRail}`}>
          <Button
            ref={columnsButtonRef}
            className={styles.columnsButton}
            variant="outlined"
            size="small"
            startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
            onClick={isColumnsMenuOpen ? onCancelColumnsMenu : onOpenColumnsMenu}
          >
            KOLUMNER
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
                  SPARA
                </Button>
                <Button className={styles.dropdownCancel} size="small" onClick={onCancelColumnsMenu}>
                  AVBRYT
                </Button>
                <Button className={styles.dropdownClear} size="small" onClick={onResetColumnChanges}>
                  RENSA
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.lineItemsTableWrap}>
        <div className={styles.lineItemsTable}>
          <div className={styles.lineItemsHeaderRow}>
            <Checkbox
              size="small"
              className={`${styles.rowCheckbox} ${styles.stickyCheckboxHeader}`}
              checked={allRowsSelected}
              indeterminate={someRowsSelected}
              onChange={(event) => toggleAllRows(event.target.checked)}
            />
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
            <div key={`contract-row-${index}`} className={styles.lineItemsRow}>
              <Checkbox
                size="small"
                className={`${styles.rowCheckbox} ${styles.stickyCheckboxCell}`}
                checked={selectedRows.includes(index)}
                onChange={(event) => toggleRow(index, event.target.checked)}
              />
              {visibleColumns.map((column, columnIndex) => (
                column.key === "idRad" ? (
                  <button
                    key={column.key}
                    type="button"
                    className={`${styles.lineItemLinkButton} ${columnIndex === 0 ? styles.stickyLineCell : ""}`}
                    onClick={() => onOpenRowDetail(row[column.key])}
                  >
                    {row[column.key]}
                  </button>
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

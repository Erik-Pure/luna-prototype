"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { Button, Checkbox, IconButton, Typography } from "@mui/material";
import type { RefObject } from "react";
import styles from "../../page.module.scss";

type ColumnManagerItem = {
  key: string;
  label: string;
  visible: boolean;
  pinned?: boolean;
};

type ColumnManagerDropdownProps = {
  isOpen: boolean;
  columns: ColumnManagerItem[];
  menuRef: RefObject<HTMLDivElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
  onCancel: () => void;
  onToggleVisibility: (key: string) => void;
  onMove: (key: string, direction: "up" | "down") => void;
  onSave: () => void;
  onReset: () => void;
  onTogglePin?: (key: string) => void;
  buttonLabel?: string;
};

export function ColumnManagerDropdown({
  isOpen,
  columns,
  menuRef,
  buttonRef,
  onOpen,
  onCancel,
  onToggleVisibility,
  onMove,
  onSave,
  onReset,
  onTogglePin,
  buttonLabel = "Kolumner"
}: ColumnManagerDropdownProps) {
  return (
    <div className={styles.columnsMenuWrapper}>
      <Button
        ref={buttonRef}
        className={styles.columnsButton}
        variant="outlined"
        size="small"
        startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
        onClick={isOpen ? onCancel : onOpen}
      >
        {buttonLabel}
      </Button>

      {isOpen ? (
        <div className={styles.columnsDropdown} ref={menuRef}>
          <div className={styles.columnsDropdownList}>
            {columns.map((column, index) => (
              <div key={column.key} className={styles.columnsDropdownRow}>
                <button
                  type="button"
                  className={styles.columnsDropdownName}
                  onClick={() => onToggleVisibility(column.key)}
                >
                  <Checkbox size="small" checked={column.visible} className={styles.dropdownCheckbox} />
                  <Typography className={styles.columnsDropdownLabel}>{column.label}</Typography>
                </button>

                <div className={styles.columnsDropdownActions}>
                  {onTogglePin ? (
                    <IconButton
                      size="small"
                      onClick={() => onTogglePin(column.key)}
                      className={`${styles.columnsActionIcon} ${
                        column.pinned ? styles.columnsActionPinned : ""
                      }`}
                    >
                      {column.pinned ? (
                        <PushPinIcon fontSize="inherit" />
                      ) : (
                        <PushPinOutlinedIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  ) : null}
                  <IconButton
                    size="small"
                    className={styles.columnsActionIcon}
                    onClick={() => onMove(column.key, "up")}
                    disabled={index === 0}
                  >
                    <KeyboardArrowUpIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    className={styles.columnsActionIcon}
                    onClick={() => onMove(column.key, "down")}
                    disabled={index === columns.length - 1}
                  >
                    <KeyboardArrowDownIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.columnsDropdownFooter}>
            <Button className={styles.dropdownSave} size="small" onClick={onSave}>
              Spara
            </Button>
            <Button className={styles.dropdownCancel} size="small" onClick={onCancel}>
              Avbryt
            </Button>
            <Button className={styles.dropdownClear} size="small" onClick={onReset}>
              Rensa
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

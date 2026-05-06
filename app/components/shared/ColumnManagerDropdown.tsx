"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { Button, Checkbox, IconButton, Typography } from "@mui/material";
import { useState } from "react";
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
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);

  const reorderWithMoves = (fromKey: string, toKey: string) => {
    const fromIndex = columns.findIndex((column) => column.key === fromKey);
    const toIndex = columns.findIndex((column) => column.key === toKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const direction = fromIndex < toIndex ? "down" : "up";
    const stepCount = Math.abs(toIndex - fromIndex);

    for (let i = 0; i < stepCount; i += 1) {
      onMove(fromKey, direction);
    }
  };

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
            {columns.map((column) => (
              <div
                key={column.key}
                className={`${styles.columnsDropdownRow} ${draggedKey === column.key ? styles.columnsDropdownRowDragging : ""} ${dropTargetKey === column.key ? styles.columnsDropdownRowDropTarget : ""}`}
                draggable
                onDragStart={() => {
                  setDraggedKey(column.key);
                  setDropTargetKey(column.key);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dropTargetKey !== column.key) {
                    setDropTargetKey(column.key);
                  }
                }}
                onDragEnd={() => {
                  setDraggedKey(null);
                  setDropTargetKey(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedKey) {
                    reorderWithMoves(draggedKey, column.key);
                  }
                  setDraggedKey(null);
                  setDropTargetKey(null);
                }}
              >
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
                      className={`${styles.columnsActionIcon} ${column.pinned ? styles.columnsActionPinned : ""
                        }`}
                    >
                      {column.pinned ? (
                        <PushPinIcon fontSize="inherit" />
                      ) : (
                        <PushPinOutlinedIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  ) : null}
                  <span className={styles.columnsDragHandle} title="Dra för att ändra ordning">
                    <DragIndicatorIcon fontSize="inherit" />
                  </span>
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

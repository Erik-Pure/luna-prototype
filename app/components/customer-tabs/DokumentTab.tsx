"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ──────────────────────────────────────────────────────────────────────

type DokumentRow = {
  _id: string;
  namn: string;
  storlek: string;
  typ: string;
  datum: string;
  _url: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "namn",    label: "Filnamn" },
  { key: "typ",     label: "Typ" },
  { key: "storlek", label: "Storlek" },
  { key: "datum",   label: "Uppladdad" },
  { key: "_actions", label: "", pinnedRight: true, width: 80 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DokumentTab() {
  const [rows, setRows] = useState<DokumentRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const now = new Date();
    const newRows: DokumentRow[] = Array.from(files).map((file) => ({
      _id: `${Date.now()}-${Math.random()}`,
      namn: file.name,
      typ: file.type || "—",
      storlek: formatSize(file.size),
      datum: formatDate(now),
      _url: URL.createObjectURL(file),
    }));
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleOpen = (row: DokumentRow) => {
    window.open(row._url, "_blank", "noopener");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          margin: "16px 16px 0",
          border: `2px dashed ${dragging ? "#1976d2" : "#c8cdd5"}`,
          borderRadius: 8,
          padding: "28px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          background: dragging ? "#e8f1fc" : "#fafbfc",
          transition: "border-color 0.15s, background 0.15s",
          userSelect: "none",
        }}
      >
        <UploadFileOutlinedIcon style={{ fontSize: 36, color: dragging ? "#1976d2" : "#9aa0a9" }} />
        <Typography style={{ fontSize: 13, color: dragging ? "#1976d2" : "#5d6574", fontWeight: 500 }}>
          {dragging ? "Släpp filer här" : "Dra och släpp filer här, eller klicka för att välja"}
        </Typography>
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Table */}
      <div className={styles.lineItemsSection} style={{ margin: "12px 16px 16px" }}>
        <div className={styles.freightTable}>
          <DataTable
            variant="line"
            columns={COLUMNS}
            rows={rows}
            rowKey={(row) => row._id}
            selectedRowIndex={selectedRow}
            onRowClick={(i) => setSelectedRow(i === selectedRow ? null : i)}
            fillRemainingSpace
            renderCell={(row, col) => {
              if (col.key === "_actions") {
                return (
                  <span className={styles.freightActionCell}>
                    <Tooltip title="Öppna" placement="top">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(row); }}>
                        <OpenInNewIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ta bort" placement="top">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setRows((prev) => prev.filter((r) => r._id !== row._id)); }}>
                        <DeleteOutlineIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </Tooltip>
                  </span>
                );
              }
              return row[col.key as keyof DokumentRow] ?? "";
            }}
          />
        </div>
      </div>

    </div>
  );
}

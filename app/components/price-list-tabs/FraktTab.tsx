"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

type FraktRow = {
  _id: string;
  enhet: string;
  snittprisCLoad: string;
  bilJvgFrakt: string;
  valutaBilJvg: string;
  spedTermkostn: string;
  valutaSped: string;
  sjofr: string;
  valutaSjofr: string;
  fraktNetoSek: string;
  kalkylgrundande: boolean;
};

const ENHETER = [
  "BP Hammerdal Byggprodukter",
  "BP Hissmofors Byggprodukter",
  "BP Kåge Byggprodukter",
  "NT Hissmofors Såg",
  "NT Kåge Såg",
  "NT Stolpfabrik Agnäs",
  "NT Sävar Såg",
];

const INITIAL_ROWS: FraktRow[] = ENHETER.map((enhet, i) => ({
  _id: String(i + 1),
  enhet,
  snittprisCLoad: "",
  bilJvgFrakt: "",
  valutaBilJvg: "SEK",
  spedTermkostn: "",
  valutaSped: "SEK",
  sjofr: "",
  valutaSjofr: "SEK",
  fraktNetoSek: "",
  kalkylgrundande: false,
}));

const COLUMNS = [
  { key: "enhet", label: "Enhet", pinned: true },
  { key: "snittprisCLoad", label: "Snittpris i C-Load" },
  { key: "bilJvgFrakt", label: "BilJvgFrakt" },
  { key: "valutaBilJvg", label: "Valuta" },
  { key: "spedTermkostn", label: "Sped/Termkostn." },
  { key: "valutaSped", label: "Valuta" },
  { key: "sjofr", label: "Sjöfrakt" },
  { key: "valutaSjofr", label: "Valuta" },
  { key: "fraktNetoSek", label: "Total fraktkostnad" },
  { key: "kalkylgrundande", label: "Kalkylgrundande" },
  { key: "_actions", label: "", pinnedRight: true, width: 44 },
] satisfies Array<{ key: string; label: string; pinned?: boolean; pinnedRight?: boolean; width?: number }>;

const VALUTA_OPTIONS = ["SEK", "EUR", "NOK", "DKK", "USD"];

type Draft = Omit<FraktRow, "_id" | "enhet" | "snittprisCLoad">;
type EditingState = { row: FraktRow; draft: Draft };


export function FraktTab() {
  const [rows, setRows] = useState<FraktRow[]>(INITIAL_ROWS);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const openEdit = (row: FraktRow) => {
    setEditing({
      row,
      draft: {
        bilJvgFrakt: row.bilJvgFrakt,
        valutaBilJvg: row.valutaBilJvg,
        spedTermkostn: row.spedTermkostn,
        valutaSped: row.valutaSped,
        sjofr: row.sjofr,
        valutaSjofr: row.valutaSjofr,
        fraktNetoSek: row.fraktNetoSek,
        kalkylgrundande: row.kalkylgrundande,
      },
    });
  };

  const setDraftStr = (key: keyof Draft, value: string) =>
    setEditing((prev) => prev ? { ...prev, draft: { ...prev.draft, [key]: value } } : prev);

  const setDraftBool = (key: keyof Draft, value: boolean) =>
    setEditing((prev) => prev ? { ...prev, draft: { ...prev.draft, [key]: value } } : prev);

  const handleSave = () => {
    if (!editing) return;
    setRows((prev) =>
      prev.map((r) => r._id === editing.row._id ? { ...r, ...editing.draft } : r)
    );
    setEditing(null);
  };

  return (
    <>
      <div className={styles.tablesLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={COLUMNS}
                rows={rows}
                rowKey={(row) => row._id}
                renderCell={(row, col) => {
                  if (col.key === "_actions") {
                    return (
                      <Tooltip title="Redigera">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
                          <EditOutlinedIcon style={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    );
                  }
                  if (col.key === "kalkylgrundande") return row.kalkylgrundande ? "Ja" : "–";
                  const val = row[col.key as keyof FraktRow];
                  return typeof val === "boolean" ? "–" : (val || "–");
                }}
              />
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        {editing ? (
          <>
            <DialogTitle sx={{ pb: 2 }}>
              <Typography fontWeight={600} fontSize={15}>Redigera frakt</Typography>
              <Typography fontSize={12} color="text.secondary" mt={0}>{editing.row.enhet}</Typography>
            </DialogTitle>
            <DialogContent>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <TextField fullWidth size="small" label="BilJvgFrakt" value={editing.draft.bilJvgFrakt} onChange={(e) => setDraftStr("bilJvgFrakt", e.target.value)} />
                  <TextField select size="small" label="Valuta" value={editing.draft.valutaBilJvg} onChange={(e) => setDraftStr("valutaBilJvg", e.target.value)} sx={{ minWidth: 88 }}>
                    {VALUTA_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <TextField fullWidth size="small" label="Sped/Termkostn." value={editing.draft.spedTermkostn} onChange={(e) => setDraftStr("spedTermkostn", e.target.value)} />
                  <TextField select size="small" label="Valuta" value={editing.draft.valutaSped} onChange={(e) => setDraftStr("valutaSped", e.target.value)} sx={{ minWidth: 88 }}>
                    {VALUTA_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <TextField fullWidth size="small" label="Sjöfrakt" value={editing.draft.sjofr} onChange={(e) => setDraftStr("sjofr", e.target.value)} />
                  <TextField select size="small" label="Valuta" value={editing.draft.valutaSjofr} onChange={(e) => setDraftStr("valutaSjofr", e.target.value)} sx={{ minWidth: 88 }}>
                    {VALUTA_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </div>
                <TextField fullWidth size="small" label="Total fraktkostnad" value={editing.draft.fraktNetoSek} onChange={(e) => setDraftStr("fraktNetoSek", e.target.value)} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(0,0,0,0.23)", borderRadius: 7, padding: "6px 12px 6px 8px", cursor: "pointer" }}>
                  <Checkbox size="small" checked={editing.draft.kalkylgrundande} onChange={(e) => setDraftBool("kalkylgrundande", e.target.checked)} sx={{ p: 0 }} />
                  <Typography className={styles.searchCheckboxLabel}>Kalkylgrundande</Typography>
                </label>
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleSave} className={styles.contractSaveButton}>
                Spara
              </Button>
              <Button size="small" onClick={() => setEditing(null)} className={styles.contractQuickActionButton}>
                Avbryt
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </>
  );
}

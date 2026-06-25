"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Button,
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
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ──────────────────────────────────────────────────────────────────────

type KontaktloggRow = {
  _id: string;
  datum: string;
  typ: string;
  fritext: string;
  anvandTid: string;
  anvandare: string;
};

type KontaktloggDraft = Omit<KontaktloggRow, "_id">;

// ── Constants ─────────────────────────────────────────────────────────────────

const TYP_OPTIONS = ["Telefon", "E-post", "Möte", "Besök", "Brev", "Övrigt"];

const ANVANDARE_OPTIONS = [
  "Anna Svensson",
  "Erik Lindqvist",
  "Maria Johansson",
  "Peter Karlsson",
  "Sofia Nilsson",
];

const COLUMNS = [
  { key: "datum",     label: "Datum" },
  { key: "typ",       label: "Typ" },
  { key: "fritext",   label: "Fritext" },
  { key: "anvandTid", label: "Använd tid" },
  { key: "anvandare", label: "Användare" },
  { key: "_actions",  label: "", pinnedRight: true, width: 112 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

const EMPTY_DRAFT: KontaktloggDraft = {
  datum: "",
  typ: "",
  fritext: "",
  anvandTid: "",
  anvandare: "",
};

// ── Dialog ────────────────────────────────────────────────────────────────────

function NyKontaktloggDialog({ open, onClose, onSave, initialDraft, title = "Ny kontaktlogg" }: {
  open: boolean;
  onClose: () => void;
  onSave: (d: KontaktloggDraft) => void;
  initialDraft?: KontaktloggDraft;
  title?: string;
}) {
  const initH = initialDraft?.anvandTid ? Number(initialDraft.anvandTid.split(":")[0]) : "";
  const initM = initialDraft?.anvandTid ? Number(initialDraft.anvandTid.split(":")[1]) : "";

  const [draft, setDraft] = useState<KontaktloggDraft>(initialDraft ?? EMPTY_DRAFT);
  const [tidH, setTidH] = useState<number | "">(initH);
  const [tidM, setTidM] = useState<number | "">(initM);

  const set = (key: keyof KontaktloggDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const canSave =
    draft.datum.trim() !== "" &&
    draft.typ.trim() !== "" &&
    tidH !== "" &&
    tidM !== "" &&
    draft.anvandare.trim() !== "";

  const handleSave = () => {
    const tid = `${String(tidH).padStart(2, "0")}:${String(tidM).padStart(2, "0")}`;
    onSave({ ...draft, anvandTid: tid });
    setDraft(EMPTY_DRAFT);
    setTidH("");
    setTidM("");
    onClose();
  };

  const handleClose = () => {
    setDraft(EMPTY_DRAFT);
    setTidH("");
    setTidM("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { className: styles.freightDialogPaper } }}
    >
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={handleClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <TextField
              fullWidth
              size="small"
              label="Datum"
              type="date"
              value={draft.datum}
              onChange={(e) => set("datum", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              className={styles.lineItemRequiredControl}
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Typ"
              value={draft.typ}
              onChange={(e) => set("typ", e.target.value)}
              className={styles.lineItemRequiredControl}
            >
              <MenuItem value=""><em style={{ color: "#6a7483" }}>—</em></MenuItem>
              {TYP_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </div>
          <TextField
            fullWidth
            size="small"
            label="Fritext"
            multiline
            rows={3}
            value={draft.fritext}
            onChange={(e) => set("fritext", e.target.value)}
          />
          <div>
            <Typography style={{ fontSize: 12, color: "#6a7483", marginBottom: 12 }}>Använd tid</Typography>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TextField
                size="small"
                label="Timmar"
                type="number"
                value={tidH}
                onChange={(e) => setTidH(e.target.value === "" ? "" : Math.max(0, Math.min(99, Number(e.target.value))))}
                slotProps={{ htmlInput: { min: 0, max: 99, style: { width: 52, textAlign: "center" } } }}
                className={styles.lineItemRequiredControl}
              />
              <Typography style={{ fontSize: 18, fontWeight: 500, color: "#2f3743", lineHeight: 1 }}>:</Typography>
              <TextField
                size="small"
                label="Minuter"
                type="number"
                value={tidM}
                onChange={(e) => setTidM(e.target.value === "" ? "" : Math.max(0, Math.min(59, Number(e.target.value))))}
                slotProps={{ htmlInput: { min: 0, max: 59, style: { width: 52, textAlign: "center" } } }}
                className={styles.lineItemRequiredControl}
              />
            </div>
          </div>
          <TextField
            select
            fullWidth
            size="small"
            label="Användare"
            value={draft.anvandare}
            onChange={(e) => set("anvandare", e.target.value)}
            className={styles.lineItemRequiredControl}
          >
            <MenuItem value=""><em style={{ color: "#6a7483" }}>—</em></MenuItem>
            {ANVANDARE_OPTIONS.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
        </div>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button
          size="small"
          className={styles.freightSaveButton}
          disabled={!canSave}
          onClick={handleSave}
        >
          Spara
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={handleClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── View dialog ───────────────────────────────────────────────────────────────

function ViewKontaktloggDialog({ open, onClose, row }: {
  open: boolean; onClose: () => void; row: KontaktloggRow | null;
}) {
  if (!row) return null;
  const fields: { label: string; value: string }[] = [
    { label: "Datum",       value: row.datum },
    { label: "Typ",         value: row.typ },
    { label: "Fritext",     value: row.fritext },
    { label: "Använd tid",  value: row.anvandTid },
    { label: "Användare",   value: row.anvandare },
  ];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Kontaktlogg</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
          {fields.map(({ label, value }) => (
            <div key={label}>
              <Typography style={{ fontSize: 11, color: "#6a7483", marginBottom: 2 }}>{label}</Typography>
              <Typography style={{ fontSize: 13, color: "#2f3743" }}>{value || "—"}</Typography>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Stäng</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function KontaktloggTab() {
  const [rows, setRows] = useState<KontaktloggRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewRow, setViewRow] = useState<KontaktloggRow | null>(null);
  const [editRow, setEditRow] = useState<KontaktloggRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className={styles.lineItemsSection}>
        <ActionRow
          items={[{
            label: "Kontaktlogg",
            icon: <AddIcon fontSize="small" />,
            tone: "primary",
            onClick: () => setDialogOpen(true),
          }]}
        />
        <div style={{ display: "table", width: "100%" }}>
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
                  <Tooltip title="Visa" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setViewRow(row); }}>
                      <VisibilityOutlinedIcon className={styles.freightActionIcon} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Redigera" placement="top">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditRow(row); }}>
                      <EditOutlinedIcon className={styles.freightActionIcon} />
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
            return row[col.key as keyof KontaktloggRow] ?? "";
          }}
        />
        </div>
      </div>

      <NyKontaktloggDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(d) => setRows((prev) => [...prev, { ...d, _id: String(Date.now()) }])}
      />
      <NyKontaktloggDialog
        key={editRow?._id ?? "edit"}
        open={editRow !== null}
        onClose={() => setEditRow(null)}
        initialDraft={editRow ?? undefined}
        title="Redigera kontaktlogg"
        onSave={(d) => {
          setRows((prev) => prev.map((r) => r._id === editRow!._id ? { ...d, _id: editRow!._id } : r));
          setEditRow(null);
        }}
      />
      <ViewKontaktloggDialog
        open={viewRow !== null}
        onClose={() => setViewRow(null)}
        row={viewRow}
      />
    </div>
  );
}

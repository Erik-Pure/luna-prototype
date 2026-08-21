"use client";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
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
  Divider,
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

type AltAdressDraft = {
  namn: string;
  adress1: string;
  adress2: string;
  postadress: string;
  land: string;
  telefon: string;
  leveransort: string;
  postnr: string;
  oppettider: string;
  aviseringstelefon: string;
  aviseringsinformation: string;
  tillfalligAviseringsinformation: string;
  tillfalligFran: string;
  tillfalligTom: string;
  giltigFran: string;
  giltigTom: string;
};

type AltAdressRow = AltAdressDraft & { _id: string };

type LeveransDraft = {
  leveransort: string;
  postnr: string;
  oppettider: string;
  aviseringstelefon: string;
  aviseringsinformation: string;
  tillfalligAviseringsinformation: string;
  tillfalligFran: string;
  tillfalligTom: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const EMPTY_DRAFT: LeveransDraft = {
  leveransort: "",
  postnr: "",
  oppettider: "",
  aviseringstelefon: "",
  aviseringsinformation: "",
  tillfalligAviseringsinformation: "",
  tillfalligFran: "",
  tillfalligTom: "",
};

type LeveransortOption = { ort: string; postnr: string; land: string };

const LEVERANSORTER: LeveransortOption[] = [
  { ort: "Stockholm", postnr: "111 22", land: "SE" },
  { ort: "Göteborg", postnr: "411 01", land: "SE" },
  { ort: "Malmö", postnr: "211 19", land: "SE" },
  { ort: "Uppsala", postnr: "751 05", land: "SE" },
  { ort: "Sundsvall", postnr: "851 06", land: "SE" },
  { ort: "Umeå", postnr: "901 01", land: "SE" },
  { ort: "Luleå", postnr: "971 31", land: "SE" },
  { ort: "Oslo", postnr: "0154", land: "NO" },
  { ort: "Helsinki", postnr: "00100", land: "FI" },
];

const THREE_COL = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" } as const;

const EMPTY_ALT_DRAFT: AltAdressDraft = {
  namn: "", adress1: "", adress2: "", postadress: "", land: "", telefon: "",
  leveransort: "", postnr: "",
  oppettider: "", aviseringstelefon: "", aviseringsinformation: "",
  tillfalligAviseringsinformation: "", tillfalligFran: "", tillfalligTom: "",
  giltigFran: "", giltigTom: "",
};

const INITIAL_ALT_ROWS: AltAdressRow[] = [
  {
    _id: "0",
    namn: "Leveransadress",
    adress1: "Industrivägen 5",
    adress2: "",
    postadress: "456 78 Göteborg",
    land: "SE",
    telefon: "",
    leveransort: "",
    postnr: "",
    oppettider: "",
    aviseringstelefon: "",
    aviseringsinformation: "",
    tillfalligAviseringsinformation: "",
    tillfalligFran: "",
    tillfalligTom: "",
    giltigFran: "",
    giltigTom: "",
  },
];

const LAND_OPTIONS = [
  { value: "SE", label: "SE — Sverige" },
  { value: "NO", label: "NO — Norge" },
  { value: "FI", label: "FI — Finland" },
  { value: "DK", label: "DK — Danmark" },
  { value: "DE", label: "DE — Tyskland" },
  { value: "EE", label: "EE — Estland" },
];

const ALT_ADRESS_COLUMNS = [
  { key: "namn", label: "Namn" },
  { key: "adress1", label: "Adress" },
  { key: "adress2", label: "Adress 2" },
  { key: "postadress", label: "Postadress" },
  { key: "land", label: "Land" },
  { key: "telefon", label: "Telefon" },
  { key: "aviseringstelefon", label: "Aviseringstelefon" },
  { key: "leveransort", label: "Leveransort" },
  { key: "giltigFran", label: "Giltig fr.o.m" },
  { key: "giltigTom", label: "Giltig t.o.m" },
  { key: "_actions", label: "", pinnedRight: true, width: 112 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

// ── Sub-components ─────────────────────────────────────────────────────────────

const ROField = ({ label, value, helperText, style }: {
  label: string; value: string; helperText?: string; style?: React.CSSProperties;
}) => (
  <TextField
    fullWidth size="small" label={label} value={value} helperText={helperText}
    style={style}
    slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)", borderWidth: 1 },
      },
      "& .MuiInputBase-input": { cursor: "default", color: "#2f3743" },
    }}
  />
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography style={{ fontSize: 13, fontWeight: 600, color: "#2f3743", marginBottom: 10 }}>
      {children}
    </Typography>
  );
}

function LeveransortSelect({ value, onChange }: { value: string; onChange: (ort: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField
        select fullWidth size="small" label="Leveransort" value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ select: { renderValue: (v) => v as string } }}
        sx={value ? { "& .MuiSelect-select": { paddingRight: "56px !important" } } : undefined}
      >
        <MenuItem disabled sx={{ opacity: 1, pointerEvents: "none", py: "2px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 50px", width: "100%", gap: 8 }}>
            <Typography style={{ fontSize: 11, fontWeight: 700, color: "#000000" }}>Ort</Typography>
            <Typography style={{ fontSize: 11, fontWeight: 700, color: "#000000" }}>Postnr</Typography>
            <Typography style={{ fontSize: 11, fontWeight: 700, color: "#000000" }}>Land</Typography>
          </div>
        </MenuItem>
        <Divider />
        {LEVERANSORTER.map((o) => (
          <MenuItem key={o.ort} value={o.ort}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 50px", width: "100%", gap: 8 }}>
              <Typography style={{ fontSize: 13 }}>{o.ort}</Typography>
              <Typography style={{ fontSize: 13, color: "#6a7483" }}>{o.postnr}</Typography>
              <Typography style={{ fontSize: 13, color: "#6a7483" }}>{o.land}</Typography>
            </div>
          </MenuItem>
        ))}
      </TextField>
      {value && (
        <IconButton
          size="small"
          aria-label="Rensa"
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          style={{ position: "absolute", right: 28, top: 4, padding: 4, color: "#6a7483" }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </div>
  );
}

function NyAlternativAdressDialog({ open, onClose, onSave, initialDraft, title = "Ny alternativ leveransadress" }: {
  open: boolean; onClose: () => void; onSave: (d: AltAdressDraft) => void;
  initialDraft?: AltAdressDraft; title?: string;
}) {
  const [draft, setDraft] = useState<AltAdressDraft>(initialDraft ?? EMPTY_ALT_DRAFT);

  const set = (key: keyof AltAdressDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleOrtChange = (ort: string) => {
    const option = LEVERANSORTER.find((o) => o.ort === ort);
    setDraft((prev) => ({ ...prev, leveransort: ort, postnr: option?.postnr ?? "" }));
  };

  const canSave = draft.namn.trim() !== "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>{title}</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4 }}>

          <div>
            <SectionLabel>Allmänt</SectionLabel>
            <div style={THREE_COL}>
              <TextField fullWidth size="small" label="Namn" value={draft.namn}
                onChange={(e) => set("namn", e.target.value)}
                className={styles.lineItemRequiredControl} />
              <TextField fullWidth size="small" label="Adress" value={draft.adress1}
                onChange={(e) => set("adress1", e.target.value)} />
              <TextField fullWidth size="small" label="Adress 2" value={draft.adress2}
                onChange={(e) => set("adress2", e.target.value)} />
              <TextField fullWidth size="small" label="Postadress" value={draft.postadress}
                onChange={(e) => set("postadress", e.target.value)} />
              <TextField select fullWidth size="small" label="Land" value={draft.land}
                onChange={(e) => set("land", e.target.value)}>
                <MenuItem value="">—</MenuItem>
                {LAND_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <TextField fullWidth size="small" label="Telefon" value={draft.telefon}
                onChange={(e) => set("telefon", e.target.value)} />
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel>Transport</SectionLabel>
            <div style={THREE_COL}>
              <LeveransortSelect value={draft.leveransort} onChange={handleOrtChange} />
              <TextField fullWidth size="small" label="Postnr" value={draft.postnr}
                slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)", borderWidth: 1 },
                  },
                  "& .MuiInputBase-input": { cursor: "default", color: "#2f3743" },
                }} />
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel>Lossning</SectionLabel>
            <div style={THREE_COL}>
              <TextField fullWidth size="small" label="Öppettider" helperText="Visas på fraktsedeln"
                value={draft.oppettider} onChange={(e) => set("oppettider", e.target.value)} />
              <TextField fullWidth size="small" label="Aviseringstelefon"
                value={draft.aviseringstelefon} onChange={(e) => set("aviseringstelefon", e.target.value)} />
              <TextField fullWidth size="small" label="Aviseringsinformation" multiline rows={3}
                helperText="Visas på fraktsedel, skickas till C-Load"
                value={draft.aviseringsinformation} onChange={(e) => set("aviseringsinformation", e.target.value)}
                style={{ gridColumn: "1 / -1" }} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation" multiline rows={3}
                value={draft.tillfalligAviseringsinformation} onChange={(e) => set("tillfalligAviseringsinformation", e.target.value)}
                style={{ gridColumn: "1 / -1" }} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation giltig från"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.tillfalligFran} onChange={(e) => set("tillfalligFran", e.target.value)} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation giltig till"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.tillfalligTom} onChange={(e) => set("tillfalligTom", e.target.value)} />
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel>Övrigt</SectionLabel>
            <div style={THREE_COL}>
              <TextField fullWidth size="small" label="Giltig från"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.giltigFran} onChange={(e) => set("giltigFran", e.target.value)} />
              <TextField fullWidth size="small" label="Giltig till"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.giltigTom} onChange={(e) => set("giltigTom", e.target.value)} />
            </div>
          </div>

        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} disabled={!canSave}
          onClick={() => { onSave(draft); onClose(); }}>Spara</Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Avbryt</Button>
      </DialogActions>
    </Dialog>
  );
}

function TransportLossningDialog({ open, onClose, onSave, initialDraft }: {
  open: boolean; onClose: () => void; onSave: (d: LeveransDraft) => void; initialDraft: LeveransDraft;
}) {
  const [draft, setDraft] = useState<LeveransDraft>(initialDraft);

  const set = (key: keyof LeveransDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleOrtChange = (ort: string) => {
    const option = LEVERANSORTER.find((o) => o.ort === ort);
    setDraft((prev) => ({ ...prev, leveransort: ort, postnr: option?.postnr ?? "" }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Redigera transport &amp; lossning</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4 }}>

          <div>
            <SectionLabel>Transport</SectionLabel>
            <div style={THREE_COL}>
              <LeveransortSelect value={draft.leveransort} onChange={handleOrtChange} />
              <ROField label="Postnr" value={draft.postnr} />
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel>Lossning</SectionLabel>
            <div style={THREE_COL}>
              <TextField fullWidth size="small" label="Öppettider" helperText="Visas på fraktsedeln"
                value={draft.oppettider} onChange={(e) => set("oppettider", e.target.value)} />
              <TextField fullWidth size="small" label="Aviseringstelefon"
                value={draft.aviseringstelefon} onChange={(e) => set("aviseringstelefon", e.target.value)} />
              <TextField fullWidth size="small" label="Aviseringsinformation" multiline rows={3}
                helperText="Visas på fraktsedel, skickas till C-Load"
                value={draft.aviseringsinformation} onChange={(e) => set("aviseringsinformation", e.target.value)}
                style={{ gridColumn: "1 / -1" }} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation" multiline rows={3}
                value={draft.tillfalligAviseringsinformation} onChange={(e) => set("tillfalligAviseringsinformation", e.target.value)}
                style={{ gridColumn: "1 / -1" }} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation giltig från"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.tillfalligFran} onChange={(e) => set("tillfalligFran", e.target.value)} />
              <TextField fullWidth size="small" label="Tillfällig aviseringsinformation giltig till"
                type="date" slotProps={{ inputLabel: { shrink: true } }}
                value={draft.tillfalligTom} onChange={(e) => set("tillfalligTom", e.target.value)} />
            </div>
          </div>

        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton}
          onClick={() => { onSave(draft); onClose(); }}>Spara</Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Avbryt</Button>
      </DialogActions>
    </Dialog>
  );
}

function ViewAltAdressDialog({ open, onClose, row }: {
  open: boolean; onClose: () => void; row: AltAdressRow | null;
}) {
  if (!row) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>{row.namn || "Alternativ leveransadress"}</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4 }}>
          <div>
            <SectionLabel>Allmänt</SectionLabel>
            <div style={THREE_COL}>
              <ROField label="Namn" value={row.namn} />
              <ROField label="Adress" value={row.adress1} />
              <ROField label="Adress 2" value={row.adress2} />
              <ROField label="Postadress" value={row.postadress} />
              <ROField label="Land" value={row.land} />
              <ROField label="Telefon" value={row.telefon} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Transport</SectionLabel>
            <div style={THREE_COL}>
              <ROField label="Leveransort" value={row.leveransort} />
              <ROField label="Postnr" value={row.postnr} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Lossning</SectionLabel>
            <div style={THREE_COL}>
              <ROField label="Öppettider" value={row.oppettider} helperText="Visas på fraktsedeln" />
              <ROField label="Aviseringstelefon" value={row.aviseringstelefon} />
              <ROField label="Aviseringsinformation" value={row.aviseringsinformation} helperText="Visas på fraktsedel, skickas till C-Load" style={{ gridColumn: "1 / -1" }} />
              <ROField label="Tillfällig aviseringsinformation" value={row.tillfalligAviseringsinformation} style={{ gridColumn: "1 / -1" }} />
              <ROField label="Tillfällig aviseringsinformation giltig från" value={row.tillfalligFran} />
              <ROField label="Tillfällig aviseringsinformation giltig till" value={row.tillfalligTom} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Övrigt</SectionLabel>
            <div style={THREE_COL}>
              <ROField label="Giltig från" value={row.giltigFran} />
              <ROField label="Giltig till" value={row.giltigTom} />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Stäng</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LeveransTab() {
  const [saved, setSaved] = useState<LeveransDraft>(EMPTY_DRAFT);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [altRows, setAltRows] = useState<AltAdressRow[]>(INITIAL_ALT_ROWS);
  const [selectedAltRow, setSelectedAltRow] = useState<number | null>(null);
  const [nyDialogOpen, setNyDialogOpen] = useState(false);
  const [nyDialogKey, setNyDialogKey] = useState(0);
  const [viewRow, setViewRow] = useState<AltAdressRow | null>(null);
  const [editRow, setEditRow] = useState<AltAdressRow | null>(null);

  const fmt = (val: string) => val || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%", minHeight: 0, overflow: "hidden" }}>
      <div className={styles.contractFlatSection} style={{ maxWidth: 1000, margin: "0 auto", width: "100%", gap: 16, flexShrink: 0 }}>

        {/* ── Transport & Lossning ── */}
        <div className={styles.contractDataSection} style={{ padding: 16, background: "#fafafa" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Typography className={styles.contractSectionTitle}>Transport &amp; Lossning</Typography>
            <Button variant="contained" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={() => setEditDialogOpen(true)}>
              Redigera
            </Button>
          </div>

          <div style={THREE_COL}>
            <ROField label="Leveransort" value={fmt(saved.leveransort)} />
            <ROField label="Postnr" value={fmt(saved.postnr)} />
            <ROField label="Öppettider" value={fmt(saved.oppettider)} helperText="Visas på fraktsedeln" />
          </div>

          <div style={{ ...THREE_COL, marginTop: 8 }}>
            <ROField label="Aviseringstelefon" value={fmt(saved.aviseringstelefon)} />
            <ROField label="Aviseringsinformation" value={fmt(saved.aviseringsinformation)} helperText="Visas på fraktsedel, skickas till C-Load" style={{ gridColumn: "1 / -1" }} />
            <ROField label="Tillfällig aviseringsinformation" value={fmt(saved.tillfalligAviseringsinformation)} style={{ gridColumn: "1 / -1" }} />
            <ROField label="Tillfällig aviseringsinformation giltig från" value={fmt(saved.tillfalligFran)} />
            <ROField label="Tillfällig aviseringsinformation giltig till" value={fmt(saved.tillfalligTom)} />
          </div>
        </div>

      </div>

      <TransportLossningDialog
        key={editDialogOpen ? "open" : "closed"}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        initialDraft={saved}
        onSave={(d) => setSaved(d)}
      />

      {/* ── Alternativa leveransadresser ── */}
      <div className={`${styles.lineItemsSection} ${styles.lineItemsSectionFill}`}>
        {/* <Typography className={styles.contractSectionTitle} style={{ padding: "4px 12px 4px 0" }}>
          Alternativa leveransadresser
        </Typography> */}
        <ActionRow
          items={[{
            label: "Alternativ leveransadress",
            icon: <AddIcon fontSize="small" />,
            tone: "primary",
            onClick: () => { setNyDialogKey((k) => k + 1); setNyDialogOpen(true); },
          }]}
        />
        <div className={styles.tableScrollWrap}>
          <div className={styles.tableInner}>
            <DataTable
              variant="main"
              columns={ALT_ADRESS_COLUMNS}
              rows={altRows}
              rowKey={(row) => row._id}
              selectedRowIndex={selectedAltRow}
              onRowClick={(i) => setSelectedAltRow(i === selectedAltRow ? null : i)}
              fillRemainingSpace
              renderCell={(row, col) => {
                if (col.key === "namn" && row.namn === "Leveransadress") {
                  return <span style={{ fontWeight: 700 }}>{row.namn}</span>;
                }
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
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAltRows((prev) => prev.filter((r) => r._id !== row._id)); }}>
                          <DeleteOutlineIcon className={styles.freightActionIcon} />
                        </IconButton>
                      </Tooltip>
                    </span>
                  );
                }
                return row[col.key as keyof AltAdressRow] ?? "";
              }}
            />
          </div>
        </div>
      </div>

      <NyAlternativAdressDialog
        key={nyDialogKey}
        open={nyDialogOpen}
        onClose={() => setNyDialogOpen(false)}
        onSave={(d) => setAltRows((prev) => [...prev, { ...d, _id: String(Date.now()) }])}
      />
      <NyAlternativAdressDialog
        key={editRow?._id ?? "edit"}
        open={editRow !== null}
        onClose={() => setEditRow(null)}
        initialDraft={editRow ?? undefined}
        title="Redigera alternativ leveransadress"
        onSave={(d) => {
          setAltRows((prev) => prev.map((r) => r._id === editRow!._id ? { ...d, _id: editRow!._id } : r));
          setEditRow(null);
        }}
      />
      <ViewAltAdressDialog
        open={viewRow !== null}
        onClose={() => setViewRow(null)}
        row={viewRow}
      />
    </div>
  );
}

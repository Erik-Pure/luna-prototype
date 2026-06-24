"use client";

import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ──────────────────────────────────────────────────────────────────────

type LimitDraft = {
  kreditforsakradBelopp: string;
  kreditforsakradFrom: string;
  internLimitBelopp: string;
  internLimitTom: string;
  beslutadAv: string;
};

type LassRow = {
  lassNr: string;
  bolag: string;
  levererad: string;
  godkandDatum: string;
  volym: string;
};

type FordranRow = {
  kundnr: string;
  kund: string;
  kreditforsakringsbelopp: string;
  internLimit: string;
  internLimitTom: string;
  antFordran: string;
  belFordran: string;
  antForfalletT: string;
  belForfalletT: string;
  antForf3_14: string;
  belForf3_14: string;
  antForf15_19: string;
  belForf15_19: string;
  antForf20: string;
  belForf20: string;
  utlastning202625: string;
  utlastning202626: string;
  utlastning202627: string;
  utlastning202628: string;
  tilhorKundnr: string;
  ediFaktura: string;
  senastHamtad: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const EMPTY_DRAFT: LimitDraft = {
  kreditforsakradBelopp: "",
  kreditforsakradFrom: "",
  internLimitBelopp: "",
  internLimitTom: "",
  beslutadAv: "",
};

const BESLUTAT_AV_OPTIONS = ["Anna Svensson", "Björn Lindgren", "Erik Andersson", "Maria Lindqvist"];

const KREDITHISTORIK = [
  { belopp: "500 000", from: "2024-01-01", tom: "2024-12-31" },
  { belopp: "450 000", from: "2023-01-01", tom: "2023-12-31" },
  { belopp: "400 000", from: "2022-01-01", tom: "2022-12-31" },
];

const LASS_COLUMNS = [
  { key: "lassNr",      label: "LassNr" },
  { key: "bolag",       label: "Bolag" },
  { key: "levererad",   label: "Levererad" },
  { key: "godkandDatum",label: "Godkänd datum" },
  { key: "volym",       label: "Volym" },
] satisfies Array<{ key: string; label: string }>;

const LASS_ROWS: LassRow[] = [
  { lassNr: "L-00421", bolag: "Norra Timber", levererad: "2026-06-10", godkandDatum: "2026-06-12", volym: "42,3" },
  { lassNr: "L-00418", bolag: "Norra Timber", levererad: "2026-06-08", godkandDatum: "2026-06-09", volym: "38,7" },
  { lassNr: "L-00415", bolag: "Norra Skog",   levererad: "2026-06-05", godkandDatum: "2026-06-06", volym: "50,1" },
];

const FORDRAN_EX_RANTA_COLUMNS = [
  { key: "kundnr",                  label: "Kundnr",                  width: 80 },
  { key: "kund",                    label: "Kund",                    width: 160 },
  { key: "kreditforsakringsbelopp", label: "Kreditförsäkringsbelopp", width: 130 },
  { key: "internLimit",             label: "Intern limit",            width: 100 },
  { key: "internLimitTom",          label: "Intern limit t.o.m.",     width: 120 },
  { key: "antFordran",              label: "Ant fordran",             width: 90 },
  { key: "belFordran",              label: "Bel fordran",             width: 90 },
  { key: "antForfalletT",           label: "Ant förfallet",           width: 90 },
  { key: "belForfalletT",           label: "Bel förfallet",           width: 90 },
  { key: "antForf3_14",             label: "Ant förf 3-14",           width: 90 },
  { key: "belForf3_14",             label: "Bel förf 3-14",           width: 90 },
  { key: "antForf15_19",            label: "Ant förf 15-19",          width: 90 },
  { key: "belForf15_19",            label: "Bel förf 15-19",          width: 90 },
  { key: "antForf20",               label: "Ant förf 20-",            width: 90 },
  { key: "belForf20",               label: "Bel förf 20-",            width: 90 },
  { key: "utlastning202625",        label: "Utlastning 202625",       width: 110 },
  { key: "utlastning202626",        label: "Utlastning 202626",       width: 110 },
  { key: "utlastning202627",        label: "Utlastning 202627",       width: 110 },
  { key: "utlastning202628",        label: "Utlastning 202628",       width: 110 },
  { key: "tilhorKundnr",            label: "Tillhör kundnr",          width: 100 },
  { key: "ediFaktura",              label: "EDI Faktura",             width: 90 },
  { key: "senastHamtad",            label: "Senast hämtad",           width: 110 },
] satisfies Array<{ key: string; label: string; width?: number }>;

const FORDRAN_EX_RANTA_ROWS: FordranRow[] = [
  {
    kundnr: "10042", kund: "Stocka Emballage AB", kreditforsakringsbelopp: "500 000",
    internLimit: "450 000", internLimitTom: "2026-12-31",
    antFordran: "14", belFordran: "126 400",
    antForfalletT: "2", belForfalletT: "18 200",
    antForf3_14: "1", belForf3_14: "9 800",
    antForf15_19: "1", belForf15_19: "8 400",
    antForf20: "0", belForf20: "0",
    utlastning202625: "42 300", utlastning202626: "38 700",
    utlastning202627: "50 100", utlastning202628: "0",
    tilhorKundnr: "—", ediFaktura: "Ja", senastHamtad: "2026-06-15",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function KredithistorikDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Historik – Kreditförsäkrad</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#6a7483" }}>Belopp</TableCell>
              <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#6a7483" }}>Datum, from</TableCell>
              <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#6a7483" }}>Datum, tom</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {KREDITHISTORIK.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell style={{ fontSize: 13 }}>{row.belopp}</TableCell>
                <TableCell style={{ fontSize: 13 }}>{row.from}</TableCell>
                <TableCell style={{ fontSize: 13 }}>{row.tom}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Stäng</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial: LimitDraft; onClose: () => void; onSave: (d: LimitDraft) => void;
}) {
  const [draft, setDraft] = useState<LimitDraft>(initial);
  const set = (key: keyof LimitDraft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Redigera kredituppgifter</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4 }}>
          <div className={styles.contractModernFormGrid}>
            <TextField fullWidth size="small" label="Kreditförsäkrad – belopp" type="number"
              value={draft.kreditforsakradBelopp} onChange={(e) => set("kreditforsakradBelopp", e.target.value)} />
            <TextField fullWidth size="small" label="fr.o.m" type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.kreditforsakradFrom} onChange={(e) => set("kreditforsakradFrom", e.target.value)} />
            <TextField fullWidth size="small" label="Intern limit – belopp" type="number"
              value={draft.internLimitBelopp} onChange={(e) => set("internLimitBelopp", e.target.value)} />
            <TextField fullWidth size="small" label="t.o.m" type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.internLimitTom} onChange={(e) => set("internLimitTom", e.target.value)} />
            <TextField select fullWidth size="small" label="Beslutad av"
              value={draft.beslutadAv} onChange={(e) => set("beslutadAv", e.target.value)}
              style={{ gridColumn: "1 / -1" }}>
              <MenuItem value=""><em>—</em></MenuItem>
              {BESLUTAT_AV_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </div>
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} onClick={() => { onSave(draft); onClose(); }}>Spara</Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>Avbryt</Button>
      </DialogActions>
    </Dialog>
  );
}

const ROField = ({ label, value }: { label: string; value: string }) => (
  <TextField fullWidth size="small" label={label} value={value}
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

function TableSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.avropTableSection} style={{ minHeight: 0, flex: "none" }}>
      <div className={styles.avropTableHeader}>
        <Typography className={styles.avropTableTitle}>{title}</Typography>
      </div>
      <div className={styles.lineItemsSection}>
        <div className={styles.lineItemsTableWrap}>
          <div className={styles.lineItemsTable}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FordranTab() {
  const [saved, setSaved] = useState<LimitDraft>(EMPTY_DRAFT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [historikOpen, setHistorikOpen] = useState(false);
  const [selectedLass, setSelectedLass] = useState<number | null>(null);
  const [selectedFordran, setSelectedFordran] = useState<number | null>(null);

  const fmt = (val: string) => val || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Top overview ── */}
      <div className={styles.contractFlatSection} style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <div className={styles.contractDataSection}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Typography className={styles.contractSectionTitle}>Kredituppgifter</Typography>
            <Button variant="contained" size="small" startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => { setOpenCount((c) => c + 1); setDialogOpen(true); }}>
              Redigera
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <TextField fullWidth size="small" label="Kreditförsäkrad" value={fmt(saved.kreditforsakradBelopp)}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setHistorikOpen(true)} title="Visa historik">
                        <HistoryOutlinedIcon style={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)", borderWidth: 1 },
                },
                "& .MuiInputBase-input": { cursor: "default", color: "#2f3743" },
              }}
            />
            <ROField label="fr.o.m" value={fmt(saved.kreditforsakradFrom)} />
            <ROField label="Intern limit" value={fmt(saved.internLimitBelopp)} />
            <ROField label="t.o.m" value={fmt(saved.internLimitTom)} />
            <ROField label="Beslutad av" value={fmt(saved.beslutadAv)} />
          </div>
        </div>

        <hr className={styles.contractFlatDivider} />

        <Typography className={styles.contractSectionTitle} style={{ marginBottom: 10 }}>Fordran</Typography>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
          <ROField label="Belopp" value="126 400" />
          <ROField label="Antal" value="14" />
          <ROField label="Varav ränta – belopp" value="1 820" />
          <ROField label="Varav ränta – antal" value="3" />
        </div>

        <hr className={styles.contractFlatDivider} />

        <Typography className={styles.contractSectionTitle} style={{ marginBottom: 10 }}>Förfallet</Typography>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
          <ROField label="Belopp" value="18 200" />
          <ROField label="Antal" value="2" />
          <ROField label="Varav ränta – belopp" value="310" />
          <ROField label="Varav ränta – antal" value="1" />
        </div>

        <hr className={styles.contractFlatDivider} />

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Typography style={{ fontSize: 12, color: "#6a7483" }}>Reskontra senast hämtad:</Typography>
          <Typography style={{ fontSize: 12, color: "#2f3743", fontWeight: 600 }}>2026-06-15</Typography>
        </div>
      </div>

      {/* ── Tabell 1: Lass ── */}
      <div style={{ padding: "0 18px" }}>
        <TableSection title="Utlastade eller utlastningsspärrade godkända lass som inte är fakturerade">
          <DataTable
            variant="line"
            columns={LASS_COLUMNS}
            rows={LASS_ROWS as unknown as Array<Record<string, string | undefined>>}
            rowKey={(_row, i) => `lass-${i}`}
            selectedRowIndex={selectedLass}
            onRowClick={(i) => setSelectedLass((prev) => (prev === i ? null : i))}
          />
        </TableSection>
      </div>

      {/* ── Tabell 2: Fordran exkl. ränta ── */}
      <div style={{ padding: "16px 18px 0" }}>
        <TableSection title="Fordran exklusive ränta">
          <DataTable
            variant="line"
            columns={FORDRAN_EX_RANTA_COLUMNS}
            rows={FORDRAN_EX_RANTA_ROWS as unknown as Array<Record<string, string | undefined>>}
            rowKey={(_row, i) => `fordran-${i}`}
            selectedRowIndex={selectedFordran}
            onRowClick={(i) => setSelectedFordran((prev) => (prev === i ? null : i))}
          />
        </TableSection>
      </div>

      <EditDialog key={openCount} open={dialogOpen} initial={saved}
        onClose={() => setDialogOpen(false)} onSave={setSaved} />
      <KredithistorikDialog open={historikOpen} onClose={() => setHistorikOpen(false)} />
    </div>
  );
}

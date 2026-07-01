"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataTable } from "./shared/DataTable";
import styles from "../page.module.scss";

// ── Options ────────────────────────────────────────────────────────────────────

const KUND_OPTIONS = [
  "Acme AB",
  "Globex Corp",
  "Initech HB",
  "Nordic Sten & Mark AB",
  "Luna Infrastruktur AB",
  "Skandinavisk Industriservice",
];

const PRODUKT_OPTIONS = [
  "22x95 Gran Ytterpanel",
  "22x120 Gran Ytterpanel",
  "50x225 Furu VI",
  "50x200 Furu V",
  "Gran flisad spå",
  "Furu hyvlad",
];

const PAKETTYP_OPTIONS = ["LP", "Pk", "Halvlängd", "Kapping", "Kombi", "Special"];

// ── Types ──────────────────────────────────────────────────────────────────────

type TriState = true | false | null;

type EdiRow = {
  _id: string;
  kund: string;
  artNrKund: string;
  benamningKund: string;
  produktILuna: string;
  pakettyp: string;
  langd: string;
  aktiv: string;
  langdMin: string;
  langdMax: string;
};

type EditDraft = {
  kund: string;
  produktILuna: string;
  langd: string;
  aktiv: string;
  langdMin: string;
  langdMax: string;
};

type ProduktSettings = {
  pakettyp: string;
  paketHojd: string;
  paketBredd: string;
  paketAntal: string;
  medellangd: string;
};

// ── Table columns ──────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "kund", label: "Kund", width: 200 },
  { key: "artNrKund", label: "ArtNr Kund", width: 110 },
  { key: "benamningKund", label: "Benämning Kund", width: 200 },
  { key: "produktILuna", label: "Produkt i Luna", width: 200 },
  { key: "pakettyp", label: "Pakettyp", width: 100 },
  { key: "paketHojd", label: "PaketHöjd", width: 90 },
  { key: "paketBredd", label: "PaketBredd", width: 90 },
  { key: "paketAntal", label: "PaketAntal", width: 90 },
  { key: "medellangd", label: "Medellängd", width: 90 },
  { key: "langd", label: "Längd", width: 80 },
  { key: "aktiv", label: "Aktiv", width: 70 },
  { key: "langdMin", label: "Längd min", width: 90 },
  { key: "langdMax", label: "Längd max", width: 90 },
  { key: "_actions", label: "", width: 48 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

const PRODUKT_SETTINGS_KEYS = new Set<string>(["paketHojd", "paketBredd", "paketAntal", "medellangd"]);

// ── Mock data ──────────────────────────────────────────────────────────────────

let nextId = 6;

const INITIAL_ROWS: EdiRow[] = [
  {
    _id: "1", kund: "Acme AB", artNrKund: "AC-9920", benamningKund: "Ytterpanel 22x95",
    produktILuna: "22x95 Gran Ytterpanel", pakettyp: "LP", langd: "3.6",
    aktiv: "Ja", langdMin: "3.0", langdMax: "4.2",
  },
  {
    _id: "2", kund: "Acme AB", artNrKund: "AC-9922", benamningKund: "Ytterpanel 22x120",
    produktILuna: "22x120 Gran Ytterpanel", pakettyp: "LP", langd: "4.2",
    aktiv: "Ja", langdMin: "3.6", langdMax: "5.1",
  },
  {
    _id: "3", kund: "Globex Corp", artNrKund: "GX-0441", benamningKund: "Furu panel 50x225",
    produktILuna: "50x225 Furu VI", pakettyp: "Pk", langd: "5.1",
    aktiv: "Ja", langdMin: "4.5", langdMax: "5.4",
  },
  {
    _id: "4", kund: "Nordic Sten & Mark AB", artNrKund: "NSM-812",
    benamningKund: "Gran spå flisad", produktILuna: "Gran flisad spå", pakettyp: "Halvlängd", langd: "2.4",
    aktiv: "Nej", langdMin: "1.8", langdMax: "3.0",
  },
  {
    _id: "5", kund: "Luna Infrastruktur AB", artNrKund: "LI-3301", benamningKund: "Furu hyvlad 50x200",
    produktILuna: "50x200 Furu V", pakettyp: "LP", langd: "4.8",
    aktiv: "Ja", langdMin: "4.2", langdMax: "5.4",
  },
];

const EMPTY_PRODUKT_SETTINGS: ProduktSettings = {
  pakettyp: "", paketHojd: "", paketBredd: "", paketAntal: "", medellangd: "",
};

const INITIAL_PRODUKT_SETTINGS: Record<string, ProduktSettings> = {
  "22x95 Gran Ytterpanel": { pakettyp: "LP", paketHojd: "35", paketBredd: "95", paketAntal: "80", medellangd: "3.8" },
  "22x120 Gran Ytterpanel": { pakettyp: "LP", paketHojd: "35", paketBredd: "120", paketAntal: "64", medellangd: "4.0" },
  "50x225 Furu VI": { pakettyp: "Pk", paketHojd: "45", paketBredd: "225", paketAntal: "20", medellangd: "5.0" },
  "50x200 Furu V": { pakettyp: "LP", paketHojd: "45", paketBredd: "200", paketAntal: "24", medellangd: "4.8" },
  "Gran flisad spå": { pakettyp: "Halvlängd", paketHojd: "30", paketBredd: "100", paketAntal: "120", medellangd: "2.5" },
  "Furu hyvlad": { pakettyp: "Pk", paketHojd: "40", paketBredd: "150", paketAntal: "50", medellangd: "3.6" },
};

// ── Read-only field helper ─────────────────────────────────────────────────────

function ROField({ label, value }: { label: string; value: string }) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
      sx={{
        opacity: 0.45,
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)", borderWidth: 1 },
        },
        "& .MuiInputBase-input": { cursor: "default", color: "#2f3743" },
      }}
    />
  );
}

// ── Section divider ────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1", margin: "4px 0 0" }}>
      <Typography style={{ fontSize: 11, fontWeight: 700, color: "#8a93a0", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <div style={{ flex: 1, height: 1, background: "#e8ecf2" }} />
    </div>
  );
}

// ── Edit dialog ────────────────────────────────────────────────────────────────

function EditDialog({
  open,
  row,
  produktSettings,
  onClose,
  onSave,
}: {
  open: boolean;
  row: EdiRow | null;
  produktSettings: Record<string, ProduktSettings>;
  onClose: () => void;
  onSave: (id: string, draft: EditDraft, produktDraft: ProduktSettings) => void;
}) {
  const [draft, setDraft] = useState<EditDraft>({
    kund: row?.kund ?? "",
    produktILuna: row?.produktILuna ?? "",
    langd: row?.langd ?? "",
    aktiv: row?.aktiv ?? "Ja",
    langdMin: row?.langdMin ?? "",
    langdMax: row?.langdMax ?? "",
  });

  const [produktDraft, setProduktDraft] = useState<ProduktSettings>(
    produktSettings[row?.produktILuna ?? ""] ?? EMPTY_PRODUKT_SETTINGS
  );

  const set = (key: keyof EditDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (key === "produktILuna") {
      setProduktDraft(produktSettings[value] ?? EMPTY_PRODUKT_SETTINGS);
    }
  };

  const setP = (key: keyof ProduktSettings, value: string) =>
    setProduktDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { className: styles.freightDialogPaper } }}
    >
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>
            Redigera EDI-koppling
          </Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 4 }}>

          {/* EDI-fält */}
          <TextField
            select fullWidth size="small" label="Kund"
            value={draft.kund}
            onChange={(e) => set("kund", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {KUND_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <ROField label="ArtNr Kund" value={row?.artNrKund ?? ""} />
          <ROField label="Benämning Kund" value={row?.benamningKund ?? ""} />
          <TextField
            select fullWidth size="small" label="Produkt i Luna"
            value={draft.produktILuna}
            onChange={(e) => set("produktILuna", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {PRODUKT_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth size="small" label="Längd"
            value={draft.langd}
            onChange={(e) => set("langd", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select fullWidth size="small" label="Aktiv"
            value={draft.aktiv}
            onChange={(e) => set("aktiv", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value="Ja">Ja</MenuItem>
            <MenuItem value="Nej">Nej</MenuItem>
          </TextField>
          <TextField
            fullWidth size="small" label="Längd min"
            value={draft.langdMin}
            onChange={(e) => set("langdMin", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth size="small" label="Längd max"
            value={draft.langdMax}
            onChange={(e) => set("langdMax", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Produktinställningar */}
          <SectionDivider label="Produktinformation" />
          <TextField
            select fullWidth size="small" label="Pakettyp"
            value={produktDraft.pakettyp}
            onChange={(e) => setP("pakettyp", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {PAKETTYP_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth size="small" label="PaketHöjd"
            value={produktDraft.paketHojd}
            onChange={(e) => setP("paketHojd", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth size="small" label="PaketBredd"
            value={produktDraft.paketBredd}
            onChange={(e) => setP("paketBredd", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth size="small" label="PaketAntal"
            value={produktDraft.paketAntal}
            onChange={(e) => setP("paketAntal", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth size="small" label="Medellängd"
            value={produktDraft.medellangd}
            onChange={(e) => setP("medellangd", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button
          size="small"
          className={styles.freightSaveButton}
          onClick={() => { if (row) onSave(row._id, draft, produktDraft); onClose(); }}
        >
          Spara
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EdiListaView() {
  // Search filter state
  const [kund, setKund] = useState("");
  const [produkt, setProdukt] = useState("");
  const [utanProdukt, setUtanProdukt] = useState<TriState>(null);
  const [aktiv, setAktiv] = useState<TriState>(null);

  const cycleTriState = (setter: (fn: (prev: TriState) => TriState) => void) => {
    setter((prev) => (prev === null ? true : prev === true ? false : null));
  };

  const clearAll = () => {
    setKund(""); setProdukt(""); setUtanProdukt(null); setAktiv(null);
  };

  // Table state
  const [rows, setRows] = useState<EdiRow[]>(INITIAL_ROWS);
  const [produktSettings, setProduktSettings] = useState<Record<string, ProduktSettings>>(INITIAL_PRODUKT_SETTINGS);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<EdiRow | null>(null);

  const handleSave = (id: string, draft: EditDraft, produktDraft: ProduktSettings) => {
    const newProdukt = draft.produktILuna;
    setProduktSettings((prev) => ({ ...prev, [newProdukt]: produktDraft }));
    setRows((prev) =>
      prev.map((r) => {
        if (r._id === id) return { ...r, ...draft, pakettyp: produktDraft.pakettyp };
        if (r.produktILuna === newProdukt) return { ...r, pakettyp: produktDraft.pakettyp };
        return r;
      })
    );
  };

  return (
    <>
      {/* Search filters */}
      <div className={styles.filterRow}>
        <div className={styles.advancedSearchPanel}>
          <div className={styles.advancedFiltersContainer}>
            <div className={`${styles.advancedFiltersHeader} ${styles.advancedFiltersHeaderCompact}`}>
              <span />
              <div className={styles.advancedFiltersHeaderActions}>
                <button
                  type="button"
                  className={styles.advancedFiltersClearIconButton}
                  title="Rensa filter"
                  aria-label="Rensa filter"
                  onClick={clearAll}
                >
                  <RestartAltIcon />
                </button>
              </div>
            </div>
            <div className={styles.advancedFiltersBody}>
              <div className={styles.advancedFiltersGrid}>
                <FormControl size="small" className={styles.searchFieldControl}>
                  <InputLabel>Kund</InputLabel>
                  <Select
                    value={kund}
                    label="Kund"
                    onChange={(e) => setKund(e.target.value)}
                    IconComponent={KeyboardArrowDownIcon}
                  >
                    <MenuItem value="">-</MenuItem>
                    {KUND_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" className={styles.searchFieldControl}>
                  <InputLabel>Produkt (Kund)</InputLabel>
                  <Select
                    value={produkt}
                    label="Produkt (Kund)"
                    onChange={(e) => setProdukt(e.target.value)}
                    IconComponent={KeyboardArrowDownIcon}
                  >
                    <MenuItem value="">-</MenuItem>
                    {PRODUKT_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <label
                  className={styles.klarSokGridCheckbox}
                  onClick={() => cycleTriState(setUtanProdukt)}
                >
                  <Checkbox
                    size="small"
                    checked={utanProdukt === true}
                    indeterminate={utanProdukt === false}
                    readOnly
                  />
                  <Typography className={styles.searchCheckboxLabel}>Utan produkt</Typography>
                </label>
                <label
                  className={styles.klarSokGridCheckbox}
                  onClick={() => cycleTriState(setAktiv)}
                >
                  <Checkbox
                    size="small"
                    checked={aktiv === true}
                    indeterminate={aktiv === false}
                    readOnly
                  />
                  <Typography className={styles.searchCheckboxLabel}>Aktiv</Typography>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableScrollWrap}>
          <div className={styles.tableInner}>
            <DataTable
              variant="main"
              columns={COLUMNS}
              rows={rows}
              rowKey={(row) => row._id}
              selectedRowIndex={selectedRowIndex}
              onRowClick={(i) => setSelectedRowIndex((prev) => (prev === i ? null : i))}
              fillRemainingSpace
              renderCell={(row, column) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRow(row);
                        }}
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                if (PRODUKT_SETTINGS_KEYS.has(column.key)) {
                  return produktSettings[row.produktILuna]?.[column.key as keyof ProduktSettings] ?? "";
                }
                return row[column.key as keyof EdiRow] ?? "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <EditDialog
        key={editingRow?._id ?? "none"}
        open={editingRow !== null}
        row={editingRow}
        produktSettings={produktSettings}
        onClose={() => setEditingRow(null)}
        onSave={handleSave}
      />
    </>
  );
}

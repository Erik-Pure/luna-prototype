"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ──────────────────────────────────────────────────────────────────────

type AvropFields = {
  extAvropsnr: string;
  avropsdatum: string;
  status: string;
};

type AvropSummary = {
  levveckaMin: string;
  avropadVolym: string;
  leveradVolym: string;
  resterandeVolym: string;
  enhet: string;
};

type AvropsradRow = {
  avropsradNr: string;
  avropsradsstatus: string;
  enhet: string;
  fakturatext: string;
  pakettyp: string;
  mangd: string;
  bestelldEnhet: string;
  volym: string;
  lev: string;
  avropsrest: string;
  levvecka: string;
  emballage: string;
  bunt: string;
  folie: string;
  internKommentar: string;
  externKommentar: string;
  kundmarke: string;
  certifiering: string;
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL_FIELDS: AvropFields = {
  extAvropsnr: "EXT-001",
  avropsdatum: "2025-04-01",
  status: "Aktiv",
};

const SUMMARY: AvropSummary = {
  levveckaMin: "202630",
  avropadVolym: "6543",
  leveradVolym: "0",
  resterandeVolym: "6543",
  enhet: "m³",
};

const INITIAL_AVROPSRADER: AvropsradRow[] = [
  {
    avropsradNr: "1",
    avropsradsstatus: "Aktiv",
    enhet: "m³",
    fakturatext: "Gran 22x100",
    pakettyp: "Paket",
    mangd: "500",
    bestelldEnhet: "m³",
    volym: "500",
    lev: "15",
    avropsrest: "100",
    levvecka: "15",
    emballage: "Ja",
    bunt: "Nej",
    folie: "Nej",
    internKommentar: "",
    externKommentar: "",
    kundmarke: "KM-001",
    certifiering: "FSC",
  },
  {
    avropsradNr: "2",
    avropsradsstatus: "Aktiv",
    enhet: "m³",
    fakturatext: "Gran 22x125",
    pakettyp: "Paket",
    mangd: "700",
    bestelldEnhet: "m³",
    volym: "700",
    lev: "15",
    avropsrest: "300",
    levvecka: "15",
    emballage: "Ja",
    bunt: "Nej",
    folie: "Ja",
    internKommentar: "Prioriterat",
    externKommentar: "",
    kundmarke: "KM-002",
    certifiering: "PEFC",
  },
];

// ── Column definitions ─────────────────────────────────────────────────────────

const AVROPSRAD_COLUMNS = [
  { key: "avropsradNr", label: "Avropsrad nr" },
  { key: "avropsradsstatus", label: "Avropsradsstatus" },
  { key: "enhet", label: "Enhet" },
  { key: "fakturatext", label: "Fakturatext" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "mangd", label: "Mängd" },
  { key: "bestelldEnhet", label: "Beställd enhet" },
  { key: "volym", label: "Volym" },
  { key: "lev", label: "Lev" },
  { key: "avropsrest", label: "Avropsrest" },
  { key: "levvecka", label: "Levvecka" },
  { key: "emballage", label: "Emballage" },
  { key: "bunt", label: "Bunt" },
  { key: "folie", label: "Folie" },
  { key: "internKommentar", label: "Intern kommentar" },
  { key: "externKommentar", label: "Extern kommentar" },
  { key: "kundmarke", label: "Kundmärke" },
  { key: "certifiering", label: "Certifiering" },
];

// ── Edit dialog ────────────────────────────────────────────────────────────────

type EditAvropDialogProps = {
  open: boolean;
  onClose: () => void;
  fields: AvropFields;
  onSave: (fields: AvropFields) => void;
};

function EditAvropDialog({ open, onClose, fields, onSave }: EditAvropDialogProps) {
  const [extAvropsnr, setExtAvropsnr] = useState(fields.extAvropsnr);
  const [avropsdatum, setAvropsdatum] = useState(fields.avropsdatum);
  const [status, setStatus] = useState(fields.status);

  const handleSave = () => {
    onSave({ extAvropsnr, avropsdatum, status });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth classes={{ paper: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <span>Redigera avrop</span>
        </div>
      </DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "row", gap: 16, paddingTop: 8 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Ext avropsnr</Typography>
          <TextField
            value={extAvropsnr}
            onChange={(e) => setExtAvropsnr(e.target.value)}
            size="small"
            fullWidth
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Avropsdatum</Typography>
          <TextField
            value={avropsdatum}
            onChange={(e) => setAvropsdatum(e.target.value)}
            size="small"
            type="date"
            fullWidth
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Status</Typography>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} size="small" fullWidth>
            <MenuItem value="Aktiv">Aktiv</MenuItem>
            <MenuItem value="Pausad">Pausad</MenuItem>
            <MenuItem value="Genomförd">Genomförd</MenuItem>
            <MenuItem value="Avbruten">Avbruten</MenuItem>
          </Select>
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} onClick={handleSave}>
          Spara
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Edit avropsrad dialog ──────────────────────────────────────────────────────

type EditAvropsradDialogProps = {
  open: boolean;
  onClose: () => void;
  row: AvropsradRow;
  onSave: (row: AvropsradRow) => void;
};

function EditAvropsradDialog({ open, onClose, row, onSave }: EditAvropsradDialogProps) {
  const [draft, setDraft] = useState<AvropsradRow>(row);

  const set = (field: keyof AvropsradRow) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const field = (label: string, key: keyof AvropsradRow) => (
    <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 4 }}>
      <Typography className={styles.searchFieldLabel}>{label}</Typography>
      <TextField value={draft[key]} onChange={set(key)} size="small" fullWidth />
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth classes={{ paper: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <span>Redigera avropsrad {row.avropsradNr}</span>
        </div>
      </DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {field("Avropsradsstatus", "avropsradsstatus")}
          {field("Enhet", "enhet")}
          {field("Fakturatext", "fakturatext")}
          {field("Pakettyp", "pakettyp")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {field("Mängd", "mangd")}
          {field("Beställd enhet", "bestelldEnhet")}
          {field("Volym", "volym")}
          {field("Levvecka", "levvecka")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {field("Emballage", "emballage")}
          {field("Bunt", "bunt")}
          {field("Folie", "folie")}
          {field("Kundmärke", "kundmarke")}
          {field("Certifiering", "certifiering")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {field("Intern kommentar", "internKommentar")}
          {field("Extern kommentar", "externKommentar")}
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} onClick={handleSave}>
          Spara
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main CallOffTab ────────────────────────────────────────────────────────────

export function CallOffTab() {
  const [fields, setFields] = useState<AvropFields>(INITIAL_FIELDS);
  const [avropsrader, setAvropsrader] = useState<AvropsradRow[]>(INITIAL_AVROPSRADER);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null);

  const summaryItems: { label: string; value: string; total?: string; unit?: string }[] = [
    { label: "Levvecka (min)", value: SUMMARY.levveckaMin },
    { label: "Avropad volym", value: SUMMARY.avropadVolym },
    { label: "Levererad volym", value: SUMMARY.leveradVolym, total: SUMMARY.avropadVolym, unit: SUMMARY.enhet },
    { label: "Resterande volym", value: SUMMARY.resterandeVolym },
  ];

  return (
    <div className={styles.callOffTabLayout}>
      {/* ── Summary card ── */}
      <div className={styles.avropSummaryWrap}>
        <div className={styles.avropSummaryCard}>
          {summaryItems.map(({ label, value, total, unit }) => (
            <div key={label} className={styles.avropSummaryItem}>
              <div className={styles.avropSummaryLabel}>{label}</div>
              <div className={styles.avropSummaryValue}>
                {value}
                {total !== undefined ? (
                  <span className={styles.avropSummaryValueFraction}>/ {total}{unit ? ` ${unit}` : ""}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.avropDivider} />
      {/* ── Fields row (centered) with edit button above ── */}
      <div className={styles.avropFieldsWrap}>
        <div className={styles.avropFieldsCard}>

          <div className={styles.avropFieldsGrid}>
            <div className={styles.avropFieldItem}>
              <div className={styles.avropSummaryLabel}>Ext avropsnr</div>
              <div className={styles.avropFieldValue}>{fields.extAvropsnr || "—"}</div>
            </div>
            <div className={styles.avropFieldItem}>
              <div className={styles.avropSummaryLabel}>Avropsdatum</div>
              <div className={styles.avropFieldValue}>{fields.avropsdatum || "—"}</div>
            </div>
            <div className={styles.avropFieldItem}>
              <div className={styles.avropSummaryLabel}>Status</div>
              <div className={styles.avropFieldValue}>{fields.status}</div>
            </div>
            <div className={styles.avropFieldsEditBar}>
              <Tooltip title="Redigera" placement="top">
                <IconButton
                  size="small"
                  className={styles.contractHeaderDotsButton}
                  onClick={() => setEditOpen(true)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* ── Avropsrader table ── */}
      <div className={styles.avropTableSection}>
        <div className={styles.avropTableHeader}>
          <Typography className={styles.avropTableTitle}>Avropsrader</Typography>
          <Tooltip title="Uppdatera" placement="top">
            <IconButton size="small" className={styles.contractHeaderDotsButton}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div className={styles.lineItemsTableWrap}>
          <div className={styles.lineItemsTable}>
            <DataTable
              variant="line"
              columns={AVROPSRAD_COLUMNS}
              rows={avropsrader as unknown as Array<Record<string, string | undefined>>}
              rowKey={(_row, index) => `avropsrad-${index}`}
              selectedRowIndex={selectedRow}
              onRowClick={(index) => setSelectedRow((prev) => (prev === index ? null : index))}
              renderCell={(_row, column) => _row[column.key]}
            />
          </div>
        </div>
      </div>

      {editOpen && (
        <EditAvropDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          fields={fields}
          onSave={setFields}
        />
      )}

      {editRowIndex !== null && (
        <EditAvropsradDialog
          open={editRowIndex !== null}
          onClose={() => setEditRowIndex(null)}
          row={avropsrader[editRowIndex]}
          onSave={(updated) => {
            setAvropsrader((prev) =>
              prev.map((r, i) => (i === editRowIndex ? updated : r))
            );
          }}
        />
      )}
    </div>
  );
}

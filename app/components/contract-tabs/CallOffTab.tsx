"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Button,
  Chip,
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
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ──────────────────────────────────────────────────────────────────────

type AvropRow = {
  avropsnr: string;
  leveranskund: string;
  kontraktsnr: string;
  extAvropsnr: string;
  avropsdatum: string;
  status: string;
  levveckaMin: string;
  avropadVolym: string;
  leveradVolym: string;
  resterandeVolym: string;
  registreradAv: string;
};

type AvropsradRow = {
  artikelnr: string;
  produkt: string;
  avropadMangd: string;
  leveradMangd: string;
  resterandeMangd: string;
  levvecka: string;
  enhet: string;
  status: string;
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL_AVROP: AvropRow[] = [
  {
    avropsnr: "A-2025-001",
    leveranskund: "Stocka Emballage",
    kontraktsnr: "K-2025-001",
    extAvropsnr: "EXT-001",
    avropsdatum: "2025-04-01",
    status: "Aktiv",
    levveckaMin: "15",
    avropadVolym: "1 200 m³",
    leveradVolym: "800 m³",
    resterandeVolym: "400 m³",
    registreradAv: "Tobias Albertsson",
  },
  {
    avropsnr: "A-2025-002",
    leveranskund: "Stocka Emballage",
    kontraktsnr: "K-2025-001",
    extAvropsnr: "EXT-002",
    avropsdatum: "2025-04-15",
    status: "Aktiv",
    levveckaMin: "18",
    avropadVolym: "900 m³",
    leveradVolym: "0 m³",
    resterandeVolym: "900 m³",
    registreradAv: "Tobias Albertsson",
  },
  {
    avropsnr: "A-2024-031",
    leveranskund: "Stocka Emballage",
    kontraktsnr: "K-2024-088",
    extAvropsnr: "",
    avropsdatum: "2024-12-05",
    status: "Genomförd",
    levveckaMin: "50",
    avropadVolym: "620 m³",
    leveradVolym: "620 m³",
    resterandeVolym: "0 m³",
    registreradAv: "Anna Lindqvist",
  },
];

const INITIAL_AVROPSRADER: Record<string, AvropsradRow[]> = {
  "A-2025-001": [
    { artikelnr: "101-22-100", produkt: "Gran 22x100", avropadMangd: "500 m³", leveradMangd: "400 m³", resterandeMangd: "100 m³", levvecka: "15", enhet: "m³", status: "Aktiv" },
    { artikelnr: "101-22-125", produkt: "Gran 22x125", avropadMangd: "700 m³", leveradMangd: "400 m³", resterandeMangd: "300 m³", levvecka: "15", enhet: "m³", status: "Aktiv" },
  ],
  "A-2025-002": [
    { artikelnr: "101-22-100", produkt: "Gran 22x100", avropadMangd: "900 m³", leveradMangd: "0 m³", resterandeMangd: "900 m³", levvecka: "18", enhet: "m³", status: "Aktiv" },
  ],
  "A-2024-031": [
    { artikelnr: "102-28-150", produkt: "Furu 28x150", avropadMangd: "620 m³", leveradMangd: "620 m³", resterandeMangd: "0 m³", levvecka: "50", enhet: "m³", status: "Genomförd" },
  ],
};

const MOCK_CONTRACT_ARTICLES = [
  { artikelnr: "101-22-100", produkt: "Gran 22x100" },
  { artikelnr: "101-22-125", produkt: "Gran 22x125" },
  { artikelnr: "102-28-150", produkt: "Furu 28x150" },
  { artikelnr: "104-38-095", produkt: "Gran 38x95" },
];

// ── Column definitions ─────────────────────────────────────────────────────────

const AVROP_COLUMNS = [
  { key: "avropsnr", label: "Avropsnr" },
  { key: "leveranskund", label: "Kund" },
  { key: "kontraktsnr", label: "Kontraktsnr" },
  { key: "extAvropsnr", label: "Ext avropsnr" },
  { key: "avropsdatum", label: "Avropsdatum" },
  { key: "status", label: "Status" },
  { key: "levveckaMin", label: "Levvecka (min)" },
  { key: "avropadVolym", label: "Avropad volym" },
  { key: "leveradVolym", label: "Levererad volym" },
  { key: "resterandeVolym", label: "Resterande volym" },
  { key: "registreradAv", label: "Registrerad av" },
];

const AVROPSRAD_COLUMNS = [
  { key: "artikelnr", label: "Artikelnr" },
  { key: "produkt", label: "Produkt" },
  { key: "avropadMangd", label: "Avropad mängd" },
  { key: "leveradMangd", label: "Levererad mängd" },
  { key: "resterandeMangd", label: "Resterande mängd" },
  { key: "levvecka", label: "Levvecka" },
  { key: "enhet", label: "Beställd enhet" },
  { key: "status", label: "Status" },
];

const STATUS_COLOR_MAP: Record<string, "default" | "success" | "warning" | "error"> = {
  Aktiv: "success",
  Genomförd: "default",
  Pausad: "warning",
  Avbruten: "error",
};

// ── Skapa avrop dialog ─────────────────────────────────────────────────────────

type CreateAvropDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (avrop: AvropRow) => void;
  nextNr: string;
};

function CreateAvropDialog({ open, onClose, onSave, nextNr }: CreateAvropDialogProps) {
  const [leveranskund, setLeveranskund] = useState("Stocka Emballage");
  const [extAvropsnr, setExtAvropsnr] = useState("");
  const [avropsdatum, setAvropsdatum] = useState("");
  const [levveckaMin, setLevveckaMin] = useState("");
  const [status, setStatus] = useState("Aktiv");

  const handleSave = () => {
    onSave({
      avropsnr: nextNr,
      leveranskund,
      kontraktsnr: "K-2025-001",
      extAvropsnr,
      avropsdatum: avropsdatum || new Date().toISOString().slice(0, 10),
      status,
      levveckaMin,
      avropadVolym: "0 m³",
      leveradVolym: "0 m³",
      resterandeVolym: "0 m³",
      registreradAv: "Tobias Albertsson",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth classes={{ paper: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <span>Skapa avrop</span>
        </div>
      </DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Kund*</Typography>
          <Select value={leveranskund} onChange={(e) => setLeveranskund(e.target.value)} size="small" className={styles.searchFieldControl}>
            <MenuItem value="Stocka Emballage">Stocka Emballage</MenuItem>
            <MenuItem value="Billerud Korsnäs">Billerud Korsnäs</MenuItem>
            <MenuItem value="SCA Timber">SCA Timber</MenuItem>
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Ext avropsnr</Typography>
          <TextField
            value={extAvropsnr}
            onChange={(e) => setExtAvropsnr(e.target.value)}
            size="small"
            className={styles.searchFieldControl}
            placeholder="Externt avropsnummer"
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography className={styles.searchFieldLabel}>Avropsdatum</Typography>
            <TextField
              value={avropsdatum}
              onChange={(e) => setAvropsdatum(e.target.value)}
              size="small"
              type="date"
              className={styles.searchFieldControl}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography className={styles.searchFieldLabel}>Levvecka (min)</Typography>
            <TextField
              value={levveckaMin}
              onChange={(e) => setLevveckaMin(e.target.value)}
              size="small"
              placeholder="t.ex. 15"
              className={styles.searchFieldControl}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Status</Typography>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} size="small" className={styles.searchFieldControl}>
            <MenuItem value="Aktiv">Aktiv</MenuItem>
            <MenuItem value="Pausad">Pausad</MenuItem>
            <MenuItem value="Genomförd">Genomförd</MenuItem>
            <MenuItem value="Avbruten">Avbruten</MenuItem>
          </Select>
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} onClick={handleSave}>
          Skapa avrop
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Skapa avropsrad dialog ─────────────────────────────────────────────────────

type CreateAvropsradDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (rad: AvropsradRow) => void;
};

function CreateAvropsradDialog({ open, onClose, onSave }: CreateAvropsradDialogProps) {
  const [artikelnr, setArtikelnr] = useState(MOCK_CONTRACT_ARTICLES[0].artikelnr);
  const [avropadMangd, setAvropadMangd] = useState("");
  const [levvecka, setLevvecka] = useState("");
  const [enhet, setEnhet] = useState("m³");

  const selectedArticle = MOCK_CONTRACT_ARTICLES.find((a) => a.artikelnr === artikelnr) ?? MOCK_CONTRACT_ARTICLES[0];

  const handleSave = () => {
    onSave({
      artikelnr,
      produkt: selectedArticle.produkt,
      avropadMangd: `${avropadMangd} ${enhet}`,
      leveradMangd: `0 ${enhet}`,
      resterandeMangd: `${avropadMangd} ${enhet}`,
      levvecka,
      enhet,
      status: "Aktiv",
    });
    setAvropadMangd("");
    setLevvecka("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth classes={{ paper: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <span>Skapa avropsrad</span>
        </div>
      </DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Artikel (kontraktsrad)*</Typography>
          <Select value={artikelnr} onChange={(e) => setArtikelnr(e.target.value)} size="small" className={styles.searchFieldControl}>
            {MOCK_CONTRACT_ARTICLES.map((a) => (
              <MenuItem key={a.artikelnr} value={a.artikelnr}>
                {a.artikelnr} — {a.produkt}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography className={styles.searchFieldLabel}>Avropad mängd*</Typography>
            <TextField
              value={avropadMangd}
              onChange={(e) => setAvropadMangd(e.target.value)}
              size="small"
              placeholder="Ange mängd"
              className={styles.searchFieldControl}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography className={styles.searchFieldLabel}>Beställd enhet</Typography>
            <Select value={enhet} onChange={(e) => setEnhet(e.target.value)} size="small" className={styles.searchFieldControl}>
              <MenuItem value="m³">m³</MenuItem>
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="st">st</MenuItem>
              <MenuItem value="pall">pall</MenuItem>
              <MenuItem value="ton">ton</MenuItem>
            </Select>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography className={styles.searchFieldLabel}>Levvecka</Typography>
          <TextField
            value={levvecka}
            onChange={(e) => setLevvecka(e.target.value)}
            size="small"
            placeholder="t.ex. 15"
            className={styles.searchFieldControl}
          />
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button
          size="small"
          className={styles.freightSaveButton}
          onClick={handleSave}
          disabled={!avropadMangd}
        >
          Skapa avropsrad
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Avrop detail view ──────────────────────────────────────────────────────────

type AvropDetailViewProps = {
  avrop: AvropRow;
  onBack: () => void;
  avropsrader: AvropsradRow[];
  onAddAvropsrad: (rad: AvropsradRow) => void;
  onDeleteAvropsrad: (index: number) => void;
};

function AvropDetailView({ avrop, onBack, avropsrader, onAddAvropsrad, onDeleteAvropsrad }: AvropDetailViewProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const summaryFields = [
    { label: "Kund", value: avrop.leveranskund },
    { label: "Kontraktsnr", value: avrop.kontraktsnr },
    { label: "Ext avropsnr", value: avrop.extAvropsnr || "—" },
    { label: "Avropsdatum", value: avrop.avropsdatum },
    { label: "Levvecka (min)", value: avrop.levveckaMin || "—" },
    { label: "Avropad volym", value: avrop.avropadVolym },
    { label: "Levererad volym", value: avrop.leveradVolym },
    { label: "Resterande volym", value: avrop.resterandeVolym },
    { label: "Registrerad av", value: avrop.registreradAv },
  ];

  const actionItems = [
    {
      key: "create-avropsrad",
      label: "Skapa avropsrad",
      icon: <AddIcon fontSize="small" />,
      tone: "primary" as const,
      enabled: true,
      onClick: () => setCreateDialogOpen(true),
    },
  ];

  return (
    <div className={styles.lineItemDetailPanel}>
      {/* Header — matches ContractDetailView / LineItemDetailView pattern */}
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>{avrop.avropsnr}</Typography>
          <Chip
            label={avrop.status}
            size="small"
            color={STATUS_COLOR_MAP[avrop.status] ?? "default"}
            style={{ marginLeft: 4, fontWeight: 500, padding: "0 4px" }}
          />
        </div>
        <div className={styles.contractModernTopActions}>
          <Button
            className={styles.lineItemBackButton}
            size="small"
            startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
            onClick={onBack}
          >
            Avrop
          </Button>
          <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
          <Button
            className={styles.contractSaveButton}
            size="small"
            startIcon={<EditOutlinedIcon fontSize="small" />}
          >
            Redigera
          </Button>
          <IconButton size="small" className={styles.contractHeaderDotsButton} aria-label="Ta bort avrop">
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* Summary — matches contractDataGridCompact pattern */}
      <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #eaedf2", background: "#fafafa" }}>
        <div className={styles.contractDataGridCompact}>
          {summaryFields.map(({ label, value }) => (
            <div key={label} className={styles.contractDataItem}>
              <Typography className={styles.contractDataLabel}>{label}</Typography>
              <Typography className={styles.contractDataValue}>{value}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Avropsrader table */}
      <div className={styles.lineItemsSection}>
        <ActionRow
          items={actionItems}
          rightSlot={
            selectedRow !== null ? (
              <Tooltip title="Ta bort avropsrad" placement="top">
                <IconButton
                  size="small"
                  className={styles.contractHeaderDotsButton}
                  onClick={() => {
                    onDeleteAvropsrad(selectedRow);
                    setSelectedRow(null);
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Uppdatera" placement="top">
                <IconButton size="small" className={styles.contractHeaderDotsButton} onClick={() => setSelectedRow(null)}>
                  <RefreshOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }
        />
        <div className={styles.lineItemsTableWrap}>
          <div className={styles.lineItemsTable}>
            <DataTable
              variant="line"
              columns={AVROPSRAD_COLUMNS}
              rows={avropsrader as unknown as Array<Record<string, string | undefined>>}
              rowKey={(_row, index) => `avropsrad-${index}`}
              selectedRowIndex={selectedRow}
              onRowClick={(index) => setSelectedRow((prev) => (prev === index ? null : index))}
              renderCell={(row, column) =>
                column.key === "status" ? (
                  <Chip
                    label={row[column.key]}
                    size="small"
                    color={STATUS_COLOR_MAP[row[column.key] ?? ""] ?? "default"}
                    style={{ height: 20, fontSize: 11 }}
                  />
                ) : (
                  row[column.key]
                )
              }
            />
          </div>
        </div>
      </div>

      <CreateAvropsradDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={onAddAvropsrad}
      />
    </div>
  );
}

// ── Main CallOffTab ────────────────────────────────────────────────────────────

export function CallOffTab() {
  const [avropRows, setAvropRows] = useState<AvropRow[]>(INITIAL_AVROP);
  const [avropsraderMap, setAvropsraderMap] = useState<Record<string, AvropsradRow[]>>(INITIAL_AVROPSRADER);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [openAvropsnr, setOpenAvropsnr] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const openAvrop = openAvropsnr !== null ? (avropRows.find((a) => a.avropsnr === openAvropsnr) ?? null) : null;

  const addAvrop = (avrop: AvropRow) => {
    setAvropRows((prev) => [...prev, avrop]);
    setAvropsraderMap((prev) => ({ ...prev, [avrop.avropsnr]: [] }));
  };

  const addAvropsrad = (avropsnr: string, rad: AvropsradRow) => {
    setAvropsraderMap((prev) => ({
      ...prev,
      [avropsnr]: [...(prev[avropsnr] ?? []), rad],
    }));
  };

  const deleteAvropsrad = (avropsnr: string, index: number) => {
    setAvropsraderMap((prev) => ({
      ...prev,
      [avropsnr]: (prev[avropsnr] ?? []).filter((_, i) => i !== index),
    }));
  };

  const nextAvropNr = `A-2025-${String(avropRows.filter((a) => a.avropsnr.startsWith("A-2025")).length + 1).padStart(3, "0")}`;

  if (openAvrop) {
    return (
      <AvropDetailView
        avrop={openAvrop}
        onBack={() => setOpenAvropsnr(null)}
        avropsrader={avropsraderMap[openAvrop.avropsnr] ?? []}
        onAddAvropsrad={(rad) => addAvropsrad(openAvrop.avropsnr, rad)}
        onDeleteAvropsrad={(index) => deleteAvropsrad(openAvrop.avropsnr, index)}
      />
    );
  }

  const actionItems = [
    {
      key: "create-avrop",
      label: "Skapa avrop",
      icon: <AddIcon fontSize="small" />,
      tone: "primary" as const,
      enabled: true,
      onClick: () => setCreateDialogOpen(true),
    },
  ];

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={actionItems}
        rightSlot={
          <Tooltip title="Uppdatera" placement="top">
            <IconButton size="small" className={styles.contractHeaderDotsButton} onClick={() => setSelectedRow(null)}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <div className={styles.lineItemsTableWrap}>
        <div className={styles.lineItemsTable}>
          <DataTable
            variant="line"
            columns={AVROP_COLUMNS}
            rows={avropRows as unknown as Array<Record<string, string | undefined>>}
            rowKey={(_row, index) => `avrop-${index}`}
            selectedRowIndex={selectedRow}
            onRowClick={(index) => setSelectedRow((prev) => (prev === index ? null : index))}
            renderCell={(row, column) =>
              column.key === "avropsnr" ? (
                <button
                  type="button"
                  className={styles.lineItemLinkButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenAvropsnr(row[column.key] ?? null);
                  }}
                >
                  {row[column.key]}
                </button>
              ) : column.key === "status" ? (
                <Chip
                  label={row[column.key]}
                  size="small"
                  color={STATUS_COLOR_MAP[row[column.key] ?? ""] ?? "default"}
                  style={{ height: 20, fontSize: 11 }}
                />
              ) : (
                row[column.key]
              )
            }
          />
        </div>
      </div>

      <CreateAvropDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={addAvrop}
        nextNr={nextAvropNr}
      />
    </div>
  );
}

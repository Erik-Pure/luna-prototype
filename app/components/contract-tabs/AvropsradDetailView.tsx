"use client";

import AddIcon from "@mui/icons-material/Add";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined"
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";
import { PaketbokningView, type BokadPaketRow } from "./PaketbokningView";

// ── Types ───────────────────────────────────────────────────────────────────────

type AvropsradDraft = {
  artNr: string;
  levereraArtNr: string;
  fakturatext: string;
  levereraProdukt: string;
  pakettyp: string;
  levereraPakettyp: string;
  certifiering: string;
  mangd: string;
  aPris: string;
  enhet: string;
  volym: string;
  emballage: string;
  bunt: string;
  folie: string;
  leveransvecka: string;
  leveransdag: string;
  plocktillaggMin: string;
  plocktillagg: string;
  malningstillagg: string;
  malningstillaggTroskel: string;
  lastorderVolym: string;
  leveradVolym: string;
  internKommentar: string;
  kundmarke: string;
};

// ── Constants ───────────────────────────────────────────────────────────────────

const BOKADE_PAKET_COLUMNS = [
  { key: "paketnr", label: "Paketnr" },
  { key: "lpm", label: "Lpm" },
  { key: "produkt", label: "Produkt" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "mdlangd", label: "Mdlängd" },
  { key: "skaLastasUt", label: "Ska lastas ut" },
  { key: "_actions", label: "", pinnedRight: true },
];

const INITIAL_BOKADE_PAKET: BokadPaketRow[] = [
  { paketnr: "15134", lpm: "123", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-01", mdlangd: "123", skaLastasUt: "Ja" },
];

const emptyDraft = (): AvropsradDraft => ({
  artNr: "",
  levereraArtNr: "",
  fakturatext: "",
  levereraProdukt: "",
  pakettyp: "Lp",
  levereraPakettyp: "",
  certifiering: "Ocertifierat",
  mangd: "",
  aPris: "",
  enhet: "m3 nominell",
  volym: "",
  emballage: "",
  bunt: "",
  folie: "Ingen",
  leveransvecka: "",
  leveransdag: "",
  plocktillaggMin: "",
  plocktillagg: "",
  malningstillagg: "",
  malningstillaggTroskel: "",
  lastorderVolym: "",
  leveradVolym: "",
  internKommentar: "",
  kundmarke: "",
});

// ── Props ────────────────────────────────────────────────────────────────────────

type AvropsradDetailViewProps = {
  avropsradId: string;
  onClose: () => void;
  onSave: () => void;
};

// ── Component ────────────────────────────────────────────────────────────────────

export function AvropsradDetailView({ avropsradId, onClose, onSave }: AvropsradDetailViewProps) {
  const isNew = avropsradId === "new";
  const [savedAsNew, setSavedAsNew] = useState(false);
  const isEditing = !isNew || savedAsNew;
  const [generatedId] = useState(() => `${Math.floor(1000 + Math.random() * 9000)}`);
  const [draft, setDraft] = useState<AvropsradDraft>(emptyDraft);
  const [activeTab, setActiveTab] = useState<"form" | "leveransbokadePaket">("form");
  const [bokadePaketRows, setBokadePaketRows] = useState<BokadPaketRow[]>(isNew ? [] : INITIAL_BOKADE_PAKET);
  const [showPaketbokning, setShowPaketbokning] = useState(false);

  const set = (key: keyof AvropsradDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const displayId = isNew ? generatedId : avropsradId;
  const title = isEditing ? `Avropsrad ${displayId}` : "Ny avropsrad";

  const f = (label: string, node: React.ReactNode) => (
    <div className={styles.freightFormField}>
      <Typography className={styles.freightFormLabel}>{label}</Typography>
      {node}
    </div>
  );

  const handleReservera = (rows: BokadPaketRow[]) => {
    setBokadePaketRows((prev) => [...prev, ...rows]);
    setShowPaketbokning(false);
    setActiveTab("leveransbokadePaket");
  };

  const handleSkaLastasUt = (rows: BokadPaketRow[]) => {
    setBokadePaketRows((prev) => [...prev, ...rows]);
    setShowPaketbokning(false);
    setActiveTab("leveransbokadePaket");
  };

  // ── Paketbokning view ─────────────────────────────────────────────────────────

  if (showPaketbokning) {
    return (
      <div className={`${styles.lineItemDetailPanel} ${styles.lineItemCreatePanel}`}>
        <PaketbokningView
          initialReservationstyp="Reservationsorder"
          onBack={() => { setShowPaketbokning(false); setActiveTab("leveransbokadePaket"); }}
          onReservera={handleReservera}
          onSkaLastasUt={handleSkaLastasUt}
        />
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.lineItemDetailPanel} ${styles.lineItemCreatePanel}`}>
      {/* Top bar */}
      <div className={styles.contractModernTopRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton size="small" onClick={onClose} title="Tillbaka">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography className={styles.contractModernTitle}>{title}</Typography>
        </div>
        <div className={styles.contractModernTopActions} />
      </div>

      {/* Tab bar – only when editing */}
      {isEditing ? (
        <div className={styles.contractMudTabBar} style={{ paddingLeft: 16, paddingRight: 16 }}>
          <button type="button" className={`${styles.contractMudTabItem} ${activeTab === "form" ? styles.contractMudTabItemActive : ""}`} onClick={() => setActiveTab("form")}>
            Formulär
          </button>
          <button type="button" className={`${styles.contractMudTabItem} ${activeTab === "leveransbokadePaket" ? styles.contractMudTabItemActive : ""}`} onClick={() => setActiveTab("leveransbokadePaket")}>
            Leveransbokade paket
          </button>
        </div>
      ) : null}

      <div className={styles.contractDetailMainContent}>

        {/* ── Leveransbokade paket ── */}
        {activeTab === "leveransbokadePaket" ? (
          <div className={styles.bokadePaketLayout}>
            <div className={styles.bokadePaketToolbar}>
              <button type="button" className={styles.bokadePaketAddBtn} onClick={() => setShowPaketbokning(true)}>
                <Inventory2Outlined fontSize="inherit" />
                Hantera paket
              </button>
            </div>

            <div className={styles.bokadePaketTableWrap}>
              <DataTable
                variant="line"
                fillRemainingSpace
                columns={BOKADE_PAKET_COLUMNS}
                rows={bokadePaketRows}
                rowKey={(row, index) => `bp-${row.paketnr}-${index}`}
                selectedRowIndex={null}
                onRowClick={() => { }}
                renderCell={(row, column, rowIndex) => {
                  if (column.key === "_actions") {
                    return (
                      <span className={styles.freightActionCell}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setBokadePaketRows((p) => p.filter((_, i) => i !== rowIndex)); }} title="Ta bort">
                          <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                        </IconButton>
                      </span>
                    );
                  }
                  return (row as Record<string, string>)[column.key as string] ?? "-";
                }}
              />
            </div>

            <div className={styles.bokadePaketFooter}>
              <span className={styles.bokadePaketStat}>
                <span className={styles.bokadePaketStatLabel}>Summa lpm</span>
                <span className={styles.bokadePaketStatValue}>{bokadePaketRows.reduce((sum, r) => sum + (Number(r.lpm) || 0), 0).toFixed(1)}</span>
              </span>
              <span className={styles.bokadePaketStat}>
                <span className={styles.bokadePaketStatLabel}>Antal paket</span>
                <span className={styles.bokadePaketStatValue}>{bokadePaketRows.length}</span>
              </span>
            </div>
          </div>
        ) : (

          /* ── Formulär ── */
          <div className={styles.freightTabContent}>
            <div className={styles.avropsradFormWrap}>

              {/* Artikel */}
              <div className={styles.avropFormCard}>
                <Typography className={styles.callOffSectionTitle}>Artikel</Typography>
                <div className={styles.avropsradFormGrid}>
                  {f("ArtNr", <Select size="small" value={draft.artNr} onChange={(e) => set("artNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select>)}
                  {f("Leverera ArtNr", <Select size="small" value={draft.levereraArtNr} onChange={(e) => set("levereraArtNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select>)}
                  {f("Fakturatext", <TextField size="small" value={draft.fakturatext} onChange={(e) => set("fakturatext", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Leverera Produkt", <TextField size="small" value={draft.levereraProdukt} onChange={(e) => set("levereraProdukt", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Pakettyp", <Select size="small" value={draft.pakettyp} onChange={(e) => set("pakettyp", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Lp">Lp</MenuItem><MenuItem value="Paket">Paket</MenuItem></Select>)}
                  {f("Leverera pakettyp", <Select size="small" value={draft.levereraPakettyp} onChange={(e) => set("levereraPakettyp", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Lp">Lp</MenuItem><MenuItem value="Paket">Paket</MenuItem></Select>)}
                  {f("Certifiering", <Select size="small" value={draft.certifiering} onChange={(e) => set("certifiering", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ocertifierat">Ocertifierat</MenuItem><MenuItem value="FSC">FSC</MenuItem><MenuItem value="PEFC">PEFC</MenuItem></Select>)}
                </div>
              </div>

              {/* Volym & pris */}
              <div className={styles.avropFormCard}>
                <Typography className={styles.callOffSectionTitle}>Volym &amp; pris</Typography>
                <div className={styles.avropsradFormGrid}>
                  {f("Mängd", <TextField size="small" value={draft.mangd} onChange={(e) => set("mangd", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Apris", <TextField size="small" value={draft.aPris} onChange={(e) => set("aPris", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Beställd enhet", <Select size="small" value={draft.enhet} onChange={(e) => set("enhet", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="m3 nominell">m3 nominell</MenuItem><MenuItem value="m3 fast">m3 fast</MenuItem><MenuItem value="lpm">lpm</MenuItem><MenuItem value="st">st</MenuItem></Select>)}
                  {f("Volym", <TextField size="small" value={draft.volym} onChange={(e) => set("volym", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Emballage", <Select size="small" value={draft.emballage} onChange={(e) => set("emballage", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Standard">Standard</MenuItem><MenuItem value="Skydd">Skydd</MenuItem><MenuItem value="Export">Export</MenuItem></Select>)}
                  {f("Bunt", <TextField size="small" value={draft.bunt} onChange={(e) => set("bunt", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Folie", <Select size="small" value={draft.folie} onChange={(e) => set("folie", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ingen">Ingen</MenuItem><MenuItem value="Vit">Vit</MenuItem><MenuItem value="Transparent">Transparent</MenuItem></Select>)}
                </div>
              </div>

              {/* Leverans */}
              <div className={styles.avropFormCard}>
                <Typography className={styles.callOffSectionTitle}>Leverans</Typography>
                <div className={styles.avropsradFormGrid}>
                  {f("Leveransvecka", <TextField size="small" value={draft.leveransvecka} onChange={(e) => set("leveransvecka", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Leveransdag", <Select size="small" value={draft.leveransdag} onChange={(e) => set("leveransdag", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Måndag">Måndag</MenuItem><MenuItem value="Tisdag">Tisdag</MenuItem><MenuItem value="Onsdag">Onsdag</MenuItem><MenuItem value="Torsdag">Torsdag</MenuItem><MenuItem value="Fredag">Fredag</MenuItem></Select>)}
                </div>
              </div>

              {/* Tillägg */}
              <div className={styles.avropFormCard}>
                <Typography className={styles.callOffSectionTitle}>Tillägg</Typography>
                <div className={styles.avropsradFormGrid}>
                  {f("Plocktillägg min", <TextField size="small" value={draft.plocktillaggMin} onChange={(e) => set("plocktillaggMin", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} />)}
                  {f("Plocktillägg", <TextField size="small" value={draft.plocktillagg} onChange={(e) => set("plocktillagg", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />)}
                  {f("Målningstillägg", <TextField size="small" value={draft.malningstillagg} onChange={(e) => set("malningstillagg", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} />)}
                  {f("Målningstillägg tröskel", <TextField size="small" helperText="Tillägg vid mindre än detta värde" value={draft.malningstillaggTroskel} onChange={(e) => set("malningstillaggTroskel", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">lpm</InputAdornment> } }} />)}
                </div>
              </div>

              {/* Övrigt */}
              <div className={styles.avropFormCard}>
                <Typography className={styles.callOffSectionTitle}>Övrigt</Typography>
                <div className={styles.avropsradFormGrid}>
                  {f("Lastorder volym", <TextField size="small" value={draft.lastorderVolym} onChange={(e) => set("lastorderVolym", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Levererad volym", <TextField size="small" value={draft.leveradVolym} onChange={(e) => set("leveradVolym", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Intern kommentar", <TextField size="small" value={draft.internKommentar} onChange={(e) => set("internKommentar", e.target.value)} className={styles.freightFormInput} />)}
                  {f("Kundmärke", <TextField size="small" value={draft.kundmarke} onChange={(e) => set("kundmarke", e.target.value)} className={styles.freightFormInput} />)}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.callOffFormViewActions}>
                <Button size="small" className={styles.freightSaveButton} onClick={onSave}>
                  Spara
                </Button>
                {isNew && !savedAsNew ? (
                  <Button size="small" className={styles.freightCancelButton} onClick={() => { setSavedAsNew(true); setActiveTab("leveransbokadePaket"); }}>
                    Spara och gå till leveransbokning
                  </Button>
                ) : null}
                <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
                  Avbryt
                </Button>
              </div>

            </div>
          </div>

        )}
      </div>
    </div>
  );
}

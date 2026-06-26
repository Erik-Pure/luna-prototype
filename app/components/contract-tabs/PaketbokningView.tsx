"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import EventAvailable from "@mui/icons-material/EventAvailableOutlined";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

export type BokadPaketRow = {
  paketnr: string;
  lpm: string;
  produkt: string;
  lagerstalle: string;
  lagerplats: string;
  mdlangd: string;
  skaLastasUt: string;
};

type PaketbokningResultRow = {
  paketnr: string;
  produkt: string;
  volym: string;
  pakettyp: string;
  langd: string;
  antal: string;
  lpm: string;
  produktionsdatum: string;
  lagerstalle: string;
  lagerplats: string;
  kondition: string;
  reservation: string;
  skaLastasUt: string;
  leverantor: string;
  kommentar: string;
};

const PAKETBOKNING_RESULT_COLUMNS = [
  { key: "_select", label: "" },
  { key: "paketnr", label: "PaketNr" },
  { key: "produkt", label: "Produkt" },
  { key: "volym", label: "Volym" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "langd", label: "Längd" },
  { key: "antal", label: "Antal" },
  { key: "lpm", label: "Löpmeter" },
  { key: "produktionsdatum", label: "Produktionsdatum" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "kondition", label: "Kondition" },
  { key: "reservation", label: "Reservation" },
  { key: "skaLastasUt", label: "SkaLastasUt" },
  { key: "leverantor", label: "Leverantör" },
  { key: "kommentar", label: "Kommentar" },
];

const PAKETBOKNING_MOCK_RESULTS: PaketbokningResultRow[] = [
  { paketnr: "15201", produkt: "5x150 Furu Svarvad Stolp", volym: "0.34", pakettyp: "Paket", langd: "300", antal: "120", lpm: "45", produktionsdatum: "2025-03-12", lagerstalle: "Krokom", lagerplats: "A1-02", kondition: "Fri", reservation: "", skaLastasUt: "Nej", leverantor: "Såg AB", kommentar: "" },
  { paketnr: "15202", produkt: "5x150 Furu Svarvad Stolp", volym: "0.47", pakettyp: "Paket", langd: "360", antal: "110", lpm: "62", produktionsdatum: "2025-03-14", lagerstalle: "Krokom", lagerplats: "A1-03", kondition: "Fri", reservation: "", skaLastasUt: "Nej", leverantor: "Såg AB", kommentar: "" },
  { paketnr: "15203", produkt: "5x150 Furu Svarvad Stolp", volym: "0.29", pakettyp: "Paket", langd: "420", antal: "90", lpm: "38", produktionsdatum: "2025-03-15", lagerstalle: "Krokom", lagerplats: "B2-01", kondition: "Fri", reservation: "", skaLastasUt: "Nej", leverantor: "Såg AB", kommentar: "" },
  { paketnr: "15204", produkt: "5x150 Furu Svarvad Stolp", volym: "0.54", pakettyp: "Paket", langd: "300", antal: "150", lpm: "71", produktionsdatum: "2025-03-18", lagerstalle: "BP Hammerdal", lagerplats: "C3-05", kondition: "Fri", reservation: "", skaLastasUt: "Nej", leverantor: "Såg AB", kommentar: "" },
  { paketnr: "15205", produkt: "5x150 Furu Svarvad Stolp", volym: "0.42", pakettyp: "Paket", langd: "360", antal: "130", lpm: "55", produktionsdatum: "2025-03-19", lagerstalle: "BP Hammerdal", lagerplats: "C3-06", kondition: "Fri", reservation: "", skaLastasUt: "Nej", leverantor: "Såg AB", kommentar: "" },
];

export const RESERVATIONSTYP_OPTIONS = ["Kontraktrad", "Avroprad", "Intern"] as const;
export const KONTRAKT_PRODUKT_OPTIONS = [
  "163508",
  "163509",
  "163510"
] as const;
export const ENHET_OPTIONS = [
  "BP Hammerdal Byggprodukter",
  "BP Hissmofors Byggprodukter",
  "BP Kåge Byggprodukter",
  "NT Hissmofors Såg",
  "NT Kåge Såg",
] as const;
export const VFL_GRUPP_OPTIONS = ["Grupp A", "Grupp B", "Grupp C"] as const;

type PaketbokningViewProps = {
  initialReservationstyp?: string;
  produkt?: string;
  volym?: string;
  enhet?: string;
  onBack: () => void;
  onReservera: (rows: BokadPaketRow[]) => void;
  onSkaLastasUt: (rows: BokadPaketRow[]) => void;
};

export function PaketbokningView({
  initialReservationstyp = "Avroprad",
  produkt,
  volym,
  enhet,
  onBack,
  onReservera,
  onSkaLastasUt,
}: PaketbokningViewProps) {
  const [filters, setFilters] = useState({
    reservationstyp: initialReservationstyp,
    kontraktProdukt: "",
    enhet: "",
    langdMin: "",
    langdMax: "",
    vflGrupp: "",
  });
  const [results, setResults] = useState<PaketbokningResultRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [lastClickedRow, setLastClickedRow] = useState<number | null>(null);

  const allSelected = results.length > 0 && selectedRows.size === results.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(results.map((_, i) => i)));
    }
    setLastClickedRow(null);
  };

  const toggleRow = (index: number, event?: React.MouseEvent) => {
    if (event?.shiftKey && lastClickedRow !== null) {
      const from = Math.min(lastClickedRow, index);
      const to = Math.max(lastClickedRow, index);
      const shouldSelect = !selectedRows.has(index);
      setSelectedRows((prev) => {
        const next = new Set(prev);
        for (let i = from; i <= to; i++) {
          if (shouldSelect) next.add(i); else next.delete(i);
        }
        return next;
      });
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index); else next.add(index);
        return next;
      });
      setLastClickedRow(index);
    }
  };

  const buildSelectedRows = (skaLastasUt: string): BokadPaketRow[] =>
    [...selectedRows].map((idx) => {
      const r = results[idx]!;
      return {
        paketnr: r.paketnr,
        lpm: r.lpm,
        produkt: r.produkt,
        lagerstalle: r.lagerstalle,
        lagerplats: r.lagerplats,
        mdlangd: r.langd,
        skaLastasUt,
      };
    });

  return (
    <>
      <div className={styles.contractModernTopRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton size="small" onClick={onBack} title="Tillbaka">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <div className={styles.paketbokningTitleGroup}>
            <Typography className={styles.contractModernTitle}>Paketbokning {"- " + filters.reservationstyp}</Typography>
            {(produkt || volym) && (
              <Typography className={styles.paketbokningTitleSubline}>
                {[produkt, volym && `${volym}${enhet ? ` ${enhet}` : ""}`].filter(Boolean).join("  -  ")}
              </Typography>
            )}
          </div>
        </div>
        <div className={styles.contractModernTopActions} />
      </div>
      <div className={styles.paketbokningLayout}>
        <div className={styles.paketbokningFilterStrip}>
          {/* <div className={`${styles.freightFormField} ${styles.paketbokningFieldWide}`}>
            <Typography className={styles.freightFormLabel}>Reservationstyp</Typography>
            <Select
              size="small"
              value={filters.reservationstyp}
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, reservationstyp: e.target.value }))}
            >
              {RESERVATIONSTYP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div> */}

          {/* <div className={`${styles.freightFormField} ${styles.paketbokningFieldXWide}`}>
            <Typography className={styles.freightFormLabel}>Avroprad</Typography>
            <Select
              size="small"
              value={filters.kontraktProdukt}
              displayEmpty
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, kontraktProdukt: e.target.value }))}
            >
              {KONTRAKT_PRODUKT_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div> */}

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldWide}`}>
            <Typography className={styles.freightFormLabel}>Enhet</Typography>
            <Select
              size="small"
              value={filters.enhet}
              displayEmpty
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, enhet: e.target.value }))}
              endAdornment={
                filters.enhet ? (
                  <InputAdornment position="end" sx={{ mr: 1.5 }}>
                    <IconButton size="small" onClick={() => setFilters((p) => ({ ...p, enhet: "" }))}>
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }
            >
              {ENHET_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div>

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldNarrow}`}>
            <Typography className={styles.freightFormLabel}>Längd min</Typography>
            <TextField
              size="small"
              value={filters.langdMin}
              onChange={(e) => setFilters((p) => ({ ...p, langdMin: e.target.value }))}
              className={styles.pbFilterInput}
            />
          </div>

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldNarrow}`}>
            <Typography className={styles.freightFormLabel}>Längd max</Typography>
            <TextField
              size="small"
              value={filters.langdMax}
              onChange={(e) => setFilters((p) => ({ ...p, langdMax: e.target.value }))}
              className={styles.pbFilterInput}
            />
          </div>

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldMid}`}>
            <Typography className={styles.freightFormLabel}>VFL grupp</Typography>
            <Select
              size="small"
              value={filters.vflGrupp}
              displayEmpty
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, vflGrupp: e.target.value }))}
              endAdornment={
                filters.vflGrupp ? (
                  <InputAdornment position="end" sx={{ mr: 1.5 }}>
                    <IconButton size="small" onClick={() => setFilters((p) => ({ ...p, vflGrupp: "" }))}>
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }
            >
              {VFL_GRUPP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div>

          <Button
            size="small"
            variant="contained"
            className={`${styles.paketbokningSearchBtn} ${styles.pbSökBtn}`}
            onClick={() => {
              setResults(PAKETBOKNING_MOCK_RESULTS);
              setSearched(true);
              setSelectedRows(new Set());
            }}
          >
            Sök
          </Button>
        </div>

        <div className={styles.paketbokningActionsRow}>
          <Button
            size="small"
            variant="outlined"
            className={styles.paketbokningActionBtn}
            startIcon={<EventAvailable fontSize="small" style={{ marginRight: -3 }} />}
            disabled={selectedRows.size === 0}
            onClick={() => onReservera(buildSelectedRows("Nej"))}
          >
            Reservera
          </Button>
          <Button
            size="small"
            variant="outlined"
            className={styles.paketbokningActionBtn}
            startIcon={<LabelImportantOutlinedIcon fontSize="small" style={{ marginRight: -3 }} />}
            disabled={selectedRows.size === 0}
            onClick={() => onSkaLastasUt(buildSelectedRows("Ja"))}
          >
            Ska lastas ut
          </Button>
          {/* <div className={styles.paketbokningActionSep} />
          <Button
            size="small"
            variant="outlined"
            className={styles.paketbokningActionBtnDanger}
            disabled={selectedRows.size === 0}
            onClick={() => {
              setResults((prev) => prev.filter((_, i) => !selectedRows.has(i)));
              setSelectedRows(new Set());
            }}
          >
            Ta bort reservation
          </Button> */}
          {/* {selectedRows.size > 0 && (
            <Typography className={styles.paketbokningSelCount}>{selectedRows.size} valda</Typography>
          )} */}
        </div>

        {/* {searched ? ( */}
        <div className={styles.paketbokningTableWrap}>
          <DataTable
            variant="line"
            fillRemainingSpace
            columns={PAKETBOKNING_RESULT_COLUMNS}
            rows={results}
            rowKey={(row, index) => `pbr-${row.paketnr}-${index}`}
            selectedRowIndex={null}
            onRowClick={toggleRow}
            renderHeaderCell={(column) => {
              if (column.key === "_select") {
                return (
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ padding: "2px" }}
                  />
                );
              }
              return column.label;
            }}
            renderCell={(row, column, rowIndex) => {
              if (column.key === "_select") {
                return (
                  <Checkbox
                    size="small"
                    checked={selectedRows.has(rowIndex)}
                    onChange={() => toggleRow(rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ padding: "2px" }}
                  />
                );
              }
              return (row as Record<string, string>)[column.key as string] ?? "-";
            }}
          />
          <div className={styles.paketbokningFooter}>
            <div className={styles.paketbokningFooterItem}>
              <span className={styles.paketbokningFooterLabel}>Antal valda paket</span>
              <span className={styles.paketbokningFooterValue}>{selectedRows.size}</span>
            </div>
            <div className={styles.paketbokningFooterItem}>
              <span className={styles.paketbokningFooterLabel}>Vald volym</span>
              <span className={styles.paketbokningFooterValue}>
                {[...selectedRows]
                  .reduce((sum, i) => sum + (parseFloat(results[i]?.volym ?? "0") || 0), 0)
                  .toFixed(2)} m³
              </span>
            </div>
          </div>
        </div>
        {/* ) : null} */}
      </div>
    </>
  );
}

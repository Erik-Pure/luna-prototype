"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Button,
  Checkbox,
  IconButton,
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
  lpm: string;
  produkt: string;
  lagerstalle: string;
  lagerplats: string;
  mdlangd: string;
  status: string;
};

const PAKETBOKNING_RESULT_COLUMNS = [
  { key: "_select", label: "" },
  { key: "paketnr", label: "Paketnr" },
  { key: "lpm", label: "Lpm" },
  { key: "produkt", label: "Produkt" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "mdlangd", label: "Mdlängd" },
  { key: "status", label: "Status" },
];

const PAKETBOKNING_MOCK_RESULTS: PaketbokningResultRow[] = [
  { paketnr: "15201", lpm: "45", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-02", mdlangd: "300", status: "Tillgänglig" },
  { paketnr: "15202", lpm: "62", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-03", mdlangd: "360", status: "Tillgänglig" },
  { paketnr: "15203", lpm: "38", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "B2-01", mdlangd: "420", status: "Tillgänglig" },
  { paketnr: "15204", lpm: "71", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "BP Hammerdal", lagerplats: "C3-05", mdlangd: "300", status: "Tillgänglig" },
  { paketnr: "15205", lpm: "55", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "BP Hammerdal", lagerplats: "C3-06", mdlangd: "360", status: "Tillgänglig" },
];

export const RESERVATIONSTYP_OPTIONS = ["Kontraktrad", "Reservationsorder", "Intern"] as const;
export const KONTRAKT_PRODUKT_OPTIONS = [
  "163508: 5x150 Furu Svarvad Stolp",
  "163509: 22x95 Gran Ytterpanel",
  "163510: 45x145 Gran Konstruktionsvirke",
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
  onBack: () => void;
  onReservera: (rows: BokadPaketRow[]) => void;
  onSkaLastasUt: (rows: BokadPaketRow[]) => void;
};

export function PaketbokningView({
  initialReservationstyp = "Reservationsorder",
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
        mdlangd: r.mdlangd,
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
          <Typography className={styles.contractModernTitle}>Paketbokning</Typography>
        </div>
        <div className={styles.contractModernTopActions} />
      </div>

      <div className={styles.paketbokningLayout}>
        <div className={styles.paketbokningFilterStrip}>
          <div className={`${styles.freightFormField} ${styles.paketbokningFieldWide}`}>
            <Typography className={styles.freightFormLabel}>Reservationstyp</Typography>
            <Select
              size="small"
              value={filters.reservationstyp}
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, reservationstyp: e.target.value }))}
            >
              {RESERVATIONSTYP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div>

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldXWide}`}>
            <Typography className={styles.freightFormLabel}>Kontrakt:Produkt</Typography>
            <Select
              size="small"
              value={filters.kontraktProdukt}
              displayEmpty
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, kontraktProdukt: e.target.value }))}
            >
              <MenuItem value=""><em>Alla</em></MenuItem>
              {KONTRAKT_PRODUKT_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </div>

          <div className={`${styles.freightFormField} ${styles.paketbokningFieldWide}`}>
            <Typography className={styles.freightFormLabel}>Enhet</Typography>
            <Select
              size="small"
              value={filters.enhet}
              displayEmpty
              className={styles.pbFilterInput}
              onChange={(e) => setFilters((p) => ({ ...p, enhet: e.target.value }))}
            >
              <MenuItem value=""><em>Alla</em></MenuItem>
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
            >
              <MenuItem value=""><em>Alla</em></MenuItem>
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
            disabled={selectedRows.size === 0}
            onClick={() => onReservera(buildSelectedRows("Nej"))}
          >
            Reservera
          </Button>
          <Button
            size="small"
            variant="outlined"
            className={styles.paketbokningActionBtn}
            // startIcon={<RefreshOutlinedIcon fontSize="small" />}
            disabled={selectedRows.size === 0}
            onClick={() => onSkaLastasUt(buildSelectedRows("Ja"))}
          >
            Ska lastas ut
          </Button>
          <div className={styles.paketbokningActionSep} />
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
          </Button>
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
        </div>
        {/* ) : null} */}
      </div>
    </>
  );
}

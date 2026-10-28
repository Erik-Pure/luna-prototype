"use client";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
import type React from "react";
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import { DetailHeader } from "../shared/DetailHeader";
import { ColumnFilterButton, isColumnFilterActive, matchesColumnFilter, type ColumnFilterConfig, type ColumnFilterValue } from "./StocknotaColumnFilter";
import styles from "../../page.module.scss";

const LAGERSTALLE_OPTIONS = ["Hammerdal", "Hissmofors", "Kåge", "Sävar"] as const;

// Flikarna i den inlästa Excel-filen (mock). Man väljer en flik vid uppladdning.
const MOCK_SHEETS = ["Plocklista", "Blad2", "Summering"] as const;

const BOLAG_OPTIONS = ["BP Hammerdal Byggprodukter", "Bergkvist Insjön", "Holmen Wood Products"] as const;

const FAKTURATEXTER = [
  "45x145 Konstruktionsvirke C24", "22x95 Gran Ytterpanel", "28x120 Furu Trall", "45x95 Regel", "22x145 Furu hyvlad",
];

const LEVERANSBOKAD_DETTA = "Detta kontrakt";
const LEVERANSBOKAD_ANNAT = "Annat kontrakt";
const LEVERANSBOKAD_EJ = "Ej leveransbokad";

type PlocklistaRow = {
  paketNr: string;
  hittad: "Ja" | "Nej" | "";
  bolag: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  antal: string;
  nominellVolym: string;
  lopmeter: string;
  antalKontraktsrader: string;
  leveransbokning: string;
  lastorder: string;
  isSummary?: boolean;
};

// Fasta bredder (växer inte med skärmen), tilltagna så att rubrik + filterikon får plats utan att trunkeras.
const COLUMNS = [
  { key: "paketNr", label: "PaketNr", width: 100 },
  { key: "hittad", label: "Hittad", width: 80 },
  { key: "bolag", label: "Enhet", width: 210 },
  { key: "artNr", label: "ArtNr", width: 80 },
  { key: "fakturatext", label: "Fakturatext", width: 230 },
  { key: "pakettyp", label: "Pakettyp", width: 104 },
  { key: "antal", label: "Antal", width: 72 },
  { key: "nominellVolym", label: "Nominell volym", width: 136 },
  { key: "lopmeter", label: "Löpmeter", width: 92 },
  { key: "antalKontraktsrader", label: "Antal kontraktsrader", width: 204 },
  { key: "leveransbokning", label: "Leveransbokning", width: 168 },
  { key: "lastorder", label: "Lastorder", width: 112 },
];

const NUMERIC_KEYS = new Set(["antal", "nominellVolym", "lopmeter", "antalKontraktsrader"]);

// Ersätter det gamla systemets Bolag-dropdown och fyra tri-state-kryssrutor. Inget filter är
// aktivt som default, dvs. både ja och nej visas.
const COLUMN_FILTERS: Record<string, ColumnFilterConfig> = {
  paketNr: { kind: "text" },
  hittad: { kind: "enum", options: ["Ja", "Nej"] },
  bolag: { kind: "enum", options: BOLAG_OPTIONS },
  artNr: { kind: "text" },
  pakettyp: { kind: "enum", options: ["Lp", "Paket"] },
  antalKontraktsrader: { kind: "number", defaultOperator: "gt" },
  leveransbokning: { kind: "enum", options: [LEVERANSBOKAD_ANNAT, LEVERANSBOKAD_DETTA, LEVERANSBOKAD_EJ] },
  lastorder: { kind: "text", defaultOperator: "isNotEmpty", operators: ["isEmpty", "isNotEmpty"] },
};

function leveransbokningStatus(row: PlocklistaRow, contractId: string): string {
  if (!row.leveransbokning) return LEVERANSBOKAD_EJ;
  return row.leveransbokning === contractId ? LEVERANSBOKAD_DETTA : LEVERANSBOKAD_ANNAT;
}

function generateMockRows(contractId: string): PlocklistaRow[] {
  const otherContracts = ["163512", "164021"];
  const rows: PlocklistaRow[] = [];
  for (let i = 0; i < 30; i += 1) {
    const paketNr = String(15200 + i * 3);
    // Var sjunde paket hittas inte i databasen och saknar då all paketinformation.
    if (i % 7 === 5) {
      rows.push({
        paketNr, hittad: "Nej", bolag: "", artNr: "", fakturatext: "", pakettyp: "", antal: "", nominellVolym: "",
        lopmeter: "", antalKontraktsrader: "", leveransbokning: "", lastorder: "",
      });
      continue;
    }
    const antal = 40 + ((i * 17) % 160);
    const langd = [3.0, 3.6, 4.2, 4.8, 5.4][i % 5]!;
    const leveransbokning = i % 6 === 1 ? otherContracts[i % 2]! : i % 4 === 0 ? contractId : "";
    rows.push({
      paketNr,
      hittad: "Ja",
      bolag: BOLAG_OPTIONS[i % BOLAG_OPTIONS.length]!,
      artNr: String(30010 + (i % 9)),
      fakturatext: FAKTURATEXTER[i % FAKTURATEXTER.length]!,
      pakettyp: i % 3 === 0 ? "Lp" : "Paket",
      antal: String(antal),
      nominellVolym: (antal * langd * 0.0045).toFixed(3),
      lopmeter: (antal * langd).toFixed(1),
      antalKontraktsrader: String(i % 9 === 2 ? 0 : i % 5 === 3 ? 2 + (i % 2) : 1),
      leveransbokning,
      lastorder: leveransbokning === contractId && i % 8 === 0 ? String(880400 + i) : "",
    });
  }
  return rows;
}

type PlocklistaViewProps = {
  contractId: string;
  customerName: string;
};

export function PlocklistaView({ contractId, customerName }: PlocklistaViewProps) {
  const [lagerstalle, setLagerstalle] = useState("");
  const [rows, setRows] = useState<PlocklistaRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [harLeveransbokat, setHarLeveransbokat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>(MOCK_SHEETS[0]);
  const [toast, setToast] = useState<{ open: boolean; message: string; key: number }>({ open: false, message: "", key: 0 });

  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({});
  const setColumnFilter = (key: string, filter: ColumnFilterValue | null) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (filter) next[key] = filter;
      else delete next[key];
      return next;
    });
  };

  const showToast = (message: string) => setToast((prev) => ({ open: true, message, key: prev.key + 1 }));

  const canChooseFile = Boolean(lagerstalle);

  const handleChooseFile = () => {
    if (canChooseFile) fileInputRef.current?.click();
  };

  // Har filen flera flikar väljer man en i dialogen; annars läses den enda fliken in direkt.
  const startImport = (name: string) => {
    if (MOCK_SHEETS.length > 1) {
      setSelectedSheet(MOCK_SHEETS[0]);
      setPendingFileName(name);
    } else {
      loadFile(name, MOCK_SHEETS[0]);
    }
  };

  const loadFile = (name: string, sheet: string) => {
    setFileName(name);
    setSheetName(sheet);
    setRows(generateMockRows(contractId));
    setColumnFilters({});
    setHarLeveransbokat(false);
    setPendingFileName(null);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) startImport(file.name);
    event.target.value = "";
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (!canChooseFile) return;
    const file = event.dataTransfer.files?.[0];
    if (file) startImport(file.name);
  };

  const filteredIndices = useMemo(() => {
    // Leveransbokning filtreras på härlett värde (detta/annat kontrakt), övriga kolumner på cellvärdet.
    const filterValue = (row: PlocklistaRow, key: string): string =>
      key === "leveransbokning" ? leveransbokningStatus(row, contractId) : String(row[key as keyof PlocklistaRow] ?? "");
    return rows.reduce<number[]>((acc, row, index) => {
      const matches = Object.entries(columnFilters).every(([key, filter]) =>
        !isColumnFilterActive(filter) || matchesColumnFilter(filterValue(row, key), filter, COLUMN_FILTERS[key]!.kind)
      );
      if (matches) acc.push(index);
      return acc;
    }, []);
  }, [rows, columnFilters, contractId]);

  const filteredRows = filteredIndices.map((i) => rows[i]!);
  const nominellVolym = filteredRows.reduce((sum, row) => sum + (parseFloat(row.nominellVolym) || 0), 0);

  // Summarad fast i tabellens nederkant (som i Stocknota): antal paket under PaketNr, volym under Nominell volym.
  const summaryRow: PlocklistaRow = {
    paketNr: `${filteredRows.length} paket`, hittad: "", bolag: "", artNr: "", fakturatext: "", pakettyp: "", antal: "",
    nominellVolym: nominellVolym.toFixed(3), lopmeter: "", antalKontraktsrader: "", leveransbokning: "", lastorder: "",
    isSummary: true,
  };

  // Leveransboka och Lasta ut gäller alla synliga rader (efter kolumnfilter).
  const bokningsbaraIndices = filteredIndices.filter((i) => rows[i]!.hittad === "Ja");
  const utlastningsbaraIndices = filteredIndices.filter((i) => rows[i]!.leveransbokning === contractId && !rows[i]!.lastorder);

  const leveransboka = () => {
    const targets = new Set(bokningsbaraIndices);
    setRows((prev) => prev.map((row, i) => (targets.has(i) ? { ...row, leveransbokning: contractId } : row)));
    setHarLeveransbokat(true);
    showToast(`${targets.size} paket leveransbokade`);
  };

  const lastaUt = () => {
    const targets = new Set(utlastningsbaraIndices);
    const lastorder = String(880500 + Math.floor(Math.random() * 400));
    setRows((prev) => prev.map((row, i) => (targets.has(i) ? { ...row, lastorder } : row)));
    showToast(`${targets.size} paket lastade ut på lastorder ${lastorder}`);
  };

  const actionItems = [
    {
      key: "leveransboka",
      label: "Leveransboka urval",
      tone: "primary" as const,
      enabled: bokningsbaraIndices.length > 0,
      onClick: leveransboka,
    },
    {
      key: "lasta-ut",
      label: "Lasta ut urval",
      enabled: harLeveransbokat && utlastningsbaraIndices.length > 0,
      title: harLeveransbokat ? undefined : "Leveransboka paketen först",
      onClick: lastaUt,
    },
  ];

  const resetToStart = () => {
    setRows([]);
    setColumnFilters({});
    setHarLeveransbokat(false);
  };

  const subtitle = rows.length > 0
    ? `${customerName} · Lagerställe ${lagerstalle} · ${fileName} (${sheetName})`
    : customerName;

  return (
    <>
      <DetailHeader
        entity="contract"
        label="Läs in plocklista"
        title={contractId}
        subtitle={subtitle}
        actions={rows.length > 0 ? (
          <Button
            className={styles.contractQuickActionButton}
            size="small"
            startIcon={<RestartAltIcon fontSize="small" />}
            onClick={resetToStart}
          >
            Läs in ny fil
          </Button>
        ) : undefined}
      />

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleFileSelected} />

      {rows.length === 0 ? (
        <div className={styles.stocknotaLanding}>
          <Typography className={styles.stocknotaLandingSubtitle}>
            Välj lagerställe och sedan den Excel-fil med plocklista som ska läsas in.
          </Typography>

          <TextField
            select
            size="small"
            label="Lagerställe *"
            helperText="Styr vilka rader i filen som läses in"
            value={lagerstalle}
            onChange={(e) => setLagerstalle(e.target.value)}
            className={styles.lineItemRequiredControl}
            style={{ width: 300, marginTop: 16, marginBottom: 16, textAlign: "left" }}
          >
            {LAGERSTALLE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <div
            className={`${styles.contractDropZone} ${dragActive ? styles.contractDropZoneDragging : ""} ${canChooseFile ? "" : styles.contractDropZoneDisabled}`}
            onClick={handleChooseFile}
            onDragOver={(e) => { e.preventDefault(); if (canChooseFile) setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            aria-disabled={!canChooseFile}
          >
            <p className={styles.contractDropZoneTitle}>Dra och släpp fil här</p>
            <p className={styles.contractDropZoneOrText}>eller</p>
            <button type="button" className={styles.contractDropZoneButton} disabled={!canChooseFile}>
              Välj fil
            </button>
            <p className={styles.contractDropZoneHint}>
              {canChooseFile ? "Excel-fil med plocklista" : "Välj lagerställe först"}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.paketbokningLayout}>
          <ActionRow items={actionItems} />

          <div className={`${styles.paketbokningTableWrap} ${styles.contractTableCompact} ${styles.stocknotaTable}`}>
            <div className={styles.freightTable}>
              <DataTable
                variant="line"
                fillRemainingSpace
                columns={COLUMNS}
                rows={[...filteredRows, summaryRow]}
                rowKey={(row) => ((row as PlocklistaRow).isSummary ? "summa" : (row as PlocklistaRow).paketNr)}
                selectedRowIndex={null}
                getHeaderCellClassName={(_column, columnIndex) =>
                  `${styles.stocknotaGroupedHeaderCell} ${columnIndex === COLUMNS.length - 1 ? styles.plocklistaLastCell : ""}`
                }
                renderHeaderCell={(column) => (
                  <div className={styles.stocknotaHeaderLabel}>
                    <span className={styles.stocknotaHeaderLabelText}>{column.label}</span>
                    {COLUMN_FILTERS[column.key] ? (
                      <ColumnFilterButton
                        config={COLUMN_FILTERS[column.key]!}
                        filter={columnFilters[column.key]}
                        onApply={(filter) => setColumnFilter(column.key, filter)}
                      />
                    ) : null}
                  </div>
                )}
                getCellClassName={(row, column, _rowIndex, columnIndex, isFiller) => {
                  const isSummaryRow = Boolean((row as PlocklistaRow).isSummary);
                  if (isFiller) return isSummaryRow ? styles.stocknotaSummaryCell : undefined;
                  const classes: string[] = [];
                  if (isSummaryRow) classes.push(styles.stocknotaSummaryCell);
                  if (NUMERIC_KEYS.has(column.key)) classes.push(styles.stocknotaNumeric);
                  if (columnIndex === COLUMNS.length - 1) classes.push(styles.plocklistaLastCell);
                  return classes.join(" ");
                }}
                renderCell={(row, column) => {
                  const r = row as PlocklistaRow;
                  if (r.isSummary) {
                    const value = r[column.key as keyof PlocklistaRow];
                    return value ? <strong>{value}</strong> : "";
                  }
                  if (column.key === "hittad") {
                    return r.hittad === "Nej" ? (
                      <span className={`${styles.warningCellContent} ${styles.warningCellContentHigh}`}>Nej</span>
                    ) : "Ja";
                  }
                  if (column.key === "leveransbokning" && r.leveransbokning && r.leveransbokning !== contractId) {
                    return (
                      <span className={`${styles.warningCellContent} ${styles.warningCellContentMedium}`} title="Leveransbokad på annat kontrakt">
                        {r.leveransbokning}
                      </span>
                    );
                  }
                  return r[column.key as keyof PlocklistaRow];
                }}
              />
            </div>
          </div>

        </div>
      )}

      <Dialog open={pendingFileName !== null} onClose={() => setPendingFileName(null)} maxWidth="xs" fullWidth classes={{ paper: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Välj flik</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13, marginBottom: 8 }}>
            Filen &quot;{pendingFileName}&quot; innehåller flera flikar. Välj vilken flik som ska läsas in.
          </Typography>
          <RadioGroup value={selectedSheet} onChange={(e) => setSelectedSheet(e.target.value)}>
            {MOCK_SHEETS.map((sheet) => (
              <FormControlLabel key={sheet} value={sheet} control={<Radio size="small" />} label={sheet} />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            onClick={() => pendingFileName && loadFile(pendingFileName, selectedSheet)}
          >
            Läs in
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setPendingFileName(null)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={toast.key}
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

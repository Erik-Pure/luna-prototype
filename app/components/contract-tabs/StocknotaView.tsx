"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Alert,
  Autocomplete,
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
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { ActionRow } from "../shared/ActionRow";
import { ColumnManagerDropdown } from "../shared/ColumnManagerDropdown";
import { DataTable } from "../shared/DataTable";
import { DetailHeader } from "../shared/DetailHeader";
import styles from "../../page.module.scss";

const KVALITET_OPTIONS = ["A", "B", "C"] as const;
const PAKETTYP_OPTIONS = ["Lp", "Paket"] as const;
const ENHET_FILTER_OPTIONS = ["Hissmofors", "Kåge", "Sävar"] as const;

const EDITABLE_TEXT_KEYS = new Set(["hissmoforsVald", "kageVald", "savarVald", "pris", "kundmarke"]);

type StocknotaRow = {
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  kvalitet: string;
  offererat: string;
  kopt: string;
  nlTotalt: string;
  nlHissmofors: string;
  hissmoforsVald: string;
  nlKage: string;
  kageVald: string;
  nlSavar: string;
  savarVald: string;
  pris: string;
  kundmarke: string;
  isSummary?: boolean;
};

type StocknotaColumn = { key: string; label: string; width: number; visible: boolean };

const DEFAULT_COLUMNS: StocknotaColumn[] = [
  { key: "artNr", label: "ArtNr", width: 56, visible: true },
  { key: "fakturatext", label: "Fakturatext", width: 150, visible: true },
  { key: "pakettyp", label: "Pakettyp", width: 68, visible: true },
  { key: "offererat", label: "Offererat", width: 68, visible: true },
  { key: "kopt", label: "Köpt", width: 44, visible: true },
  { key: "nlTotalt", label: "NL totalt", width: 64, visible: true },
  { key: "nlHissmofors", label: "NL Hissmofors", width: 52, visible: true },
  { key: "hissmoforsVald", label: "Hissmofors vald", width: 68, visible: true },
  { key: "nlKage", label: "NL Kåge", width: 52, visible: true },
  { key: "kageVald", label: "Kåge vald", width: 68, visible: true },
  { key: "nlSavar", label: "NL Sävar", width: 52, visible: true },
  { key: "savarVald", label: "Sävar vald", width: 68, visible: true },
  { key: "totVald", label: "Tot vald", width: 60, visible: true },
  { key: "diff", label: "Diff", width: 48, visible: true },
  { key: "pris", label: "Pris", width: 60, visible: true },
  { key: "kundmarke", label: "Kundmärke", width: 112, visible: true },
];

// Grupprubrik (övre raden) och kort kolumnrubrik (undre raden) i tabellhuvudet.
// Kolumnhanteraren visar fortfarande de fullständiga namnen i DEFAULT_COLUMNS.
const COLUMN_GROUPS: Record<string, string> = {
  artNr: "Artikel", fakturatext: "Artikel", pakettyp: "Artikel",
  offererat: "Volym", kopt: "Volym", nlTotalt: "Volym",
  nlHissmofors: "Hissmofors", hissmoforsVald: "Hissmofors",
  nlKage: "Kåge", kageVald: "Kåge",
  nlSavar: "Sävar", savarVald: "Sävar",
  totVald: "Resultat", diff: "Resultat",
  pris: "Kontraktsrad", kundmarke: "Kontraktsrad",
};

// Sifferkolumner högerställs (rubrik, cell och inmatningsfält).
const NUMERIC_KEYS = new Set([
  "offererat", "kopt", "nlTotalt", "nlHissmofors", "hissmoforsVald", "nlKage", "kageVald",
  "nlSavar", "savarVald", "totVald", "diff", "pris",
]);

const SHORT_HEADER_LABELS: Record<string, string> = {
  nlHissmofors: "NL", hissmoforsVald: "Vald",
  nlKage: "NL", kageVald: "Vald",
  nlSavar: "NL", savarVald: "Vald",
};

const VERSION_COLUMNS = [
  { key: "name", label: "Version", width: 160 },
  { key: "leveransvecka", label: "Leveransvecka", width: 140 },
  { key: "savedBy", label: "Sparad av" },
  { key: "_actions", label: "", pinnedRight: true, width: 56 },
];

const FAKTURATEXTER = [
  "Gran flisad spån", "Furu hyvlad", "45x145 Konstruktionsvirke", "22x95 Gran Ytterpanel", "Gran v-styrp",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const CURRENT_USER_NAME = "Jane Doe";

function formatVersionName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${datePart} ${timePart}`;
}

function generateMockRows(): StocknotaRow[] {
  const enheter: Array<{ kod: string; hissmoforsShare: number; kageShare: number; savarShare: number }> = [
    { kod: "HS", hissmoforsShare: 1, kageShare: 0, savarShare: 0 },
    { kod: "KS", hissmoforsShare: 0, kageShare: 1, savarShare: 0 },
    { kod: "SS", hissmoforsShare: 0, kageShare: 0, savarShare: 1 },
  ];

  const rows: StocknotaRow[] = [];
  for (let i = 0; i < 24; i += 1) {
    const artNr = String(30000 + i);
    const fakturatext = FAKTURATEXTER[i % FAKTURATEXTER.length]!;
    const pakettyp = PAKETTYP_OPTIONS[i % PAKETTYP_OPTIONS.length]!;
    const kvalitet = KVALITET_OPTIONS[i % KVALITET_OPTIONS.length]!;
    const offererat = randomInt(20, 120);
    const harKopt = Math.random() > 0.35;
    const kopt = harKopt ? String(randomInt(0, offererat)) : "";
    const nlHissmofors = randomInt(0, 40);
    const nlKage = randomInt(0, 40);
    const nlSavar = randomInt(0, 40);
    const nlTotalt = nlHissmofors + nlKage + nlSavar;
    const enhet = enheter[i % enheter.length]!;
    const hissmoforsVald = enhet.hissmoforsShare ? String(Math.min(nlHissmofors, randomInt(0, nlHissmofors))) : "0";
    const kageVald = enhet.kageShare ? String(Math.min(nlKage, randomInt(0, nlKage))) : "0";
    const savarVald = enhet.savarShare ? String(Math.min(nlSavar, randomInt(0, nlSavar))) : "0";
    const pris = String(randomInt(150, 450));

    rows.push({
      artNr,
      fakturatext,
      pakettyp,
      kvalitet,
      offererat: String(offererat),
      kopt,
      nlTotalt: String(nlTotalt),
      nlHissmofors: String(nlHissmofors),
      hissmoforsVald,
      nlKage: String(nlKage),
      kageVald,
      nlSavar: String(nlSavar),
      savarVald,
      pris,
      kundmarke: "",
    });
  }
  return rows;
}

export type StocknotaVersion = {
  id: number;
  name: string;
  savedBy: string;
  rows: StocknotaRow[];
  leveransvecka?: string;
};

export function createSeedStocknotaVersions(): StocknotaVersion[] {
  return [
    { id: 1, name: formatVersionName(new Date(2026, 2, 18, 9, 14)), savedBy: "Jane Doe", rows: generateMockRows(), leveransvecka: "202612" },
    { id: 2, name: formatVersionName(new Date(2025, 10, 4, 15, 47)), savedBy: "Erik Andersson", rows: generateMockRows() },
  ];
}

type FilterState = {
  artNr: string;
  kvalitet: string;
  pakettyp: string;
  endastKopta: boolean | null;
  enheter: string[];
};

const INITIAL_FILTERS: FilterState = {
  artNr: "",
  kvalitet: "",
  pakettyp: "",
  endastKopta: null,
  enheter: [],
};

function toNumber(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

function rowMatchesEnhet(row: StocknotaRow, enhet: string): boolean {
  if (enhet === "Hissmofors") return toNumber(row.nlHissmofors) > 0;
  if (enhet === "Kåge") return toNumber(row.nlKage) > 0;
  if (enhet === "Sävar") return toNumber(row.nlSavar) > 0;
  return false;
}

type StocknotaViewProps = {
  onBack: () => void;
  onSaved: (message: string) => void;
  versions: StocknotaVersion[];
  onSaveVersion: (version: StocknotaVersion) => void;
  onDeleteVersion: (id: number) => void;
  activeSegment: string | null;
  onOpenLanding: () => void;
  onOpenNew: () => void;
  /** toastMessage visas efter navigeringen (vyn monteras om, så en lokal toast skulle försvinna direkt). */
  onOpenVersion: (id: number, toastMessage?: string) => void;
};

export function StocknotaView({
  onBack,
  onSaved,
  versions,
  onSaveVersion,
  onDeleteVersion,
  activeSegment,
  onOpenLanding,
  onOpenNew,
  onOpenVersion,
}: StocknotaViewProps) {
  const [rows, setRows] = useState<StocknotaRow[]>([]);
  const nextVersionId = versions.length > 0 ? Math.max(...versions.map((v) => v.id)) + 1 : 1;
  const activeVersionId =
    activeSegment && activeSegment !== "new"
      ? versions.find((v) => String(v.id) === activeSegment)?.id ?? null
      : null;

  useEffect(() => {
    if (activeSegment === "new") {
      setRows(generateMockRows());
      return;
    }
    if (activeSegment === null) {
      setRows([]);
      return;
    }
    const version = versions.find((v) => String(v.id) === activeSegment);
    setRows(version ? version.rows.map((r) => ({ ...r })) : []);
    // Only reload rows when the URL segment changes, not on every `versions` update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSegment]);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const [appliedColumns, setAppliedColumns] = useState<StocknotaColumn[]>(DEFAULT_COLUMNS);
  const [draftColumns, setDraftColumns] = useState<StocknotaColumn[]>(DEFAULT_COLUMNS);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const columnsButtonRef = useRef<HTMLButtonElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [deleteVersionId, setDeleteVersionId] = useState<number | null>(null);
  const [skapaKontraktsraderOpen, setSkapaKontraktsraderOpen] = useState(false);
  const [kontraktsraderLeveransvecka, setKontraktsraderLeveransvecka] = useState("");
  const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
  const [saveVersionLeveransvecka, setSaveVersionLeveransvecka] = useState("");
  const [toast, setToast] = useState<{ open: boolean; message: string; key: number }>({ open: false, message: "", key: 0 });

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onOpenNew();
    event.target.value = "";
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onOpenNew();
  };

  const updateCell = (originalIdx: number, key: keyof StocknotaRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[originalIdx] = { ...next[originalIdx]!, [key]: value };
      return next;
    });
  };

  const filteredIndices = useMemo(
    () =>
      rows.reduce<number[]>((acc, row, index) => {
        if (filters.artNr && !row.artNr.toLowerCase().includes(filters.artNr.toLowerCase())) return acc;
        if (filters.kvalitet && row.kvalitet !== filters.kvalitet) return acc;
        if (filters.pakettyp && row.pakettyp !== filters.pakettyp) return acc;
        if (filters.endastKopta === true && toNumber(row.kopt) <= 0) return acc;
        if (filters.endastKopta === false && toNumber(row.kopt) > 0) return acc;
        if (filters.enheter.length > 0 && !filters.enheter.some((enhet) => rowMatchesEnhet(row, enhet))) return acc;
        acc.push(index);
        return acc;
      }, []),
    [rows, filters]
  );

  const filteredRows = filteredIndices.map((i) => rows[i]!);

  const rowHasIfyllValue = (row: StocknotaRow): boolean =>
    toNumber(row.hissmoforsVald) > 0 ||
    toNumber(row.kageVald) > 0 ||
    toNumber(row.savarVald) > 0 ||
    toNumber(row.pris) > 0 ||
    row.kundmarke.trim() !== "";

  const antalMedIfylltVarde = filteredRows.filter(rowHasIfyllValue).length;

  const totals = useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => {
          const hissmoforsVald = toNumber(row.hissmoforsVald);
          const kageVald = toNumber(row.kageVald);
          const savarVald = toNumber(row.savarVald);
          acc.antalRader += 1;
          acc.kopt += toNumber(row.kopt);
          acc.hissmofors += hissmoforsVald;
          acc.kage += kageVald;
          acc.savar += savarVald;
          acc.totalt += hissmoforsVald + kageVald + savarVald;
          return acc;
        },
        { antalRader: 0, kopt: 0, hissmofors: 0, kage: 0, savar: 0, totalt: 0 }
      ),
    [filteredRows]
  );

  const summaryRow: StocknotaRow = {
    artNr: "Summa",
    fakturatext: "",
    pakettyp: "",
    kvalitet: "",
    offererat: "",
    kopt: String(totals.kopt),
    nlTotalt: "",
    nlHissmofors: "",
    hissmoforsVald: String(totals.hissmofors),
    nlKage: "",
    kageVald: String(totals.kage),
    nlSavar: "",
    savarVald: String(totals.savar),
    pris: "",
    kundmarke: "",
    isSummary: true,
  };

  const triCycle = (current: boolean | null): boolean | null => {
    if (current === null) return true;
    if (current === true) return false;
    return null;
  };

  // En grupp börjar där gruppen skiljer sig från föregående synliga kolumn (följer dold/flyttad kolumn).
  const isGroupStart = (columnIndex: number) => {
    const group = COLUMN_GROUPS[visibleColumns[columnIndex]?.key ?? ""];
    return Boolean(group) && (columnIndex === 0 || COLUMN_GROUPS[visibleColumns[columnIndex - 1]!.key] !== group);
  };

  const columnsMenuItems = draftColumns.map((c) => ({ key: c.key, label: c.label, visible: c.visible }));
  const visibleColumns = appliedColumns.filter((c) => c.visible);

  const activeFilterCount =
    (filters.artNr ? 1 : 0) +
    (filters.kvalitet ? 1 : 0) +
    (filters.pakettyp ? 1 : 0) +
    (filters.endastKopta !== null ? 1 : 0) +
    (filters.enheter.length > 0 ? 1 : 0);

  useEffect(() => {
    if (!isFilterMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterMenuRef.current?.contains(target) || filterButtonRef.current?.contains(target)) return;
      setIsFilterMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterMenuOpen]);

  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? null;
  const sortedVersions = [...versions].sort((a, b) => b.name.localeCompare(a.name));
  const viewTitle = activeVersion ? activeVersion.name : "Stocknota";
  const viewSubtitle = activeVersion?.leveransvecka ? `Leveransvecka ${activeVersion.leveransvecka}` : undefined;

  const actionItems = [
    {
      key: "spara",
      label: "Spara som ny",
      tone: "primary" as const,
      enabled: rows.length > 0,
      onClick: () => {
        setSaveVersionLeveransvecka("");
        setSaveVersionDialogOpen(true);
      },
    },
    {
      key: "skapa-kontraktsrader",
      label: "Skapa kontraktsrader",
      enabled: rows.length > 0,
      onClick: () => {
        setKontraktsraderLeveransvecka(activeVersion?.leveransvecka ?? "");
        setSkapaKontraktsraderOpen(true);
      },
    },
  ];

  return (
    <>
      <DetailHeader
        entity="contract"
        label="Stocknota"
        title={
          <>
            {viewTitle}
            {viewSubtitle ? (
              <span className={styles.detailHeaderTitleMeta}>{viewSubtitle}</span>
            ) : null}
          </>
        }
        actions={activeVersion ? (
          <Tooltip title="Ta bort">
            <IconButton
              size="small"
              className={styles.contractHeaderDotsButton}
              aria-label="Ta bort version"
              onClick={() => setDeleteVersionId(activeVersion.id)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : undefined}
      />

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {rows.length === 0 ? (
        <div className={styles.stocknotaLanding}>
          <Typography className={styles.stocknotaLandingTitle}>Läs in stocknota</Typography>
          <Typography className={styles.stocknotaLandingSubtitle}>
            Välj en fil att läsa in, eller fortsätt med en tidigare sparad version.
          </Typography>

          <div
            className={`${styles.contractDropZone} ${dragActive ? styles.contractDropZoneDragging : ""}`}
            onClick={handleChooseFile}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
          >
            <p className={styles.contractDropZoneTitle}>Dra och släpp fil här</p>
            <p className={styles.contractDropZoneOrText}>eller</p>
            <button type="button" className={styles.contractDropZoneButton}>
              Välj fil
            </button>
            <p className={styles.contractDropZoneHint}>Excel-fil med stocknota</p>
          </div>

          <div className={styles.stocknotaLandingVersions}>
            <Typography component="h2" className={`${styles.contractSectionTitle} ${styles.stocknotaLandingVersionsHeading}`}>
              Sparade versioner
            </Typography>
            <div className={`${styles.lineItemsSection} ${styles.stocknotaVersionTable}`}>
              <div className={styles.freightTable}>
                <DataTable
                  variant="line"
                  fillRemainingSpace
                  columns={VERSION_COLUMNS}
                  rows={sortedVersions.map((version) => ({
                    _id: String(version.id),
                    name: version.name,
                    leveransvecka: version.leveransvecka ?? "-",
                    savedBy: version.savedBy,
                  }))}
                  rowKey={(row) => row._id}
                  selectedRowIndex={null}
                  renderCell={(row, column) => {
                    if (column.key === "_actions") {
                      return (
                        <span className={styles.freightActionCell}>
                          <Tooltip title="Ta bort" placement="top">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteVersionId(Number(row._id));
                              }}
                            >
                              <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                            </IconButton>
                          </Tooltip>
                        </span>
                      );
                    }
                    if (column.key === "name") {
                      return (
                        <button
                          type="button"
                          className={styles.lineItemLinkButton}
                          onClick={() => onOpenVersion(Number(row._id))}
                        >
                          {row.name}
                        </button>
                      );
                    }
                    return row[column.key as keyof typeof row] ?? "";
                  }}
                />
              </div>
              {sortedVersions.length === 0 ? (
                <div className={styles.stocknotaVersionsEmpty}>Det finns inga sparade versioner</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.paketbokningLayout}>
          <ActionRow
            items={actionItems}
            rightSlot={(
              <>
                <div className={styles.lagerFilterMenuWrapper}>
                  <Button
                    ref={filterButtonRef}
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<FilterAltOutlinedIcon fontSize="small" />}
                    className={`${styles.lineItemsToggleButton} ${activeFilterCount > 0 ? styles.columnsIconButtonActive : ""}`}
                    onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                  >
                    Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </Button>
                  {isFilterMenuOpen ? (
                    <div className={styles.lagerFilterDropdown} ref={filterMenuRef}>
                      <TextField
                        size="small"
                        label="ArtNr"
                        value={filters.artNr}
                        onChange={(e) => setFilters((prev) => ({ ...prev, artNr: e.target.value }))}
                        className={styles.lagerFilterRangeInput}
                      />

                      <FormControl size="small" className={styles.lagerFilterRangeInput}>
                        <InputLabel>Kvalitet</InputLabel>
                        <Select
                          value={filters.kvalitet}
                          label="Kvalitet"
                          onChange={(e) => setFilters((prev) => ({ ...prev, kvalitet: e.target.value }))}
                          MenuProps={{ disablePortal: true }}
                        >
                          <MenuItem value=""><em>Alla</em></MenuItem>
                          {KVALITET_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size="small" className={styles.lagerFilterRangeInput}>
                        <InputLabel>Pakettyp</InputLabel>
                        <Select
                          value={filters.pakettyp}
                          label="Pakettyp"
                          onChange={(e) => setFilters((prev) => ({ ...prev, pakettyp: e.target.value }))}
                          MenuProps={{ disablePortal: true }}
                        >
                          <MenuItem value=""><em>Alla</em></MenuItem>
                          {PAKETTYP_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Autocomplete
                        multiple
                        size="small"
                        disablePortal
                        className={styles.lagerFilterRangeInput}
                        options={[...ENHET_FILTER_OPTIONS]}
                        value={filters.enheter}
                        onChange={(_e, newValue) => setFilters((prev) => ({ ...prev, enheter: newValue }))}
                        disableCloseOnSelect
                        sx={{ "& .MuiAutocomplete-inputRoot": { flexWrap: "nowrap" } }}
                        renderValue={(selectedOptions) => (
                          <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {(selectedOptions as string[]).join(", ")}
                          </span>
                        )}
                        renderOption={(props, option, { selected }) => {
                          const { key, ...optionProps } = props;
                          return (
                            <li key={key} {...optionProps}>
                              <Checkbox size="small" checked={selected} style={{ marginRight: 8 }} />
                              {option}
                            </li>
                          );
                        }}
                        renderInput={(params) => <TextField {...params} label="Enhet" />}
                      />

                      <div
                        role="checkbox"
                        aria-checked={filters.endastKopta === null ? "mixed" : filters.endastKopta}
                        tabIndex={0}
                        className={styles.searchCheckboxItem}
                        style={{ cursor: "pointer" }}
                        onClick={() => setFilters((prev) => ({ ...prev, endastKopta: triCycle(prev.endastKopta) }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setFilters((prev) => ({ ...prev, endastKopta: triCycle(prev.endastKopta) }));
                          }
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={filters.endastKopta === true}
                          indeterminate={filters.endastKopta === null}
                          readOnly
                        />
                        <Typography className={styles.searchCheckboxLabel}>Endast köpta volymer</Typography>
                      </div>
                      <div className={styles.lagerFilterDropdownDivider} />
                      <div className={styles.lagerFilterDropdownFooter}>
                        <Button
                          size="small"
                          variant="text"
                          disabled={activeFilterCount === 0}
                          onClick={() => setFilters(INITIAL_FILTERS)}
                        >
                          Rensa filter
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <ColumnManagerDropdown
                  isOpen={columnsMenuOpen}
                  columns={columnsMenuItems}
                  menuRef={columnsMenuRef}
                  buttonRef={columnsButtonRef}
                  iconOnly
                  onOpen={() => { setDraftColumns(appliedColumns); setColumnsMenuOpen(true); }}
                  onCancel={() => setColumnsMenuOpen(false)}
                  onToggleVisibility={(key) => {
                    setDraftColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
                  }}
                  onMove={(key, direction) => {
                    setDraftColumns((prev) => {
                      const index = prev.findIndex((c) => c.key === key);
                      const swapWith = direction === "up" ? index - 1 : index + 1;
                      if (index < 0 || swapWith < 0 || swapWith >= prev.length) return prev;
                      const next = [...prev];
                      [next[index], next[swapWith]] = [next[swapWith]!, next[index]!];
                      return next;
                    });
                  }}
                  onSave={() => { setAppliedColumns(draftColumns); setColumnsMenuOpen(false); }}
                  onReset={() => { setDraftColumns(DEFAULT_COLUMNS); setAppliedColumns(DEFAULT_COLUMNS); }}
                />
              </>
            )}
          />

          <div className={`${styles.paketbokningTableWrap} ${styles.contractTableCompact} ${styles.stocknotaTable}`}>
            <div className={styles.freightTable}>
              <DataTable
                variant="line"
                fillRemainingSpace
                columns={visibleColumns}
                rows={[...filteredRows, summaryRow]}
                rowKey={(row, index) => `stocknota-${(row as StocknotaRow).artNr}-${index}`}
                selectedRowIndex={null}
                onRowClick={() => { }}
                getHeaderCellClassName={(column, columnIndex) => {
                  const classes = [styles.stocknotaGroupedHeaderCell];
                  if (columnIndex > 0 && isGroupStart(columnIndex)) classes.push(styles.stocknotaGroupStartHeaderCell);
                  if (EDITABLE_TEXT_KEYS.has(column.key)) classes.push(styles.stocknotaFillInHeaderCell);
                  if (columnIndex === visibleColumns.length - 1) classes.push(styles.stocknotaLastCell);
                  return classes.join(" ");
                }}
                renderHeaderCell={(column, columnIndex) => (
                  <>
                    <div className={`${styles.stocknotaHeaderGroup} ${COLUMN_GROUPS[column.key] ? styles.stocknotaHeaderGroupFilled : ""}`}>
                      {isGroupStart(columnIndex) ? COLUMN_GROUPS[column.key] : null}
                    </div>
                    <div className={`${styles.stocknotaHeaderLabel} ${NUMERIC_KEYS.has(column.key) ? styles.stocknotaNumeric : ""}`}>{SHORT_HEADER_LABELS[column.key] ?? column.label}</div>
                  </>
                )}
                getCellClassName={(row, column, _rowIndex, columnIndex, isFiller) => {
                  if (isFiller) return (row as StocknotaRow).isSummary ? styles.stocknotaSummaryCell : undefined;
                  const classes: string[] = [];
                  if (columnIndex > 0 && isGroupStart(columnIndex)) classes.push(styles.stocknotaGroupStartCell);
                  if (NUMERIC_KEYS.has(column.key)) classes.push(styles.stocknotaNumeric);
                  if (columnIndex === visibleColumns.length - 1) classes.push(styles.stocknotaLastCell);
                  if ((row as StocknotaRow).isSummary) {
                    classes.push(styles.stocknotaSummaryCell);
                    if (column.key === "artNr") classes.push(styles.stocknotaSummaryLabelCell);
                  } else if (EDITABLE_TEXT_KEYS.has(column.key)) {
                    classes.push(styles.stocknotaFillInCell);
                  }
                  return classes.join(" ");
                }}
                renderCell={(row, column, rowIndex) => {
                  const r = row as StocknotaRow;
                  const isSummaryRow = Boolean(r.isSummary);
                  const originalIdx = filteredIndices[rowIndex];
                  if (isSummaryRow && column.key === "artNr") {
                    return <strong>Summa</strong>;
                  }
                  if (column.key === "totVald") {
                    const totVald = toNumber(r.hissmoforsVald) + toNumber(r.kageVald) + toNumber(r.savarVald);
                    return isSummaryRow ? <strong>{totVald}</strong> : String(totVald);
                  }
                  if (column.key === "diff") {
                    if (isSummaryRow) return "";
                    const totVald = toNumber(r.hissmoforsVald) + toNumber(r.kageVald) + toNumber(r.savarVald);
                    return String(totVald - toNumber(r.offererat));
                  }
                  if (column.key === "kopt") {
                    return r.kopt ? <strong>{r.kopt}</strong> : "";
                  }
                  if (isSummaryRow && EDITABLE_TEXT_KEYS.has(column.key)) {
                    const value = r[column.key as keyof StocknotaRow];
                    return value ? <strong>{value}</strong> : "";
                  }
                  if (EDITABLE_TEXT_KEYS.has(column.key) && originalIdx !== undefined) {
                    return (
                      <TextField
                        size="small"
                        value={r[column.key as keyof StocknotaRow]}
                        onChange={(e) => updateCell(originalIdx, column.key as keyof StocknotaRow, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        variant="outlined"
                        className={`${styles.stocknotaCellInput} ${NUMERIC_KEYS.has(column.key) ? styles.stocknotaCellInputNumeric : ""}`}
                      />
                    );
                  }
                  return r[column.key as keyof StocknotaRow] ?? "-";
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Dialog open={deleteVersionId !== null} onClose={() => setDeleteVersionId(null)} maxWidth="xs" fullWidth classes={{ paper: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Ta bort version</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13 }}>
            Är du säker på att du vill ta bort versionen &quot;{versions.find((v) => v.id === deleteVersionId)?.name}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightDeleteButton}
            onClick={() => {
              if (deleteVersionId !== null) onDeleteVersion(deleteVersionId);
              // Tar man bort den öppna versionen går man tillbaka till startsidan.
              if (deleteVersionId === activeVersionId) onOpenLanding();
              setDeleteVersionId(null);
            }}
          >
            Ta bort
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setDeleteVersionId(null)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={skapaKontraktsraderOpen} onClose={() => setSkapaKontraktsraderOpen(false)} maxWidth="xs" fullWidth classes={{ paper: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Skapa kontraktsrader</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13, marginBottom: 12 }}>
            {antalMedIfylltVarde} kontraktsrader kommer att skapas utifrån angiven information på respektive rad.
          </Typography>
          <TextField
            size="small"
            label="Leveransvecka *"
            fullWidth
            className={styles.lineItemRequiredControl}
            value={kontraktsraderLeveransvecka}
            onChange={(e) => setKontraktsraderLeveransvecka(e.target.value)}
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            disabled={!kontraktsraderLeveransvecka.trim()}
            onClick={() => {
              setSkapaKontraktsraderOpen(false);
              setToast((prev) => ({ open: true, message: "Kontraktsrader skapade", key: prev.key + 1 }));
            }}
          >
            Skapa
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setSkapaKontraktsraderOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={saveVersionDialogOpen} onClose={() => setSaveVersionDialogOpen(false)} maxWidth="xs" fullWidth classes={{ paper: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Spara som ny version</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <TextField
            size="small"
            label="Leveransvecka (valfritt)"
            fullWidth
            value={saveVersionLeveransvecka}
            onChange={(e) => setSaveVersionLeveransvecka(e.target.value)}
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            onClick={() => {
              const newVersion: StocknotaVersion = {
                id: nextVersionId,
                name: formatVersionName(new Date()),
                savedBy: CURRENT_USER_NAME,
                rows: rows.map((r) => ({ ...r })),
                ...(saveVersionLeveransvecka.trim() ? { leveransvecka: saveVersionLeveransvecka.trim() } : {}),
              };
              onSaveVersion(newVersion);
              setSaveVersionDialogOpen(false);
              onOpenVersion(newVersion.id, `Stocknota sparad som ${newVersion.name}`);
            }}
          >
            Spara
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setSaveVersionDialogOpen(false)}>
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

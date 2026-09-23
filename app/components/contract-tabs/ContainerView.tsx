"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import WarningIconFilled from "@mui/icons-material/Warning";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Select, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import { DetailHeader } from "../shared/DetailHeader";
import styles from "../../page.module.scss";
const ENHET_OPTIONS = [
  { kod: "HS", namn: "NT Hissmofors Såg" },
  { kod: "KS", namn: "NT Kåge Såg" },
  { kod: "SS", namn: "NT Sävar Såg" },
] as const;

type ContainerVolymRow = {
  enhet: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  volym: string;
  volymIContainer: string;
  delAvContainer: string;
};

type ContainerTableRow = {
  enhet: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  volym: string;
  volymIContainer: string;
  nummer: string;
  delAvContainer: string;
};

const CONTAINER_VOLYM_COLUMNS = [
  { key: "enhet", label: "Enhet", width: 200 },
  { key: "artNr", label: "ArtNr", width: 80 },
  { key: "fakturatext", label: "Fakturatext", width: 180 },
  { key: "pakettyp", label: "Pakettyp", width: 90 },
  { key: "volym", label: "Volym", width: 80 },
  { key: "volymIContainer", label: "Volym i container", width: 140 },
];


const INITIAL_VOLYM_ROWS: ContainerVolymRow[] = [
  { enhet: "HS", artNr: "22120", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "48", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22121", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "48", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22122", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "96", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22123", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "30", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22124", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "12", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22125", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "18", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "HS", artNr: "22126", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "72", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "HS", artNr: "22127", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "24", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "KS", artNr: "22128", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "36", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "KS", artNr: "22129", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "18", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "KS", artNr: "22130", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "60", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "KS", artNr: "22131", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "24", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "KS", artNr: "22132", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "12", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "KS", artNr: "22133", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "45", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "KS", artNr: "22134", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "90", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "KS", artNr: "22135", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "20", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "SS", artNr: "22136", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "48", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "SS", artNr: "22137", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "144", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "SS", artNr: "22138", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "30", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "SS", artNr: "22139", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "14", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "SS", artNr: "22140", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "18", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "SS", artNr: "22141", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "8", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "SS", artNr: "22142", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "45", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "SS", artNr: "22143", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "20", volymIContainer: "48", delAvContainer: "true" },
];

const INITIAL_CONTAINER_ROWS: ContainerTableRow[] = [
  { enhet: "HS", artNr: "22120", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "48", volymIContainer: "48", nummer: "1", delAvContainer: "false" },
  { enhet: "HS", artNr: "22121", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "144", volymIContainer: "48", nummer: "2", delAvContainer: "false" },
  { enhet: "KS", artNr: "22125", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "18", volymIContainer: "48", nummer: "3", delAvContainer: "false" },
  { enhet: "KS", artNr: "22126", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "8", volymIContainer: "48", nummer: "3", delAvContainer: "false" },
  { enhet: "KS", artNr: "22127", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "45", volymIContainer: "48", nummer: "4", delAvContainer: "false" },
  { enhet: "SS", artNr: "22129", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "30", volymIContainer: "48", nummer: "5", delAvContainer: "false" },
  { enhet: "SS", artNr: "22133", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "16", volymIContainer: "48", nummer: "5", delAvContainer: "false" },
  { enhet: "SS", artNr: "22130", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "50", volymIContainer: "48", nummer: "6", delAvContainer: "false" },
  { enhet: "HS", artNr: "22138", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "20", volymIContainer: "48", nummer: "7", delAvContainer: "false" },
  { enhet: "HS", artNr: "22139", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "28", volymIContainer: "48", nummer: "7", delAvContainer: "false" },
  { enhet: "KS", artNr: "22140", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "60", volymIContainer: "48", nummer: "8", delAvContainer: "false" },
  { enhet: "HS", artNr: "22122", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "14", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "HS", artNr: "22124", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "12", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "KS", artNr: "22131", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "30", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "KS", artNr: "22132", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "20", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "SS", artNr: "22134", fakturatext: "Gran flisad spån", pakettyp: "Lp", volym: "16", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "SS", artNr: "22135", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "22", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "HS", artNr: "22141", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "18", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "KS", artNr: "22142", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "10", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
  { enhet: "SS", artNr: "22143", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "24", volymIContainer: "48", nummer: "0", delAvContainer: "true" },
];

type ContainerViewProps = {
  onBack: () => void;
  onSaved: (message: string) => void;
};

export function ContainerView({ onBack, onSaved }: ContainerViewProps) {
  const [activeTab, setActiveTab] = useState<"volym" | "containrar">("volym");
  const [visaEnhet, setVisaEnhet] = useState("");
  const [containerVolym, setContainerVolym] = useState("48");
  const [rows, setRows] = useState<ContainerVolymRow[]>(INITIAL_VOLYM_ROWS);
  const [containerRows, setContainerRows] = useState<ContainerTableRow[]>(INITIAL_CONTAINER_ROWS);
  // Tracks selection by original (unsorted) array index
  const [selectedOriginalIndices, setSelectedOriginalIndices] = useState<Set<number>>(new Set());
  const [kapacitetOpen, setKapacitetOpen] = useState(false);
  const [kapacitetDraft, setKapacitetDraft] = useState("");
  const [delAvExpanded, setDelAvExpanded] = useState(true);
  const [helExpanded, setHelExpanded] = useState(true);
  const [flyttaToast, setFlyttaToast] = useState<{ open: boolean; message: string; key: number }>({ open: false, message: "", key: 0 });
  const [containrarUnlocked, setContainrarUnlocked] = useState(false);
  const [kundmarkeDialogOpen, setKundmarkeDialogOpen] = useState(false);
  const [kundmarke, setKundmarke] = useState("");
  const [kundmarkeDraft, setKundmarkeDraft] = useState("");
  const [raderaDialogOpen, setRaderaDialogOpen] = useState(false);
  const [sparaConfirmOpen, setSparaConfirmOpen] = useState(false);
  const [delAvSammanfattningOpen, setDelAvSammanfattningOpen] = useState(false);
  const [visaEndastVarningar, setVisaEndastVarningar] = useState(false);

  // ── Volym tab ────────────────────────────────────────────────────────────────

  const filteredVolymIndices = useMemo(
    () => rows.reduce<number[]>((acc, r, i) => {
      if (!visaEnhet || r.enhet === visaEnhet) acc.push(i);
      return acc;
    }, []),
    [rows, visaEnhet]
  );

  const filteredRows = filteredVolymIndices.map((i) => rows[i]!);

  const updateVolymIContainer = (filteredIdx: number, value: string) => {
    const originalIdx = filteredVolymIndices[filteredIdx];
    if (originalIdx === undefined) return;
    setRows((prev) => {
      const next = [...prev];
      next[originalIdx] = { ...next[originalIdx]!, volymIContainer: value };
      return next;
    });
  };

  const totalVolym = filteredRows.reduce((sum, r) => sum + (parseFloat(r.volym) || 0), 0);

  // ── Containrar tab ────────────────────────────────────────────────────────────

  const { delAvContainerGroups, helContainerGroups } = useMemo(() => {
    const buildGroups = (flag: string, order: "asc" | "desc" = "asc") => {
      const map = new Map<string, number[]>();
      containerRows.forEach((r, i) => {
        if (r.delAvContainer !== flag) return;
        if (!map.has(r.nummer)) map.set(r.nummer, []);
        map.get(r.nummer)!.push(i);
      });
      return Array.from(map.entries())
        .map(([nummer, idxs]) => ({
          nummer,
          // Sorted by enhet so mixed groups (e.g. "Del av container") list rows enhet-wise.
          originalIndices: [...idxs].sort((a, b) => containerRows[a]!.enhet.localeCompare(containerRows[b]!.enhet)),
          totalVolym: idxs.reduce((sum, i) => sum + (parseFloat(containerRows[i]!.volym) || 0), 0),
        }))
        // Groups themselves ordered by enhet first, then by container number within the same enhet.
        .sort((a, b) => {
          const enhetCompare = containerRows[a.originalIndices[0]!]!.enhet.localeCompare(containerRows[b.originalIndices[0]!]!.enhet);
          if (enhetCompare !== 0) return enhetCompare;
          return order === "asc" ? parseInt(a.nummer) - parseInt(b.nummer) : parseInt(b.nummer) - parseInt(a.nummer);
        });
    };
    return { delAvContainerGroups: buildGroups("true"), helContainerGroups: buildGroups("false", "desc") };
  }, [containerRows]);

  const toggleContainerRowSelection = (originalIdx: number) => {
    setSelectedOriginalIndices((prev) => {
      const next = new Set(prev);
      if (next.has(originalIdx)) next.delete(originalIdx);
      else next.add(originalIdx);
      return next;
    });
  };

  const handleFlyttaTillHel = () => {
    const existingHelNummer = containerRows
      .filter((r) => r.delAvContainer === "false")
      .map((r) => parseInt(r.nummer) || 0);
    const nextNummer = existingHelNummer.length > 0 ? Math.max(...existingHelNummer) + 1 : 1;
    setContainerRows((prev) => prev.map((r, i) =>
      selectedOriginalIndices.has(i) ? { ...r, delAvContainer: "false", nummer: String(nextNummer) } : r
    ));
    setSelectedOriginalIndices(new Set());
    setFlyttaToast((prev) => ({ open: true, message: `Flyttad till Container ${nextNummer}`, key: prev.key + 1 }));
  };

  const handleFlyttaTillDel = () => {
    setContainerRows((prev) => prev.map((r, i) =>
      selectedOriginalIndices.has(i) ? { ...r, delAvContainer: "true" } : r
    ));
    setSelectedOriginalIndices(new Set());
  };

  const selectedDelAvEnheter = new Set(
    Array.from(selectedOriginalIndices)
      .filter((i) => containerRows[i]?.delAvContainer === "true")
      .map((i) => containerRows[i]!.enhet)
  );
  const flyttaTillHelEnhetMismatch = selectedDelAvEnheter.size > 1;
  const canFlyttaTillHel = selectedDelAvEnheter.size > 0 && !flyttaTillHelEnhetMismatch;
  const canFlyttaTillDel = Array.from(selectedOriginalIndices).some((i) => containerRows[i]?.delAvContainer === "false");

  // Assigns the lowest nummer among selected rows to all selected rows.
  const handleSamfrakta = () => {
    if (selectedOriginalIndices.size < 2) return;
    const indices = Array.from(selectedOriginalIndices);
    const minNummer = Math.min(...indices.map((i) => parseInt(containerRows[i]!.nummer) || 0));
    setContainerRows((prev) => {
      const next = [...prev];
      for (const i of indices) {
        next[i] = { ...next[i]!, nummer: String(minNummer) };
      }
      return next;
    });
    setSelectedOriginalIndices(new Set());
  };

  const canSamfrakta = selectedOriginalIndices.size > 1;

  const delAvSammanfattning = useMemo(() => {
    const map = new Map<string, { volym125: number; volymTP: number; volymOvriga: number }>();
    rows.filter((r) => r.delAvContainer === "true").forEach((r) => {
      const bolag = r.enhet;
      if (!map.has(bolag)) map.set(bolag, { volym125: 0, volymTP: 0, volymOvriga: 0 });
      const entry = map.get(bolag)!;
      const vol = parseFloat(r.volymIContainer) || 0;
      const nr = parseInt(r.artNr);
      if (nr % 3 === 0) entry.volym125 += vol;
      else if (nr % 3 === 1) entry.volymTP += vol;
      else entry.volymOvriga += vol;
    });
    return Array.from(map.entries()).map(([bolag, vols]) => ({ bolag, ...vols }));
  }, [rows]);

  const containerActionItems = [
    {
      key: "spara",
      label: "Verkställ planering",
      // icon: <SaveOutlinedIcon fontSize="small" />,
      tone: "primary" as const,
      enabled: true,
      onClick: () => setSparaConfirmOpen(true),
    },
    { key: "divider1", kind: "divider" as const },
    {
      key: "radera",
      label: "Radera containrar",
      icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
      enabled: true,
      onClick: () => setRaderaDialogOpen(true),
    },
    // {
    //   key: "samfrakta",
    //   label: "Samfrakta",
    //   icon: <LocalShippingOutlinedIcon fontSize="small" />,
    //   enabled: canSamfrakta,
    //   onClick: handleSamfrakta,
    // },
    { key: "divider2", kind: "divider" as const },
    {
      key: "flytta-till-hel",
      label: "Hel container",
      icon: <ArrowDownwardIcon fontSize="small" />,
      enabled: canFlyttaTillHel,
      title: flyttaTillHelEnhetMismatch ? "Enhet måste vara samma" : undefined,
      onClick: handleFlyttaTillHel,
    },
    {
      key: "flytta-till-del",
      label: "Del av container",
      icon: <ArrowUpwardIcon fontSize="small" />,
      enabled: canFlyttaTillDel,
      onClick: handleFlyttaTillDel,
    },
  ];

  return (
    <>
      {/* Header */}
      <DetailHeader entity="contract" label="Container" title="Container" onBack={onBack} />

      {/* Wizard bar */}
      <div className={styles.lineItemWizardBar} style={{ top: "40px" }}>
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${activeTab === "volym" ? styles.lineItemWizardStepActive : ""}`} onClick={() => setActiveTab("volym")}
        >
          <span className={styles.lineItemWizardStepDot}>1</span>
          <span className={styles.lineItemWizardStepLabel}>Volym</span>
        </button>
        <div className={styles.lineItemWizardConnector} />
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${activeTab === "containrar" ? styles.lineItemWizardStepActive : ""} ${!containrarUnlocked ? styles.lineItemWizardStepLocked : ""}`}
          onClick={containrarUnlocked ? () => setActiveTab("containrar") : undefined}
          disabled={!containrarUnlocked}
        >
          <span className={styles.lineItemWizardStepDot}>2</span>
          <span className={styles.lineItemWizardStepLabel}>Containrar</span>
        </button>
      </div>

      {activeTab === "volym" ? (
        <div className={styles.paketbokningLayout}>
          <div className={styles.containerWizardWidth}>
            <ActionRow
              items={[
                {
                  key: "skapa-containrar",
                  label: "Skapa containrar",
                  tone: "primary" as const,
                  enabled: !containrarUnlocked,
                  onClick: () => { setContainrarUnlocked(true); setActiveTab("containrar"); },
                },
                {
                  key: "kapacitet",
                  label: "Volym i container",
                  icon: <EditOutlinedIcon fontSize="small" />,
                  enabled: !containrarUnlocked,
                  onClick: () => { setKapacitetDraft(""); setKapacitetOpen(true); },
                },
                { key: "divider1", kind: "divider" as const },
                {
                  key: "del-av-container-sammanfattning",
                  label: "Del av container",
                  icon: <InfoOutlinedIcon fontSize="small" />,
                  enabled: !containrarUnlocked,
                  onClick: () => setDelAvSammanfattningOpen(true),
                },
              ]}
              rightSlot={(
                <Select
                  size="small"
                  value={visaEnhet}
                  displayEmpty
                  disabled={containrarUnlocked}
                  className={styles.containerViewEnhetSelect}
                  onChange={(e) => setVisaEnhet(e.target.value)}
                  renderValue={(v) => (v ? ENHET_OPTIONS.find((opt) => opt.kod === v)?.namn ?? v : "Alla enheter")}
                >
                  <MenuItem value=""><em>Alla enheter</em></MenuItem>
                  {ENHET_OPTIONS.map((opt) => (
                    <MenuItem key={opt.kod} value={opt.kod} className={styles.enhetOptionItem}>
                      <span className={styles.enhetOptionName}>{opt.namn}</span>
                      <span className={styles.enhetOptionBadge}>{opt.kod}</span>
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className={`${styles.paketbokningTableWrap} ${styles.containerTableWrapFit} ${styles.containerWizardWidth} ${styles.contractTableCompact}`}>
            <div className={styles.freightTable}>
              <DataTable
                variant="line"
                fillRemainingSpace
                columns={CONTAINER_VOLYM_COLUMNS}
                rows={filteredRows}
                rowKey={(row, index) => `cv-${(row as ContainerVolymRow).artNr}-${index}`}
                selectedRowIndex={null}
                onRowClick={() => { }}
                getCellClassName={(row, _column, rowIndex) => {
                  const r = row as ContainerVolymRow;
                  const previous = filteredRows[rowIndex - 1];
                  return rowIndex > 0 && previous && previous.enhet !== r.enhet ? styles.ctColEnhetBoundaryCell : undefined;
                }}
                renderCell={(row, column, rowIndex) => {
                  const r = row as ContainerVolymRow;
                  if (column.key === "volymIContainer") {
                    return (
                      <TextField
                        size="small"
                        value={r.volymIContainer}
                        onChange={(e) => updateVolymIContainer(rowIndex, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        variant="outlined"
                        disabled={containrarUnlocked}
                        className={styles.containerViewCellInput}
                      />
                    );
                  }
                  return (r as unknown as Record<string, string>)[column.key] ?? "-";
                }}
              />
            </div>
          </div>

          <div className={`${styles.containerVolymTotalRow} ${styles.containerWizardWidth}`}>
            {CONTAINER_VOLYM_COLUMNS.map((column, index) => (
              <div key={column.key} className={styles.containerVolymTotalCell} style={{ width: column.width }}>
                {index === 0 ? "Summa" : column.key === "volym" ? totalVolym.toFixed(2) : ""}
              </div>
            ))}
            <div style={{ flex: 1 }} aria-hidden="true" />
          </div>
        </div>
      ) : (
        <div className={styles.paketbokningLayout}>
          <div className={styles.containerWizardWidth}>
            <ActionRow
              items={containerActionItems}
              rightSlot={(
                <FormControlLabel
                  control={(
                    <Checkbox
                      size="small"
                      checked={visaEndastVarningar}
                      onChange={(e) => setVisaEndastVarningar(e.target.checked)}
                    />
                  )}
                  label="Visa endast varningar"
                  sx={{ marginRight: 0 }}
                />
              )}
            />
          </div>

          <div className={`${styles.paketbokningTableWrap} ${styles.containerTableWrapFit} ${styles.containerWizardWidth}`}>
            {/* Column header */}
            <div className={styles.ctHeaderRow}>
              <div className={styles.ctColCheck} />
              <div className={`${styles.ctHeaderCell} ${styles.ctColEnhet}`}>Enhet</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColArtNr}`}>ArtNr</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColText}`}>Fakturatext</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColPaket}`}>Pakettyp</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColVolym}`}>Volym</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColVolymTotal}`}>Volym i container</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColContainer}`}>Nummer</div>
              <div className={styles.ctColFiller} />
            </div>

            {(() => {
              const maxVol = parseFloat(containerVolym);
              const hasMax = !isNaN(maxVol) && containerVolym !== "";

              const renderFlatRows = (groups: typeof delAvContainerGroups, prefix: string) => {
                let previousEnhet: string | null = null;
                return groups.flatMap(({ originalIndices }) =>
                  originalIndices.map((originalIdx) => {
                    const r = containerRows[originalIdx]!;
                    const isSelected = selectedOriginalIndices.has(originalIdx);
                    const isEnhetBoundary = previousEnhet !== null && r.enhet !== previousEnhet;
                    previousEnhet = r.enhet;
                    return (
                      <div
                        key={`${prefix}-flat-${originalIdx}`}
                        className={`${styles.ctItemRow} ${isEnhetBoundary ? styles.ctItemRowEnhetBoundary : ""} ${isSelected ? styles.ctItemRowSelected : ""}`}
                        onClick={() => toggleContainerRowSelection(originalIdx)}
                      >
                        <div className={styles.ctColCheck}>
                          <Checkbox size="small" checked={isSelected} onChange={() => toggleContainerRowSelection(originalIdx)} onClick={(e) => e.stopPropagation()} sx={{ padding: "2px" }} />
                        </div>
                        <div className={styles.ctColEnhet}>{r.enhet}</div>
                        <div className={styles.ctColArtNr}>{r.artNr}</div>
                        <div className={styles.ctColText}>{r.fakturatext}</div>
                        <div className={styles.ctColPaket}>{r.pakettyp}</div>
                        <div className={styles.ctColVolym}>{r.volym}</div>
                        <div className={styles.ctColVolymTotal}>{r.volymIContainer}</div>
                        <div className={styles.ctColContainer} />
                        <div className={styles.ctColFiller} />
                      </div>
                    );
                  })
                );
              };

              const renderHelRows = (groups: typeof helContainerGroups) => {
                let previousEnhet: string | null = null;
                return groups.flatMap(({ originalIndices, totalVolym: groupVol }, groupIndex) => {
                  // Displayed purely as a descending running number (as if assigned after the
                  // fact), independent of the underlying nummer field or enhet sort order.
                  const displayNummer = groups.length - groupIndex;
                  const underCapacity = hasMax && groupVol < maxVol - 1;
                  const groupEnhet = containerRows[originalIndices[0]!]!.enhet;
                  const isEnhetBoundary = previousEnhet !== null && groupEnhet !== previousEnhet;
                  previousEnhet = groupEnhet;
                  return originalIndices.map((originalIdx, indexInGroup) => {
                    const r = containerRows[originalIdx]!;
                    const isSelected = selectedOriginalIndices.has(originalIdx);
                    return (
                      <div
                        key={`hel-${originalIdx}`}
                        className={`${styles.ctItemRow} ${groupIndex % 2 === 1 ? styles.ctItemRowGroupAlt : ""} ${isEnhetBoundary && indexInGroup === 0 ? styles.ctItemRowEnhetBoundary : ""} ${isSelected ? styles.ctItemRowSelected : ""}`}
                        onClick={() => toggleContainerRowSelection(originalIdx)}
                      >
                        <div className={styles.ctColCheck}>
                          <Checkbox size="small" checked={isSelected} onChange={() => toggleContainerRowSelection(originalIdx)} onClick={(e) => e.stopPropagation()} sx={{ padding: "2px" }} />
                        </div>
                        <div className={styles.ctColEnhet}>{r.enhet}</div>
                        <div className={styles.ctColArtNr}>{r.artNr}</div>
                        <div className={styles.ctColText}>{r.fakturatext}</div>
                        <div className={styles.ctColPaket}>{r.pakettyp}</div>
                        <div className={styles.ctColVolym}>{r.volym}</div>
                        <div className={styles.ctColVolymTotal}>
                          {underCapacity && (
                            <Tooltip title="Under kapacitet">
                              <WarningIconFilled className={styles.warningCellIcon} style={{ color: "#8A5A00" }} />
                            </Tooltip>
                          )}
                          {groupVol}
                        </div>
                        <div className={styles.ctColContainer}>{displayNummer}</div>
                        <div className={styles.ctColFiller} />
                      </div>
                    );
                  });
                });
              };

              return (
                <>
                  {/* Del av container */}
                  <div className={styles.ctCategoryRow} onClick={() => setDelAvExpanded((v) => !v)}>
                    {delAvExpanded
                      ? <ExpandMoreIcon fontSize="small" className={styles.ctCategoryIcon} />
                      : <ChevronRightIcon fontSize="small" className={styles.ctCategoryIcon} />}
                    <span className={styles.ctCategoryLabel}>Del av container</span>
                  </div>
                  {delAvExpanded && (
                    delAvContainerGroups.length === 0
                      ? <div className={styles.ctEmptyState}>Inga rader</div>
                      : renderFlatRows(delAvContainerGroups, "del")
                  )}

                  {/* Hel container */}
                  {(() => {
                    const helHasWarning = hasMax && helContainerGroups.some(({ totalVolym: v }) => v < maxVol - 1);
                    return (
                      <div className={styles.ctCategoryRow} onClick={() => setHelExpanded((v) => !v)}>
                        {helExpanded
                          ? <ExpandMoreIcon fontSize="small" className={styles.ctCategoryIcon} />
                          : <ChevronRightIcon fontSize="small" className={styles.ctCategoryIcon} />}
                        <span className={styles.ctCategoryLabel}>Hel container</span>
                        {helHasWarning && (
                          <span className={`${styles.warningCellContent} ${styles.warningCellContentMedium}`} style={{ marginLeft: 8, fontSize: 11 }}>
                            <WarningIcon className={styles.warningCellIcon} />
                            <span className={styles.warningCellText}>Kapacitetsvarning</span>
                          </span>
                        )
                        }
                      </div >
                    );
                  })()}
                  {helExpanded && (() => {
                    const displayedHelGroups = visaEndastVarningar
                      ? helContainerGroups.filter(({ totalVolym: v }) => hasMax && v < maxVol - 1)
                      : helContainerGroups;
                    return displayedHelGroups.length === 0
                      ? <div className={styles.ctEmptyState}>{visaEndastVarningar ? "Inga containrar med varningar" : "Inga rader"}</div>
                      : renderHelRows(displayedHelGroups);
                  })()}
                </>
              );
            })()}
          </div>
        </div >
      )
      }

      <Dialog open={kapacitetOpen} onClose={() => setKapacitetOpen(false)} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Volym i container</Typography>
            <IconButton size="small" onClick={() => setKapacitetOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          <Typography style={{ fontSize: 14, color: "#4e5155", marginBottom: 6 }}>
            Uppdatera alla enheters rader med värdet<br></br> <i>Volym i container</i> = {containerVolym} m³ till
          </Typography>
          <TextField
            autoFocus
            size="small"
            label="Volym i container (m³)"
            value={kapacitetDraft}
            onChange={(e) => setKapacitetDraft(e.target.value)}
            placeholder="m³"
            fullWidth
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button variant="contained" size="small" onClick={() => {
            setRows((prev) => prev.map((r) => (r.volymIContainer === containerVolym ? { ...r, volymIContainer: kapacitetDraft } : r)));
            setContainerVolym(kapacitetDraft);
            setKapacitetOpen(false);
          }} className={styles.bytPrislistaOkButton}>
            Spara
          </Button>
          <Button variant="outlined" size="small" onClick={() => setKapacitetOpen(false)} className={styles.bytPrislistaAvbrytButton}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={raderaDialogOpen}
        onClose={() => setRaderaDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Radera containrar</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13 }}>
            Är du säker på att du vill radera alla containrar?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightDeleteButton}
            onClick={() => {
              setRaderaDialogOpen(false);
              setContainerRows(INITIAL_CONTAINER_ROWS);
              setSelectedOriginalIndices(new Set());
              setContainrarUnlocked(false);
              setActiveTab("volym");
            }}
          >
            Radera
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setRaderaDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={sparaConfirmOpen}
        onClose={() => setSparaConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Verkställ containerplanering</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13 }}>
            Det finns periodiseringar och avropsrader på kontraktet som kommer att ersättas. Vill du fortsätta?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            onClick={() => { setSparaConfirmOpen(false); setKundmarkeDraft(kundmarke); setKundmarkeDialogOpen(true); }}
          >
            Ja
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setSparaConfirmOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={kundmarkeDialogOpen}
        onClose={() => setKundmarkeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Verkställ containerplanering</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13, color: "#4e5155", marginBottom: 10 }}>
            Ange kundens märke innan containrarna verkställs.
          </Typography>
          <TextField
            size="small"
            fullWidth
            autoFocus
            label="Kundens märke"
            value={kundmarkeDraft}
            onChange={(e) => setKundmarkeDraft(e.target.value)}
            className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            disabled={kundmarkeDraft.trim() === ""}
            onClick={() => {
              setKundmarke(kundmarkeDraft);
              setKundmarkeDialogOpen(false);
              onSaved("Containerplanering verkställd");
            }}
          >
            Verkställ
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setKundmarkeDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={delAvSammanfattningOpen}
        onClose={() => setDelAvSammanfattningOpen(false)}
        maxWidth="md"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Sammanfattning – Del av container</Typography>
            <IconButton size="small" onClick={() => setDelAvSammanfattningOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Enhet</TableCell>
                <TableCell align="right">Volym 125</TableCell>
                <TableCell align="right">Volym TP</TableCell>
                <TableCell align="right">Volym övriga</TableCell>
                <TableCell align="right">Total volym</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delAvSammanfattning.map((row) => (
                <TableRow key={row.bolag}>
                  <TableCell>{row.bolag}</TableCell>
                  <TableCell align="right">{row.volym125 > 0 ? `${row.volym125} m³` : "–"}</TableCell>
                  <TableCell align="right">{row.volymTP > 0 ? `${row.volymTP} m³` : "–"}</TableCell>
                  <TableCell align="right">{row.volymOvriga > 0 ? `${row.volymOvriga} m³` : "–"}</TableCell>
                  <TableCell align="right">{Math.round(row.volym125 + row.volymTP + row.volymOvriga)} m³</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" variant="outlined" onClick={() => setDelAvSammanfattningOpen(false)} className={styles.bytPrislistaAvbrytButton}>
            Stäng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={flyttaToast.key}
        open={flyttaToast.open}
        autoHideDuration={2200}
        onClose={() => setFlyttaToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setFlyttaToast((prev) => ({ ...prev, open: false }))}
        >
          {flyttaToast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

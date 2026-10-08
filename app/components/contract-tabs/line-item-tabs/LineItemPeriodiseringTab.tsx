"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Alert, Button, Checkbox, Dialog, Divider, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../../shared/DataTable";
import styles from "../../../page.module.scss";

type PeriodiseringRow = {
  id: string;
  leveransvecka: string;
  mangd: string;
  enhet: string;
  avropsradsstatus: string;
  kundensMarke: string;
  godsmottagarensMarke: string;
};

type AutoPeriodiseringDraft = {
  step0Mode: "antalRader" | "mangdPerRad";
  antalRader: string;
  mangdPerRad: string;
  step1Mode: "sprid" | "olika";
  rowWeeks: string[];
  rowMarks: Array<{ kundensMarke: string; godsmottagarensMarke: string }>;
};

type PeriodiseringColumnKey = keyof Omit<PeriodiseringRow, "id"> | "_actions";

const PERIODISERING_COLUMNS: Array<{ key: PeriodiseringColumnKey; label: string; pinnedRight?: boolean; width?: number }> = [
  { key: "leveransvecka", label: "Leveransvecka", width: 120 },
  { key: "mangd", label: "Mängd", width: 100 },
  { key: "enhet", label: "Enhet", width: 120 },
  { key: "avropsradsstatus", label: "Avropsradsstatus", width: 140 },
  { key: "kundensMarke", label: "Kundens märke", width: 160 },
  { key: "godsmottagarensMarke", label: "Godsmottagarens märke", width: 180 },
  { key: "_actions", label: "", pinnedRight: true, width: 112 },
];

const emptyPeriodiseringRow = (): Omit<PeriodiseringRow, "id"> => ({
  leveransvecka: "",
  mangd: "",
  enhet: "m3 nominell",
  avropsradsstatus: "Planerad",
  kundensMarke: "",
  godsmottagarensMarke: ""
});

const PERIODISERING_SUM_EPSILON = 0.0005;

const parseSvNumber = (value: string): number | null => {
  const normalized = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  if (!normalized || normalized === "." || normalized === "-" || normalized === "-.") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatSvVolume = (value: number): string => {
  const minimumFractionDigits = Number.isInteger(value) ? 0 : 3;
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits,
    maximumFractionDigits: 3,
  }).format(value);
};

const createAutoPeriodiseringDraft = (): AutoPeriodiseringDraft => ({
  step0Mode: "mangdPerRad",
  antalRader: "",
  mangdPerRad: "",
  step1Mode: "sprid",
  rowWeeks: [],
  rowMarks: [],
});

const dateToIsoWeekCode = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}${String(week).padStart(2, "0")}`;
};

const distributeWeekCodes = (minDateStr: string, maxDateStr: string, n: number): string[] => {
  if (n <= 0) return [];
  const minCode = dateToIsoWeekCode(minDateStr);
  const maxCode = dateToIsoWeekCode(maxDateStr);
  if (!minCode || !maxCode) return Array<string>(n).fill("");
  const toOrd = (code: string) =>
    parseInt(code.slice(0, 4), 10) * 53 + parseInt(code.slice(4), 10);
  const minOrd = toOrd(minCode);
  const maxOrd = toOrd(maxCode);
  return Array.from({ length: n }, (_, i) => {
    const ordinal = n === 1 ? minOrd : Math.round(minOrd + (i * (maxOrd - minOrd)) / (n - 1));
    const year = Math.floor((ordinal - 1) / 53);
    const week = Math.max(1, Math.min(53, ((ordinal - 1) % 53) + 1));
    return `${year}${String(week).padStart(2, "0")}`;
  });
};

type PeriodiseringFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<PeriodiseringRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<PeriodiseringRow, "id"> };

type LineItemPeriodiseringTabProps = {
  /** Kontraktsradens volym (svensk talformatering). */
  volume: string;
  orderedUnit: string;
  deliveryWindowMin: string;
  deliveryWindowMax: string;
};

export function LineItemPeriodiseringTab({ volume, orderedUnit, deliveryWindowMin, deliveryWindowMax }: LineItemPeriodiseringTabProps) {
  const [periodiseringRows, setPeriodiseringRows] = useState<PeriodiseringRow[]>([]);
  const [selectedPeriodiseringRow, setSelectedPeriodiseringRow] = useState<number | null>(null);
  const [periodiseringForm, setPeriodiseringForm] = useState<PeriodiseringFormState>({ mode: "closed" });
  const [keepPeriodiseringDialogOpen, setKeepPeriodiseringDialogOpen] = useState(true);
  const [keepPeriodiseringValues, setKeepPeriodiseringValues] = useState(false);
  const [lastPeriodiseringDraft, setLastPeriodiseringDraft] = useState<Omit<PeriodiseringRow, "id"> | null>(null);
  const [periodiseringCreateFeedback, setPeriodiseringCreateFeedback] = useState({ open: false, key: 0 });
  const [periodiseringValidationFeedback, setPeriodiseringValidationFeedback] = useState({ open: false, key: 0, message: "" });
  const [isAutoPeriodiseringDialogOpen, setIsAutoPeriodiseringDialogOpen] = useState(false);
  const [autoPeriodiseringStep, setAutoPeriodiseringStep] = useState<0 | 1 | 2>(0);
  const [autoPeriodiseringDraft, setAutoPeriodiseringDraft] = useState<AutoPeriodiseringDraft>(
    createAutoPeriodiseringDraft()
  );

  const openPeriodiseringAdd = () => {
    setKeepPeriodiseringValues(false);
    const initialDraft = keepPeriodiseringValues && lastPeriodiseringDraft
      ? lastPeriodiseringDraft
      : emptyPeriodiseringRow();
    setPeriodiseringForm({ mode: "add", draft: initialDraft });
    setSelectedPeriodiseringRow(null);
  };

  const openPeriodiseringEdit = (index: number) => {
    setKeepPeriodiseringValues(false);
    const row = periodiseringRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setPeriodiseringForm({ mode: "edit", id, draft });
    setSelectedPeriodiseringRow(index);
  };

  const openPeriodiseringClone = (index: number) => {
    setKeepPeriodiseringValues(false);
    const row = periodiseringRows[index];
    if (!row) {
      return;
    }

    const draft = {
      leveransvecka: row.leveransvecka,
      mangd: row.mangd,
      enhet: row.enhet,
      avropsradsstatus: row.avropsradsstatus,
      kundensMarke: row.kundensMarke,
      godsmottagarensMarke: row.godsmottagarensMarke,
    };
    setPeriodiseringForm({ mode: "add", draft });
    setSelectedPeriodiseringRow(null);
  };

  const closePeriodiseringForm = () => {
    setPeriodiseringForm({ mode: "closed" });
  };

  const setPeriodiseringDraftField = (key: keyof Omit<PeriodiseringRow, "id">, value: string) => {
    setPeriodiseringForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const savePeriodiseringForm = () => {
    if (periodiseringForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...periodiseringForm.draft };

    if (periodiseringForm.mode === "add") {
      const nextRows = [
        ...periodiseringRows,
        { id: `periodisering-${periodiseringRows.length + 1}`, ...nextDraft }
      ];

      if (!validatePeriodiseringVolume(nextRows)) {
        return;
      }

      setPeriodiseringRows(nextRows);
      setLastPeriodiseringDraft(keepPeriodiseringValues ? nextDraft : null);
      setPeriodiseringCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));

      if (keepPeriodiseringDialogOpen) {
        setPeriodiseringForm({
          mode: "add",
          draft: keepPeriodiseringValues ? nextDraft : emptyPeriodiseringRow()
        });
        return;
      }
    }

    if (periodiseringForm.mode === "edit") {
      const nextRows = periodiseringRows.map((row) =>
        row.id === periodiseringForm.id ? { ...row, ...nextDraft } : row
      );

      if (!validatePeriodiseringVolume(nextRows)) {
        return;
      }

      setPeriodiseringRows(nextRows);

      if (keepPeriodiseringDialogOpen) {
        setPeriodiseringForm({ mode: "edit", id: periodiseringForm.id, draft: nextDraft });
        return;
      }
    }

    closePeriodiseringForm();
  };

  const deletePeriodiseringRow = (index: number) => {
    setPeriodiseringRows((previous) => previous.filter((_row, currentIndex) => currentIndex !== index));
    setSelectedPeriodiseringRow((previous) => (previous === index ? null : previous));
    closePeriodiseringForm();
  };

  const periodiseringDraft = periodiseringForm.mode !== "closed" ? periodiseringForm.draft : null;
  const isPeriodiseringDialogOpen = periodiseringDraft !== null;
  const contractVolume = parseSvNumber(volume);
  const hasContractVolume = contractVolume !== null && contractVolume > 0;
  const periodiseradVolym = periodiseringRows.reduce((sum, row) => sum + (parseSvNumber(row.mangd) ?? 0), 0);
  const aterstarAttPeriodisera = hasContractVolume ? (contractVolume - periodiseradVolym) : null;
  const periodiseringArIbalans =
    hasContractVolume && aterstarAttPeriodisera !== null && Math.abs(aterstarAttPeriodisera) <= PERIODISERING_SUM_EPSILON;
  const volumeUnit = orderedUnit.trim() || "m3";
  const autoTotalAttFordela = hasContractVolume ? Math.max(0, aterstarAttPeriodisera ?? 0) : 0;
  const autoParsedAntalRader = parseSvNumber(autoPeriodiseringDraft.antalRader);
  const autoParsedMangdPerRad = parseSvNumber(autoPeriodiseringDraft.mangdPerRad);
  const autoAntalRader: number = autoPeriodiseringDraft.step0Mode === "antalRader"
    ? (autoParsedAntalRader !== null ? Math.max(1, Math.round(autoParsedAntalRader)) : 0)
    : (autoParsedMangdPerRad !== null && autoParsedMangdPerRad > 0 && autoTotalAttFordela > 0
      ? Math.max(1, Math.ceil(autoTotalAttFordela / autoParsedMangdPerRad))
      : 0);
  const autoMangdPerRad = autoAntalRader > 0 ? autoTotalAttFordela / autoAntalRader : null;
  const autoSistaRadVolym = autoAntalRader > 1 && autoMangdPerRad !== null
    ? autoTotalAttFordela - autoMangdPerRad * (autoAntalRader - 1)
    : autoMangdPerRad;
  const autoWeeks: string[] = autoPeriodiseringDraft.step1Mode === "sprid" && autoAntalRader > 0
    ? distributeWeekCodes(deliveryWindowMin, deliveryWindowMax, autoAntalRader)
    : Array.from({ length: autoAntalRader }, (_, i) => autoPeriodiseringDraft.rowWeeks[i] ?? "");
  const autoCanProceedStep0 = autoAntalRader > 0;
  const autoHarTommaVeckor =
    autoPeriodiseringDraft.step1Mode === "olika" &&
    autoAntalRader > 0 &&
    Array.from({ length: autoAntalRader }, (_, i) => (autoPeriodiseringDraft.rowWeeks[i] ?? "").trim()).some(
      (week) => week === ""
    );
  const autoCanProceedStep1 = autoPeriodiseringDraft.step1Mode === "sprid" || !autoHarTommaVeckor;
  const autoCanProceedCurrentStep =
    autoPeriodiseringStep === 0
      ? autoCanProceedStep0
      : autoPeriodiseringStep === 1
        ? autoCanProceedStep1
        : false;

  const showPeriodiseringValidationError = (message: string) => {
    setPeriodiseringValidationFeedback((previous) => ({
      open: true,
      key: previous.key + 1,
      message,
    }));
  };

  const validatePeriodiseringVolume = (rowsToValidate: PeriodiseringRow[]): boolean => {
    if (!hasContractVolume || contractVolume === null) {
      return true;
    }

    const nextPeriodiseradVolym = rowsToValidate.reduce((sum, row) => sum + (parseSvNumber(row.mangd) ?? 0), 0);
    if (nextPeriodiseradVolym - contractVolume > PERIODISERING_SUM_EPSILON) {
      showPeriodiseringValidationError(
        `Summan av periodisering (${formatSvVolume(nextPeriodiseradVolym)}) får inte överstiga kontraktsvolymen (${formatSvVolume(contractVolume)}).`
      );
      return false;
    }

    return true;
  };

  const setPeriodiseringRowMarke = (
    rowId: string,
    key: "kundensMarke" | "godsmottagarensMarke",
    value: string
  ) => {
    setPeriodiseringRows((previous) => previous.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  };

  const openAutoPeriodisering = () => {
    setAutoPeriodiseringDraft(createAutoPeriodiseringDraft());
    setAutoPeriodiseringStep(0);
    setIsAutoPeriodiseringDialogOpen(true);
  };

  const closeAutoPeriodisering = () => {
    setIsAutoPeriodiseringDialogOpen(false);
  };

  const handleNextStepAuto = () => {
    if (autoPeriodiseringStep === 0) {
      if (!autoCanProceedStep0) return;
      const n = autoAntalRader;
      setAutoPeriodiseringDraft((prev) => ({
        ...prev,
        rowWeeks: Array.from({ length: n }, (_, i) => prev.rowWeeks[i] ?? ""),
      }));
      setAutoPeriodiseringStep(1);
    } else if (autoPeriodiseringStep === 1) {
      if (!autoCanProceedStep1) return;
      const n = autoAntalRader;
      setAutoPeriodiseringDraft((prev) => ({
        ...prev,
        rowMarks: Array.from({ length: n }, (_, i) => prev.rowMarks[i] ?? { kundensMarke: "", godsmottagarensMarke: "" }),
      }));
      setAutoPeriodiseringStep(2);
    }
  };

  const handleGoToStep = (target: 0 | 1 | 2) => {
    if (target === autoPeriodiseringStep) return;
    if (target < autoPeriodiseringStep) {
      setAutoPeriodiseringStep(target);
    } else {
      if (autoPeriodiseringStep === 0 && !autoCanProceedStep0) return;
      if (autoPeriodiseringStep === 1 && !autoCanProceedStep1) return;
      const n = autoAntalRader;
      setAutoPeriodiseringDraft((prev) => ({
        ...prev,
        rowWeeks: Array.from({ length: n }, (_, i) => prev.rowWeeks[i] ?? ""),
        ...(target >= 2
          ? { rowMarks: Array.from({ length: n }, (_, i) => prev.rowMarks[i] ?? { kundensMarke: "", godsmottagarensMarke: "" }) }
          : {}),
      }));
      setAutoPeriodiseringStep(target);
    }
  };

  const setAllAutoRowMarks = (key: "kundensMarke" | "godsmottagarensMarke", value: string) => {
    setAutoPeriodiseringDraft((prev) => ({
      ...prev,
      rowMarks: prev.rowMarks.map((mark) => ({ ...mark, [key]: value })),
    }));
  };

  const setAutoRowMark = (index: number, key: "kundensMarke" | "godsmottagarensMarke", value: string) => {
    setAutoPeriodiseringDraft((prev) => ({
      ...prev,
      rowMarks: prev.rowMarks.map((mark, i) => (i === index ? { ...mark, [key]: value } : mark)),
    }));
  };

  const setAutoRowWeek = (index: number, value: string) => {
    setAutoPeriodiseringDraft((prev) => ({
      ...prev,
      rowWeeks: prev.rowWeeks.map((w, i) => (i === index ? value : w)),
    }));
  };

  const createAutoPeriodiseringRows = () => {
    if (!hasContractVolume || contractVolume === null) {
      showPeriodiseringValidationError("Ange volym i kontraktshuvudet innan automatisk periodisering används.");
      return;
    }

    if (aterstarAttPeriodisera === null || aterstarAttPeriodisera <= PERIODISERING_SUM_EPSILON) {
      showPeriodiseringValidationError("Ingen volym återstår att periodisera.");
      return;
    }

    if (autoAntalRader <= 0) {
      showPeriodiseringValidationError("Ange antal rader för automatisk periodisering.");
      return;
    }

    const total = aterstarAttPeriodisera;
    const baseVolume = total / autoAntalRader;
    const unit = orderedUnit.trim() || "m3 nominell";

    const nextRows: PeriodiseringRow[] = Array.from({ length: autoAntalRader }, (_, index) => {
      const isLast = index === autoAntalRader - 1;
      const rowVolume = isLast ? total - baseVolume * (autoAntalRader - 1) : baseVolume;
      const marks = autoPeriodiseringDraft.rowMarks[index] ?? { kundensMarke: "", godsmottagarensMarke: "" };

      return {
        id: `periodisering-auto-${Date.now()}-${index}`,
        leveransvecka: autoWeeks[index] ?? "",
        mangd: formatSvVolume(Math.max(0, rowVolume)),
        enhet: unit,
        avropsradsstatus: "Planerad",
        kundensMarke: marks.kundensMarke,
        godsmottagarensMarke: marks.godsmottagarensMarke,
      };
    });

    const mergedRows = [...periodiseringRows, ...nextRows];
    if (!validatePeriodiseringVolume(mergedRows)) {
      return;
    }

    setPeriodiseringRows(mergedRows);
    setPeriodiseringCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));
    closeAutoPeriodisering();
  };

  return (
    <>
      <div className={styles.periodiseringTabHeader}>
        <Button
          className={styles.freightNewButton}
          startIcon={<AddIcon />}
          onClick={openPeriodiseringAdd}
          disabled={periodiseringArIbalans}
        >
          Periodiseringsrad
        </Button>
        <Divider orientation="vertical" flexItem />
        <span className={styles.periodiseringAccordionSummary}>
          {formatSvVolume(periodiseradVolym)} av {contractVolume !== null ? formatSvVolume(contractVolume) : "–"} {volumeUnit}
        </span>
        {periodiseringArIbalans ? (
          <Tooltip title="Hela volymen är periodiserad" placement="top">
            <CheckCircleIcon color="success" fontSize="small" aria-label="Hela volymen är periodiserad" />
          </Tooltip>
        ) : null}
      </div>
      <div className={styles.lineItemsTableFrame}>
        <div className={styles.freightTableWrap}>
          <div className={styles.freightTable}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={PERIODISERING_COLUMNS}
              rows={periodiseringRows}
              rowKey={(row, index) => `${row.id}-${index}`}
              selectedRowIndex={selectedPeriodiseringRow}
              onRowClick={(index) => setSelectedPeriodiseringRow((previous) => (previous === index ? null : index))}
              renderCell={(row, column, rowIndex) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPeriodiseringEdit(rowIndex);
                        }}
                        title="Redigera rad"
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPeriodiseringClone(rowIndex);
                        }}
                        title="Klona rad"
                      >
                        <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          deletePeriodiseringRow(rowIndex);
                        }}
                        title="Ta bort rad"
                      >
                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                if (column.key === "kundensMarke" || column.key === "godsmottagarensMarke") {
                  const markeKey = column.key;
                  const value = row[markeKey as "kundensMarke" | "godsmottagarensMarke"];
                  return (
                    <input
                      type="text"
                      value={value}
                      placeholder="—"
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        setPeriodiseringRowMarke(
                          row.id,
                          markeKey as "kundensMarke" | "godsmottagarensMarke",
                          event.target.value
                        )
                      }
                      className={styles.periodiseringMarkGhostInput}
                    />
                  );
                }
                const value = row[column.key as keyof Omit<PeriodiseringRow, "id">];
                return value?.trim() ? value : "-";
              }}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={isPeriodiseringDialogOpen}
        onClose={closePeriodiseringForm}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>{periodiseringForm.mode === "add" ? "Ny periodiseringsrad" : "Redigera periodiseringsrad"}</span>
            {periodiseringForm.mode === "add" ? (
              <div className={styles.freightDialogToggles}>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepPeriodiseringDialogOpen}
                    onChange={(event) => setKeepPeriodiseringDialogOpen(event.target.checked)}
                  />
                  <span>Behåll öppen</span>
                </label>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepPeriodiseringValues}
                    onChange={(event) => {
                      setKeepPeriodiseringValues(event.target.checked);
                      if (event.target.checked) setKeepPeriodiseringDialogOpen(true);
                    }}
                  />
                  <span>Behåll värden</span>
                </label>
              </div>
            ) : null}
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          {periodiseringDraft !== null ? (
            <div className={styles.avropFormGrid}>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Leveransvecka</Typography>
                <TextField
                  size="small"
                  value={periodiseringDraft.leveransvecka}
                  onChange={(e) => setPeriodiseringDraftField("leveransvecka", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Mängd</Typography>
                <TextField
                  size="small"
                  value={periodiseringDraft.mangd}
                  onChange={(e) => setPeriodiseringDraftField("mangd", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Enhet</Typography>
                <Select
                  size="small"
                  value={periodiseringDraft.enhet}
                  onChange={(e) => setPeriodiseringDraftField("enhet", String(e.target.value))}
                  className={styles.freightFormInput}
                >
                  <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                  <MenuItem value="m3 fast">m3 fast</MenuItem>
                  <MenuItem value="ton">ton</MenuItem>
                  <MenuItem value="st">st</MenuItem>
                </Select>
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Avropsradsstatus</Typography>
                <Select
                  size="small"
                  value={periodiseringDraft.avropsradsstatus}
                  onChange={(e) => setPeriodiseringDraftField("avropsradsstatus", String(e.target.value))}
                  className={styles.freightFormInput}
                >
                  <MenuItem value="Planerad">Planerad</MenuItem>
                  <MenuItem value="Aktiv">Aktiv</MenuItem>
                  <MenuItem value="Pausad">Pausad</MenuItem>
                  <MenuItem value="Avslutad">Avslutad</MenuItem>
                </Select>
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Kundens märke</Typography>
                <TextField
                  size="small"
                  value={periodiseringDraft.kundensMarke}
                  onChange={(e) => setPeriodiseringDraftField("kundensMarke", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Godsmottagarens märke</Typography>
                <TextField
                  size="small"
                  value={periodiseringDraft.godsmottagarensMarke}
                  onChange={(e) => setPeriodiseringDraftField("godsmottagarensMarke", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightSaveButton} onClick={savePeriodiseringForm}>
            {periodiseringForm.mode === "add" ? "Lägg till" : "Spara"}
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={closePeriodiseringForm}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAutoPeriodiseringDialogOpen}
        onClose={closeAutoPeriodisering}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Automatisk periodisering</span>
            <Button
              size="small"
              className={styles.freightCancelButton}
              onClick={closeAutoPeriodisering}
            >
              Avbryt
            </Button>
          </div>
          <div className={styles.autoPeriodiseringStepTopRow}>
            <div className={styles.autoPeriodiseringStepBar}>
              {(["Antal rader", "Leveransvecka", "Märken"] as const).map((label, i) => (
                <div key={label} className={styles.autoPeriodiseringStepBarItem}>
                  {i > 0 && <div className={styles.autoPeriodiseringStepConnector} />}
                  <button
                    type="button"
                    className={styles.autoPeriodiseringStepBtn}
                    onClick={() => handleGoToStep(i as 0 | 1 | 2)}
                    disabled={
                      i > autoPeriodiseringStep + 1 ||
                      (i === 1 && !autoCanProceedStep0) ||
                      (i === 2 && !autoCanProceedStep1)
                    }
                  >
                    <div
                      className={[
                        styles.autoPeriodiseringStepCircle,
                        autoPeriodiseringStep > i ? styles.autoPeriodiseringStepDone : "",
                        autoPeriodiseringStep === i ? styles.autoPeriodiseringStepActive : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={[
                        styles.autoPeriodiseringStepLabel,
                        autoPeriodiseringStep === i ? styles.autoPeriodiseringStepLabelActive : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {label}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogTitle>

        <DialogContent className={styles.freightDialogContent}>
          {autoPeriodiseringStep === 0 ? (
            <div className={styles.autoPeriodiseringStepContent}>
              <div className={styles.autoPeriodiseringModeToggle}>
                <button
                  type="button"
                  className={[
                    styles.autoPeriodiseringModeBtn,
                    autoPeriodiseringDraft.step0Mode === "mangdPerRad"
                      ? styles.autoPeriodiseringModeBtnActive
                      : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() =>
                    setAutoPeriodiseringDraft((prev) => ({ ...prev, step0Mode: "mangdPerRad" }))
                  }
                >
                  Mängd per rad
                </button>
                <button
                  type="button"
                  className={[
                    styles.autoPeriodiseringModeBtn,
                    autoPeriodiseringDraft.step0Mode === "antalRader"
                      ? styles.autoPeriodiseringModeBtnActive
                      : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() =>
                    setAutoPeriodiseringDraft((prev) => ({ ...prev, step0Mode: "antalRader" }))
                  }
                >
                  Antal rader
                </button>
              </div>
              <div className={styles.avropFormGrid}>
                {autoPeriodiseringDraft.step0Mode === "antalRader" ? (
                  <div className={styles.freightFormField}>
                    <Typography className={styles.freightFormLabel}>Antal periodiseringsrader</Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="4"
                      inputProps={{ min: 1, step: 1 }}
                      value={autoPeriodiseringDraft.antalRader}
                      onChange={(e) =>
                        setAutoPeriodiseringDraft((prev) => ({ ...prev, antalRader: e.target.value }))
                      }
                      className={styles.freightFormInput}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className={styles.freightFormField}>
                    <Typography className={styles.freightFormLabel}>Mängd per rad ({volumeUnit})</Typography>
                    <TextField
                      size="small"
                      placeholder={formatSvVolume(autoTotalAttFordela / 4)}
                      value={autoPeriodiseringDraft.mangdPerRad}
                      onChange={(e) =>
                        setAutoPeriodiseringDraft((prev) => ({ ...prev, mangdPerRad: e.target.value }))
                      }
                      className={styles.freightFormInput}
                      autoFocus
                    />
                  </div>
                )}
              </div>
              {(autoPeriodiseringDraft.step0Mode === "antalRader"
                ? autoPeriodiseringDraft.antalRader.trim() !== ""
                : autoPeriodiseringDraft.mangdPerRad.trim() !== "") ? (
                <div className={styles.periodiseringAutoPreview}>
                  {autoAntalRader > 0 && autoMangdPerRad !== null ? (
                    <span className={styles.periodiseringAutoPreviewText}>
                      Skapar{" "}
                      <strong>{autoAntalRader} rader</strong> à{" "}
                      <strong>{formatSvVolume(autoMangdPerRad)} {volumeUnit}</strong>
                      {autoAntalRader > 1 && autoSistaRadVolym !== null &&
                        Math.abs(autoSistaRadVolym - autoMangdPerRad) > PERIODISERING_SUM_EPSILON
                        ? ` (sista: ${formatSvVolume(Math.max(0, autoSistaRadVolym))} ${volumeUnit})`
                        : ""}
                    </span>
                  ) : (
                    <span className={styles.periodiseringAutoPreviewTextDim}>
                      {autoPeriodiseringDraft.step0Mode === "antalRader"
                        ? "Ange ett giltigt antal rader."
                        : "Ange en giltig mängd per rad."}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ) : autoPeriodiseringStep === 1 ? (
            <div className={styles.autoPeriodiseringStepContent}>
              <div className={styles.autoPeriodiseringModeToggle}>
                {(["sprid", "olika"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={[
                      styles.autoPeriodiseringModeBtn,
                      autoPeriodiseringDraft.step1Mode === mode
                        ? styles.autoPeriodiseringModeBtnActive
                        : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() =>
                      setAutoPeriodiseringDraft((prev) => ({ ...prev, step1Mode: mode }))
                    }
                  >
                    {mode === "sprid" ? "Sprid jämnt" : "Välj veckor"}
                  </button>
                ))}
              </div>
              {autoPeriodiseringDraft.step1Mode === "sprid" ? (
                <div className={styles.autoPeriodiseringSpreadPreview}>
                  <div className={styles.autoPeriodiseringSpreadPreviewInfo}>
                    <span className={styles.freightFormLabel}>Lev. fönster min</span>
                    <span className={styles.autoPeriodiseringSpreadValue}>
                      {deliveryWindowMin || "—"}
                    </span>
                    <ArrowForwardIcon style={{ fontSize: 14, color: "#748195" }} />
                    <span className={styles.freightFormLabel}>Lev. fönster max</span>
                    <span className={styles.autoPeriodiseringSpreadValue}>
                      {deliveryWindowMax || "—"}
                    </span>
                  </div>
                  {autoAntalRader > 0 ? (
                    <div className={styles.autoPeriodiseringWeekList}>
                      {autoWeeks.map((week, i) => (
                        <div key={i} className={styles.autoPeriodiseringWeekChip}>
                          <span className={styles.autoPeriodiseringWeekChipIndex}>Rad {i + 1}</span>
                          <span className={styles.autoPeriodiseringWeekChipWeek}>{week || "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className={styles.autoPeriodiseringMarkFillRow} style={{ marginTop: 8 }}>
                    <Typography className={styles.freightFormLabel}>Fyll alla:</Typography>
                    <input
                      type="text"
                      placeholder="202550"
                      className={styles.autoPeriodiseringMarkInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAutoPeriodiseringDraft((prev) => ({
                          ...prev,
                          rowWeeks: prev.rowWeeks.map(() => v),
                        }));
                      }}
                    />
                  </div>
                  <div className={styles.autoPeriodiseringMarkTable}>
                    <div className={styles.autoPeriodiseringMarkTableHead} style={{ gridTemplateColumns: "40px 1fr" }}>
                      <span className={styles.autoPeriodiseringMarkCol}>Rad</span>
                      <span className={styles.autoPeriodiseringMarkCol}>Leveransvecka</span>
                    </div>
                    {autoPeriodiseringDraft.rowWeeks.map((week, i) => (
                      <div key={i} className={styles.autoPeriodiseringMarkTableRow} style={{ gridTemplateColumns: "40px 1fr" }}>
                        <span className={`${styles.autoPeriodiseringMarkCol} ${styles.autoPeriodiseringMarkRowNum}`}>
                          {i + 1}
                        </span>
                        <span className={styles.autoPeriodiseringMarkCol}>
                          <input
                            type="text"
                            placeholder="202550"
                            value={week}
                            className={styles.periodiseringMarkGhostInput}
                            onChange={(e) => setAutoRowWeek(i, e.target.value)}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.autoPeriodiseringStepContent}>
              <div className={styles.autoPeriodiseringMarkenFillRow}>
                <Typography className={styles.freightFormLabel}>Fyll alla:</Typography>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Kundens märke"
                    className={styles.autoPeriodiseringMarkInput}
                    onChange={(e) => setAllAutoRowMarks("kundensMarke", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Godsmottagarens märke"
                    className={styles.autoPeriodiseringMarkInput}
                    onChange={(e) => setAllAutoRowMarks("godsmottagarensMarke", e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.autoPeriodiseringMarkTable}>
                <div className={styles.autoPeriodiseringMarkTableHead}>
                  <span className={styles.autoPeriodiseringMarkCol}>Rad</span>
                  <span className={styles.autoPeriodiseringMarkCol}>Leveransvecka</span>
                  <span className={styles.autoPeriodiseringMarkCol}>Kundens märke</span>
                  <span className={styles.autoPeriodiseringMarkCol}>Godsmottagarens märke</span>
                </div>
                {autoPeriodiseringDraft.rowMarks.map((mark, i) => (
                  <div key={i} className={styles.autoPeriodiseringMarkTableRow}>
                    <span
                      className={`${styles.autoPeriodiseringMarkCol} ${styles.autoPeriodiseringMarkRowNum}`}
                    >
                      {i + 1}
                    </span>
                    <span className={styles.autoPeriodiseringMarkCol}>
                      {autoWeeks[i] || "—"}
                    </span>
                    <span className={styles.autoPeriodiseringMarkCol}>
                      <input
                        type="text"
                        placeholder="—"
                        value={mark.kundensMarke}
                        className={styles.periodiseringMarkGhostInput}
                        onChange={(e) => setAutoRowMark(i, "kundensMarke", e.target.value)}
                      />
                    </span>
                    <span className={styles.autoPeriodiseringMarkCol}>
                      <input
                        type="text"
                        placeholder="—"
                        value={mark.godsmottagarensMarke}
                        className={styles.periodiseringMarkGhostInput}
                        onChange={(e) =>
                          setAutoRowMark(i, "godsmottagarensMarke", e.target.value)
                        }
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className={styles.freightDialogActions}>
          {autoPeriodiseringStep !== 0 && (
            <Button
              size="small"
              className={styles.freightCancelButton}
              onClick={() =>
                setAutoPeriodiseringStep((prev) => (prev - 1) as 0 | 1 | 2)
              }
            >
              Tillbaka
            </Button>
          )}
          {autoPeriodiseringStep < 2 ? (
            <Button
              size="small"
              className={styles.freightSaveButton}
              onClick={handleNextStepAuto}
              disabled={!autoCanProceedCurrentStep}
            >
              Nästa
            </Button>
          ) : (
            <Button
              size="small"
              className={styles.freightSaveButton}
              onClick={createAutoPeriodiseringRows}
            >
              Skapa periodiseringsrader
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        key={`periodiering-create-${periodiseringCreateFeedback.key}`}
        open={periodiseringCreateFeedback.open}
        autoHideDuration={2200}
        onClose={() => setPeriodiseringCreateFeedback((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPeriodiseringCreateFeedback((previous) => ({ ...previous, open: false }))}
          severity="success"
          variant="filled"
        >
          Post skapad
        </Alert>
      </Snackbar>

      <Snackbar
        key={`periodiering-validation-${periodiseringValidationFeedback.key}`}
        open={periodiseringValidationFeedback.open}
        autoHideDuration={3600}
        onClose={() => setPeriodiseringValidationFeedback((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPeriodiseringValidationFeedback((previous) => ({ ...previous, open: false }))}
          severity="warning"
          variant="filled"
        >
          {periodiseringValidationFeedback.message}
        </Alert>
      </Snackbar>
    </>
  );
}

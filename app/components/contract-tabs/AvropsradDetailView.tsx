"use client";

import AddIcon from "@mui/icons-material/Add";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

// ── Types ───────────────────────────────────────────────────────────────────────

type LangdFordelningRow = {
  id: string;
  langd: string;
  mangd: string;
  enhet: string;
};

type LangdFordelningFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<LangdFordelningRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<LangdFordelningRow, "id"> };

type AvropsradDraft = {
  artNr: string;
  levereraArtNr: string;
  fakturatext: string;
  mangd: string;
  aPris: string;
  enhet: string;
  volym: string;
  leveransvecka: string;
  leveransdag: string;
  levTidigast: string;
  levSenast: string;
  lastorderVolym: string;
  leveradVolym: string;
  internKommentar: string;
  kundmarke: string;
};

// ── Constants ───────────────────────────────────────────────────────────────────

const LANGDFORDELNING_COLUMNS = [
  { key: "langd", label: "Längd" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Enhet" },
  { key: "_actions", label: "", pinnedRight: true },
];

const emptyLangdFordelningRow = (): Omit<LangdFordelningRow, "id"> => ({
  langd: "",
  mangd: "",
  enhet: "m3 nominell",
});

const emptyDraft = (): AvropsradDraft => ({
  artNr: "",
  levereraArtNr: "",
  fakturatext: "",
  mangd: "",
  aPris: "",
  enhet: "m3 nominell",
  volym: "",
  leveransvecka: "",
  leveransdag: "",
  levTidigast: "",
  levSenast: "",
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
  initialData?: Record<string, string>;
};

// ── Component ────────────────────────────────────────────────────────────────────

export function AvropsradDetailView({ avropsradId, onClose, onSave, initialData }: AvropsradDetailViewProps) {
  const isNew = avropsradId === "new";
  const [generatedId] = useState(() => `${Math.floor(1000 + Math.random() * 9000)}`);
  const [draft, setDraft] = useState<AvropsradDraft>(() =>
    initialData ? { ...emptyDraft(), ...(initialData as Partial<AvropsradDraft>) } : emptyDraft()
  );
  const [expandedSections, setExpandedSections] = useState<string[]>(["artikel", "volym", "leverans", "ovrigt", "langd"]);
  const [langdFordelningRows, setLangdFordelningRows] = useState<LangdFordelningRow[]>([]);
  const [selectedLangdRow, setSelectedLangdRow] = useState<number | null>(null);
  const [langdForm, setLangdForm] = useState<LangdFordelningFormState>({ mode: "closed" });
  const [keepLangdDialogOpen, setKeepLangdDialogOpen] = useState(true);
  const [keepLangdValues, setKeepLangdValues] = useState(false);
  const [lastLangdDraft, setLastLangdDraft] = useState<Omit<LangdFordelningRow, "id"> | null>(null);
  const [langdCreateFeedback, setLangdCreateFeedback] = useState({ open: false, key: 0 });

  const set = (key: keyof AvropsradDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const displayId = isNew ? generatedId : avropsradId;
  const title = isNew ? "Ny avropsrad" : `Redigera avropsrad ${displayId}`;

  const f = (label: string, node: React.ReactNode) => (
    <div className={styles.freightFormField}>
      <Typography className={styles.freightFormLabel}>{label}</Typography>
      {node}
    </div>
  );

  const openLangdAdd = () => {
    setKeepLangdValues(false);
    const initialDraft = keepLangdValues && lastLangdDraft ? lastLangdDraft : emptyLangdFordelningRow();
    setLangdForm({ mode: "add", draft: initialDraft });
    setSelectedLangdRow(null);
  };

  const openLangdEdit = (index: number) => {
    setKeepLangdValues(false);
    const row = langdFordelningRows[index];
    if (!row) return;
    const { id, ...draft } = row;
    setLangdForm({ mode: "edit", id, draft });
    setSelectedLangdRow(index);
  };

  const openLangdClone = (index: number) => {
    setKeepLangdValues(false);
    const row = langdFordelningRows[index];
    if (!row) return;
    const { id: _id, ...draft } = row;
    setLangdForm({ mode: "add", draft });
    setSelectedLangdRow(null);
  };

  const closeLangdForm = () => setLangdForm({ mode: "closed" });

  const setLangdDraftField = (key: keyof Omit<LangdFordelningRow, "id">, value: string) => {
    setLangdForm((prev) =>
      prev.mode === "closed" ? prev : { ...prev, draft: { ...prev.draft, [key]: value } }
    );
  };

  const saveLangdForm = () => {
    if (langdForm.mode === "closed") return;
    const nextDraft = { ...langdForm.draft };
    if (langdForm.mode === "add") {
      setLangdFordelningRows((prev) => [
        ...prev,
        { id: `ld-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft },
      ]);
      setLastLangdDraft(keepLangdValues ? nextDraft : null);
      setLangdCreateFeedback((prev) => ({ open: true, key: prev.key + 1 }));
      if (keepLangdDialogOpen) {
        setLangdForm({ mode: "add", draft: keepLangdValues ? nextDraft : emptyLangdFordelningRow() });
        return;
      }
    }
    if (langdForm.mode === "edit") {
      setLangdFordelningRows((prev) =>
        prev.map((row) => row.id === langdForm.id ? { ...row, ...nextDraft } : row)
      );
      if (keepLangdDialogOpen) {
        setLangdForm({ mode: "edit", id: langdForm.id, draft: nextDraft });
        return;
      }
    }
    closeLangdForm();
  };

  const deleteLangdRow = (index: number) => {
    const row = langdFordelningRows[index];
    if (!row) return;
    setLangdFordelningRows((prev) => prev.filter((r) => r.id !== row.id));
    setSelectedLangdRow((prev) => (prev === index ? null : prev));
    closeLangdForm();
  };

  const langdDraft = langdForm.mode !== "closed" ? langdForm.draft : null;
  const isLangdDialogOpen = langdDraft !== null;

  // ── Main view ─────────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.contractDetailPanel} ${styles.lineItemCreatePanel}`}>
      {/* Top bar */}
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>{title}</Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          <Button size="small" className={styles.freightSaveButton} onClick={onSave}>
            Spara
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
            Avbryt
          </Button>
        </div>
      </div>

      <div className={styles.avropsradFormWrap}>

        {/* Artikel */}
        <Accordion
          expanded={expandedSections.includes("artikel")}
          onChange={() => toggleSection("artikel")}
          disableGutters
          elevation={0}
          className={styles.contractSectionAccordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={`${styles.contractSectionSummary} ${styles.contractModernAccordionSummary}`}
          >
            <span className={styles.contractSectionTitleRow}>
              <Inventory2OutlinedIcon className={styles.contractSectionIcon} />
              <Typography className={styles.contractSectionTitle}>Artikel</Typography>
            </span>
          </AccordionSummary>
          <AccordionDetails className={styles.contractSectionDetailsArea}>
            <div className={styles.avropsradFormGrid}>
              {f("ArtNr", <Select size="small" value={draft.artNr} onChange={(e) => set("artNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select>)}
              {f("Leverera ArtNr", <Select size="small" value={draft.levereraArtNr} onChange={(e) => set("levereraArtNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select>)}
              {f("Fakturatext", <TextField size="small" value={draft.fakturatext} onChange={(e) => set("fakturatext", e.target.value)} className={styles.freightFormInput} />)}
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Volym & pris */}
        <Accordion
          expanded={expandedSections.includes("volym")}
          onChange={() => toggleSection("volym")}
          disableGutters
          elevation={0}
          className={styles.contractSectionAccordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={`${styles.contractSectionSummary} ${styles.contractModernAccordionSummary}`}
          >
            <span className={styles.contractSectionTitleRow}>
              <LocalOfferOutlinedIcon className={styles.contractSectionIcon} />
              <Typography className={styles.contractSectionTitle}>Volym &amp; pris</Typography>
            </span>
          </AccordionSummary>
          <AccordionDetails className={styles.contractSectionDetailsArea}>
            <div className={styles.avropsradFormGrid}>
              {f("Mängd", <TextField size="small" value={draft.mangd} onChange={(e) => set("mangd", e.target.value)} className={styles.freightFormInput} />)}
              {f("Apris", <TextField size="small" value={draft.aPris} onChange={(e) => set("aPris", e.target.value)} className={styles.freightFormInput} />)}
              {f("Beställd enhet", <Select size="small" value={draft.enhet} onChange={(e) => set("enhet", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="m3 nominell">m3 nominell</MenuItem><MenuItem value="m3 fast">m3 fast</MenuItem><MenuItem value="lpm">lpm</MenuItem><MenuItem value="st">st</MenuItem></Select>)}
              {f("Volym", <TextField size="small" value={draft.volym} onChange={(e) => set("volym", e.target.value)} className={styles.freightFormInput} />)}
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Leverans */}
        <Accordion
          expanded={expandedSections.includes("leverans")}
          onChange={() => toggleSection("leverans")}
          disableGutters
          elevation={0}
          className={styles.contractSectionAccordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={`${styles.contractSectionSummary} ${styles.contractModernAccordionSummary}`}
          >
            <span className={styles.contractSectionTitleRow}>
              <LocalShippingOutlinedIcon className={styles.contractSectionIcon} />
              <Typography className={styles.contractSectionTitle}>Leverans</Typography>
            </span>
          </AccordionSummary>
          <AccordionDetails className={styles.contractSectionDetailsArea}>
            <div className={styles.avropsradFormGrid}>
              {f("Leveransvecka", <TextField size="small" value={draft.leveransvecka} onChange={(e) => set("leveransvecka", e.target.value)} className={styles.freightFormInput} />)}
              {f("Leveransdag", <Select size="small" value={draft.leveransdag} onChange={(e) => set("leveransdag", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Måndag">Måndag</MenuItem><MenuItem value="Tisdag">Tisdag</MenuItem><MenuItem value="Onsdag">Onsdag</MenuItem><MenuItem value="Torsdag">Torsdag</MenuItem><MenuItem value="Fredag">Fredag</MenuItem></Select>)}
              {f("Lev. tidigast", <TextField size="small" type="date" value={draft.levTidigast} onChange={(e) => set("levTidigast", e.target.value)} className={styles.freightFormInput} />)}
              {f("Lev. senast", <TextField size="small" type="date" value={draft.levSenast} onChange={(e) => set("levSenast", e.target.value)} className={styles.freightFormInput} />)}
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Övrigt */}
        <Accordion
          expanded={expandedSections.includes("ovrigt")}
          onChange={() => toggleSection("ovrigt")}
          disableGutters
          elevation={0}
          className={styles.contractSectionAccordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={`${styles.contractSectionSummary} ${styles.contractModernAccordionSummary}`}
          >
            <span className={styles.contractSectionTitleRow}>
              <CategoryOutlinedIcon className={styles.contractSectionIcon} />
              <Typography className={styles.contractSectionTitle}>Övrigt</Typography>
            </span>
          </AccordionSummary>
          <AccordionDetails className={styles.contractSectionDetailsArea}>
            <div className={styles.avropsradFormGrid}>
              {f("Lastorder volym", <TextField size="small" value={draft.lastorderVolym} onChange={(e) => set("lastorderVolym", e.target.value)} className={styles.freightFormInput} />)}
              {f("Levererad volym", <TextField size="small" value={draft.leveradVolym} onChange={(e) => set("leveradVolym", e.target.value)} className={styles.freightFormInput} />)}
              {f("Intern kommentar", <TextField size="small" value={draft.internKommentar} onChange={(e) => set("internKommentar", e.target.value)} className={styles.freightFormInput} />)}
              {f("Kundmärke", <TextField size="small" value={draft.kundmarke} onChange={(e) => set("kundmarke", e.target.value)} className={styles.freightFormInput} />)}
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Längdfördelning */}
        <Accordion
          expanded={expandedSections.includes("langd")}
          onChange={() => toggleSection("langd")}
          disableGutters
          elevation={0}
          className={styles.contractSectionAccordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={`${styles.contractSectionSummary} ${styles.contractModernAccordionSummary}`}
          >
            <span className={styles.contractSectionTitleRow}>
              <BarChartOutlinedIcon className={styles.contractSectionIcon} />
              <Typography className={styles.contractSectionTitle}>Längdfördelning</Typography>
            </span>
          </AccordionSummary>
          <AccordionDetails className={styles.contractSectionDetailsArea}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <Button className={styles.freightNewButton} startIcon={<AddIcon />} onClick={openLangdAdd}>
                Lägg till
              </Button>
            </div>
            <div className={styles.lineItemsTableFrame}>
              <div className={styles.freightTableWrap}>
                <div className={styles.freightTable}>
                  <DataTable
                    variant="line"
                    fillRemainingSpace
                    columns={LANGDFORDELNING_COLUMNS}
                    rows={langdFordelningRows}
                    rowKey={(row, index) => `${row.id}-${index}`}
                    selectedRowIndex={selectedLangdRow}
                    onRowClick={(index) => setSelectedLangdRow((prev) => (prev === index ? null : index))}
                    renderCell={(row, column, rowIndex) => {
                      if (column.key === "_actions") {
                        return (
                          <span className={styles.freightActionCell}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openLangdEdit(rowIndex); }} title="Redigera rad">
                              <EditOutlinedIcon className={styles.freightActionIcon} />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openLangdClone(rowIndex); }} title="Duplicera rad">
                              <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteLangdRow(rowIndex); }} title="Ta bort rad">
                              <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                            </IconButton>
                          </span>
                        );
                      }
                      const value = (row as Record<string, string>)[column.key as string];
                      return value?.trim() ? value : "-";
                    }}
                  />
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        <Dialog
          open={isLangdDialogOpen}
          onClose={closeLangdForm}
          fullWidth
          maxWidth="md"
          classes={{ paper: styles.freightDialogPaper }}
        >
          <DialogTitle className={styles.freightDialogTitle}>
            <div className={styles.freightDialogTitleRow}>
              <span>{langdForm.mode === "add" ? "Ny längdfördelning" : "Redigera längdfördelning"}</span>
              {langdForm.mode === "add" ? (
                <div className={styles.freightDialogToggles}>
                  <label className={styles.freightDialogKeepOpen}>
                    <Checkbox
                      size="small"
                      checked={keepLangdDialogOpen}
                      onChange={(e) => setKeepLangdDialogOpen(e.target.checked)}
                    />
                    <span>Behåll öppen</span>
                  </label>
                  <label className={styles.freightDialogKeepOpen}>
                    <Checkbox
                      size="small"
                      checked={keepLangdValues}
                      onChange={(e) => {
                        setKeepLangdValues(e.target.checked);
                        if (e.target.checked) setKeepLangdDialogOpen(true);
                      }}
                    />
                    <span>Behåll värden</span>
                  </label>
                </div>
              ) : null}
            </div>
          </DialogTitle>
          <DialogContent className={styles.freightDialogContent}>
            {langdDraft !== null ? (
              <div className={styles.avropFormGrid}>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Längd</Typography>
                  <TextField size="small" value={langdDraft.langd} onChange={(e) => setLangdDraftField("langd", e.target.value)} className={styles.freightFormInput} />
                </div>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Mängd</Typography>
                  <TextField size="small" value={langdDraft.mangd} onChange={(e) => setLangdDraftField("mangd", e.target.value)} className={styles.freightFormInput} />
                </div>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Enhet</Typography>
                  <Select size="small" value={langdDraft.enhet} onChange={(e) => setLangdDraftField("enhet", String(e.target.value))} className={styles.freightFormInput}>
                    <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                    <MenuItem value="m3 fast">m3 fast</MenuItem>
                    <MenuItem value="lpm">lpm</MenuItem>
                    <MenuItem value="st">st</MenuItem>
                  </Select>
                </div>
              </div>
            ) : null}
          </DialogContent>
          <DialogActions className={styles.freightDialogActions}>
            <Button size="small" className={styles.freightSaveButton} onClick={saveLangdForm}>
              {langdForm.mode === "add" ? "Lägg till" : "Spara"}
            </Button>
            <Button size="small" className={styles.freightCancelButton} onClick={closeLangdForm}>
              Avbryt
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          key={`langd-create-${langdCreateFeedback.key}`}
          open={langdCreateFeedback.open}
          autoHideDuration={2200}
          onClose={() => setLangdCreateFeedback((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setLangdCreateFeedback((prev) => ({ ...prev, open: false }))}
            severity="success"
            variant="filled"
          >
            Post skapad
          </Alert>
        </Snackbar>

      </div>
    </div>
  );
}

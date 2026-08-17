"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import styles from "../page.module.scss";

export type NewPriceListDraft = {
  // Allmänt
  prislistenr: string;
  kopieratFran: string;
  status: string;
  upprattatAv: string;
  kund: string;
  prislistedatum: string;
  giltigFran: string;
  giltigTill: string;
  kontaktbolag: string;
  kundensReferens: string;
  externPrislistenr: string;
  kategori: string;
  land: string;
  sprak: string;
  ovrigt: string;
  egenAnmarkning: string;
  kommentarKund: string;
  // Villkor
  valuta: string;
  kurs: string;
  kalkylkurs: string;
  moms: string;
  betvillkor: string;
  betvillkorDag: string;
  kassarabatt: string;
  bonus: string;
  bonusgrund: string;
  kontraktsformular: string;
  leveransvillkor: string;
  leveransvillkor2: string;
  levvillkorOrt: string;
  leveranssatt: string;
  agent: string;
  provisionAgent: string;
  konsignationslager: boolean;
  plocktillaggMinst: string;
  plocktillagg: string;
  malningstilagg: string;
  malningstilaggTroskel: string;
  inforseavgift: string;
  // Utskrift
  utskriftstyp: string;
  visaM3Pris: boolean;
  visaNamnAdress: boolean;
};

const emptyDraft: NewPriceListDraft = {
  prislistenr: "",
  kopieratFran: "",
  status: "",
  upprattatAv: "",
  kund: "",
  prislistedatum: "",
  giltigFran: "",
  giltigTill: "",
  kontaktbolag: "",
  kundensReferens: "",
  externPrislistenr: "",
  kategori: "",
  land: "",
  sprak: "",
  ovrigt: "",
  egenAnmarkning: "",
  kommentarKund: "",
  valuta: "",
  kurs: "",
  kalkylkurs: "",
  moms: "",
  betvillkor: "",
  betvillkorDag: "",
  kassarabatt: "",
  bonus: "",
  bonusgrund: "",
  kontraktsformular: "",
  leveransvillkor: "",
  leveransvillkor2: "",
  levvillkorOrt: "",
  leveranssatt: "",
  agent: "",
  provisionAgent: "",
  konsignationslager: false,
  plocktillaggMinst: "",
  plocktillagg: "",
  malningstilagg: "",
  malningstilaggTroskel: "",
  inforseavgift: "",
  utskriftstyp: "",
  visaM3Pris: false,
  visaNamnAdress: false,
};

type PriceListCreateViewProps = {
  onSave?: (draft: NewPriceListDraft) => void;
  onCancel?: () => void;
  initialDraft?: NewPriceListDraft;
  title?: string;
  mode?: "create" | "edit";
};

export function PriceListCreateView({
  onSave,
  onCancel,
  initialDraft,
  title = "Ny prislista",
  mode = "create",
}: PriceListCreateViewProps) {
  const [draft, setDraft] = useState<NewPriceListDraft>(initialDraft ?? emptyDraft);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(["allmant", "villkor", "utskrift"]);
  const [isEditing, setIsEditing] = useState(true);
  const accordionWrapRef = useRef<HTMLDivElement | null>(null);

  const update = (key: keyof NewPriceListDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const togglePanel = (panel: string) =>
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );

  const getFastTrackFocusableElements = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemRequiredControl} .MuiInputBase-root`));

  const handleFastTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
    const container = accordionWrapRef.current;
    if (!container) return;
    const controls = getFastTrackFocusableElements(container);
    if (controls.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const currentIndex = controls.findIndex((el) => el === active || el.contains(active));
    event.preventDefault();
    if (currentIndex === -1) { controls[0]?.focus(); return; }
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + controls.length) % controls.length
      : (currentIndex + 1) % controls.length;
    controls[nextIndex]?.focus();
  };

  const isEdit = mode === "edit";

  const canSave = isEdit || (
    draft.status !== "" &&
    draft.upprattatAv !== "" &&
    draft.kund !== "" &&
    draft.prislistedatum !== "" &&
    draft.sprak !== "" &&
    draft.valuta !== "" &&
    draft.betvillkor !== "" &&
    draft.kontraktsformular !== "" &&
    draft.leveransvillkor !== "" &&
    draft.provisionAgent !== "" &&
    draft.plocktillaggMinst !== "" &&
    draft.plocktillagg !== "" &&
    draft.malningstilagg !== "" &&
    draft.malningstilaggTroskel !== "" &&
    draft.inforseavgift !== "" &&
    draft.utskriftstyp !== ""
  );

  const kursAdornment = draft.valuta ? `${draft.valuta} = 1 SEK` : "valuta = 1 SEK";

  return (
    <>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle} style={{ letterSpacing: "-0.5px" }}>
            {title}
          </Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          {isEditing ? (
            <Button
              className={styles.contractSaveButton}
              size="small"
              disabled={!canSave}
              onClick={() => onSave?.(draft)}
            >
              {isEdit ? "Spara" : "Skapa prislista"}
            </Button>
          ) : (
            <Button
              className={styles.contractSaveButton}
              size="small"
              onClick={() => setIsEditing(true)}
            >
              Redigera
            </Button>
          )}
          <Button
            className={styles.contractQuickActionButton}
            size="small"
            onClick={isEditing && isEdit ? () => setIsEditing(false) : onCancel}
          >
            {isEditing && isEdit ? "Avbryt" : "Stäng"}
          </Button>
        </div>
      </div>

      <div
        className={`${styles.detailTwoColumnLayout} ${styles.lineItemCreateStackLayout} ${styles.contractCreateLayout}`}
        style={{ flex: 1, overflowY: "auto" }}
      >
        <div className={styles.detailFormColumn}>
          <fieldset disabled={!isEditing} style={{ border: "none", margin: 0, padding: 0 }}>
            <div
              ref={accordionWrapRef}
              className={styles.contractModernAccordionWrap}
              onKeyDownCapture={handleFastTrackKeyDown}
            >

              {/* ── Snabbspår ── */}
              {isEditing ? (
                <div className={styles.lineItemFastTrackBar}>
                  <div className={styles.lineItemFastTrackMain}>
                    <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
                    <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
                    <span className={styles.lineItemFastTrackText}>
                      Tryck Ctrl+Enter för att hoppa mellan obligatoriska fält
                    </span>
                  </div>
                </div>
              ) : null}

              {/* ── Allmänt ── */}
              <Accordion
                expanded={expandedPanels.includes("allmant")}
                onChange={() => togglePanel("allmant")}
                disableGutters
                elevation={0}
                className={styles.contractSectionAccordion}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <InfoOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>

                  <Typography className={styles.contractSectionGroupLabel}>Grunduppgifter</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      fullWidth size="small"
                      label="Prislistenr"
                      value={draft.prislistenr}
                      onChange={(e) => update("prislistenr", e.target.value)}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Kopierat från"
                      value={draft.kopieratFran}
                      onChange={(e) => update("kopieratFran", e.target.value)}
                    />
                    <TextField
                      select fullWidth size="small"
                      label="Status"
                      value={draft.status}
                      onChange={(e) => update("status", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Godkänd">Godkänd</MenuItem>
                      <MenuItem value="Utkast">Utkast</MenuItem>
                      <MenuItem value="Inaktiv">Inaktiv</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Upprättat av"
                      value={draft.upprattatAv}
                      onChange={(e) => update("upprattatAv", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Per-Ola Engerup">Per-Ola Engerup</MenuItem>
                      <MenuItem value="Erik Högbom">Erik Högbom</MenuItem>
                      <MenuItem value="Hans Hemström">Hans Hemström</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Kund"
                      value={draft.kund}
                      onChange={(e) => update("kund", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Martinsons">Martinsons</MenuItem>
                      <MenuItem value="Skogmo Bruk">Skogmo Bruk</MenuItem>
                      <MenuItem value="Hernes">Hernes</MenuItem>
                      <MenuItem value="JäTre">JäTre</MenuItem>
                      <MenuItem value="Moelv Tre">Moelv Tre</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Prislistedatum"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={draft.prislistedatum}
                      onChange={(e) => update("prislistedatum", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Giltighetstid</Typography>
                  <div className={styles.contractModernFormGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <TextField
                      fullWidth size="small"
                      label="Giltig från"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={draft.giltigFran}
                      onChange={(e) => update("giltigFran", e.target.value)}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Giltig till"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={draft.giltigTill}
                      onChange={(e) => update("giltigTill", e.target.value)}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Klassificering</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Kontaktbolag"
                      value={draft.kontaktbolag}
                      onChange={(e) => update("kontaktbolag", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Pure Wood AB">Pure Wood AB</MenuItem>
                      <MenuItem value="Nordic Timber AS">Nordic Timber AS</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Kundens referens"
                      value={draft.kundensReferens}
                      onChange={(e) => update("kundensReferens", e.target.value)}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Externt prislistenr"
                      value={draft.externPrislistenr}
                      onChange={(e) => update("externPrislistenr", e.target.value)}
                    />
                    <TextField
                      select fullWidth size="small"
                      label="Kategori"
                      value={draft.kategori}
                      onChange={(e) => update("kategori", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                      <MenuItem value="Sågverk">Sågverk</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Land"
                      value={draft.land}
                      onChange={(e) => update("land", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="SE">SE — Sverige</MenuItem>
                      <MenuItem value="NO">NO — Norge</MenuItem>
                      <MenuItem value="FI">FI — Finland</MenuItem>
                      <MenuItem value="DK">DK — Danmark</MenuItem>
                      <MenuItem value="DE">DE — Tyskland</MenuItem>
                      <MenuItem value="EE">EE — Estland</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Språk"
                      value={draft.sprak}
                      onChange={(e) => update("sprak", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Svenska">Svenska</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Norsk">Norsk</MenuItem>
                      <MenuItem value="Suomi">Suomi</MenuItem>
                      <MenuItem value="Dansk">Dansk</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Övrigt"
                      value={draft.ovrigt}
                      onChange={(e) => update("ovrigt", e.target.value)}
                      helperText="Visas på utskrift av prislista"
                      style={{ gridColumn: "1 / -1" }}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Egen anmärkning"
                      value={draft.egenAnmarkning}
                      onChange={(e) => update("egenAnmarkning", e.target.value)}
                      style={{ gridColumn: "1 / -1" }}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Kommentar kund"
                      value={draft.kommentarKund}
                      onChange={(e) => update("kommentarKund", e.target.value)}
                      style={{ gridColumn: "1 / -1" }}
                    />
                  </div>

                </AccordionDetails>
              </Accordion>

              {/* ── Villkor ── */}
              <Accordion
                expanded={expandedPanels.includes("villkor")}
                onChange={() => togglePanel("villkor")}
                disableGutters
                elevation={0}
                className={styles.contractSectionAccordion}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <GavelOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Villkor</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>

                  <Typography className={styles.contractSectionGroupLabel}>Valuta &amp; kurs</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Valuta"
                      value={draft.valuta}
                      onChange={(e) => update("valuta", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="SEK">SEK</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="NOK">NOK</MenuItem>
                      <MenuItem value="DKK">DKK</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Kurs"
                      value={draft.kurs}
                      onChange={(e) => update("kurs", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{kursAdornment}</InputAdornment>
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Kalkylkurs"
                      value={draft.kalkylkurs}
                      onChange={(e) => update("kalkylkurs", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{kursAdornment}</InputAdornment>
                      }}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Betalning</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Moms"
                      value={draft.moms}
                      onChange={(e) => update("moms", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="25">25 %</MenuItem>
                      <MenuItem value="12">12 %</MenuItem>
                      <MenuItem value="6">6 %</MenuItem>
                      <MenuItem value="0">0 %</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Bet.villkor"
                      value={draft.betvillkor}
                      onChange={(e) => update("betvillkor", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="30">30 dagar netto</MenuItem>
                      <MenuItem value="14">14 dagar netto</MenuItem>
                      <MenuItem value="10">10 dagar netto</MenuItem>
                      <MenuItem value="0">Förskott</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Bet.villkor.dag"
                      type="number"
                      value={draft.betvillkorDag}
                      onChange={(e) => update("betvillkorDag", e.target.value)}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Kassarabatt"
                      value={draft.kassarabatt}
                      onChange={(e) => update("kassarabatt", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Bonus</Typography>
                  <div className={styles.contractModernFormGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <TextField
                      fullWidth size="small"
                      label="Bonus"
                      value={draft.bonus}
                      onChange={(e) => update("bonus", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                    <TextField
                      select fullWidth size="small"
                      label="Bonusgrund"
                      value={draft.bonusgrund}
                      onChange={(e) => update("bonusgrund", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Omsättning">Omsättning</MenuItem>
                      <MenuItem value="Volym">Volym</MenuItem>
                      <MenuItem value="Antal order">Antal order</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Leverans</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Kontraktsformulär"
                      value={draft.kontraktsformular}
                      onChange={(e) => update("kontraktsformular", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Export">Export</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Leveransvillkor"
                      value={draft.leveransvillkor}
                      onChange={(e) => update("leveransvillkor", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                      <MenuItem value="DDP">DDP</MenuItem>
                    </TextField>
                    <TextField
                      select fullWidth size="small"
                      label="Leveransvillkor"
                      value={draft.leveransvillkor2}
                      onChange={(e) => update("leveransvillkor2", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                      <MenuItem value="DDP">DDP</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Lev.villkor ort"
                      value={draft.levvillkorOrt}
                      onChange={(e) => update("levvillkorOrt", e.target.value)}
                    />
                    <TextField
                      select fullWidth size="small"
                      label="Leveranssätt"
                      value={draft.leveranssatt}
                      onChange={(e) => update("leveranssatt", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bil">Bil</MenuItem>
                      <MenuItem value="Tåg">Tåg</MenuItem>
                      <MenuItem value="Båt">Båt</MenuItem>
                      <MenuItem value="Flyg">Flyg</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Agent</Typography>
                  <div className={styles.contractModernFormGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <TextField
                      select fullWidth size="small"
                      label="Agent"
                      value={draft.agent}
                      onChange={(e) => update("agent", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Nordic Agent AB">Nordic Agent AB</MenuItem>
                      <MenuItem value="Baltic Trade AB">Baltic Trade AB</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth size="small"
                      label="Provision agent"
                      value={draft.provisionAgent}
                      onChange={(e) => update("provisionAgent", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Tillägg</Typography>
                  <div style={{ marginTop: 4, marginBottom: 8 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.konsignationslager}
                          onChange={(e) => update("konsignationslager", e.target.checked)}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Konsignationslager</Typography>}
                    />
                  </div>
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      fullWidth size="small"
                      label="Plocktillägg, minst"
                      value={draft.plocktillaggMinst}
                      onChange={(e) => update("plocktillaggMinst", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">SEK/avropsrad</InputAdornment>
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Plocktillägg"
                      value={draft.plocktillagg}
                      onChange={(e) => update("plocktillagg", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%/avropsrad</InputAdornment>
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Målningstillägg"
                      value={draft.malningstilagg}
                      onChange={(e) => update("malningstilagg", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">SEK/avropsrad</InputAdornment>
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Målningstillägg tröskel"
                      value={draft.malningstilaggTroskel}
                      onChange={(e) => update("malningstilaggTroskel", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">lpm</InputAdornment>
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Införselavgift"
                      value={draft.inforseavgift}
                      onChange={(e) => update("inforseavgift", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">SEK</InputAdornment>
                      }}
                    />
                  </div>

                </AccordionDetails>
              </Accordion>

              {/* ── Utskrift ── */}
              <Accordion
                expanded={expandedPanels.includes("utskrift")}
                onChange={() => togglePanel("utskrift")}
                disableGutters
                elevation={0}
                className={styles.contractSectionAccordion}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <PrintOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Utskrift</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <div className={styles.contractModernFormGrid}>

                    <TextField
                      select fullWidth size="small"
                      label="Utskriftstyp"
                      value={draft.utskriftstyp}
                      onChange={(e) => update("utskriftstyp", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Detaljerad">Detaljerad</MenuItem>
                      <MenuItem value="Kompakt">Kompakt</MenuItem>
                    </TextField>

                  </div>

                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.visaM3Pris}
                          onChange={(e) => update("visaM3Pris", e.target.checked)}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Visa även m3-pris</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.visaNamnAdress}
                          onChange={(e) => update("visaNamnAdress", e.target.checked)}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Visa namn/adress</Typography>}
                    />
                  </div>

                </AccordionDetails>
              </Accordion>

            </div>
          </fieldset>
        </div>
      </div>
    </>
  );
}

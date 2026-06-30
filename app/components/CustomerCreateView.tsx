"use client";

import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import styles from "../page.module.scss";

export type NewCustomerDraft = {
  kategori: string;
  sprak: string;
  orgnr: string;
  vatnr: string;
  eorInr: string;
  maerskKundNr: string;
  nordekKundNr: string;
  controlledWoodCode: string;
  cwCodeGiltigTom: string;
  priIdentitet: string;
  medlemsnummer: string;
  kedjansKundnr: string;
  kvk: string;
  ntn: string;
  usci: string;
  kundansvarig: string;
  saljareInnesaljare: string;
  kundgrupp: string;
  kopmonster: string;
  leverantor: string;
  levFonsterFore: string;
  levFonsterEfter: string;
  automatfaktura: boolean;
  kommentarKund: string;
  kommentarBusinessSupport: string;
  kommentarInnesaljare: string;
  kommentarSaljare: string;
  // Fakturaadress
  faktNamn: string;
  faktAdress1: string;
  faktAdress2: string;
  faktPostadress: string;
  faktLand: string;
  // Leveransadress
  levNamn: string;
  levAdress1: string;
  levAdress2: string;
  levPostadress: string;
  levLand: string;
  // Kontakt
  telefon: string;
  epost: string;
  web: string;
  leveransort: string;
  postnummer: string;
  // Villkor
  valuta: string;
  moms: string;
  betvillkor: string;
  betvillkorDag: string;
  kassarabatt: string;
  bonus: string;
  bonusgrund: string;
  ranterutin: string;
  paminnelsekod: string;
  kravRanta: string;
  certifiering: string;
  kontraktsformular: string;
  leveranssatt: string;
  leveransvillkor: string;
  textPaKontrakt: string;
  agent: string;
  provisionAgent: string;
  leveransdatumPaFaktura: boolean;
  inforsElavgift: string;
};

const emptyDraft: NewCustomerDraft = {
  kategori: "",
  sprak: "",
  orgnr: "",
  vatnr: "",
  eorInr: "",
  maerskKundNr: "",
  nordekKundNr: "",
  controlledWoodCode: "",
  cwCodeGiltigTom: "",
  priIdentitet: "",
  medlemsnummer: "",
  kedjansKundnr: "",
  kvk: "",
  ntn: "",
  usci: "",
  kundansvarig: "",
  saljareInnesaljare: "",
  kundgrupp: "",
  kopmonster: "",
  leverantor: "",
  levFonsterFore: "",
  levFonsterEfter: "",
  automatfaktura: false,
  kommentarKund: "",
  kommentarBusinessSupport: "",
  kommentarInnesaljare: "",
  kommentarSaljare: "",
  faktNamn: "",
  faktAdress1: "",
  faktAdress2: "",
  faktPostadress: "",
  faktLand: "",
  levNamn: "",
  levAdress1: "",
  levAdress2: "",
  levPostadress: "",
  levLand: "",
  telefon: "",
  epost: "",
  web: "",
  leveransort: "",
  postnummer: "",
  valuta: "",
  moms: "",
  betvillkor: "",
  betvillkorDag: "",
  kassarabatt: "",
  bonus: "",
  bonusgrund: "",
  ranterutin: "",
  paminnelsekod: "",
  kravRanta: "",
  certifiering: "",
  kontraktsformular: "",
  leveranssatt: "",
  leveransvillkor: "",
  textPaKontrakt: "",
  agent: "",
  provisionAgent: "",
  leveransdatumPaFaktura: false,
  inforsElavgift: "",
};

type CustomerCreateViewProps = {
  onSave?: (draft: NewCustomerDraft) => void;
  onCancel?: () => void;
  initialDraft?: NewCustomerDraft;
  title?: string;
  mode?: "create" | "edit";
};

const LEV_FORE_HELP = "Antal dagar före angiven leveransdag. Om leveransdag saknas är leveransfönstret måndag – fredag i angiven leveransvecka.";
const LEV_EFTER_HELP = "Antal dagar efter angiven leveransdag. Om leveransdag saknas är leveransfönstret måndag – fredag i angiven leveransvecka.";

export function CustomerCreateView({ onSave, onCancel, initialDraft, title = "Ny kund", mode = "create" }: CustomerCreateViewProps) {
  const [draft, setDraft] = useState<NewCustomerDraft>(initialDraft ?? emptyDraft);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(["allmant", "kontakt", "villkor"]);
  const [fastTrackEnabled, setFastTrackEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(mode === "create");
  const accordionWrapRef = useRef<HTMLDivElement | null>(null);

  const update = (key: keyof NewCustomerDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const togglePanel = (panel: string) =>
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );

  const getFastTrackFocusableElements = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemRequiredControl} .MuiInputBase-root`));

  const handleFastTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!fastTrackEnabled || event.key !== "Tab") return;
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
  const bonusIsSet = Number(draft.bonus) > 0;

  const canSave = isEdit || (
    draft.kategori !== "" &&
    draft.sprak !== "" &&
    draft.kundansvarig !== "" &&
    draft.kundgrupp !== "" &&
    draft.faktNamn !== "" &&
    draft.faktPostadress !== "" &&
    draft.faktLand !== "" &&
    draft.valuta !== "" &&
    draft.moms !== "" &&
    draft.betvillkor !== "" &&
    draft.bonus !== "" &&
    (!bonusIsSet || draft.bonusgrund !== "") &&
    draft.ranterutin !== "" &&
    draft.paminnelsekod !== "" &&
    draft.kontraktsformular !== "" &&
    draft.leveransvillkor !== "" &&
    draft.inforsElavgift !== ""
  );

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
              {isEdit ? "Spara" : "Skapa kund"}
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
              {isEditing ? <div className={styles.lineItemFastTrackBar}>
                <div className={styles.lineItemFastTrackMain}>
                  <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
                  <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
                  <span className={styles.lineItemFastTrackText}>
                    Tabba endast mellan obligatoriska fält
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                    <span style={{ fontSize: "11px", fontWeight: 500, lineHeight: "1.2", color: "#748195" }}>Snabbspår</span>
                    <Switch
                      checked={fastTrackEnabled}
                      onChange={() => setFastTrackEnabled((v) => !v)}
                      size="medium"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#c47900',
                          '&:hover': { backgroundColor: 'rgba(196, 121, 0, 0.08)' },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#c47900',
                        },
                      }}
                    />
                  </div>
                </div>
              </div> : null}

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

                  {/* Grid: main fields */}
                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Kategori *"
                      value={draft.kategori}
                      onChange={(e) => update("kategori", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                      <MenuItem value="Sågverk">Sågverk</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Språk *"
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

                    <TextField
                      fullWidth size="small"
                      label="Orgnr/Personnr"
                      value={draft.orgnr}
                      onChange={(e) => update("orgnr", e.target.value)}
                    />

                    <TextField
                      fullWidth size="small"
                      label="VATnr"
                      value={draft.vatnr}
                      onChange={(e) => update("vatnr", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" edge="end" aria-label="Öppna i ny flik" title="Öppna i ny flik">
                              <OpenInNewIcon style={{ fontSize: 15 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    <TextField
                      fullWidth size="small"
                      label="Nordek kundNr"
                      value={draft.nordekKundNr}
                      onChange={(e) => update("nordekKundNr", e.target.value)}
                    />

                    <TextField
                      fullWidth size="small"
                      label="Controlled Wood Code"
                      value={draft.controlledWoodCode}
                      onChange={(e) => update("controlledWoodCode", e.target.value)}
                    />

                    <TextField
                      fullWidth size="small"
                      label="CW Code giltig t.o.m"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={draft.cwCodeGiltigTom}
                      onChange={(e) => update("cwCodeGiltigTom", e.target.value)}
                    />

                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Identifierare</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="EORInr" value={draft.eorInr} onChange={(e) => update("eorInr", e.target.value)} />
                    <TextField fullWidth size="small" label="Kedjans kundnr" value={draft.kedjansKundnr} onChange={(e) => update("kedjansKundnr", e.target.value)} />
                    <TextField fullWidth size="small" label="KVK" value={draft.kvk} onChange={(e) => update("kvk", e.target.value)} />
                    <TextField fullWidth size="small" label="Maersk kundnr" value={draft.maerskKundNr} onChange={(e) => update("maerskKundNr", e.target.value)} />
                    <TextField fullWidth size="small" label="Medlemsnummer" value={draft.medlemsnummer} onChange={(e) => update("medlemsnummer", e.target.value)} />
                    <TextField fullWidth size="small" label="NTN" value={draft.ntn} onChange={(e) => update("ntn", e.target.value)} />
                    <TextField fullWidth size="small" label="PRI identitet" value={draft.priIdentitet} onChange={(e) => update("priIdentitet", e.target.value)} />
                    <TextField fullWidth size="small" label="USCI" value={draft.usci} onChange={(e) => update("usci", e.target.value)} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Ansvar &amp; klassificering</Typography>

                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Kundansvarig *"
                      value={draft.kundansvarig}
                      onChange={(e) => update("kundansvarig", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                      <MenuItem value="Erik Andersson">Erik Andersson</MenuItem>
                      <MenuItem value="Maria Lindqvist">Maria Lindqvist</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Säljare/innesäljare"
                      value={draft.saljareInnesaljare}
                      onChange={(e) => update("saljareInnesaljare", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                      <MenuItem value="Erik Andersson">Erik Andersson</MenuItem>
                      <MenuItem value="Maria Lindqvist">Maria Lindqvist</MenuItem>
                      <MenuItem value="Oskar Berg">Oskar Berg</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Kundgrupp *"
                      value={draft.kundgrupp}
                      onChange={(e) => update("kundgrupp", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Köpmönster"
                      value={draft.kopmonster}
                      onChange={(e) => update("kopmonster", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Regelbunden">Regelbunden</MenuItem>
                      <MenuItem value="Oregelbunden">Oregelbunden</MenuItem>
                      <MenuItem value="Säsongsbetonad">Säsongsbetonad</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Leverantör"
                      value={draft.leverantor}
                      onChange={(e) => update("leverantor", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Nordic Agent AB">Nordic Agent AB</MenuItem>
                      <MenuItem value="Baltic Trade AB">Baltic Trade AB</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Leveransfönster</Typography>

                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      fullWidth size="small"
                      label="Lev.fönster före"
                      type="number"
                      value={draft.levFonsterFore}
                      onChange={(e) => update("levFonsterFore", e.target.value)}
                      helperText={LEV_FORE_HELP}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Lev.fönster efter"
                      type="number"
                      value={draft.levFonsterEfter}
                      onChange={(e) => update("levFonsterEfter", e.target.value)}
                      helperText={LEV_EFTER_HELP}
                    />
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.automatfaktura}
                          onChange={(e) => update("automatfaktura", e.target.checked)}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Automatfaktura</Typography>}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>

                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Kommentar (kund)"
                      value={draft.kommentarKund}
                      onChange={(e) => update("kommentarKund", e.target.value)}
                      helperText="Visas i prislista, e-handel, kontrakt, avrop, lastorder och fakturering."
                      style={{ gridColumn: "1 / -1" }}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Kommentar (Business support)"
                      value={draft.kommentarBusinessSupport}
                      onChange={(e) => update("kommentarBusinessSupport", e.target.value)}
                      style={{ gridColumn: "1 / -1" }}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Kommentar (innesäljare)"
                      value={draft.kommentarInnesaljare}
                      onChange={(e) => update("kommentarInnesaljare", e.target.value)}
                      helperText="Visas i kontrakt och lastorder."
                      style={{ gridColumn: "1 / -1" }}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Kommentar (säljare)"
                      value={draft.kommentarSaljare}
                      onChange={(e) => update("kommentarSaljare", e.target.value)}
                      helperText="Visas i kundlista."
                      style={{ gridColumn: "1 / -1" }}
                    />
                  </div>

                </AccordionDetails>
              </Accordion>

              {/* ── Kontaktuppgifter ── */}
              <Accordion
                expanded={expandedPanels.includes("kontakt")}
                onChange={() => togglePanel("kontakt")}
                disableGutters
                elevation={0}
                className={styles.contractSectionAccordion}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <ContactsOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Kontaktuppgifter</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>

                  <Typography className={styles.contractSectionGroupLabel}>Fakturaadress</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Namn *" value={draft.faktNamn} onChange={(e) => update("faktNamn", e.target.value)} style={{ gridColumn: "1 / -1" }} className={styles.lineItemRequiredControl} />
                    <TextField fullWidth size="small" label="Adress" value={draft.faktAdress1} onChange={(e) => update("faktAdress1", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Adress 2" value={draft.faktAdress2} onChange={(e) => update("faktAdress2", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Postadress *" value={draft.faktPostadress} onChange={(e) => update("faktPostadress", e.target.value)} className={styles.lineItemRequiredControl} />
                    <TextField
                      select fullWidth size="small"
                      label="Land *"
                      value={draft.faktLand}
                      onChange={(e) => update("faktLand", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="SE">SE — Sverige</MenuItem>
                      <MenuItem value="NO">NO — Norge</MenuItem>
                      <MenuItem value="FI">FI — Finland</MenuItem>
                      <MenuItem value="DK">DK — Danmark</MenuItem>
                      <MenuItem value="DE">DE — Tyskland</MenuItem>
                      <MenuItem value="EE">EE — Estland</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Kontakt</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Telefon" value={draft.telefon} onChange={(e) => update("telefon", e.target.value)} />
                    <TextField fullWidth size="small" label="E-post" type="email" value={draft.epost} onChange={(e) => update("epost", e.target.value)} />
                    <TextField fullWidth size="small" label="Web" value={draft.web} onChange={(e) => update("web", e.target.value)} />
                    <TextField fullWidth size="small" label="Leveransort" value={draft.leveransort} onChange={(e) => update("leveransort", e.target.value)} />
                    <TextField fullWidth size="small" label="Postnummer" value={draft.postnummer} onChange={(e) => update("postnummer", e.target.value)} />
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

                  <div className={styles.contractModernFormGrid}>
                    <TextField
                      select fullWidth size="small"
                      label="Valuta *"
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
                      select fullWidth size="small"
                      label="Moms *"
                      value={draft.moms}
                      onChange={(e) => update("moms", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="25">25 %</MenuItem>
                      <MenuItem value="12">12 %</MenuItem>
                      <MenuItem value="6">6 %</MenuItem>
                      <MenuItem value="0">0 %</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Bet.villkor *"
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

                    <TextField
                      fullWidth size="small"
                      label="Bonus *"
                      value={draft.bonus}
                      onChange={(e) => update("bonus", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">% av</InputAdornment>
                      }}
                    />

                    <TextField
                      select fullWidth size="small"
                      label={bonusIsSet ? "Bonusgrund *" : "Bonusgrund"}
                      value={draft.bonusgrund}
                      onChange={(e) => update("bonusgrund", e.target.value)}
                      className={bonusIsSet ? styles.lineItemRequiredControl : undefined}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Omsättning">Omsättning</MenuItem>
                      <MenuItem value="Volym">Volym</MenuItem>
                      <MenuItem value="Antal order">Antal order</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Ränterutin *"
                      value={draft.ranterutin}
                      onChange={(e) => update("ranterutin", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Ingen ränta">Ingen ränta</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Påminnelsekod *"
                      value={draft.paminnelsekod}
                      onChange={(e) => update("paminnelsekod", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Ingen påminnelse">Ingen påminnelse</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth size="small"
                      label="Kravränta"
                      value={draft.kravRanta}
                      onChange={(e) => update("kravRanta", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />

                    <TextField
                      select fullWidth size="small"
                      label="Certifiering"
                      value={draft.certifiering}
                      onChange={(e) => update("certifiering", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="FSC">FSC</MenuItem>
                      <MenuItem value="PEFC">PEFC</MenuItem>
                      <MenuItem value="Ingen">Ingen</MenuItem>
                    </TextField>

                    <TextField
                      select fullWidth size="small"
                      label="Kontraktsformulär *"
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

                    <TextField
                      select fullWidth size="small"
                      label="Leveransvillkor *"
                      value={draft.leveransvillkor}
                      onChange={(e) => update("leveransvillkor", e.target.value)}
                      className={styles.lineItemRequiredControl}
                    >
                      <MenuItem value="">— Välj —</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth size="small"
                      label="Text på kontrakt/faktura"
                      value={draft.textPaKontrakt}
                      onChange={(e) => update("textPaKontrakt", e.target.value)}
                      style={{ gridColumn: "1 / -1" }}
                    />

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
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />

                    <TextField
                      fullWidth size="small"
                      label="Införselavgift *"
                      value={draft.inforsElavgift}
                      onChange={(e) => update("inforsElavgift", e.target.value)}
                      className={styles.lineItemRequiredControl}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">SEK</InputAdornment>
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.leveransdatumPaFaktura}
                          onChange={(e) => update("leveransdatumPaFaktura", e.target.checked)}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Leveransdatum på faktura</Typography>}
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

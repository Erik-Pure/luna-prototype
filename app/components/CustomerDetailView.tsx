"use client";

import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAlt";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useSyncExternalStore } from "react";
import styles from "../page.module.scss";
import { CustomerCreateView, type NewCustomerDraft } from "./CustomerCreateView";
import { FordranTab } from "./customer-tabs/FordranTab";
import { KontaktpersonerTab } from "./customer-tabs/KontaktpersonerTab";

export type CustomerDetailData = {
  customerNumber: string;
  organizationNumber: string;
  country: string;
  city: string;
  primaryContact: string;
  accountManager: string;
  email: string;
  phone: string;
  activeContracts: string;
  priceList: string;
  creditLimit: string;
  limitStatus: "ok" | "warning" | "error";
  comment: string;
  kortnamn: string;
  tillhor: string;
  giltiFran: string;
  giltigTom: string;
  skapadAv: string;
  skapad: string;
  andradAv: string;
  andrad: string;
};

const customerTabs = [
  "Kontaktpersoner",
  "Kontaktlogg",
  "Fordran",
  "Leverans",
  "EDI",
  "Dokument",
] as const;

type CustomerTab = (typeof customerTabs)[number];

type CustomerDraft = {
  // Allmänt
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
  // Kontaktuppgifter
  faktNamn: string;
  faktAdress1: string;
  faktAdress2: string;
  faktPostadress: string;
  faktLand: string;
  levNamn: string;
  levAdress1: string;
  levAdress2: string;
  levPostadress: string;
  levLand: string;
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

const INITIAL_DRAFT: CustomerDraft = {
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

type CustomerDetailViewProps = {
  customerName: string;
  detail: CustomerDetailData | null;
};

export function CustomerDetailView({ customerName, detail }: CustomerDetailViewProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("Kontaktpersoner");
  const [draft, setDraft] = useState<CustomerDraft>(INITIAL_DRAFT);
  const [isSectionsPanelCollapsed, setIsSectionsPanelCollapsed] = useState(false);
  const [sectionsPanelWidth, setSectionsPanelWidth] = useState<number | null>(null);
  const [expandedDialogOpen, setExpandedDialogOpen] = useState(false);

  const isWide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1280px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false
  );

  const isExtraWide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1700px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1700px)").matches,
    () => false
  );

  const startResizeSections = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sectionsPanelWidth ?? (isExtraWide ? 380 : 290);
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const delta = startX - e.clientX;
      setSectionsPanelWidth(Math.max(220, Math.min(900, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const set = (key: keyof CustomerDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const hasLimitExceeded = detail?.limitStatus === "error";

  return (
    <div className={styles.contractDetailPanel}>
      {/* ── Header ── */}
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>{customerName}</Typography>
          {hasLimitExceeded ? (
            <Chip
              label="Kunden har överskriden limit"
              size="small"
              color="error"
              style={{ marginLeft: 8, fontWeight: 500, padding: "0 4px" }}
            />
          ) : null}
        </div>
        <div className={styles.contractModernTopActions}>
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<AccountBoxOutlinedIcon fontSize="small" />}>
            Kundkort
          </Button>
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<FormatListBulletedOutlinedIcon fontSize="small" />}>
            Restorderlista
          </Button>
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<SyncAltOutlinedIcon fontSize="small" />}>
            Överför till Visma
          </Button>
        </div>
      </div>

      {/* ── Body layout ── */}
      <div className={`${styles.contractBodyLayout} ${isWide ? styles.contractBodyLayoutWide : ""}`}>

        {/* ── Sections panel (right on wide / top on narrow) ── */}
        <div
          className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : ""} ${isExtraWide && !sectionsPanelWidth && !isSectionsPanelCollapsed ? styles.contractBodySectionsColExtraWide : ""} ${isSectionsPanelCollapsed ? styles.contractBodySectionsColCollapsed : ""}`}
          style={isWide && sectionsPanelWidth && !isSectionsPanelCollapsed ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
        >
          {isWide && !isSectionsPanelCollapsed ? (
            <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
          ) : null}

          <div className={styles.contractSectionsPanelHeader} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

              <Tooltip title={isSectionsPanelCollapsed ? "Expandera kundpanel" : "Minimera kundpanel"}>
                <IconButton
                  size="small"
                  className={styles.contractSectionsPanelMinimizeBtn}
                  onClick={() => setIsSectionsPanelCollapsed((v) => !v)}
                >
                  {isSectionsPanelCollapsed ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              {!isSectionsPanelCollapsed ? (
                <Typography style={{ fontSize: 13, fontWeight: 600, color: "#2f3743" }}>Kundinformation</Typography>
              ) : null}
            </div>
            {!isSectionsPanelCollapsed ? (
              <div style={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 4 }}>

                <Tooltip title="Förstora i dialog">
                  <IconButton
                    size="small"
                    className={styles.contractSectionsPanelMinimizeBtn}
                    onClick={() => setExpandedDialogOpen(true)}
                  >
                    <OpenInFullOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button className={styles.contractSaveButton} size="small" startIcon={<EditOutlinedIcon fontSize="small" />}>
                  Redigera
                </Button>

              </div>
            ) : null}
          </div>

          {!isSectionsPanelCollapsed ? (
            <>
              {/* ── Allmänt ── */}
              <Accordion defaultExpanded disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <InfoOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Kategori" value={draft.kategori} onChange={(e) => set("kategori", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                      <MenuItem value="Sågverk">Sågverk</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Språk" value={draft.sprak} onChange={(e) => set("sprak", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Svenska">Svenska</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Norsk">Norsk</MenuItem>
                      <MenuItem value="Suomi">Suomi</MenuItem>
                      <MenuItem value="Dansk">Dansk</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Orgnr/Personnr" value={draft.orgnr} onChange={(e) => set("orgnr", e.target.value)} />
                    <TextField fullWidth size="small" label="VATnr" value={draft.vatnr} onChange={(e) => set("vatnr", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" edge="end"><OpenInNewIcon style={{ fontSize: 15 }} /></IconButton></InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Nordek kundNr" value={draft.nordekKundNr} onChange={(e) => set("nordekKundNr", e.target.value)} />
                    <TextField fullWidth size="small" label="Controlled Wood Code" value={draft.controlledWoodCode} onChange={(e) => set("controlledWoodCode", e.target.value)} />
                    <TextField fullWidth size="small" label="CW Code giltig t.o.m" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.cwCodeGiltigTom} onChange={(e) => set("cwCodeGiltigTom", e.target.value)} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Identifierare</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="EORInr" value={draft.eorInr} onChange={(e) => set("eorInr", e.target.value)} />
                    <TextField fullWidth size="small" label="Kedjans kundnr" value={draft.kedjansKundnr} onChange={(e) => set("kedjansKundnr", e.target.value)} />
                    <TextField fullWidth size="small" label="KVK" value={draft.kvk} onChange={(e) => set("kvk", e.target.value)} />
                    <TextField fullWidth size="small" label="Maersk kundnr" value={draft.maerskKundNr} onChange={(e) => set("maerskKundNr", e.target.value)} />
                    <TextField fullWidth size="small" label="Medlemsnummer" value={draft.medlemsnummer} onChange={(e) => set("medlemsnummer", e.target.value)} />
                    <TextField fullWidth size="small" label="NTN" value={draft.ntn} onChange={(e) => set("ntn", e.target.value)} />
                    <TextField fullWidth size="small" label="PRI identitet" value={draft.priIdentitet} onChange={(e) => set("priIdentitet", e.target.value)} />
                    <TextField fullWidth size="small" label="USCI" value={draft.usci} onChange={(e) => set("usci", e.target.value)} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Ansvar &amp; klassificering</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Kundansvarig" value={draft.kundansvarig} onChange={(e) => set("kundansvarig", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                      <MenuItem value="Erik Andersson">Erik Andersson</MenuItem>
                      <MenuItem value="Maria Lindqvist">Maria Lindqvist</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Säljare/innesäljare" value={draft.saljareInnesaljare} onChange={(e) => set("saljareInnesaljare", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                      <MenuItem value="Erik Andersson">Erik Andersson</MenuItem>
                      <MenuItem value="Maria Lindqvist">Maria Lindqvist</MenuItem>
                      <MenuItem value="Oskar Berg">Oskar Berg</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Kundgrupp" value={draft.kundgrupp} onChange={(e) => set("kundgrupp", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Köpmönster" value={draft.kopmonster} onChange={(e) => set("kopmonster", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Regelbunden">Regelbunden</MenuItem>
                      <MenuItem value="Oregelbunden">Oregelbunden</MenuItem>
                      <MenuItem value="Säsongsbetonad">Säsongsbetonad</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Leverantör" value={draft.leverantor} onChange={(e) => set("leverantor", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Nordic Agent AB">Nordic Agent AB</MenuItem>
                      <MenuItem value="Baltic Trade AB">Baltic Trade AB</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Leveransfönster</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Lev.fönster före" type="number" value={draft.levFonsterFore} onChange={(e) => set("levFonsterFore", e.target.value)} />
                    <TextField fullWidth size="small" label="Lev.fönster efter" type="number" value={draft.levFonsterEfter} onChange={(e) => set("levFonsterEfter", e.target.value)} />
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={draft.automatfaktura} onChange={(e) => set("automatfaktura", e.target.checked)} />}
                      label={<Typography style={{ fontSize: 13 }}>Automatfaktura</Typography>}
                    />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" multiline rows={3} label="Kommentar (kund)" value={draft.kommentarKund} onChange={(e) => set("kommentarKund", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" multiline rows={3} label="Kommentar (Business support)" value={draft.kommentarBusinessSupport} onChange={(e) => set("kommentarBusinessSupport", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" multiline rows={3} label="Kommentar (innesäljare)" value={draft.kommentarInnesaljare} onChange={(e) => set("kommentarInnesaljare", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" multiline rows={3} label="Kommentar (säljare)" value={draft.kommentarSaljare} onChange={(e) => set("kommentarSaljare", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                  </div>
                </AccordionDetails>
              </Accordion>

              {/* ── Kontaktuppgifter ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <ContactsOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Kontaktuppgifter</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <Typography className={styles.contractSectionGroupLabel}>Fakturaadress</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Namn" value={draft.faktNamn} onChange={(e) => set("faktNamn", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Adress" value={draft.faktAdress1} onChange={(e) => set("faktAdress1", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Adress 2" value={draft.faktAdress2} onChange={(e) => set("faktAdress2", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Postadress" value={draft.faktPostadress} onChange={(e) => set("faktPostadress", e.target.value)} />
                    <TextField select fullWidth size="small" label="Land" value={draft.faktLand} onChange={(e) => set("faktLand", e.target.value)}>
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
                  <Typography className={styles.contractSectionGroupLabel}>Leveransadress</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Namn" value={draft.levNamn} onChange={(e) => set("levNamn", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Adress" value={draft.levAdress1} onChange={(e) => set("levAdress1", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Adress 2" value={draft.levAdress2} onChange={(e) => set("levAdress2", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" label="Postadress" value={draft.levPostadress} onChange={(e) => set("levPostadress", e.target.value)} />
                    <TextField select fullWidth size="small" label="Land" value={draft.levLand} onChange={(e) => set("levLand", e.target.value)}>
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
                    <TextField fullWidth size="small" label="Telefon" value={draft.telefon} onChange={(e) => set("telefon", e.target.value)} />
                    <TextField fullWidth size="small" label="E-post" type="email" value={draft.epost} onChange={(e) => set("epost", e.target.value)} />
                    <TextField fullWidth size="small" label="Web" value={draft.web} onChange={(e) => set("web", e.target.value)} />
                    <TextField fullWidth size="small" label="Leveransort" value={draft.leveransort} onChange={(e) => set("leveransort", e.target.value)} />
                    <TextField fullWidth size="small" label="Postnummer" value={draft.postnummer} onChange={(e) => set("postnummer", e.target.value)} />
                  </div>
                </AccordionDetails>
              </Accordion>

              {/* ── Villkor ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <GavelOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Villkor</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Valuta" value={draft.valuta} onChange={(e) => set("valuta", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="SEK">SEK</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="NOK">NOK</MenuItem>
                      <MenuItem value="DKK">DKK</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Moms" value={draft.moms} onChange={(e) => set("moms", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="25">25 %</MenuItem>
                      <MenuItem value="12">12 %</MenuItem>
                      <MenuItem value="6">6 %</MenuItem>
                      <MenuItem value="0">0 %</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Bet.villkor" value={draft.betvillkor} onChange={(e) => set("betvillkor", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="30">30 dagar netto</MenuItem>
                      <MenuItem value="14">14 dagar netto</MenuItem>
                      <MenuItem value="10">10 dagar netto</MenuItem>
                      <MenuItem value="0">Förskott</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Bet.villkor.dag" type="number" value={draft.betvillkorDag} onChange={(e) => set("betvillkorDag", e.target.value)} />
                    <TextField fullWidth size="small" label="Kassarabatt" value={draft.kassarabatt} onChange={(e) => set("kassarabatt", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Bonus" value={draft.bonus} onChange={(e) => set("bonus", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">% av</InputAdornment> } }} />
                    <TextField select fullWidth size="small" label="Bonusgrund" value={draft.bonusgrund} onChange={(e) => set("bonusgrund", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Omsättning">Omsättning</MenuItem>
                      <MenuItem value="Volym">Volym</MenuItem>
                      <MenuItem value="Antal order">Antal order</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Ränterutin" value={draft.ranterutin} onChange={(e) => set("ranterutin", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Ingen ränta">Ingen ränta</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Påminnelsekod" value={draft.paminnelsekod} onChange={(e) => set("paminnelsekod", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Ingen påminnelse">Ingen påminnelse</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Kravränta" value={draft.kravRanta} onChange={(e) => set("kravRanta", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                    <TextField select fullWidth size="small" label="Certifiering" value={draft.certifiering} onChange={(e) => set("certifiering", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="FSC">FSC</MenuItem>
                      <MenuItem value="PEFC">PEFC</MenuItem>
                      <MenuItem value="Ingen">Ingen</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Kontraktsformulär" value={draft.kontraktsformular} onChange={(e) => set("kontraktsformular", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Export">Export</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Leveranssätt" value={draft.leveranssatt} onChange={(e) => set("leveranssatt", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bil">Bil</MenuItem>
                      <MenuItem value="Tåg">Tåg</MenuItem>
                      <MenuItem value="Båt">Båt</MenuItem>
                      <MenuItem value="Flyg">Flyg</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Leveransvillkor" value={draft.leveransvillkor} onChange={(e) => set("leveransvillkor", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Text på kontrakt/faktura" value={draft.textPaKontrakt} onChange={(e) => set("textPaKontrakt", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField select fullWidth size="small" label="Agent" value={draft.agent} onChange={(e) => set("agent", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Nordic Agent AB">Nordic Agent AB</MenuItem>
                      <MenuItem value="Baltic Trade AB">Baltic Trade AB</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Provision agent" value={draft.provisionAgent} onChange={(e) => set("provisionAgent", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Införselavgift" value={draft.inforsElavgift} onChange={(e) => set("inforsElavgift", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={draft.leveransdatumPaFaktura} onChange={(e) => set("leveransdatumPaFaktura", e.target.checked)} />}
                      label={<Typography style={{ fontSize: 13 }}>Leveransdatum på faktura</Typography>}
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
            </>
          ) : null}
        </div>

        {/* ── Tabs panel (left on wide / bottom on narrow) ── */}
        <div className={`${styles.contractBodyTabsCol} ${isWide ? styles.contractBodyTabsColWide : ""}`}>
          <div className={styles.contractModernAdditionsWrap}>
            <div className={styles.contractMudTabBar}>
              {customerTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.contractMudTabItem} ${activeTab === tab ? styles.contractMudTabItemActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.contractDetailMainContent}>
              {activeTab === "Kontaktpersoner" ? <KontaktpersonerTab /> : null}
              {activeTab === "Fordran" ? <FordranTab /> : null}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={expandedDialogOpen}
        onClose={() => setExpandedDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { height: "90vh" } } }}
      >
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <CustomerCreateView
            title={customerName}
            initialDraft={draft as NewCustomerDraft}
            onSave={(saved) => { setDraft(saved as CustomerDraft); setExpandedDialogOpen(false); }}
            onCancel={() => setExpandedDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

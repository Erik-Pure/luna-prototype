"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
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
import { PriceListCreateView, type NewPriceListDraft } from "./PriceListCreateView";
import { FraktTab } from "./price-list-tabs/FraktTab";
import { PrislisteraderTab } from "./price-list-tabs/PrislisteraderTab";

const priceListTabs = ["Prislisterader", "Frakt"] as const;
type PriceListTab = (typeof priceListTabs)[number];

type PriceListDraft = NewPriceListDraft;

const MOCK_DRAFT: PriceListDraft = {
  prislistenr: "",
  kopieratFran: "",
  status: "Godkänd",
  upprattatAv: "Per-Ola Engerup",
  kund: "Martinsons",
  prislistedatum: "2025-10-15",
  giltigFran: "2025-10-01",
  giltigTill: "2025-12-31",
  kontaktbolag: "Pure Wood AB",
  kundensReferens: "",
  externPrislistenr: "2025/10 Region 3",
  kategori: "Bygghandel",
  land: "SE",
  sprak: "Svenska",
  ovrigt: "",
  egenAnmarkning: "Interprislista fr depå",
  kommentarKund: "",
  valuta: "SEK",
  kurs: "",
  kalkylkurs: "",
  moms: "25",
  betvillkor: "30",
  betvillkorDag: "",
  kassarabatt: "",
  bonus: "",
  bonusgrund: "",
  kontraktsformular: "Standard",
  leveransvillkor: "DAP",
  leveransvillkor2: "",
  levvillkorOrt: "",
  leveranssatt: "Bil",
  agent: "",
  provisionAgent: "0",
  konsignationslager: false,
  plocktillaggMinst: "850",
  plocktillagg: "0",
  malningstilagg: "0",
  malningstilaggTroskel: "0",
  inforseavgift: "0",
  utskriftstyp: "Standard",
  visaM3Pris: false,
  visaNamnAdress: true,
};

type PriceListDetailViewProps = {
  selectedPriceListId: string;
  onOpenPriceRowDetail: (priceRowId: string) => void;
  onCreatePriceRow: () => void;
  onOpenPrislistekalkyl: () => void;
};

export function PriceListDetailView({ selectedPriceListId, onOpenPriceRowDetail, onCreatePriceRow, onOpenPrislistekalkyl }: PriceListDetailViewProps) {
  const [activeTab, setActiveTab] = useState<PriceListTab>("Prislisterader");
  const [draft, setDraft] = useState<PriceListDraft>({ ...MOCK_DRAFT, prislistenr: selectedPriceListId });
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

  const set = (key: keyof PriceListDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const kursAdornment = draft.valuta ? `${draft.valuta} = 1 SEK` : "valuta = 1 SEK";

  return (
    <div className={styles.contractDetailPanel}>
      {/* ── Header ── */}
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>Prislista {selectedPriceListId}</Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          {/* <Button className={styles.contractQuickActionButton} size="small" startIcon={<VisibilityOutlinedIcon fontSize="small" />}>
            Granska
          </Button> */}
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<DescriptionOutlinedIcon fontSize="small" />}>
            Granska
          </Button>
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<DescriptionOutlinedIcon fontSize="small" />}>
            Skapa Finfofil
          </Button>
          <Button className={styles.contractQuickActionButton} size="small" startIcon={<GavelOutlinedIcon fontSize="small" />}>
            Skapa kontrakt
          </Button>
          <Tooltip title="Ta bort">
            <IconButton size="small" className={styles.contractHeaderDotsButton} aria-label="Ta bort">
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* ── Body layout ── */}
      <div className={`${styles.contractBodyLayout} ${isWide ? styles.contractBodyLayoutWide : ""}`}>

        {/* ── Sections panel ── */}
        <div
          className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : ""} ${isExtraWide && !sectionsPanelWidth && !isSectionsPanelCollapsed ? styles.contractBodySectionsColExtraWide : ""} ${isSectionsPanelCollapsed ? styles.contractBodySectionsColCollapsed : ""}`}
          style={isWide && sectionsPanelWidth && !isSectionsPanelCollapsed ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
        >
          {isWide && !isSectionsPanelCollapsed ? (
            <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
          ) : null}

          <div className={styles.contractSectionsPanelHeader} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Tooltip title={isSectionsPanelCollapsed ? "Expandera prislistepanel" : "Minimera prislistepanel"}>
                <IconButton
                  size="small"
                  className={styles.contractSectionsPanelMinimizeBtn}
                  onClick={() => setIsSectionsPanelCollapsed((v) => !v)}
                >
                  {isSectionsPanelCollapsed ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              {!isSectionsPanelCollapsed ? (
                <>
                  <Typography style={{ fontSize: 13, fontWeight: 600, color: "#2f3743", flex: 1, marginLeft: 4 }}>Prislisteinformation</Typography>
                  <Tooltip title="Öppna i dialog">
                    <Button
                      size="small"
                      className={styles.contractHeaderDotsButton}
                      onClick={() => setExpandedDialogOpen(true)}
                      style={{ minWidth: 0 }}
                    >
                      <OpenInFullOutlinedIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </>
              ) : null}
            </div>
            {!isSectionsPanelCollapsed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 12 }}>
                <Button className={styles.contractSaveButton} size="small" startIcon={<EditOutlinedIcon fontSize="small" />} >
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
                    <TextField fullWidth size="small" label="Prislistenr" value={draft.prislistenr} onChange={(e) => set("prislistenr", e.target.value)} />
                    <TextField fullWidth size="small" label="Kopierat från" value={draft.kopieratFran} onChange={(e) => set("kopieratFran", e.target.value)} />
                    <TextField select fullWidth size="small" label="Status" value={draft.status} onChange={(e) => set("status", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Godkänd">Godkänd</MenuItem>
                      <MenuItem value="Utkast">Utkast</MenuItem>
                      <MenuItem value="Inaktiv">Inaktiv</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Upprättat av" value={draft.upprattatAv} onChange={(e) => set("upprattatAv", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Per-Ola Engerup">Per-Ola Engerup</MenuItem>
                      <MenuItem value="Erik Högbom">Erik Högbom</MenuItem>
                      <MenuItem value="Hans Hemström">Hans Hemström</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Kund" value={draft.kund} onChange={(e) => set("kund", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Martinsons">Martinsons</MenuItem>
                      <MenuItem value="Skogmo Bruk">Skogmo Bruk</MenuItem>
                      <MenuItem value="Hernes">Hernes</MenuItem>
                      <MenuItem value="JäTre">JäTre</MenuItem>
                      <MenuItem value="Moelv Tre">Moelv Tre</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Prislistedatum" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.prislistedatum} onChange={(e) => set("prislistedatum", e.target.value)} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Giltighetstid</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Giltig från" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.giltigFran} onChange={(e) => set("giltigFran", e.target.value)} />
                    <TextField fullWidth size="small" label="Giltig till" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.giltigTill} onChange={(e) => set("giltigTill", e.target.value)} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Klassificering</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Kontaktbolag" value={draft.kontaktbolag} onChange={(e) => set("kontaktbolag", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Pure Wood AB">Pure Wood AB</MenuItem>
                      <MenuItem value="Nordic Timber AS">Nordic Timber AS</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Kundens referens" value={draft.kundensReferens} onChange={(e) => set("kundensReferens", e.target.value)} />
                    <TextField fullWidth size="small" label="Externt prislistenr" value={draft.externPrislistenr} onChange={(e) => set("externPrislistenr", e.target.value)} />
                    <TextField select fullWidth size="small" label="Kategori" value={draft.kategori} onChange={(e) => set("kategori", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                      <MenuItem value="Sågverk">Sågverk</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Land" value={draft.land} onChange={(e) => set("land", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="SE">SE — Sverige</MenuItem>
                      <MenuItem value="NO">NO — Norge</MenuItem>
                      <MenuItem value="FI">FI — Finland</MenuItem>
                      <MenuItem value="DK">DK — Danmark</MenuItem>
                      <MenuItem value="DE">DE — Tyskland</MenuItem>
                      <MenuItem value="EE">EE — Estland</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Språk" value={draft.sprak} onChange={(e) => set("sprak", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
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
                    <TextField fullWidth size="small" multiline rows={3} label="Övrigt" value={draft.ovrigt} onChange={(e) => set("ovrigt", e.target.value)} helperText="Visas på utskrift av prislista" style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" multiline rows={3} label="Egen anmärkning" value={draft.egenAnmarkning} onChange={(e) => set("egenAnmarkning", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    <TextField fullWidth size="small" multiline rows={3} label="Kommentar kund" value={draft.kommentarKund} onChange={(e) => set("kommentarKund", e.target.value)} style={{ gridColumn: "1 / -1" }} />
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
                  <Typography className={styles.contractSectionGroupLabel}>Valuta &amp; kurs</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Valuta" value={draft.valuta} onChange={(e) => set("valuta", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="SEK">SEK</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="NOK">NOK</MenuItem>
                      <MenuItem value="DKK">DKK</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Kurs" value={draft.kurs} onChange={(e) => set("kurs", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">{kursAdornment}</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Kalkylkurs" value={draft.kalkylkurs} onChange={(e) => set("kalkylkurs", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">{kursAdornment}</InputAdornment> } }} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Betalning</Typography>
                  <div className={styles.contractModernFormGrid}>
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
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Bonus</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Bonus" value={draft.bonus} onChange={(e) => set("bonus", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                    <TextField select fullWidth size="small" label="Bonusgrund" value={draft.bonusgrund} onChange={(e) => set("bonusgrund", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Omsättning">Omsättning</MenuItem>
                      <MenuItem value="Volym">Volym</MenuItem>
                      <MenuItem value="Antal order">Antal order</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Leverans</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Kontraktsformulär" value={draft.kontraktsformular} onChange={(e) => set("kontraktsformular", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Export">Export</MenuItem>
                      <MenuItem value="Industri">Industri</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Leveransvillkor" value={draft.leveransvillkor} onChange={(e) => set("leveransvillkor", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                      <MenuItem value="DDP">DDP</MenuItem>
                    </TextField>
                    <TextField select fullWidth size="small" label="Leveransvillkor" value={draft.leveransvillkor2} onChange={(e) => set("leveransvillkor2", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="DAP">DAP</MenuItem>
                      <MenuItem value="EXW">EXW</MenuItem>
                      <MenuItem value="FCA">FCA</MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                      <MenuItem value="DDP">DDP</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Lev.villkor ort" value={draft.levvillkorOrt} onChange={(e) => set("levvillkorOrt", e.target.value)} />
                    <TextField select fullWidth size="small" label="Leveranssätt" value={draft.leveranssatt} onChange={(e) => set("leveranssatt", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Bil">Bil</MenuItem>
                      <MenuItem value="Tåg">Tåg</MenuItem>
                      <MenuItem value="Båt">Båt</MenuItem>
                      <MenuItem value="Flyg">Flyg</MenuItem>
                    </TextField>
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Agent</Typography>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Agent" value={draft.agent} onChange={(e) => set("agent", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Nordic Agent AB">Nordic Agent AB</MenuItem>
                      <MenuItem value="Baltic Trade AB">Baltic Trade AB</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Provision agent" value={draft.provisionAgent} onChange={(e) => set("provisionAgent", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                  </div>

                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Tillägg</Typography>
                  <div style={{ marginTop: 4, marginBottom: 8 }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={draft.konsignationslager} onChange={(e) => set("konsignationslager", e.target.checked)} />}
                      label={<Typography style={{ fontSize: 13 }}>Konsignationslager</Typography>}
                    />
                  </div>
                  <div className={styles.contractModernFormGrid}>
                    <TextField fullWidth size="small" label="Plocktillägg, minst" value={draft.plocktillaggMinst} onChange={(e) => set("plocktillaggMinst", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK/avropsrad</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Plocktillägg" value={draft.plocktillagg} onChange={(e) => set("plocktillagg", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%/avropsrad</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Målningstillägg" value={draft.malningstilagg} onChange={(e) => set("malningstilagg", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK/avropsrad</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Målningstillägg tröskel" value={draft.malningstilaggTroskel} onChange={(e) => set("malningstilaggTroskel", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">lpm</InputAdornment> } }} />
                    <TextField fullWidth size="small" label="Införselavgift" value={draft.inforseavgift} onChange={(e) => set("inforseavgift", e.target.value)}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} />
                  </div>
                </AccordionDetails>
              </Accordion>

              {/* ── Utskrift ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <PrintOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Utskrift</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <div className={styles.contractModernFormGrid}>
                    <TextField select fullWidth size="small" label="Utskriftstyp" value={draft.utskriftstyp} onChange={(e) => set("utskriftstyp", e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Detaljerad">Detaljerad</MenuItem>
                      <MenuItem value="Kompakt">Kompakt</MenuItem>
                    </TextField>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column" }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={draft.visaM3Pris} onChange={(e) => set("visaM3Pris", e.target.checked)} />}
                      label={<Typography style={{ fontSize: 13 }}>Visa även m3-pris</Typography>}
                    />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={draft.visaNamnAdress} onChange={(e) => set("visaNamnAdress", e.target.checked)} />}
                      label={<Typography style={{ fontSize: 13 }}>Visa namn/adress</Typography>}
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
            </>
          ) : null}
        </div>

        {/* ── Tabs panel ── */}
        <div className={`${styles.contractBodyTabsCol} ${isWide ? styles.contractBodyTabsColWide : ""}`}>
          <div className={styles.contractModernAdditionsWrap}>
            <div className={styles.contractMudTabBar}>
              {priceListTabs.map((tab) => (
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
              {activeTab === "Prislisterader" ? (
                <PrislisteraderTab
                  onOpenPriceRowDetail={onOpenPriceRowDetail}
                  onCreatePriceRow={onCreatePriceRow}
                  onOpenPrislistekalkyl={onOpenPrislistekalkyl}
                />
              ) : null}
              {activeTab === "Frakt" ? <FraktTab /> : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded dialog ── */}
      <Dialog
        open={expandedDialogOpen}
        onClose={() => setExpandedDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { height: "90vh" } } }}
      >
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <PriceListCreateView
            mode="edit"
            title={`Prislista ${selectedPriceListId}`}
            initialDraft={draft}
            onSave={(saved) => { setDraft(saved); setExpandedDialogOpen(false); }}
            onCancel={() => setExpandedDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import AddIcon from "@mui/icons-material/Add";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Snackbar, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { getContractDetails, type ContractDocument } from "./contractDetails";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

const lineItemDetailTabs = [
  "Längdfördelning",
  "Periodisering",
  "Nettolager",
  "Avropsrad",
  "Produktionsplanering",
  "Leveransbokade paket"
] as const;

export type LineItemDetailTab = (typeof lineItemDetailTabs)[number];
export type NewLineItemDraft = {
  senderCompany: string;
  senderWarehouse: string;
  responsibleCompany: string;
  priceList: string;
  certification: string;
  contractNumber: string;
  comboPackageNumber: string;
  nobbNumber: string;
  artNr: string;
  deliverArtNr: string;
  product: string;
  deliverProduct: string;
  invoiceText: string;
  packageType: string;
  deliverPackageType: string;
  length: string;
  packaging: string;
  bundle: string;
  vflGroup: string;
  quantity: string;
  volume: string;
  orderedUnit: string;
  finalVolume: string;
  invoiceUnit: string;
  adjustedPrice: string;
  price: string;
  amount: string;
  sponsorship: string;
  sponsoredAmount: string;
  caneaAgreementNumber: string;
  pickingSurchargeEnabled: boolean;
  pickingSurchargeQuantity: string;
  salesType: string;
  status: string;
  deliveryWeek: string;
  deliveryDay: string;
  deliveryPeriodDocument: string;
  deliveryWindowMin: string;
  deliveryWindowMax: string;
  internalComment: string;
  externalComment: string;
  showOnInvoice: boolean;
  customerComment: string;
  customerBrand: string;
  recipientBrand: string;
  callOffStatus: string;
};

const emptyNewLineItemDraft: NewLineItemDraft = {
  senderCompany: "BP Hissmofors Byggprodukter",
  senderWarehouse: "Krokom",
  responsibleCompany: "BP Hissmofors Byggprodukter",
  priceList: "",
  certification: "Ocertifierat",
  contractNumber: "",
  comboPackageNumber: "",
  nobbNumber: "",
  artNr: "",
  deliverArtNr: "",
  product: "",
  deliverProduct: "",
  invoiceText: "",
  packageType: "Lp",
  deliverPackageType: "",
  length: "",
  packaging: "",
  bundle: "",
  vflGroup: "",
  quantity: "",
  volume: "",
  orderedUnit: "m3 nominell",
  finalVolume: "",
  invoiceUnit: "m3 nominell",
  adjustedPrice: "0",
  price: "",
  amount: "",
  sponsorship: "",
  sponsoredAmount: "",
  caneaAgreementNumber: "",
  pickingSurchargeEnabled: false,
  pickingSurchargeQuantity: "0",
  salesType: "Eget virke",
  status: "Aktiv",
  deliveryWeek: "",
  deliveryDay: "",
  deliveryPeriodDocument: "",
  deliveryWindowMin: "",
  deliveryWindowMax: "",
  internalComment: "",
  externalComment: "",
  showOnInvoice: false,
  customerComment: "",
  customerBrand: "",
  recipientBrand: "",
  callOffStatus: "Sales planned"
};

const existingLineItemDraft: NewLineItemDraft = {
  senderCompany: "BP Hissmofors Byggprodukter",
  senderWarehouse: "Krokom",
  responsibleCompany: "BP Hissmofors Byggprodukter",
  priceList: "",
  certification: "Ocertifierat",
  contractNumber: "163499",
  comboPackageNumber: "",
  nobbNumber: "",
  artNr: "2202209500002000",
  deliverArtNr: "2202209500002000",
  product: "22x95 Gran Ytterpanel",
  deliverProduct: "",
  invoiceText: "",
  packageType: "Lp",
  deliverPackageType: "",
  length: "5,400",
  packaging: "",
  bundle: "",
  vflGroup: "",
  quantity: "27",
  volume: "3,421",
  orderedUnit: "m3 nominell",
  finalVolume: "3,079",
  invoiceUnit: "m3 nominell",
  adjustedPrice: "0",
  price: "10,29",
  amount: "14 669",
  sponsorship: "",
  sponsoredAmount: "0",
  caneaAgreementNumber: "",
  pickingSurchargeEnabled: false,
  pickingSurchargeQuantity: "0",
  salesType: "Eget virke",
  status: "Aktiv",
  deliveryWeek: "202550",
  deliveryDay: "",
  deliveryPeriodDocument: "",
  deliveryWindowMin: "2025-12-05",
  deliveryWindowMax: "2025-12-10",
  internalComment: "",
  externalComment: "",
  showOnInvoice: false,
  customerComment: "",
  customerBrand: "",
  recipientBrand: "",
  callOffStatus: "Sales planned"
};

const ART_NR_OPTIONS = [
  "2202209500002000",
  "2202209500003000",
  "2202212000001000",
] as const;
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

type LengthDistributionRow = {
  id: string;
  langd: string;
  mangd: string;
  enhet: string;
};

type LengthDistributionColumnKey = keyof Omit<LengthDistributionRow, "id"> | "_actions";
type PeriodiseringColumnKey = keyof Omit<PeriodiseringRow, "id"> | "_actions";
type CallOffRow = {
  id: string;
  status: string;
  artNr: string;
  pakettyp: string;
  mangd: string;
  enhet: string;
  volym: string;
  leveransvecka: string;
  avropaddatum: string;
  fakturatext: string;
  kundensReferens: string;
  levereraArtNr: string;
  levereraProdukt: string;
  levereraPakettyp: string;
  certifiering: string;
  emballage: string;
  bunt: string;
  leveransdag: string;
  plocktillagg: string;
  malningstillagg: string;
  malningstillaggTroskel: string;
  aPris: string;
  folie: string;
  levTidigast: string;
  levSenast: string;
  internKommentar: string;
  externKommentar: string;
  kundmarke: string;
  registreratAv: string;
  customerPlanned: string;
  plocktillaggMin: string;
  lastorderVolym: string;
  leveradVolym: string;
  avropsrest: string;
  lev: string;
};

type CallOffColumnKey = keyof Omit<CallOffRow, "id"> | "_actions" | "_nr";
type ProductionPlanningRow = {
  id: string;
  producerandeBolag: string;
  produktionsstalle: string;
  produktionslinje: string;
  kommentarProduktion: string;
  farg: string;
  pigmentering: string;
};

type ProductionPlanningColumnKey = keyof Omit<ProductionPlanningRow, "id"> | "_actions";

type NettolagerRow = {
  bolag: string;
  fakturatext: string;
  pakettyp: string;
  volym: string;
};

const PERIODISERING_COLUMNS: Array<{ key: PeriodiseringColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "leveransvecka", label: "Leveransvecka" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Enhet" },
  { key: "avropsradsstatus", label: "Avropsradsstatus" },
  { key: "kundensMarke", label: "Kundens märke" },
  { key: "godsmottagarensMarke", label: "Godsmottagarens märke" },
  { key: "_actions", label: "", pinnedRight: true },
];

const LENGTH_DISTRIBUTION_COLUMNS: Array<{ key: LengthDistributionColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "langd", label: "Längd" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Beställd enhet" },
  { key: "_actions", label: "", pinnedRight: true },
];

const CALLOFF_COLUMNS: Array<{ key: CallOffColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "_nr", label: "Avropsrad nr" },
  { key: "status", label: "Avropsradstatus" },
  { key: "fakturatext", label: "Fakturatext" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Beställd enhet" },
  { key: "volym", label: "Volym" },
  { key: "bunt", label: "Bunt" },
  { key: "emballage", label: "Emballage" },
  { key: "leveransvecka", label: "Levvecka" },
  { key: "avropsrest", label: "Avropsrest" },
  { key: "lev", label: "Lev" },
  { key: "folie", label: "Folie" },
  { key: "internKommentar", label: "Intern kommentar" },
  { key: "externKommentar", label: "Extern kommentar" },
  { key: "kundmarke", label: "Kundmärke" },
  { key: "certifiering", label: "Certifiering" },
  { key: "_actions", label: "", pinnedRight: true },
];

const PRODUCTION_PLANNING_COLUMNS: Array<{ key: ProductionPlanningColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "producerandeBolag", label: "Producerande bolag" },
  { key: "produktionsstalle", label: "Produktionsställe" },
  { key: "produktionslinje", label: "Produktionslinje" },
  { key: "kommentarProduktion", label: "Kommentar produktion" },
  { key: "farg", label: "Färg" },
  { key: "pigmentering", label: "Pigmentering" },
  { key: "_actions", label: "", pinnedRight: true },
];

const emptyCallOffRow = (): Omit<CallOffRow, "id"> => ({
  status: "Sales planned",
  artNr: "",
  pakettyp: "Lp",
  mangd: "",
  enhet: "m3 nominell",
  volym: "",
  leveransvecka: "",
  avropaddatum: "",
  fakturatext: "",
  kundensReferens: "",
  levereraArtNr: "",
  levereraProdukt: "",
  levereraPakettyp: "",
  certifiering: "Ocertifierat",
  emballage: "",
  bunt: "",
  leveransdag: "",
  plocktillagg: "",
  malningstillagg: "",
  malningstillaggTroskel: "",
  aPris: "",
  folie: "Ingen",
  levTidigast: "",
  levSenast: "",
  internKommentar: "",
  externKommentar: "",
  kundmarke: "",
  registreratAv: "",
  customerPlanned: "",
  plocktillaggMin: "",
  lastorderVolym: "",
  leveradVolym: "",
  avropsrest: "",
  lev: "",
});

const initialCallOffRows: CallOffRow[] = [
  {
    id: "calloff-1",
    status: "Sales planned",
    artNr: "2202209500002000",
    pakettyp: "Lp",
    mangd: "27",
    enhet: "m3 nominell",
    volym: "27,000",
    leveransvecka: "202613",
    avropaddatum: "2026-03-14",
    fakturatext: "22x95 Gran Ytterpanel",
    kundensReferens: "REF-771",
    levereraArtNr: "2202209500002000",
    levereraProdukt: "22x95 Gran Ytterpanel",
    levereraPakettyp: "Lp",
    certifiering: "Ocertifierat",
    emballage: "Standard",
    bunt: "",
    leveransdag: "Tisdag",
    plocktillagg: "0",
    malningstillagg: "0",
    malningstillaggTroskel: "0",
    aPris: "10,29",
    folie: "Ingen",
    levTidigast: "2026-03-20",
    levSenast: "2026-03-28",
    internKommentar: "",
    externKommentar: "",
    kundmarke: "az-26",
    registreratAv: "Jane Doe",
    customerPlanned: "Ja",
    plocktillaggMin: "",
    lastorderVolym: "",
    leveradVolym: "",
    avropsrest: "",
    lev: "",
  },
];

const emptyProductionPlanningRow = (): Omit<ProductionPlanningRow, "id"> => ({
  producerandeBolag: "",
  produktionsstalle: "",
  produktionslinje: "",
  kommentarProduktion: "",
  farg: "",
  pigmentering: "",
});

const initialProductionPlanningRows: ProductionPlanningRow[] = [
  {
    id: "pp-1",
    producerandeBolag: "BP Hissmofors Byggprodukter",
    produktionsstalle: "Krokom",
    produktionslinje: "Linje 1",
    kommentarProduktion: "Standardkörning",
    farg: "Natur",
    pigmentering: "Ingen",
  },
];

type CallOffFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<CallOffRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<CallOffRow, "id"> };

type ProductionPlanningFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<ProductionPlanningRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<ProductionPlanningRow, "id"> };

const NETTOLAGER_COLUMNS: Array<{ key: keyof NettolagerRow; label: string }> = [
  { key: "bolag", label: "Bolag" },
  { key: "fakturatext", label: "Fakturatext" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "volym", label: "Volym" },
];

const NETTOLAGER_FETCHED_ROWS: NettolagerRow[] = [
  {
    bolag: "BP Hissmofors Byggprodukter",
    fakturatext: "Nettolager standard",
    pakettyp: "Lp",
    volym: "12,400 m3",
  },
  {
    bolag: "BP Hissmofors Byggprodukter",
    fakturatext: "Nettolager extra",
    pakettyp: "Paket",
    volym: "8,750 m3",
  },
];

// ── Leveransbokade paket ──────────────────────────────────────
type BokadPaketRow = {
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

type BokadPaketColumnKey = keyof BokadPaketRow | "_actions";
type PaketbokningColumnKey = "_select" | keyof PaketbokningResultRow;

const BOKADE_PAKET_COLUMNS: Array<{ key: BokadPaketColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "paketnr", label: "Paketnr" },
  { key: "lpm", label: "Lpm" },
  { key: "produkt", label: "Produkt" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "mdlangd", label: "Mdlängd" },
  { key: "skaLastasUt", label: "Ska lastas ut" },
  { key: "_actions", label: "", pinnedRight: true },
];

const PAKETBOKNING_RESULT_COLUMNS: Array<{ key: PaketbokningColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "_select", label: "" },
  { key: "paketnr", label: "Paketnr" },
  { key: "lpm", label: "Lpm" },
  { key: "produkt", label: "Produkt" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "mdlangd", label: "Mdlängd" },
  { key: "status", label: "Status" },
];

const INITIAL_BOKADE_PAKET: BokadPaketRow[] = [
  { paketnr: "15134", lpm: "123", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-01", mdlangd: "123", skaLastasUt: "Ja" },
];

const PAKETBOKNING_MOCK_RESULTS: PaketbokningResultRow[] = [
  { paketnr: "15201", lpm: "45", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-02", mdlangd: "300", status: "Tillgänglig" },
  { paketnr: "15202", lpm: "62", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-03", mdlangd: "360", status: "Tillgänglig" },
  { paketnr: "15203", lpm: "38", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "B2-01", mdlangd: "420", status: "Tillgänglig" },
  { paketnr: "15204", lpm: "71", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "BP Hammerdal", lagerplats: "C3-05", mdlangd: "300", status: "Tillgänglig" },
  { paketnr: "15205", lpm: "55", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "BP Hammerdal", lagerplats: "C3-06", mdlangd: "360", status: "Tillgänglig" },
];

const RESERVATIONSTYP_OPTIONS = ["Kontraktrad", "Reservationsorder", "Intern"] as const;

type PaketbokningNavState =
  | { open: false }
  | { open: true; reservationstyp: string; returnTo: "leveransbokadePaket" | "callOffForm" };
const ENHET_OPTIONS = ["BP Hammerdal Byggprodukter", "BP Hissmofors Byggprodukter", "BP Kåge Byggprodukter", "NT Hissmofors Såg", "NT Kåge Såg"] as const;
const VFL_GRUPP_OPTIONS = ["Grupp A", "Grupp B", "Grupp C"] as const;
const KONTRAKT_PRODUKT_OPTIONS = ["163508: 5x150 Furu Svarvad Stolp", "163509: 22x95 Gran Ytterpanel", "163510: 45x145 Gran Konstruktionsvirke"] as const;

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

const emptyLengthDistributionRow = (): Omit<LengthDistributionRow, "id"> => ({
  langd: "",
  mangd: "",
  enhet: "m3 nominell",
});

const initialLengthDistributionRows: LengthDistributionRow[] = [
  {
    id: "ld-1",
    langd: "5,400",
    mangd: "27",
    enhet: "m3 nominell",
  }
];

type PeriodiseringFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<PeriodiseringRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<PeriodiseringRow, "id"> };

type LengthDistributionFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<LengthDistributionRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<LengthDistributionRow, "id"> };

type LineItemDetailViewProps = {
  lineItemId: string;
  activeTab: LineItemDetailTab;
  onChangeTab: (tab: LineItemDetailTab) => void;
  newDraftSeed?: Partial<NewLineItemDraft>;
  pinnedFields?: Set<keyof NewLineItemDraft>;
  onTogglePinnedField?: (key: keyof NewLineItemDraft) => void;
  keepOpenAfterSave: boolean;
  onToggleKeepOpenAfterSave: (checked: boolean) => void;
  onSaveAndCreateNew?: (draft: NewLineItemDraft) => void;
  onSaveAndClose?: () => void;
  onOpenAvropsrad?: (id: string) => void;
  onCreateAvropsrad?: () => void;
};

type FieldLabelProps = {
  fieldKey: keyof NewLineItemDraft;
  label: string;
  isNewLineItem: boolean;
  pinnedFields?: Set<keyof NewLineItemDraft>;
  onTogglePinnedField?: (key: keyof NewLineItemDraft) => void;
};

function FieldLabel({
  fieldKey,
  label,
  isNewLineItem,
  pinnedFields,
  onTogglePinnedField,
}: FieldLabelProps) {
  if (!isNewLineItem || !onTogglePinnedField) {
    return null;
  }

  const isPinned = pinnedFields?.has(fieldKey) ?? false;

  return (
    <div className={styles.fieldPinRow}>
      <Tooltip title={isPinned ? "Ta bort spara" : "Spara värde till nästa kontraktsrad"} placement="top">
        <button
          type="button"
          className={`${styles.fieldPinButton} ${isPinned ? styles.fieldPinButtonActive : ""}`}
          tabIndex={-1}
          aria-pressed={isPinned}
          aria-label={isPinned ? `Frånkoppla: ${label}` : `Fäst: ${label}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onTogglePinnedField(fieldKey)}
        >
          {isPinned ? <BookmarkIcon style={{ fontSize: 14 }} /> : <BookmarkBorderIcon style={{ fontSize: 14 }} />}
        </button>
      </Tooltip>
    </div>
  );
}

type LabeledSelectProps = {
  label: string;
  value: string;
  size?: "small" | "medium";
  className?: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function LabeledSelect({ label, value, size = "small", className, onChange, children }: LabeledSelectProps) {
  return (
    <FormControl size={size} className={className}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(event) => onChange(String(event.target.value))}>
        {children}
      </Select>
    </FormControl>
  );
}

const REQUIRED_FIELD_DEFS: { key: keyof NewLineItemDraft; label: string }[] = [
  { key: "senderCompany", label: "Utlastande enhet" },
  { key: "senderWarehouse", label: "Utlastande lagerställe" },
  { key: "status", label: "Status" },
  { key: "responsibleCompany", label: "Ansvarig enhet" },
  { key: "artNr", label: "ArtNr" },
  { key: "packageType", label: "Pakettyp" },
  { key: "quantity", label: "Mängd" },
  { key: "orderedUnit", label: "Beställd enhet" },
  { key: "volume", label: "Volym" },
  { key: "price", label: "Pris" },
  { key: "invoiceUnit", label: "Faktura enhet" },
  { key: "salesType", label: "Säljtyp" },
  { key: "deliveryWindowMin", label: "Lev. fönster min" },
  { key: "deliveryWindowMax", label: "Lev. fönster max" },
  { key: "callOffStatus", label: "Avropsradsstatus" },
  { key: "packaging", label: "Emballage" },
];

const REQUIRED_STEP_PANEL_IDS = ["allmant", "produkt", "affar", "leverans", "ovrigt"] as const;
const REQUIRED_FIELD_KEYS = new Set<keyof NewLineItemDraft>(REQUIRED_FIELD_DEFS.map(({ key }) => key));
const OPTIONAL_FAST_TRACK_GROUPS: Array<{
  title: string;
  fields: Array<{ key: keyof NewLineItemDraft; label: string }>;
}> = [
    {
      title: "Allmänt",
      fields: [
        { key: "priceList", label: "Prislista" },
        { key: "certification", label: "Certifiering" },
      ],
    },
    {
      title: "Produkt",
      fields: [
        { key: "product", label: "Produkt" },
        { key: "deliverProduct", label: "Leverera produkt" },
        { key: "nobbNumber", label: "NOBBnr" },
        { key: "deliverArtNr", label: "Leverera ArtNr" },
        { key: "invoiceText", label: "Fakturatext" },
        { key: "deliverPackageType", label: "Leverera pakettyp" },
        { key: "length", label: "Längd" },
        { key: "bundle", label: "Bunt" },
        { key: "vflGroup", label: "VFL grupp" },
      ],
    },
    {
      title: "Affär",
      fields: [
        { key: "finalVolume", label: "Slutvolym" },
        { key: "adjustedPrice", label: "Prisjusterad" },
        { key: "amount", label: "Belopp" },
        { key: "sponsorship", label: "Sponsring" },
        { key: "sponsoredAmount", label: "Belopp spons" },
        { key: "caneaAgreementNumber", label: "Avtalsnr i Canea" },
        { key: "pickingSurchargeEnabled", label: "Plocktillägg" },
        { key: "pickingSurchargeQuantity", label: "Plocktillägg antal" },
      ],
    },
    {
      title: "Leverans",
      fields: [
        { key: "deliveryWeek", label: "Leveransvecka" },
        { key: "deliveryDay", label: "Leveransdag" },
        { key: "deliveryPeriodDocument", label: "Leveransperiod kunddokument" },
      ],
    },
    {
      title: "Övrigt",
      fields: [
        { key: "internalComment", label: "Intern kommentar" },
        { key: "externalComment", label: "Extern kommentar" },
        { key: "showOnInvoice", label: "Visa på följesedel och faktura" },
        { key: "customerComment", label: "Kundkommentar" },
        { key: "customerBrand", label: "Kundens märke" },
        { key: "recipientBrand", label: "Godsmottagarens märke" },
      ],
    },
  ];

const REVIEW_HIGHLIGHT_KEYS: Array<keyof NewLineItemDraft> = [
  "senderCompany",
  "senderWarehouse",
  "artNr",
  "quantity",
  "price",
];

export function LineItemDetailView({
  lineItemId,
  activeTab,
  onChangeTab,
  newDraftSeed = {},
  pinnedFields,
  onTogglePinnedField,
  keepOpenAfterSave,
  onToggleKeepOpenAfterSave,
  onSaveAndCreateNew,
  onSaveAndClose,
  onOpenAvropsrad,
  onCreateAvropsrad,
}: LineItemDetailViewProps) {
  const isNewLineItem = lineItemId === "new";
  const accordionWrapRef = useRef<HTMLDivElement | null>(null);
  const saveAndContinueButtonRef = useRef<HTMLButtonElement | null>(null);
  const [lengthDistributionRows, setLengthDistributionRows] = useState<LengthDistributionRow[]>(initialLengthDistributionRows);
  const [selectedLengthDistributionRow, setSelectedLengthDistributionRow] = useState<number | null>(null);
  const [lengthDistributionForm, setLengthDistributionForm] = useState<LengthDistributionFormState>({ mode: "closed" });
  const [showLengthOnPrint, setShowLengthOnPrint] = useState(false);
  const [keepLengthDistributionDialogOpen, setKeepLengthDistributionDialogOpen] = useState(true);
  const [keepLengthDistributionValues, setKeepLengthDistributionValues] = useState(false);
  const [lastLengthDistributionDraft, setLastLengthDistributionDraft] = useState<Omit<LengthDistributionRow, "id"> | null>(null);
  const [lengthDistributionCreateFeedback, setLengthDistributionCreateFeedback] = useState({ open: false, key: 0 });
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
  const [callOffRows, setCallOffRows] = useState<CallOffRow[]>(initialCallOffRows);
  const [selectedCallOffRow, setSelectedCallOffRow] = useState<number | null>(null);
  const [callOffForm, setCallOffForm] = useState<CallOffFormState>({ mode: "closed" });
  const [keepCallOffValues, setKeepCallOffValues] = useState(false);
  const [lastCallOffDraft, setLastCallOffDraft] = useState<Omit<CallOffRow, "id"> | null>(null);
  const [productionPlanningRows, setProductionPlanningRows] = useState<ProductionPlanningRow[]>(initialProductionPlanningRows);
  const [selectedProductionPlanningRow, setSelectedProductionPlanningRow] = useState<number | null>(null);
  const [productionPlanningForm, setProductionPlanningForm] = useState<ProductionPlanningFormState>({ mode: "closed" });
  const [keepProductionPlanningDialogOpen, setKeepProductionPlanningDialogOpen] = useState(false);
  const [keepProductionPlanningValues, setKeepProductionPlanningValues] = useState(false);
  const [lastProductionPlanningDraft, setLastProductionPlanningDraft] = useState<Omit<ProductionPlanningRow, "id"> | null>(null);
  const [productionPlanningCreateFeedback, setProductionPlanningCreateFeedback] = useState({ open: false, key: 0 });
  const [nettolagerRows] = useState<NettolagerRow[]>(NETTOLAGER_FETCHED_ROWS);
  const [selectedNettolagerRow, setSelectedNettolagerRow] = useState<number | null>(null);
  // ── Leveransbokade paket state ──
  const [bokadePaketRows, setBokadePaketRows] = useState<BokadPaketRow[]>(INITIAL_BOKADE_PAKET);
  const [paketbokningNav, setPaketbokningNav] = useState<PaketbokningNavState>({ open: false });
  const [callOffFormTab, setCallOffFormTab] = useState<"form" | "leveransbokadePaket">("form");
  const [paketbokningFilters, setPaketbokningFilters] = useState({
    reservationstyp: "Kontraktrad" as string,
    kontraktProdukt: "163508: 5x150 Furu Svarvad Stolp" as string,
    enhet: "BP Hammerdal Byggprodukter" as string,
    langdMin: "",
    langdMax: "",
    vflGrupp: "",
  });
  const [paketbokningResults, setPaketbokningResults] = useState<PaketbokningResultRow[]>([]);
  const [paketbokningSearched, setPaketbokningSearched] = useState(false);
  const [selectedPaketRows, setSelectedPaketRows] = useState<Set<number>>(new Set());
  const [isBytBolagDialogOpen, setIsBytBolagDialogOpen] = useState(false);
  const [bytBolagDraft, setBytBolagDraft] = useState({ senderCompany: "", senderWarehouse: "", responsibleCompany: "" });
  const [newLineItemDraft, setNewLineItemDraft] = useState<NewLineItemDraft>({
    ...(isNewLineItem ? emptyNewLineItemDraft : existingLineItemDraft),
    ...newDraftSeed
  });
  const [expandedPanels, setExpandedPanels] = useState<string[]>(isNewLineItem ? [...REQUIRED_STEP_PANEL_IDS] : ["allmant"]);
  const [createStep, setCreateStep] = useState<0 | 1>(0);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [showAllReviewFields, setShowAllReviewFields] = useState(false);
  const [fastTrackEnabled, setFastTrackEnabled] = useState(true);
  const [optionalFastTrackKeys, setOptionalFastTrackKeys] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [hiddenFieldKeys, setHiddenFieldKeys] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [showAllOptionalFields, setShowAllOptionalFields] = useState(false);
  const [quickTrackSavedAt, setQuickTrackSavedAt] = useState<string | null>(null);
  const [uploadedLineItemDocuments, setUploadedLineItemDocuments] = useState<ContractDocument[]>([]);
  const contractDetails = getContractDetails(newLineItemDraft.contractNumber.trim() || null);
  const lineItemDocuments = isNewLineItem ? uploadedLineItemDocuments : contractDetails.dokument;

  const updateDraftField = (key: keyof NewLineItemDraft, value: string | boolean) => {
    setNewLineItemDraft((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleArtNrChange = (artNr: string) => {
    const productText = artNr ? `${artNr} (produktnamn)` : "";
    setNewLineItemDraft((previous) => ({
      ...previous,
      artNr,
      deliverArtNr: artNr,
      product: productText,
      deliverProduct: productText,
      invoiceText: productText,
    }));
  };

  const togglePanel = (panel: string) => {
    setExpandedPanels((previous) =>
      previous.includes(panel) ? previous.filter((item) => item !== panel) : [...previous, panel]
    );
  };

  const openRequiredPanels = () => {
    setExpandedPanels((previous) => Array.from(new Set([...previous, ...REQUIRED_STEP_PANEL_IDS])));
  };

  const handleSaveAndCreateNew = () => {
    const seedDraft: NewLineItemDraft = { ...emptyNewLineItemDraft };
    if (pinnedFields) {
      for (const key of pinnedFields) {
        (seedDraft as Record<string, unknown>)[key] = newLineItemDraft[key];
      }
    }
    onSaveAndCreateNew?.(seedDraft);
  };

  const handleMockSaveQuickTrack = () => {
    const formattedTime = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    setQuickTrackSavedAt(formattedTime);
  };

  const handleMockDocumentUpload = () => {
    setUploadedLineItemDocuments((previous) => [
      ...previous,
      {
        name: `kontraktsrad_dokument_${previous.length + 1}.pdf`,
        size: "-",
        addedAt: new Date().toLocaleString("sv-SE"),
      },
    ]);
  };

  const missingRequiredKeys = isNewLineItem
    ? REQUIRED_FIELD_DEFS
      .filter(({ key }) => {
        const val = newLineItemDraft[key];
        return typeof val === "string" ? val.trim() === "" : !val;
      })
      .map(({ key }) => key)
    : [];
  const canProceedToStep2 = missingRequiredKeys.length === 0;
  const highlightedReviewFields = REQUIRED_FIELD_DEFS.filter(({ key }) => REVIEW_HIGHLIGHT_KEYS.includes(key));
  const remainingReviewFields = REQUIRED_FIELD_DEFS.filter(({ key }) => !REVIEW_HIGHLIGHT_KEYS.includes(key));
  const isFastTrackField = (key: keyof NewLineItemDraft) =>
    REQUIRED_FIELD_KEYS.has(key) || optionalFastTrackKeys.has(key);

  const getFieldLabel = (key: keyof NewLineItemDraft, label: string) =>
    isNewLineItem && REQUIRED_FIELD_KEYS.has(key) ? `${label} *` : label;
  const getFieldControlClassName = (key: keyof NewLineItemDraft, baseClass = styles.searchFieldControl) => {
    const classNames = [baseClass];
    if (REQUIRED_FIELD_KEYS.has(key)) {
      classNames.push(styles.lineItemRequiredControl);
    }
    if (isNewLineItem && isFastTrackField(key)) {
      classNames.push(styles.lineItemFastTrackControl);
    }

    return classNames.join(" ");
  };

  const getFastTrackFocusableElements = (container: HTMLElement) =>
    [
      ...Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemFastTrackControl} .MuiInputBase-root`))
        .map((inputBaseRoot) =>
          inputBaseRoot.querySelector<HTMLElement>("[role='combobox'], input:not([type='hidden']), textarea")
        ),
      ...Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemFastTrackControl} input[type='checkbox']`)),
      saveAndContinueButtonRef.current,
    ]
      .filter((element): element is HTMLElement => {
        if (!element) {
          return false;
        }
        const isDisabled = (element as HTMLInputElement).disabled || element.getAttribute("aria-disabled") === "true";
        return !isDisabled && element.getClientRects().length > 0;
      });

  const handleFastTrackKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!fastTrackEnabled || !isNewLineItem || createStep !== 0 || event.key !== "Tab") {
      return;
    }

    const focusableRequiredControls = getFastTrackFocusableElements(event.currentTarget);
    if (focusableRequiredControls.length === 0) {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = focusableRequiredControls.findIndex(
      (element) => element === activeElement || element.contains(activeElement)
    );

    event.preventDefault();

    if (currentIndex === -1) {
      focusableRequiredControls[0]?.focus();
      return;
    }

    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + focusableRequiredControls.length) % focusableRequiredControls.length
      : (currentIndex + 1) % focusableRequiredControls.length;

    focusableRequiredControls[nextIndex]?.focus();
  };

  const handleToggleFastTrack = () => {
    setFastTrackEnabled((previous) => {
      const nextValue = !previous;

      if (nextValue) {
        openRequiredPanels();
        requestAnimationFrame(() => {
          const firstRequiredControl = accordionWrapRef.current
            ? getFastTrackFocusableElements(accordionWrapRef.current)[0]
            : null;
          firstRequiredControl?.focus();
        });
      }

      return nextValue;
    });
  };

  const getOptionalFieldMode = (key: keyof NewLineItemDraft): "normal" | "fasttrack" | "hidden" => {
    if (optionalFastTrackKeys.has(key)) return "fasttrack";
    if (hiddenFieldKeys.has(key)) return "hidden";
    return "normal";
  };

  const cycleOptionalFieldMode = (key: keyof NewLineItemDraft) => {
    const mode = getOptionalFieldMode(key);
    if (mode === "normal") {
      setOptionalFastTrackKeys((prev) => new Set([...prev, key]));
    } else if (mode === "fasttrack") {
      setOptionalFastTrackKeys((prev) => { const s = new Set(prev); s.delete(key); return s; });
      setHiddenFieldKeys((prev) => new Set([...prev, key]));
    } else {
      setHiddenFieldKeys((prev) => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const fieldHide = (key: keyof NewLineItemDraft) =>
    isNewLineItem && hiddenFieldKeys.has(key) ? ` ${styles.lineItemFieldHidden}` : "";

  const renderReviewField = ({ key, label }: { key: keyof NewLineItemDraft; label: string }) => {
    const val = newLineItemDraft[key];
    const displayVal = typeof val === "boolean" ? (val ? "Ja" : "Nej") : (String(val || "") || "—");

    return (
      <div key={key} className={styles.lineItemWizardReviewField}>
        <span className={styles.lineItemWizardReviewFieldLabel}>{getFieldLabel(key, label)}</span>
        <span className={styles.lineItemWizardReviewFieldValue}>{displayVal}</span>
      </div>
    );
  };

  const handleNextStep = () => {
    if (!canProceedToStep2) {
      setShowStepErrors(true);
      openRequiredPanels();
    } else {
      setShowStepErrors(false);
      setCreateStep(1);
    }
  };

  const handleSave = () => {
    if (keepOpenAfterSave) {
      handleSaveAndCreateNew();
    } else {
      onSaveAndClose?.();
    }
  };

  const hasSelectedProduct = newLineItemDraft.artNr.trim().length > 0;

  const openProductDetail = () => {
    if (!hasSelectedProduct) {
      return;
    }

    const fallbackPriceListId = newLineItemDraft.priceList.trim() || "PL-202600";
    const productDetailPath = `/marknad/prislistor/${encodeURIComponent(fallbackPriceListId)}/${encodeURIComponent(newLineItemDraft.artNr.trim())}`;
    window.open(productDetailPath, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!isNewLineItem) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key === "ArrowRight") setCreateStep(1);
      else if (e.ctrlKey && e.key === "ArrowLeft") setCreateStep(0);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isNewLineItem]);

  const openLengthDistributionAdd = () => {
    setKeepLengthDistributionValues(false);
    const initialDraft = keepLengthDistributionValues && lastLengthDistributionDraft
      ? lastLengthDistributionDraft
      : emptyLengthDistributionRow();
    setLengthDistributionForm({ mode: "add", draft: initialDraft });
    setSelectedLengthDistributionRow(null);
  };

  const openLengthDistributionEdit = (index: number) => {
    setKeepLengthDistributionValues(false);
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setLengthDistributionForm({ mode: "edit", id, draft });
    setSelectedLengthDistributionRow(index);
  };

  const openLengthDistributionClone = (index: number) => {
    setKeepLengthDistributionValues(false);
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    void id;
    setLengthDistributionForm({ mode: "add", draft });
    setSelectedLengthDistributionRow(null);
  };

  const closeLengthDistributionForm = () => {
    setLengthDistributionForm({ mode: "closed" });
  };

  const setLengthDistributionDraftField = (key: keyof Omit<LengthDistributionRow, "id">, value: string) => {
    setLengthDistributionForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const saveLengthDistributionForm = () => {
    if (lengthDistributionForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...lengthDistributionForm.draft };

    if (lengthDistributionForm.mode === "add") {
      setLengthDistributionRows((previous) => [
        ...previous,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft }
      ]);
      setLastLengthDistributionDraft(keepLengthDistributionValues ? nextDraft : null);
      setLengthDistributionCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));

      if (keepLengthDistributionDialogOpen) {
        setLengthDistributionForm({
          mode: "add",
          draft: keepLengthDistributionValues ? nextDraft : emptyLengthDistributionRow()
        });
        return;
      }
    }

    if (lengthDistributionForm.mode === "edit") {
      setLengthDistributionRows((previous) =>
        previous.map((row) =>
          row.id === lengthDistributionForm.id ? { ...row, ...nextDraft } : row
        )
      );

      if (keepLengthDistributionDialogOpen) {
        setLengthDistributionForm({ mode: "edit", id: lengthDistributionForm.id, draft: nextDraft });
        return;
      }
    }

    closeLengthDistributionForm();
  };

  const deleteLengthDistributionRow = (index: number) => {
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    setLengthDistributionRows((previous) =>
      previous.filter((current) => current.id !== row.id)
    );
    setSelectedLengthDistributionRow((previous) => (previous === index ? null : previous));
    closeLengthDistributionForm();
  };

  const lengthDistributionDraft = lengthDistributionForm.mode !== "closed" ? lengthDistributionForm.draft : null;
  const isLengthDistributionDialogOpen = lengthDistributionDraft !== null;

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
  const contractVolume = parseSvNumber(newLineItemDraft.volume);
  const hasContractVolume = contractVolume !== null && contractVolume > 0;
  const periodiseradVolym = periodiseringRows.reduce((sum, row) => sum + (parseSvNumber(row.mangd) ?? 0), 0);
  const aterstarAttPeriodisera = hasContractVolume ? (contractVolume - periodiseradVolym) : null;
  const periodiseringArIbalans =
    hasContractVolume && aterstarAttPeriodisera !== null && Math.abs(aterstarAttPeriodisera) <= PERIODISERING_SUM_EPSILON;
  const volumeUnit = newLineItemDraft.orderedUnit.trim() || "m3";
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
    ? distributeWeekCodes(newLineItemDraft.deliveryWindowMin, newLineItemDraft.deliveryWindowMax, autoAntalRader)
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
    const unit = newLineItemDraft.orderedUnit.trim() || "m3 nominell";

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

  const openCallOffAdd = () => {
    if (onCreateAvropsrad) {
      onCreateAvropsrad();
      return;
    }
    setKeepCallOffValues(false);
    const initialDraft = keepCallOffValues && lastCallOffDraft
      ? lastCallOffDraft
      : emptyCallOffRow();
    setCallOffForm({ mode: "add", draft: initialDraft });
    setSelectedCallOffRow(null);
    setCallOffFormTab("form");
  };

  const openCallOffEdit = (index: number) => {
    const row = callOffRows[index];
    if (!row) {
      return;
    }
    if (onOpenAvropsrad) {
      setSelectedCallOffRow(index);
      onOpenAvropsrad(row.id);
      return;
    }
    setKeepCallOffValues(false);
    const { id, ...draft } = row;
    setCallOffForm({ mode: "edit", id, draft });
    setSelectedCallOffRow(index);
    setCallOffFormTab("form");
  };

  const openCallOffClone = (index: number) => {
    if (onCreateAvropsrad) {
      onCreateAvropsrad();
      return;
    }
    setKeepCallOffValues(false);
    const row = callOffRows[index];
    if (!row) {
      return;
    }
    const { id, ...draft } = row;
    void id;
    setCallOffForm({ mode: "add", draft });
    setSelectedCallOffRow(null);
    setCallOffFormTab("form");
  };

  const deleteCallOffRow = (index: number) => {
    const row = callOffRows[index];
    if (!row) {
      return;
    }

    setCallOffRows((previous) => previous.filter((current) => current.id !== row.id));
    setSelectedCallOffRow((previous) => (previous === index ? null : previous));
    closeCallOffForm();
  };

  const closeCallOffForm = () => {
    setCallOffForm({ mode: "closed" });
  };

  const setCallOffDraftField = (key: keyof Omit<CallOffRow, "id">, value: string) => {
    setCallOffForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const saveCallOffForm = () => {
    if (callOffForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...callOffForm.draft };

    if (callOffForm.mode === "add") {
      const rowToInsert: CallOffRow = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...nextDraft,
      };

      setCallOffRows((previous) => [...previous, rowToInsert]);

      setLastCallOffDraft(keepCallOffValues ? nextDraft : null);
      closeCallOffForm();
      return;
    }

    setCallOffRows((previous) =>
      previous.map((row) => (row.id === callOffForm.id ? { ...row, ...nextDraft } : row))
    );

    closeCallOffForm();
  };

  const callOffDraft = callOffForm.mode !== "closed" ? callOffForm.draft : null;
  const isCallOffDialogOpen = callOffDraft !== null;
  const isCreateCallOffView = callOffForm.mode === "add";

  const openPaketbokning = (reservationstyp: string, returnTo: "leveransbokadePaket" | "callOffForm") => {
    setPaketbokningFilters((prev) => ({ ...prev, reservationstyp }));
    setPaketbokningResults([]);
    setPaketbokningSearched(false);
    setSelectedPaketRows(new Set());
    setPaketbokningNav({ open: true, reservationstyp, returnTo });
  };

  const closePaketbokning = () => {
    if (paketbokningNav.open && paketbokningNav.returnTo === "callOffForm") {
      setCallOffFormTab("leveransbokadePaket");
    }
    setPaketbokningNav({ open: false });
  };

  const openProductionPlanningAdd = () => {
    setKeepProductionPlanningValues(false);
    const initialDraft = keepProductionPlanningValues && lastProductionPlanningDraft
      ? lastProductionPlanningDraft
      : emptyProductionPlanningRow();
    setProductionPlanningForm({ mode: "add", draft: initialDraft });
    setSelectedProductionPlanningRow(null);
  };

  const openProductionPlanningEdit = (index: number) => {
    setKeepProductionPlanningValues(false);
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setProductionPlanningForm({ mode: "edit", id, draft });
    setSelectedProductionPlanningRow(index);
  };

  const openProductionPlanningClone = (index: number) => {
    setKeepProductionPlanningValues(false);
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    void id;
    setProductionPlanningForm({ mode: "add", draft });
    setSelectedProductionPlanningRow(null);
  };

  const closeProductionPlanningForm = () => {
    setProductionPlanningForm({ mode: "closed" });
  };

  const setProductionPlanningDraftField = (key: keyof Omit<ProductionPlanningRow, "id">, value: string) => {
    setProductionPlanningForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const saveProductionPlanningForm = () => {
    if (productionPlanningForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...productionPlanningForm.draft };

    if (productionPlanningForm.mode === "add") {
      setProductionPlanningRows((previous) => [
        ...previous,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft }
      ]);
      setLastProductionPlanningDraft(keepProductionPlanningValues ? nextDraft : null);
      setProductionPlanningCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));

      if (keepProductionPlanningDialogOpen) {
        setProductionPlanningForm({
          mode: "add",
          draft: keepProductionPlanningValues ? nextDraft : emptyProductionPlanningRow()
        });
        return;
      }
    }

    if (productionPlanningForm.mode === "edit") {
      setProductionPlanningRows((previous) =>
        previous.map((row) =>
          row.id === productionPlanningForm.id ? { ...row, ...nextDraft } : row
        )
      );

      if (keepProductionPlanningDialogOpen) {
        setProductionPlanningForm({ mode: "edit", id: productionPlanningForm.id, draft: nextDraft });
        return;
      }
    }

    closeProductionPlanningForm();
  };

  const deleteProductionPlanningRow = (index: number) => {
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    setProductionPlanningRows((previous) =>
      previous.filter((current) => current.id !== row.id)
    );
    setSelectedProductionPlanningRow((previous) => (previous === index ? null : previous));
    closeProductionPlanningForm();
  };

  const productionPlanningDraft = productionPlanningForm.mode !== "closed" ? productionPlanningForm.draft : null;
  const isProductionPlanningDialogOpen = productionPlanningDraft !== null;

  return (
    <div className={`${styles.lineItemDetailPanel} ${styles.lineItemCreatePanel}`}>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>
            {isNewLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${lineItemId}`}
          </Typography>
          <Chip
            label="Kunden har överskriden limit"
            size="small"
            color="error"
            style={{ marginLeft: 8, fontWeight: 500, padding: "0 4px" }}
          />
        </div>
        <div className={styles.contractModernTopActions}>
          {!isNewLineItem ? (
            <>
              <Button className={styles.lineItemBackButton} size="small" disabled>
                Föregående
              </Button>
              <Button className={styles.lineItemBackButton} size="small" disabled>
                Nästa
              </Button>
              <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
              <Button className={styles.contractSaveButton} size="small" startIcon={<EditOutlinedIcon fontSize="small" />}>
                Redigera
              </Button>
              <Button
                className={styles.contractQuickActionButton}
                size="small"
                onClick={() => {
                  setBytBolagDraft({
                    senderCompany: newLineItemDraft.senderCompany,
                    senderWarehouse: newLineItemDraft.senderWarehouse,
                    responsibleCompany: newLineItemDraft.responsibleCompany,
                  });
                  setIsBytBolagDialogOpen(true);
                }}
              >
                Byt enhet
              </Button>
              <IconButton
                size="small"
                className={styles.contractHeaderDotsButton}
                aria-label="Ta bort kontraktsrad"
                title="Ta bort"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </>
          ) : null}
          {isNewLineItem ? (
            createStep === 0 ? (
              <>
                <Button
                  ref={saveAndContinueButtonRef}
                  className={styles.lineItemSaveButton}
                  size="small"
                  variant="contained"
                  onClick={handleNextStep}
                >
                  Fortsätt
                </Button>
                <Button
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={onSaveAndClose}
                >
                  Avbryt
                </Button>
              </>
            ) : (
              <>
                <Button
                  className={styles.lineItemBackButton2}
                  size="small"
                  onClick={() => setCreateStep(0)}
                >
                  Tillbaka
                </Button>
                <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepOpenAfterSave}
                    onChange={(event) => onToggleKeepOpenAfterSave(event.target.checked)}
                  />
                  <span>Skapa fler</span>
                </label>
                <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
                <Button className={styles.lineItemSaveButton} size="small" variant="contained" onClick={handleSave}>
                  Skapa kontraktsrad
                </Button>
                <Button
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={onSaveAndClose}
                >
                  Avbryt
                </Button>
              </>
            )
          ) : null}
        </div>
      </div>

      <div className={styles.lineItemWizardBar}>
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${createStep === 0 ? styles.lineItemWizardStepActive : ""}`}
          onClick={() => setCreateStep(0)}
        >
          <span className={styles.lineItemWizardStepDot}>1</span>
          <span className={styles.lineItemWizardStepLabel}>Kontraktsradshuvud</span>
        </button>
        <div className={styles.lineItemWizardConnector} />
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${createStep === 1 ? styles.lineItemWizardStepActive : ""} ${isNewLineItem && !canProceedToStep2 ? styles.lineItemWizardStepLocked : ""}`}
          onClick={isNewLineItem ? handleNextStep : () => setCreateStep(1)}
        >
          <span className={styles.lineItemWizardStepDot}>2</span>
          <span className={styles.lineItemWizardStepLabel}>Distribution & planering</span>
        </button>
      </div>

      <div
        className={`${styles.detailTwoColumnLayout} ${createStep === 0 ? styles.lineItemWizardStep0Layout : styles.lineItemWizardStep1Layout}`}
      >
        <div className={styles.detailFormColumn}>
          <div
            ref={accordionWrapRef}
            className={styles.contractModernAccordionWrap}
            onKeyDownCapture={handleFastTrackKeyDown}
          >
            {isNewLineItem && createStep === 0 ? (
              <div className={styles.lineItemFastTrackBar}>
                <div className={styles.lineItemFastTrackMain}>
                  <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
                  <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
                  <span className={styles.lineItemFastTrackText}>
                    Tabba endast mellan de viktigaste fälten i kontraktsradshuvudet
                  </span>
                  <button
                    type="button"
                    className={`${styles.lineItemFastTrackMoreButton} ${showAllOptionalFields ? styles.lineItemFastTrackMoreButtonActive : ""}`}
                    onClick={() => setShowAllOptionalFields(!showAllOptionalFields)}
                    aria-expanded={showAllOptionalFields}
                    title={showAllOptionalFields ? "Dölj valfria fält" : "Välj valfria fält att ta med i snabbspåret"}
                  >
                    Anpassa fält
                    {quickTrackSavedAt && !showAllOptionalFields && hiddenFieldKeys.size === 0 ? <span className={styles.lineItemFastTrackSavedDot} aria-label="Snabbspår sparat" /> : null}
                    <ExpandMoreIcon style={{ fontSize: 14, transition: "transform 0.2s", transform: showAllOptionalFields ? "rotate(180deg)" : "none", marginLeft: 2 }} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 500, lineHeight: "1.2", color: "#748195" }}>Snabbspår</span>
                    <Switch
                      checked={fastTrackEnabled}
                      onChange={handleToggleFastTrack}
                      size="medium"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#c47900',
                          '&:hover': {
                            backgroundColor: 'rgba(196, 121, 0, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#c47900',
                        },
                      }}
                    />
                  </div>

                </div>
                {showAllOptionalFields ? (
                  <div className={styles.lineItemFastTrackChipsPanel}>
                    <div className={styles.lineItemFastTrackChipsPanelHeader}>
                      <div className={styles.lineItemFastTrackChipsPanelTitle}>Klicka på ett fält för att välja läge</div>
                      <div className={styles.lineItemFastTrackChipsPanelHint}>
                        <div className={styles.lineItemFastTrackChipsPanelHintItem}>
                          <span className={styles.lineItemFastTrackOptionalChip}>Fält</span>
                          <span className={styles.lineItemFastTrackChipsPanelHintLabel}>normal</span>
                        </div>
                        <div className={styles.lineItemFastTrackChipsPanelHintItem}>
                          <span className={`${styles.lineItemFastTrackOptionalChip} ${styles.lineItemFastTrackOptionalChipFastTrack}`}><ArrowForwardIcon className={styles.lineItemFastTrackChipModeIcon} aria-hidden="true" />Fält</span>
                          <span className={styles.lineItemFastTrackChipsPanelHintLabel}>snabbspår</span>
                        </div>
                        <div className={styles.lineItemFastTrackChipsPanelHintItem}>
                          <span className={`${styles.lineItemFastTrackOptionalChip} ${styles.lineItemFastTrackOptionalChipHidden}`}><CloseIcon className={styles.lineItemFastTrackChipModeIcon} aria-hidden="true" />Fält</span>
                          <span className={styles.lineItemFastTrackChipsPanelHintLabel}>dolt</span>
                        </div>
                      </div>
                      <hr className={styles.lineItemFastTrackChipsPanelDivider} />
                    </div>
                    {OPTIONAL_FAST_TRACK_GROUPS.map(({ title, fields }) => (
                      <div key={title} className={styles.lineItemFastTrackChipGroup}>
                        <div className={styles.lineItemFastTrackChipGroupTitle}>{title}</div>
                        <div className={styles.lineItemFastTrackChipGroupItems}>
                          {fields.map(({ key, label }) => {
                            const mode = getOptionalFieldMode(key);

                            return (
                              <button
                                key={key}
                                type="button"
                                className={`${styles.lineItemFastTrackOptionalChip} ${mode === "fasttrack" ? styles.lineItemFastTrackOptionalChipFastTrack :
                                  mode === "hidden" ? styles.lineItemFastTrackOptionalChipHidden : ""
                                  }`}
                                onClick={() => cycleOptionalFieldMode(key)}
                                aria-pressed={mode !== "normal"}
                                title={
                                  mode === "normal" ? `Klicka: lägg till ${label} i snabbspår` :
                                    mode === "fasttrack" ? `${label} är i snabbspår – klicka för att dölja` :
                                      `${label} är dolt – klicka för att återställa`
                                }
                              >
                                {mode === "fasttrack" && <ArrowForwardIcon className={styles.lineItemFastTrackChipModeIcon} aria-hidden="true" />}
                                {mode === "hidden" && <CloseIcon className={styles.lineItemFastTrackChipModeIcon} aria-hidden="true" />}
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className={styles.lineItemFastTrackChipsPanelFooter}>
                      <div style={{ flex: 1 }} />
                      <button
                        type="button"
                        className={styles.lineItemFastTrackSaveButtonPrimary}
                        onClick={handleMockSaveQuickTrack}
                      >
                        Spara val
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Accordion
              expanded={expandedPanels.includes("allmant")}
              onChange={() => togglePanel("allmant")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <TableChartOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Allmänt</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="senderCompany" label={getFieldLabel("senderCompany", "Utlastande enhet")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("senderCompany", "Utlastande enhet")} value={newLineItemDraft.senderCompany} onChange={(v) => updateDraftField("senderCompany", v)} className={getFieldControlClassName("senderCompany")}>
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                      <MenuItem value="Moelven">Moelven</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="senderWarehouse" label={getFieldLabel("senderWarehouse", "Utlastande lagerställe")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("senderWarehouse", "Utlastande lagerställe")} value={newLineItemDraft.senderWarehouse} onChange={(v) => updateDraftField("senderWarehouse", v)} className={getFieldControlClassName("senderWarehouse")}>
                      <MenuItem value="Krokom">Krokom</MenuItem>
                      <MenuItem value="Hissmofors">Hissmofors</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="responsibleCompany" label={getFieldLabel("responsibleCompany", "Ansvarig enhet")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("responsibleCompany", "Ansvarig enhet")} value={newLineItemDraft.responsibleCompany} onChange={(v) => updateDraftField("responsibleCompany", v)} className={getFieldControlClassName("responsibleCompany")}>
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                      <MenuItem value="Moelven">Moelven</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="status" label={getFieldLabel("status", "Status")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("status", "Status")} value={newLineItemDraft.status} onChange={(v) => updateDraftField("status", v)} className={getFieldControlClassName("status")}>
                      <MenuItem value="Aktiv">Aktiv</MenuItem>
                      <MenuItem value="Pausad">Pausad</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("certification")}`}>
                    <FieldLabel fieldKey="certification" label="Certifiering" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Certifiering" value={newLineItemDraft.certification} size="small" className={getFieldControlClassName("certification")} InputProps={{ readOnly: true }} helperText="Bestäms av kontraktet" />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("priceList")}`}>
                    <FieldLabel fieldKey="priceList" label="Prislista" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField
                      label="Prislista"
                      size="small"
                      className={getFieldControlClassName("priceList")}
                      value={newLineItemDraft.priceList !== "" ? "BP Trävaruprislista 2025" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Checkbox
                              size="small"
                              checked={newLineItemDraft.priceList !== ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) => updateDraftField("priceList", event.target.checked ? "BP Trävaruprislista 2025" : "")}
                            />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ style: { cursor: "pointer", caretColor: "transparent" } }}
                      onClick={() => updateDraftField("priceList", newLineItemDraft.priceList !== "" ? "" : "BP Trävaruprislista 2025")}
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("produkt")}
              onChange={() => togglePanel("produkt")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Produkt</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemSectionGrid3}>

                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="artNr" label={getFieldLabel("artNr", "ArtNr")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <div className={styles.lineItemFieldWithAction}>
                      <LabeledSelect label={getFieldLabel("artNr", "ArtNr")} value={newLineItemDraft.artNr} onChange={handleArtNrChange} className={`${getFieldControlClassName("artNr")} ${styles.lineItemFieldActionInput}`}>
                        <MenuItem value="">-</MenuItem>
                        {ART_NR_OPTIONS.map((artNrOption) => (
                          <MenuItem key={artNrOption} value={artNrOption}>{artNrOption}</MenuItem>
                        ))}
                      </LabeledSelect>
                      <IconButton
                        size="small"
                        className={styles.lineItemFieldActionButton}
                        onClick={openProductDetail}
                        disabled={!hasSelectedProduct}
                        title="Öppna produktdetalj"
                        aria-label="Öppna produktdetalj"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("nobbNumber")}`}>
                    <FieldLabel fieldKey="nobbNumber" label="NOBBnr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="NOBBnr" value={newLineItemDraft.nobbNumber} onChange={(v) => updateDraftField("nobbNumber", v)} className={getFieldControlClassName("nobbNumber")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="10110001">10110001</MenuItem>
                      <MenuItem value="10110002">10110002</MenuItem>
                      <MenuItem value="10110003">10110003</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("deliverArtNr")}`}>
                    <FieldLabel fieldKey="deliverArtNr" label="Leverera ArtNr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <div className={styles.lineItemFieldWithAction}>
                      <LabeledSelect label="Leverera ArtNr" value={newLineItemDraft.deliverArtNr} onChange={(v) => updateDraftField("deliverArtNr", v)} className={`${getFieldControlClassName("deliverArtNr")} ${styles.lineItemFieldActionInput}`}>
                        <MenuItem value="">-</MenuItem>
                        {ART_NR_OPTIONS.map((artNrOption) => (
                          <MenuItem key={artNrOption} value={artNrOption}>{artNrOption}</MenuItem>
                        ))}
                      </LabeledSelect>
                      <IconButton
                        size="small"
                        className={styles.lineItemFieldActionButton}
                        onClick={openProductDetail}
                        disabled={!hasSelectedProduct}
                        title="Öppna produktdetalj"
                        aria-label="Öppna produktdetalj"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={`${styles.lineItemField}${fieldHide("product")}`}>
                    <FieldLabel fieldKey="product" label="Produkt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Produkt" value={newLineItemDraft.product} onChange={(event) => updateDraftField("product", event.target.value)} size="small" className={getFieldControlClassName("product")} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("deliverProduct")}`}>
                    <FieldLabel fieldKey="deliverProduct" label="Leverera produkt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leverera produkt" value={newLineItemDraft.deliverProduct} onChange={(event) => updateDraftField("deliverProduct", event.target.value)} size="small" className={getFieldControlClassName("deliverProduct")} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("invoiceText")}`}>
                    <FieldLabel fieldKey="invoiceText" label="Fakturatext" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Fakturatext" value={newLineItemDraft.invoiceText} onChange={(event) => updateDraftField("invoiceText", event.target.value)} size="small" className={getFieldControlClassName("invoiceText")} />
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="packageType" label={getFieldLabel("packageType", "Pakettyp")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("packageType", "Pakettyp")} value={newLineItemDraft.packageType} onChange={(v) => updateDraftField("packageType", v)} className={getFieldControlClassName("packageType")}>
                      <MenuItem value="Lp">Lp</MenuItem>
                      <MenuItem value="Paket">Paket</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("deliverPackageType")}`}>
                    <FieldLabel fieldKey="deliverPackageType" label="Leverera pakettyp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="Leverera pakettyp" value={newLineItemDraft.deliverPackageType} onChange={(v) => updateDraftField("deliverPackageType", v)} className={getFieldControlClassName("deliverPackageType")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Lp">Lp</MenuItem>
                      <MenuItem value="Paket">Paket</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("length")}`}>
                    <FieldLabel fieldKey="length" label="Längd" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Längd" value={newLineItemDraft.length} onChange={(event) => updateDraftField("length", event.target.value)} size="small" className={getFieldControlClassName("length")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="packaging" label="Emballage" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="Emballage" value={newLineItemDraft.packaging} onChange={(v) => updateDraftField("packaging", v)} className={getFieldControlClassName("packaging")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Skydd">Skydd</MenuItem>
                      <MenuItem value="Export">Export</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("bundle")}`}>
                    <FieldLabel fieldKey="bundle" label="Bunt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Bunt" value={newLineItemDraft.bundle} onChange={(event) => updateDraftField("bundle", event.target.value)} size="small" className={getFieldControlClassName("bundle")} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("vflGroup")}`}>
                    <FieldLabel fieldKey="vflGroup" label="VFL grupp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="VFL grupp" value={newLineItemDraft.vflGroup} onChange={(v) => updateDraftField("vflGroup", v)} className={getFieldControlClassName("vflGroup")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="VFL-A">VFL-A</MenuItem>
                      <MenuItem value="VFL-B">VFL-B</MenuItem>
                      <MenuItem value="VFL-C">VFL-C</MenuItem>
                    </LabeledSelect>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("affar")}
              onChange={() => togglePanel("affar")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <GavelOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Affär</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="quantity" label={getFieldLabel("quantity", "Mängd")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("quantity", "Mängd")} value={newLineItemDraft.quantity} onChange={(event) => updateDraftField("quantity", event.target.value)} size="small" className={getFieldControlClassName("quantity")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="orderedUnit" label={getFieldLabel("orderedUnit", "Beställd enhet")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("orderedUnit", "Beställd enhet")} value={newLineItemDraft.orderedUnit} onChange={(v) => updateDraftField("orderedUnit", v)} className={getFieldControlClassName("orderedUnit")}>
                      <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                      <MenuItem value="m3 fast">m3 fast</MenuItem>
                      <MenuItem value="lpm">lpm</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="volume" label={getFieldLabel("volume", "Volym")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("volume", "Volym")} value={newLineItemDraft.volume} onChange={(event) => updateDraftField("volume", event.target.value)} size="small" className={getFieldControlClassName("volume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("finalVolume")}`}>
                    <FieldLabel fieldKey="finalVolume" label="Slutvolym" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Slutvolym" value={newLineItemDraft.finalVolume} onChange={(event) => updateDraftField("finalVolume", event.target.value)} size="small" className={getFieldControlClassName("finalVolume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="invoiceUnit" label={getFieldLabel("invoiceUnit", "Faktura enhet")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("invoiceUnit", "Faktura enhet")} value={newLineItemDraft.invoiceUnit} onChange={(v) => updateDraftField("invoiceUnit", v)} className={getFieldControlClassName("invoiceUnit")}>
                      <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                      <MenuItem value="m3 fast">m3 fast</MenuItem>
                      <MenuItem value="lpm">lpm</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("adjustedPrice")}`}>
                    <FieldLabel fieldKey="adjustedPrice" label="Prisjusterad" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Prisjusterad" value={newLineItemDraft.adjustedPrice} onChange={(event) => updateDraftField("adjustedPrice", event.target.value)} size="small" className={getFieldControlClassName("adjustedPrice")} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="price" label={getFieldLabel("price", "Pris")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("price", "Pris")} value={newLineItemDraft.price} onChange={(event) => updateDraftField("price", event.target.value)} size="small" className={getFieldControlClassName("price")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("amount")}`}>
                    <FieldLabel fieldKey="amount" label="Belopp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Belopp" value={newLineItemDraft.amount} onChange={(event) => updateDraftField("amount", event.target.value)} size="small" className={getFieldControlClassName("amount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("sponsorship")}`}>
                    <FieldLabel fieldKey="sponsorship" label="Sponsring" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Sponsring" value={newLineItemDraft.sponsorship} onChange={(event) => updateDraftField("sponsorship", event.target.value)} size="small" className={getFieldControlClassName("sponsorship")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("sponsoredAmount")}`}>
                    <FieldLabel fieldKey="sponsoredAmount" label="Belopp spons" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Belopp spons" value={newLineItemDraft.sponsoredAmount} onChange={(event) => updateDraftField("sponsoredAmount", event.target.value)} size="small" className={getFieldControlClassName("sponsoredAmount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("caneaAgreementNumber")}`}>
                    <FieldLabel fieldKey="caneaAgreementNumber" label="Avtalsnr i Canea" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Avtalsnr i Canea" value={newLineItemDraft.caneaAgreementNumber} onChange={(event) => updateDraftField("caneaAgreementNumber", event.target.value)} size="small" className={getFieldControlClassName("caneaAgreementNumber")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="salesType" label={getFieldLabel("salesType", "Säljtyp")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("salesType", "Säljtyp")} value={newLineItemDraft.salesType} onChange={(v) => updateDraftField("salesType", v)} className={getFieldControlClassName("salesType")}>
                      <MenuItem value="Eget virke">Eget virke</MenuItem>
                      <MenuItem value="Handelsvara">Handelsvara</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("pickingSurchargeEnabled")}`}>
                    <FieldLabel fieldKey="pickingSurchargeEnabled" label="Plocktillägg" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField
                      label="Plocktillägg"
                      size="small"
                      className={getFieldControlClassName("pickingSurchargeEnabled")}
                      value={newLineItemDraft.pickingSurchargeEnabled ? "Ja" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Checkbox
                              size="small"
                              checked={Boolean(newLineItemDraft.pickingSurchargeEnabled)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) => updateDraftField("pickingSurchargeEnabled", event.target.checked)}
                            />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ style: { cursor: "pointer", caretColor: "transparent" } }}
                      onClick={() => updateDraftField("pickingSurchargeEnabled", !newLineItemDraft.pickingSurchargeEnabled)}
                    />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("pickingSurchargeQuantity")}`}>
                    <FieldLabel fieldKey="pickingSurchargeQuantity" label="Plocktillägg antal" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField
                      label="Plocktillägg antal"
                      size="small"
                      className={getFieldControlClassName("pickingSurchargeQuantity")}
                      value={newLineItemDraft.pickingSurchargeQuantity}
                      onChange={(event) => updateDraftField("pickingSurchargeQuantity", event.target.value)}
                      InputProps={{ endAdornment: <InputAdornment position="end">st</InputAdornment> }}
                      helperText="vilket ger 15% minst 300 SEK"
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("leverans")}
              onChange={() => togglePanel("leverans")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <LocalShippingOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Leverans</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={`${styles.lineItemField}${fieldHide("deliveryWeek")}`}>
                    <FieldLabel fieldKey="deliveryWeek" label="Leveransvecka" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leveransvecka" value={newLineItemDraft.deliveryWeek} onChange={(event) => updateDraftField("deliveryWeek", event.target.value)} size="small" className={getFieldControlClassName("deliveryWeek")} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("deliveryDay")}`}>
                    <FieldLabel fieldKey="deliveryDay" label="Leveransdag" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="Leveransdag" value={newLineItemDraft.deliveryDay} onChange={(v) => updateDraftField("deliveryDay", v)} className={getFieldControlClassName("deliveryDay")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Måndag">Måndag</MenuItem>
                      <MenuItem value="Tisdag">Tisdag</MenuItem>
                      <MenuItem value="Onsdag">Onsdag</MenuItem>
                      <MenuItem value="Torsdag">Torsdag</MenuItem>
                      <MenuItem value="Fredag">Fredag</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliveryWindowMin" label={getFieldLabel("deliveryWindowMin", "Lev. fönster min")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("deliveryWindowMin", "Lev. fönster min")} value={newLineItemDraft.deliveryWindowMin} onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)} size="small" className={getFieldControlClassName("deliveryWindowMin")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliveryWindowMax" label={getFieldLabel("deliveryWindowMax", "Lev. fönster max")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("deliveryWindowMax", "Lev. fönster max")} value={newLineItemDraft.deliveryWindowMax} onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)} size="small" className={getFieldControlClassName("deliveryWindowMax")} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("deliveryPeriodDocument")}`}>
                    <FieldLabel fieldKey="deliveryPeriodDocument" label="Leveransperiod kunddokument" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leveransperiod kunddokument" value={newLineItemDraft.deliveryPeriodDocument} onChange={(event) => updateDraftField("deliveryPeriodDocument", event.target.value)} size="small" className={getFieldControlClassName("deliveryPeriodDocument")} />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("ovrigt")}
              onChange={() => togglePanel("ovrigt")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Övrigt</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="callOffStatus" label={getFieldLabel("callOffStatus", "Avropsradsstatus")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("callOffStatus", "Avropsradsstatus")} value={newLineItemDraft.callOffStatus} onChange={(v) => updateDraftField("callOffStatus", v)} className={getFieldControlClassName("callOffStatus")}>
                      <MenuItem value="Sales planned">Sales planned</MenuItem>
                      <MenuItem value="Load planned">Load planned</MenuItem>
                      <MenuItem value="Aktiv">Aktiv</MenuItem>
                    </LabeledSelect>
                  </div>
                </div>
                <hr className={styles.contractFlatDivider} />
                <div className={styles.lineItemSectionGrid3}>
                  <div className={`${styles.lineItemField}${fieldHide("showOnInvoice")}`}>
                    <FieldLabel fieldKey="showOnInvoice" label="Visa på följesedel" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField
                      label="Visa på följesedel"
                      size="small"
                      className={getFieldControlClassName("showOnInvoice")}
                      value={newLineItemDraft.showOnInvoice ? "Ja" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Checkbox
                              size="small"
                              checked={Boolean(newLineItemDraft.showOnInvoice)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) => updateDraftField("showOnInvoice", event.target.checked)}
                            />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ style: { cursor: "pointer", caretColor: "transparent" } }}
                      helperText="Extern kommentar visas på följesedel och faktura"
                      onClick={() => updateDraftField("showOnInvoice", !newLineItemDraft.showOnInvoice)}
                    />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("internalComment")}`}>
                    <FieldLabel fieldKey="internalComment" label="Intern kommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Intern kommentar" value={newLineItemDraft.internalComment} onChange={(event) => updateDraftField("internalComment", event.target.value)} size="small" className={getFieldControlClassName("internalComment")} multiline rows={3} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("externalComment")}`}>
                    <FieldLabel fieldKey="externalComment" label="Extern kommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Extern kommentar" value={newLineItemDraft.externalComment} onChange={(event) => updateDraftField("externalComment", event.target.value)} size="small" className={getFieldControlClassName("externalComment")} multiline rows={3} />
                    <Typography className={styles.lineItemFieldHelperText}>Visas på orderbekräftelse och kontrakt. Följer med till lastorder.</Typography>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("customerComment")}`}>
                    <FieldLabel fieldKey="customerComment" label="Kundkommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Kundkommentar" value={newLineItemDraft.customerComment} onChange={(event) => updateDraftField("customerComment", event.target.value)} size="small" className={getFieldControlClassName("customerComment")} multiline rows={3} />
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("customerBrand")}`}>
                    <FieldLabel fieldKey="customerBrand" label="Kundens märke" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Kundens märke" value={newLineItemDraft.customerBrand} onChange={(event) => updateDraftField("customerBrand", event.target.value)} size="small" className={getFieldControlClassName("customerBrand")} />
                    <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på följesedel och faktura.</Typography>
                  </div>
                  <div className={`${styles.lineItemField}${fieldHide("recipientBrand")}`}>
                    <FieldLabel fieldKey="recipientBrand" label="Godsmottagarens märke" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Godsmottagarens märke" value={newLineItemDraft.recipientBrand} onChange={(event) => updateDraftField("recipientBrand", event.target.value)} size="small" className={getFieldControlClassName("recipientBrand")} />
                    <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på fraktsedel och i C-Load.</Typography>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
        <div className={styles.detailTabsColumn}>
          <div className={styles.contractModernAdditionsWrap}>
            {createStep === 1 ? (
              <div className={styles.lineItemWizardReviewCard}>
                <div className={styles.lineItemWizardReviewHeader}>
                  <span className={styles.lineItemWizardReviewTitle}>{isNewLineItem ? "Obligatoriska uppgifter från kontraktsradshuvud" : "Obligatoriska uppgifter från kontraktsradshuvud"}</span>
                  {remainingReviewFields.length > 0 ? (
                    <>
                      <Button
                        type="button"
                        size="small"
                        className={styles.lineItemWizardReviewToggleBtnInline}
                        endIcon={
                          <ExpandMoreIcon
                            className={`${styles.lineItemWizardReviewToggleIcon} ${showAllReviewFields ? styles.lineItemWizardReviewToggleIconOpen : ""}`}
                          />
                        }
                        onClick={() => setShowAllReviewFields((previous) => !previous)}
                      >
                        {showAllReviewFields ? "Visa färre" : "Visa alla"}
                      </Button>
                    </>
                  ) : null}
                </div>
                <div className={styles.lineItemWizardReviewFields}>
                  {highlightedReviewFields.map(renderReviewField)}
                </div>
                {remainingReviewFields.length > 0 ? (
                  <>
                    {showAllReviewFields ? (
                      <div className={styles.lineItemWizardReviewFieldsExtra}>
                        <div className={styles.lineItemWizardReviewFields}>
                          {remainingReviewFields.map(renderReviewField)}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
            <div className={styles.contractMudTabBar} style={{ paddingLeft: 16, paddingRight: 16 }}>
              {lineItemDetailTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.contractMudTabItem} ${activeTab === tab ? styles.contractMudTabItemActive : ""}`}
                  onClick={() => onChangeTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.contractDetailMainContent}>
              {paketbokningNav.open ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.paketbokningViewHeader}>
                    <Button
                      size="small"
                      startIcon={<ArrowBackIcon fontSize="small" />}
                      className={styles.paketbokningBackButton}
                      onClick={closePaketbokning}
                    >
                      Tillbaka
                    </Button>
                    <Typography className={styles.paketbokningViewTitle}>Paketbokning</Typography>
                  </div>
                  <div className={styles.paketbokningFiltersRow}>
                    <FormControl size="small" className={styles.paketbokningFilterField}>
                      <InputLabel>Reservationstyp</InputLabel>
                      <Select
                        value={paketbokningFilters.reservationstyp}
                        label="Reservationstyp"
                        onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, reservationstyp: e.target.value }))}
                      >
                        {RESERVATIONSTYP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" className={styles.paketbokningFilterField} style={{ minWidth: 220 }}>
                      <InputLabel>Kontrakt:Produkt</InputLabel>
                      <Select
                        value={paketbokningFilters.kontraktProdukt}
                        label="Kontrakt:Produkt"
                        onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, kontraktProdukt: e.target.value }))}
                      >
                        {KONTRAKT_PRODUKT_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" className={styles.paketbokningFilterField} style={{ minWidth: 200 }}>
                      <InputLabel>Enhet</InputLabel>
                      <Select
                        value={paketbokningFilters.enhet}
                        label="Enhet"
                        onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, enhet: e.target.value }))}
                      >
                        {ENHET_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Längd min"
                      value={paketbokningFilters.langdMin}
                      onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, langdMin: e.target.value }))}
                      className={styles.paketbokningFilterShort}
                    />
                    <TextField
                      size="small"
                      label="Längd max"
                      value={paketbokningFilters.langdMax}
                      onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, langdMax: e.target.value }))}
                      className={styles.paketbokningFilterShort}
                    />
                    <FormControl size="small" className={styles.paketbokningFilterField}>
                      <InputLabel>VFL grupp</InputLabel>
                      <Select
                        value={paketbokningFilters.vflGrupp}
                        label="VFL grupp"
                        onChange={(e) => setPaketbokningFilters((prev) => ({ ...prev, vflGrupp: e.target.value }))}
                      >
                        <MenuItem value=""><em>Alla</em></MenuItem>
                        {VFL_GRUPP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button
                      size="small"
                      variant="contained"
                      className={styles.paketbokningSearchBtn}
                      onClick={() => {
                        setPaketbokningResults(PAKETBOKNING_MOCK_RESULTS);
                        setPaketbokningSearched(true);
                        setSelectedPaketRows(new Set());
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
                      disabled={selectedPaketRows.size === 0}
                      onClick={() => {
                        const newRows: BokadPaketRow[] = [...selectedPaketRows].map((idx) => {
                          const r = paketbokningResults[idx]!;
                          return { paketnr: r.paketnr, lpm: r.lpm, produkt: r.produkt, lagerstalle: r.lagerstalle, lagerplats: r.lagerplats, mdlangd: r.mdlangd, skaLastasUt: "Nej" };
                        });
                        setBokadePaketRows((prev) => [...prev, ...newRows]);
                        setPaketbokningResults((prev) => prev.filter((_, i) => !selectedPaketRows.has(i)));
                        setSelectedPaketRows(new Set());
                        closePaketbokning();
                      }}
                    >
                      Reservera
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      className={styles.paketbokningActionBtn}
                      // startIcon={<RefreshOutlinedIcon fontSize="small" />}
                      disabled={selectedPaketRows.size === 0}
                      onClick={() => {
                        const newRows: BokadPaketRow[] = [...selectedPaketRows].map((idx) => {
                          const r = paketbokningResults[idx]!;
                          return { paketnr: r.paketnr, lpm: r.lpm, produkt: r.produkt, lagerstalle: r.lagerstalle, lagerplats: r.lagerplats, mdlangd: r.mdlangd, skaLastasUt: "Ja" };
                        });
                        setBokadePaketRows((prev) => [...prev, ...newRows]);
                        setPaketbokningResults((prev) => prev.filter((_, i) => !selectedPaketRows.has(i)));
                        setSelectedPaketRows(new Set());
                        closePaketbokning();
                      }}
                    >
                      Ska lastas ut
                    </Button>
                    <div className={styles.paketbokningActionSep} />
                    <Button
                      size="small"
                      variant="outlined"
                      className={styles.paketbokningActionBtnDanger}
                      disabled={selectedPaketRows.size === 0}
                      onClick={() => {
                        setPaketbokningResults((prev) => prev.filter((_, i) => !selectedPaketRows.has(i)));
                        setSelectedPaketRows(new Set());
                      }}
                    >
                      Ta bort reservation
                    </Button>
                  </div>

                  {paketbokningSearched ? (
                    <div className={styles.lineItemsTableFrame}>
                      <div className={styles.freightTableWrap}>
                        <div className={styles.freightTable}>
                          <DataTable
                            variant="line"
                            fillRemainingSpace
                            columns={PAKETBOKNING_RESULT_COLUMNS}
                            rows={paketbokningResults}
                            rowKey={(row, index) => `pbr-${row.paketnr}-${index}`}
                            selectedRowIndex={null}
                            onRowClick={(index) => {
                              setSelectedPaketRows((prev) => {
                                const next = new Set(prev);
                                if (next.has(index)) { next.delete(index); } else { next.add(index); }
                                return next;
                              });
                            }}
                            renderCell={(row, column, rowIndex) => {
                              if (column.key === "_select") {
                                return (
                                  <Checkbox
                                    size="small"
                                    checked={selectedPaketRows.has(rowIndex)}
                                    onChange={() => {
                                      setSelectedPaketRows((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(rowIndex)) { next.delete(rowIndex); } else { next.add(rowIndex); }
                                        return next;
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ padding: "2px" }}
                                  />
                                );
                              }
                              return row[column.key as keyof PaketbokningResultRow] ?? "-";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : activeTab === "Längdfördelning" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    <div className={styles.freightSectionHeader}>
                      <div className={styles.lengthDistributionControls}>
                        <Button
                          className={styles.freightNewButton}
                          startIcon={<AddIcon />}
                          onClick={openLengthDistributionAdd}
                        >
                          Ny
                        </Button>
                        <span className={styles.lengthDistributionControlsDivider} aria-hidden="true" />
                        <label className={styles.freightDialogKeepOpen}>
                          <Checkbox
                            size="small"
                            checked={showLengthOnPrint}
                            onChange={(event) => setShowLengthOnPrint(event.target.checked)}
                          />
                          <span>Visa längd vid utskrift</span>
                        </label>
                      </div>
                    </div>

                    <div className={styles.lineItemsTableFrame}>
                      <div className={styles.freightTableWrap}>
                        <div className={styles.freightTable}>
                          <DataTable
                            variant="line"
                            fillRemainingSpace
                            columns={LENGTH_DISTRIBUTION_COLUMNS}
                            rows={lengthDistributionRows}
                            rowKey={(row, index) => `${row.id}-${index}`}
                            selectedRowIndex={selectedLengthDistributionRow}
                            onRowClick={(index) =>
                              setSelectedLengthDistributionRow((previous) => (previous === index ? null : index))
                            }
                            renderCell={(row, column, rowIndex) => {
                              if (column.key === "_actions") {
                                return (
                                  <span className={styles.freightActionCell}>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openLengthDistributionEdit(rowIndex);
                                      }}
                                      title="Redigera rad"
                                    >
                                      <EditOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openLengthDistributionClone(rowIndex);
                                      }}
                                      title="Duplicera rad"
                                    >
                                      <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        deleteLengthDistributionRow(rowIndex);
                                      }}
                                      title="Ta bort rad"
                                    >
                                      <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                  </span>
                                );
                              }

                              const value = row[column.key as keyof Omit<LengthDistributionRow, "id">];
                              return value?.trim() ? value : "-";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Dialog
                    open={isLengthDistributionDialogOpen}
                    onClose={closeLengthDistributionForm}
                    fullWidth
                    maxWidth="md"
                    classes={{ paper: styles.freightDialogPaper }}
                  >
                    <DialogTitle className={styles.freightDialogTitle}>
                      <div className={styles.freightDialogTitleRow}>
                        <span>{lengthDistributionForm.mode === "add" ? "Ny längdfördelning" : "Redigera längdfördelning"}</span>
                        {lengthDistributionForm.mode === "add" ? (
                          <div className={styles.freightDialogToggles}>
                            <label className={styles.freightDialogKeepOpen}>
                              <Checkbox
                                size="small"
                                checked={keepLengthDistributionDialogOpen}
                                onChange={(event) => setKeepLengthDistributionDialogOpen(event.target.checked)}
                              />
                              <span>Behåll öppen</span>
                            </label>
                            <label className={styles.freightDialogKeepOpen}>
                              <Checkbox
                                size="small"
                                checked={keepLengthDistributionValues}
                                onChange={(event) => {
                                  setKeepLengthDistributionValues(event.target.checked);
                                  if (event.target.checked) setKeepLengthDistributionDialogOpen(true);
                                }}
                              />
                              <span>Behåll värden</span>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    </DialogTitle>
                    <DialogContent className={styles.freightDialogContent}>
                      {lengthDistributionDraft !== null ? (
                        <div className={styles.avropFormGrid}>
                          <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Längd</Typography>
                            <TextField
                              size="small"
                              value={lengthDistributionDraft.langd}
                              onChange={(e) => setLengthDistributionDraftField("langd", e.target.value)}
                              className={styles.freightFormInput}
                            />
                          </div>
                          <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Mängd</Typography>
                            <TextField
                              size="small"
                              value={lengthDistributionDraft.mangd}
                              onChange={(e) => setLengthDistributionDraftField("mangd", e.target.value)}
                              className={styles.freightFormInput}
                            />
                          </div>
                          <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Enhet</Typography>
                            <Select
                              size="small"
                              value={lengthDistributionDraft.enhet}
                              onChange={(e) => setLengthDistributionDraftField("enhet", String(e.target.value))}
                              className={styles.freightFormInput}
                            >
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
                      <Button size="small" className={styles.freightSaveButton} onClick={saveLengthDistributionForm}>
                        {lengthDistributionForm.mode === "add" ? "Lägg till" : "Spara"}
                      </Button>
                      <Button size="small" className={styles.freightCancelButton} onClick={closeLengthDistributionForm}>
                        Avbryt
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Snackbar
                    key={`length-create-${lengthDistributionCreateFeedback.key}`}
                    open={lengthDistributionCreateFeedback.open}
                    autoHideDuration={2200}
                    onClose={() => setLengthDistributionCreateFeedback((previous) => ({ ...previous, open: false }))}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    <Alert
                      onClose={() => setLengthDistributionCreateFeedback((previous) => ({ ...previous, open: false }))}
                      severity="success"
                      variant="filled"
                    >
                      Post skapad
                    </Alert>
                  </Snackbar>
                </div>
              ) : activeTab === "Avropsrad" ? (
                <div className={styles.freightTabContent}>
                  {callOffForm.mode !== "closed" ? (
                    <div className={styles.callOffFormView}>
                      <div className={styles.callOffFormViewHeader}>
                        <span className={styles.callOffFormViewTitle}>
                          {isCreateCallOffView ? "Ny avropsrad" : "Redigera avropsrad"}
                        </span>
                        <div className={styles.callOffFormViewHeaderRight}>
                          {isCreateCallOffView ? (
                            <div className={styles.freightDialogToggles}>
                              <label className={styles.freightDialogKeepOpen}>
                                <Checkbox
                                  size="small"
                                  checked={keepCallOffValues}
                                  onChange={(event) => {
                                    setKeepCallOffValues(event.target.checked);
                                  }}
                                />
                                <span>Behåll värden</span>
                              </label>
                            </div>
                          ) : null}
                          <IconButton size="small" onClick={closeCallOffForm} title="Stäng">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </div>

                      <div className={styles.contractMudTabBar}>
                        <button
                          type="button"
                          className={`${styles.contractMudTabItem} ${callOffFormTab === "form" ? styles.contractMudTabItemActive : ""}`}
                          onClick={() => setCallOffFormTab("form")}
                        >
                          Formulär
                        </button>
                        {!isCreateCallOffView ? (
                          <button
                            type="button"
                            className={`${styles.contractMudTabItem} ${callOffFormTab === "leveransbokadePaket" ? styles.contractMudTabItemActive : ""}`}
                            onClick={() => setCallOffFormTab("leveransbokadePaket")}
                          >
                            Leveransbokade paket
                          </button>
                        ) : null}
                      </div>

                      {callOffFormTab === "form" ? (
                        <>
                          <div className={styles.avropFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Artikel</Typography>
                            <div className={styles.avropFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>ArtNr</Typography><Select size="small" value={callOffDraft!.artNr} onChange={(e) => setCallOffDraftField("artNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera ArtNr</Typography><Select size="small" value={callOffDraft!.levereraArtNr} onChange={(e) => setCallOffDraftField("levereraArtNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Fakturatext</Typography><TextField size="small" value={callOffDraft!.fakturatext} onChange={(e) => setCallOffDraftField("fakturatext", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera Produkt</Typography><TextField size="small" value={callOffDraft!.levereraProdukt} onChange={(e) => setCallOffDraftField("levereraProdukt", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Pakettyp</Typography><Select size="small" value={callOffDraft!.pakettyp} onChange={(e) => setCallOffDraftField("pakettyp", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Lp">Lp</MenuItem><MenuItem value="Paket">Paket</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera pakettyp</Typography><Select size="small" value={callOffDraft!.levereraPakettyp} onChange={(e) => setCallOffDraftField("levereraPakettyp", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Lp">Lp</MenuItem><MenuItem value="Paket">Paket</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Certifiering</Typography><Select size="small" value={callOffDraft!.certifiering} onChange={(e) => setCallOffDraftField("certifiering", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ocertifierat">Ocertifierat</MenuItem><MenuItem value="FSC">FSC</MenuItem><MenuItem value="PEFC">PEFC</MenuItem></Select></div>
                            </div>
                          </div>

                          <div className={styles.avropFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Volym &amp; pris</Typography>
                            <div className={styles.avropFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Mängd</Typography><TextField size="small" value={callOffDraft!.mangd} onChange={(e) => setCallOffDraftField("mangd", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Apris</Typography><TextField size="small" value={callOffDraft!.aPris} onChange={(e) => setCallOffDraftField("aPris", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Beställd enhet</Typography><Select size="small" value={callOffDraft!.enhet} onChange={(e) => setCallOffDraftField("enhet", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="m3 nominell">m3 nominell</MenuItem><MenuItem value="m3 fast">m3 fast</MenuItem><MenuItem value="lpm">lpm</MenuItem><MenuItem value="st">st</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Volym</Typography><TextField size="small" value={callOffDraft!.volym} onChange={(e) => setCallOffDraftField("volym", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Emballage</Typography><Select size="small" value={callOffDraft!.emballage} onChange={(e) => setCallOffDraftField("emballage", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Standard">Standard</MenuItem><MenuItem value="Skydd">Skydd</MenuItem><MenuItem value="Export">Export</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Bunt</Typography><TextField size="small" value={callOffDraft!.bunt} onChange={(e) => setCallOffDraftField("bunt", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Folie</Typography><Select size="small" value={callOffDraft!.folie} onChange={(e) => setCallOffDraftField("folie", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ingen">Ingen</MenuItem><MenuItem value="Vit">Vit</MenuItem><MenuItem value="Transparent">Transparent</MenuItem></Select></div>
                            </div>
                          </div>

                          <div className={styles.avropFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Leverans</Typography>
                            <div className={styles.avropFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leveransvecka</Typography><TextField size="small" value={callOffDraft!.leveransvecka} onChange={(e) => setCallOffDraftField("leveransvecka", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leveransdag</Typography><Select size="small" value={callOffDraft!.leveransdag} onChange={(e) => setCallOffDraftField("leveransdag", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Måndag">Måndag</MenuItem><MenuItem value="Tisdag">Tisdag</MenuItem><MenuItem value="Onsdag">Onsdag</MenuItem><MenuItem value="Torsdag">Torsdag</MenuItem><MenuItem value="Fredag">Fredag</MenuItem></Select></div>
                            </div>
                          </div>

                          <div className={styles.avropFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Tillägg</Typography>
                            <div className={styles.avropFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Plocktillägg min</Typography><TextField size="small" value={callOffDraft!.plocktillaggMin} onChange={(e) => setCallOffDraftField("plocktillaggMin", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Plocktillägg</Typography><TextField size="small" value={callOffDraft!.plocktillagg} onChange={(e) => setCallOffDraftField("plocktillagg", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Målningstillägg</Typography><TextField size="small" value={callOffDraft!.malningstillagg} onChange={(e) => setCallOffDraftField("malningstillagg", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Målningstillägg tröskel</Typography><TextField size="small" helperText="Tillägg vid mindre än detta värde" value={callOffDraft!.malningstillaggTroskel} onChange={(e) => setCallOffDraftField("malningstillaggTroskel", e.target.value)} className={styles.freightFormInput} slotProps={{ input: { endAdornment: <InputAdornment position="end">lpm</InputAdornment> } }} /></div>
                            </div>
                          </div>

                          <div className={styles.avropFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Övrigt</Typography>
                            <div className={styles.avropFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Lastorder volym</Typography><TextField size="small" value={callOffDraft!.lastorderVolym} onChange={(e) => setCallOffDraftField("lastorderVolym", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Levererad volym</Typography><TextField size="small" value={callOffDraft!.leveradVolym} onChange={(e) => setCallOffDraftField("leveradVolym", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Intern kommentar</Typography><TextField size="small" value={callOffDraft!.internKommentar} onChange={(e) => setCallOffDraftField("internKommentar", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Kundmärke</Typography><TextField size="small" value={callOffDraft!.kundmarke} onChange={(e) => setCallOffDraftField("kundmarke", e.target.value)} className={styles.freightFormInput} /></div>
                            </div>
                          </div>

                          <div className={styles.callOffFormViewActions}>
                            <Button size="small" className={styles.freightSaveButton} onClick={saveCallOffForm}>
                              {isCreateCallOffView ? "Lägg till" : "Spara"}
                            </Button>
                            <Button size="small" className={styles.freightCancelButton} onClick={closeCallOffForm}>
                              Avbryt
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className={styles.freightSection}>
                          <div className={styles.freightSectionHeader}>
                            <Button
                              className={styles.freightNewButton}
                              onClick={() => openPaketbokning("Reservationsorder", "callOffForm")}
                            >
                              Gå till paketbokning
                            </Button>
                          </div>
                          <div className={styles.paketbokningListTitle}>
                            <Typography variant="body2" fontWeight={600}>Bokade paket på avropsrad</Typography>
                          </div>
                          <div className={styles.lineItemsTableFrame}>
                            <div className={styles.freightTableWrap}>
                              <div className={styles.freightTable}>
                                <DataTable
                                  variant="line"
                                  fillRemainingSpace
                                  columns={BOKADE_PAKET_COLUMNS}
                                  rows={bokadePaketRows}
                                  rowKey={(row, index) => `bp-co-${row.paketnr}-${index}`}
                                  selectedRowIndex={null}
                                  onRowClick={() => { }}
                                  renderCell={(row, column, rowIndex) => {
                                    if (column.key === "_actions") {
                                      return (
                                        <span className={styles.freightActionCell}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); setBokadePaketRows((prev) => prev.filter((_, i) => i !== rowIndex)); }}
                                            title="Ta bort"
                                          >
                                            <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                                          </IconButton>
                                        </span>
                                      );
                                    }
                                    return row[column.key as keyof BokadPaketRow] ?? "-";
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={styles.paketbokningFooter}>
                            <span className={styles.paketbokningFooterItem}>
                              <span className={styles.paketbokningFooterLabel}>Summa lpm:</span>
                              <span className={styles.paketbokningFooterValue}>
                                {bokadePaketRows.reduce((sum, r) => sum + (Number(r.lpm) || 0), 0).toFixed(1)}
                              </span>
                            </span>
                            <span className={styles.paketbokningFooterItem}>
                              <span className={styles.paketbokningFooterLabel}>Summa bitar:</span>
                              <span className={styles.paketbokningFooterValue}>{bokadePaketRows.length}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.freightSection}>
                      <div className={styles.freightSectionHeader}>
                        <Button
                          className={styles.freightNewButton}
                          startIcon={<AddIcon />}
                          onClick={openCallOffAdd}
                        >
                          Ny
                        </Button>
                      </div>

                      <div className={styles.lineItemsTableFrame}>
                        <div className={styles.freightTableWrap}>
                          <div className={styles.freightTable}>
                            <DataTable
                              variant="line"
                              fillRemainingSpace
                              columns={CALLOFF_COLUMNS}
                              rows={callOffRows}
                              rowKey={(row, index) => `${row.id}-${index}`}
                              selectedRowIndex={selectedCallOffRow}
                              onRowClick={(index) =>
                                setSelectedCallOffRow((previous) => (previous === index ? null : index))
                              }
                              renderCell={(row, column, rowIndex) => {
                                if (column.key === "_nr") {
                                  return String(rowIndex + 1);
                                }
                                if (column.key === "_actions") {
                                  return (
                                    <span className={styles.freightActionCell}>
                                      <IconButton
                                        size="small"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openCallOffEdit(rowIndex);
                                        }}
                                        title="Redigera rad"
                                      >
                                        <EditOutlinedIcon className={styles.freightActionIcon} />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openCallOffClone(rowIndex);
                                        }}
                                        title="Kopiera rad"
                                      >
                                        <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          deleteCallOffRow(rowIndex);
                                        }}
                                        title="Ta bort rad"
                                      >
                                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                                      </IconButton>
                                    </span>
                                  );
                                }

                                const value = row[column.key as keyof Omit<CallOffRow, "id">];
                                return value?.trim() ? value : "-";
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === "Periodisering" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    {hasContractVolume && contractVolume !== null ? (
                      <div className={styles.periodiseringStatsRow}>
                        <div className={`${styles.periodiseringStatCardCombined}${periodiseringArIbalans ? ` ${styles.periodiseringStatCardCombinedDone}` : ""}`}>
                          <div className={styles.periodiseringStatCardSide}>
                            <div className={styles.periodiseringStatCardHeader}>
                              {/* <Inventory2OutlinedIcon className={styles.periodiseringStatCardIcon} /> */}
                              <span>Återstår</span>
                            </div>
                            <div className={styles.periodiseringStatCardValue}>
                              {formatSvVolume(aterstarAttPeriodisera ?? 0)}
                              <span className={styles.periodiseringStatCardUnit}>{volumeUnit}</span>
                            </div>
                          </div>
                          <div className={styles.periodiseringStatCardDivider} />
                          <div className={styles.periodiseringStatCardSide}>
                            <div className={styles.periodiseringStatCardHeader}>
                              {/* <EventOutlinedIcon className={styles.periodiseringStatCardIcon} /> */}
                              <span>Periodiserat</span>
                              {periodiseringArIbalans ? (
                                <CheckCircleIcon className={styles.periodiseringStatDoneIcon} />
                              ) : null}
                            </div>
                            <div className={styles.periodiseringStatCardValue}>
                              {formatSvVolume(periodiseradVolym)}
                              <span className={styles.periodiseringStatCardFraction}>/ {formatSvVolume(contractVolume)} {volumeUnit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className={styles.periodiseringToolbar}>
                      <div className={styles.periodiseringToolbarLeft}>
                        <Button
                          className={styles.freightNewButton}
                          startIcon={<AddIcon />}
                          onClick={openPeriodiseringAdd}
                          disabled={periodiseringArIbalans}
                        >
                          Ny rad
                        </Button>
                        <Button
                          className={styles.periodiseringAutoButton}
                          onClick={openAutoPeriodisering}
                          disabled={periodiseringArIbalans}
                        >
                          Automatisk periodisering (implementera inte denna)
                        </Button>
                      </div>
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
                              placeholder="202550"
                              value={periodiseringDraft.leveransvecka}
                              onChange={(e) => setPeriodiseringDraftField("leveransvecka", e.target.value)}
                              className={styles.freightFormInput}
                            />
                          </div>
                          <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Mängd</Typography>
                            <TextField
                              size="small"
                              placeholder="0"
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
                              placeholder="Referens"
                              value={periodiseringDraft.kundensMarke}
                              onChange={(e) => setPeriodiseringDraftField("kundensMarke", e.target.value)}
                              className={styles.freightFormInput}
                            />
                          </div>
                          <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Godsmottagarens märke</Typography>
                            <TextField
                              size="small"
                              placeholder="Referens"
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
                                  {newLineItemDraft.deliveryWindowMin || "—"}
                                </span>
                                <ArrowForwardIcon style={{ fontSize: 14, color: "#748195" }} />
                                <span className={styles.freightFormLabel}>Lev. fönster max</span>
                                <span className={styles.autoPeriodiseringSpreadValue}>
                                  {newLineItemDraft.deliveryWindowMax || "—"}
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
                </div>
              ) : activeTab === "Produktionsplanering" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    <div className={styles.freightSectionHeader}>
                      <Button
                        className={styles.freightNewButton}
                        startIcon={<AddIcon />}
                        onClick={openProductionPlanningAdd}
                      >
                        Ny
                      </Button>
                    </div>

                    <div className={styles.lineItemsTableFrame}>
                      <div className={styles.freightTableWrap}>
                        <div className={`${styles.freightTable} ${styles.productionPlanningTable}`}>
                          <DataTable
                            variant="line"
                            fillRemainingSpace
                            columns={PRODUCTION_PLANNING_COLUMNS}
                            rows={productionPlanningRows}
                            rowKey={(row, index) => `${row.id}-${index}`}
                            selectedRowIndex={selectedProductionPlanningRow}
                            onRowClick={(index) =>
                              setSelectedProductionPlanningRow((previous) => (previous === index ? null : index))
                            }
                            renderCell={(row, column, rowIndex) => {
                              if (column.key === "_actions") {
                                return (
                                  <span className={`${styles.freightActionCell} ${styles.productionPlanningActionCell}`}>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openProductionPlanningEdit(rowIndex);
                                      }}
                                      title="Redigera rad"
                                    >
                                      <EditOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openProductionPlanningClone(rowIndex);
                                      }}
                                      title="Duplicera rad"
                                    >
                                      <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        deleteProductionPlanningRow(rowIndex);
                                      }}
                                      title="Ta bort rad"
                                    >
                                      <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                  </span>
                                );
                              }

                              const value = row[column.key as keyof Omit<ProductionPlanningRow, "id">];
                              return value?.trim() ? value : "-";
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Dialog
                      open={isProductionPlanningDialogOpen}
                      onClose={closeProductionPlanningForm}
                      fullWidth
                      maxWidth="md"
                      classes={{ paper: styles.freightDialogPaper }}
                    >
                      <DialogTitle className={styles.freightDialogTitle}>
                        <div className={styles.freightDialogTitleRow}>
                          <span>{productionPlanningForm.mode === "add" ? "Ny produktionsplanering" : "Redigera produktionsplanering"}</span>
                          {productionPlanningForm.mode === "add" ? (
                            <div className={styles.freightDialogToggles}>
                              <label className={styles.freightDialogKeepOpen}>
                                <Checkbox
                                  size="small"
                                  checked={keepProductionPlanningDialogOpen}
                                  onChange={(event) => setKeepProductionPlanningDialogOpen(event.target.checked)}
                                />
                                <span>Behåll öppen</span>
                              </label>
                              <label className={styles.freightDialogKeepOpen}>
                                <Checkbox
                                  size="small"
                                  checked={keepProductionPlanningValues}
                                  onChange={(event) => {
                                    setKeepProductionPlanningValues(event.target.checked);
                                    if (event.target.checked) setKeepProductionPlanningDialogOpen(true);
                                  }}
                                />
                                <span>Behåll värden</span>
                              </label>
                            </div>
                          ) : null}
                        </div>
                      </DialogTitle>
                      <DialogContent className={styles.freightDialogContent}>
                        {productionPlanningDraft !== null ? (
                          <div className={styles.avropFormGrid}>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Producerande bolag</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.producerandeBolag}
                                onChange={(e) => setProductionPlanningDraftField("producerandeBolag", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Produktionsställe</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.produktionsstalle}
                                onChange={(e) => setProductionPlanningDraftField("produktionsstalle", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Produktionslinje</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.produktionslinje}
                                onChange={(e) => setProductionPlanningDraftField("produktionslinje", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Kommentar produktion</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.kommentarProduktion}
                                onChange={(e) => setProductionPlanningDraftField("kommentarProduktion", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Färg</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.farg}
                                onChange={(e) => setProductionPlanningDraftField("farg", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                            <div className={styles.freightFormField}>
                              <Typography className={styles.freightFormLabel}>Pigmentering</Typography>
                              <TextField
                                size="small"
                                value={productionPlanningDraft.pigmentering}
                                onChange={(e) => setProductionPlanningDraftField("pigmentering", e.target.value)}
                                className={styles.freightFormInput}
                              />
                            </div>
                          </div>
                        ) : null}
                      </DialogContent>
                      <DialogActions className={styles.freightDialogActions}>
                        <Button size="small" className={styles.freightSaveButton} onClick={saveProductionPlanningForm}>
                          {productionPlanningForm.mode === "add" ? "Lägg till" : "Spara"}
                        </Button>
                        <Button size="small" className={styles.freightCancelButton} onClick={closeProductionPlanningForm}>
                          Avbryt
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Snackbar
                      key={`production-planning-${productionPlanningCreateFeedback.key}`}
                      open={productionPlanningCreateFeedback.open}
                      autoHideDuration={2200}
                      onClose={() => setProductionPlanningCreateFeedback((previous) => ({ ...previous, open: false }))}
                      anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                      <Alert
                        onClose={() => setProductionPlanningCreateFeedback((previous) => ({ ...previous, open: false }))}
                        severity="success"
                        variant="filled"
                      >
                        Post skapad
                      </Alert>
                    </Snackbar>
                  </div>
                </div>
              ) : activeTab === "Leveransbokade paket" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    <div className={styles.freightSectionHeader}>
                      <div className={styles.bokadePaketToolbar}>
                        {/* <Typography className={styles.bokadePaketTitle}>Bokade paket</Typography> */}
                        <button type="button" className={styles.bokadePaketAddBtn} onClick={() => openPaketbokning("Kontraktrad", "leveransbokadePaket")}>
                          <AddIcon fontSize="inherit" />
                          Hantera paket
                        </button>
                      </div>
                      {/* <Button
                        className={styles.freightNewButton}
                        onClick={() => openPaketbokning("Kontraktrad", "leveransbokadePaket")}
                      >
                        Gå till paketbokning
                      </Button> */}
                    </div>
                    <div className={styles.paketbokningListTitle}>
                      <Typography variant="body2" fontWeight={600}>Bokade paket på kontraktsrad</Typography>
                    </div>
                    <div className={styles.lineItemsTableFrame}>
                      <div className={styles.freightTableWrap}>
                        <div className={styles.freightTable}>
                          <DataTable
                            variant="line"
                            fillRemainingSpace
                            columns={BOKADE_PAKET_COLUMNS}
                            rows={bokadePaketRows}
                            rowKey={(row, index) => `bp-${row.paketnr}-${index}`}
                            selectedRowIndex={null}
                            onRowClick={() => { }}
                            renderCell={(row, column, rowIndex) => {
                              if (column.key === "_actions") {
                                return (
                                  <span className={styles.freightActionCell}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => { e.stopPropagation(); setBokadePaketRows((prev) => prev.filter((_, i) => i !== rowIndex)); }}
                                      title="Ta bort"
                                    >
                                      <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                                    </IconButton>
                                  </span>
                                );
                              }
                              return row[column.key as keyof BokadPaketRow] ?? "-";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.paketbokningFooter}>
                      <span className={styles.paketbokningFooterItem}>
                        <span className={styles.paketbokningFooterLabel}>Summa lpm:</span>
                        <span className={styles.paketbokningFooterValue}>
                          {bokadePaketRows.reduce((sum, r) => sum + (Number(r.lpm) || 0), 0).toFixed(1)}
                        </span>
                      </span>
                      <span className={styles.paketbokningFooterItem}>
                        <span className={styles.paketbokningFooterLabel}>Summa nom.vol:</span>
                        <span className={styles.paketbokningFooterValue}>0,000</span>
                      </span>
                      <span className={styles.paketbokningFooterItem}>
                        <span className={styles.paketbokningFooterLabel}>Summa bitar:</span>
                        <span className={styles.paketbokningFooterValue}>{bokadePaketRows.length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : activeTab === "Nettolager" ? (<div className={styles.freightTabContent}>
                <div className={styles.freightSection}>
                  <Tooltip title="Uppdatera" placement="top">
                    <IconButton size="small" className={styles.contractHeaderDotsButton} style={{ display: "flex", alignSelf: "flex-end" }} onClick={() => { }}>
                      <RefreshOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <div className={styles.lineItemsTableFrame}>
                    <div className={styles.freightTableWrap}>
                      <div className={styles.freightTable}>
                        <DataTable
                          variant="line"
                          fillRemainingSpace
                          columns={NETTOLAGER_COLUMNS}
                          rows={nettolagerRows}
                          rowKey={(row, index) => `${row.bolag}-${row.fakturatext}-${index}`}
                          selectedRowIndex={selectedNettolagerRow}
                          onRowClick={(index) => setSelectedNettolagerRow((previous) => (previous === index ? null : index))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className={styles.contractTabPlaceholder}>
                  <Typography className={styles.contractInfoValue}>{activeTab} - tabell-/detaljvy för kontraktsrad.</Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={isNewLineItem && showStepErrors}
        autoHideDuration={2600}
        onClose={() => setShowStepErrors(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowStepErrors(false)}
          severity="error"
          variant="filled"
        >
          Fyll i alla obligatoriska fält innan du går vidare
        </Alert>
      </Snackbar>

      <Dialog
        open={isBytBolagDialogOpen}
        onClose={() => setIsBytBolagDialogOpen(false)}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Byt enhet</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <div className={styles.avropFormGrid}>
            <div className={styles.freightFormField}>
              <Typography className={styles.freightFormLabel}>Utlastande enhet</Typography>
              <FormControl size="small" className={styles.freightFormInput}>
                <Select
                  value={bytBolagDraft.senderCompany}
                  onChange={(e) => setBytBolagDraft((prev) => ({ ...prev, senderCompany: e.target.value }))}
                >
                  <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                  <MenuItem value="Moelven">Moelven</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={styles.freightFormField}>
              <Typography className={styles.freightFormLabel}>Ansvarig enhet</Typography>
              <FormControl size="small" className={styles.freightFormInput}>
                <Select
                  value={bytBolagDraft.responsibleCompany}
                  onChange={(e) => setBytBolagDraft((prev) => ({ ...prev, responsibleCompany: e.target.value }))}
                >
                  <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                  <MenuItem value="Moelven">Moelven</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={styles.freightFormField}>
              <Typography className={styles.freightFormLabel}>Utlastande lagerställe</Typography>
              <FormControl size="small" className={styles.freightFormInput}>
                <Select
                  value={bytBolagDraft.senderWarehouse}
                  onChange={(e) => setBytBolagDraft((prev) => ({ ...prev, senderWarehouse: e.target.value }))}
                >
                  <MenuItem value="Krokom">Krokom</MenuItem>
                  <MenuItem value="Hissmofors">Hissmofors</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            size="small"
            className={styles.freightSaveButton}
            onClick={() => {
              updateDraftField("senderCompany", bytBolagDraft.senderCompany);
              updateDraftField("senderWarehouse", bytBolagDraft.senderWarehouse);
              updateDraftField("responsibleCompany", bytBolagDraft.responsibleCompany);
              setIsBytBolagDialogOpen(false);
            }}
          >
            Spara
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setIsBytBolagDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
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
type PeriodiseringRow = {
  id: string;
  leveransvecka: string;
  mangd: string;
  enhet: string;
  avropsradsstatus: string;
  kundensMarke: string;
  godsmottagarensMarke: string;
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
  kombipaketNr: string;
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
};

type CallOffColumnKey = keyof Omit<CallOffRow, "id"> | "_actions";
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
  { key: "enhet", label: "Enhet" },
  { key: "_actions", label: "", pinnedRight: true },
];

const CALLOFF_COLUMNS: Array<{ key: CallOffColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "status", label: "Status" },
  { key: "artNr", label: "ArtNr" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Enhet" },
  { key: "volym", label: "Volym" },
  { key: "leveransvecka", label: "Leveransvecka" },
  { key: "avropaddatum", label: "Avropaddatum" },
  { key: "fakturatext", label: "Fakturatext" },
  { key: "kundensReferens", label: "Kundens referens" },
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
  kombipaketNr: "",
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
    kombipaketNr: "",
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

const emptyPeriodiseringRow = (): Omit<PeriodiseringRow, "id"> => ({
  leveransvecka: "",
  mangd: "",
  enhet: "m3 nominell",
  avropsradsstatus: "Planerad",
  kundensMarke: "",
  godsmottagarensMarke: ""
});

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
      <button
        type="button"
        className={`${styles.fieldPinButton} ${isPinned ? styles.fieldPinButtonActive : ""}`}
        tabIndex={-1}
        aria-pressed={isPinned}
        aria-label={isPinned ? `Frånkoppla: ${label}` : `Fäst: ${label}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onTogglePinnedField(fieldKey)}
        title={isPinned ? `Frånkoppla: ${label}` : `Fäst: ${label}`}
      >
        {isPinned ? <LockIcon style={{ fontSize: 14 }} /> : <LockOpenIcon style={{ fontSize: 14 }} />}
      </button>
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
  { key: "senderCompany", label: "Utlastande bolag" },
  { key: "senderWarehouse", label: "Utlastande lagerställe" },
  { key: "status", label: "Status" },
  { key: "responsibleCompany", label: "Ansvarigt bolag" },
  { key: "artNr", label: "ArtNr" },
  { key: "packageType", label: "Pakettyp" },
  { key: "quantity", label: "Mängd" },
  { key: "volume", label: "Volym" },
  { key: "price", label: "Pris" },
  { key: "orderedUnit", label: "Beställd enhet" },
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
        { key: "contractNumber", label: "KontraktsNr" },
        { key: "comboPackageNumber", label: "KombipaketNr" },
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
        { key: "customerComment", label: "Kundkommentar" },
        { key: "showOnInvoice", label: "Visa på följesedel och faktura" },
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
  onSaveAndClose
}: LineItemDetailViewProps) {
  const isNewLineItem = lineItemId === "new";
  const accordionWrapRef = useRef<HTMLDivElement | null>(null);
  const [lengthDistributionRows, setLengthDistributionRows] = useState<LengthDistributionRow[]>(initialLengthDistributionRows);
  const [selectedLengthDistributionRow, setSelectedLengthDistributionRow] = useState<number | null>(null);
  const [lengthDistributionForm, setLengthDistributionForm] = useState<LengthDistributionFormState>({ mode: "closed" });
  const [showLengthOnPrint, setShowLengthOnPrint] = useState(false);
  const [keepLengthDistributionDialogOpen, setKeepLengthDistributionDialogOpen] = useState(false);
  const [keepLengthDistributionValues, setKeepLengthDistributionValues] = useState(false);
  const [lastLengthDistributionDraft, setLastLengthDistributionDraft] = useState<Omit<LengthDistributionRow, "id"> | null>(null);
  const [lengthDistributionCreateFeedback, setLengthDistributionCreateFeedback] = useState({ open: false, key: 0 });
  const [periodiseringRows, setPeriodiseringRows] = useState<PeriodiseringRow[]>([]);
  const [selectedPeriodiseringRow, setSelectedPeriodiseringRow] = useState<number | null>(null);
  const [periodiseringForm, setPeriodiseringForm] = useState<PeriodiseringFormState>({ mode: "closed" });
  const [keepPeriodiseringDialogOpen, setKeepPeriodiseringDialogOpen] = useState(false);
  const [keepPeriodiseringValues, setKeepPeriodiseringValues] = useState(false);
  const [lastPeriodiseringDraft, setLastPeriodiseringDraft] = useState<Omit<PeriodiseringRow, "id"> | null>(null);
  const [periodiseringCreateFeedback, setPeriodiseringCreateFeedback] = useState({ open: false, key: 0 });
  const [callOffRows, setCallOffRows] = useState<CallOffRow[]>(initialCallOffRows);
  const [selectedCallOffRow, setSelectedCallOffRow] = useState<number | null>(null);
  const [callOffForm, setCallOffForm] = useState<CallOffFormState>({ mode: "closed" });
  const [keepCallOffDialogOpen, setKeepCallOffDialogOpen] = useState(false);
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
  const [newLineItemDraft, setNewLineItemDraft] = useState<NewLineItemDraft>({
    ...(isNewLineItem ? emptyNewLineItemDraft : existingLineItemDraft),
    ...newDraftSeed
  });
  const [expandedPanels, setExpandedPanels] = useState<string[]>(isNewLineItem ? [...REQUIRED_STEP_PANEL_IDS] : ["allmant"]);
  const [createStep, setCreateStep] = useState<0 | 1>(0);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [showAllReviewFields, setShowAllReviewFields] = useState(false);
  const [fastTrackEnabled, setFastTrackEnabled] = useState(false);
  const [optionalFastTrackKeys, setOptionalFastTrackKeys] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [showAllOptionalFields, setShowAllOptionalFields] = useState(false);
  const [uploadedLineItemDocuments, setUploadedLineItemDocuments] = useState<ContractDocument[]>([]);
  const contractDetails = getContractDetails(newLineItemDraft.contractNumber.trim() || null);
  const lineItemDocuments = isNewLineItem ? uploadedLineItemDocuments : contractDetails.dokument;

  const updateDraftField = (key: keyof NewLineItemDraft, value: string | boolean) => {
    setNewLineItemDraft((previous) => ({
      ...previous,
      [key]: value
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
      ...Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemFastTrackTerminalAction}`)),
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

  const toggleOptionalFastTrackField = (key: keyof NewLineItemDraft) => {
    setOptionalFastTrackKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderReviewField = ({ key, label }: { key: keyof NewLineItemDraft; label: string }) => {
    const val = newLineItemDraft[key];
    const displayVal = typeof val === "boolean" ? (val ? "Ja" : "Nej") : (String(val || "") || "—");

    return (
      <TextField
        key={key}
        size="small"
        label={getFieldLabel(key, label)}
        value={displayVal}
        InputProps={{ readOnly: true }}
        className={styles.lineItemWizardReviewField}
      />
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
      setPeriodiseringRows((previous) => [
        ...previous,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft }
      ]);
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
      setPeriodiseringRows((previous) =>
        previous.map((row) => (row.id === periodiseringForm.id ? { ...row, ...nextDraft } : row))
      );

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

  const openCallOffAdd = () => {
    setKeepCallOffValues(false);
    const initialDraft = keepCallOffValues && lastCallOffDraft
      ? lastCallOffDraft
      : emptyCallOffRow();
    setCallOffForm({ mode: "add", draft: initialDraft });
    setSelectedCallOffRow(null);
  };

  const openCallOffEdit = (index: number) => {
    setKeepCallOffValues(false);
    const row = callOffRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setCallOffForm({ mode: "edit", id, draft });
    setSelectedCallOffRow(index);
  };

  const openCallOffClone = (index: number) => {
    setKeepCallOffValues(false);
    const row = callOffRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    void id;
    setCallOffForm({ mode: "add", draft });
    setSelectedCallOffRow(null);
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
      if (keepCallOffDialogOpen) {
        setCallOffForm({
          mode: "add",
          draft: keepCallOffValues ? nextDraft : emptyCallOffRow()
        });
        setSelectedCallOffRow(null);
        return;
      }

      closeCallOffForm();
      return;
    }

    setCallOffRows((previous) =>
      previous.map((row) => (row.id === callOffForm.id ? { ...row, ...nextDraft } : row))
    );

    if (keepCallOffDialogOpen) {
      setCallOffForm({ mode: "edit", id: callOffForm.id, draft: nextDraft });
      return;
    }

    closeCallOffForm();
  };

  const callOffDraft = callOffForm.mode !== "closed" ? callOffForm.draft : null;
  const isCallOffDialogOpen = callOffDraft !== null;
  const isCreateCallOffView = callOffForm.mode === "add";

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
              <Button className={styles.contractQuickActionButton} size="small">
                Visa träd
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
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={onSaveAndClose}
                >
                  Avbryt
                </Button>
                <Button
                  className={styles.lineItemSaveButton}
                  size="small"
                  variant="contained"
                  title="Ctrl+→"
                  onClick={handleNextStep}
                >
                  Spara och gå vidare
                </Button>
              </>
            ) : (
              <>
                <Button
                  className={styles.lineItemBackButton}
                  size="small"
                  title="Ctrl+←"
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
                <Button
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={onSaveAndClose}
                >
                  Avbryt
                </Button>
                <Button className={styles.lineItemSaveButton} size="small" variant="contained" onClick={handleSave}>
                  Skapa kontraktsrad
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
                    Tabba endast mellan obligatoriska fält i kontraktsradshuvudet
                  </span>
                  <button
                    type="button"
                    className={`${styles.lineItemFastTrackMoreButton} ${showAllOptionalFields ? styles.lineItemFastTrackMoreButtonActive : ""}`}
                    onClick={() => setShowAllOptionalFields(!showAllOptionalFields)}
                    aria-expanded={showAllOptionalFields}
                    title={showAllOptionalFields ? "Dölj valfria fält" : "Välj valfria fält att ta med i snabbspåret"}
                  >
                    Välj egna
                    <ExpandMoreIcon style={{ fontSize: 14, transition: "transform 0.2s", transform: showAllOptionalFields ? "rotate(180deg)" : "none", marginLeft: 2 }} />
                  </button>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    className={`${styles.lineItemFastTrackButton} ${fastTrackEnabled ? styles.lineItemFastTrackButtonActive : ""}`}
                    onClick={handleToggleFastTrack}
                    aria-pressed={fastTrackEnabled}
                  >
                    <span className={styles.lineItemFastTrackButtonIndicator} aria-hidden="true" />
                    <span className={styles.lineItemFastTrackButtonLabelWrap}>
                      <span className={styles.lineItemFastTrackButtonLabel}>Snabbspår</span>
                      <span className={styles.lineItemFastTrackButtonState}>{fastTrackEnabled ? "På" : "Av"}</span>
                    </span>
                  </Button>
                </div>
                {showAllOptionalFields ? (
                  <div className={styles.lineItemFastTrackChipsPanel}>
                    {OPTIONAL_FAST_TRACK_GROUPS.map(({ title, fields }) => (
                      <div key={title} className={styles.lineItemFastTrackChipGroup}>
                        <div className={styles.lineItemFastTrackChipGroupTitle}>{title}</div>
                        <div className={styles.lineItemFastTrackChipGroupItems}>
                          {fields.map(({ key, label }) => {
                            const isSelected = optionalFastTrackKeys.has(key);

                            return (
                              <button
                                key={key}
                                type="button"
                                className={`${styles.lineItemFastTrackOptionalChip} ${isSelected ? styles.lineItemFastTrackOptionalChipActive : ""}`}
                                onClick={() => toggleOptionalFastTrackField(key)}
                                aria-pressed={isSelected}
                                title={isSelected ? `${label} ingår i snabbspår` : `Lägg till ${label} i snabbspår`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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
                    <FieldLabel fieldKey="senderCompany" label={getFieldLabel("senderCompany", "Utlastande bolag")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("senderCompany", "Utlastande bolag")} value={newLineItemDraft.senderCompany} onChange={(v) => updateDraftField("senderCompany", v)} className={getFieldControlClassName("senderCompany")}>
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
                    <FieldLabel fieldKey="contractNumber" label="KontraktsNr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="KontraktsNr" value={newLineItemDraft.contractNumber} onChange={(event) => updateDraftField("contractNumber", event.target.value)} size="small" className={getFieldControlClassName("contractNumber")} InputProps={{ readOnly: !isNewLineItem }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="responsibleCompany" label={getFieldLabel("responsibleCompany", "Ansvarigt bolag")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("responsibleCompany", "Ansvarigt bolag")} value={newLineItemDraft.responsibleCompany} onChange={(v) => updateDraftField("responsibleCompany", v)} className={getFieldControlClassName("responsibleCompany")}>
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                      <MenuItem value="Moelven">Moelven</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="comboPackageNumber" label="KombipaketNr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="KombipaketNr" value={newLineItemDraft.comboPackageNumber} onChange={(event) => updateDraftField("comboPackageNumber", event.target.value)} size="small" className={getFieldControlClassName("comboPackageNumber")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="status" label={getFieldLabel("status", "Status")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("status", "Status")} value={newLineItemDraft.status} onChange={(v) => updateDraftField("status", v)} className={getFieldControlClassName("status")}>
                      <MenuItem value="Aktiv">Aktiv</MenuItem>
                      <MenuItem value="Pausad">Pausad</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="priceList" label="Prislista" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Prislista" value={newLineItemDraft.priceList} onChange={(event) => updateDraftField("priceList", event.target.value)} size="small" className={getFieldControlClassName("priceList")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="certification" label="Certifiering" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="Certifiering" value={newLineItemDraft.certification} onChange={(v) => updateDraftField("certification", v)} className={getFieldControlClassName("certification")}>
                      <MenuItem value="Ocertifierat">Ocertifierat</MenuItem>
                      <MenuItem value="FSC">FSC</MenuItem>
                      <MenuItem value="PEFC">PEFC</MenuItem>
                    </LabeledSelect>
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
                    <FieldLabel fieldKey="nobbNumber" label="NOBBnr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="NOBBnr" value={newLineItemDraft.nobbNumber} onChange={(event) => updateDraftField("nobbNumber", event.target.value)} size="small" className={getFieldControlClassName("nobbNumber")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="artNr" label={getFieldLabel("artNr", "ArtNr")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <div className={styles.lineItemFieldWithAction}>
                      <TextField label={getFieldLabel("artNr", "ArtNr")} value={newLineItemDraft.artNr} onChange={(event) => updateDraftField("artNr", event.target.value)} size="small" className={`${getFieldControlClassName("artNr")} ${styles.lineItemFieldActionInput}`} />
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
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliverArtNr" label="Leverera ArtNr" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leverera ArtNr" value={newLineItemDraft.deliverArtNr} onChange={(event) => updateDraftField("deliverArtNr", event.target.value)} size="small" className={getFieldControlClassName("deliverArtNr")} />
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="product" label="Produkt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Produkt" value={newLineItemDraft.product} onChange={(event) => updateDraftField("product", event.target.value)} size="small" className={getFieldControlClassName("product")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliverProduct" label="Leverera produkt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leverera produkt" value={newLineItemDraft.deliverProduct} onChange={(event) => updateDraftField("deliverProduct", event.target.value)} size="small" className={getFieldControlClassName("deliverProduct")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="invoiceText" label="Fakturatext" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Fakturatext" value={newLineItemDraft.invoiceText} onChange={(event) => updateDraftField("invoiceText", event.target.value)} size="small" className={getFieldControlClassName("invoiceText")} />
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid2}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="packageType" label={getFieldLabel("packageType", "Pakettyp")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("packageType", "Pakettyp")} value={newLineItemDraft.packageType} onChange={(v) => updateDraftField("packageType", v)} className={getFieldControlClassName("packageType")}>
                      <MenuItem value="Lp">Lp</MenuItem>
                      <MenuItem value="Paket">Paket</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliverPackageType" label="Leverera pakettyp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label="Leverera pakettyp" value={newLineItemDraft.deliverPackageType} onChange={(v) => updateDraftField("deliverPackageType", v)} className={getFieldControlClassName("deliverPackageType")}>
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Lp">Lp</MenuItem>
                      <MenuItem value="Paket">Paket</MenuItem>
                    </LabeledSelect>
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid4}>
                  <div className={styles.lineItemField}>
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
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="bundle" label="Bunt" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Bunt" value={newLineItemDraft.bundle} onChange={(event) => updateDraftField("bundle", event.target.value)} size="small" className={getFieldControlClassName("bundle")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="vflGroup" label="VFL grupp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="VFL grupp" value={newLineItemDraft.vflGroup} onChange={(event) => updateDraftField("vflGroup", event.target.value)} size="small" className={getFieldControlClassName("vflGroup")} />
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
                <div className={styles.lineItemSectionGrid4}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="quantity" label={getFieldLabel("quantity", "Mängd")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("quantity", "Mängd")} value={newLineItemDraft.quantity} onChange={(event) => updateDraftField("quantity", event.target.value)} size="small" className={getFieldControlClassName("quantity")} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="volume" label={getFieldLabel("volume", "Volym")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("volume", "Volym")} value={newLineItemDraft.volume} onChange={(event) => updateDraftField("volume", event.target.value)} size="small" className={getFieldControlClassName("volume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
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
                    <FieldLabel fieldKey="finalVolume" label="Slutvolym" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Slutvolym" value={newLineItemDraft.finalVolume} onChange={(event) => updateDraftField("finalVolume", event.target.value)} size="small" className={getFieldControlClassName("finalVolume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid4}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="invoiceUnit" label={getFieldLabel("invoiceUnit", "Faktura enhet")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <LabeledSelect label={getFieldLabel("invoiceUnit", "Faktura enhet")} value={newLineItemDraft.invoiceUnit} onChange={(v) => updateDraftField("invoiceUnit", v)} className={getFieldControlClassName("invoiceUnit")}>
                      <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                      <MenuItem value="m3 fast">m3 fast</MenuItem>
                      <MenuItem value="lpm">lpm</MenuItem>
                    </LabeledSelect>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="adjustedPrice" label="Prisjusterad" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Prisjusterad" value={newLineItemDraft.adjustedPrice} onChange={(event) => updateDraftField("adjustedPrice", event.target.value)} size="small" className={getFieldControlClassName("adjustedPrice")} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="price" label={getFieldLabel("price", "Pris")} isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label={getFieldLabel("price", "Pris")} value={newLineItemDraft.price} onChange={(event) => updateDraftField("price", event.target.value)} size="small" className={getFieldControlClassName("price")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="amount" label="Belopp" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Belopp" value={newLineItemDraft.amount} onChange={(event) => updateDraftField("amount", event.target.value)} size="small" className={getFieldControlClassName("amount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
                  </div>
                </div>
                <div className={styles.lineItemSectionGrid4}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="sponsorship" label="Sponsring" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Sponsring" value={newLineItemDraft.sponsorship} onChange={(event) => updateDraftField("sponsorship", event.target.value)} size="small" className={getFieldControlClassName("sponsorship")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="sponsoredAmount" label="Belopp spons" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Belopp spons" value={newLineItemDraft.sponsoredAmount} onChange={(event) => updateDraftField("sponsoredAmount", event.target.value)} size="small" className={getFieldControlClassName("sponsoredAmount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
                  </div>
                  <div className={styles.lineItemField}>
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
                </div>
                <label className={getFieldControlClassName("pickingSurchargeEnabled", styles.lineItemCheckboxRow)}>
                  <Checkbox size="small" checked={Boolean(newLineItemDraft.pickingSurchargeEnabled)} onChange={(event) => updateDraftField("pickingSurchargeEnabled", event.target.checked)} />
                  <Typography className={styles.searchFieldLabel}>Plocktillägg</Typography>
                  <TextField value={newLineItemDraft.pickingSurchargeQuantity} onChange={(event) => updateDraftField("pickingSurchargeQuantity", event.target.value)} size="small" className={getFieldControlClassName("pickingSurchargeQuantity", styles.lineItemSmallInlineInput)} />
                  <Typography className={styles.lineItemInlineHint}>st vilket ger 15 % minst 300 SEK</Typography>
                </label>
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
                <div className={styles.lineItemSectionGrid4}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="deliveryWeek" label="Leveransvecka" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Leveransvecka" value={newLineItemDraft.deliveryWeek} onChange={(event) => updateDraftField("deliveryWeek", event.target.value)} size="small" className={getFieldControlClassName("deliveryWeek")} />
                  </div>
                  <div className={styles.lineItemField}>
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
                </div>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
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
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="internalComment" label="Intern kommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Intern kommentar" value={newLineItemDraft.internalComment} onChange={(event) => updateDraftField("internalComment", event.target.value)} size="small" className={getFieldControlClassName("internalComment")} multiline rows={3} />
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="externalComment" label="Extern kommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Extern kommentar" value={newLineItemDraft.externalComment} onChange={(event) => updateDraftField("externalComment", event.target.value)} size="small" className={getFieldControlClassName("externalComment")} multiline rows={3} />
                    <Typography className={styles.lineItemFieldHelperText}>Visas på orderbekräftelse och kontrakt. Följer med till lastorder.</Typography>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="customerComment" label="Kundkommentar" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Kundkommentar" value={newLineItemDraft.customerComment} onChange={(event) => updateDraftField("customerComment", event.target.value)} size="small" className={getFieldControlClassName("customerComment")} multiline rows={3} />
                  </div>
                </div>
                <label className={getFieldControlClassName("showOnInvoice", styles.lineItemCheckboxRow)}>
                  <Checkbox size="small" checked={Boolean(newLineItemDraft.showOnInvoice)} onChange={(event) => updateDraftField("showOnInvoice", event.target.checked)} />
                  <Typography className={styles.searchFieldLabel}>Visa på följesedel och faktura</Typography>
                </label>
                <div className={styles.lineItemSectionGrid3}>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="customerBrand" label="Kundens märke" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Kundens märke" value={newLineItemDraft.customerBrand} onChange={(event) => updateDraftField("customerBrand", event.target.value)} size="small" className={getFieldControlClassName("customerBrand")} />
                    <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på följesedel och faktura.</Typography>
                  </div>
                  <div className={styles.lineItemField}>
                    <FieldLabel fieldKey="recipientBrand" label="Godsmottagarens märke" isNewLineItem={isNewLineItem} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
                    <TextField label="Godsmottagarens märke" value={newLineItemDraft.recipientBrand} onChange={(event) => updateDraftField("recipientBrand", event.target.value)} size="small" className={getFieldControlClassName("recipientBrand")} />
                    <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på fraktsedel och i C-Load.</Typography>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("dokument")}
              onChange={() => togglePanel("dokument")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <FolderOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Dokument</Typography>
                  {lineItemDocuments.length > 0 ? (
                    <Chip
                      label={lineItemDocuments.length}
                      size="small"
                      className={styles.contractSectionCountChip}
                    />
                  ) : null}
                </div>
              </AccordionSummary>
              <AccordionDetails>
                {isNewLineItem ? (
                  <div className={styles.contractDropZone}>
                    <p className={styles.contractDropZoneTitle}>Uppladdning av dokument</p>
                    <p className={styles.contractDropZoneOrText}>Klicka nedan för att simulera uppladdning</p>
                    <button type="button" className={styles.contractDropZoneButton} onClick={handleMockDocumentUpload}>
                      Välj filer
                    </button>
                  </div>
                ) : null}
                {isNewLineItem && lineItemDocuments.length > 0 ? <hr className={styles.contractFlatDivider} /> : null}
                {lineItemDocuments.length === 0 ? (
                  <Typography className={styles.contractDataLabel} style={{ padding: "4px 0", fontStyle: "italic" }}>
                    Inga dokument uppladdade.
                  </Typography>
                ) : (
                  <div className={styles.contractDocumentList}>
                    {lineItemDocuments.map((doc) => (
                      <div key={`${doc.name}-${doc.addedAt}`} className={styles.contractFileRow}>
                        <span className={styles.contractFileRowIcon}>
                          {doc.name.endsWith(".pdf") ? "📄" : doc.name.endsWith(".doc") || doc.name.endsWith(".docx") ? "📝" : doc.name.endsWith(".xls") || doc.name.endsWith(".xlsx") ? "📊" : "📁"}
                        </span>
                        <div className={styles.contractFileRowInfo}>
                          <p className={styles.contractFileName}>{doc.name}</p>
                          <p className={styles.contractFileSize}>{doc.size} — {doc.addedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionDetails>
            </Accordion>

            {isNewLineItem && createStep === 0 ? (
              <div className={styles.lineItemAccordionFooterAction}>
                <Button
                  type="button"
                  size="small"
                  variant="contained"
                  className={`${styles.lineItemSaveButton} ${styles.lineItemFastTrackTerminalAction}`}
                  onClick={handleNextStep}
                >
                  Spara och gå vidare
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.detailTabsColumn}>
          <div className={styles.contractModernAdditionsWrap}>
            {createStep === 1 ? (
              <div className={styles.lineItemWizardReviewCard}>
                <div className={styles.lineItemWizardReviewHeader}>
                  <span className={styles.lineItemWizardReviewTitle}>{isNewLineItem ? "Obligatoriska uppgifter från kontraktsradshuvud" : "Kontraktsradshuvud"}</span>
                  {remainingReviewFields.length > 0 ? (
                    <>
                      <span className={styles.lineItemWizardReviewHeaderDivider} aria-hidden="true" />
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
              {activeTab === "Längdfördelning" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    <div className={styles.freightSectionHeader}>
                      <div className={styles.lengthDistributionControls}>
                        <label className={styles.freightDialogKeepOpen}>
                          <Checkbox
                            size="small"
                            checked={showLengthOnPrint}
                            onChange={(event) => setShowLengthOnPrint(event.target.checked)}
                          />
                          <span>Visa längd vid utskrift</span>
                        </label>
                        <span className={styles.lengthDistributionControlsDivider} aria-hidden="true" />
                        <Button
                          className={styles.freightNewButton}
                          startIcon={<AddIcon />}
                          onClick={openLengthDistributionAdd}
                        >
                          Ny
                        </Button>
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
                        <div className={styles.freightFormGrid}>
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
                      <Button size="small" className={styles.freightCancelButton} onClick={closeLengthDistributionForm}>
                        Avbryt
                      </Button>
                      <Button size="small" className={styles.freightSaveButton} onClick={saveLengthDistributionForm}>
                        {lengthDistributionForm.mode === "add" ? "Lägg till" : "Spara"}
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Snackbar
                    key={lengthDistributionCreateFeedback.key}
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

                  <Dialog
                    open={isCallOffDialogOpen}
                    onClose={closeCallOffForm}
                    fullWidth
                    maxWidth="md"
                    classes={{ paper: styles.freightDialogPaper }}
                  >
                    <DialogTitle className={styles.freightDialogTitle}>
                      <div className={styles.freightDialogTitleRow}>
                        <span>{isCreateCallOffView ? "Ny avropsrad" : "Redigera avropsrad"}</span>
                        {isCreateCallOffView ? (
                          <div className={styles.freightDialogToggles}>
                            <label className={styles.freightDialogKeepOpen}>
                              <Checkbox
                                size="small"
                                checked={keepCallOffDialogOpen}
                                onChange={(event) => setKeepCallOffDialogOpen(event.target.checked)}
                              />
                              <span>Behåll öppen</span>
                            </label>
                            <label className={styles.freightDialogKeepOpen}>
                              <Checkbox
                                size="small"
                                checked={keepCallOffValues}
                                onChange={(event) => {
                                  setKeepCallOffValues(event.target.checked);
                                  if (event.target.checked) setKeepCallOffDialogOpen(true);
                                }}
                              />
                              <span>Behåll värden</span>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    </DialogTitle>
                    <DialogContent className={styles.freightDialogContent}>
                      {callOffDraft !== null ? (
                        <>
                          <div className={styles.freightFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Obligatoriska fält</Typography>
                            <div className={styles.freightFormGrid}>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Status *</Typography>
                                <Select
                                  size="small"
                                  value={callOffDraft.status}
                                  onChange={(e) => setCallOffDraftField("status", String(e.target.value))}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                >
                                  <MenuItem value="Sales planned">Sales planned</MenuItem>
                                  <MenuItem value="Load planned">Load planned</MenuItem>
                                  <MenuItem value="Aktiv">Aktiv</MenuItem>
                                  <MenuItem value="Avslutad">Avslutad</MenuItem>
                                </Select>
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>ArtNr *</Typography>
                                <Select
                                  size="small"
                                  value={callOffDraft.artNr}
                                  onChange={(e) => setCallOffDraftField("artNr", String(e.target.value))}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                >
                                  <MenuItem value="2202209500002000">2202209500002000</MenuItem>
                                  <MenuItem value="2515012000000000">2515012000000000</MenuItem>
                                  <MenuItem value="4512014500000000">4512014500000000</MenuItem>
                                </Select>
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Pakettyp *</Typography>
                                <Select
                                  size="small"
                                  value={callOffDraft.pakettyp}
                                  onChange={(e) => setCallOffDraftField("pakettyp", String(e.target.value))}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                >
                                  <MenuItem value="Lp">Lp</MenuItem>
                                  <MenuItem value="Paket">Paket</MenuItem>
                                </Select>
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Mängd *</Typography>
                                <TextField
                                  size="small"
                                  value={callOffDraft.mangd}
                                  onChange={(e) => setCallOffDraftField("mangd", e.target.value)}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                />
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Enhet *</Typography>
                                <Select
                                  size="small"
                                  value={callOffDraft.enhet}
                                  onChange={(e) => setCallOffDraftField("enhet", String(e.target.value))}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                >
                                  <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                                  <MenuItem value="m3 fast">m3 fast</MenuItem>
                                  <MenuItem value="lpm">lpm</MenuItem>
                                  <MenuItem value="st">st</MenuItem>
                                </Select>
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Volym *</Typography>
                                <TextField
                                  size="small"
                                  value={callOffDraft.volym}
                                  onChange={(e) => setCallOffDraftField("volym", e.target.value)}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                />
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Leveransvecka *</Typography>
                                <TextField
                                  size="small"
                                  value={callOffDraft.leveransvecka}
                                  onChange={(e) => setCallOffDraftField("leveransvecka", e.target.value)}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                />
                              </div>
                              <div className={styles.freightFormField}>
                                <Typography className={styles.freightFormLabel}>Avropaddatum *</Typography>
                                <TextField
                                  size="small"
                                  value={callOffDraft.avropaddatum}
                                  onChange={(e) => setCallOffDraftField("avropaddatum", e.target.value)}
                                  className={`${styles.freightFormInput} ${styles.lineItemRequiredControl}`}
                                />
                              </div>
                            </div>
                          </div>

                          <div className={styles.freightFormCard}>
                            <Typography className={styles.callOffSectionTitle}>Övriga fält</Typography>
                            <div className={styles.freightFormGrid}>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Fakturatext</Typography><TextField size="small" value={callOffDraft.fakturatext} onChange={(e) => setCallOffDraftField("fakturatext", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>KombipaketNr</Typography><TextField size="small" value={callOffDraft.kombipaketNr} onChange={(e) => setCallOffDraftField("kombipaketNr", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Kundens referens</Typography><TextField size="small" value={callOffDraft.kundensReferens} onChange={(e) => setCallOffDraftField("kundensReferens", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera ArtNr</Typography><Select size="small" value={callOffDraft.levereraArtNr} onChange={(e) => setCallOffDraftField("levereraArtNr", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="2202209500002000">2202209500002000</MenuItem><MenuItem value="2515012000000000">2515012000000000</MenuItem><MenuItem value="4512014500000000">4512014500000000</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera Produkt</Typography><TextField size="small" value={callOffDraft.levereraProdukt} onChange={(e) => setCallOffDraftField("levereraProdukt", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leverera pakettyp</Typography><Select size="small" value={callOffDraft.levereraPakettyp} onChange={(e) => setCallOffDraftField("levereraPakettyp", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Lp">Lp</MenuItem><MenuItem value="Paket">Paket</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Certifiering</Typography><Select size="small" value={callOffDraft.certifiering} onChange={(e) => setCallOffDraftField("certifiering", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ocertifierat">Ocertifierat</MenuItem><MenuItem value="FSC">FSC</MenuItem><MenuItem value="PEFC">PEFC</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Emballage</Typography><Select size="small" value={callOffDraft.emballage} onChange={(e) => setCallOffDraftField("emballage", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Standard">Standard</MenuItem><MenuItem value="Skydd">Skydd</MenuItem><MenuItem value="Export">Export</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Bunt</Typography><TextField size="small" value={callOffDraft.bunt} onChange={(e) => setCallOffDraftField("bunt", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Leveransdag</Typography><Select size="small" value={callOffDraft.leveransdag} onChange={(e) => setCallOffDraftField("leveransdag", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Måndag">Måndag</MenuItem><MenuItem value="Tisdag">Tisdag</MenuItem><MenuItem value="Onsdag">Onsdag</MenuItem><MenuItem value="Torsdag">Torsdag</MenuItem><MenuItem value="Fredag">Fredag</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Plocktillägg</Typography><TextField size="small" value={callOffDraft.plocktillagg} onChange={(e) => setCallOffDraftField("plocktillagg", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Målningstillägg</Typography><TextField size="small" value={callOffDraft.malningstillagg} onChange={(e) => setCallOffDraftField("malningstillagg", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Målningstillägg tröskel</Typography><TextField size="small" value={callOffDraft.malningstillaggTroskel} onChange={(e) => setCallOffDraftField("malningstillaggTroskel", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Apris</Typography><TextField size="small" value={callOffDraft.aPris} onChange={(e) => setCallOffDraftField("aPris", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Folie</Typography><Select size="small" value={callOffDraft.folie} onChange={(e) => setCallOffDraftField("folie", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="Ingen">Ingen</MenuItem><MenuItem value="Vit">Vit</MenuItem><MenuItem value="Transparent">Transparent</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Lev. tidigast</Typography><TextField size="small" value={callOffDraft.levTidigast} onChange={(e) => setCallOffDraftField("levTidigast", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Lev. senast</Typography><TextField size="small" value={callOffDraft.levSenast} onChange={(e) => setCallOffDraftField("levSenast", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Intern kommentar</Typography><TextField size="small" value={callOffDraft.internKommentar} onChange={(e) => setCallOffDraftField("internKommentar", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Extern kommentar</Typography><TextField size="small" value={callOffDraft.externKommentar} onChange={(e) => setCallOffDraftField("externKommentar", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Kundmärke</Typography><TextField size="small" value={callOffDraft.kundmarke} onChange={(e) => setCallOffDraftField("kundmarke", e.target.value)} className={styles.freightFormInput} /></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Registrerat av</Typography><Select size="small" value={callOffDraft.registreratAv} onChange={(e) => setCallOffDraftField("registreratAv", String(e.target.value))} className={styles.freightFormInput}><MenuItem value="">-</MenuItem><MenuItem value="Jane Doe">Jane Doe</MenuItem><MenuItem value="Erik Andersson">Erik Andersson</MenuItem><MenuItem value="Maria Nilsson">Maria Nilsson</MenuItem></Select></div>
                              <div className={styles.freightFormField}><Typography className={styles.freightFormLabel}>Customer planned</Typography><TextField size="small" value={callOffDraft.customerPlanned} onChange={(e) => setCallOffDraftField("customerPlanned", e.target.value)} className={styles.freightFormInput} /></div>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </DialogContent>
                    <DialogActions className={styles.freightDialogActions}>
                      <Button size="small" className={styles.freightCancelButton} onClick={closeCallOffForm}>
                        Avbryt
                      </Button>
                      <Button size="small" className={styles.freightSaveButton} onClick={saveCallOffForm}>
                        {isCreateCallOffView ? "Skapa" : "Spara"}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              ) : activeTab === "Periodisering" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>
                    <div className={styles.freightSectionHeader}>
                      <Button
                        className={styles.freightNewButton}
                        startIcon={<AddIcon />}
                        onClick={openPeriodiseringAdd}
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
                        <div className={styles.freightFormGrid}>
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
                      <Button size="small" className={styles.freightCancelButton} onClick={closePeriodiseringForm}>
                        Avbryt
                      </Button>
                      <Button size="small" className={styles.freightSaveButton} onClick={savePeriodiseringForm}>
                        {periodiseringForm.mode === "add" ? "Lägg till" : "Spara"}
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Snackbar
                    key={periodiseringCreateFeedback.key}
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
                          <div className={styles.freightFormGrid}>
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
                        <Button size="small" className={styles.freightCancelButton} onClick={closeProductionPlanningForm}>
                          Avbryt
                        </Button>
                        <Button size="small" className={styles.freightSaveButton} onClick={saveProductionPlanningForm}>
                          {productionPlanningForm.mode === "add" ? "Lägg till" : "Spara"}
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Snackbar
                      key={productionPlanningCreateFeedback.key}
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
              ) : activeTab === "Nettolager" ? (
                <div className={styles.freightTabContent}>
                  <div className={styles.freightSection}>


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
    </div>
  );
}

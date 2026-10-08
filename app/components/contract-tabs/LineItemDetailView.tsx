"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import { useRef, useState, type ComponentType, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Checkbox, Chip, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, MenuItem, Select, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DetailHeader } from "../shared/DetailHeader";
import { SectionQuickNav, scrollSectionIntoView, type QuickNavSection } from "../shared/SectionQuickNav";
import { useMediaQuery, WIDE_LAYOUT_QUERY, EXTRA_WIDE_LAYOUT_QUERY } from "../../hooks/useMediaQuery";
import { LineItemAvropsraderTab } from "./line-item-tabs/LineItemAvropsraderTab";
import { LineItemLangdspecifikationTab } from "./line-item-tabs/LineItemLangdspecifikationTab";
import { LineItemNettolagerButton } from "./line-item-tabs/LineItemNettolagerButton";
import { LineItemPeriodiseringTab } from "./line-item-tabs/LineItemPeriodiseringTab";
import { LineItemProduktionsplaneringTab } from "./line-item-tabs/LineItemProduktionsplaneringTab";
import { PaketbokningDialog } from "./PaketbokningDialog";
import styles from "../../page.module.scss";

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
  volume: "100",
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

type LineItemDetailViewProps = {
  lineItemId: string;
  /** Kontraktets kund, visas som subtitle i huvudet. */
  customerName?: string;
  newDraftSeed?: Partial<NewLineItemDraft>;
  pinnedFields?: Set<keyof NewLineItemDraft>;
  onTogglePinnedField?: (key: keyof NewLineItemDraft) => void;
  onSaveAndCreateNew?: (draft: NewLineItemDraft) => void;
  onSaveAndClose?: () => void;
  onCreateAvropsrad?: () => void;
  onOpenAvropsrad?: (id: string, data?: Record<string, string>) => void;
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
  { key: "product", label: "Produkt" },
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

const REQUIRED_STEP_PANEL_IDS = ["allmant", "produkt", "affar", "leverans", "ovrigt", "langdfordelning"] as const;
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

const lineItemTabs = ["Avropsrader", "Periodisering", "Längdspecifikation", "Produktionsplanering"] as const;
type LineItemTab = (typeof lineItemTabs)[number];

const LINE_ITEM_SECTIONS: QuickNavSection[] = [
  { key: "allmant", label: "Allmänt" },
  { key: "produkt", label: "Produkt" },
  { key: "affar", label: "Affär" },
  { key: "leverans", label: "Leverans" },
  { key: "ovrigt", label: "Övrigt" },
];

// Valet överlever "Spara och ny" (som monterar om vyn), likt övriga sparade val i prototypen.
let openPaketbokningOnSavePreference = false;

const MIN_SECTIONS_PANEL_WIDTH = 220;
const MAX_SECTIONS_PANEL_WIDTH = 900;

export function LineItemDetailView({
  lineItemId,
  customerName,
  newDraftSeed = {},
  pinnedFields,
  onTogglePinnedField,
  onSaveAndCreateNew,
  onSaveAndClose,
  onCreateAvropsrad,
  onOpenAvropsrad,
}: LineItemDetailViewProps) {
  const isNewLineItem = lineItemId === "new";
  const saveAndContinueButtonRef = useRef<HTMLButtonElement | null>(null);
  const [periodiseringEnabled, setPeriodiseringEnabled] = useState(false);
  const [newLineItemDraft, setNewLineItemDraft] = useState<NewLineItemDraft>({
    ...(isNewLineItem ? emptyNewLineItemDraft : existingLineItemDraft),
    ...newDraftSeed
  });
  const [expandedPanels, setExpandedPanels] = useState<string[]>([...(isNewLineItem ? REQUIRED_STEP_PANEL_IDS : LINE_ITEM_SECTIONS.map(({ key }) => key)), "produktionsplanering"]);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [savedDraftNr, setSavedDraftNr] = useState<string | null>(null);
  const [showSavedSnackbar, setShowSavedSnackbar] = useState(false);
  const [optionalFastTrackKeys, setOptionalFastTrackKeys] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [hiddenFieldKeys, setHiddenFieldKeys] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [showAllOptionalFields, setShowAllOptionalFields] = useState(false);
  const [quickTrackSavedAt, setQuickTrackSavedAt] = useState<string | null>(null);
  const isCreating = isNewLineItem && savedDraftNr === null;
  const [openPaketbokningOnSave, setOpenPaketbokningOnSave] = useState(openPaketbokningOnSavePreference);
  // Satt när paketbokning öppnats efter sparning; anger vad som händer när man lämnar den.
  const [paketbokningAfterSave, setPaketbokningAfterSave] = useState<{ next: "saved" | "new"; nr: string } | null>(null);

  // ── Sidopanel + flikar (befintlig kontraktsrad) ──
  const [activeTab, setActiveTab] = useState<LineItemTab>("Avropsrader");
  const [isFormView, setIsFormView] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const draftSnapshotRef = useRef<NewLineItemDraft | null>(null);
  const [isSectionsPanelCollapsed, setIsSectionsPanelCollapsed] = useState(false);
  const [sectionsPanelWidth, setSectionsPanelWidth] = useState<number | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionsHeaderRef = useRef<HTMLDivElement | null>(null);
  const isWide = useMediaQuery(WIDE_LAYOUT_QUERY);
  const isExtraWide = useMediaQuery(EXTRA_WIDE_LAYOUT_QUERY);


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


  const missingRequiredKeys = isNewLineItem
    ? REQUIRED_FIELD_DEFS
      .filter(({ key }) => {
        const val = newLineItemDraft[key];
        return typeof val === "string" ? val.trim() === "" : !val;
      })
      .map(({ key }) => key)
    : [];
  const isFastTrackField = (key: keyof NewLineItemDraft) =>
    REQUIRED_FIELD_KEYS.has(key) || optionalFastTrackKeys.has(key);

  const getFieldLabel = (key: keyof NewLineItemDraft, label: string) =>
    isCreating && REQUIRED_FIELD_KEYS.has(key) ? `${label} *` : label;
  const getFieldControlClassName = (key: keyof NewLineItemDraft, baseClass = styles.searchFieldControl) => {
    const classNames = [baseClass];
    if (REQUIRED_FIELD_KEYS.has(key)) {
      classNames.push(styles.lineItemRequiredControl);
    }
    if (isCreating && isFastTrackField(key)) {
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
    if (!isCreating || event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) {
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
    isCreating && hiddenFieldKeys.has(key) ? ` ${styles.lineItemFieldHidden}` : "";

  const validateRequiredFields = () => {
    if (missingRequiredKeys.length > 0) {
      setShowStepErrors(true);
      openRequiredPanels();
      return false;
    }
    setShowStepErrors(false);
    return true;
  };

  const generateLineItemNr = () => String(Math.floor(Math.random() * 90000) + 10000);

  const handleSaveNewLineItem = () => {
    if (!validateRequiredFields()) {
      return;
    }
    const nr = generateLineItemNr();
    setShowSavedSnackbar(true);
    if (openPaketbokningOnSave) {
      // Skapa-vyn ligger kvar i bakgrunden; raden markeras som sparad först när dialogen stängs.
      setPaketbokningAfterSave({ next: "saved", nr });
      return;
    }
    setSavedDraftNr(nr);
  };

  const handleSaveAndNew = () => {
    if (!validateRequiredFields()) {
      return;
    }
    if (openPaketbokningOnSave) {
      setPaketbokningAfterSave({ next: "new", nr: generateLineItemNr() });
      return;
    }
    handleSaveAndCreateNew();
  };

  const toggleOpenPaketbokningOnSave = (checked: boolean) => {
    openPaketbokningOnSavePreference = checked;
    setOpenPaketbokningOnSave(checked);
  };

  const closePaketbokningAfterSave = () => {
    const pending = paketbokningAfterSave;
    setPaketbokningAfterSave(null);
    if (pending?.next === "new") handleSaveAndCreateNew();
    else if (pending?.next === "saved") setSavedDraftNr(pending.nr);
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


  const jumpToSection = (key: string) => {
    setExpandedPanels((previous) => (previous.includes(key) ? previous : [...previous, key]));
    requestAnimationFrame(() => {
      const target = sectionRefs.current[key];
      if (target) scrollSectionIntoView(target, sectionsHeaderRef.current);
    });
  };

  const startResizeSections = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sectionsPanelWidth ?? (isExtraWide ? 380 : 290);
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const delta = startX - e.clientX;
      setSectionsPanelWidth(Math.max(MIN_SECTIONS_PANEL_WIDTH, Math.min(MAX_SECTIONS_PANEL_WIDTH, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const isSectionsPanelMaxWidth = sectionsPanelWidth === MAX_SECTIONS_PANEL_WIDTH;

  const toggleSectionsPanelWidth = () => {
    setSectionsPanelWidth((current) => (current === MAX_SECTIONS_PANEL_WIDTH ? null : MAX_SECTIONS_PANEL_WIDTH));
  };

  const startEditingInfo = () => {
    draftSnapshotRef.current = newLineItemDraft;
    setIsEditingInfo(true);
  };

  const cancelEditingInfo = () => {
    if (draftSnapshotRef.current) setNewLineItemDraft(draftSnapshotRef.current);
    setIsEditingInfo(false);
  };

  const openFormView = () => {
    if (!isEditingInfo) draftSnapshotRef.current = newLineItemDraft;
    setIsEditingInfo(false);
    setIsFormView(true);
  };

  const cancelFormView = () => {
    if (draftSnapshotRef.current) setNewLineItemDraft(draftSnapshotRef.current);
    setIsFormView(false);
  };

  // ── Fältinnehåll per sektion (används av både helsidesformulär och sidopanel) ──
  const panelGridClass = `${styles.contractModernFormGrid} ${styles.lineItemPanelFormGrid}`;

  const renderAllmantFields = (gridClass: string) => (
    <>
      <div className={gridClass}>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="senderCompany" label={getFieldLabel("senderCompany", "Utlastande enhet")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("senderCompany", "Utlastande enhet")} value={newLineItemDraft.senderCompany} onChange={(v) => updateDraftField("senderCompany", v)} className={getFieldControlClassName("senderCompany")}>
            <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
            <MenuItem value="Moelven">Moelven</MenuItem>
          </LabeledSelect>
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="senderWarehouse" label={getFieldLabel("senderWarehouse", "Utlastande lagerställe")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("senderWarehouse", "Utlastande lagerställe")} value={newLineItemDraft.senderWarehouse} onChange={(v) => updateDraftField("senderWarehouse", v)} className={getFieldControlClassName("senderWarehouse")}>
            <MenuItem value="Krokom">Krokom</MenuItem>
            <MenuItem value="Hissmofors">Hissmofors</MenuItem>
          </LabeledSelect>
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="responsibleCompany" label={getFieldLabel("responsibleCompany", "Ansvarig enhet")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("responsibleCompany", "Ansvarig enhet")} value={newLineItemDraft.responsibleCompany} onChange={(v) => updateDraftField("responsibleCompany", v)} className={getFieldControlClassName("responsibleCompany")}>
            <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
            <MenuItem value="Moelven">Moelven</MenuItem>
          </LabeledSelect>
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="status" label={getFieldLabel("status", "Status")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("status", "Status")} value={newLineItemDraft.status} onChange={(v) => updateDraftField("status", v)} className={getFieldControlClassName("status")}>
            <MenuItem value="Aktiv">Aktiv</MenuItem>
            <MenuItem value="Pausad">Pausad</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("certification")}`}>
          <FieldLabel fieldKey="certification" label="Certifiering" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Certifiering" value={newLineItemDraft.certification} size="small" className={getFieldControlClassName("certification")} InputProps={{ readOnly: true }} helperText="Bestäms av kontraktet" />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("priceList")}`}>
          <FieldLabel fieldKey="priceList" label="Prislista" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
    </>
  );

  const renderProduktFields = (gridClass: string) => (
    <>
      <div className={gridClass}>

        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="artNr" label={getFieldLabel("artNr", "ArtNr")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
            <LineItemNettolagerButton artNr={newLineItemDraft.artNr} product={newLineItemDraft.product} />
          </div>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("nobbNumber")}`}>
          <FieldLabel fieldKey="nobbNumber" label="NOBBnr" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label="NOBBnr" value={newLineItemDraft.nobbNumber} onChange={(v) => updateDraftField("nobbNumber", v)} className={getFieldControlClassName("nobbNumber")}>
            <MenuItem value="">-</MenuItem>
            <MenuItem value="10110001">10110001</MenuItem>
            <MenuItem value="10110002">10110002</MenuItem>
            <MenuItem value="10110003">10110003</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("deliverArtNr")}`}>
          <FieldLabel fieldKey="deliverArtNr" label="Leverera ArtNr" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
      <div className={gridClass}>
        <div className={`${styles.lineItemField}${fieldHide("product")}`}>
          <FieldLabel fieldKey="product" label="Produkt" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Produkt" value={newLineItemDraft.product} onChange={(event) => updateDraftField("product", event.target.value)} size="small" className={getFieldControlClassName("product")} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("deliverProduct")}`}>
          <FieldLabel fieldKey="deliverProduct" label="Leverera produkt" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Leverera produkt" value={newLineItemDraft.deliverProduct} onChange={(event) => updateDraftField("deliverProduct", event.target.value)} size="small" className={getFieldControlClassName("deliverProduct")} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("invoiceText")}`}>
          <FieldLabel fieldKey="invoiceText" label="Fakturatext" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Fakturatext" value={newLineItemDraft.invoiceText} onChange={(event) => updateDraftField("invoiceText", event.target.value)} size="small" className={getFieldControlClassName("invoiceText")} />
        </div>
      </div>
      <div className={gridClass}>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="packageType" label={getFieldLabel("packageType", "Pakettyp")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("packageType", "Pakettyp")} value={newLineItemDraft.packageType} onChange={(v) => updateDraftField("packageType", v)} className={getFieldControlClassName("packageType")}>
            <MenuItem value="Lp">Lp</MenuItem>
            <MenuItem value="Paket">Paket</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("deliverPackageType")}`}>
          <FieldLabel fieldKey="deliverPackageType" label="Leverera pakettyp" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label="Leverera pakettyp" value={newLineItemDraft.deliverPackageType} onChange={(v) => updateDraftField("deliverPackageType", v)} className={getFieldControlClassName("deliverPackageType")}>
            <MenuItem value="">-</MenuItem>
            <MenuItem value="Lp">Lp</MenuItem>
            <MenuItem value="Paket">Paket</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("length")}`}>
          <FieldLabel fieldKey="length" label="Längd" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Längd" value={newLineItemDraft.length} onChange={(event) => updateDraftField("length", event.target.value)} size="small" className={getFieldControlClassName("length")} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="packaging" label="Emballage" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label="Emballage" value={newLineItemDraft.packaging} onChange={(v) => updateDraftField("packaging", v)} className={getFieldControlClassName("packaging")}>
            <MenuItem value="">-</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Skydd">Skydd</MenuItem>
            <MenuItem value="Export">Export</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("bundle")}`}>
          <FieldLabel fieldKey="bundle" label="Bunt" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Bunt" value={newLineItemDraft.bundle} onChange={(event) => updateDraftField("bundle", event.target.value)} size="small" className={getFieldControlClassName("bundle")} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("vflGroup")}`}>
          <FieldLabel fieldKey="vflGroup" label="VFL grupp" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label="VFL grupp" value={newLineItemDraft.vflGroup} onChange={(v) => updateDraftField("vflGroup", v)} className={getFieldControlClassName("vflGroup")}>
            <MenuItem value="">-</MenuItem>
            <MenuItem value="VFL-A">VFL-A</MenuItem>
            <MenuItem value="VFL-B">VFL-B</MenuItem>
            <MenuItem value="VFL-C">VFL-C</MenuItem>
          </LabeledSelect>
        </div>
      </div>
    </>
  );

  const renderAffarFields = (gridClass: string) => (
    <>
      <div className={gridClass}>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="quantity" label={getFieldLabel("quantity", "Mängd")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label={getFieldLabel("quantity", "Mängd")} value={newLineItemDraft.quantity} onChange={(event) => updateDraftField("quantity", event.target.value)} size="small" className={getFieldControlClassName("quantity")} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="orderedUnit" label={getFieldLabel("orderedUnit", "Beställd enhet")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("orderedUnit", "Beställd enhet")} value={newLineItemDraft.orderedUnit} onChange={(v) => updateDraftField("orderedUnit", v)} className={getFieldControlClassName("orderedUnit")}>
            <MenuItem value="m3 nominell">m3 nominell</MenuItem>
            <MenuItem value="m3 fast">m3 fast</MenuItem>
            <MenuItem value="lpm">lpm</MenuItem>
          </LabeledSelect>
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="volume" label={getFieldLabel("volume", "Volym")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label={getFieldLabel("volume", "Volym")} value={newLineItemDraft.volume} onChange={(event) => updateDraftField("volume", event.target.value)} size="small" className={getFieldControlClassName("volume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("finalVolume")}`}>
          <FieldLabel fieldKey="finalVolume" label="Slutvolym" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Slutvolym" value={newLineItemDraft.finalVolume} onChange={(event) => updateDraftField("finalVolume", event.target.value)} size="small" className={getFieldControlClassName("finalVolume")} InputProps={{ endAdornment: <InputAdornment position="end">m3</InputAdornment> }} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="invoiceUnit" label={getFieldLabel("invoiceUnit", "Faktura enhet")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("invoiceUnit", "Faktura enhet")} value={newLineItemDraft.invoiceUnit} onChange={(v) => updateDraftField("invoiceUnit", v)} className={getFieldControlClassName("invoiceUnit")}>
            <MenuItem value="m3 nominell">m3 nominell</MenuItem>
            <MenuItem value="m3 fast">m3 fast</MenuItem>
            <MenuItem value="lpm">lpm</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("adjustedPrice")}`}>
          <FieldLabel fieldKey="adjustedPrice" label="Prisjusterad" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Prisjusterad" value={newLineItemDraft.adjustedPrice} onChange={(event) => updateDraftField("adjustedPrice", event.target.value)} size="small" className={getFieldControlClassName("adjustedPrice")} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="price" label={getFieldLabel("price", "Pris")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label={getFieldLabel("price", "Pris")} value={newLineItemDraft.price} onChange={(event) => updateDraftField("price", event.target.value)} size="small" className={getFieldControlClassName("price")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("amount")}`}>
          <FieldLabel fieldKey="amount" label="Belopp" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Belopp" value={newLineItemDraft.amount} onChange={(event) => updateDraftField("amount", event.target.value)} size="small" className={getFieldControlClassName("amount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("sponsorship")}`}>
          <FieldLabel fieldKey="sponsorship" label="Sponsring" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Sponsring" value={newLineItemDraft.sponsorship} onChange={(event) => updateDraftField("sponsorship", event.target.value)} size="small" className={getFieldControlClassName("sponsorship")} InputProps={{ endAdornment: <InputAdornment position="end">USD/m3 nomin</InputAdornment> }} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("sponsoredAmount")}`}>
          <FieldLabel fieldKey="sponsoredAmount" label="Belopp spons" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Belopp spons" value={newLineItemDraft.sponsoredAmount} onChange={(event) => updateDraftField("sponsoredAmount", event.target.value)} size="small" className={getFieldControlClassName("sponsoredAmount")} InputProps={{ endAdornment: <InputAdornment position="end">SEK</InputAdornment> }} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("caneaAgreementNumber")}`}>
          <FieldLabel fieldKey="caneaAgreementNumber" label="Avtalsnr i Canea" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Avtalsnr i Canea" value={newLineItemDraft.caneaAgreementNumber} onChange={(event) => updateDraftField("caneaAgreementNumber", event.target.value)} size="small" className={getFieldControlClassName("caneaAgreementNumber")} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="salesType" label={getFieldLabel("salesType", "Säljtyp")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("salesType", "Säljtyp")} value={newLineItemDraft.salesType} onChange={(v) => updateDraftField("salesType", v)} className={getFieldControlClassName("salesType")}>
            <MenuItem value="Eget virke">Eget virke</MenuItem>
            <MenuItem value="Handelsvara">Handelsvara</MenuItem>
          </LabeledSelect>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("pickingSurchargeEnabled")}`}>
          <FieldLabel fieldKey="pickingSurchargeEnabled" label="Plocktillägg" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
          <FieldLabel fieldKey="pickingSurchargeQuantity" label="Plocktillägg antal" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
    </>
  );

  const renderLeveransFields = (gridClass: string) => (
    <>
      <div className={gridClass}>
        <div className={`${styles.lineItemField}${fieldHide("deliveryWeek")}`}>
          <FieldLabel fieldKey="deliveryWeek" label="Leveransvecka" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Leveransvecka" value={newLineItemDraft.deliveryWeek} onChange={(event) => updateDraftField("deliveryWeek", event.target.value)} size="small" className={getFieldControlClassName("deliveryWeek")} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("deliveryDay")}`}>
          <FieldLabel fieldKey="deliveryDay" label="Leveransdag" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
          <FieldLabel fieldKey="deliveryWindowMin" label={getFieldLabel("deliveryWindowMin", "Lev. fönster min")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label={getFieldLabel("deliveryWindowMin", "Lev. fönster min")} value={newLineItemDraft.deliveryWindowMin} onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)} size="small" className={getFieldControlClassName("deliveryWindowMin")} />
        </div>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="deliveryWindowMax" label={getFieldLabel("deliveryWindowMax", "Lev. fönster max")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label={getFieldLabel("deliveryWindowMax", "Lev. fönster max")} value={newLineItemDraft.deliveryWindowMax} onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)} size="small" className={getFieldControlClassName("deliveryWindowMax")} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("deliveryPeriodDocument")}`}>
          <FieldLabel fieldKey="deliveryPeriodDocument" label="Leveransperiod kunddokument" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Leveransperiod kunddokument" value={newLineItemDraft.deliveryPeriodDocument} onChange={(event) => updateDraftField("deliveryPeriodDocument", event.target.value)} size="small" className={getFieldControlClassName("deliveryPeriodDocument")} />
        </div>
      </div>
    </>
  );

  const renderOvrigtFields = (gridClass: string) => (
    <>
      <div className={gridClass}>
        <div className={styles.lineItemField}>
          <FieldLabel fieldKey="callOffStatus" label={getFieldLabel("callOffStatus", "Avropsradsstatus")} isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <LabeledSelect label={getFieldLabel("callOffStatus", "Avropsradsstatus")} value={newLineItemDraft.callOffStatus} onChange={(v) => updateDraftField("callOffStatus", v)} className={getFieldControlClassName("callOffStatus")}>
            <MenuItem value="Sales planned">Sales planned</MenuItem>
            <MenuItem value="Load planned">Load planned</MenuItem>
            <MenuItem value="Aktiv">Aktiv</MenuItem>
          </LabeledSelect>
        </div>
      </div>
      <hr className={styles.contractFlatDivider} />
      <div className={gridClass}>
        <div className={`${styles.lineItemField}${fieldHide("showOnInvoice")}`}>
          <FieldLabel fieldKey="showOnInvoice" label="Visa på följesedel" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
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
          <FieldLabel fieldKey="internalComment" label="Intern kommentar" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Intern kommentar" value={newLineItemDraft.internalComment} onChange={(event) => updateDraftField("internalComment", event.target.value)} size="small" className={getFieldControlClassName("internalComment")} multiline rows={3} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("externalComment")}`}>
          <FieldLabel fieldKey="externalComment" label="Extern kommentar" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Extern kommentar" value={newLineItemDraft.externalComment} onChange={(event) => updateDraftField("externalComment", event.target.value)} size="small" className={getFieldControlClassName("externalComment")} multiline rows={3} />
          <Typography className={styles.lineItemFieldHelperText}>Visas på orderbekräftelse och kontrakt. Följer med till lastorder.</Typography>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("customerComment")}`}>
          <FieldLabel fieldKey="customerComment" label="Kundkommentar" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Kundkommentar" value={newLineItemDraft.customerComment} onChange={(event) => updateDraftField("customerComment", event.target.value)} size="small" className={getFieldControlClassName("customerComment")} multiline rows={3} />
        </div>
        <div className={`${styles.lineItemField}${fieldHide("customerBrand")}`}>
          <FieldLabel fieldKey="customerBrand" label="Kundens märke" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Kundens märke" value={newLineItemDraft.customerBrand} onChange={(event) => updateDraftField("customerBrand", event.target.value)} size="small" className={getFieldControlClassName("customerBrand")} />
          <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på följesedel och faktura.</Typography>
        </div>
        <div className={`${styles.lineItemField}${fieldHide("recipientBrand")}`}>
          <FieldLabel fieldKey="recipientBrand" label="Godsmottagarens märke" isNewLineItem={isCreating} pinnedFields={pinnedFields} onTogglePinnedField={onTogglePinnedField} />
          <TextField label="Godsmottagarens märke" value={newLineItemDraft.recipientBrand} onChange={(event) => updateDraftField("recipientBrand", event.target.value)} size="small" className={getFieldControlClassName("recipientBrand")} />
          <Typography className={styles.lineItemFieldHelperText}>Följer med till lastorder och visas på fraktsedel och i C-Load.</Typography>
        </div>
      </div>
    </>
  );

  const periodiseringTab = (
    <LineItemPeriodiseringTab
      volume={newLineItemDraft.volume}
      orderedUnit={newLineItemDraft.orderedUnit}
      deliveryWindowMin={newLineItemDraft.deliveryWindowMin}
      deliveryWindowMax={newLineItemDraft.deliveryWindowMax}
    />
  );

  const renderFormAccordion = (id: string, Icon: ComponentType<{ className?: string }>, title: string, content: ReactNode) => (
    <Accordion
      expanded={expandedPanels.includes(id)}
      onChange={() => togglePanel(id)}
      className={styles.contractModernAccordion}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
        <div className={styles.contractModernAccordionTitleRow}>
          <Icon className={styles.contractModernAccordionIcon} />
          <Typography className={styles.contractModernAccordionTitle}>{title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );

  const renderPanelSection = (id: string, Icon: ComponentType<{ className?: string }>, title: string, content: ReactNode) => (
    <Accordion
      key={id}
      expanded={expandedPanels.includes(id)}
      onChange={() => togglePanel(id)}
      ref={(el) => { sectionRefs.current[id] = el; }}
      disableGutters
      elevation={0}
      className={styles.contractSectionAccordion}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
        <span className={styles.contractSectionTitleRow}>
          <Icon className={styles.contractSectionIcon} />
          <Typography className={styles.contractSectionTitle}>{title}</Typography>
        </span>
      </AccordionSummary>
      <AccordionDetails className={`${styles.contractSectionDetailsArea} ${!isEditingInfo ? styles.contractSectionDetailsAreaLocked : ""}`}>
        {content}
      </AccordionDetails>
    </Accordion>
  );

  const headerChips = (
    <Chip
      icon={<WarningIcon />}
      label="Kunden har överskriden limit"
      size="medium"
      className={`${styles.limitErrorChip} ${styles.customerHeaderWarningChip}`}
      style={{ fontWeight: 500, padding: "0 4px" }}
    />
  );

  const snackbars = (
    <>
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
          Fyll i alla obligatoriska fält innan du sparar
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSavedSnackbar}
        autoHideDuration={2800}
        onClose={() => setShowSavedSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setShowSavedSnackbar(false)} severity="success" variant="filled">
          Kontraktsrad sparad
        </Alert>
      </Snackbar>

    </>
  );


  const paketbokningDialog = (
    <PaketbokningDialog
      open={paketbokningAfterSave !== null}
      title={`Paketbokning – kontraktsrad ${paketbokningAfterSave?.nr ?? ""}${newLineItemDraft.product ? ` · ${newLineItemDraft.product}` : ""}`}
      initialReservationstyp="Kontraktrad"
      produkt={newLineItemDraft.product || undefined}
      volym={newLineItemDraft.volume || undefined}
      enhet={newLineItemDraft.orderedUnit || undefined}
      onClose={closePaketbokningAfterSave}
      onReservera={closePaketbokningAfterSave}
      onSkaLastasUt={closePaketbokningAfterSave}
    />
  );

  if (isCreating || isFormView) {
    return (
      <div className={`${styles.lineItemDetailPanel} ${styles.lineItemCreatePanel}`}>
        <DetailHeader
          entity="contract"
          label="Kontraktsrad"
          title={isNewLineItem ? (savedDraftNr ? `${savedDraftNr}` : "Ny kontraktsrad") : lineItemId}
          subtitle={customerName}
          chips={headerChips}
          actions={
            isCreating ? (
              <>
                <FormControlLabel
                  className={styles.lineItemHeaderCheckbox}
                  control={
                    <Checkbox
                      size="small"
                      checked={openPaketbokningOnSave}
                      onChange={(event) => toggleOpenPaketbokningOnSave(event.target.checked)}
                    />
                  }
                  label="Boka paket"
                  title="Öppna paketbokning när raden sparas"
                />
                <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
                <Button
                  ref={saveAndContinueButtonRef}
                  startIcon={<AddIcon />}
                  className={styles.lineItemSaveButton}
                  size="small"
                  variant="contained"
                  onClick={handleSaveAndNew}
                >
                  Spara och ny
                </Button>
                <Button
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={handleSaveNewLineItem}
                >
                  Spara
                </Button>
                <span className={styles.lineItemTopActionDivider} aria-hidden="true" />
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
                  className={styles.lineItemSaveButton}
                  size="small"
                  variant="contained"
                  onClick={() => setIsFormView(false)}
                >
                  Spara
                </Button>
                <Button
                  className={`${styles.lineItemBackButton} ${styles.lineItemCancelButton}`}
                  size="small"
                  variant="outlined"
                  onClick={cancelFormView}
                >
                  Avbryt
                </Button>
              </>
            )
          }
        />
        <div
          className={`${styles.detailTwoColumnLayout} ${styles.lineItemWizardStep0Layout}`}
        >
          <div className={styles.detailFormColumn}>
            <div
              className={styles.contractModernAccordionWrap}
              onKeyDownCapture={handleFastTrackKeyDown}
            >
              {isCreating ? (
                <div className={styles.lineItemFastTrackBar}>
                  <div className={styles.lineItemFastTrackMain}>
                    <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
                    <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
                    <span className={styles.lineItemFastTrackText}>
                      Tryck Ctrl+Enter för att hoppa mellan de viktigaste fälten i kontraktsradshuvudet
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

              {renderFormAccordion("allmant", DescriptionOutlinedIcon, "Allmänt", renderAllmantFields(styles.lineItemSectionGrid3))}
              {renderFormAccordion("produkt", Inventory2OutlinedIcon, "Produkt", renderProduktFields(styles.lineItemSectionGrid3))}
              {renderFormAccordion("affar", GavelOutlinedIcon, "Affär", renderAffarFields(styles.lineItemSectionGrid3))}
              {renderFormAccordion("leverans", LocalShippingOutlinedIcon, "Leverans", (
                <>
                  {renderLeveransFields(styles.lineItemSectionGrid3)}
                  {isCreating ? (
                    <>
                      <hr className={styles.contractFlatDivider} />
                      <label className={styles.periodiseringCheckboxRow}>
                        <Checkbox
                          size="small"
                          checked={periodiseringEnabled}
                          onChange={(e) => setPeriodiseringEnabled(e.target.checked)}
                        />
                        <span className={styles.periodiseringAccordionTitle}>Periodisering</span>
                      </label>
                      {periodiseringEnabled ? periodiseringTab : null}
                    </>
                  ) : null}
                </>
              ))}
              {renderFormAccordion("ovrigt", CategoryOutlinedIcon, "Övrigt", renderOvrigtFields(styles.lineItemSectionGrid3))}
              {isCreating ? (
                <>
                  {renderFormAccordion("langdfordelning", BarChartOutlinedIcon, "Längdspecifikation", <LineItemLangdspecifikationTab alignButtonRight />)}
                  {renderFormAccordion("produktionsplanering", FactoryOutlinedIcon, "Produktionsplanering", <LineItemProduktionsplaneringTab alignButtonRight />)}
                </>
              ) : null}
            </div>
          </div>
        </div>
        {snackbars}
        {paketbokningDialog}
      </div>
    );
  }


  return (
    <div className={styles.lineItemDetailPanel}>
      <DetailHeader
        entity="contract"
        label="Kontraktsrad"
        title={isNewLineItem ? (savedDraftNr ?? "Ny kontraktsrad") : lineItemId}
        subtitle={customerName}
        chips={headerChips}
        actions={
          <Tooltip title="Ta bort">
            <IconButton size="small" className={styles.contractHeaderDotsButton} aria-label="Ta bort kontraktsrad">
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />

      {/* ── Body layout ── */}
      <div className={`${styles.contractBodyLayout} ${isWide ? styles.contractBodyLayoutWide : ""}`}>

        {/* ── Sections panel ── */}
        <div
          className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : styles.contractBodySectionsColStacked} ${isExtraWide && !sectionsPanelWidth && !isSectionsPanelCollapsed ? styles.contractBodySectionsColExtraWide : ""} ${isSectionsPanelCollapsed ? (isWide ? styles.contractBodySectionsColCollapsed : styles.contractBodySectionsColCollapsedNarrow) : ""}`}
          style={isWide && sectionsPanelWidth && !isSectionsPanelCollapsed ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
        >
          {isWide && !isSectionsPanelCollapsed ? (
            <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
          ) : null}

          <div ref={sectionsHeaderRef} className={styles.contractSectionsPanelHeader}>
            <div className={styles.contractSectionsPanelTitleRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
              {!isSectionsPanelCollapsed || !isWide ? (
                <Typography className={styles.contractSectionsPanelTitle}>Kontraktsradsinformation</Typography>
              ) : null}
              <Tooltip title={isSectionsPanelCollapsed ? "Expandera kontraktsradspanel" : "Minimera kontraktsradspanel"}>
                <IconButton
                  size="small"
                  className={styles.contractSectionsPanelMinimizeBtn}
                  onClick={() => setIsSectionsPanelCollapsed((v) => !v)}
                >
                  <MenuOpenIcon fontSize="small" style={isSectionsPanelCollapsed ? { transform: "scaleX(1)" } : { transform: "scaleX(-1)" }} />
                </IconButton>
              </Tooltip>
            </div>
            {!isSectionsPanelCollapsed ? (
              <SectionQuickNav sections={LINE_ITEM_SECTIONS} onSelect={jumpToSection} />
            ) : null}
            {!isSectionsPanelCollapsed ? (
              <div className={styles.contractSectionsPanelHeaderActionsRow}>
                {isEditingInfo ? (
                  <>
                    <Button size="small" className={styles.freightSaveButton} onClick={() => setIsEditingInfo(false)}>
                      Spara
                    </Button>
                    <Button size="small" className={styles.freightCancelButton} onClick={cancelEditingInfo}>
                      Avbryt
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    className={styles.contractSaveButton}
                    startIcon={<EditOutlinedIcon fontSize="small" />}
                    onClick={startEditingInfo}
                  >
                    Redigera
                  </Button>
                )}
                <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
                <Tooltip title="Redigera i formulär">
                  <Button
                    size="small"
                    className={styles.contractHeaderDotsButton}
                    onClick={openFormView}
                    style={{ minWidth: 0 }}
                  >
                    <EditNoteOutlinedIcon fontSize="small" />
                  </Button>
                </Tooltip>
                {isWide ? (
                  <Tooltip title={isSectionsPanelMaxWidth ? "Återställ panelbredd" : "Maximera panelbredd"}>
                    <Button
                      size="small"
                      className={styles.contractHeaderDotsButton}
                      onClick={toggleSectionsPanelWidth}
                      style={{ minWidth: 0 }}
                    >
                      {isSectionsPanelMaxWidth ? (
                        <KeyboardDoubleArrowRightIcon fontSize="small" />
                      ) : (
                        <KeyboardDoubleArrowLeftIcon fontSize="small" />
                      )}
                    </Button>
                  </Tooltip>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isSectionsPanelCollapsed ? (
            <>
              {renderPanelSection("allmant", DescriptionOutlinedIcon, "Allmänt", renderAllmantFields(panelGridClass))}
              {renderPanelSection("produkt", Inventory2OutlinedIcon, "Produkt", renderProduktFields(panelGridClass))}
              {renderPanelSection("affar", GavelOutlinedIcon, "Affär", renderAffarFields(panelGridClass))}
              {renderPanelSection("leverans", LocalShippingOutlinedIcon, "Leverans", renderLeveransFields(panelGridClass))}
              {renderPanelSection("ovrigt", CategoryOutlinedIcon, "Övrigt", renderOvrigtFields(panelGridClass))}
            </>
          ) : null}
        </div>

        {/* ── Tabs panel ── */}
        <div className={`${styles.contractBodyTabsCol} ${isWide ? styles.contractBodyTabsColWide : ""}`}>
          <div className={styles.contractModernAdditionsWrap}>
            <div className={`${styles.contractMudTabBar} ${!isWide ? styles.contractMudTabBarStackedSticky : ""}`}>
              {lineItemTabs.map((tab) => (
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
              {activeTab === "Avropsrader" ? (
                <LineItemAvropsraderTab
                  produkt={newLineItemDraft.product}
                  orderedUnit={newLineItemDraft.orderedUnit}
                  onCreateAvropsrad={onCreateAvropsrad}
                  onOpenAvropsrad={onOpenAvropsrad}
                />
              ) : null}
              {activeTab === "Periodisering" ? periodiseringTab : null}
              {activeTab === "Längdspecifikation" ? <LineItemLangdspecifikationTab /> : null}
              {activeTab === "Produktionsplanering" ? <LineItemProduktionsplaneringTab /> : null}
            </div>
          </div>
        </div>
      </div>
      {snackbars}
      {paketbokningDialog}
    </div>
  );
}

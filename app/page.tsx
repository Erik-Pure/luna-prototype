"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Alert,
  CircularProgress,
  Snackbar,
  Switch,
  Typography
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { type LineItemDetailTab, type NewLineItemDraft } from "./components/contract-tabs/LineItemDetailView";
import {
  AppShellLayout,
  ContractDetailView,
  ContractListView,
  DeliveryListView,
  PriceListDetailView,
  PriceListRowDetailView,
  PriceListView
} from "./components/views";
import { useColorMode, useUiState } from "./providers";
import styles from "./page.module.scss";

type SectionKey = "marknad" | "produktion" | "leverans" | "rapporter" | "system";

type TopMenuItemDef = {
  slug: string;
  label: string;
  hasMenu?: boolean;
  alignRight?: boolean;
  options?: Array<{ slug: string; label: string }>;
};

const sectionDefinitions: Array<{
  slug: SectionKey;
  label: string;
  icon: ReactNode;
  defaultMenuSlug: string;
}> = [
  { slug: "marknad", label: "Marknad", icon: <StorefrontOutlinedIcon fontSize="small" />, defaultMenuSlug: "kontraktlista" },
  { slug: "produktion", label: "Produktion", icon: <FactoryOutlinedIcon fontSize="small" />, defaultMenuSlug: "oversikt" },
  { slug: "leverans", label: "Leverans", icon: <LocalShippingOutlinedIcon fontSize="small" />, defaultMenuSlug: "planering" },
  { slug: "rapporter", label: "Rapporter", icon: <AssessmentOutlinedIcon fontSize="small" />, defaultMenuSlug: "dashboard" },
  { slug: "system", label: "System", icon: <SettingsOutlinedIcon fontSize="small" />, defaultMenuSlug: "installningar" }
];

const topMenusBySection: Record<SectionKey, TopMenuItemDef[]> = {
  marknad: [
    { slug: "kundlista", label: "Kundlista" },
    { slug: "prislistor", label: "Prislistor" },
    { slug: "kontraktlista", label: "Kontraktlista" },
    { slug: "avropslista", label: "Avropslista" },
    { slug: "leveranslista", label: "Leveranslista" },
    { slug: "klar-sok", label: "Klar sök" },
    {
      slug: "e-handel",
      label: "E-handel",
      hasMenu: true,
      alignRight: true,
      options: [
        { slug: "ehandel-orderportal", label: "Orderportal" },
        { slug: "ehandel-edi", label: "EDI Integration" },
        { slug: "ehandel-kundshop", label: "Kundshop" }
      ]
    },
    {
      slug: "saljstod",
      label: "Säljstöd",
      hasMenu: true,
      alignRight: true,
      options: [
        { slug: "saljstod-kampanjer", label: "Kampanjer" },
        { slug: "saljstod-offerter", label: "Offerter" },
        { slug: "saljstod-prisguide", label: "Prisguide" }
      ]
    }
  ],
  produktion: [
    { slug: "oversikt", label: "Översikt" },
    { slug: "planering", label: "Planering" },
    { slug: "kapacitet", label: "Kapacitet" }
  ],
  leverans: [
    { slug: "planering", label: "Planering" },
    { slug: "transporter", label: "Transporter" },
    { slug: "uppfoljning", label: "Uppföljning" }
  ],
  rapporter: [
    { slug: "dashboard", label: "Dashboard" },
    { slug: "ekonomi", label: "Ekonomi" },
    { slug: "logistik", label: "Logistik" }
  ],
  system: [
    { slug: "installningar", label: "Inställningar" },
    { slug: "anvandare", label: "Användare" },
    { slug: "integrationer", label: "Integrationer" }
  ]
};

const actionItems = [
  { label: "Ny", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Ta bort", icon: <DeleteOutlineOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Skriv ut", icon: <PrintOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Kopiera", icon: <ContentCopyOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Inaktivera", icon: <BlockOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Ändra pris", icon: <EditOutlinedIcon fontSize="small" />, requiresSelection: true }
];

const fakeCompanies = [
  "BP Hissmofors Byggprodukter",
  "Nordic Sten & Mark AB",
  "Svea Entreprenad Partner",
  "Luna Infrastruktur AB",
  "Skandinavisk Industriservice",
  "Grönkraft Fastighet & Drift"
];

const contractTabs = [
  "Kontraktsrader",
  "Frakt",
  "Avrop"
] as const;

type ContractTab = (typeof contractTabs)[number];

type ColumnKey =
  | "kontrakt"
  | "externNr"
  | "belopp"
  | "kund"
  | "land"
  | "kontraktsdatum"
  | "giltigTom"
  | "egenAnmarkning"
  | "status"
  | "leveransperiod"
  | "upprattatAv"
  | "kontraktsvolym"
  | "levVolym";

type ColumnConfig = {
  key: ColumnKey;
  label: string;
  visible: boolean;
  pinned: boolean;
};

type LineItemColumnKey =
  | "idRad"
  | "status"
  | "underkonto"
  | "artikelNr"
  | "produkt"
  | "langd"
  | "mangd"
  | "enhet"
  | "aPris"
  | "rabatt"
  | "volym"
  | "leverans"
  | "lager"
  | "prisOrt"
  | "transport"
  | "nettoSek"
  | "radKommentar";

type LineItemColumnConfig = {
  key: LineItemColumnKey;
  label: string;
  visible: boolean;
};

type LineItemRow = Record<LineItemColumnKey, string>;

type TableRow = {
  kontrakt: string;
  externNr: string;
  belopp: string;
  kund: string;
  land: string;
  kontraktsdatum?: string;
  giltigTom?: string;
  egenAnmarkning?: string;
  status?: string;
  leveransperiod?: string;
  upprattatAv?: string;
  kontraktsvolym?: string;
  levVolym?: string;
};

type SearchFieldKey =
  | "typ"
  | "kontraktsNr"
  | "externtKontraktsnr"
  | "kontraktsdatum"
  | "artNr"
  | "kund"
  | "kategori"
  | "land"
  | "mottagarland"
  | "bolag"
  | "upprattatAv"
  | "prislistaNr"
  | "certifiering"
  | "tillhor"
  | "varningsnivaFordran"
  | "varningsnivaLimit"
  | "saknarAvtalsratt"
  | "saknarAvtal"
  | "avtalsrattSaknasI"
  | "cLoad";

type SearchFieldConfig = {
  key: SearchFieldKey;
  label: string;
  control: "text" | "select" | "checkbox";
  visible: boolean;
};

const defaultSearchFields: SearchFieldConfig[] = [
  { key: "typ", label: "Typ", control: "select", visible: true },
  { key: "kontraktsNr", label: "KontraktsNr", control: "text", visible: true },
  { key: "externtKontraktsnr", label: "Externt kontraktsnr", control: "text", visible: true },
  { key: "kontraktsdatum", label: "Kontraktsdatum", control: "text", visible: false },
  { key: "artNr", label: "ArtNr", control: "text", visible: false },
  { key: "kund", label: "Kund", control: "text", visible: false },
  { key: "kategori", label: "Kategori", control: "select", visible: false },
  { key: "land", label: "Land", control: "select", visible: false },
  { key: "mottagarland", label: "Mottagarland", control: "select", visible: false },
  { key: "bolag", label: "Bolag", control: "select", visible: false },
  { key: "upprattatAv", label: "Upprättat av", control: "text", visible: false },
  { key: "prislistaNr", label: "Prislista nr", control: "text", visible: false },
  { key: "certifiering", label: "Certifiering", control: "select", visible: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: false },
  { key: "varningsnivaFordran", label: "Varningsnivå fordran", control: "select", visible: false },
  { key: "varningsnivaLimit", label: "Varningsnivå limit", control: "select", visible: false },
  { key: "saknarAvtalsratt", label: "Saknar avtalsrätt", control: "checkbox", visible: false },
  { key: "saknarAvtal", label: "Saknar avtal", control: "checkbox", visible: false },
  { key: "avtalsrattSaknasI", label: "Avtalsrätt saknas i", control: "text", visible: false },
  { key: "cLoad", label: "C-Load", control: "checkbox", visible: false }
];

const selectOptionsByField: Partial<Record<SearchFieldKey, string[]>> = {
  typ: ["Aktivt kontrakt", "Inaktivt kontrakt", "Alla kontrakt"],
  bolag: ["BP Hissmofors Byg", "BP Team Syd", "BP Region Norr"],
  land: ["SE", "NO", "FI", "DK"],
  mottagarland: ["SE", "NO", "FI", "DK"],
  kategori: ["A", "B", "C"],
  certifiering: ["Ja", "Nej"],
  varningsnivaFordran: ["Låg", "Medium", "Hög"],
  varningsnivaLimit: ["Låg", "Medium", "Hög"]
};

type SearchValueMap = Record<SearchFieldKey, string | boolean>;

const initialSearchValues: SearchValueMap = {
  typ: "Aktivt kontrakt",
  kontraktsNr: "",
  externtKontraktsnr: "",
  kontraktsdatum: "",
  artNr: "",
  kund: "",
  kategori: "",
  land: "",
  mottagarland: "",
  bolag: "BP Hissmofors Byg",
  upprattatAv: "",
  prislistaNr: "",
  certifiering: "",
  tillhor: "",
  varningsnivaFordran: "",
  varningsnivaLimit: "",
  saknarAvtalsratt: false,
  saknarAvtal: false,
  avtalsrattSaknasI: "",
  cLoad: false
};

const defaultColumns: ColumnConfig[] = [
  { key: "kontrakt", label: "Kontraktsnr", visible: true, pinned: false },
  { key: "externNr", label: "Externt kontraktsnr", visible: true, pinned: false },
  { key: "belopp", label: "Belopp SEK", visible: true, pinned: false },
  { key: "kund", label: "Kund", visible: true, pinned: false },
  { key: "land", label: "Land", visible: true, pinned: false },
  { key: "kontraktsdatum", label: "Kontraktsdatum", visible: false, pinned: false },
  { key: "giltigTom", label: "Giltig t.o.m.", visible: false, pinned: false },
  { key: "egenAnmarkning", label: "Egen anmärkning", visible: false, pinned: false },
  { key: "status", label: "Status", visible: false, pinned: false },
  { key: "leveransperiod", label: "Leveransperiod", visible: false, pinned: false },
  { key: "upprattatAv", label: "Upprättat av", visible: false, pinned: false },
  { key: "kontraktsvolym", label: "Kontraktsvol", visible: false, pinned: false },
  { key: "levVolym", label: "Lev volym", visible: false, pinned: false }
];

const tableRows: TableRow[] = Array.from({ length: 6 }).map((_, idx) => ({
  kontrakt: "163311",
  externNr: "2025/03 Reg 2",
  belopp: "26 651",
  kund: "Stall Unik",
  land: "SE",
  kontraktsdatum: "2025-03-01",
  giltigTom: "2025-12-31",
  egenAnmarkning: idx === 0 ? "Ny kund" : "",
  status: "Aktiv",
  leveransperiod: "Q1",
  upprattatAv: "Jane Doe",
  kontraktsvolym: "10",
  levVolym: "4"
}));

const defaultLineItemColumns: LineItemColumnConfig[] = [
  { key: "idRad", label: "ID-rad", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "underkonto", label: "Underkonto", visible: true },
  { key: "artikelNr", label: "Artikelnr", visible: true },
  { key: "produkt", label: "Produkt", visible: true },
  { key: "langd", label: "Längd", visible: true },
  { key: "mangd", label: "Mängd", visible: true },
  { key: "enhet", label: "Enhet", visible: true },
  { key: "aPris", label: "A-pris", visible: true },
  { key: "rabatt", label: "Rabatt", visible: true },
  { key: "volym", label: "Volym", visible: false },
  { key: "leverans", label: "Leverans", visible: true },
  { key: "lager", label: "Lager", visible: true },
  { key: "prisOrt", label: "Prisort", visible: false },
  { key: "transport", label: "Transport", visible: false },
  { key: "nettoSek", label: "Netto SEK", visible: true },
  { key: "radKommentar", label: "Radkommentar", visible: false }
];

const lineItemRows: LineItemRow[] = Array.from({ length: 12 }).map((_, idx) => ({
  idRad: `RAD-${1001 + idx}`,
  status: "Aktiv",
  underkonto: `BP Hissmofors Byg ${220200000 + idx}`,
  artikelNr: `22${120 + idx}`,
  produkt: ["Gran flisad spå", "Furu hyvlad", "Gran v-styrp"][idx % 3],
  langd: ["4.2", "5.1", "3.6"][idx % 3],
  mangd: `${(idx + 2) * 2}`,
  enhet: "1 paket",
  aPris: `${(8 + idx * 0.7).toFixed(2)} SEK`,
  rabatt: `${(idx % 4) + 1}`,
  volym: `${(idx + 1) * 0.8}`,
  leverans: "2025/50",
  lager: ["Krokom", "Östersund", "Sundsvall"][idx % 3],
  prisOrt: "SE-Norr",
  transport: ["Eget", "Speditör"][idx % 2],
  nettoSek: `${9200 + idx * 380}`,
  radKommentar: idx % 3 === 0 ? "Extra kap tillägg" : "-"
}));

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const pathSection = pathParts[0] as SectionKey | undefined;
  const sectionSlug: SectionKey =
    pathSection && sectionDefinitions.some((section) => section.slug === pathSection)
      ? pathSection
      : "marknad";
  const sectionConfig =
    sectionDefinitions.find((section) => section.slug === sectionSlug) ?? sectionDefinitions[0];
  const menuSlug = pathParts[1] ?? sectionConfig.defaultMenuSlug;
  const contractId = pathParts[2] ?? null;
  const lineItemId = pathParts[3] ?? null;
  const isContractDetailRoute = sectionSlug === "marknad" && menuSlug === "kontraktlista";
  const isPriceListRoute = sectionSlug === "marknad" && menuSlug === "prislistor";
  const isContractDetailOpen = isContractDetailRoute && Boolean(contractId);
  const isPriceListDetailOpen = isPriceListRoute && Boolean(contractId);
  const selectedContractId = isContractDetailRoute ? contractId : null;
  const selectedPriceListId = isPriceListRoute ? contractId : null;
  const selectedPriceRowId = isPriceListRoute ? lineItemId : null;
  const selectedLineItemId = isContractDetailRoute ? lineItemId : null;
  const isCreatingLineItem = selectedLineItemId === "new";
  const isLineItemDetailOpen = Boolean(selectedContractId && selectedLineItemId);
  const isPriceListRowDetailOpen = Boolean(selectedPriceListId && selectedPriceRowId);
  const isCreatingPriceRow = selectedPriceRowId === "new";
  const isContractListPage = sectionSlug === "marknad" && menuSlug === "kontraktlista";
  const isDeliveryListPage = sectionSlug === "marknad" && menuSlug === "leveranslista";
  const isPriceListPage = sectionSlug === "marknad" && menuSlug === "prislistor";
  const isSystemPage = sectionSlug === "system";
  const topMenuItems = topMenusBySection[sectionSlug] ?? topMenusBySection.marknad;
  const leftTopMenuItems = topMenuItems.filter((item) => !item.alignRight);
  const rightTopMenuItems = topMenuItems.filter((item) => item.alignRight);
  const currentTopMenuOption = topMenuItems
    .flatMap((menu) => menu.options ?? [])
    .find((option) => option.slug === menuSlug);
  const currentSection = sectionConfig;
  const currentMenu =
    topMenuItems.find(
      (menu) => menu.slug === menuSlug || menu.options?.some((option) => option.slug === menuSlug)
    ) ?? topMenuItems[0];
  const currentMenuLabel = currentTopMenuOption?.label ?? currentMenu.label;

  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUiState();
  const [topMenuAnchorEl, setTopMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [topMenuDropdownOwnerSlug, setTopMenuDropdownOwnerSlug] = useState<string | null>(null);
  const [topMenuDropdownOptions, setTopMenuDropdownOptions] = useState<Array<{ slug: string; label: string }>>(
    []
  );
  const [activeContractTab, setActiveContractTab] = useState<ContractTab>("Kontraktsrader");
  const [activeLineItemTab, setActiveLineItemTab] = useState<LineItemDetailTab>("Längdfördelning");
  const [selectedCompany, setSelectedCompany] = useState(fakeCompanies[0]);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [searchValues, setSearchValues] = useState<SearchValueMap>(initialSearchValues);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [appliedSearchFields, setAppliedSearchFields] = useState<SearchFieldConfig[]>(defaultSearchFields);
  const [draftSearchFields, setDraftSearchFields] = useState<SearchFieldConfig[]>(defaultSearchFields);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isLineItemsTableVisible, setIsLineItemsTableVisible] = useState(false);
  const [isLineColumnsMenuOpen, setIsLineColumnsMenuOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [appliedColumns, setAppliedColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [appliedLineColumns, setAppliedLineColumns] = useState<LineItemColumnConfig[]>(defaultLineItemColumns);
  const [draftLineColumns, setDraftLineColumns] = useState<LineItemColumnConfig[]>(defaultLineItemColumns);
  const [newLineItemDraftSeed, setNewLineItemDraftSeed] = useState<Partial<NewLineItemDraft>>({});
  const [newLineItemDraftVersion, setNewLineItemDraftVersion] = useState(0);
  const [isLineItemToastOpen, setIsLineItemToastOpen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const routeLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchMenuRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const columnsButtonRef = useRef<HTMLButtonElement | null>(null);
  const lineColumnsMenuRef = useRef<HTMLDivElement | null>(null);
  const lineColumnsButtonRef = useRef<HTMLButtonElement | null>(null);
  const companyMenuRef = useRef<HTMLDivElement | null>(null);
  const companyButtonRef = useRef<HTMLButtonElement | null>(null);
  const { mode, toggleMode } = useColorMode();

  const handleSearchSelectChange = (key: SearchFieldKey, value: string) => {
    setSearchValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSearchTextChange = (key: SearchFieldKey, value: string) => {
    setSearchValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSearchCheckboxChange = (key: SearchFieldKey, checked: boolean) => {
    setSearchValues((previous) => ({ ...previous, [key]: checked }));
  };

  const orderedVisibleColumns = useMemo(() => {
    const pinned = appliedColumns.filter((column) => column.visible && column.pinned);
    const regular = appliedColumns.filter((column) => column.visible && !column.pinned);
    return [...pinned, ...regular];
  }, [appliedColumns]);

  const visibleLineColumns = useMemo(
    () => appliedLineColumns.filter((column) => column.visible),
    [appliedLineColumns]
  );

  const hasSelectedRows = selectedRowId !== null;

  const visibleSearchFields = useMemo(
    () => appliedSearchFields.filter((field) => field.visible),
    [appliedSearchFields]
  );

  const textSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "text"),
    [visibleSearchFields]
  );

  const selectSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "select"),
    [visibleSearchFields]
  );

  const checkboxSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "checkbox"),
    [visibleSearchFields]
  );

  useEffect(() => {
    if (!isColumnsMenuOpen && !isLineColumnsMenuOpen && !isSearchMenuOpen && !isCompanyMenuOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSearchMenu = searchMenuRef.current?.contains(target);
      const clickedSearchButton = searchButtonRef.current?.contains(target);
      const clickedInsideMenu = columnsMenuRef.current?.contains(target);
      const clickedOnButton = columnsButtonRef.current?.contains(target);
      const clickedInsideLineMenu = lineColumnsMenuRef.current?.contains(target);
      const clickedLineButton = lineColumnsButtonRef.current?.contains(target);
      const clickedInsideCompanyMenu = companyMenuRef.current?.contains(target);
      const clickedCompanyButton = companyButtonRef.current?.contains(target);

      if (isSearchMenuOpen && !clickedInsideSearchMenu && !clickedSearchButton) {
        setDraftSearchFields(appliedSearchFields);
        setIsSearchMenuOpen(false);
      }

      if (isColumnsMenuOpen && !clickedInsideMenu && !clickedOnButton) {
        setDraftColumns(appliedColumns);
        setIsColumnsMenuOpen(false);
      }

      if (isLineColumnsMenuOpen && !clickedInsideLineMenu && !clickedLineButton) {
        setDraftLineColumns(appliedLineColumns);
        setIsLineColumnsMenuOpen(false);
      }

      if (isCompanyMenuOpen && !clickedInsideCompanyMenu && !clickedCompanyButton) {
        setIsCompanyMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isColumnsMenuOpen,
    isLineColumnsMenuOpen,
    isSearchMenuOpen,
    isCompanyMenuOpen,
    appliedColumns,
    appliedLineColumns,
    appliedSearchFields
  ]);

  const openSearchMenu = () => {
    setDraftSearchFields(appliedSearchFields);
    setIsColumnsMenuOpen(false);
    setIsLineColumnsMenuOpen(false);
    setIsSearchMenuOpen(true);
  };

  const toggleSearchFieldVisibility = (key: SearchFieldKey) => {
    setDraftSearchFields((previous) =>
      previous.map((field) =>
        field.key === key ? { ...field, visible: !field.visible } : field
      )
    );
  };

  const saveSearchFieldChanges = () => {
    setAppliedSearchFields(draftSearchFields);
    setIsSearchMenuOpen(false);
    triggerViewLoading();
  };

  const cancelSearchFieldChanges = () => {
    setDraftSearchFields(appliedSearchFields);
    setIsSearchMenuOpen(false);
  };

  const clearSearchFieldChanges = () => {
    setDraftSearchFields((previous) =>
      previous.map((field) => ({
        ...field,
        visible: false
      }))
    );
  };

  const openColumnsMenu = () => {
    setDraftColumns(appliedColumns);
    setIsLineColumnsMenuOpen(false);
    setIsSearchMenuOpen(false);
    setIsColumnsMenuOpen(true);
  };

  const toggleColumnVisibility = (key: ColumnKey) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const toggleColumnPin = (key: ColumnKey) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, pinned: !column.pinned } : column
      )
    );
  };

  const moveColumn = (key: ColumnKey, direction: "up" | "down") => {
    setDraftColumns((previous) => {
      const index = previous.findIndex((column) => column.key === key);
      if (index < 0) {
        return previous;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [movedColumn] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedColumn);
      return next;
    });
  };

  const saveColumnChanges = () => {
    setAppliedColumns(draftColumns);
    setIsColumnsMenuOpen(false);
    triggerViewLoading();
  };

  const cancelColumnChanges = () => {
    setDraftColumns(appliedColumns);
    setIsColumnsMenuOpen(false);
  };

  const resetColumnChanges = () => {
    setDraftColumns(defaultColumns);
  };

  const openLineColumnsMenu = () => {
    setDraftLineColumns(appliedLineColumns);
    setIsColumnsMenuOpen(false);
    setIsLineColumnsMenuOpen(true);
  };

  const toggleLineColumnVisibility = (key: LineItemColumnKey) => {
    setDraftLineColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const moveLineColumn = (key: LineItemColumnKey, direction: "up" | "down") => {
    setDraftLineColumns((previous) => {
      const index = previous.findIndex((column) => column.key === key);
      if (index < 0) {
        return previous;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [movedColumn] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedColumn);
      return next;
    });
  };

  const saveLineColumnChanges = () => {
    setAppliedLineColumns(draftLineColumns);
    setIsLineColumnsMenuOpen(false);
    triggerViewLoading();
  };

  const cancelLineColumnChanges = () => {
    setDraftLineColumns(appliedLineColumns);
    setIsLineColumnsMenuOpen(false);
  };

  const resetLineColumnChanges = () => {
    setDraftLineColumns(defaultLineItemColumns);
  };

  const selectMainTableRow = (rowIndex: number) => {
    setSelectedRowId((previous) => (previous === rowIndex ? null : rowIndex));
  };

  const getCellValue = (row: TableRow, columnKey: ColumnKey) => {
    const value = row[columnKey];
    return value && value.length > 0 ? value : "-";
  };

  const getSelectOptions = (key: SearchFieldKey) => {
    return selectOptionsByField[key] ?? ["Ja", "Nej"];
  };

  const toggleSidebar = () => {
    toggleSidebarCollapsed();
  };

  const triggerViewLoading = (durationMs = 280) => {
    if (viewLoadingTimeoutRef.current) {
      clearTimeout(viewLoadingTimeoutRef.current);
    }
    setIsViewLoading(true);
    viewLoadingTimeoutRef.current = setTimeout(() => {
      setIsViewLoading(false);
    }, durationMs);
  };

  const navigateWithLoading = (targetPath: string) => {
    if (routeLoadingTimeoutRef.current) {
      clearTimeout(routeLoadingTimeoutRef.current);
    }
    setIsRouteLoading(true);
    routeLoadingTimeoutRef.current = setTimeout(() => {
      setIsRouteLoading(false);
    }, 900);
    router.push(targetPath);
  };

  const toggleCompanyMenu = () => {
    setIsCompanyMenuOpen((previous) => !previous);
  };

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setIsCompanyMenuOpen(false);
  };

  const navigateToSection = (section: SectionKey, defaultMenuSlug: string) => {
    closeTopMenuDropdown();
    navigateWithLoading(`/${section}/${defaultMenuSlug}`);
  };

  const navigateToTopMenu = (nextMenuSlug: string) => {
    closeTopMenuDropdown();
    navigateWithLoading(`/${sectionSlug}/${nextMenuSlug}`);
  };

  const openContractDetail = (contractId: string) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${contractId}`);
  };

  const openNewContract = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/new`);
  };

  const openPriceListDetail = (priceListId: string) => {
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${priceListId}`);
  };

  const openNewPriceList = () => {
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/new`);
  };

  const openPriceRowDetail = (priceRowId: string) => {
    if (!selectedPriceListId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}/${priceRowId}`);
  };

  const openNewPriceRow = () => {
    if (!selectedPriceListId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}/new`);
  };

  const closeContractDetail = () => {
    setActiveLineItemTab("Längdfördelning");
    navigateWithLoading(`/${sectionSlug}/${menuSlug}`);
  };

  const closePriceListDetail = () => {
    navigateWithLoading(`/${sectionSlug}/${menuSlug}`);
  };

  const closePriceListRowDetail = () => {
    if (!selectedPriceListId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}`);
  };

  const openLineItemDetail = (lineItemId: string) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/${lineItemId}`);
  };

  const openNewLineItem = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    setNewLineItemDraftSeed({});
    setNewLineItemDraftVersion((previous) => previous + 1);
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/new`);
  };

  const saveAndCreateNewLineItem = (draft: NewLineItemDraft) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    setNewLineItemDraftSeed(draft);
    setNewLineItemDraftVersion((previous) => previous + 1);
    setIsLineItemToastOpen(true);
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/new`);
  };

  const closeLineItemDetail = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Längdfördelning");
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
  };

  const handleContractTabChange = (tab: ContractTab) => {
    setActiveContractTab(tab);
    triggerViewLoading();
    if (tab !== "Kontraktsrader" && isLineItemDetailOpen && selectedContractId) {
      setActiveLineItemTab("Längdfördelning");
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
    }
  };

  const closeTopMenuDropdown = () => {
    setTopMenuAnchorEl(null);
    setTopMenuDropdownOwnerSlug(null);
    setTopMenuDropdownOptions([]);
  };

  const closeLineItemToast = () => {
    setIsLineItemToastOpen(false);
  };

  const handleTopMenuClick = (item: TopMenuItemDef, event: ReactMouseEvent<HTMLButtonElement>) => {
    if (item.options && item.options.length > 0) {
      setTopMenuAnchorEl(event.currentTarget);
      setTopMenuDropdownOwnerSlug(item.slug);
      setTopMenuDropdownOptions(item.options);
      return;
    }
    navigateToTopMenu(item.slug);
  };

  const handleTopMenuOptionSelect = (optionSlug: string) => {
    closeTopMenuDropdown();
    navigateToTopMenu(optionSlug);
  };

  const isTopMenuItemActive = (item: TopMenuItemDef) => {
    if (item.slug === menuSlug) {
      return true;
    }
    return item.options?.some((option) => option.slug === menuSlug) ?? false;
  };

  const activeContractTabForView: ContractTab = isLineItemDetailOpen ? "Kontraktsrader" : activeContractTab;

  useEffect(() => {
    let deepestBreadcrumb = currentMenuLabel;

    if (selectedContractId) {
      deepestBreadcrumb = `Kontrakt ${selectedContractId}`;
    }

    if (isLineItemDetailOpen && selectedLineItemId) {
      deepestBreadcrumb = isCreatingLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${selectedLineItemId}`;
    }

    if (isPriceListDetailOpen && selectedPriceListId) {
      deepestBreadcrumb = selectedPriceListId === "new" ? "Ny prislista" : `Prislista ${selectedPriceListId}`;
    }

    if (isPriceListRowDetailOpen && selectedPriceRowId) {
      deepestBreadcrumb = isCreatingPriceRow ? "Ny prislistrad" : `Prislistrad ${selectedPriceRowId}`;
    }

    document.title = `${deepestBreadcrumb} (${selectedCompany})`;
  }, [
    selectedCompany,
    currentMenuLabel,
    selectedContractId,
    isLineItemDetailOpen,
    selectedLineItemId,
    isCreatingLineItem,
    isPriceListDetailOpen,
    selectedPriceListId,
    isPriceListRowDetailOpen,
    selectedPriceRowId,
    isCreatingPriceRow
  ]);

  useEffect(() => {
    if (!isRouteLoading) {
      return;
    }
    const timeoutId = setTimeout(() => setIsRouteLoading(false), 120);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, isRouteLoading]);

  useEffect(() => {
    return () => {
      if (routeLoadingTimeoutRef.current) {
        clearTimeout(routeLoadingTimeoutRef.current);
      }
      if (viewLoadingTimeoutRef.current) {
        clearTimeout(viewLoadingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className={styles.pageRoot}>
      {isRouteLoading ? (
        <div className={styles.topProgressRail} aria-live="polite" aria-busy="true">
          <div className={styles.topProgressBar} />
        </div>
      ) : null}
      {isViewLoading ? (
        <div className={styles.loadingOverlay} aria-live="polite" aria-busy="true">
          <div className={styles.loadingCard}>
            <CircularProgress size={24} className={styles.loadingSpinner} />
            <Typography className={styles.loadingText}>Laddar data...</Typography>
          </div>
        </div>
      ) : null}
      <AppShellLayout
        isSidebarCollapsed={isSidebarCollapsed}
        selectedCompany={selectedCompany}
        isCompanyMenuOpen={isCompanyMenuOpen}
        fakeCompanies={fakeCompanies}
        sectionSlug={sectionSlug}
        sectionDefinitions={sectionDefinitions}
        companyButtonRef={companyButtonRef}
        companyMenuRef={companyMenuRef}
        onToggleCompanyMenu={toggleCompanyMenu}
        onCompanySelect={handleCompanySelect}
        onNavigateSection={(section, defaultMenuSlug) => navigateToSection(section as SectionKey, defaultMenuSlug)}
        onToggleSidebar={toggleSidebar}
        leftTopMenuItems={leftTopMenuItems}
        rightTopMenuItems={rightTopMenuItems}
        isTopMenuItemActive={isTopMenuItemActive}
        onTopMenuClick={(item, event) => handleTopMenuClick(item as TopMenuItemDef, event)}
        topMenuAnchorEl={topMenuAnchorEl}
        onCloseTopMenuDropdown={closeTopMenuDropdown}
        topMenuDropdownOptions={topMenuDropdownOptions}
        topMenuDropdownOwnerSlug={topMenuDropdownOwnerSlug}
        menuSlug={menuSlug}
        onTopMenuOptionSelect={handleTopMenuOptionSelect}
        currentSectionLabel={currentSection.label.charAt(0) + currentSection.label.slice(1).toLowerCase()}
        currentMenuLabel={currentMenuLabel}
        isContractDetailOpen={isContractDetailOpen}
        isLineItemDetailOpen={isLineItemDetailOpen}
        selectedContractId={selectedContractId}
        selectedLineItemId={selectedLineItemId}
        isCreatingLineItem={isCreatingLineItem}
        onCloseContractDetail={closeContractDetail}
        onCloseLineItemDetail={closeLineItemDetail}
        isPriceListDetailOpen={isPriceListDetailOpen}
        selectedPriceListId={selectedPriceListId}
        onClosePriceListDetail={closePriceListDetail}
        isPriceListRowDetailOpen={isPriceListRowDetailOpen}
        selectedPriceRowId={selectedPriceRowId}
        isCreatingPriceRow={isCreatingPriceRow}
        onClosePriceListRowDetail={closePriceListRowDetail}
      >

            {!isContractDetailOpen && isContractListPage ? (
              <ContractListView
                textFields={textSearchFields}
                selectFields={selectSearchFields}
                checkboxFields={checkboxSearchFields}
                searchValues={searchValues as Record<string, string | boolean>}
                isSearchMenuOpen={isSearchMenuOpen}
                draftSearchFields={draftSearchFields}
                searchButtonRef={searchButtonRef}
                searchMenuRef={searchMenuRef}
                getSelectOptions={(key) => getSelectOptions(key as SearchFieldKey)}
                onOpenSearchMenu={openSearchMenu}
                onCancelSearchMenu={cancelSearchFieldChanges}
                onToggleSearchFieldVisibility={(key) => toggleSearchFieldVisibility(key as SearchFieldKey)}
                onSaveSearchFieldChanges={saveSearchFieldChanges}
                onClearSearchFieldChanges={clearSearchFieldChanges}
                onSearchTextChange={(key, value) => handleSearchTextChange(key as SearchFieldKey, value)}
                onSearchSelectChange={(key, value) => handleSearchSelectChange(key as SearchFieldKey, value)}
                onSearchCheckboxChange={(key, checked) =>
                  handleSearchCheckboxChange(key as SearchFieldKey, checked)
                }
                actionItems={actionItems}
                onCreateContract={openNewContract}
                hasSelectedRows={hasSelectedRows}
                isLineItemsTableVisible={isLineItemsTableVisible}
                onToggleLineItemsTable={() => setIsLineItemsTableVisible((previous) => !previous)}
                isColumnsMenuOpen={isColumnsMenuOpen}
                draftColumns={draftColumns}
                columnsMenuRef={columnsMenuRef}
                columnsButtonRef={columnsButtonRef}
                onOpenColumnsMenu={openColumnsMenu}
                onCancelColumnsMenu={cancelColumnChanges}
                onToggleColumnVisibility={(key) => toggleColumnVisibility(key as ColumnKey)}
                onMoveColumn={(key, direction) => moveColumn(key as ColumnKey, direction)}
                onSaveColumnChanges={saveColumnChanges}
                onResetColumnChanges={resetColumnChanges}
                onToggleColumnPin={(key) => toggleColumnPin(key as ColumnKey)}
                orderedVisibleColumns={orderedVisibleColumns}
                tableRows={tableRows as Array<Record<string, string | undefined>>}
                selectedRowId={selectedRowId}
                onSelectMainTableRow={selectMainTableRow}
                getCellValue={(row, columnKey) => getCellValue(row as TableRow, columnKey as ColumnKey)}
                onOpenContractDetail={openContractDetail}
                isLineColumnsMenuOpen={isLineColumnsMenuOpen}
                draftLineColumns={draftLineColumns}
                lineColumnsMenuRef={lineColumnsMenuRef}
                lineColumnsButtonRef={lineColumnsButtonRef}
                onOpenLineColumnsMenu={openLineColumnsMenu}
                onCancelLineColumnsMenu={cancelLineColumnChanges}
                onToggleLineColumnVisibility={(key) => toggleLineColumnVisibility(key as LineItemColumnKey)}
                onMoveLineColumn={(key, direction) => moveLineColumn(key as LineItemColumnKey, direction)}
                onSaveLineColumnChanges={saveLineColumnChanges}
                onResetLineColumnChanges={resetLineColumnChanges}
                visibleLineColumns={visibleLineColumns}
                lineItemRows={lineItemRows}
              />
            ) : !isContractDetailOpen && isDeliveryListPage ? (
              <DeliveryListView />
            ) : !isPriceListDetailOpen && !isContractDetailOpen && isPriceListPage ? (
              <PriceListView onOpenPriceListDetail={openPriceListDetail} onCreatePriceList={openNewPriceList} />
            ) : isPriceListDetailOpen && selectedPriceListId ? (
              isPriceListRowDetailOpen && selectedPriceRowId ? (
                <PriceListRowDetailView priceListId={selectedPriceListId} priceRowId={selectedPriceRowId} />
              ) : (
                <PriceListDetailView
                  selectedPriceListId={selectedPriceListId}
                  onOpenPriceRowDetail={openPriceRowDetail}
                  onCreatePriceRow={openNewPriceRow}
                />
              )
            ) : isContractDetailOpen ? (
              <ContractDetailView
                isLineItemDetailOpen={isLineItemDetailOpen}
                selectedLineItemId={selectedLineItemId}
                newLineItemDraftVersion={newLineItemDraftVersion}
                activeLineItemTab={activeLineItemTab}
                onChangeLineItemTab={setActiveLineItemTab}
                newLineItemDraftSeed={newLineItemDraftSeed}
                onSaveAndCreateNewLineItem={saveAndCreateNewLineItem}
                contractTabs={contractTabs}
                activeContractTabForView={activeContractTabForView}
                onChangeContractTab={(tab) => handleContractTabChange(tab as ContractTab)}
                selectedContractId={selectedContractId}
                visibleLineColumns={visibleLineColumns}
                lineItemRows={lineItemRows}
                draftLineColumns={draftLineColumns}
                isLineColumnsMenuOpen={isLineColumnsMenuOpen}
                lineColumnsMenuRef={lineColumnsMenuRef}
                lineColumnsButtonRef={lineColumnsButtonRef}
                onOpenLineColumnsMenu={openLineColumnsMenu}
                onCancelLineColumnsMenu={cancelLineColumnChanges}
                onToggleLineColumnVisibility={(key) => toggleLineColumnVisibility(key as LineItemColumnKey)}
                onMoveLineColumn={(key, direction) =>
                  moveLineColumn(key as LineItemColumnKey, direction)
                }
                onSaveLineColumnChanges={saveLineColumnChanges}
                onResetLineColumnChanges={resetLineColumnChanges}
                onOpenLineItemDetail={openLineItemDetail}
                onCreateLineItem={openNewLineItem}
              />
            ) : isSystemPage ? (
              <div className={styles.contractDetailPanel}>
                <div className={styles.systemSettingsPanel}>
                  <Typography className={styles.systemSettingsTitle}>Systeminställningar</Typography>
                  <div className={styles.systemSettingRow}>
                    <div>
                      <Typography className={styles.systemSettingLabel}>Dark mode</Typography>
                      <Typography className={styles.systemSettingDescription}>
                        Växla mellan ljust och mörkt tema i hela applikationen.
                      </Typography>
                    </div>
                    <Switch
                      checked={mode === "dark"}
                      onChange={() => toggleMode()}
                      color="primary"
                      inputProps={{ "aria-label": "Aktivera dark mode" }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.contractDetailPanel}>
                <div className={styles.contractTabPlaceholder}>
                  <Typography className={styles.contractInfoValue}>
                    {currentMenuLabel} - sida under uppbyggnad.
                  </Typography>
                </div>
              </div>
            )}
      </AppShellLayout>
      <Snackbar
        open={isLineItemToastOpen}
        autoHideDuration={2800}
        onClose={closeLineItemToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeLineItemToast} severity="success" variant="filled">
          Kontraktsrad sparad. Ny rad skapad.
        </Alert>
      </Snackbar>
    </main>
  );
}

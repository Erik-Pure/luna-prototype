"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import {
  Avatar,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Switch,
  TextField,
  type SelectChangeEvent,
  Typography
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { CallOffTab } from "./components/contract-tabs/CallOffTab";
import { ContractRowsTab } from "./components/contract-tabs/ContractRowsTab";
import { DeliveryTab } from "./components/contract-tabs/DeliveryTab";
import { DocumentsTab } from "./components/contract-tabs/DocumentsTab";
import { FreightTab } from "./components/contract-tabs/FreightTab";
import { LineItemDetailView, type LineItemDetailTab } from "./components/contract-tabs/LineItemDetailView";
import { OverviewTab } from "./components/contract-tabs/OverviewTab";
import { PrintOptionsTab } from "./components/contract-tabs/PrintOptionsTab";
import { TermsTab } from "./components/contract-tabs/TermsTab";
import { useColorMode } from "./providers";
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
  "Översikt",
  "Villkor",
  "Leverans",
  "Kontraktsrader",
  "Frakt",
  "Avrop",
  "Dokument",
  "Utskriftsalternativ"
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
  const isContractDetailOpen = Boolean(contractId);
  const selectedContractId = contractId;
  const selectedLineItemId = lineItemId;
  const isLineItemDetailOpen = Boolean(selectedContractId && selectedLineItemId);
  const isContractListPage = sectionSlug === "marknad" && menuSlug === "kontraktlista";
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [topMenuAnchorEl, setTopMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [topMenuDropdownOwnerSlug, setTopMenuDropdownOwnerSlug] = useState<string | null>(null);
  const [topMenuDropdownOptions, setTopMenuDropdownOptions] = useState<Array<{ slug: string; label: string }>>(
    []
  );
  const [activeContractTab, setActiveContractTab] = useState<ContractTab>("Översikt");
  const [activeLineItemTab, setActiveLineItemTab] = useState<LineItemDetailTab>("Översikt");
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
  const searchMenuRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const columnsButtonRef = useRef<HTMLButtonElement | null>(null);
  const lineColumnsMenuRef = useRef<HTMLDivElement | null>(null);
  const lineColumnsButtonRef = useRef<HTMLButtonElement | null>(null);
  const companyMenuRef = useRef<HTMLDivElement | null>(null);
  const companyButtonRef = useRef<HTMLButtonElement | null>(null);
  const { mode, toggleMode } = useColorMode();

  const handleSearchSelectChange = (key: SearchFieldKey, event: SelectChangeEvent) => {
    setSearchValues((previous) => ({ ...previous, [key]: event.target.value }));
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
    setIsSidebarCollapsed((previous) => !previous);
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
    router.push(`/${section}/${defaultMenuSlug}`);
  };

  const navigateToTopMenu = (nextMenuSlug: string) => {
    closeTopMenuDropdown();
    router.push(`/${sectionSlug}/${nextMenuSlug}`);
  };

  const openContractDetail = (contractId: string) => {
    setActiveContractTab("Översikt");
    setActiveLineItemTab("Översikt");
    router.push(`/${sectionSlug}/${menuSlug}/${contractId}`);
  };

  const closeContractDetail = () => {
    setActiveLineItemTab("Översikt");
    router.push(`/${sectionSlug}/${menuSlug}`);
  };

  const openLineItemDetail = (lineItemId: string) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Översikt");
    if (!selectedContractId) {
      return;
    }
    router.push(`/${sectionSlug}/${menuSlug}/${selectedContractId}/${lineItemId}`);
  };

  const closeLineItemDetail = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Översikt");
    if (!selectedContractId) {
      return;
    }
    router.push(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
  };

  const handleContractTabChange = (tab: ContractTab) => {
    setActiveContractTab(tab);
    if (tab !== "Kontraktsrader" && isLineItemDetailOpen && selectedContractId) {
      setActiveLineItemTab("Översikt");
      router.push(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
    }
  };

  const closeTopMenuDropdown = () => {
    setTopMenuAnchorEl(null);
    setTopMenuDropdownOwnerSlug(null);
    setTopMenuDropdownOptions([]);
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
      deepestBreadcrumb = `Kontraktsrad ${selectedLineItemId}`;
    }

    document.title = `${deepestBreadcrumb} (${selectedCompany})`;
  }, [
    selectedCompany,
    currentMenuLabel,
    selectedContractId,
    isLineItemDetailOpen,
    selectedLineItemId
  ]);

  return (
    <main className={styles.pageRoot}>
      <div className={styles.appShell}>
        <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
          <div className={styles.sidebarHeader}>
            <button
              type="button"
              ref={companyButtonRef}
              className={styles.companySelectorButton}
              aria-label="BP Hissmofors Byggcor"
              onClick={toggleCompanyMenu}
              aria-expanded={isCompanyMenuOpen}
            >
              {isSidebarCollapsed ? (
                <>
                  <HomeOutlinedIcon className={styles.companySelectorHomeIcon} />
                  <span className={styles.companySelectorTooltip}>{selectedCompany}</span>
                </>
              ) : (
                <>
                  <span className={styles.companySelectorText}>{selectedCompany}</span>
                  <KeyboardArrowDownIcon className={styles.companySelectorArrow} />
                </>
              )}
            </button>
            {isCompanyMenuOpen ? (
              <div
                className={`${styles.companyDropdown} ${
                  isSidebarCollapsed ? styles.companyDropdownCollapsed : ""
                }`}
                ref={companyMenuRef}
              >
                {fakeCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    className={`${styles.companyDropdownItem} ${
                      selectedCompany === company ? styles.companyDropdownItemActive : ""
                    }`}
                    onClick={() => handleCompanySelect(company)}
                  >
                    {company}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.sidebarMenu}>
            {sectionDefinitions
              .filter((section) => section.slug !== "system")
              .map((section) => (
              <button
                type="button"
                key={section.slug}
                className={`${styles.sidebarItemButton} ${section.slug === sectionSlug ? styles.sidebarItemActive : ""}`}
                data-label={section.label}
                onClick={() => navigateToSection(section.slug, section.defaultMenuSlug)}
              >
                <span className={styles.sidebarItemIcon}>{section.icon}</span>
                {!isSidebarCollapsed ? (
                  <span className={styles.sidebarItemText}>{section.label}</span>
                ) : null}
                {isSidebarCollapsed ? (
                  <span className={styles.sidebarItemTooltip}>{section.label}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className={styles.sidebarSpacer} />

          <div className={styles.sidebarBottomMenu}>
            {sectionDefinitions
              .filter((section) => section.slug === "system")
              .map((section) => (
                <button
                  type="button"
                  key={section.slug}
                  className={`${styles.sidebarItemButton} ${section.slug === sectionSlug ? styles.sidebarItemActive : ""}`}
                  data-label={section.label}
                  onClick={() => navigateToSection(section.slug, section.defaultMenuSlug)}
                >
                  <span className={styles.sidebarItemIcon}>{section.icon}</span>
                  {!isSidebarCollapsed ? (
                    <span className={styles.sidebarItemText}>{section.label}</span>
                  ) : null}
                  {isSidebarCollapsed ? (
                    <span className={styles.sidebarItemTooltip}>{section.label}</span>
                  ) : null}
                </button>
              ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.userRow}>
              <Avatar
                src="/luna-profile-avatar.png"
                alt="Jane Doe"
                variant="rounded"
                className={styles.userAvatar}
              />
              {!isSidebarCollapsed ? (
                <Typography className={styles.userName}>Jane Doe</Typography>
              ) : null}
            </div>
          </div>
        </aside>

        <section className={styles.mainPanel}>
          <div className={styles.topNav}>
            <div className={styles.collapseButtonWrap}>
              <IconButton size="small" className={styles.collapseButton} onClick={toggleSidebar}>
                <MenuOpenIcon />
              </IconButton>
            </div>
            {leftTopMenuItems.map((item) => (
              <Button
                key={item.slug}
                className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
                endIcon={item.hasMenu ? <KeyboardArrowDownIcon className={styles.menuArrowIcon} /> : undefined}
                aria-current={isTopMenuItemActive(item) ? "page" : undefined}
                onClick={(event) => handleTopMenuClick(item, event)}
              >
                {item.label}
              </Button>
            ))}
            <div className={styles.topMenuSpacer} />
            <div className={styles.topMenuRightGroup}>
              {rightTopMenuItems.map((item) => (
                <Button
                  key={item.slug}
                  className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
                  endIcon={<KeyboardArrowDownIcon className={styles.menuArrowIcon} />}
                  aria-current={isTopMenuItemActive(item) ? "page" : undefined}
                  onClick={(event) => handleTopMenuClick(item, event)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <Menu
              anchorEl={topMenuAnchorEl}
              open={Boolean(topMenuAnchorEl)}
              onClose={closeTopMenuDropdown}
              slotProps={{ paper: { className: styles.topMenuDropdownPaper } }}
              MenuListProps={{ className: styles.topMenuDropdownList }}
            >
              {topMenuDropdownOptions.map((option) => (
                <MenuItem
                  key={option.slug}
                  className={`${styles.topMenuDropdownItem} ${
                    option.slug === menuSlug && topMenuDropdownOwnerSlug ? styles.topMenuDropdownItemActive : ""
                  }`}
                  onClick={() => handleTopMenuOptionSelect(option.slug)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </div>

          <div className={styles.contentArea}>
            <div className={styles.breadcrumbs}>
              <Typography className={styles.breadcrumbMuted}>
                {currentSection.label.charAt(0) + currentSection.label.slice(1).toLowerCase()}
              </Typography>
              <ChevronRightIcon className={styles.breadcrumbArrow} />
              {!isContractDetailOpen ? (
                <Typography className={styles.breadcrumbActive}>{currentMenuLabel}</Typography>
              ) : (
                <>
                  <button type="button" className={styles.breadcrumbLinkButton} onClick={closeContractDetail}>
                    {currentMenuLabel}
                  </button>
                  <ChevronRightIcon className={styles.breadcrumbArrow} />
                  {isLineItemDetailOpen ? (
                    <>
                      <button type="button" className={styles.breadcrumbLinkButton} onClick={closeLineItemDetail}>
                        Kontrakt {selectedContractId}
                      </button>
                      <ChevronRightIcon className={styles.breadcrumbArrow} />
                      <Typography className={styles.breadcrumbActive}>
                        Kontraktsrad {selectedLineItemId}
                      </Typography>
                    </>
                  ) : (
                    <Typography className={styles.breadcrumbActive}>
                      Kontrakt {selectedContractId}
                    </Typography>
                  )}
                </>
              )}
            </div>

            {!isContractDetailOpen && isContractListPage ? (
              <>
                <div className={styles.filterRow}>
                  <div className={styles.searchFieldsPanel}>
                    <div className={styles.searchFieldsContainer}>
                      <div className={styles.searchFieldsTopRow}>
                        <div className={styles.searchFieldsContent}>
                      {textSearchFields.length > 0 ? (
                        <div className={styles.searchFieldsGroup}>
                          <div className={styles.searchFieldsGrid}>
                            {textSearchFields.map((field) => (
                              <div key={field.key} className={styles.searchFieldItem}>
                                <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                                <TextField
                                  size="small"
                                  className={styles.searchFieldControl}
                                  value={String(searchValues[field.key] ?? "")}
                                  onChange={(event) => handleSearchTextChange(field.key, event.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectSearchFields.length > 0 ? (
                        <div className={styles.searchFieldsGroup}>
                          <div className={styles.searchFieldsGrid}>
                            {selectSearchFields.map((field) => (
                              <div key={field.key} className={styles.searchFieldItem}>
                                <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                                <Select
                                  size="small"
                                  className={styles.searchFieldControl}
                                  value={String(searchValues[field.key] ?? "")}
                                  onChange={(event) => handleSearchSelectChange(field.key, event)}
                                  IconComponent={KeyboardArrowDownIcon}
                                >
                                  <MenuItem value="">-</MenuItem>
                                  {getSelectOptions(field.key).map((option) => (
                                    <MenuItem key={`${field.key}-${option}`} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {checkboxSearchFields.length > 0 ? (
                        <div className={styles.searchFieldsGroup}>
                          <div className={styles.searchCheckboxGrid}>
                            {checkboxSearchFields.map((field) => (
                              <label key={field.key} className={styles.searchCheckboxItem}>
                                <Checkbox
                                  size="small"
                                  checked={Boolean(searchValues[field.key])}
                                  onChange={(event) =>
                                    handleSearchCheckboxChange(field.key, event.target.checked)
                                  }
                                />
                                <Typography className={styles.searchCheckboxLabel}>
                                  {field.label}
                                </Typography>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {textSearchFields.length === 0 &&
                      selectSearchFields.length === 0 &&
                      checkboxSearchFields.length === 0 ? (
                        <div className={`${styles.searchFieldsGroup} ${styles.searchFieldsEmptyGroup}`}>
                          <Typography className={styles.searchFieldLabel}>
                            Inga filter valda. Öppna Sökfält för att visa filter.
                          </Typography>
                        </div>
                      ) : null}
                        </div>
                      <div className={styles.searchFieldsActions}>
                        <div className={styles.searchMenuWrapper}>
                          <Button
                            ref={searchButtonRef}
                            className={styles.searchActionButton}
                            variant="outlined"
                            startIcon={<SearchIcon className={styles.searchActionIcon} />}
                            onClick={isSearchMenuOpen ? cancelSearchFieldChanges : openSearchMenu}
                          >
                            Sökfält
                          </Button>

                          {isSearchMenuOpen ? (
                            <div className={styles.searchFieldsDropdown} ref={searchMenuRef}>
                              <div className={styles.searchFieldsDropdownList}>
                                {draftSearchFields.map((field) => (
                                  <div key={field.key} className={styles.searchFieldsDropdownRow}>
                                    <button
                                      type="button"
                                      className={styles.searchFieldsDropdownName}
                                      onClick={() => toggleSearchFieldVisibility(field.key)}
                                    >
                                      <Checkbox
                                        size="small"
                                        checked={field.visible}
                                        className={styles.dropdownCheckbox}
                                      />
                                      <Typography className={styles.searchFieldsDropdownLabel}>
                                        {field.label}
                                      </Typography>
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className={styles.columnsDropdownFooter}>
                                <Button className={styles.dropdownSave} size="small" onClick={saveSearchFieldChanges}>
                                  Spara
                                </Button>
                                <Button className={styles.dropdownCancel} size="small" onClick={cancelSearchFieldChanges}>
                                  Avbryt
                                </Button>
                                <Button className={styles.dropdownClear} size="small" onClick={clearSearchFieldChanges}>
                                  Rensa
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.ruleDivider} />

                <div className={styles.actionRow}>
              {actionItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`${styles.actionItem} ${
                    item.requiresSelection && !hasSelectedRows ? styles.actionDisabled : styles.actionEnabled
                  }`}
                >
                  {item.icon}
                  <Typography className={styles.actionLabel}>{item.label}</Typography>
                  {index !== actionItems.length - 1 ? <span className={styles.actionSeparator} /> : null}
                </div>
              ))}
              <div className={`${styles.rightControlRail} ${styles.rightControlGroup}`}>
                <Button
                  className={styles.lineItemsToggleButton}
                  variant="outlined"
                  size="small"
                  onClick={() => setIsLineItemsTableVisible((previous) => !previous)}
                >
                  {isLineItemsTableVisible ? "Dölj rader" : "Visa rader"}
                </Button>

                <div className={styles.columnsMenuWrapper}>
                  <Button
                    ref={columnsButtonRef}
                    className={styles.columnsButton}
                    variant="outlined"
                    size="small"
                    startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
                    onClick={isColumnsMenuOpen ? cancelColumnChanges : openColumnsMenu}
                  >
                    Kolumner
                  </Button>

                  {isColumnsMenuOpen ? (
                    <div className={styles.columnsDropdown} ref={columnsMenuRef}>
                    <div className={styles.columnsDropdownList}>
                      {draftColumns.map((column, index) => (
                        <div key={column.key} className={styles.columnsDropdownRow}>
                          <button
                            type="button"
                            className={styles.columnsDropdownName}
                            onClick={() => toggleColumnVisibility(column.key)}
                          >
                            <Checkbox
                              size="small"
                              checked={column.visible}
                              className={styles.dropdownCheckbox}
                            />
                            <Typography className={styles.columnsDropdownLabel}>
                              {column.label}
                            </Typography>
                          </button>

                          <div className={styles.columnsDropdownActions}>
                            <IconButton
                              size="small"
                              onClick={() => toggleColumnPin(column.key)}
                              className={`${styles.columnsActionIcon} ${column.pinned ? styles.columnsActionPinned : ""}`}
                            >
                              {column.pinned ? (
                                <PushPinIcon fontSize="inherit" />
                              ) : (
                                <PushPinOutlinedIcon fontSize="inherit" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              className={styles.columnsActionIcon}
                              onClick={() => moveColumn(column.key, "up")}
                              disabled={index === 0}
                            >
                              <KeyboardArrowUpIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              className={styles.columnsActionIcon}
                              onClick={() => moveColumn(column.key, "down")}
                              disabled={index === draftColumns.length - 1}
                            >
                              <KeyboardArrowDownIcon fontSize="inherit" />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.columnsDropdownFooter}>
                      <Button className={styles.dropdownSave} size="small" onClick={saveColumnChanges}>
                        Spara
                      </Button>
                      <Button className={styles.dropdownCancel} size="small" onClick={cancelColumnChanges}>
                        Avbryt
                      </Button>
                      <Button className={styles.dropdownClear} size="small" onClick={resetColumnChanges}>
                        Rensa
                      </Button>
                    </div>
                    </div>
                  ) : null}
                </div>
              </div>
                </div>

                <div className={`${styles.tablesLayout} ${isLineItemsTableVisible ? styles.tablesLayoutSplit : ""}`}>
                  <div className={`${styles.tableContainer} ${isLineItemsTableVisible ? styles.tableContainerSplit : ""}`}>
                    <div className={styles.tableScrollWrap}>
                      <div className={styles.tableInner}>
                        <div className={styles.tableHeader}>
                          {orderedVisibleColumns.map((column, columnIndex) => (
                            <Typography
                              key={column.key}
                              className={`${styles.tableHeaderCell} ${
                                columnIndex === 0 ? styles.stickyMainHeaderCell : ""
                              }`}
                            >
                              {column.label}
                            </Typography>
                          ))}
                        </div>

                        {tableRows.map((row, idx) => (
                          <div
                            key={`${row.kontrakt}-${idx}`}
                            className={`${styles.tableRow} ${
                              selectedRowId === idx ? styles.tableRowSelected : ""
                            }`}
                            onClick={() => selectMainTableRow(idx)}
                          >
                            {orderedVisibleColumns.map((column, columnIndex) =>
                              column.key === "kontrakt" ? (
                                <Typography
                                  key={column.key}
                                  className={`${styles.tableCell} ${
                                    columnIndex === 0 ? styles.stickyMainCell : ""
                                  }`}
                                >
                                  <button
                                    type="button"
                                    className={styles.contractLinkButton}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openContractDetail(getCellValue(row, column.key));
                                    }}
                                  >
                                    {getCellValue(row, column.key)}
                                  </button>
                                </Typography>
                              ) : (
                                <Typography
                                  key={column.key}
                                  className={`${styles.tableCell} ${
                                    columnIndex === 0 ? styles.stickyMainCell : ""
                                  }`}
                                >
                                  {getCellValue(row, column.key)}
                                </Typography>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isLineItemsTableVisible ? <div className={styles.tableFiller} /> : null}
                  </div>

                  {isLineItemsTableVisible ? (
                    <div className={`${styles.lineItemsSection} ${styles.lineItemsSectionSplit}`}>
                    <div className={styles.lineItemsHeader}>
                      <Typography className={styles.lineItemsTitle}>Kontraktsrader</Typography>
                      <div className={styles.columnsMenuWrapper}>
                        <Button
                          ref={lineColumnsButtonRef}
                          className={styles.columnsButton}
                          variant="outlined"
                          size="small"
                          startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
                          onClick={isLineColumnsMenuOpen ? cancelLineColumnChanges : openLineColumnsMenu}
                        >
                          Kolumner
                        </Button>

                        {isLineColumnsMenuOpen ? (
                          <div className={styles.columnsDropdown} ref={lineColumnsMenuRef}>
                            <div className={styles.columnsDropdownList}>
                              {draftLineColumns.map((column, index) => (
                                <div key={column.key} className={styles.columnsDropdownRow}>
                                  <button
                                    type="button"
                                    className={styles.columnsDropdownName}
                                    onClick={() => toggleLineColumnVisibility(column.key)}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={column.visible}
                                      className={styles.dropdownCheckbox}
                                    />
                                    <Typography className={styles.columnsDropdownLabel}>
                                      {column.label}
                                    </Typography>
                                  </button>

                                  <div className={styles.columnsDropdownActions}>
                                    <IconButton
                                      size="small"
                                      className={styles.columnsActionIcon}
                                      onClick={() => moveLineColumn(column.key, "up")}
                                      disabled={index === 0}
                                    >
                                      <KeyboardArrowUpIcon fontSize="inherit" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      className={styles.columnsActionIcon}
                                      onClick={() => moveLineColumn(column.key, "down")}
                                      disabled={index === draftLineColumns.length - 1}
                                    >
                                      <KeyboardArrowDownIcon fontSize="inherit" />
                                    </IconButton>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className={styles.columnsDropdownFooter}>
                              <Button className={styles.dropdownSave} size="small" onClick={saveLineColumnChanges}>
                                Spara
                              </Button>
                              <Button className={styles.dropdownCancel} size="small" onClick={cancelLineColumnChanges}>
                                Avbryt
                              </Button>
                              <Button className={styles.dropdownClear} size="small" onClick={resetLineColumnChanges}>
                                Rensa
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.lineItemsTableWrap}>
                      <div className={styles.lineItemsTable}>
                        <div className={styles.lineItemsHeaderRow}>
                          {visibleLineColumns.map((column, columnIndex) => (
                            <Typography
                              key={column.key}
                              className={`${styles.lineItemsHeaderCell} ${
                                columnIndex === 0 ? styles.stickyLineHeaderCell : ""
                              }`}
                            >
                              {column.label}
                            </Typography>
                          ))}
                        </div>

                        {lineItemRows.map((row, index) => (
                          <div key={`line-item-${index}`} className={styles.lineItemsRow}>
                            {visibleLineColumns.map((column, columnIndex) => (
                              column.key === "idRad" ? (
                                <button
                                  key={column.key}
                                  type="button"
                                  className={`${styles.lineItemLinkButton} ${
                                    columnIndex === 0 ? styles.stickyLineCell : ""
                                  }`}
                                  onClick={() => {
                                    return;
                                  }}
                                >
                                  {row[column.key]}
                                </button>
                              ) : (
                                <Typography
                                  key={column.key}
                                  className={`${styles.lineItemsCell} ${
                                    columnIndex === 0 ? styles.stickyLineCell : ""
                                  }`}
                                >
                                  {row[column.key]}
                                </Typography>
                              )
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                ) : null}
                </div>
              </>
            ) : isContractDetailOpen ? (
              <div className={styles.contractDetailPanel}>
                {isLineItemDetailOpen ? (
                  <LineItemDetailView
                    lineItemId={selectedLineItemId}
                    activeTab={activeLineItemTab}
                    onChangeTab={setActiveLineItemTab}
                    onBack={closeLineItemDetail}
                  />
                ) : (
                  <>
                    <div className={styles.contractTabBar}>
                      {contractTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`${styles.contractTabButton} ${
                            activeContractTabForView === tab ? styles.contractTabButtonActive : ""
                          }`}
                          onClick={() => handleContractTabChange(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activeContractTabForView !== "Kontraktsrader" ? (
                      <div className={styles.contractDetailHeader}>
                        <Typography className={styles.contractDetailTitle}>
                          Kontrakt {selectedContractId}
                        </Typography>
                        <div className={styles.contractDetailHeaderActions}>
                          <Button className={styles.contractSaveButton} size="small">
                            Spara
                          </Button>
                          <button type="button" className={styles.contractHeaderLink}>
                            Granska kontrakt
                          </button>
                          <button type="button" className={styles.contractHeaderLink}>
                            Orderbekräftelse
                          </button>
                          <button type="button" className={styles.contractHeaderDots}>
                            ...
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {activeContractTabForView === "Översikt" ? <OverviewTab contractId={selectedContractId ?? "163311"} /> : null}
                    {activeContractTabForView === "Villkor" ? <TermsTab /> : null}
                    {activeContractTabForView === "Leverans" ? <DeliveryTab /> : null}
                    {activeContractTabForView === "Kontraktsrader" ? (
                      <ContractRowsTab
                        visibleColumns={visibleLineColumns}
                        rows={lineItemRows}
                        draftColumns={draftLineColumns}
                        isColumnsMenuOpen={isLineColumnsMenuOpen}
                        columnsMenuRef={lineColumnsMenuRef}
                        columnsButtonRef={lineColumnsButtonRef}
                        onOpenColumnsMenu={openLineColumnsMenu}
                        onCancelColumnsMenu={cancelLineColumnChanges}
                        onToggleColumnVisibility={(key) =>
                          toggleLineColumnVisibility(key as LineItemColumnKey)
                        }
                        onMoveColumn={(key, direction) =>
                          moveLineColumn(key as LineItemColumnKey, direction)
                        }
                        onSaveColumnChanges={saveLineColumnChanges}
                        onResetColumnChanges={resetLineColumnChanges}
                        onOpenRowDetail={openLineItemDetail}
                      />
                    ) : null}
                    {activeContractTabForView === "Frakt" ? <FreightTab /> : null}
                    {activeContractTabForView === "Avrop" ? <CallOffTab /> : null}
                    {activeContractTabForView === "Dokument" ? <DocumentsTab /> : null}
                    {activeContractTabForView === "Utskriftsalternativ" ? <PrintOptionsTab /> : null}
                  </>
                )}
              </div>
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
                      onChange={toggleMode}
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
          </div>
        </section>
      </div>
    </main>
  );
}

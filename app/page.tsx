"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DvrOutlinedIcon from "@mui/icons-material/DvrOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Button,
  Checkbox,
  CircularProgress,
  MenuItem,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { type NewContractDraft } from "./components/ContractCreateView";
import { type LineItemDetailTab, type NewLineItemDraft } from "./components/contract-tabs/LineItemDetailView";
import {
  AppShellLayout,
  ContractDetailView,
  ContractListView,
  CustomerListView,
  DeliveryListView,
  HomeView,
  PriceListDetailView,
  PriceListRowDetailView,
  PriceListView
} from "./components/views";
import { CustomerDetailView, type CustomerDetailData } from "./components/CustomerDetailView";
import { CustomerCreateView } from "./components/CustomerCreateView";
import { PriceListCreateView } from "./components/PriceListCreateView";
import { AvropsradDetailView } from "./components/contract-tabs/AvropsradDetailView";
import { ContainerView } from "./components/contract-tabs/ContainerView";
import { PrislistekalkylView } from "./components/price-list-tabs/PrislistekalkylView";
import { SearchFiltersPanel } from "./components/shared/SearchFiltersPanel";
import { DataTable } from "./components/shared/DataTable";
import { ActionRow } from "./components/shared/ActionRow";
import { useColorMode, useUiState } from "./providers";
import styles from "./page.module.scss";

type SectionKey = "hem" | "marknad" | "produktion" | "leverans" | "rapporter" | "systemhantering" | "system";

// Remembers the line item ID to return to when saving an avropsrad (null = came from contract Avrop tab).
// Not affected by StrictMode double-invoke since it's only written/read in event handlers.
let _savedReturnLineItemId: string | null = null;
let _savedAvropsradEditData: Record<string, string> | null = null;

type TopMenuItemDef = {
  slug: string;
  label: string;
  hasMenu?: boolean;
  alignRight?: boolean;
  options?: Array<{ slug: string; label: string; href?: string; endIcon?: "open_in_new" }>;
};

const sectionDefinitions: Array<{
  slug: SectionKey;
  label: string;
  icon: ReactNode;
  defaultMenuSlug: string;
}> = [
    { slug: "hem", label: "Hem", icon: <HomeOutlinedIcon fontSize="small" />, defaultMenuSlug: "start" },
    { slug: "marknad", label: "Marknad", icon: <StorefrontOutlinedIcon fontSize="small" />, defaultMenuSlug: "kontraktlista" },
    { slug: "produktion", label: "Produktion", icon: <FactoryOutlinedIcon fontSize="small" />, defaultMenuSlug: "oversikt" },
    { slug: "leverans", label: "Leverans", icon: <LocalShippingOutlinedIcon fontSize="small" />, defaultMenuSlug: "planering" },
    { slug: "rapporter", label: "Rapporter", icon: <AssessmentOutlinedIcon fontSize="small" />, defaultMenuSlug: "dashboard" },
    { slug: "systemhantering", label: "System", icon: <DvrOutlinedIcon fontSize="small" />, defaultMenuSlug: "oversikt" },
    { slug: "system", label: "Inställningar", icon: <SettingsOutlinedIcon fontSize="small" />, defaultMenuSlug: "installningar" }
  ];

const topMenusBySection: Record<SectionKey, TopMenuItemDef[]> = {
  hem: [
    { slug: "start", label: "Hem" }
  ],
  marknad: [
    { slug: "kundlista", label: "Kundlista" },
    { slug: "prislistor", label: "Prislistor" },
    { slug: "kontraktlista", label: "Kontraktlista" },
    { slug: "leveranslista", label: "Leveranslista" },
    { slug: "klar-sok", label: "Klar sök" },
    {
      slug: "e-handel",
      label: "E-handel",
      hasMenu: true,
      alignRight: true,
      options: [
        { slug: "ehandel-lista", label: "E-handelslista" },
        { slug: "edi-lista", label: "EDI-lista" }
      ]
    },
    {
      slug: "affar",
      label: "Affär",
      hasMenu: true,
      alignRight: true,
      options: [
        { slug: "saljstod", label: "Säljstöd" },
        {
          slug: "riktlinjer-leveransvillkor",
          label: "Riktlinjer leveransvillkor",
          href: "https://canea.ad.norraskog.se/Document/Published/2853",
          endIcon: "open_in_new"
        },
        {
          slug: "checklista-ny-kund",
          label: "Checklista ny kund",
          href: "https://canea.ad.norraskog.se/Document/Published/2933",
          endIcon: "open_in_new"
        }
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
  systemhantering: [
    { slug: "oversikt", label: "Översikt" },
    { slug: "komponenter", label: "Komponenter" },
    { slug: "loggar", label: "Loggar" }
  ],
  system: [
    { slug: "installningar", label: "Inställningar" },
    { slug: "anvandare", label: "Användare" },
    { slug: "integrationer", label: "Integrationer" }
  ]
};

const actionItems = [
  { label: "Kontrakt", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Kopiera", icon: <ContentCopyIcon fontSize="small" />, requiresSelection: true },
  { label: "Inaktivera", icon: <BlockOutlinedIcon fontSize="small" />, requiresSelection: true }
];

const fakeCompanies = [
  "BP Hammerdal Byggprodukter",
  "BP Hissmofors Byggprodukter",
  "BP Kåge Byggprodukter",
  "Huvudkontor",
  "NT Hissmofors Såg",
  "NT Kåge Såg",
  "NT Stolpfabrik Agnäs",
  "NT Sävar Såg"
];

const contractTabs = [
  "Kontraktsrader",
  "Tillägg",
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
  | "levVolym"
  | "olevVolym"
  | "avropatProcent"
  | "prislistaNr"
  | "utlastningssparr"
  | "tillhor"
  | "limit"
  | keyof NewContractDraft;

type ColumnConfig = {
  key: ColumnKey;
  label: string;
  visible: boolean;
  pinned: boolean;
  width?: number;
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
  | "radKommentar"
  | "valuta"
  | "kontraktsrest"
  | "nettolager"
  | "nettoPrisM3"
  | keyof NewLineItemDraft;

type LineItemColumnConfig = {
  key: LineItemColumnKey;
  label: string;
  visible: boolean;
  pinned: boolean;
};

type LineItemRow = Record<string, string>;

type TableRow = {
  kontrakt: string;
  externNr: string;
  belopp: string;
  artNr?: string;
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
  olevVolym?: string;
  avropatProcent?: string;
  prislistaNr?: string;
  utlastningssparr?: string;
  tillhor?: string;
  limit?: string;
  limitStatus?: "ok" | "warning" | "error";
} & Partial<Record<keyof NewContractDraft, string>>;

type SearchFieldKey =
  | "typ"
  | "kontraktsNr"
  | "externtKontraktsnr"
  | "kontraktsdatumFran"
  | "kontraktsdatumTill"
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
  | "avtalsrattSaknasI"
  ;

type SearchFieldConfig = {
  key: SearchFieldKey;
  label: string;
  control: "text" | "select" | "checkbox";
  visible: boolean;
  favorite: boolean;
};

const defaultSearchFields: SearchFieldConfig[] = [
  { key: "artNr", label: "ArtNr", control: "select", visible: false, favorite: false },
  { key: "certifiering", label: "Certifiering", control: "select", visible: false, favorite: false },
  { key: "bolag", label: "Enhet", control: "select", visible: false, favorite: false },
  { key: "externtKontraktsnr", label: "Externt kontraktsnr", control: "text", visible: true, favorite: false },
  { key: "kategori", label: "Kategori", control: "select", visible: false, favorite: false },
  { key: "kontraktsNr", label: "KontraktsNr", control: "text", visible: true, favorite: true },
  { key: "kontraktsdatumFran", label: "Kontraktsdatum från", control: "text", visible: false, favorite: false },
  { key: "kontraktsdatumTill", label: "Kontraktsdatum till", control: "text", visible: false, favorite: false },
  { key: "kund", label: "Kund", control: "select", visible: false, favorite: true },
  { key: "land", label: "Land", control: "select", visible: false, favorite: false },
  { key: "mottagarland", label: "Mottagarland", control: "select", visible: false, favorite: false },
  { key: "prislistaNr", label: "Prislista nr", control: "text", visible: false, favorite: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: false, favorite: false },
  { key: "typ", label: "Typ", control: "select", visible: true, favorite: true },
  { key: "upprattatAv", label: "Registrerad av", control: "select", visible: false, favorite: true },
  { key: "varningsnivaFordran", label: "Varningsnivå fordran", control: "select", visible: false, favorite: false },
  { key: "varningsnivaLimit", label: "Varningsnivå limit", control: "select", visible: false, favorite: false }
];

const selectOptionsByField: Partial<Record<SearchFieldKey, string[]>> = {
  typ: ["Aktivt kontrakt", "Inaktivt kontrakt", "Alla kontrakt"],
  artNr: ["22120", "22121", "22122", "22123", "22124", "22125"],
  kund: [
    "Acme AB",
    "Globex Corp",
    "Initech HB",
    "Nordic Sten & Mark AB",
    "Luna Infrastruktur AB",
    "Skandinavisk Industriservice"
  ],
  bolag: ["BP Hissmofors Byg", "BP Team Syd", "BP Region Norr"],
  upprattatAv: ["Jane Doe", "Erik Andersson"],
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
  kontraktsdatumFran: "",
  kontraktsdatumTill: "",
  artNr: "",
  kund: "",
  kategori: "",
  land: "",
  mottagarland: "",
  bolag: "",
  upprattatAv: "",
  prislistaNr: "",
  certifiering: "",
  tillhor: "",
  varningsnivaFordran: "",
  varningsnivaLimit: "",
  avtalsrattSaknasI: ""
};

const CONTRACT_CREATE_FIELD_COLUMNS: Array<{ key: keyof NewContractDraft; label: string }> = [
  { key: "customer", label: "Kund (skapafält)" },
  { key: "status", label: "Status (skapafält)" },
  { key: "createdBy", label: "Skapad av" },
  { key: "contractDate", label: "Kontraktsdatum (skapafält)" },
  { key: "language", label: "Språk" },
  { key: "currency", label: "Valuta" },
  { key: "paymentTerms", label: "Betalningsvillkor" },
  { key: "certification", label: "Certifiering (skapafält)" },
  { key: "contractForm", label: "Kontraktsform" },
  { key: "deliveryMethod", label: "Leveransmetod" },
  { key: "deliveryTerms", label: "Leveransvillkor" },
  { key: "deliveryTermsCity", label: "Leveransvillkor ort" },
  { key: "agent1", label: "Agent 1" },
  { key: "agent1Pct", label: "Agent 1 %" },
  { key: "deliveryLocation", label: "Leveransort (skapafält)" },
  { key: "deliveryLocationPostalCode", label: "Leveransort postnr" },
  { key: "customerRef", label: "Kundreferens" },
  { key: "priceList", label: "Prislista (skapafält)" },
  { key: "externalContractNumber", label: "Externt kontraktsnr (skapafält)" },
  { key: "priceAdjustPct", label: "Prisjustering %" },
  { key: "category", label: "Kategori (skapafält)" },
  { key: "country", label: "Land (skapafält)" },
  { key: "contractType", label: "Kontraktstyp" },
  { key: "validUntil", label: "Giltig t.o.m. (skapafält)" },
  { key: "miscNote", label: "Extern notering" },
  { key: "internalNote", label: "Intern notering" },
  { key: "exchangeRateDate", label: "Valutakursdatum" },
  { key: "vat", label: "Moms %" },
  { key: "exchangeRate", label: "Valutakurs" },
  { key: "paymentTermsDays", label: "Betalningsvillkor dagar" },
  { key: "cashDiscount", label: "Kassarabatt" },
  { key: "bonus", label: "Bonus" },
  { key: "bonusBase", label: "Bonusgrund" },
  { key: "pickingSurchargeMin", label: "Plocktillägg min" },
  { key: "pickingSurchargePct", label: "Plocktillägg %" },
  { key: "paintingSurcharge", label: "Målningstillägg" },
  { key: "paintingSurchargeThreshold", label: "Målningstillägg tröskel" },
  { key: "importFee", label: "Importavgift" },
  { key: "consignmentStock", label: "Konsignationslager" },
  { key: "receiverCountry", label: "Mottagarland (skapafält)" },
  { key: "deliveryPeriod", label: "Leveransperiod (skapafält)" },
  { key: "deliveryAddress", label: "Leveransadress (skapafält)" },
  { key: "unloadingPhone", label: "Telefon lossning" },
  { key: "unloadingHours", label: "Öppettider lossning" },
  { key: "notificationPhone", label: "Aviseringstelefon" },
  { key: "notificationInfo", label: "Aviseringsinformation" },
];

const baseContractColumns: ColumnConfig[] = [
  { key: "kontrakt", label: "Kontraktsnr", visible: true, pinned: false },
  { key: "externNr", label: "Externt kontraktsnr", visible: true, pinned: false },
  { key: "belopp", label: "Belopp SEK", visible: true, pinned: false },
  { key: "kund", label: "Kund", visible: true, pinned: false },
  { key: "land", label: "Land", visible: true, pinned: false },
  { key: "kontraktsdatum", label: "Kontraktsdatum", visible: true, pinned: false },
  { key: "giltigTom", label: "Giltig t.o.m.", visible: true, pinned: false },
  { key: "egenAnmarkning", label: "Egen anmärkning", visible: true, pinned: false },
  { key: "status", label: "Status", visible: true, pinned: false },
  { key: "leveransperiod", label: "Leveransperiod", visible: true, pinned: false },
  { key: "upprattatAv", label: "Registrerad av", visible: true, pinned: false },
  { key: "kontraktsvolym", label: "Kontraktsvolym", visible: true, pinned: false },
  { key: "levVolym", label: "Lev volym", visible: true, pinned: false },
  { key: "olevVolym", label: "Rest", visible: true, pinned: false },
  { key: "avropatProcent", label: "Avropat %", visible: true, pinned: false },
  { key: "prislistaNr", label: "Prislista nr", visible: true, pinned: false },
  { key: "utlastningssparr", label: "Utlastningsspärr", visible: true, pinned: false },
  { key: "tillhor", label: "Tillhör", visible: true, pinned: false },
  { key: "limit", label: "Limit", visible: true, pinned: false }
];

const CONTRACT_COLUMN_DEFAULT_WIDTHS: Partial<Record<ColumnKey, number>> = {
  kontrakt: 138,
  externNr: 178,
  belopp: 130,
  kund: 230,
  land: 90,
  kontraktsdatum: 132,
  giltigTom: 126,
  status: 120,
  leveransperiod: 146,
  upprattatAv: 156,
  limit: 132,
};

const defaultColumns: ColumnConfig[] = [
  ...baseContractColumns.map((column) => ({
    ...column,
    width: CONTRACT_COLUMN_DEFAULT_WIDTHS[column.key],
  })),
  ...CONTRACT_CREATE_FIELD_COLUMNS
    .filter(({ key }) => !baseContractColumns.some((column) => column.key === key))
    .map(({ key, label }) => ({ key, label, visible: false, pinned: false, width: CONTRACT_COLUMN_DEFAULT_WIDTHS[key] })),
];

const LIMIT_DATA: Array<{ limit: string; limitStatus: "ok" | "warning" | "error" }> = [
  { limit: "500 000 SEK", limitStatus: "ok" },
  { limit: "1 200 000 SEK", limitStatus: "ok" },
  { limit: "350 000 SEK", limitStatus: "error" },
  { limit: "800 000 SEK", limitStatus: "warning" },
  { limit: "2 100 000 SEK", limitStatus: "ok" },
  { limit: "660 000 SEK", limitStatus: "warning" },
];

const CONTRACT_IDS = ["163311", "163452", "163518", "163601", "163744", "163890"] as const;

const CONTRACT_CUSTOMERS = [
  "Acme AB",
  "Globex Corp",
  "Initech HB",
  "Nordic Sten & Mark AB",
  "Luna Infrastruktur AB",
  "Skandinavisk Industriservice"
] as const;

const CUSTOMER_DETAILS: Record<string, CustomerDetailData> = {
  "Acme AB": {
    customerNumber: "K-1001",
    organizationNumber: "556101-1001",
    country: "SE",
    city: "Stockholm",
    primaryContact: "Anna Ek",
    accountManager: "Jane Doe",
    email: "inkop@acme.se",
    phone: "08-120 45 100",
    activeContracts: "14",
    priceList: "PL-202600",
    creditLimit: "500 000 SEK",
    limitStatus: "ok",
    comment: "Strategisk kund med löpande projektleveranser och hög prognosprecision.",
    kortnamn: "ACME",
    tillhor: "Marknad Nord",
    giltiFran: "2022-01-01",
    giltigTom: "2027-12-31",
    skapadAv: "Jane Doe",
    skapad: "2022-01-15 08:45",
    andradAv: "Jane Doe",
    andrad: "2026-03-10 14:22"
  },
  "Globex Corp": {
    customerNumber: "K-1002",
    organizationNumber: "556101-1002",
    country: "NO",
    city: "Oslo",
    primaryContact: "Martin Holm",
    accountManager: "Erik Andersson",
    email: "procurement@globex.no",
    phone: "+47 22 44 10 20",
    activeContracts: "9",
    priceList: "PL-202601",
    creditLimit: "1 200 000 SEK",
    limitStatus: "ok",
    comment: "Kräver engelska dokument och samlad avisering inför varje delleverans.",
    kortnamn: "GLOBEX",
    tillhor: "Marknad Export",
    giltiFran: "2021-06-01",
    giltigTom: "2027-05-31",
    skapadAv: "Erik Andersson",
    skapad: "2021-06-03 10:10",
    andradAv: "Erik Andersson",
    andrad: "2026-01-20 09:05"
  },
  "Initech HB": {
    customerNumber: "K-1003",
    organizationNumber: "969701-1003",
    country: "FI",
    city: "Vasa",
    primaryContact: "Sara Lind",
    accountManager: "Jane Doe",
    email: "orders@initech.fi",
    phone: "+358 10 320 4400",
    activeContracts: "6",
    priceList: "PL-202602",
    creditLimit: "350 000 SEK",
    limitStatus: "error",
    comment: "Limitöverskridande kund. Kontrollera godkännande innan ny order släpps vidare.",
    kortnamn: "INITECH",
    tillhor: "Marknad Export",
    giltiFran: "2023-03-01",
    giltigTom: "2026-06-30",
    skapadAv: "Jane Doe",
    skapad: "2023-03-05 11:30",
    andradAv: "Jane Doe",
    andrad: "2026-04-02 15:48"
  },
  "Nordic Sten & Mark AB": {
    customerNumber: "K-1004",
    organizationNumber: "556101-1004",
    country: "SE",
    city: "Östersund",
    primaryContact: "Per Lund",
    accountManager: "Erik Andersson",
    email: "bestallning@nordicstenmark.se",
    phone: "063-440 18 00",
    activeContracts: "11",
    priceList: "PL-202603",
    creditLimit: "800 000 SEK",
    limitStatus: "warning",
    comment: "Föredrar leveransfönster tisdag till torsdag och avisering senast dagen före.",
    kortnamn: "NSM",
    tillhor: "Marknad Nord",
    giltiFran: "2020-09-01",
    giltigTom: "2026-12-31",
    skapadAv: "Erik Andersson",
    skapad: "2020-09-10 13:00",
    andradAv: "Erik Andersson",
    andrad: "2025-11-18 10:34"
  },
  "Luna Infrastruktur AB": {
    customerNumber: "K-1005",
    organizationNumber: "556101-1005",
    country: "SE",
    city: "Sundsvall",
    primaryContact: "Elin Nyberg",
    accountManager: "Jane Doe",
    email: "inkop@lunainfra.se",
    phone: "060-220 45 10",
    activeContracts: "18",
    priceList: "PL-202604",
    creditLimit: "2 100 000 SEK",
    limitStatus: "ok",
    comment: "Stor kund med flera parallella projekt. Samordna prislista och kontraktsförlängningar.",
    kortnamn: "LUNA",
    tillhor: "Marknad Nord",
    giltiFran: "2019-01-01",
    giltigTom: "2027-03-31",
    skapadAv: "Jane Doe",
    skapad: "2019-01-07 08:15",
    andradAv: "Jane Doe",
    andrad: "2026-02-28 16:00"
  },
  "Skandinavisk Industriservice": {
    customerNumber: "K-1006",
    organizationNumber: "556101-1006",
    country: "DK",
    city: "Aarhus",
    primaryContact: "Mikkel Bredahl",
    accountManager: "Erik Andersson",
    email: "orders@skandiservice.dk",
    phone: "+45 86 11 42 30",
    activeContracts: "7",
    priceList: "PL-202605",
    creditLimit: "660 000 SEK",
    limitStatus: "warning",
    comment: "Kund med tät uppföljning på leveransprecision och månatlig avstämning av limit.",
    kortnamn: "SKIS",
    tillhor: "Marknad Export",
    giltiFran: "2021-11-01",
    giltigTom: "2026-12-31",
    skapadAv: "Erik Andersson",
    skapad: "2021-11-03 09:20",
    andradAv: "Erik Andersson",
    andrad: "2026-05-05 11:11"
  }
};

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

const tableRows: TableRow[] = Array.from({ length: 6 }).map((_, idx) => ({
  kontrakt: CONTRACT_IDS[idx % CONTRACT_IDS.length],
  externNr: `2026/${String(idx + 1).padStart(2, "0")} REG ${idx + 2}`,
  belopp: `${(26651 + idx * 7450).toLocaleString("sv-SE")}`,
  artNr: `22${120 + idx}`,
  kund: CONTRACT_CUSTOMERS[idx % CONTRACT_CUSTOMERS.length],
  land: idx % 4 === 0 ? "SE" : idx % 4 === 1 ? "NO" : idx % 4 === 2 ? "FI" : "DK",
  kontraktsdatum: `2026-0${(idx % 5) + 1}-0${(idx % 7) + 1}`,
  giltigTom: `2026-12-${String(10 + idx).padStart(2, "0")}`,
  egenAnmarkning: idx === 0 ? "Ny kund" : idx === 3 ? "Kreditkontroll" : "",
  status: idx === 5 ? "Inaktivt kontrakt" : "Aktivt kontrakt",
  leveransperiod: idx % 3 === 0 ? "Q1-Q2" : idx % 3 === 1 ? "Q2-Q3" : "Q3-Q4",
  upprattatAv: idx % 2 === 0 ? "Jane Doe" : "Erik Andersson",
  kontraktsvolym: `${10 + idx}`,
  levVolym: `${4 + idx}`,
  olevVolym: `${6}`,
  avropatProcent: `${Math.round(((4 + idx) / (10 + idx)) * 100)}%`,
  prislistaNr: `PL-${202600 + idx}`,
  utlastningssparr: idx % 4 === 0 ? "Ja" : "Nej",
  tillhor: idx % 2 === 0 ? "Marknad Nord" : "Marknad Syd",
  limit: LIMIT_DATA[idx % LIMIT_DATA.length].limit,
  limitStatus: LIMIT_DATA[idx % LIMIT_DATA.length].limitStatus,
  customer: CONTRACT_CUSTOMERS[idx % CONTRACT_CUSTOMERS.length],
  createdBy: idx % 2 === 0 ? "Jane Doe" : "Erik Andersson",
  contractDate: `2026-0${(idx % 5) + 1}-0${(idx % 7) + 1}`,
  language: idx % 2 === 0 ? "Svenska" : "English",
  currency: idx % 3 === 0 ? "SEK" : idx % 3 === 1 ? "EUR" : "NOK",
  paymentTerms: idx % 2 === 0 ? "30 dagar netto" : "14 dagar netto",
  certification: idx % 2 === 0 ? "FSC" : "PEFC",
  contractForm: "Standard",
  deliveryMethod: idx % 2 === 0 ? "Hämta" : "Leverans",
  deliveryTerms: "FCA",
  deliveryTermsCity: ["Krokom", "Göteborg", "Stockholm"][idx % 3],
  agent1: idx % 2 === 0 ? "Nordic Agent AB" : "",
  agent1Pct: idx % 2 === 0 ? "2" : "0",
  deliveryLocation: ["Krokom", "Sävar", "Kåge"][idx % 3],
  deliveryLocationPostalCode: ["835 32", "918 32", "934 32"][idx % 3],
  customerRef: `REF-${idx + 1}`,
  priceList: `PL-${202600 + idx}`,
  externalContractNumber: `EXT-${2026}${String(idx + 1).padStart(3, "0")}`,
  priceAdjustPct: idx % 2 === 0 ? "0" : "1.5",
  category: idx % 2 === 0 ? "Bygghandel" : "Industri",
  country: idx % 4 === 0 ? "SE" : idx % 4 === 1 ? "NO" : idx % 4 === 2 ? "FI" : "DK",
  contractType: "Försäljningskontrakt",
  validUntil: `2026-12-${String(10 + idx).padStart(2, "0")}`,
  miscNote: idx === 0 ? "Prioriterad kund" : "",
  internalNote: idx === 3 ? "Kreditkontroll krävs" : "",
  exchangeRateDate: "2026-01-01",
  vat: "25",
  exchangeRate: idx % 3 === 0 ? "1" : idx % 3 === 1 ? "11.35" : "10.05",
  paymentTermsDays: idx % 2 === 0 ? "30" : "14",
  cashDiscount: "",
  bonus: "",
  bonusBase: "Bruttovärde",
  pickingSurchargeMin: "",
  pickingSurchargePct: "",
  paintingSurcharge: "",
  paintingSurchargeThreshold: "",
  importFee: "",
  consignmentStock: idx % 2 === 0 ? "Nej" : "Ja",
  receiverCountry: idx % 4 === 0 ? "SE" : idx % 4 === 1 ? "NO" : idx % 4 === 2 ? "FI" : "DK",
  deliveryPeriod: idx % 3 === 0 ? "Q1-Q2" : idx % 3 === 1 ? "Q2-Q3" : "Q3-Q4",
  deliveryAddress: [
    "Industrigatan 12, 835 32 Krokom",
    "Hamnvägen 1, 918 32 Sävar",
    "Terminalvägen 2, 934 32 Kåge",
  ][idx % 3],
  unloadingPhone: "063-000 00 00",
  unloadingHours: "07:00-16:00",
  notificationPhone: "070-000 00 00",
  notificationInfo: "Avisera 24h innan leverans",
}));

const LINE_ITEM_CREATE_FIELD_COLUMNS: Array<{ key: keyof NewLineItemDraft; label: string }> = [
  { key: "senderCompany", label: "Säljande bolag" },
  { key: "senderWarehouse", label: "Säljande lager" },
  { key: "responsibleCompany", label: "Ansvarig enhet" },
  { key: "priceList", label: "Prislista (rad)" },
  { key: "certification", label: "Certifiering (rad)" },
  { key: "contractNumber", label: "Kontraktsnummer (rad)" },
  { key: "nobbNumber", label: "NOBB-nummer" },
  { key: "artNr", label: "Art.nr" },
  { key: "deliverArtNr", label: "Leverera art.nr" },
  { key: "product", label: "Produkt (rad)" },
  { key: "deliverProduct", label: "Leverera produkt" },
  { key: "invoiceText", label: "Fakturatext" },
  { key: "packageType", label: "Pakettyp" },
  { key: "deliverPackageType", label: "Leverera pakettyp" },
  { key: "length", label: "Längd (rad)" },
  { key: "packaging", label: "Emballage" },
  { key: "bundle", label: "Bunt" },
  { key: "vflGroup", label: "VFL-grupp" },
  { key: "quantity", label: "Mängd (rad)" },
  { key: "volume", label: "Volym (rad)" },
  { key: "orderedUnit", label: "Beställd enhet" },
  { key: "finalVolume", label: "Slutlig volym" },
  { key: "invoiceUnit", label: "Fakturaenhet" },
  { key: "adjustedPrice", label: "Justerat pris" },
  { key: "price", label: "Pris (rad)" },
  { key: "amount", label: "Belopp (rad)" },
  { key: "sponsorship", label: "Sponsring" },
  { key: "sponsoredAmount", label: "Sponsrat belopp" },
  { key: "caneaAgreementNumber", label: "CANEA-avtalsnummer" },
  { key: "pickingSurchargeEnabled", label: "Plocktillägg aktivt" },
  { key: "pickingSurchargeQuantity", label: "Plocktillägg kvantitet" },
  { key: "salesType", label: "Säljtyp" },
  { key: "status", label: "Status (rad)" },
  { key: "deliveryWeek", label: "Leveransvecka (rad)" },
  { key: "deliveryDay", label: "Leveransdag" },
  { key: "deliveryPeriodDocument", label: "Leveransperiod dokument" },
  { key: "deliveryWindowMin", label: "Lev tidigast" },
  { key: "deliveryWindowMax", label: "Lev senast" },
  { key: "internalComment", label: "Intern kommentar (rad)" },
  { key: "externalComment", label: "Extern kommentar (rad)" },
  { key: "showOnInvoice", label: "Visa på faktura" },
  { key: "customerComment", label: "Kundkommentar" },
  { key: "customerBrand", label: "Kundens märke" },
  { key: "recipientBrand", label: "Godsmottagarens märke" },
  { key: "callOffStatus", label: "Avropsstatus" },
];

const baseLineItemColumns: LineItemColumnConfig[] = [
  { key: "idRad", label: "KontraktsradsID", visible: true, pinned: true },
  { key: "status", label: "Status", visible: true, pinned: false },
  { key: "senderCompany", label: "Utlastande enhet", visible: true, pinned: false },
  { key: "artikelNr", label: "ArtNr", visible: true, pinned: false },
  { key: "produkt", label: "Produkt", visible: true, pinned: false },
  { key: "packageType", label: "Pakettyp", visible: true, pinned: false },
  { key: "langd", label: "Längd", visible: true, pinned: false },
  { key: "mangd", label: "Mängd", visible: true, pinned: false },
  { key: "orderedUnit", label: "Beställd enhet", visible: true, pinned: false },
  { key: "enhet", label: "Faktura enhet", visible: true, pinned: false },
  { key: "aPris", label: "À-pris", visible: true, pinned: false },
  { key: "valuta", label: "Valuta", visible: true, pinned: false },
  { key: "volym", label: "Kontraktsvolym", visible: true, pinned: false },
  { key: "leverans", label: "Lev", visible: true, pinned: false },
  { key: "kontraktsrest", label: "Kontraktsrest", visible: true, pinned: false },
  { key: "internalComment", label: "Intern kommentar", visible: true, pinned: false },
  { key: "externalComment", label: "Extern kommentar", visible: true, pinned: false },
  { key: "deliveryPeriodDocument", label: "Levperiod", visible: true, pinned: false },
  { key: "deliveryWeek", label: "Levvecka", visible: true, pinned: false },
  { key: "deliveryDay", label: "Levdag", visible: true, pinned: false },
  { key: "salesType", label: "Säljtyp", visible: true, pinned: false },
  { key: "responsibleCompany", label: "Ansvarig enhet", visible: true, pinned: false },
  { key: "priceList", label: "Prislista", visible: true, pinned: false },
  { key: "nettoSek", label: "Belopp SEK", visible: true, pinned: false },
  { key: "adjustedPrice", label: "Prisjust", visible: true, pinned: false },
  { key: "vflGroup", label: "VFL grupp", visible: true, pinned: false },
  { key: "senderWarehouse", label: "Utlastande lagerställe", visible: true, pinned: false },
  { key: "lager", label: "Lager", visible: true, pinned: false },
  { key: "nettolager", label: "Nettolager", visible: true, pinned: false },
  { key: "nettoPrisM3", label: "Nettopris/m3", visible: true, pinned: false },
];

const defaultLineItemColumns: LineItemColumnConfig[] = [
  ...baseLineItemColumns,
  ...LINE_ITEM_CREATE_FIELD_COLUMNS
    .filter(({ key }) => !baseLineItemColumns.some((column) => column.key === key))
    .map(({ key, label }) => ({ key, label, visible: false, pinned: false })),
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
  radKommentar: idx % 3 === 0 ? "Extra kap tillägg" : "-",
  senderCompany: "BP Hissmofors Byggprodukter",
  senderWarehouse: ["Krokom", "Sävar", "Kåge"][idx % 3],
  responsibleCompany: "BP Hissmofors Byggprodukter",
  priceList: `PL-${202600 + (idx % 6)}`,
  certification: idx % 2 === 0 ? "FSC" : "Ocertifierat",
  contractNumber: CONTRACT_IDS[idx % CONTRACT_IDS.length],
  comboPackageNumber: "",
  nobbNumber: `NOBB-${700000 + idx}`,
  artNr: `22${120 + idx}`,
  deliverArtNr: `22${120 + idx}`,
  product: ["Gran flisad spå", "Furu hyvlad", "Gran v-styrp"][idx % 3],
  deliverProduct: "",
  invoiceText: "",
  packageType: "Lp",
  deliverPackageType: "",
  length: ["4.2", "5.1", "3.6"][idx % 3],
  packaging: "",
  bundle: "",
  vflGroup: "",
  quantity: `${(idx + 2) * 2}`,
  volume: `${(idx + 1) * 0.8}`,
  orderedUnit: "m3 nominell",
  finalVolume: `${((idx + 1) * 0.8 * 0.9).toFixed(2)}`,
  invoiceUnit: "m3 nominell",
  adjustedPrice: "0",
  price: `${(8 + idx * 0.7).toFixed(2)} SEK`,
  amount: `${9200 + idx * 380}`,
  sponsorship: "",
  sponsoredAmount: "0",
  caneaAgreementNumber: "",
  pickingSurchargeEnabled: idx % 3 === 0 ? "Ja" : "Nej",
  pickingSurchargeQuantity: idx % 3 === 0 ? "1" : "0",
  salesType: "Eget virke",
  deliveryWeek: "2025/50",
  deliveryDay: "",
  deliveryPeriodDocument: "",
  deliveryWindowMin: "2025-12-05",
  deliveryWindowMax: "2025-12-10",
  internalComment: "",
  externalComment: "",
  showOnInvoice: "Nej",
  customerComment: "",
  customerBrand: "",
  recipientBrand: "",
  callOffStatus: "Sales planned",
  valuta: "SEK",
  kontraktsrest: `${(idx + 1) * 10}`,
  nettolager: `${(idx + 5) * 100}`,
  nettoPrisM3: `${(850 + idx * 12).toFixed(2)}`,
}));

// ─── Customer list ────────────────────────────────────────────────────────────

type CustomerSearchFieldKey =
  | "kundnr" | "fakturanamn" | "kortnamn" | "postadress" | "land" | "hyvelprofil" | "kategori"
  | "tillhor" | "orgNr" | "vatNr" | "varningsnivaFordran" | "varningsnivaLimit"
  | "kundansvarig" | "saljare" | "agent" | "limitDatumFran" | "limitDatumTill"
  | "kundgrupp" | "kopmonster" | "aktiv" | "utlastningssparr";

type CustomerColumnKey =
  | "kundnr" | "kundansvarig" | "kontrakt12Man" | "leveransnamn" | "kortnamn"
  | "fakturanamn" | "adress" | "postadress" | "telefon" | "aktiv" | "tillhor"
  | "utlastningssparr" | "ediFaktura" | "fordran" | "kreditforsakring"
  | "internLimit" | "internLimitTom" | "limit" | "omsattning2025" | "omsattning2026"
  | "kundgrupp" | "kategori" | "kopmonster" | "kommentarSaljare";

type CustomerSearchFieldConfig = {
  key: CustomerSearchFieldKey;
  label: string;
  control: "text" | "date" | "select" | "checkbox";
  visible: boolean;
  favorite: boolean;
};

type CustomerColumnConfig = {
  key: CustomerColumnKey;
  label: string;
  visible: boolean;
  pinned: boolean;
  width?: number;
};

type CustomerSearchValueMap = Record<CustomerSearchFieldKey, string | boolean>;

type CustomerRow = Record<CustomerColumnKey, string>;

const defaultCustomerSearchFields: CustomerSearchFieldConfig[] = [
  { key: "kundnr", label: "Kundnr", control: "text", visible: true, favorite: true },
  { key: "kortnamn", label: "Kortnamn", control: "text", visible: true, favorite: true },
  { key: "kundansvarig", label: "Kundansvarig", control: "select", visible: true, favorite: true },
  { key: "saljare", label: "Säljare/innesäljare", control: "select", visible: true, favorite: true },
  { key: "fakturanamn", label: "Fakturanamn", control: "text", visible: false, favorite: false },
  { key: "postadress", label: "Postadress", control: "text", visible: false, favorite: false },
  { key: "land", label: "Land", control: "select", visible: false, favorite: false },
  { key: "hyvelprofil", label: "Hyvelprofil", control: "select", visible: false, favorite: false },
  { key: "kategori", label: "Kategori", control: "select", visible: false, favorite: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: false, favorite: false },
  { key: "orgNr", label: "OrgNr", control: "text", visible: false, favorite: false },
  { key: "vatNr", label: "VatNr", control: "text", visible: false, favorite: false },
  { key: "varningsnivaFordran", label: "Varningsnivå fordran", control: "select", visible: false, favorite: false },
  { key: "varningsnivaLimit", label: "Varningsnivå limit", control: "select", visible: false, favorite: false },
  { key: "agent", label: "Agent", control: "select", visible: false, favorite: false },
  { key: "limitDatumFran", label: "Limit datum från", control: "date", visible: false, favorite: false },
  { key: "limitDatumTill", label: "Limit datum till", control: "date", visible: false, favorite: false },
  { key: "kundgrupp", label: "Kundgrupp", control: "select", visible: false, favorite: false },
  { key: "kopmonster", label: "Köpmönster", control: "select", visible: false, favorite: false },
  { key: "aktiv", label: "Aktiv", control: "checkbox", visible: false, favorite: false },
  { key: "utlastningssparr", label: "Utlastningsspärr", control: "checkbox", visible: false, favorite: false },
];

const customerSelectOptionsByField: Partial<Record<CustomerSearchFieldKey, string[]>> = {
  land: ["SE", "NO", "FI", "DK", "DE", "EE"],
  hyvelprofil: ["Aktiv", "Inaktiv", "Alla"],
  kategori: ["Bygghandel", "Industri", "Sågverk"],
  varningsnivaFordran: ["Ingen", "Låg", "Medium", "Hög"],
  varningsnivaLimit: ["Ingen", "Låg", "Medium", "Hög"],
  kundansvarig: ["Jane Doe", "Erik Andersson", "Maria Lindqvist"],
  saljare: ["Jane Doe", "Erik Andersson", "Maria Lindqvist", "Oskar Berg"],
  agent: ["Nordic Agent AB", "Baltic Trade AB"],
  kundgrupp: ["A", "B", "C"],
  kopmonster: ["Regelbunden", "Oregelbunden", "Säsongsbetonad"],
};

const initialCustomerSearchValues: CustomerSearchValueMap = {
  kundnr: "", fakturanamn: "", kortnamn: "", postadress: "", land: "", hyvelprofil: "",
  kategori: "", tillhor: "", orgNr: "", vatNr: "", varningsnivaFordran: "", varningsnivaLimit: "",
  kundansvarig: "", saljare: "", agent: "", limitDatumFran: "", limitDatumTill: "",
  kundgrupp: "", kopmonster: "", aktiv: false, utlastningssparr: false,
};

const defaultCustomerColumns: CustomerColumnConfig[] = [
  { key: "kundnr", label: "Kundnr", visible: true, pinned: false, width: 100 },
  { key: "kundansvarig", label: "Kundansvarig", visible: true, pinned: false, width: 150 },
  { key: "kontrakt12Man", label: "Kontrakt 12 mån", visible: true, pinned: false, width: 130 },
  { key: "leveransnamn", label: "Leveransnamn", visible: true, pinned: false, width: 200 },
  { key: "kortnamn", label: "Kortnamn", visible: true, pinned: false, width: 110 },
  { key: "fakturanamn", label: "Fakturanamn", visible: true, pinned: false, width: 200 },
  { key: "adress", label: "Adress", visible: true, pinned: false, width: 180 },
  { key: "postadress", label: "Postadress", visible: true, pinned: false, width: 160 },
  { key: "telefon", label: "Telefon", visible: true, pinned: false, width: 140 },
  { key: "aktiv", label: "Aktiv", visible: true, pinned: false, width: 80 },
  { key: "tillhor", label: "Tillhör", visible: true, pinned: false, width: 150 },
  { key: "utlastningssparr", label: "Utlastningsspärr", visible: true, pinned: false, width: 150 },
  { key: "ediFaktura", label: "EDI Faktura", visible: true, pinned: false, width: 110 },
  { key: "fordran", label: "Fordran", visible: true, pinned: false, width: 130 },
  { key: "kreditforsakring", label: "Kreditförsäkring", visible: true, pinned: false, width: 150 },
  { key: "internLimit", label: "Intern limit", visible: true, pinned: false, width: 120 },
  { key: "internLimitTom", label: "Intern limit t.o.m.", visible: true, pinned: false, width: 150 },
  { key: "limit", label: "Limit", visible: true, pinned: false, width: 130 },
  { key: "omsattning2025", label: "Omsättning 2025", visible: true, pinned: false, width: 150 },
  { key: "omsattning2026", label: "Omsättning 2026", visible: true, pinned: false, width: 150 },
  { key: "kundgrupp", label: "Kundgrupp", visible: true, pinned: false, width: 100 },
  { key: "kategori", label: "Kategori", visible: true, pinned: false, width: 120 },
  { key: "kopmonster", label: "Köpmönster", visible: true, pinned: false, width: 130 },
  { key: "kommentarSaljare", label: "Kommentar (säljare)", visible: true, pinned: false, width: 220 },
];

const customerTableRows: CustomerRow[] = [
  {
    kundnr: "K-1001", kundansvarig: "Jane Doe", kontrakt12Man: "14",
    leveransnamn: "Acme AB", kortnamn: "ACME", fakturanamn: "Acme AB",
    adress: "Industrivägen 12", postadress: "123 45 Stockholm", telefon: "08-120 45 100",
    aktiv: "Ja", tillhor: "Marknad Nord", utlastningssparr: "Nej", ediFaktura: "Ja",
    fordran: "125 000", kreditforsakring: "500 000", internLimit: "750 000",
    internLimitTom: "2026-12-31", limit: "500 000", omsattning2025: "2 340 000",
    omsattning2026: "1 890 000", kundgrupp: "A", kategori: "Bygghandel",
    kopmonster: "Regelbunden", kommentarSaljare: "Strategisk kund med löpande projektleveranser."
  },
  {
    kundnr: "K-1002", kundansvarig: "Erik Andersson", kontrakt12Man: "9",
    leveransnamn: "Globex Corp", kortnamn: "GLOBEX", fakturanamn: "Globex Corp AS",
    adress: "Oslofjordveien 5", postadress: "0277 Oslo", telefon: "+47 22 44 10 20",
    aktiv: "Ja", tillhor: "Marknad Export", utlastningssparr: "Nej", ediFaktura: "Nej",
    fordran: "340 000", kreditforsakring: "1 200 000", internLimit: "1 500 000",
    internLimitTom: "2027-06-30", limit: "1 200 000", omsattning2025: "4 120 000",
    omsattning2026: "3 880 000", kundgrupp: "A", kategori: "Industri",
    kopmonster: "Regelbunden", kommentarSaljare: "Kräver engelska dokument och samlad avisering."
  },
  {
    kundnr: "K-1003", kundansvarig: "Jane Doe", kontrakt12Man: "6",
    leveransnamn: "Initech HB", kortnamn: "INITECH", fakturanamn: "Initech HB",
    adress: "Vasakajen 3", postadress: "65100 Vasa", telefon: "+358 10 320 4400",
    aktiv: "Ja", tillhor: "Marknad Export", utlastningssparr: "Nej", ediFaktura: "Nej",
    fordran: "410 000", kreditforsakring: "350 000", internLimit: "400 000",
    internLimitTom: "2026-06-30", limit: "350 000", omsattning2025: "980 000",
    omsattning2026: "760 000", kundgrupp: "B", kategori: "Bygghandel",
    kopmonster: "Oregelbunden", kommentarSaljare: "Limitöverskridande. Kräver godkännande."
  },
  {
    kundnr: "K-1004", kundansvarig: "Erik Andersson", kontrakt12Man: "11",
    leveransnamn: "Nordic Sten & Mark AB", kortnamn: "NSM", fakturanamn: "Nordic Sten & Mark AB",
    adress: "Storsjögatan 22", postadress: "831 34 Östersund", telefon: "063-440 18 00",
    aktiv: "Ja", tillhor: "Marknad Nord", utlastningssparr: "Nej", ediFaktura: "Ja",
    fordran: "210 000", kreditforsakring: "800 000", internLimit: "1 000 000",
    internLimitTom: "2026-12-31", limit: "800 000", omsattning2025: "3 450 000",
    omsattning2026: "2 970 000", kundgrupp: "A", kategori: "Bygghandel",
    kopmonster: "Regelbunden", kommentarSaljare: "Föredrar leveransfönster tisdag–torsdag."
  },
  {
    kundnr: "K-1005", kundansvarig: "Jane Doe", kontrakt12Man: "18",
    leveransnamn: "Luna Infrastruktur AB", kortnamn: "LUNA", fakturanamn: "Luna Infrastruktur AB",
    adress: "Norrmalmsvägen 44", postadress: "852 30 Sundsvall", telefon: "060-220 45 10",
    aktiv: "Ja", tillhor: "Marknad Nord", utlastningssparr: "Nej", ediFaktura: "Ja",
    fordran: "80 000", kreditforsakring: "2 100 000", internLimit: "2 500 000",
    internLimitTom: "2027-03-31", limit: "2 100 000", omsattning2025: "7 800 000",
    omsattning2026: "6 450 000", kundgrupp: "A", kategori: "Industri",
    kopmonster: "Regelbunden", kommentarSaljare: "Stor kund med parallella projekt."
  },
  {
    kundnr: "K-1006", kundansvarig: "Erik Andersson", kontrakt12Man: "7",
    leveransnamn: "Skandinavisk Industriservice", kortnamn: "SKIS", fakturanamn: "Skandinavisk Industriservice A/S",
    adress: "Havnegade 12", postadress: "8000 Aarhus", telefon: "+45 86 11 42 30",
    aktiv: "Ja", tillhor: "Marknad Export", utlastningssparr: "Nej", ediFaktura: "Nej",
    fordran: "520 000", kreditforsakring: "660 000", internLimit: "700 000",
    internLimitTom: "2026-12-31", limit: "660 000", omsattning2025: "2 100 000",
    omsattning2026: "1 750 000", kundgrupp: "B", kategori: "Industri",
    kopmonster: "Regelbunden", kommentarSaljare: "Månatlig avstämning av limit och leveransprecision."
  },
  {
    kundnr: "K-1007", kundansvarig: "Maria Lindqvist", kontrakt12Man: "3",
    leveransnamn: "Björk & Ek Bygg AB", kortnamn: "BJEK", fakturanamn: "Björk & Ek Bygg AB",
    adress: "Skogsvägen 7", postadress: "791 30 Falun", telefon: "023-560 12 00",
    aktiv: "Ja", tillhor: "Marknad Syd", utlastningssparr: "Ja", ediFaktura: "Nej",
    fordran: "45 000", kreditforsakring: "250 000", internLimit: "300 000",
    internLimitTom: "2026-09-30", limit: "250 000", omsattning2025: "620 000",
    omsattning2026: "540 000", kundgrupp: "C", kategori: "Bygghandel",
    kopmonster: "Säsongsbetonad", kommentarSaljare: "Aktiv framför allt under Q2–Q3."
  },
  {
    kundnr: "K-1008", kundansvarig: "Maria Lindqvist", kontrakt12Man: "5",
    leveransnamn: "Granit & Grus HB", kortnamn: "GGRU", fakturanamn: "Granit & Grus HB",
    adress: "Grustaget 1", postadress: "431 37 Mölndal", telefon: "031-440 23 10",
    aktiv: "Ja", tillhor: "Marknad Syd", utlastningssparr: "Nej", ediFaktura: "Nej",
    fordran: "90 000", kreditforsakring: "400 000", internLimit: "450 000",
    internLimitTom: "2026-12-31", limit: "400 000", omsattning2025: "1 240 000",
    omsattning2026: "1 080 000", kundgrupp: "B", kategori: "Bygghandel",
    kopmonster: "Oregelbunden", kommentarSaljare: ""
  },
  {
    kundnr: "K-1009", kundansvarig: "Jane Doe", kontrakt12Man: "2",
    leveransnamn: "Norrlands Trä AB", kortnamn: "NORTR", fakturanamn: "Norrlands Trä AB",
    adress: "Sågverksgatan 3", postadress: "961 30 Boden", telefon: "0921-420 11 00",
    aktiv: "Nej", tillhor: "Marknad Nord", utlastningssparr: "Ja", ediFaktura: "Nej",
    fordran: "0", kreditforsakring: "150 000", internLimit: "200 000",
    internLimitTom: "2025-12-31", limit: "150 000", omsattning2025: "310 000",
    omsattning2026: "0", kundgrupp: "C", kategori: "Sågverk",
    kopmonster: "Oregelbunden", kommentarSaljare: "Kund pausad. Kontaktas Q1 2027."
  },
  {
    kundnr: "K-1010", kundansvarig: "Erik Andersson", kontrakt12Man: "8",
    leveransnamn: "Bygg & Handel Syd AB", kortnamn: "BHS", fakturanamn: "Bygg & Handel Syd AB",
    adress: "Handelsvägen 15", postadress: "211 24 Malmö", telefon: "040-340 56 00",
    aktiv: "Ja", tillhor: "Marknad Syd", utlastningssparr: "Nej", ediFaktura: "Ja",
    fordran: "165 000", kreditforsakring: "600 000", internLimit: "650 000",
    internLimitTom: "2026-12-31", limit: "600 000", omsattning2025: "2 890 000",
    omsattning2026: "2 540 000", kundgrupp: "A", kategori: "Bygghandel",
    kopmonster: "Regelbunden", kommentarSaljare: "Bra betalningshistorik. EDI aktiverat 2025."
  },
  {
    kundnr: "K-1011", kundansvarig: "Maria Lindqvist", kontrakt12Man: "4",
    leveransnamn: "Timra Hus AB", kortnamn: "TIMHU", fakturanamn: "Timra Hus AB",
    adress: "Hantverksgatan 8", postadress: "861 80 Timrå", telefon: "060-570 30 20",
    aktiv: "Ja", tillhor: "Marknad Nord", utlastningssparr: "Nej", ediFaktura: "Nej",
    fordran: "55 000", kreditforsakring: "300 000", internLimit: "350 000",
    internLimitTom: "2026-09-30", limit: "300 000", omsattning2025: "780 000",
    omsattning2026: "690 000", kundgrupp: "B", kategori: "Bygghandel",
    kopmonster: "Regelbunden", kommentarSaljare: ""
  },
  {
    kundnr: "K-1012", kundansvarig: "Jane Doe", kontrakt12Man: "12",
    leveransnamn: "BalticBuild OÜ", kortnamn: "BLTB", fakturanamn: "BalticBuild OÜ",
    adress: "Pärnu mnt 22", postadress: "10141 Tallinn", telefon: "+372 600 3400",
    aktiv: "Ja", tillhor: "Marknad Export", utlastningssparr: "Nej", ediFaktura: "Ja",
    fordran: "280 000", kreditforsakring: "900 000", internLimit: "1 000 000",
    internLimitTom: "2027-12-31", limit: "900 000", omsattning2025: "3 200 000",
    omsattning2026: "2 980 000", kundgrupp: "A", kategori: "Bygghandel",
    kopmonster: "Regelbunden", kommentarSaljare: "Exportkund. EDI faktura via PEPPOL."
  },
];

const customerActionItems = [
  { label: "Kund", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Ändra kundgrupp", icon: <EditOutlinedIcon fontSize="small" />, requiresSelection: true },
];

type LagerRow = {
  enhet: string;
  lagerstalle: string;
  artNr: string;
  produkt: string;
  pakettyp: string;
  customerPlanner: string;
  loadPlanner: string;
  reserveradLagerflytt: string;
  leveransbokat: string;
  lassbokat: string;
  tillgLager: string;
  kontraktsrest: string;
  avropsrest: string;
  nettolager: string;
  paSagorder: string;
  paJusterorder: string;
};

type LagerColumnKey = keyof LagerRow;

const LAGER_COLUMNS: Array<{ key: LagerColumnKey; label: string }> = [
  { key: "enhet", label: "Enhet" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "artNr", label: "ArtNr" },
  { key: "produkt", label: "Produkt" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "customerPlanner", label: "Customer planner" },
  { key: "loadPlanner", label: "Load Planner" },
  { key: "reserveradLagerflytt", label: "Reserverad Lagerflytt" },
  { key: "leveransbokat", label: "Leveransbokat" },
  { key: "lassbokat", label: "Lassbokat" },
  { key: "tillgLager", label: "Tillg. lager" },
  { key: "kontraktsrest", label: "Kontraktsrest" },
  { key: "avropsrest", label: "Avropsrest" },
  { key: "nettolager", label: "Nettolager" },
  { key: "paSagorder", label: "På sågorder" },
  { key: "paJusterorder", label: "På justerorder" },
];

const LAGER_ROWS: LagerRow[] = [
  {
    enhet: "BP Hissmofors",
    lagerstalle: "Krokom",
    artNr: "2202209500002000",
    produkt: "22x95 Gran Ytterpanel",
    pakettyp: "Lp",
    customerPlanner: "45",
    loadPlanner: "30",
    reserveradLagerflytt: "10",
    leveransbokat: "20",
    lassbokat: "15",
    tillgLager: "120",
    kontraktsrest: "350",
    avropsrest: "80",
    nettolager: "95",
    paSagorder: "200",
    paJusterorder: "50",
  },
  {
    enhet: "BP Hissmofors",
    lagerstalle: "Östersund",
    artNr: "2202212000001000",
    produkt: "22x120 Gran Ytterpanel",
    pakettyp: "Pk",
    customerPlanner: "60",
    loadPlanner: "40",
    reserveradLagerflytt: "5",
    leveransbokat: "35",
    lassbokat: "25",
    tillgLager: "85",
    kontraktsrest: "210",
    avropsrest: "55",
    nettolager: "70",
    paSagorder: "150",
    paJusterorder: "30",
  },
  {
    enhet: "BP Hissmofors",
    lagerstalle: "Sundsvall",
    artNr: "2202209500003000",
    produkt: "22x95 Gran Ytterpanel C",
    pakettyp: "Lp",
    customerPlanner: "0",
    loadPlanner: "0",
    reserveradLagerflytt: "0",
    leveransbokat: "0",
    lassbokat: "0",
    tillgLager: "0",
    kontraktsrest: "0",
    avropsrest: "0",
    nettolager: "0",
    paSagorder: "0",
    paJusterorder: "0",
  },
];

const LAGER_LENGTHS = ["1.8", "2.1", "2.4", "2.7", "3.0", "3.3", "3.6", "3.9", "4.2", "4.5", "4.8", "5.1", "5.4"] as const;
type LagerLength = typeof LAGER_LENGTHS[number];

type LagerDetailRow = {
  typ: string;
  enhet: string;
  summa: string;
  ovr: string;
  fix: string;
} & Record<LagerLength, string>;

const makeLagerDetailPlaceholder = (typ: string, enhet: string): LagerDetailRow => ({
  typ, enhet, summa: "–", ovr: "–", fix: "–",
  "1.8": "–", "2.1": "–", "2.4": "–", "2.7": "–", "3.0": "–",
  "3.3": "–", "3.6": "–", "3.9": "–", "4.2": "–", "4.5": "–",
  "4.8": "–", "5.1": "–", "5.4": "–",
});

const LAGER_DETAIL_PLACEHOLDER: LagerDetailRow[] = [
  makeLagerDetailPlaceholder("Tillg. lager", "st"),
  makeLagerDetailPlaceholder("Avropsrest", "st"),
  makeLagerDetailPlaceholder("Nettolager", "st"),
  makeLagerDetailPlaceholder("Tillg. lager", "m3"),
  makeLagerDetailPlaceholder("Tillg. lager fördelning (m3)", "%"),
];

const LAGER_DETAIL_DATA: Record<string, LagerDetailRow[]> = {
  "2202209500002000": [
    { typ: "Tillg. lager", enhet: "st", summa: "240", ovr: "20", fix: "10", "1.8": "18", "2.1": "22", "2.4": "28", "2.7": "35", "3.0": "42", "3.3": "30", "3.6": "28", "3.9": "18", "4.2": "10", "4.5": "5", "4.8": "2", "5.1": "1", "5.4": "1" },
    { typ: "Avropsrest", enhet: "st", summa: "80", ovr: "5", fix: "3", "1.8": "6", "2.1": "8", "2.4": "10", "2.7": "12", "3.0": "14", "3.3": "10", "3.6": "8", "3.9": "6", "4.2": "3", "4.5": "2", "4.8": "1", "5.1": "0", "5.4": "0" },
    { typ: "Nettolager", enhet: "st", summa: "95", ovr: "8", fix: "4", "1.8": "7", "2.1": "9", "2.4": "12", "2.7": "15", "3.0": "18", "3.3": "12", "3.6": "10", "3.9": "7", "4.2": "4", "4.5": "1", "4.8": "0", "5.1": "0", "5.4": "0" },
    { typ: "Tillg. lager", enhet: "m3", summa: "4.80", ovr: "0.40", fix: "0.20", "1.8": "0.30", "2.1": "0.40", "2.4": "0.56", "2.7": "0.70", "3.0": "0.90", "3.3": "0.60", "3.6": "0.56", "3.9": "0.40", "4.2": "0.24", "4.5": "0.13", "4.8": "0.05", "5.1": "0.03", "5.4": "0.03" },
    { typ: "Tillg. lager fördelning (m3)", enhet: "%", summa: "100%", ovr: "8.3%", fix: "4.2%", "1.8": "6.3%", "2.1": "8.3%", "2.4": "11.7%", "2.7": "14.6%", "3.0": "18.8%", "3.3": "12.5%", "3.6": "11.7%", "3.9": "8.3%", "4.2": "5.0%", "4.5": "2.7%", "4.8": "1.0%", "5.1": "0.6%", "5.4": "0.6%" },
  ],
  "2202212000001000": [
    { typ: "Tillg. lager", enhet: "st", summa: "170", ovr: "15", fix: "8", "1.8": "12", "2.1": "15", "2.4": "20", "2.7": "25", "3.0": "30", "3.3": "22", "3.6": "18", "3.9": "14", "4.2": "8", "4.5": "4", "4.8": "1", "5.1": "1", "5.4": "0" },
    { typ: "Avropsrest", enhet: "st", summa: "55", ovr: "3", fix: "2", "1.8": "4", "2.1": "5", "2.4": "7", "2.7": "9", "3.0": "10", "3.3": "7", "3.6": "6", "3.9": "4", "4.2": "2", "4.5": "1", "4.8": "0", "5.1": "0", "5.4": "0" },
    { typ: "Nettolager", enhet: "st", summa: "70", ovr: "6", fix: "3", "1.8": "5", "2.1": "6", "2.4": "9", "2.7": "11", "3.0": "13", "3.3": "9", "3.6": "7", "3.9": "5", "4.2": "3", "4.5": "1", "4.8": "1", "5.1": "0", "5.4": "0" },
    { typ: "Tillg. lager", enhet: "m3", summa: "3.40", ovr: "0.30", fix: "0.16", "1.8": "0.20", "2.1": "0.25", "2.4": "0.40", "2.7": "0.50", "3.0": "0.60", "3.3": "0.44", "3.6": "0.36", "3.9": "0.28", "4.2": "0.16", "4.5": "0.08", "4.8": "0.02", "5.1": "0.02", "5.4": "0.00" },
    { typ: "Tillg. lager fördelning (m3)", enhet: "%", summa: "100%", ovr: "8.8%", fix: "4.7%", "1.8": "5.9%", "2.1": "7.4%", "2.4": "11.8%", "2.7": "14.7%", "3.0": "17.6%", "3.3": "12.9%", "3.6": "10.6%", "3.9": "8.2%", "4.2": "4.7%", "4.5": "2.4%", "4.8": "0.6%", "5.1": "0.6%", "5.4": "0.0%" },
  ],
  "2202209500003000": [
    { typ: "Tillg. lager", enhet: "st", summa: "0", ovr: "0", fix: "0", "1.8": "0", "2.1": "0", "2.4": "0", "2.7": "0", "3.0": "0", "3.3": "0", "3.6": "0", "3.9": "0", "4.2": "0", "4.5": "0", "4.8": "0", "5.1": "0", "5.4": "0" },
    { typ: "Avropsrest", enhet: "st", summa: "0", ovr: "0", fix: "0", "1.8": "0", "2.1": "0", "2.4": "0", "2.7": "0", "3.0": "0", "3.3": "0", "3.6": "0", "3.9": "0", "4.2": "0", "4.5": "0", "4.8": "0", "5.1": "0", "5.4": "0" },
    { typ: "Nettolager", enhet: "st", summa: "0", ovr: "0", fix: "0", "1.8": "0", "2.1": "0", "2.4": "0", "2.7": "0", "3.0": "0", "3.3": "0", "3.6": "0", "3.9": "0", "4.2": "0", "4.5": "0", "4.8": "0", "5.1": "0", "5.4": "0" },
    { typ: "Tillg. lager", enhet: "m3", summa: "0.00", ovr: "0.00", fix: "0.00", "1.8": "0.00", "2.1": "0.00", "2.4": "0.00", "2.7": "0.00", "3.0": "0.00", "3.3": "0.00", "3.6": "0.00", "3.9": "0.00", "4.2": "0.00", "4.5": "0.00", "4.8": "0.00", "5.1": "0.00", "5.4": "0.00" },
    { typ: "Tillg. lager fördelning (m3)", enhet: "%", summa: "0%", ovr: "0%", fix: "0%", "1.8": "0.0%", "2.1": "0.0%", "2.4": "0.0%", "2.7": "0.0%", "3.0": "0.0%", "3.3": "0.0%", "3.6": "0.0%", "3.9": "0.0%", "4.2": "0.0%", "4.5": "0.0%", "4.8": "0.0%", "5.1": "0.0%", "5.4": "0.0%" },
  ],
};

type AvropRow = {
  utlastandeBolag: string;
  kontraktsNr: string;
  avropradNr: string;
  typ: string;
  kund: string;
  extAvropNr: string;
  produkt: string;
  pakettyp: string;
  emballage: string;
  pris: string;
  valuta: string;
  nettoprisM3: string;
  mangd: string;
  enhet: string;
  volym: string;
  lassbokat: string;
  leveradVolym: string;
  avropsrest: string;
  nettolager: string;
  tillgLager: string;
  dag: string;
  langdkrav: string;
  volymLO: string;
  produceras: string;
  kundensMarke: string;
  vecka: string;
  leveranssatt: string;
  internKommentarKontraktsrad: string;
  internKommentarAvropsrad: string;
  artNr: string;
  mlRatt: string;
  avropNr: string;
  ravarulager: string;
  nominellTjocklek: string;
  nominellBredd: string;
  ansvarigBolag: string;
  avropradDatum: string;
  utlastningssparr: string;
  skeppningsvecka: string;
  etd: string;
  eta: string;
  mlTorr: string;
  fartyg: string;
  closingDate: string;
  expeditor: string;
  restvardeSEK: string;
  restvarde: string;
  totalvardeSEK: string;
  totalvarde: string;
  status: string;
  custWeek: string;
  vflGrupp: string;
  leveransvillkor: string;
  levVillkorOrt: string;
  mottagandeHamn: string;
  leveransperiodKunddokument: string;
  lastorderNr: string;
  reserveratLagerflytt: string;
  leveransbokat: string;
  utlastandeLagerstalle: string;
  levTidigast: string;
  levSenastibl: string;
  extKontraktsNr: string;
  tidigasteLevDatum: string;
  kontraktsdatum: string;
  kurs: string;
  loadPlanned: string;
  ejLeveransbokat: string;
  limit: string;
  loadPlannedRest: string;
  lassSipal: string;
  godsmottMarke: string;
};

const AVROP_COLUMNS: Array<{ key: keyof AvropRow; label: string; pinned?: boolean }> = [
  { key: "kontraktsNr", label: "KontraktsNr" },
  { key: "avropradNr", label: "Avroprad nr", pinned: true },
  { key: "utlastandeBolag", label: "Utlastande enhet" },
  { key: "typ", label: "Typ" },
  { key: "kund", label: "Kund" },
  { key: "extAvropNr", label: "Ext. AvropNr" },
  { key: "produkt", label: "Produkt" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "emballage", label: "Emballage" },
  { key: "pris", label: "Pris" },
  { key: "valuta", label: "Valuta" },
  { key: "nettoprisM3", label: "Nettopris/m3" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Enhet" },
  { key: "volym", label: "Volym" },
  { key: "lassbokat", label: "Lassbokat" },
  { key: "leveradVolym", label: "Levererad volym" },
  { key: "avropsrest", label: "Avropsrest" },
  { key: "nettolager", label: "Nettolager" },
  { key: "tillgLager", label: "Tillg. lager" },
  { key: "dag", label: "Dag" },
  { key: "langdkrav", label: "Längdkrav" },
  { key: "volymLO", label: "Volym LO" },
  { key: "produceras", label: "Produceras" },
  { key: "kundensMarke", label: "Kundens märke" },
  { key: "vecka", label: "Vecka" },
  { key: "leveranssatt", label: "Leveranssätt" },
  { key: "internKommentarKontraktsrad", label: "Intern kommentar (kontraktsrad)" },
  { key: "internKommentarAvropsrad", label: "Intern kommentar (avropsrad)" },
  { key: "artNr", label: "ArtNr" },
  { key: "mlRatt", label: "ML Rått" },
  { key: "avropNr", label: "AvropNr" },
  { key: "ravarulager", label: "Råvarulager" },
  { key: "nominellTjocklek", label: "NominellTjocklek" },
  { key: "nominellBredd", label: "NominellBredd" },
  { key: "ansvarigBolag", label: "Ansvarigt enhet" },
  { key: "avropradDatum", label: "Avropraddatum" },
  { key: "utlastningssparr", label: "Utlastningsspärr" },
  { key: "skeppningsvecka", label: "Skeppningsvecka" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
  { key: "mlTorr", label: "ML Torrt" },
  { key: "fartyg", label: "Fartyg" },
  { key: "closingDate", label: "ClosingDate" },
  { key: "expeditor", label: "Speditör" },
  { key: "restvardeSEK", label: "Restvärde SEK" },
  { key: "restvarde", label: "Restvärde" },
  { key: "totalvardeSEK", label: "Totalvärde SEK" },
  { key: "totalvarde", label: "Totalvärde" },
  { key: "status", label: "Status" },
  { key: "custWeek", label: "Cust week" },
  { key: "vflGrupp", label: "VFL grupp" },
  { key: "leveransvillkor", label: "Leveransvillkor" },
  { key: "levVillkorOrt", label: "Lev.villkor ort" },
  { key: "mottagandeHamn", label: "Mottagande hamn" },
  { key: "leveransperiodKunddokument", label: "Leveransperiod kunddokument" },
  { key: "lastorderNr", label: "LastorderNr" },
  { key: "reserveratLagerflytt", label: "Reserverat Lagerflytt" },
  { key: "leveransbokat", label: "Leveransbokat" },
  { key: "utlastandeLagerstalle", label: "Utlastande lagerställe" },
  { key: "levTidigast", label: "Lev. tidigast" },
  { key: "levSenastibl", label: "Lev. senastlbl" },
  { key: "extKontraktsNr", label: "Ext. KontraktsNr" },
  { key: "tidigasteLevDatum", label: "Tidigaste lev. datum" },
  { key: "kontraktsdatum", label: "Kontraktsdatum" },
  { key: "kurs", label: "Kurs" },
  { key: "loadPlanned", label: "Load Planned" },
  { key: "ejLeveransbokat", label: "Ej leveransbokat" },
  { key: "limit", label: "Limit" },
  { key: "loadPlannedRest", label: "Load Planned rest" },
  { key: "lassSipal", label: "Lass Sipal" },
  { key: "godsmottMarke", label: "Godsmott. märke" },
];

const AVROP_ROWS: AvropRow[] = [
  { utlastandeBolag: "BP Hissmofors", kontraktsNr: "20241001", avropradNr: "163281", typ: "ML", kund: "Byggmax AB", extAvropNr: "EX-8821", produkt: "22x95 Gran Ytterpanel", pakettyp: "Lp", emballage: "Standard", pris: "3 409", valuta: "SEK", nettoprisM3: "3 159", mangd: "50", enhet: "m3", volym: "50", lassbokat: "2024-11-15", leveradVolym: "20", avropsrest: "30", nettolager: "95", tillgLager: "120", dag: "14", langdkrav: "3.0–5.4", volymLO: "15", produceras: "2024-W47", kundensMarke: "BM-A12", vecka: "47", leveranssatt: "Bil", internKommentarKontraktsrad: "", internKommentarAvropsrad: "Prio kund", artNr: "2202209500002000", mlRatt: "45", avropNr: "A-10231", ravarulager: "Krokom", nominellTjocklek: "22", nominellBredd: "95", ansvarigBolag: "BP Hissmofors", avropradDatum: "2024-10-28", utlastningssparr: "Nej", skeppningsvecka: "48", etd: "2024-11-25", eta: "2024-11-26", mlTorr: "42", fartyg: "–", closingDate: "2024-11-10", expeditor: "DSV", restvardeSEK: "102 270", restvarde: "30", totalvardeSEK: "170 450", totalvarde: "50", status: "Aktiv", custWeek: "48", vflGrupp: "VFL-A", leveransvillkor: "DAP", levVillkorOrt: "Stockholm", mottagandeHamn: "–", leveransperiodKunddokument: "2024-11", lastorderNr: "LO-4421", reserveratLagerflytt: "5", leveransbokat: "2024-11-14", utlastandeLagerstalle: "Krokom", levTidigast: "2024-11-13", levSenastibl: "2024-11-17", extKontraktsNr: "BM-2024-09", tidigasteLevDatum: "2024-11-13", kontraktsdatum: "2024-01-15", kurs: "1.00", loadPlanned: "45", ejLeveransbokat: "5", limit: "60", loadPlannedRest: "15", lassSipal: "3", godsmottMarke: "BM-YTERP" },
  { utlastandeBolag: "BP Hissmofors", kontraktsNr: "20241001", avropradNr: "163214", typ: "FL", kund: "Byggmax AB", extAvropNr: "EX-8822", produkt: "22x120 Gran Ytterpanel", pakettyp: "Pk", emballage: "Staplat", pris: "3 926", valuta: "SEK", nettoprisM3: "3 805", mangd: "30", enhet: "m3", volym: "30", lassbokat: "2024-11-20", leveradVolym: "10", avropsrest: "20", nettolager: "70", tillgLager: "85", dag: "21", langdkrav: "2.4–4.8", volymLO: "8", produceras: "2024-W48", kundensMarke: "BM-A13", vecka: "48", leveranssatt: "Bil", internKommentarKontraktsrad: "Årskontrakt", internKommentarAvropsrad: "", artNr: "2202212000001000", mlRatt: "28", avropNr: "A-10232", ravarulager: "Östersund", nominellTjocklek: "22", nominellBredd: "120", ansvarigBolag: "BP Hissmofors", avropradDatum: "2024-10-30", utlastningssparr: "Nej", skeppningsvecka: "49", etd: "2024-12-02", eta: "2024-12-03", mlTorr: "26", fartyg: "–", closingDate: "2024-11-18", expeditor: "Schenker", restvardeSEK: "78 520", restvarde: "20", totalvardeSEK: "117 780", totalvarde: "30", status: "Aktiv", custWeek: "49", vflGrupp: "VFL-B", leveransvillkor: "DAP", levVillkorOrt: "Göteborg", mottagandeHamn: "–", leveransperiodKunddokument: "2024-11", lastorderNr: "LO-4422", reserveratLagerflytt: "2", leveransbokat: "2024-11-19", utlastandeLagerstalle: "Östersund", levTidigast: "2024-11-18", levSenastibl: "2024-11-22", extKontraktsNr: "BM-2024-09", tidigasteLevDatum: "2024-11-18", kontraktsdatum: "2024-01-15", kurs: "1.00", loadPlanned: "28", ejLeveransbokat: "2", limit: "35", loadPlannedRest: "7", lassSipal: "2", godsmottMarke: "BM-YTERP120" },
  { utlastandeBolag: "BP Hissmofors", kontraktsNr: "20241055", avropradNr: "163249", typ: "ML", kund: "Hornbach SE", extAvropNr: "HB-5541", produkt: "45x45 Gran Vilmaregel G4-2 Lp", pakettyp: "Lp", emballage: "Standard", pris: "3 551", valuta: "SEK", nettoprisM3: "3 511", mangd: "80", enhet: "m3", volym: "80", lassbokat: "2024-12-01", leveradVolym: "40", avropsrest: "40", nettolager: "55", tillgLager: "85", dag: "7", langdkrav: "3.6–5.4", volymLO: "30", produceras: "2024-W49", kundensMarke: "HB-REG45", vecka: "49", leveranssatt: "Tåg", internKommentarKontraktsrad: "Kvartalskontrakt", internKommentarAvropsrad: "Del 2 av 4", artNr: "4504503210810", mlRatt: "72", avropNr: "A-10541", ravarulager: "Krokom", nominellTjocklek: "45", nominellBredd: "45", ansvarigBolag: "BP Hissmofors", avropradDatum: "2024-11-05", utlastningssparr: "Nej", skeppningsvecka: "50", etd: "2024-12-09", eta: "2024-12-11", mlTorr: "68", fartyg: "–", closingDate: "2024-11-25", expeditor: "DHL", restvardeSEK: "140 440", restvarde: "40", totalvardeSEK: "280 880", totalvarde: "80", status: "Aktiv", custWeek: "50", vflGrupp: "VFL-A", leveransvillkor: "FCA", levVillkorOrt: "Krokom", mottagandeHamn: "–", leveransperiodKunddokument: "2024-12", lastorderNr: "LO-5541", reserveratLagerflytt: "8", leveransbokat: "2024-11-30", utlastandeLagerstalle: "Krokom", levTidigast: "2024-11-28", levSenastibl: "2024-12-03", extKontraktsNr: "HB-SE-2024-Q4", tidigasteLevDatum: "2024-11-28", kontraktsdatum: "2024-03-01", kurs: "1.00", loadPlanned: "70", ejLeveransbokat: "10", limit: "90", loadPlannedRest: "20", lassSipal: "5", godsmottMarke: "HB-REGEL45" },
  { utlastandeBolag: "BP Hissmofors", kontraktsNr: "20241055", avropradNr: "163291", typ: "VFL", kund: "Hornbach SE", extAvropNr: "HB-5542", produkt: "45x70 Gran Regel G4-2 Lp", pakettyp: "Lp", emballage: "Standard", pris: "3 580", valuta: "SEK", nettoprisM3: "3 505", mangd: "25", enhet: "m3", volym: "25", lassbokat: "2024-12-05", leveradVolym: "0", avropsrest: "25", nettolager: "0", tillgLager: "0", dag: "3", langdkrav: "Alla", volymLO: "0", produceras: "2024-W50", kundensMarke: "HB-REG70", vecka: "50", leveranssatt: "Bil", internKommentarKontraktsrad: "Kvartalskontrakt", internKommentarAvropsrad: "", artNr: "4507003210810", mlRatt: "0", avropNr: "A-10542", ravarulager: "–", nominellTjocklek: "45", nominellBredd: "70", ansvarigBolag: "BP Hissmofors", avropradDatum: "2024-11-10", utlastningssparr: "Ja", skeppningsvecka: "51", etd: "–", eta: "–", mlTorr: "0", fartyg: "–", closingDate: "–", expeditor: "–", restvardeSEK: "89 500", restvarde: "25", totalvardeSEK: "89 500", totalvarde: "25", status: "Spärrad", custWeek: "51", vflGrupp: "VFL-C", leveransvillkor: "DAP", levVillkorOrt: "Malmö", mottagandeHamn: "–", leveransperiodKunddokument: "2024-12", lastorderNr: "–", reserveratLagerflytt: "0", leveransbokat: "–", utlastandeLagerstalle: "–", levTidigast: "–", levSenastibl: "–", extKontraktsNr: "HB-SE-2024-Q4", tidigasteLevDatum: "–", kontraktsdatum: "2024-03-01", kurs: "1.00", loadPlanned: "0", ejLeveransbokat: "25", limit: "30", loadPlannedRest: "30", lassSipal: "0", godsmottMarke: "HB-REGEL70" },
  { utlastandeBolag: "BP Hissmofors", kontraktsNr: "20241082", avropradNr: "163213", typ: "ML", kund: "K-Rauta OY", extAvropNr: "KR-0091", produkt: "45x95 Gran Regel G4-2 Kortlängd", pakettyp: "Pk", emballage: "Staplat", pris: "3 737", valuta: "SEK", nettoprisM3: "3 662", mangd: "60", enhet: "m3", volym: "60", lassbokat: "2024-11-28", leveradVolym: "30", avropsrest: "30", nettolager: "70", tillgLager: "85", dag: "10", langdkrav: "2.1–3.9", volymLO: "22", produceras: "2024-W47", kundensMarke: "KR-095", vecka: "47", leveranssatt: "Båt", internKommentarKontraktsrad: "", internKommentarAvropsrad: "Export FI", artNr: "4509503210000", mlRatt: "55", avropNr: "A-10821", ravarulager: "Östersund", nominellTjocklek: "45", nominellBredd: "95", ansvarigBolag: "BP Hissmofors", avropradDatum: "2024-10-25", utlastningssparr: "Nej", skeppningsvecka: "48", etd: "2024-11-22", eta: "2024-11-24", mlTorr: "52", fartyg: "M/S Botnia", closingDate: "2024-11-18", expeditor: "Scan Global", restvardeSEK: "109 860", restvarde: "30", totalvardeSEK: "220 260", totalvarde: "60", status: "Aktiv", custWeek: "48", vflGrupp: "VFL-A", leveransvillkor: "CIF", levVillkorOrt: "Helsinki", mottagandeHamn: "Helsinki", leveransperiodKunddokument: "2024-11", lastorderNr: "LO-8211", reserveratLagerflytt: "4", leveransbokat: "2024-11-27", utlastandeLagerstalle: "Östersund", levTidigast: "2024-11-20", levSenastibl: "2024-11-25", extKontraktsNr: "KR-FI-2024-44", tidigasteLevDatum: "2024-11-20", kontraktsdatum: "2024-02-10", kurs: "0.093", loadPlanned: "52", ejLeveransbokat: "8", limit: "70", loadPlannedRest: "18", lassSipal: "4", godsmottMarke: "KR-REGEL95" },
];

// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const pathSection = pathParts[0] as SectionKey | undefined;
  const sectionSlug: SectionKey =
    pathSection && sectionDefinitions.some((section) => section.slug === pathSection)
      ? pathSection
      : "hem";
  const sectionConfig =
    sectionDefinitions.find((section) => section.slug === sectionSlug) ?? sectionDefinitions[0];
  const menuSlug = pathParts[1] ?? sectionConfig.defaultMenuSlug;
  const contractId = pathParts[2] ?? null;
  const isContractDetailRoute = sectionSlug === "marknad" && menuSlug === "kontraktlista";
  const isCustomerDetailRoute = sectionSlug === "marknad" && menuSlug === "kundlista";
  const isPriceListRoute = sectionSlug === "marknad" && menuSlug === "prislistor";
  const rawSegment3 = pathParts[3] ?? null;
  const isAvropRoute = isContractDetailRoute && rawSegment3 === "avrop";
  const isContainerRoute = isContractDetailRoute && rawSegment3 === "container";
  const selectedAvropsradId = isAvropRoute ? (pathParts[4] ?? null) : null;
  const lineItemId = isAvropRoute ? null : rawSegment3;
  const isAvropDetailOpen = isAvropRoute && Boolean(selectedAvropsradId);
  const isCreatingAvrop = selectedAvropsradId === "new";
  const isContractDetailOpen = isContractDetailRoute && Boolean(contractId);
  const isCreatingCustomer = isCustomerDetailRoute && contractId === "new";
  const isCustomerDetailOpen = isCustomerDetailRoute && Boolean(contractId) && !isCreatingCustomer;
  const isCreatingPriceList = isPriceListRoute && contractId === "new";
  const isPriceListDetailOpen = isPriceListRoute && Boolean(contractId) && !isCreatingPriceList;
  const selectedContractId = isContractDetailRoute ? contractId : null;
  const selectedCustomerName = isCustomerDetailRoute && contractId ? decodePathSegment(contractId) : null;
  const selectedPriceListId = isPriceListRoute && !isCreatingPriceList ? contractId : null;
  const isPrislistekalkylRoute = isPriceListRoute && Boolean(contractId) && rawSegment3 === "kalkyl";
  const selectedPriceRowId = isPriceListRoute && !isPrislistekalkylRoute ? lineItemId : null;
  const selectedLineItemId = isContractDetailRoute ? lineItemId : null;
  const isCreatingLineItem = selectedLineItemId === "new";
  const isLineItemDetailOpen = Boolean(selectedContractId && selectedLineItemId);
  const isPriceListRowDetailOpen = Boolean(selectedPriceListId && selectedPriceRowId);
  const isCreatingPriceRow = selectedPriceRowId === "new";
  const isContractListPage = sectionSlug === "marknad" && menuSlug === "kontraktlista";
  const isDeliveryListPage = sectionSlug === "marknad" && menuSlug === "leveranslista";
  const isPriceListPage = sectionSlug === "marknad" && menuSlug === "prislistor";
  const isSaljstodPage = sectionSlug === "marknad" && menuSlug === "saljstod";
  const isSystemPage = sectionSlug === "system";
  const isHomePage = sectionSlug === "hem";
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
  const selectedCustomerDetail = selectedCustomerName ? CUSTOMER_DETAILS[selectedCustomerName] ?? null : null;

  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUiState();
  const [topMenuAnchorEl, setTopMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [topMenuDropdownOwnerSlug, setTopMenuDropdownOwnerSlug] = useState<string | null>(null);
  const [topMenuDropdownOptions, setTopMenuDropdownOptions] = useState<
    Array<{ slug: string; label: string; href?: string; endIcon?: "open_in_new" }>
  >(
    []
  );
  const [activeContractTab, setActiveContractTab] = useState<ContractTab>(() =>
    typeof window !== "undefined" && window.location.hash === "#avrop" ? "Avrop" : "Kontraktsrader"
  );
  const [activeLineItemTab, setActiveLineItemTab] = useState<LineItemDetailTab>("Avropsrader");
  const [selectedCompany, setSelectedCompany] = useState(fakeCompanies[0]);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [searchValues, setSearchValues] = useState<SearchValueMap>(initialSearchValues);
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [appliedSearchFields, setAppliedSearchFields] = useState<SearchFieldConfig[]>(defaultSearchFields);
  const [draftSearchFields, setDraftSearchFields] = useState<SearchFieldConfig[]>(defaultSearchFields);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isLineItemsTableVisible, setIsLineItemsTableVisible] = useState(true);
  const [isLineColumnsMenuOpen, setIsLineColumnsMenuOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [appliedColumns, setAppliedColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [appliedLineColumns, setAppliedLineColumns] = useState<LineItemColumnConfig[]>(defaultLineItemColumns);
  const [draftLineColumns, setDraftLineColumns] = useState<LineItemColumnConfig[]>(defaultLineItemColumns);
  const [newLineItemDraftSeed, setNewLineItemDraftSeed] = useState<Partial<NewLineItemDraft>>({});
  const [newLineItemDraftVersion, setNewLineItemDraftVersion] = useState(0);
  const [pinnedLineItemFields, setPinnedLineItemFields] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [keepLineItemOpenAfterSave, setKeepLineItemOpenAfterSave] = useState(true);
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

  // Customer list state
  const [saljstodTab, setSaljstodTab] = useState<"lager" | "avrop">("lager");
  const [selectedLagerRow, setSelectedLagerRow] = useState<number | null>(null);
  const [lagerVisaTommaRader, setLagerVisaTommaRader] = useState(false);
  const [lagerKontraktsvolymFran, setLagerKontraktsvolymFran] = useState("");
  const [lagerKontraktsvolymTill, setLagerKontraktsvolymTill] = useState("");
  const [lagerAvropsvolymFran, setLagerAvropsvolymFran] = useState("");
  const [lagerAvropsvolymTill, setLagerAvropsvolymTill] = useState("");
  const [lagerFardiglagervolymFran, setLagerFardiglagervolymFran] = useState("");
  const [lagerFardiglagervolymTill, setLagerFardiglagervolymTill] = useState("");
  const [avropLand, setAvropLand] = useState("");
  const [avropRegistreradAv, setAvropRegistreradAv] = useState("");
  const [selectedAvropRow, setSelectedAvropRow] = useState<number | null>(null);
  const [avropAvreg, setAvropAvreg] = useState<"off" | "indeterminate" | "on">("off");
  const [customerSearchValues, setCustomerSearchValues] = useState<CustomerSearchValueMap>(initialCustomerSearchValues);
  const [customerGlobalSearchValue, setCustomerGlobalSearchValue] = useState("");
  const [isCustomerSearchMenuOpen, setIsCustomerSearchMenuOpen] = useState(false);
  const [appliedCustomerSearchFields, setAppliedCustomerSearchFields] = useState<CustomerSearchFieldConfig[]>(defaultCustomerSearchFields);
  const [draftCustomerSearchFields, setDraftCustomerSearchFields] = useState<CustomerSearchFieldConfig[]>(defaultCustomerSearchFields);
  const [isCustomerColumnsMenuOpen, setIsCustomerColumnsMenuOpen] = useState(false);
  const [appliedCustomerColumns, setAppliedCustomerColumns] = useState<CustomerColumnConfig[]>(defaultCustomerColumns);
  const [draftCustomerColumns, setDraftCustomerColumns] = useState<CustomerColumnConfig[]>(defaultCustomerColumns);
  const [selectedCustomerRowId, setSelectedCustomerRowId] = useState<number | null>(null);
  const customerSearchMenuRef = useRef<HTMLDivElement | null>(null);
  const customerSearchButtonRef = useRef<HTMLButtonElement | null>(null);
  const customerColumnsMenuRef = useRef<HTMLDivElement | null>(null);
  const customerColumnsButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const visibleLineColumns = useMemo(() => {
    const pinned = appliedLineColumns.filter((column) => column.visible && column.pinned);
    const regular = appliedLineColumns.filter((column) => column.visible && !column.pinned);
    return [...pinned, ...regular];
  }, [appliedLineColumns]);

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

  const allTextSearchFields = useMemo(
    () => defaultSearchFields.filter((field) => field.control === "text"),
    []
  );

  const allSelectSearchFields = useMemo(
    () => defaultSearchFields.filter((field) => field.control === "select"),
    []
  );

  const allCheckboxSearchFields = useMemo(
    () => defaultSearchFields.filter((field) => field.control === "checkbox"),
    []
  );

  const filteredContractRows = useMemo(() => {
    const normalizedGlobalSearch = globalSearchValue.trim().toLowerCase();

    const getSearchFieldValueForRow = (row: TableRow, fieldKey: SearchFieldKey) => {
      switch (fieldKey) {
        case "typ":
          return row.status ?? "";
        case "kontraktsNr":
          return row.kontrakt;
        case "externtKontraktsnr":
          return row.externNr;
        case "kontraktsdatumFran":
          return row.kontraktsdatum ?? "";
        case "kontraktsdatumTill":
          return row.kontraktsdatum ?? "";
        case "artNr":
          return row.artNr ?? "";
        case "kund":
          return row.kund;
        case "kategori":
          return "";
        case "land":
          return row.land;
        case "mottagarland":
          return row.land;
        case "bolag":
          return selectedCompany;
        case "upprattatAv":
          return row.upprattatAv ?? "";
        case "prislistaNr":
          return row.prislistaNr ?? "";
        case "certifiering":
          return "";
        case "tillhor":
          return row.tillhor ?? "";
        case "varningsnivaFordran":
          return "";
        case "varningsnivaLimit":
          return "";
        case "avtalsrattSaknasI":
          return row.egenAnmarkning ?? "";
        default:
          return "";
      }
    };

    const getSearchFieldBooleanForRow = (row: TableRow, fieldKey: SearchFieldKey) => {
      switch (fieldKey) {
        default:
          return false;
      }
    };

    return tableRows.filter((row) => {
      if (normalizedGlobalSearch.length > 0) {
        const rowMatchesGlobal = Object.values(row)
          .filter((value): value is string => typeof value === "string")
          .some((value) => value.toLowerCase().includes(normalizedGlobalSearch));

        if (!rowMatchesGlobal) {
          return false;
        }
      }

      for (const field of defaultSearchFields) {
        if (field.control === "checkbox") {
          const checkboxIsEnabled = Boolean(searchValues[field.key]);
          if (!checkboxIsEnabled) {
            continue;
          }

          if (!getSearchFieldBooleanForRow(row, field.key)) {
            return false;
          }
          continue;
        }

        const filterValue = String(searchValues[field.key] ?? "").trim().toLowerCase();
        if (!filterValue) {
          continue;
        }

        const rowValue = getSearchFieldValueForRow(row, field.key).toLowerCase();
        if (!rowValue.includes(filterValue)) {
          return false;
        }
      }

      return true;
    });
  }, [globalSearchValue, searchValues, selectedCompany]);

  const orderedVisibleCustomerColumns = useMemo(() => {
    const pinned = appliedCustomerColumns.filter((col) => col.visible && col.pinned);
    const regular = appliedCustomerColumns.filter((col) => col.visible && !col.pinned);
    return [...pinned, ...regular];
  }, [appliedCustomerColumns]);

  const visibleCustomerSearchFields = useMemo(
    () => appliedCustomerSearchFields.filter((f) => f.visible),
    [appliedCustomerSearchFields]
  );

  const customerTextSearchFields = useMemo(
    () => visibleCustomerSearchFields.filter((f) => f.control === "text" || f.control === "date"),
    [visibleCustomerSearchFields]
  );

  const customerSelectSearchFields = useMemo(
    () => visibleCustomerSearchFields.filter((f) => f.control === "select"),
    [visibleCustomerSearchFields]
  );

  const customerCheckboxSearchFields = useMemo(
    () => visibleCustomerSearchFields.filter((f) => f.control === "checkbox"),
    [visibleCustomerSearchFields]
  );

  const allCustomerTextSearchFields = useMemo(
    () => defaultCustomerSearchFields.filter((f) => f.control === "text" || f.control === "date"),
    []
  );

  const allCustomerSelectSearchFields = useMemo(
    () => defaultCustomerSearchFields.filter((f) => f.control === "select"),
    []
  );

  const allCustomerCheckboxSearchFields = useMemo(
    () => defaultCustomerSearchFields.filter((f) => f.control === "checkbox"),
    []
  );

  const filteredCustomerRows = useMemo(() => {
    const normalizedGlobal = customerGlobalSearchValue.trim().toLowerCase();
    return customerTableRows.filter((row) => {
      if (normalizedGlobal.length > 0) {
        const matches = Object.values(row).some((v) => v.toLowerCase().includes(normalizedGlobal));
        if (!matches) return false;
      }
      for (const field of defaultCustomerSearchFields) {
        if (field.control === "checkbox") {
          if (!customerSearchValues[field.key]) continue;
          if (field.key === "aktiv" && row.aktiv !== "Ja") return false;
          if (field.key === "utlastningssparr" && row.utlastningssparr !== "Ja") return false;
          continue;
        }
        const filterValue = String(customerSearchValues[field.key] ?? "").trim().toLowerCase();
        if (!filterValue) continue;
        const rowValue = (row[field.key as CustomerColumnKey] ?? "").toLowerCase();
        if (!rowValue.includes(filterValue)) return false;
      }
      return true;
    });
  }, [customerGlobalSearchValue, customerSearchValues]);

  const filteredLagerRows = useMemo(() => {
    const parseLagerNum = (s: string) => {
      const n = parseFloat(s.replace(/\s/g, "").replace(",", "."));
      return isNaN(n) ? 0 : n;
    };
    const parseInput = (s: string) => {
      const n = parseFloat(s.trim().replace(",", "."));
      return isNaN(n) ? null : n;
    };
    const franKontraktsvolym = parseInput(lagerKontraktsvolymFran);
    const tillKontraktsvolym = parseInput(lagerKontraktsvolymTill);
    const franAvropsvolym = parseInput(lagerAvropsvolymFran);
    const tillAvropsvolym = parseInput(lagerAvropsvolymTill);
    const franFardiglagervolym = parseInput(lagerFardiglagervolymFran);
    const tillFardiglagervolym = parseInput(lagerFardiglagervolymTill);

    return LAGER_ROWS.filter((row) => {
      if (!lagerVisaTommaRader) {
        const allZero =
          parseLagerNum(row.tillgLager) === 0 &&
          parseLagerNum(row.kontraktsrest) === 0 &&
          parseLagerNum(row.avropsrest) === 0 &&
          parseLagerNum(row.nettolager) === 0;
        if (allZero) return false;
      }
      const kontraktsrest = parseLagerNum(row.kontraktsrest);
      if (franKontraktsvolym !== null && kontraktsrest < franKontraktsvolym) return false;
      if (tillKontraktsvolym !== null && kontraktsrest > tillKontraktsvolym) return false;

      const avropsrest = parseLagerNum(row.avropsrest);
      if (franAvropsvolym !== null && avropsrest < franAvropsvolym) return false;
      if (tillAvropsvolym !== null && avropsrest > tillAvropsvolym) return false;

      const tillgLager = parseLagerNum(row.tillgLager);
      if (franFardiglagervolym !== null && tillgLager < franFardiglagervolym) return false;
      if (tillFardiglagervolym !== null && tillgLager > tillFardiglagervolym) return false;

      return true;
    });
  }, [
    lagerVisaTommaRader,
    lagerKontraktsvolymFran, lagerKontraktsvolymTill,
    lagerAvropsvolymFran, lagerAvropsvolymTill,
    lagerFardiglagervolymFran, lagerFardiglagervolymTill,
  ]);

  const lagerDetailRows: LagerDetailRow[] = (() => {
    const selRow = selectedLagerRow !== null ? filteredLagerRows[selectedLagerRow] : null;
    return selRow ? (LAGER_DETAIL_DATA[selRow.artNr] ?? LAGER_DETAIL_PLACEHOLDER) : LAGER_DETAIL_PLACEHOLDER;
  })();

  useEffect(() => {
    if (!isColumnsMenuOpen && !isLineColumnsMenuOpen && !isSearchMenuOpen && !isCompanyMenuOpen && !isCustomerSearchMenuOpen && !isCustomerColumnsMenuOpen) {
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
      const clickedInsideCustomerSearchMenu = customerSearchMenuRef.current?.contains(target);
      const clickedCustomerSearchButton = customerSearchButtonRef.current?.contains(target);
      const clickedInsideCustomerColumnsMenu = customerColumnsMenuRef.current?.contains(target);
      const clickedCustomerColumnsButton = customerColumnsButtonRef.current?.contains(target);

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

      if (isCustomerSearchMenuOpen && !clickedInsideCustomerSearchMenu && !clickedCustomerSearchButton) {
        setDraftCustomerSearchFields(appliedCustomerSearchFields);
        setIsCustomerSearchMenuOpen(false);
      }

      if (isCustomerColumnsMenuOpen && !clickedInsideCustomerColumnsMenu && !clickedCustomerColumnsButton) {
        setDraftCustomerColumns(appliedCustomerColumns);
        setIsCustomerColumnsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isColumnsMenuOpen,
    isLineColumnsMenuOpen,
    isSearchMenuOpen,
    isCompanyMenuOpen,
    isCustomerSearchMenuOpen,
    isCustomerColumnsMenuOpen,
    appliedColumns,
    appliedLineColumns,
    appliedSearchFields,
    appliedCustomerSearchFields,
    appliedCustomerColumns,
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

  const toggleSearchFieldFavorite = (key: SearchFieldKey) => {
    setDraftSearchFields((previous) =>
      previous.map((field) =>
        field.key === key ? { ...field, favorite: !field.favorite } : field
      )
    );
  };

  const saveFavoriteKeys = (orderedKeys: string[]) => {
    setDraftSearchFields((previous) => {
      const orderedSet = new Set(orderedKeys);
      // place favorites first in given order, then non-favorites in original order
      const nonFavorites = previous.filter((f) => !orderedSet.has(f.key));
      const favorites = orderedKeys
        .map((key) => previous.find((f) => f.key === key))
        .filter((f): f is SearchFieldConfig => f !== undefined)
        .map((f) => ({ ...f, favorite: true }));
      return [
        ...favorites,
        ...nonFavorites.map((f) => ({ ...f, favorite: false }))
      ];
    });
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

  const clearSearchValues = () => {
    const clearedSearchValues = Object.fromEntries(
      Object.entries(initialSearchValues).map(([key, value]) => [
        key,
        typeof value === "boolean" ? false : ""
      ])
    ) as SearchValueMap;

    setSearchValues(clearedSearchValues);
    setGlobalSearchValue("");
    triggerViewLoading();
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

  const toggleLineColumnPin = (key: LineItemColumnKey) => {
    setDraftLineColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, pinned: !column.pinned } : column
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

  // Customer list handlers
  const openCustomerSearchMenu = () => {
    setDraftCustomerSearchFields(appliedCustomerSearchFields);
    setIsCustomerColumnsMenuOpen(false);
    setIsCustomerSearchMenuOpen(true);
  };

  const toggleCustomerSearchFieldVisibility = (key: CustomerSearchFieldKey) => {
    setDraftCustomerSearchFields((prev) =>
      prev.map((f) => f.key === key ? { ...f, visible: !f.visible } : f)
    );
  };

  const toggleCustomerSearchFieldFavorite = (key: CustomerSearchFieldKey) => {
    setDraftCustomerSearchFields((prev) =>
      prev.map((f) => f.key === key ? { ...f, favorite: !f.favorite } : f)
    );
  };

  const saveCustomerFavoriteKeys = (orderedKeys: string[]) => {
    setDraftCustomerSearchFields((prev) => {
      const orderedSet = new Set(orderedKeys);
      const nonFavorites = prev.filter((f) => !orderedSet.has(f.key));
      const favorites = orderedKeys
        .map((key) => prev.find((f) => f.key === key))
        .filter((f): f is CustomerSearchFieldConfig => f !== undefined)
        .map((f) => ({ ...f, favorite: true }));
      return [...favorites, ...nonFavorites.map((f) => ({ ...f, favorite: false }))];
    });
  };

  const saveCustomerSearchFieldChanges = () => {
    setAppliedCustomerSearchFields(draftCustomerSearchFields);
    setIsCustomerSearchMenuOpen(false);
    triggerViewLoading();
  };

  const cancelCustomerSearchFieldChanges = () => {
    setDraftCustomerSearchFields(appliedCustomerSearchFields);
    setIsCustomerSearchMenuOpen(false);
  };

  const clearCustomerSearchFieldChanges = () => {
    setDraftCustomerSearchFields((prev) => prev.map((f) => ({ ...f, visible: false })));
  };

  const clearCustomerSearchValues = () => {
    setCustomerSearchValues(initialCustomerSearchValues);
    setCustomerGlobalSearchValue("");
    triggerViewLoading();
  };

  const openCustomerColumnsMenu = () => {
    setDraftCustomerColumns(appliedCustomerColumns);
    setIsCustomerSearchMenuOpen(false);
    setIsCustomerColumnsMenuOpen(true);
  };

  const toggleCustomerColumnVisibility = (key: CustomerColumnKey) => {
    setDraftCustomerColumns((prev) =>
      prev.map((col) => col.key === key ? { ...col, visible: !col.visible } : col)
    );
  };

  const toggleCustomerColumnPin = (key: CustomerColumnKey) => {
    setDraftCustomerColumns((prev) =>
      prev.map((col) => col.key === key ? { ...col, pinned: !col.pinned } : col)
    );
  };

  const moveCustomerColumn = (key: CustomerColumnKey, direction: "up" | "down") => {
    setDraftCustomerColumns((prev) => {
      const index = prev.findIndex((col) => col.key === key);
      if (index < 0) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const saveCustomerColumnChanges = () => {
    setAppliedCustomerColumns(draftCustomerColumns);
    setIsCustomerColumnsMenuOpen(false);
    triggerViewLoading();
  };

  const cancelCustomerColumnChanges = () => {
    setDraftCustomerColumns(appliedCustomerColumns);
    setIsCustomerColumnsMenuOpen(false);
  };

  const resetCustomerColumnChanges = () => {
    setDraftCustomerColumns(defaultCustomerColumns);
  };

  const getCustomerSelectOptions = (key: CustomerSearchFieldKey) => {
    return customerSelectOptionsByField[key] ?? [];
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
    setActiveLineItemTab("Nettolager");
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${contractId}`);
  };

  const openNewContract = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Nettolager");
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/new`);
  };

  const openNewCustomer = () => {
    navigateWithLoading(`/${sectionSlug}/kundlista/new`);
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

  const openPrislistekalkyl = () => {
    if (!selectedPriceListId) return;
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}/kalkyl`);
  };

  const openNewPriceRow = () => {
    if (!selectedPriceListId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}/new`);
  };

  const getCustomerDetailHref = (customerName: string) => `/marknad/kundlista/${encodeURIComponent(customerName)}`;

  const openLineItemDetail = (lineItemId: string) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Nettolager");
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/${lineItemId}`);
  };

  const openNewLineItem = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Nettolager");
    setNewLineItemDraftSeed({});
    setNewLineItemDraftVersion((previous) => previous + 1);
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/new`);
  };

  const openContainerView = () => {
    if (!selectedContractId) return;
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/container`);
  };

  const openAvropsradDetail = (avropsradId: string, data?: Record<string, string>) => {
    if (!selectedContractId) return;
    _savedAvropsradEditData = data ?? null;
    _savedReturnLineItemId = selectedLineItemId;
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/avrop/${avropsradId}`);
  };

  const openNewAvropsrad = () => {
    if (!selectedContractId) return;
    _savedAvropsradEditData = null;
    _savedReturnLineItemId = selectedLineItemId;
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/avrop/new`);
  };

  const closeAvropsradDetail = () => {
    if (!selectedContractId) return;
    _savedAvropsradEditData = null;
    const returnLineItemId = _savedReturnLineItemId;
    _savedReturnLineItemId = null;
    if (returnLineItemId) {
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/${returnLineItemId}`);
    } else {
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
    }
  };

  const saveAvropsradDetail = () => {
    if (!selectedContractId) return;
    _savedAvropsradEditData = null;
    const returnLineItemId = _savedReturnLineItemId;
    _savedReturnLineItemId = null;
    if (returnLineItemId) {
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/${returnLineItemId}#avropsrad`);
    } else {
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}#avrop`);
    }
  };

  const togglePinnedLineItemField = (key: keyof NewLineItemDraft) => {
    setPinnedLineItemFields((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveAndCreateNewLineItem = (draft: NewLineItemDraft) => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Avropsrader");
    setNewLineItemDraftSeed(draft);
    setNewLineItemDraftVersion((previous) => previous + 1);
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}/new`);
  };

  const closeLineItemDetail = () => {
    setActiveContractTab("Kontraktsrader");
    setActiveLineItemTab("Nettolager");
    if (!selectedContractId) {
      return;
    }
    navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
  };

  const handleContractTabChange = (tab: ContractTab) => {
    setActiveContractTab(tab);
    triggerViewLoading();
    if (tab !== "Kontraktsrader" && isLineItemDetailOpen && selectedContractId) {
      setActiveLineItemTab("Nettolager");
      navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`);
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

  const handleTopMenuOptionSelect = (option: {
    slug: string;
    label: string;
    href?: string;
    endIcon?: "open_in_new";
  }) => {
    closeTopMenuDropdown();
    if (option.href) {
      window.open(option.href, "_blank", "noopener,noreferrer");
      return;
    }
    navigateToTopMenu(option.slug);
  };

  const isTopMenuItemActive = (item: TopMenuItemDef) => {
    if (item.slug === menuSlug) {
      return true;
    }
    return item.options?.some((option) => option.slug === menuSlug) ?? false;
  };

  const activeContractTabForView: ContractTab = isLineItemDetailOpen ? "Kontraktsrader" : activeContractTab;

  const deepestBreadcrumb = useMemo(() => {
    if (isPrislistekalkylRoute) {
      return "Prislistekalkyl";
    }

    if (isPriceListRowDetailOpen && selectedPriceRowId) {
      return isCreatingPriceRow ? "Ny prislistrad" : `Prislistrad ${selectedPriceRowId}`;
    }

    if (isCreatingPriceList) {
      return "Ny prislista";
    }

    if (isPriceListDetailOpen && selectedPriceListId) {
      return `Prislista ${selectedPriceListId}`;
    }

    if (isContainerRoute && selectedContractId) {
      return "Container";
    }

    if (isAvropDetailOpen && selectedAvropsradId) {
      return isCreatingAvrop ? "Ny avropsrad" : `Avropsrad ${selectedAvropsradId}`;
    }

    if (isLineItemDetailOpen && selectedLineItemId) {
      return isCreatingLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${selectedLineItemId}`;
    }

    if (selectedContractId) {
      return `Kontrakt ${selectedContractId}`;
    }

    if (isCustomerDetailOpen && selectedCustomerName) {
      return selectedCustomerName;
    }

    return currentMenuLabel;
  }, [
    currentMenuLabel,
    isCustomerDetailOpen,
    selectedCustomerName,
    selectedContractId,
    isContainerRoute,
    isAvropDetailOpen,
    selectedAvropsradId,
    isCreatingAvrop,
    isLineItemDetailOpen,
    selectedLineItemId,
    isCreatingLineItem,
    isPrislistekalkylRoute,
    isCreatingPriceList,
    isPriceListDetailOpen,
    selectedPriceListId,
    isPriceListRowDetailOpen,
    selectedPriceRowId,
    isCreatingPriceRow
  ]);

  useEffect(() => {
    document.title = `${deepestBreadcrumb} (${selectedCompany})`;
  }, [deepestBreadcrumb, selectedCompany]);

  // Clean up the navigation hash after tabs have been initialised from it.
  // State is read in the useState initialisers above (not here) to avoid setState-in-effect.
  // The cleanup cancels the timer so the hash survives StrictMode's unmount/remount cycle.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#avropsrad" || hash === "#avrop") {
      const timer = setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

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
        isCustomerDetailOpen={isCustomerDetailOpen}
        isCreatingCustomer={isCreatingCustomer}
        selectedCustomerName={selectedCustomerName}
        isContractDetailOpen={isContractDetailOpen}
        isLineItemDetailOpen={isLineItemDetailOpen}
        selectedContractId={selectedContractId}
        selectedLineItemId={selectedLineItemId}
        isCreatingLineItem={isCreatingLineItem}
        contractListHref={`/${sectionSlug}/${menuSlug}`}
        contractDetailHref={selectedContractId ? `/${sectionSlug}/${menuSlug}/${selectedContractId}` : null}
        isPriceListDetailOpen={isPriceListDetailOpen}
        isCreatingPriceList={isCreatingPriceList}
        selectedPriceListId={selectedPriceListId}
        priceListHref={`/${sectionSlug}/${menuSlug}`}
        isPriceListRowDetailOpen={isPriceListRowDetailOpen}
        selectedPriceRowId={selectedPriceRowId}
        isCreatingPriceRow={isCreatingPriceRow}
        priceListDetailHref={selectedPriceListId ? `/${sectionSlug}/${menuSlug}/${selectedPriceListId}` : null}
        customerListHref="/marknad/kundlista"
        isAvropDetailOpen={isAvropDetailOpen}
        selectedAvropsradId={selectedAvropsradId}
        isCreatingAvrop={isCreatingAvrop}
        returnLineItemId={_savedReturnLineItemId}
        lineItemDetailHref={_savedReturnLineItemId && selectedContractId ? `/${sectionSlug}/${menuSlug}/${selectedContractId}/${_savedReturnLineItemId}` : null}
        isContainerRoute={isContainerRoute}
        isPrislistekalkylRoute={isPrislistekalkylRoute}
      >

        {isHomePage ? (
          <HomeView
            selectedCompany={selectedCompany}
            onNavigateToContracts={() => navigateToSection("marknad", "kontraktlista")}
            onNavigateToDeliveries={() => navigateToSection("marknad", "leveranslista")}
            onNavigateToPriceLists={() => navigateToSection("marknad", "prislistor")}
            onNavigateToReports={() => navigateToSection("rapporter", "dashboard")}
          />
        ) : !isContractDetailOpen && isContractListPage ? (
          <ContractListView
            textFields={textSearchFields}
            selectFields={selectSearchFields}
            checkboxFields={checkboxSearchFields}
            allTextFields={allTextSearchFields}
            allSelectFields={allSelectSearchFields}
            allCheckboxFields={allCheckboxSearchFields}
            searchValues={searchValues as Record<string, string | boolean>}
            globalSearchValue={globalSearchValue}
            isSearchMenuOpen={isSearchMenuOpen}
            draftSearchFields={draftSearchFields}
            searchButtonRef={searchButtonRef}
            searchMenuRef={searchMenuRef}
            getSelectOptions={(key) => getSelectOptions(key as SearchFieldKey)}
            onOpenSearchMenu={openSearchMenu}
            onCancelSearchMenu={cancelSearchFieldChanges}
            onToggleSearchFieldVisibility={(key) => toggleSearchFieldVisibility(key as SearchFieldKey)}
            onToggleSearchFieldFavorite={(key) => toggleSearchFieldFavorite(key as SearchFieldKey)}
            onSaveFavoriteKeys={saveFavoriteKeys}
            onSaveSearchFieldChanges={saveSearchFieldChanges}
            onClearSearchFieldChanges={clearSearchFieldChanges}
            onClearSearchValues={clearSearchValues}
            onGlobalSearchChange={setGlobalSearchValue}
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
            tableRows={filteredContractRows as Array<Record<string, string | undefined>>}
            selectedRowId={selectedRowId}
            onSelectMainTableRow={selectMainTableRow}
            getCellValue={(row, columnKey) => getCellValue(row as TableRow, columnKey as ColumnKey)}
            onOpenContractDetail={openContractDetail}
            getCustomerDetailHref={getCustomerDetailHref}
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
            onToggleLineColumnPin={(key) => toggleLineColumnPin(key as LineItemColumnKey)}
            visibleLineColumns={visibleLineColumns}
            lineItemRows={lineItemRows}
          />
        ) : isCreatingCustomer ? (
          <div className={styles.contractDetailPanel}>
            <CustomerCreateView
              onSave={() => navigateWithLoading(`/${sectionSlug}/kundlista`)}
              onCancel={() => navigateWithLoading(`/${sectionSlug}/kundlista`)}
            />
          </div>
        ) : isCustomerDetailRoute && !isCustomerDetailOpen ? (
          <CustomerListView
            textFields={customerTextSearchFields}
            selectFields={customerSelectSearchFields}
            checkboxFields={customerCheckboxSearchFields}
            allTextFields={allCustomerTextSearchFields}
            allSelectFields={allCustomerSelectSearchFields}
            allCheckboxFields={allCustomerCheckboxSearchFields}
            searchValues={customerSearchValues as Record<string, string | boolean>}
            globalSearchValue={customerGlobalSearchValue}
            isSearchMenuOpen={isCustomerSearchMenuOpen}
            draftSearchFields={draftCustomerSearchFields}
            searchButtonRef={customerSearchButtonRef}
            searchMenuRef={customerSearchMenuRef}
            getSelectOptions={(key) => getCustomerSelectOptions(key as CustomerSearchFieldKey)}
            onOpenSearchMenu={openCustomerSearchMenu}
            onCancelSearchMenu={cancelCustomerSearchFieldChanges}
            onToggleSearchFieldVisibility={(key) => toggleCustomerSearchFieldVisibility(key as CustomerSearchFieldKey)}
            onToggleSearchFieldFavorite={(key) => toggleCustomerSearchFieldFavorite(key as CustomerSearchFieldKey)}
            onSaveFavoriteKeys={saveCustomerFavoriteKeys}
            onSaveSearchFieldChanges={saveCustomerSearchFieldChanges}
            onClearSearchFieldChanges={clearCustomerSearchFieldChanges}
            onClearSearchValues={clearCustomerSearchValues}
            onGlobalSearchChange={setCustomerGlobalSearchValue}
            onSearchTextChange={(key, value) => setCustomerSearchValues((prev) => ({ ...prev, [key]: value }))}
            onSearchSelectChange={(key, value) => setCustomerSearchValues((prev) => ({ ...prev, [key]: value }))}
            onSearchCheckboxChange={(key, checked) => setCustomerSearchValues((prev) => ({ ...prev, [key]: checked }))}
            actionItems={customerActionItems}
            hasSelectedRows={selectedCustomerRowId !== null}
            onCreateCustomer={openNewCustomer}
            isColumnsMenuOpen={isCustomerColumnsMenuOpen}
            draftColumns={draftCustomerColumns}
            columnsMenuRef={customerColumnsMenuRef}
            columnsButtonRef={customerColumnsButtonRef}
            onOpenColumnsMenu={openCustomerColumnsMenu}
            onCancelColumnsMenu={cancelCustomerColumnChanges}
            onToggleColumnVisibility={(key) => toggleCustomerColumnVisibility(key as CustomerColumnKey)}
            onMoveColumn={(key, direction) => moveCustomerColumn(key as CustomerColumnKey, direction)}
            onSaveColumnChanges={saveCustomerColumnChanges}
            onResetColumnChanges={resetCustomerColumnChanges}
            onToggleColumnPin={(key) => toggleCustomerColumnPin(key as CustomerColumnKey)}
            orderedVisibleColumns={orderedVisibleCustomerColumns}
            tableRows={filteredCustomerRows as Array<Record<string, string | undefined>>}
            selectedRowId={selectedCustomerRowId}
            onSelectRow={(idx) => setSelectedCustomerRowId((prev) => prev === idx ? null : idx)}
            onOpenCustomerDetail={(kundnr) => {
              const row = customerTableRows.find((r) => r.kundnr === kundnr);
              if (row) navigateWithLoading(getCustomerDetailHref(row.leveransnamn));
            }}
          />
        ) : isCustomerDetailOpen && selectedCustomerName ? (
          <CustomerDetailView customerName={selectedCustomerName} detail={selectedCustomerDetail} />
        ) : !isContractDetailOpen && isDeliveryListPage ? (
          <DeliveryListView />
        ) : isCreatingPriceList ? (
          <div className={styles.contractDetailPanel}>
            <PriceListCreateView
              onSave={() => navigateWithLoading(`/${sectionSlug}/${menuSlug}`)}
              onCancel={() => navigateWithLoading(`/${sectionSlug}/${menuSlug}`)}
            />
          </div>
        ) : !isPriceListDetailOpen && !isContractDetailOpen && isPriceListPage ? (
          <PriceListView onOpenPriceListDetail={openPriceListDetail} onCreatePriceList={openNewPriceList} />
        ) : isPriceListDetailOpen && selectedPriceListId ? (
          isPrislistekalkylRoute ? (
            <div className={styles.contractDetailPanel}>
              <PrislistekalkylView
                priceListId={selectedPriceListId}
                onBack={() => navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}`)}
                onOpenPriceRowDetail={openPriceRowDetail}
              />
            </div>
          ) : isPriceListRowDetailOpen && selectedPriceRowId ? (
            <div className={styles.contractDetailPanel}>
              <PriceListRowDetailView priceListId={selectedPriceListId} priceRowId={selectedPriceRowId} onClose={() => navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedPriceListId}`)} />
            </div>
          ) : (
            <PriceListDetailView
              selectedPriceListId={selectedPriceListId}
              onOpenPriceRowDetail={openPriceRowDetail}
              onCreatePriceRow={openNewPriceRow}
              onOpenPrislistekalkyl={openPrislistekalkyl}
            />
          )
        ) : isContractDetailOpen ? (
          isContainerRoute && selectedContractId ? (
            <div className={styles.contractDetailPanel}>
              <ContainerView
                onBack={() => navigateWithLoading(`/${sectionSlug}/${menuSlug}/${selectedContractId}`)}
              />
            </div>
          ) : isAvropDetailOpen && selectedAvropsradId ? (
            <AvropsradDetailView
              avropsradId={selectedAvropsradId}
              initialData={_savedAvropsradEditData ?? undefined}
              onClose={closeAvropsradDetail}
              onSave={saveAvropsradDetail}
            />
          ) : (
            <ContractDetailView
              isLineItemDetailOpen={isLineItemDetailOpen}
              selectedLineItemId={selectedLineItemId}
              newLineItemDraftVersion={newLineItemDraftVersion}
              activeLineItemTab={activeLineItemTab}
              onChangeLineItemTab={setActiveLineItemTab}
              newLineItemDraftSeed={newLineItemDraftSeed}
              pinnedLineItemFields={pinnedLineItemFields}
              onTogglePinnedLineItemField={togglePinnedLineItemField}
              keepLineItemOpenAfterSave={keepLineItemOpenAfterSave}
              onToggleKeepLineItemOpenAfterSave={setKeepLineItemOpenAfterSave}
              onSaveAndCreateNewLineItem={saveAndCreateNewLineItem}
              onSaveAndCloseLineItem={closeLineItemDetail}
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
              onToggleLineColumnPin={(key) => toggleLineColumnPin(key as LineItemColumnKey)}
              onOpenLineItemDetail={openLineItemDetail}
              onCreateLineItem={openNewLineItem}
              onOpenContainer={openContainerView}
              onCreateAvropsrad={openNewAvropsrad}
              onOpenAvropsrad={openAvropsradDetail}
            />
          )
        ) : isSaljstodPage ? (
          <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", overflow: "hidden" }}>
            <SearchFiltersPanel
              textFields={customerTextSearchFields}
              selectFields={customerSelectSearchFields}
              checkboxFields={customerCheckboxSearchFields}
              allTextFields={allCustomerTextSearchFields}
              allSelectFields={allCustomerSelectSearchFields}
              allCheckboxFields={allCustomerCheckboxSearchFields}
              values={customerSearchValues as Record<string, string | boolean>}
              globalSearchValue={customerGlobalSearchValue}
              isMenuOpen={isCustomerSearchMenuOpen}
              draftFields={draftCustomerSearchFields}
              searchButtonRef={customerSearchButtonRef}
              searchMenuRef={customerSearchMenuRef}
              defaultActivePresetIndex={0}
              getSelectOptions={(key) => getCustomerSelectOptions(key as CustomerSearchFieldKey)}
              useAdvancedFilterLayout
              hideGlobalSearch
              fieldSets={[
                {
                  label: "Allmänt",
                  fields: [
                    { key: "enhet", label: "Enhet", control: "select", options: ["Bolag A", "Bolag B", "Bolag C"] },
                    { key: "lagerstalle", label: "Lagerställe", control: "select", options: ["Lager 1", "Lager 2", "Lager 3"] },
                    { key: "tradslag", label: "Trädslag", control: "select", options: ["Gran", "Furu"] },
                    { key: "aktTjocklek", label: "Akt tjocklek", control: "text", nomToggle: true, nomGroup: "tjocklekBredd" },
                    { key: "aktBredd", label: "Akt bredd", control: "text", nomToggle: true, nomGroup: "tjocklekBredd" },
                    { key: "kvalitet", label: "Kvalitet", control: "select", options: ["O/S", "C16", "C24", "NOBB", "Finsåg"] },
                    { key: "kvalitetsgrupp", label: "Kvalitetsgrupp", control: "select", options: ["KG1", "KG2", "KG3"] },
                    { key: "artNr", label: "ArtNr", control: "select", options: ["22120", "22121", "22122", "22123", "22124", "22125", "22126"] },
                    { key: "veckaFran", label: "Vecka från", control: "text" },
                    { key: "veckaTill", label: "Vecka till", control: "text" },
                    { key: "kund", label: "Kund", control: "select", options: ["Acme AB", "Globex Corp", "Initech HB", "Nordic Sten & Mark AB", "Luna Infrastruktur AB", "Skandinavisk Industriservice"] },
                    { key: "kontraktNr", label: "KontraktNr", control: "text" },
                    { key: "avropNr", label: "AvropNr", control: "text" },
                    { key: "extAvropNr", label: "Ext. AvropNr", control: "text" },
                    { key: "avropsradNr", label: "Avroprad nr", control: "text" },
                    { key: "typ", label: "Typ", control: "select", options: ["Kontrakt och avrop", "Kontrakt", "Avrop"] },
                    { key: "_div1", control: "divider" },
                    { key: "produkttypML", label: "ML", control: "checkbox-tri", sectionLabel: "Produkttyp" },
                    { key: "produkttypFL", label: "FL", control: "checkbox-tri" },
                    { key: "produkttypVFL", label: "VFL", control: "checkbox-tri" },
                    { key: "_div2", control: "divider" },
                    { key: "salesPlanned", label: "Sales planned", control: "checkbox", sectionLabel: "Avropsradstatus" },
                    { key: "customerPlanned", label: "Customer planned", control: "checkbox" },
                    { key: "loadPlanned", label: "Load planned", control: "checkbox" },
                  ],
                },
                {
                  label: "Övrigt",
                  fields: [
                    { key: "tradslag2", label: "Trädslag", control: "select", options: ["Gran", "Furu"] },
                    { key: "aktTjocklek2", label: "Akt tjocklek", control: "text" },
                    { key: "aktBredd2", label: "Akt bredd", control: "text" },
                    { key: "hyvelprofil", label: "Hyvelprofil", control: "select", options: ["Aktiv", "Inaktiv", "Alla"] },
                    { key: "impregnering", label: "Impregnering", control: "select", options: ["NTR A", "NTR AB", "NTR B", "Ingen"] },
                    { key: "malning", label: "Målning", control: "select", options: ["Röd", "Grön", "Ofärgad"] },
                    { key: "pakettyp2", label: "Pakettyp", control: "select", options: ["Lp", "Pk"] },
                    { key: "fuktkvot", label: "Fuktkvot", control: "select", options: ["Torr", "Grön"] },
                    { key: "sagsatt", label: "Sågsätt", control: "select", options: ["Sågat", "Hyvlat", "Kluvet"] },
                    { key: "extra", label: "Extra", control: "select", options: ["Alt 1", "Alt 2", "Alt 3"] },
                  ],
                },
              ]}
              onOpenMenu={openCustomerSearchMenu}
              onCancelMenu={cancelCustomerSearchFieldChanges}
              onToggleFieldVisibility={(key) => toggleCustomerSearchFieldVisibility(key as CustomerSearchFieldKey)}
              onToggleFieldFavorite={(key) => toggleCustomerSearchFieldFavorite(key as CustomerSearchFieldKey)}
              onSaveFavoriteKeys={saveCustomerFavoriteKeys}
              onSaveMenu={saveCustomerSearchFieldChanges}
              onClearMenu={clearCustomerSearchFieldChanges}
              onClearValues={clearCustomerSearchValues}
              onGlobalSearchChange={setCustomerGlobalSearchValue}
              onTextChange={(key, value) => setCustomerSearchValues((prev) => ({ ...prev, [key]: value }))}
              onSelectChange={(key, value) => setCustomerSearchValues((prev) => ({ ...prev, [key]: value }))}
              onCheckboxChange={(key, checked) => setCustomerSearchValues((prev) => ({ ...prev, [key]: checked }))}
            />
            <div style={{ padding: "0 10px" }}>
              <div className={styles.contractMudTabBar}>
                <button
                  type="button"
                  className={`${styles.contractMudTabItem} ${saljstodTab === "lager" ? styles.contractMudTabItemActive : ""}`}
                  onClick={() => setSaljstodTab("lager")}
                >
                  Lager
                </button>
                <button
                  type="button"
                  className={`${styles.contractMudTabItem} ${saljstodTab === "avrop" ? styles.contractMudTabItemActive : ""}`}
                  onClick={() => setSaljstodTab("avrop")}
                >
                  Avrop
                </button>
              </div>
            </div>
            {saljstodTab === "lager" && (
              <div className={styles.freightTabContent}>
                <div className={styles.lagerFilterBar} style={{ paddingBottom: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    className={styles.lineItemsToggleButton}
                    onClick={() => navigateWithLoading("/marknad/leveranslista")}
                  >
                    Till lagerlista
                  </Button>
                  <div style={{ flex: 1 }} />
                  <label className={styles.lagerFilterCheckboxLabel}>
                    <Checkbox
                      size="small"
                      checked={lagerVisaTommaRader}
                      onChange={(e) => setLagerVisaTommaRader(e.target.checked)}
                    />
                    <span className={styles.lagerFilterCheckboxText}>Visa tomma rader</span>
                  </label>
                  <div className={styles.lagerFilterDivider} />
                  <div className={styles.lagerFilterGroup}>
                    <span className={styles.lagerFilterLabel}>Kontraktsvolym</span>
                    <TextField
                      size="small"
                      placeholder="Från"
                      value={lagerKontraktsvolymFran}
                      onChange={(e) => setLagerKontraktsvolymFran(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                    <span className={styles.lagerFilterSeparator}>–</span>
                    <TextField
                      size="small"
                      placeholder="Till"
                      value={lagerKontraktsvolymTill}
                      onChange={(e) => setLagerKontraktsvolymTill(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                  </div>
                  <div className={styles.lagerFilterDivider} />
                  <div className={styles.lagerFilterGroup}>
                    <span className={styles.lagerFilterLabel}>Avropsvolym</span>
                    <TextField
                      size="small"
                      placeholder="Från"
                      value={lagerAvropsvolymFran}
                      onChange={(e) => setLagerAvropsvolymFran(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                    <span className={styles.lagerFilterSeparator}>–</span>
                    <TextField
                      size="small"
                      placeholder="Till"
                      value={lagerAvropsvolymTill}
                      onChange={(e) => setLagerAvropsvolymTill(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                  </div>
                  <div className={styles.lagerFilterDivider} />
                  <div className={styles.lagerFilterGroup}>
                    <span className={styles.lagerFilterLabel}>Färdiglagervolym</span>
                    <TextField
                      size="small"
                      placeholder="Från"
                      value={lagerFardiglagervolymFran}
                      onChange={(e) => setLagerFardiglagervolymFran(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                    <span className={styles.lagerFilterSeparator}>–</span>
                    <TextField
                      size="small"
                      placeholder="Till"
                      value={lagerFardiglagervolymTill}
                      onChange={(e) => setLagerFardiglagervolymTill(e.target.value)}
                      className={styles.lagerFilterRangeInput}
                    />
                  </div>
                </div>
                <div className={styles.freightSection}>
                  <div className={styles.lineItemsTableFrame}>
                    <div className={styles.freightTableWrap}>
                      <div className={styles.freightTable}>
                        <DataTable
                          variant="main"
                          fillRemainingSpace
                          columns={LAGER_COLUMNS}
                          rows={filteredLagerRows}
                          rowKey={(_row, index) => `lager-${index}`}
                          selectedRowIndex={selectedLagerRow}
                          onRowClick={(index) => setSelectedLagerRow((prev) => (prev === index ? null : index))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto", border: "1px solid #dfe3ea", borderRadius: 8, background: "#ffffff", flexShrink: 0 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                    <thead>
                      <tr>
                        {(["Typ", "Enhet", "Summa", "Övr", "Fix", ...LAGER_LENGTHS] as string[]).map((col, i) => (
                          <th key={`lager-detail-th-${i}`} style={{
                            padding: "7px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6a7483",
                            background: "#f4f6fb",
                            borderBottom: "1px solid #e2e6ee",
                            whiteSpace: "nowrap",
                            textAlign: i === 0 ? "left" : "right",
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lagerDetailRows.map((row, i) => (
                        <tr key={`lager-detail-row-${i}`} style={{ background: i % 2 === 0 ? "#ffffff" : "#fafbfd" }}>
                          <td style={{ padding: "6px 10px", fontSize: 12, color: "#404753", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", fontWeight: 600 }}>{row.typ}</td>
                          <td style={{ padding: "6px 10px", fontSize: 12, color: "#6a7483", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", textAlign: "right" }}>{row.enhet}</td>
                          <td style={{ padding: "6px 10px", fontSize: 12, color: "#404753", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", textAlign: "right", fontWeight: 600 }}>{row.summa}</td>
                          <td style={{ padding: "6px 10px", fontSize: 12, color: "#404753", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", textAlign: "right" }}>{row.ovr}</td>
                          <td style={{ padding: "6px 10px", fontSize: 12, color: "#404753", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", textAlign: "right" }}>{row.fix}</td>
                          {LAGER_LENGTHS.map((len) => (
                            <td key={`lager-detail-${i}-${len}`} style={{ padding: "6px 10px", fontSize: 12, color: "#404753", borderBottom: "1px solid #eef1f6", whiteSpace: "nowrap", textAlign: "right" }}>{row[len]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {saljstodTab === "avrop" && (
              <div className={styles.freightTabContent}>
                <ActionRow
                  items={[
                    { label: "Avropsrad", icon: <AddIcon fontSize="small" />, tone: "primary", enabled: selectedAvropRow !== null },
                    { kind: "divider" },
                    { label: "Lastorder", icon: <AddIcon fontSize="small" /> },
                    { label: "Redigera lastorder", icon: <EditOutlinedIcon fontSize="small" />, enabled: selectedAvropRow !== null },
                    { kind: "divider" },
                    { label: "Avregistrera", enabled: selectedAvropRow !== null },
                    { label: "Ändra status", enabled: selectedAvropRow !== null },
                    { kind: "divider" },
                    { label: "Till lagerlista" },
                  ]}
                  rightSlot={
                    <>
                      <label className={styles.lagerFilterCheckboxLabel}>
                        <Checkbox
                          size="small"
                          checked={avropAvreg === "on"}
                          indeterminate={avropAvreg === "indeterminate"}
                          onChange={() => setAvropAvreg((prev) => prev === "off" ? "indeterminate" : prev === "indeterminate" ? "on" : "off")}
                        />
                        <span className={styles.lagerFilterCheckboxText}>Avreg</span>
                      </label>
                      <div className={styles.lagerFilterDivider} />
                      <TextField
                        size="small"
                        label="Land"
                        select
                        value={avropLand}
                        onChange={(e) => setAvropLand(e.target.value)}
                        sx={{ minWidth: 160 }}
                      >
                        <MenuItem value="">Alla</MenuItem>
                        <MenuItem value="SE">Sverige</MenuItem>
                        <MenuItem value="NO">Norge</MenuItem>
                        <MenuItem value="DK">Danmark</MenuItem>
                        <MenuItem value="FI">Finland</MenuItem>
                        <MenuItem value="DE">Tyskland</MenuItem>
                        <MenuItem value="GB">Storbritannien</MenuItem>
                      </TextField>
                      <TextField
                        size="small"
                        label="Registrerad av"
                        select
                        value={avropRegistreradAv}
                        onChange={(e) => setAvropRegistreradAv(e.target.value)}
                        sx={{ minWidth: 180 }}
                      >
                        <MenuItem value="">Alla</MenuItem>
                        <MenuItem value="anna">Anna Lindgren</MenuItem>
                        <MenuItem value="bjorn">Björn Karlsson</MenuItem>
                        <MenuItem value="cecilia">Cecilia Ström</MenuItem>
                        <MenuItem value="david">David Eriksson</MenuItem>
                      </TextField>
                    </>
                  }
                />
                <div className={styles.freightSection}>
                  <div className={styles.lineItemsTableFrame}>
                    <div className={styles.freightTableWrap}>
                      <div className={styles.freightTable}>
                        <DataTable
                          variant="main"
                          fillRemainingSpace
                          columns={AVROP_COLUMNS}
                          rows={AVROP_ROWS}
                          rowKey={(_row, index) => `avrop-${index}`}
                          selectedRowIndex={selectedAvropRow}
                          onRowClick={(index) => setSelectedAvropRow((prev) => (prev === index ? null : index))}
                          renderCell={(row, column) => {
                            if (column.key === "kontraktsNr") {
                              return (
                                <button
                                  type="button"
                                  className={styles.contractLinkButton}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {row.kontraktsNr}
                                </button>
                              );
                            }
                            if (column.key === "avropradNr" && row.avropradNr) {
                              return (
                                <button
                                  type="button"
                                  className={styles.contractLinkButton}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {row.avropradNr}
                                </button>
                              );
                            }
                            return row[column.key as keyof AvropRow];
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
    </main>
  );
}

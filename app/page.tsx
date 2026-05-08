"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import DvrOutlinedIcon from "@mui/icons-material/DvrOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
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
import { type NewContractDraft } from "./components/ContractCreateView";
import { type LineItemDetailTab, type NewLineItemDraft } from "./components/contract-tabs/LineItemDetailView";
import {
  AppShellLayout,
  ContractDetailView,
  ContractListView,
  DeliveryListView,
  HomeView,
  PriceListDetailView,
  PriceListRowDetailView,
  PriceListView
} from "./components/views";
import { CustomerDetailView, type CustomerDetailData } from "./components/CustomerDetailView";
import { useColorMode, useUiState } from "./providers";
import styles from "./page.module.scss";

type SectionKey = "hem" | "marknad" | "produktion" | "leverans" | "rapporter" | "systemhantering" | "system";

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
  { label: "Nytt kontrakt", icon: <AddIcon fontSize="small" />, requiresSelection: false },
  { label: "Ta bort", icon: <DeleteOutlineOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Skriv ut", icon: <PrintOutlinedIcon fontSize="small" />, requiresSelection: true },
  { label: "Kopiera", icon: <ContentCopyOutlinedIcon fontSize="small" />, requiresSelection: true },
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
  | "saknarAvtalsratt"
  | "saknarAvtal"
  | "avtalsrattSaknasI"
  | "cLoad";

type SearchFieldConfig = {
  key: SearchFieldKey;
  label: string;
  control: "text" | "select" | "checkbox";
  visible: boolean;
  favorite: boolean;
};

const defaultSearchFields: SearchFieldConfig[] = [
  { key: "artNr", label: "ArtNr", control: "text", visible: false, favorite: false },
  { key: "certifiering", label: "Certifiering", control: "select", visible: false, favorite: false },
  { key: "bolag", label: "Enhet", control: "select", visible: false, favorite: false },
  { key: "externtKontraktsnr", label: "Externt kontraktsnr", control: "text", visible: true, favorite: false },
  { key: "kategori", label: "Kategori", control: "select", visible: false, favorite: false },
  { key: "kontraktsNr", label: "KontraktsNr", control: "text", visible: true, favorite: true },
  { key: "kontraktsdatumFran", label: "Kontraktsdatum från", control: "text", visible: false, favorite: false },
  { key: "kontraktsdatumTill", label: "Kontraktsdatum till", control: "text", visible: false, favorite: false },
  { key: "kund", label: "Kund", control: "text", visible: false, favorite: true },
  { key: "land", label: "Land", control: "select", visible: false, favorite: false },
  { key: "mottagarland", label: "Mottagarland", control: "select", visible: false, favorite: false },
  { key: "prislistaNr", label: "Prislista nr", control: "text", visible: false, favorite: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: false, favorite: false },
  { key: "typ", label: "Typ", control: "select", visible: true, favorite: true },
  { key: "upprattatAv", label: "Upprättat av", control: "text", visible: false, favorite: true },
  { key: "varningsnivaFordran", label: "Varningsnivå fordran", control: "select", visible: false, favorite: false },
  { key: "varningsnivaLimit", label: "Varningsnivå limit", control: "select", visible: false, favorite: false },
  { key: "saknarAvtalsratt", label: "Saknar avtalsrutt", control: "checkbox", visible: false, favorite: false },
  { key: "saknarAvtal", label: "Saknar avtal", control: "checkbox", visible: false, favorite: false },
  { key: "cLoad", label: "Avtalsrutt saknas i C-Load", control: "checkbox", visible: false, favorite: false }
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
  saknarAvtalsratt: false,
  saknarAvtal: false,
  avtalsrattSaknasI: "",
  cLoad: false
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
  { key: "upprattatAv", label: "Upprättat av", visible: true, pinned: false },
  { key: "kontraktsvolym", label: "Kontraktsvol", visible: true, pinned: false },
  { key: "levVolym", label: "Lev volym", visible: true, pinned: false },
  { key: "olevVolym", label: "Olev volym", visible: true, pinned: false },
  { key: "avropatProcent", label: "Avropat %", visible: true, pinned: false },
  { key: "prislistaNr", label: "Prislista nr", visible: true, pinned: false },
  { key: "utlastningssparr", label: "Utlastningsspärr", visible: true, pinned: false },
  { key: "tillhor", label: "Tillhör", visible: true, pinned: false },
  { key: "limit", label: "Limit", visible: true, pinned: false }
];

const defaultColumns: ColumnConfig[] = [
  ...baseContractColumns,
  ...CONTRACT_CREATE_FIELD_COLUMNS
    .filter(({ key }) => !baseContractColumns.some((column) => column.key === key))
    .map(({ key, label }) => ({ key, label, visible: false, pinned: false })),
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
    comment: "Strategisk kund med löpande projektleveranser och hög prognosprecision."
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
    comment: "Kräver engelska dokument och samlad avisering inför varje delleverans."
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
    comment: "Limitöverskridande kund. Kontrollera godkännande innan ny order släpps vidare."
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
    comment: "Föredrar leveransfönster tisdag till torsdag och avisering senast dagen före."
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
    comment: "Stor kund med flera parallella projekt. Samordna prislista och kontraktsförlängningar."
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
    comment: "Kund med tät uppföljning på leveransprecision och månatlig avstämning av limit."
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
  { key: "responsibleCompany", label: "Ansvarigt bolag" },
  { key: "priceList", label: "Prislista (rad)" },
  { key: "certification", label: "Certifiering (rad)" },
  { key: "contractNumber", label: "Kontraktsnummer (rad)" },
  { key: "comboPackageNumber", label: "Kombipaketnummer" },
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
  { key: "idRad", label: "ID-rad", visible: true, pinned: true },
  { key: "status", label: "Status", visible: true, pinned: false },
  { key: "underkonto", label: "Underkonto", visible: true, pinned: false },
  { key: "artikelNr", label: "Artikelnr", visible: true, pinned: false },
  { key: "produkt", label: "Produkt", visible: true, pinned: false },
  { key: "langd", label: "Längd", visible: true, pinned: false },
  { key: "mangd", label: "Mängd", visible: true, pinned: false },
  { key: "enhet", label: "Enhet faktura", visible: true, pinned: false },
  { key: "aPris", label: "A-pris", visible: true, pinned: false },
  { key: "rabatt", label: "Rabatt", visible: true, pinned: false },
  { key: "volym", label: "Volym", visible: false, pinned: false },
  { key: "leverans", label: "Leverans", visible: true, pinned: false },
  { key: "lager", label: "Lager", visible: true, pinned: false },
  { key: "prisOrt", label: "Prisort", visible: false, pinned: false },
  { key: "transport", label: "Transport", visible: false, pinned: false },
  { key: "nettoSek", label: "Netto SEK", visible: true, pinned: false },
  { key: "radKommentar", label: "Radkommentar", visible: false, pinned: false }
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
}));

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
  const lineItemId = pathParts[3] ?? null;
  const isContractDetailRoute = sectionSlug === "marknad" && menuSlug === "kontraktlista";
  const isCustomerDetailRoute = sectionSlug === "marknad" && menuSlug === "kundlista";
  const isPriceListRoute = sectionSlug === "marknad" && menuSlug === "prislistor";
  const isContractDetailOpen = isContractDetailRoute && Boolean(contractId);
  const isCustomerDetailOpen = isCustomerDetailRoute && Boolean(contractId);
  const isPriceListDetailOpen = isPriceListRoute && Boolean(contractId);
  const selectedContractId = isContractDetailRoute ? contractId : null;
  const selectedCustomerName = isCustomerDetailRoute && contractId ? decodePathSegment(contractId) : null;
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
  const [activeContractTab, setActiveContractTab] = useState<ContractTab>("Kontraktsrader");
  const [activeLineItemTab, setActiveLineItemTab] = useState<LineItemDetailTab>("Längdfördelning");
  const [selectedCompany, setSelectedCompany] = useState(fakeCompanies[0]);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [searchValues, setSearchValues] = useState<SearchValueMap>(initialSearchValues);
  const [globalSearchValue, setGlobalSearchValue] = useState("");
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
  const [pinnedLineItemFields, setPinnedLineItemFields] = useState<Set<keyof NewLineItemDraft>>(new Set());
  const [keepLineItemOpenAfterSave, setKeepLineItemOpenAfterSave] = useState(false);
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
          return "";
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
        case "saknarAvtalsratt":
          return (row.egenAnmarkning ?? "").toLowerCase().includes("avtalsrätt saknas");
        case "saknarAvtal":
          return (row.status ?? "").toLowerCase() !== "aktivt kontrakt";
        case "cLoad":
          return (row.egenAnmarkning ?? "").toLowerCase().includes("c-load");
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

  const getCustomerDetailHref = (customerName: string) => `/marknad/kundlista/${encodeURIComponent(customerName)}`;

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
    if (isPriceListRowDetailOpen && selectedPriceRowId) {
      return isCreatingPriceRow ? "Ny prislistrad" : `Prislistrad ${selectedPriceRowId}`;
    }

    if (isPriceListDetailOpen && selectedPriceListId) {
      return selectedPriceListId === "new" ? "Ny prislista" : `Prislista ${selectedPriceListId}`;
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
    document.title = `${deepestBreadcrumb} (${selectedCompany})`;
  }, [deepestBreadcrumb, selectedCompany]);

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
        selectedCustomerName={selectedCustomerName}
        isContractDetailOpen={isContractDetailOpen}
        isLineItemDetailOpen={isLineItemDetailOpen}
        selectedContractId={selectedContractId}
        selectedLineItemId={selectedLineItemId}
        isCreatingLineItem={isCreatingLineItem}
        contractListHref={`/${sectionSlug}/${menuSlug}`}
        contractDetailHref={selectedContractId ? `/${sectionSlug}/${menuSlug}/${selectedContractId}` : null}
        isPriceListDetailOpen={isPriceListDetailOpen}
        selectedPriceListId={selectedPriceListId}
        priceListHref={`/${sectionSlug}/${menuSlug}`}
        isPriceListRowDetailOpen={isPriceListRowDetailOpen}
        selectedPriceRowId={selectedPriceRowId}
        isCreatingPriceRow={isCreatingPriceRow}
        priceListDetailHref={selectedPriceListId ? `/${sectionSlug}/${menuSlug}/${selectedPriceListId}` : null}
        customerListHref="/marknad/kundlista"
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
        ) : isCustomerDetailOpen && selectedCustomerName ? (
          <CustomerDetailView customerName={selectedCustomerName} detail={selectedCustomerDetail} />
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

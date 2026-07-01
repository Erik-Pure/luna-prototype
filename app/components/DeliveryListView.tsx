"use client";

import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StraightenIcon from "@mui/icons-material/Straighten";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItemButton, ListItemText, Popover, Typography } from "@mui/material";
import { ActionRow } from "./shared/ActionRow";
import { ActionMenuButton } from "./shared/ActionMenuButton";
import { AndraDetaljerDialog } from "./AndraDetaljerDialog";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { DataTable } from "./shared/DataTable";
import styles from "../page.module.scss";

const deliverySelectOptions: Record<string, string[]> = {
  kund: ["XL Bygg", "Derome", "Optimera", "Byggmax", "Woody Bygghandel"],
  mottagarland: ["SE", "NO", "FI", "DK", "DE"],
  leveranssatt: ["Bil", "Tåg", "Båt", "Hämtas"],
  mottagandeHamn: ["Göteborg", "Stockholm", "Malmö", "Norrköping", "Sundsvall"],
  utlastandeEnhet: ["BP Hissmofors", "BP Kramfors", "BP Bollstabruk"],
  ansvarigEnhet: ["BP Hissmofors", "BP Kramfors", "BP Bollstabruk"],
  utlastandeLagerstalle: ["Krokom", "Östersund", "Sundsvall", "Kramfors"],
  certifiering: ["PEFC", "FSC", "Ingen"],
  registreradAv: ["JN", "EK", "LM", "AA"],
  artnr: ["22120", "22121", "22122", "22123", "22124", "22125", "22126"],
  tradslag: ["Gran", "Furu"],
  kvalitet: ["O/S", "C16", "C24", "NOBB", "Finsåg"],
  vflGrupp: ["VFL-1", "VFL-2", "VFL-3", "VFL-4"],
  fuktkvot: ["Torr", "Grön", "15%", "18%", "20%"],
  hyvelprofil: ["Aktiv", "Inaktiv", "Alla"],
  malning: ["Röd", "Grön", "Ofärgad"],
  impregnering: ["NTR A", "NTR AB", "NTR B", "Ingen"],
  extra: ["Alt 1", "Alt 2", "Alt 3"],
  langdklass: ["Klass 1", "Klass 2", "Klass 3"],
};

const pakettyp_TABLE = [
  { code: "0", label: "Okapat" },
  { code: "1", label: "LP" },
  { code: "2", label: "Halvlängd" },
  { code: "3", label: "Kapping" },
  { code: "4", label: "Hyvelkvalitet" },
  { code: "5", label: "Impregnat" },
  { code: "6", label: "Målat" },
  { code: "7", label: "Fingerskarvat" },
  { code: "8", label: "Kombi" },
  { code: "9", label: "Special" },
  { code: "10", label: "Kortlängd" },
  { code: "11", label: "Skarv" },
];

const sagsatt_TABLE = [
  { code: "0", label: "Centrum" },
  { code: "1", label: "1xLog, märgbit" },
  { code: "2", label: "2xLog" },
  { code: "3", label: "3xLog" },
  { code: "4", label: "4xLog" },
  { code: "5", label: "Sidoplankor" },
  { code: "6", label: "Kantskuret" },
  { code: "7", label: "Fritt sågat" },
];

const FIELD_SETS = [
  {
    label: "Allmänt",
    fields: [
      { key: "kund", label: "Kund", control: "select" as const, options: deliverySelectOptions.kund },
      { key: "kontraktsnr", label: "Kontraktsnr", control: "text" as const },
      { key: "extKontraktsnr", label: "Ext. kontraktsnr", control: "text" as const },
      { key: "avropNr", label: "AvropNr", control: "text" as const },
      { key: "avropradNr", label: "Avroprad nr", control: "text" as const },
      { key: "mottagarland", label: "Mottagarland", control: "select" as const, options: deliverySelectOptions.mottagarland },
      { key: "veckaFran", label: "Vecka från", control: "text" as const },
      { key: "veckaTill", label: "Vecka till", control: "text" as const },
      { key: "leveranssatt", label: "Leveranssätt", control: "select" as const, options: deliverySelectOptions.leveranssatt },
      { key: "levTidigast", label: "Lev. tidigast", control: "text" as const },
      { key: "levSenast", label: "Lev. senast", control: "text" as const },
      { key: "skeppningsveckaFran", label: "Skeppningsvecka från", control: "text" as const },
      { key: "skeppningsveckaTill", label: "Skeppningsvecka till", control: "text" as const },
      { key: "mottagandeHamn", label: "Mottagande hamn", control: "select" as const, options: deliverySelectOptions.mottagandeHamn },
      { key: "internKommentar", label: "Intern kommentar", control: "text" as const },
      { key: "externKommentar", label: "Extern kommentar", control: "text" as const },
      { key: "utlastandeEnhet", label: "Utlastande enhet", control: "select" as const, options: deliverySelectOptions.utlastandeEnhet },
      { key: "ansvarigEnhet", label: "Ansvarig enhet", control: "select" as const, options: deliverySelectOptions.ansvarigEnhet },
      { key: "utlastandeLagerstalle", label: "Utlastande lagerställe", control: "select" as const, options: deliverySelectOptions.utlastandeLagerstalle },
      { key: "kundmarke", label: "Kundmärke", control: "text" as const },
      { key: "certifiering", label: "Certifiering", control: "select" as const, options: deliverySelectOptions.certifiering },
      { key: "registreradAv", label: "Registrerad av", control: "select" as const, options: deliverySelectOptions.registreradAv },
      { key: "lastorderNr", label: "LastorderNr", control: "text" as const },
      { key: "_div1", control: "divider" as const },
      { key: "avreg", label: "Avreg", control: "checkbox-tri" as const, sectionLabel: "Övrigt" },
      { key: "lev", label: "Lev", control: "checkbox-tri" as const },
      { key: "merAttAvropa", label: "Mer att avropa", control: "checkbox-tri" as const },
      { key: "_div2", control: "divider" as const },
      { key: "salesPlanned", label: "Sales planned", control: "checkbox" as const, sectionLabel: "Avropradstatus" },
      { key: "customerPlanned", label: "Customer planned", control: "checkbox" as const },
      { key: "loadPlanned", label: "Load planned", control: "checkbox" as const },
      { key: "_div3", control: "divider" as const },
      { key: "typKontrakt", label: "Kontrakt", control: "checkbox" as const, sectionLabel: "Typ" },
      { key: "typAvrop", label: "Avrop", control: "checkbox" as const },
    ],
  },
  {
    label: "Produkt",
    fields: [
      { key: "p_artnr", label: "ArtNr", control: "select" as const, options: deliverySelectOptions.artnr },
      { key: "p_tradslag", label: "Trädslag", control: "select" as const, options: deliverySelectOptions.tradslag },
      { key: "p_aktTjocklekMin", label: "Akt tjocklek min", control: "text" as const, nomToggle: true, nomGroup: "p_tjocklek" },
      { key: "p_aktTjocklekMax", label: "Akt tjocklek max", control: "text" as const, nomToggle: true, nomGroup: "p_tjocklek" },
      { key: "p_aktBreddMin", label: "Akt bredd min", control: "text" as const, nomToggle: true, nomGroup: "p_bredd" },
      { key: "p_aktBreddMax", label: "Akt bredd max", control: "text" as const, nomToggle: true, nomGroup: "p_bredd" },
      { key: "p_kvalitet", label: "Kvalitet", control: "select" as const, options: deliverySelectOptions.kvalitet },
      { key: "p_pakettypFran", label: "Pakettyp från", control: "select" as const, tableOptions: pakettyp_TABLE, syncTo: "p_pakettypTill" },
      { key: "p_pakettypTill", label: "Pakettyp till", control: "select" as const, tableOptions: pakettyp_TABLE },
      { key: "p_vflGrupp", label: "VFL grupp", control: "select" as const, options: deliverySelectOptions.vflGrupp },
      { key: "p_fuktkvotMin", label: "Fuktkvot min", control: "select" as const, options: deliverySelectOptions.fuktkvot },
      { key: "p_fuktkvotMax", label: "Fuktkvot max", control: "select" as const, options: deliverySelectOptions.fuktkvot },
      { key: "p_sagsattFran", label: "Sågsätt från", control: "select" as const, tableOptions: sagsatt_TABLE },
      { key: "p_sagsattTill", label: "Sågsätt till", control: "select" as const, tableOptions: sagsatt_TABLE },
      { key: "p_hyvelprofil", label: "Hyvelprofil", control: "select" as const, options: deliverySelectOptions.hyvelprofil },
      { key: "p_malning", label: "Målning", control: "select" as const, options: deliverySelectOptions.malning },
      { key: "p_impregnering", label: "Impregnering", control: "select" as const, options: deliverySelectOptions.impregnering },
      { key: "p_extra", label: "Extra", control: "select" as const, options: deliverySelectOptions.extra },
      { key: "_pdiv1", control: "divider" as const },
      { key: "p_typKontrakt", label: "Kontrakt", control: "checkbox" as const, sectionLabel: "Typ" },
      { key: "p_typAvrop", label: "Avrop", control: "checkbox" as const },
    ],
  },
];

const LENGTHS = ["1.8", "2.1", "2.4", "2.7", "3.0", "3.3", "3.6", "3.9", "4.2", "4.5", "4.8", "5.1", "5.4"];

const BOTTOM_TABLE_COLUMNS = [
  { key: "KontraktsNr", label: "KontraktsNr", pinned: true as const },
  { key: "Avroprad nr", label: "Avroprad nr", pinned: true as const },
  ...([
    "Utlastande bolag", "Typ", "Kund",
    "Ext. AvropNr", "Produkt", "Pakettyp", "Emballage", "Pris", "Valuta",
    "Nettopris/m3", "Mängd", "Enhet", "Volym", "Lassbokat", "Levererad volym",
    "Avropsrest", "Nettolager", "Tillg. lager", "Dag", "Längdkrav",
    "Volym LO", "Produceras", "Kundens märke", "Vecka", "Leveranssätt",
    "Intern kommentar (kontraktsrad)", "Intern kommentar (avropsrad)", "ArtNr",
    "ML Rått", "AvropNr", "Råvarulager", "NominellTjocklek", "NominellBredd",
    "Ansvarig enhet", "Avropraddatum", "Utlastningsspår", "Skeppningsvecka",
    "ETD", "ETA", "ML Torrt", "Fartyg", "ClosingDate", "Speditör",
    "Restvärde SEK", "Restvärde", "Totalvärde SEK",
    "Totalvärde", "Status", "Cust week", "VFL grupp", "Leveransvillkor",
    "Lev. villkor ort", "Mottagande hamn", "Leveransperiod kunddokument",
    "LastorderNr", "Reserverat lagerflytt", "Leveransbokat",
    "Utlastande lagerställe", "Lev. tidigast", "Lev. senastlbl",
    "Ext. KontraktsNr", "Tidigaste lev. datum", "Kontraktsdatum",
    "Kurs", "Load Planned", "Ej leveransbokat",
    "Limit", "Load Planned rest", "Lass Sipal", "Godsmott. märke",
  ] as string[]).map((label) => ({ key: label, label })),
];

const BOTTOM_TABLE_ROWS = [
  {
    "Utlastande bolag": "BP Hissmofors", "KontraktsNr": "K-2024-001", "Avroprad nr": "001",
    "Typ": "Kontrakt", "Kund": "XL Bygg", "Ext. AvropNr": "XLB-9921", "Produkt": "22120",
    "Pakettyp": "LP", "Emballage": "Film", "Pris": "1 250", "Valuta": "SEK",
    "Nettopris/m3": "1 250", "Mängd": "50", "Enhet": "m3", "Volym": "150",
    "Lassbokat": "Ja", "Levererad volym": "30", "Avropsrest": "20", "Nettolager": "90",
    "Tillg. lager": "150", "Dag": "Mån", "Längdkrav": "3.0", "Volym LO": "120",
    "Produceras": "Ja", "Kundens märke": "XLB-REF", "Vecka": "26", "Leveranssätt": "Bil",
    "Intern kommentar (kontraktsrad)": "OK att leverera", "Intern kommentar (avropsrad)": "",
    "ArtNr": "22120", "ML Rått": "48", "AvropNr": "A-2024-001", "Råvarulager": "200",
    "NominellTjocklek": "50", "NominellBredd": "100", "Ansvarig enhet": "BP Hissmofors",
    "Avropraddatum": "2024-06-15", "Utlastningsspår": "Spår 2", "Skeppningsvecka": "26",
    "ETD": "2024-07-01", "ETA": "2024-07-03", "ML Torrt": "45", "Fartyg": "",
    "ClosingDate": "2024-06-28", "Speditör": "DB Schenker", "Restvärde SEK": "25 000",
    "Restvärde": "2 400", "Totalvärde SEK": "187 500",
    "Totalvärde": "187 500", "Status": "Planerad", "Cust week": "26", "VFL grupp": "VFL-1",
    "Leveransvillkor": "DAP", "Lev. villkor ort": "Stockholm", "Mottagande hamn": "Stockholm",
    "Leveransperiod kunddokument": "V26-V27", "LastorderNr": "LO-001", "Reserverat lagerflytt": "Ja",
    "Leveransbokat": "Ja", "Utlastande lagerställe": "Krokom",
    "Lev. tidigast": "2024-07-01", "Lev. senastlbl": "2024-07-05",
    "Ext. KontraktsNr": "XLB-K001", "Tidigaste lev. datum": "2024-07-01",
    "Kontraktsdatum": "2024-01-15", "Kurs": "1,00", "Load Planned": "Ja", "Ej leveransbokat": "Nej",
    "Limit": "200", "Load Planned rest": "120", "Lass Sipal": "Nej", "Godsmott. märke": "XLB-26",
  },
  {
    "Utlastande bolag": "BP Kramfors", "KontraktsNr": "K-2024-002", "Avroprad nr": "002",
    "Typ": "Avrop", "Kund": "Derome", "Ext. AvropNr": "DER-4412", "Produkt": "22122",
    "Pakettyp": "Kapping", "Emballage": "Band", "Pris": "1 380", "Valuta": "SEK",
    "Nettopris/m3": "1 380", "Mängd": "40", "Enhet": "m3", "Volym": "144",
    "Lassbokat": "Nej", "Levererad volym": "20", "Avropsrest": "20", "Nettolager": "89",
    "Tillg. lager": "144", "Dag": "Tis", "Längdkrav": "3.6", "Volym LO": "100",
    "Produceras": "Ja", "Kundens märke": "DER-REF2", "Vecka": "27", "Leveranssätt": "Tåg",
    "Intern kommentar (kontraktsrad)": "", "Intern kommentar (avropsrad)": "Kund vill ha tidig lev.",
    "ArtNr": "22122", "ML Rått": "44", "AvropNr": "A-2024-002", "Råvarulager": "180",
    "NominellTjocklek": "45", "NominellBredd": "95", "Ansvarig enhet": "BP Kramfors",
    "Avropraddatum": "2024-06-20", "Utlastningsspår": "Spår 1", "Skeppningsvecka": "27",
    "ETD": "2024-07-08", "ETA": "2024-07-10", "ML Torrt": "41", "Fartyg": "Finntimber",
    "ClosingDate": "2024-07-05", "Speditör": "DHL Freight", "Restvärde SEK": "27 600",
    "Restvärde": "2 760", "Totalvärde SEK": "198 720",
    "Totalvärde": "198 720", "Status": "Bekräftad", "Cust week": "27", "VFL grupp": "VFL-2",
    "Leveransvillkor": "FCA", "Lev. villkor ort": "Kramfors", "Mottagande hamn": "Göteborg",
    "Leveransperiod kunddokument": "V27-V28", "LastorderNr": "LO-002", "Reserverat lagerflytt": "Ja",
    "Leveransbokat": "Nej", "Utlastande lagerställe": "Kramfors",
    "Lev. tidigast": "2024-07-08", "Lev. senastlbl": "2024-07-12",
    "Ext. KontraktsNr": "DER-K002", "Tidigaste lev. datum": "2024-07-08",
    "Kontraktsdatum": "2024-02-01", "Kurs": "1,00", "Load Planned": "Nej", "Ej leveransbokat": "Ja",
    "Limit": "180", "Load Planned rest": "80", "Lass Sipal": "Ja", "Godsmott. märke": "DER-27",
  },
  {
    "Utlastande bolag": "BP Bollstabruk", "KontraktsNr": "K-2024-003", "Avroprad nr": "003",
    "Typ": "Kontrakt", "Kund": "Optimera", "Ext. AvropNr": "OPT-7731", "Produkt": "22124",
    "Pakettyp": "Halvlängd", "Emballage": "Film", "Pris": "1 420", "Valuta": "SEK",
    "Nettopris/m3": "1 420", "Mängd": "30", "Enhet": "m3", "Volym": "126",
    "Lassbokat": "Ja", "Levererad volym": "10", "Avropsrest": "20", "Nettolager": "86",
    "Tillg. lager": "126", "Dag": "Ons", "Längdkrav": "4.2", "Volym LO": "80",
    "Produceras": "Nej", "Kundens märke": "OPT-C3", "Vecka": "28", "Leveranssätt": "Båt",
    "Intern kommentar (kontraktsrad)": "Kontrollera mått", "Intern kommentar (avropsrad)": "",
    "ArtNr": "22124", "ML Rått": "52", "AvropNr": "A-2024-003", "Råvarulager": "160",
    "NominellTjocklek": "50", "NominellBredd": "125", "Ansvarig enhet": "BP Bollstabruk",
    "Avropraddatum": "2024-06-25", "Utlastningsspår": "Spår 3", "Skeppningsvecka": "28",
    "ETD": "2024-07-15", "ETA": "2024-07-18", "ML Torrt": "49", "Fartyg": "Estraden",
    "ClosingDate": "2024-07-12", "Speditör": "Green Cargo", "Restvärde SEK": "28 400",
    "Restvärde": "2 520", "Totalvärde SEK": "178 920",
    "Totalvärde": "178 920", "Status": "Levererad", "Cust week": "28", "VFL grupp": "VFL-3",
    "Leveransvillkor": "CIF", "Lev. villkor ort": "Malmö", "Mottagande hamn": "Malmö",
    "Leveransperiod kunddokument": "V28-V29", "LastorderNr": "LO-003", "Reserverat lagerflytt": "Ja",
    "Leveransbokat": "Ja", "Utlastande lagerställe": "Sundsvall",
    "Lev. tidigast": "2024-07-15", "Lev. senastlbl": "2024-07-20",
    "Ext. KontraktsNr": "OPT-K003", "Tidigaste lev. datum": "2024-07-15",
    "Kontraktsdatum": "2024-03-10", "Kurs": "1,00", "Load Planned": "Ja", "Ej leveransbokat": "Nej",
    "Limit": "160", "Load Planned rest": "50", "Lass Sipal": "Nej", "Godsmott. märke": "OPT-28",
  },
];

const VOLYM_TONE_BY_KONTRAKT: Record<string, "red" | "blue"> = {
  "K-2024-001": "red",
  "K-2024-002": "blue",
};

const TILLG_LAGER_HIGHLIGHT_BY_KONTRAKT: Record<string, boolean> = {
  "K-2024-003": true,
};

const LEFT_ROWS = [
  { langd: "3.0", mangd: "50", enhet: "m3", volym: "150", lev: "30", rest: "20" },
  { langd: "3.6", mangd: "40", enhet: "m3", volym: "144", lev: "20", rest: "20" },
  { langd: "4.2", mangd: "30", enhet: "m3", volym: "126", lev: "10", rest: "20" },
  { langd: "4.8", mangd: "20", enhet: "m3", volym: "96", lev: "5", rest: "15" },
  { langd: "5.1", mangd: "15", enhet: "m3", volym: "76", lev: "5", rest: "10" },
];

type RightRow = { typ: string; enhet: string; summa: string; ovr: string; fix: string; vals: Record<string, string> };

const RIGHT_ROWS: RightRow[] = [
  { typ: "Tillg. lager", enhet: "m3 nom", summa: "450", ovr: "0", fix: "0", vals: { "3.0": "150", "3.6": "144", "4.2": "126", "4.8": "96", "5.1": "76" } },
  { typ: "Avropsrest", enhet: "m3 nom", summa: "180", ovr: "0", fix: "0", vals: { "3.0": "60", "3.6": "55", "4.2": "40", "4.8": "30", "5.1": "20" } },
  { typ: "Nettolager", enhet: "m3 nom", summa: "270", ovr: "0", fix: "0", vals: { "3.0": "90", "3.6": "89", "4.2": "86", "4.8": "66", "5.1": "56" } },
  { typ: "Tillg. lager", enhet: "Paket", summa: "900", ovr: "0", fix: "0", vals: { "3.0": "300", "3.6": "288", "4.2": "252", "4.8": "192", "5.1": "152" } },
  { typ: "Tillg. lager fördelning (m3)", enhet: "%", summa: "100", ovr: "0", fix: "0", vals: { "3.0": "33", "3.6": "32", "4.2": "28", "4.8": "21", "5.1": "17" } },
];

type DeliveryListViewProps = {
  onAndraStatus?: () => void;
};

export function DeliveryListView({ onAndraStatus }: DeliveryListViewProps = {}) {
  const [langdspecOpen, setLangdspecOpen] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const hasSelection = selectedRowIndex !== null;
  const toggleRow = (i: number) => setSelectedRowIndex((prev) => (prev === i ? null : i));
  const [andraDetaljerOpen, setAndraDetaljerOpen] = useState(false);
  const [avregistreraOpen, setAvregistreraOpen] = useState(false);
  const [avregistreraAllaOpen, setAvregistreraAllaOpen] = useState(false);
  const [gaTillAnchor, setGaTillAnchor] = useState<HTMLElement | null>(null);

  const DAG_MAP: Record<string, string> = {
    "Mån": "Måndag", "Tis": "Tisdag", "Ons": "Onsdag",
    "Tor": "Torsdag", "Fre": "Fredag",
  };

  const selectedRow = selectedRowIndex !== null ? BOTTOM_TABLE_ROWS[selectedRowIndex] : null;
  const andraDetaljerInitial = selectedRow
    ? {
      kundmarke: selectedRow["Kundens märke"] ?? "",
      leveransvecka: selectedRow["Vecka"] ?? "",
      leveransdag: DAG_MAP[selectedRow["Dag"] ?? ""] ?? selectedRow["Dag"] ?? "",
      utlastandeEnhet: selectedRow["Utlastande bolag"] ?? "",
      utlastandeLagerstalle: selectedRow["Utlastande lagerställe"] ?? "",
      ansvarigEnhet: selectedRow["Ansvarig enhet"] ?? "",
      levFonsterMin: "",
      levFonsterMax: "",
    }
    : undefined;

  return (
    <>
      <SearchFiltersPanel
        textFields={[]}
        selectFields={[]}
        checkboxFields={[]}
        values={{}}
        isMenuOpen={false}
        draftFields={[]}
        searchButtonRef={{ current: null }}
        searchMenuRef={{ current: null }}
        getSelectOptions={(key) => deliverySelectOptions[key] ?? []}
        useAdvancedFilterLayout
        hideGlobalSearch
        defaultActivePresetIndex={0}
        fieldSets={FIELD_SETS}
        onOpenMenu={() => { }}
        onCancelMenu={() => { }}
        onToggleFieldVisibility={() => { }}
        onSaveMenu={() => { }}
        onClearMenu={() => { }}
        onTextChange={() => { }}
        onSelectChange={() => { }}
        onCheckboxChange={() => { }}
      />

      {/* Standalone delivery rows table */}
      <div className={styles.deliveryRowsTableSection} style={{ padding: 0 }}>
        <ActionRow
          rightSlot={
            <IconButton
              onClick={() => setLangdspecOpen((v) => !v)}
              className={`${styles.columnsIconButton} ${langdspecOpen ? styles.columnsIconButtonActive : ""}`}
              title="Visa/dölj längdspecifikation"
            >
              <StraightenIcon fontSize="small" />
            </IconButton>
          }
          items={[
            {
              kind: "node",
              node: (
                <ActionMenuButton
                  label="Skapa"
                  icon={<AddIcon fontSize="small" />}
                  tone="primary"
                  enabled={hasSelection}
                  items={[
                    { label: "Kontrakt", enabled: hasSelection },
                    { label: "Lastorder", enabled: hasSelection },
                  ]}
                />
              ),
            },
            {
              kind: "node",
              node: (
                <ActionMenuButton
                  label="Redigera"
                  icon={<EditOutlinedIcon fontSize="small" />}
                  enabled={hasSelection}
                  items={[
                    { label: "Lastorder", enabled: hasSelection },
                    { label: "Detaljer", enabled: hasSelection, onClick: () => setAndraDetaljerOpen(true) },
                  ]}
                />
              ),
            },
            {
              kind: "node",
              node: (
                <ActionMenuButton
                  label="Avregistrera"
                  enabled={hasSelection}
                  items={[
                    { label: "Vald rad", enabled: hasSelection, onClick: () => setAvregistreraOpen(true) },
                    { label: "Alla rader", enabled: hasSelection, onClick: () => setAvregistreraAllaOpen(true) },
                  ]}
                />
              ),
            },
            {
              kind: "node",
              node: (
                <ActionMenuButton
                  label="Visa"
                  enabled={hasSelection}
                  items={[
                    { label: "Prislista", enabled: hasSelection },
                    { label: "Prodorder", enabled: hasSelection },
                  ]}
                />
              ),
            },
            { kind: "divider" },
            {
              label: "Ändra status",
              enabled: true,
              onClick: onAndraStatus,
            },
            { kind: "divider" },
            {
              kind: "node",
              node: (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  disabled={!hasSelection}
                  startIcon={<OpenInNewIcon fontSize="small" />}
                  endIcon={
                    <KeyboardArrowDownIcon
                      className={`${styles.actionMenuChevron} ${Boolean(gaTillAnchor) ? styles.actionMenuChevronOpen : ""}`}
                    />
                  }
                  className={styles.lineItemsToggleButton}
                  onClick={(e) => setGaTillAnchor(e.currentTarget)}
                >
                  Gå till
                </Button>
              ),
            },
          ]}
        />
        <div className={`${styles.tableContainer} ${langdspecOpen ? styles.tableContainerShrink : ""}`}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={BOTTOM_TABLE_COLUMNS}
                rows={BOTTOM_TABLE_ROWS}
                rowKey={(_, i) => String(i)}
                selectedRowIndex={selectedRowIndex}
                onRowClick={(i) => toggleRow(i)}
                renderCell={(row, column) => {
                  const value = (row as Record<string, string>)[column.key];
                  if (column.key === "KontraktsNr" || column.key === "Avroprad nr") {
                    return (
                      <a href="#" className={styles.deliveryTableLink}>
                        {value}
                      </a>
                    );
                  }
                  return value;
                }}
                getCellClassName={(row, column) => {
                  const kontraktsNr = (row as Record<string, string>)["KontraktsNr"];
                  if (column.key === "Volym") {
                    const tone = VOLYM_TONE_BY_KONTRAKT[kontraktsNr];
                    if (tone === "red") return styles.cellVolymRed;
                    if (tone === "blue") return styles.cellVolymBlue;
                  }
                  if (column.key === "Tillg. lager" && TILLG_LAGER_HIGHLIGHT_BY_KONTRAKT[kontraktsNr]) {
                    return styles.cellTillgLagerHighlight;
                  }
                  return undefined;
                }}
              />
            </div>
          </div>
        </div>

        {langdspecOpen && (
          <div className={styles.langdspecSectionBelow}>
            <div className={styles.langdspecTablesWrapper}>
              {/* Left table */}
              <div className={`${styles.langdspecTableBox} ${styles.langdspecLeftBox}`}>
                <table className={styles.langdspecTable}>
                  <thead>
                    <tr>
                      {["Längd", "Mängd", "Enhet", "Volym", "Lev", "Rest"].map((h) => (
                        <th key={h} className={styles.langdspecTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LEFT_ROWS.map((row) => (
                      <tr key={row.langd}>
                        <td className={styles.langdspecTd}>{row.langd}</td>
                        <td className={styles.langdspecTd}>{row.mangd}</td>
                        <td className={styles.langdspecTd}>{row.enhet}</td>
                        <td className={styles.langdspecTd}>{row.volym}</td>
                        <td className={styles.langdspecTd}>{row.lev}</td>
                        <td className={styles.langdspecTd}>{row.rest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right table */}
              <div className={`${styles.langdspecTableBox} ${styles.langdspecRightBox}`}>
                <table className={styles.langdspecTable}>
                  <thead>
                    <tr>
                      <th className={styles.langdspecTh}>Typ</th>
                      <th className={styles.langdspecTh}>Enhet</th>
                      <th className={styles.langdspecTh}>Summa</th>
                      <th className={styles.langdspecTh}>Övr.</th>
                      <th className={styles.langdspecTh}>Fix</th>
                      {LENGTHS.map((l) => (
                        <th key={l} className={styles.langdspecTh}>{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RIGHT_ROWS.map((row, i) => (
                      <tr key={i}>
                        <td className={styles.langdspecTd}>{row.typ}</td>
                        <td className={styles.langdspecTd}>{row.enhet}</td>
                        <td className={styles.langdspecTd}>{row.summa}</td>
                        <td className={styles.langdspecTd}>{row.ovr}</td>
                        <td className={styles.langdspecTd}>{row.fix}</td>
                        {LENGTHS.map((l) => (
                          <td key={l} className={styles.langdspecTd}>{row.vals[l] ?? ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog open={avregistreraOpen} onClose={() => setAvregistreraOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Avregistrera avropsrad</Typography>
            <IconButton size="small" onClick={() => setAvregistreraOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 14, color: "#404753", paddingTop: 4 }}>
            Är du säker att du vill avregistrera den valda avropsraden?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button variant="contained" size="small" className={styles.bytPrislistaOkButton} onClick={() => setAvregistreraOpen(false)}>
            Ja
          </Button>
          <Button variant="outlined" size="small" className={styles.bytPrislistaAvbrytButton} onClick={() => setAvregistreraOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(gaTillAnchor)}
        anchorEl={gaTillAnchor}
        onClose={() => setGaTillAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.gaTillPopover } }}
      >
        <List dense disablePadding>
          {["Kund", "Produkt", "Färdiglagerlista", "Lastorder"].map((item) => (
            <ListItemButton key={item} className={styles.gaTillPopoverItem} onClick={() => setGaTillAnchor(null)}>
              <ListItemText primary={item} primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          ))}
        </List>
      </Popover>

      <Dialog open={avregistreraAllaOpen} onClose={() => setAvregistreraAllaOpen(false)} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Avregistrera avropsrader</Typography>
            <IconButton size="small" onClick={() => setAvregistreraAllaOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 14, color: "#404753", paddingTop: 4 }}>
            Är du säker att du vill avregistrera alla avropsrader?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button
            variant="contained"
            size="small"
            className={styles.bytPrislistaOkButton}
            onClick={() => setAvregistreraAllaOpen(false)}
          >
            Ja
          </Button>
          <Button variant="outlined" size="small" className={styles.bytPrislistaAvbrytButton} onClick={() => setAvregistreraAllaOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <AndraDetaljerDialog
        open={andraDetaljerOpen}
        initialDraft={andraDetaljerInitial}
        onClose={() => setAndraDetaljerOpen(false)}
        onSave={() => setAndraDetaljerOpen(false)}
      />
    </>
  );
}

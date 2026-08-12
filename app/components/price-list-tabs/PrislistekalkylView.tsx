"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { RedigeraPrislisteradDialog } from "./RedigeraPrislisteradDialog";
import type { RedigeraPrislisteradInitial } from "./RedigeraPrislisteradDialog";
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { CSSProperties } from "react";
import { ActionRow } from "../shared/ActionRow";
import styles from "../../page.module.scss";

type PrislistekalkylViewProps = {
  priceListId: string;
  onBack: () => void;
  onOpenPriceRowDetail: (priceRowId: string) => void;
};

type HeaderEditField =
  | "korrKost"
  | "niva"
  | "paslPct"
  | "paslag"
  | "frakt"
  | "provision"
  | "bonus"
  | "kassarabatt"
  | "kalkylkurs";

type KalkylRow = {
  id: string;
  artNr: string;
  grupp: string;
  kpl: boolean;
  nom: string;
  langd: string;
  fakturatext: string;
  rawara: string;
  prodkost: string;
  impregn: string;
  malning: string;
  pakettyp: string;
  korrKost: string;
  sumSEK: string;
  nettoSEK: string;
  niva: string;
  paslPct: string;
  paslag: string;
  prisPm: string;
  prism3: string;
  vinst: string;
  vinstPct: string;
  volym: string;
  fPris: string;
  balans: string;
  balPct: string;
  nettom3: string;
};

const KALKYL_ROWS: KalkylRow[] = [
  { id: "4840940", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 119", nettoSEK: "3 119", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840941", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 811", nettoSEK: "3 811", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840942", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 511", nettoSEK: "3 511", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840943", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 465", nettoSEK: "3 465", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840944", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 765", nettoSEK: "3 765", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840945", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 622", nettoSEK: "3 622", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840946", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 476", nettoSEK: "3 476", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840947", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 298", nettoSEK: "3 298", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840948", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 279", nettoSEK: "3 279", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4840949", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 312", nettoSEK: "3 312", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4840950", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 288", nettoSEK: "3 288", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4840951", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", sumSEK: "3 708", nettoSEK: "3 708", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4840952", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 815", nettoSEK: "3 815", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4840953", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 790", nettoSEK: "3 790", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4840954", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 552", nettoSEK: "3 552", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4840955", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 520", nettoSEK: "3 520", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4840956", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 251", nettoSEK: "3 251", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4840957", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", sumSEK: "3 289", nettoSEK: "3 289", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4840958", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", sumSEK: "3 600", nettoSEK: "3 600", niva: "0,0", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", volym: "0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
];

const parseSwedishNumber = (value: string): number => {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const formatSwedishNumber = (value: number): string =>
  value.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GB = "1px solid #d6dce8";
const COL_ORANGE = "#fff4ed";
const COL_ORANGE_BORDER = "#c8a87a";
const STICKY_SHADOW = "2px 0 4px -2px rgba(0,0,0,0.15)";
const STICKY_TH: CSSProperties = { position: "sticky", left: 0, zIndex: 2, boxShadow: STICKY_SHADOW };
const STICKY_TD: CSSProperties = { position: "sticky", left: 0, zIndex: 1, boxShadow: STICKY_SHADOW };

const thGroup = (align: CSSProperties["textAlign"], opts: { borderLeft?: boolean; isValue?: boolean } = {}): CSSProperties => ({
  textAlign: align,
  padding: "5px 12px",
  fontSize: opts.isValue ? 13 : 11,
  fontWeight: opts.isValue ? 800 : 700,
  color: opts.isValue ? "#2f3743" : "#6a7483",
  background: "#f4f6fb",
  borderBottom: "1px solid #e2e6ee",
  borderLeft: opts.borderLeft ? GB : undefined,
  whiteSpace: "nowrap",
  letterSpacing: "0.2px",
  // textTransform: opts.isValue ? undefined : "uppercase",
});

const thCol = (borderLeft = false, align: CSSProperties["textAlign"] = "left", clickable = false): CSSProperties => ({
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#2f343b",
  background: "#f9fafb",
  borderBottom: "1px solid #e8ecf2",
  borderLeft: borderLeft ? GB : undefined,
  whiteSpace: "nowrap",
  textAlign: align,
  cursor: clickable ? "pointer" : undefined,
  textDecoration: clickable ? "underline dotted" : undefined,
  textUnderlineOffset: clickable ? 3 : undefined,
});

const td = (borderLeft = false, align: CSSProperties["textAlign"] = "left"): CSSProperties => ({
  padding: "8px 12px",
  fontSize: 13,
  color: "#404753",
  borderBottom: "1px solid #eef1f6",
  borderLeft: borderLeft ? GB : undefined,
  whiteSpace: "nowrap",
  textAlign: align,
});

export function PrislistekalkylView({ priceListId, onBack, onOpenPriceRowDetail }: PrislistekalkylViewProps) {
  const [frakt, setFrakt] = useState("12,50");
  const [provision, setProvision] = useState("3,00");
  const [bonus, setBonus] = useState("1,50");
  const [kassarabatt, setKassarabatt] = useState("0,50");
  const [kalkylkurs, setKalkylkurs] = useState("1");
  const [korrKostnad, setKorrKostnad] = useState("");
  const [niva, setNiva] = useState("");
  const [paslagPct, setPaslagPct] = useState("");
  const [paslagKr, setPaslagKr] = useState("");
  const [rawara, setRawara] = useState(false);
  const [produktion, setProduktion] = useState(false);
  const [impregnering, setImpregnering] = useState(false);
  const [malning, setMalning] = useState(false);
  const [pakettyp, setPakettyp] = useState(false);
  const [datumFran, setDatumFran] = useState("");
  const [datumTill, setDatumTill] = useState("");
  const [kund, setKund] = useState("");
  const losRad = "";
  const [filterTradslag, setFilterTradslag] = useState("");
  const [filterUnderproduktgrupp, setFilterUnderproduktgrupp] = useState<string[]>([]);
  const [filterPakettyp, setFilterPakettyp] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uppdateraDialogOpen, setUppdateraDialogOpen] = useState(false);
  const [kplConfirmValue, setKplConfirmValue] = useState<boolean | null>(null);
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<KalkylRow>>>({});
  const [headerEdit, setHeaderEdit] = useState<null | { el: HTMLElement; field: HeaderEditField }>(null);

  const getRowVal = (rowId: string, field: keyof KalkylRow, fallback: string): string =>
    (rowEdits[rowId]?.[field] as string | undefined) ?? fallback;
  const setRowVal = (rowId: string, field: keyof KalkylRow, value: string) =>
    setRowEdits((prev) => ({ ...prev, [rowId]: { ...prev[rowId], [field]: value } }));

  const headerEditConfig: Record<HeaderEditField, { label: string; value: string; onChange: (v: string) => void; unit?: string }> = {
    korrKost: { label: "Korr kostnad", value: korrKostnad, onChange: setKorrKostnad },
    niva: { label: "Nivå %", value: niva, onChange: setNiva },
    paslPct: { label: "Påslag %", value: paslagPct, onChange: setPaslagPct },
    paslag: { label: "Påslag kr", value: paslagKr, onChange: setPaslagKr },
    frakt: { label: "Frakt, netto", value: frakt, onChange: setFrakt, unit: "kr" },
    provision: { label: "Provision", value: provision, onChange: setProvision, unit: "%" },
    bonus: { label: "Bonus", value: bonus, onChange: setBonus, unit: "%" },
    kassarabatt: { label: "Kassarabatt", value: kassarabatt, onChange: setKassarabatt, unit: "%" },
    kalkylkurs: { label: "Kalkylkurs", value: kalkylkurs, onChange: setKalkylkurs },
  };

  const openHeaderEdit = (field: HeaderEditField) => (e: React.MouseEvent<HTMLElement>) => {
    if (!isEditing) return;
    setHeaderEdit({ el: e.currentTarget, field });
  };

  const headerStepConfig: Record<HeaderEditField, { step: number; decimals: number }> = {
    korrKost: { step: 10, decimals: 0 },
    niva: { step: 1, decimals: 1 },
    paslPct: { step: 1, decimals: 1 },
    paslag: { step: 10, decimals: 0 },
    frakt: { step: 0.25, decimals: 2 },
    provision: { step: 0.25, decimals: 2 },
    bonus: { step: 0.25, decimals: 2 },
    kassarabatt: { step: 0.25, decimals: 2 },
    kalkylkurs: { step: 1, decimals: 0 },
  };

  const adjustHeaderValue = (field: HeaderEditField, direction: 1 | -1) => {
    const { step, decimals } = headerStepConfig[field];
    const current = parseSwedishNumber(headerEditConfig[field].value);
    const next = Math.max(0, current + direction * step);
    headerEditConfig[field].onChange(
      next.toLocaleString("sv-SE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    );
  };

  const renderEditableHeaderCell = (field: HeaderEditField, shortLabel: string, cellStyle: CSSProperties) => (
    <th style={cellStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#2f343b" }}>{shortLabel}</div>
        {isEditing && (
          <IconButton
            size="small"
            onClick={() => adjustHeaderValue(field, -1)}
            sx={{ padding: 0, width: 16, height: 16, border: "1px solid #d5dbe4", borderRadius: "50%", color: "#4a5565", background: "#ffffff" }}
          >
            <RemoveIcon sx={{ fontSize: 11 }} />
          </IconButton>
        )}
        <div
          onClick={openHeaderEdit(field)}
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#2f343b",
            cursor: isEditing ? "pointer" : undefined,
            textDecoration: isEditing ? "underline dotted" : undefined,
            textUnderlineOffset: isEditing ? 3 : undefined,
            minWidth: 22,
            textAlign: "center",
          }}
        >
          {headerEditConfig[field].value || "0"}
        </div>
        {isEditing && (
          <IconButton
            size="small"
            onClick={() => adjustHeaderValue(field, 1)}
            sx={{ padding: 0, width: 16, height: 16, border: "1px solid #d5dbe4", borderRadius: "50%", color: "#4a5565", background: "#ffffff" }}
          >
            <AddIcon sx={{ fontSize: 11 }} />
          </IconButton>
        )}
      </div>
    </th>
  );

  const kalkylkursNum = parseSwedishNumber(kalkylkurs);
  const harAnnanValuta = kalkylkursNum !== 0 && kalkylkursNum !== 1;

  type FooterItem = { key: string; label: string; value: string; unit: string };
  const footerItems: FooterItem[] = [
    { key: "antalRader", label: "Antal rader i prislista", value: "", unit: "st" },
    { key: "totalVolym", label: "Total kalkylerad volym", value: "", unit: "m3" },
    { key: "vinstSek", label: "Vinst för kalkylerad volym", value: losRad, unit: "SEK" },
    ...(harAnnanValuta
      ? [{
        key: "vinstAnnanValuta",
        label: "Vinst för kalkylerad volym (annan valuta)",
        value: formatSwedishNumber(parseSwedishNumber(losRad) * kalkylkursNum),
        unit: "",
      }]
      : []),
  ];

  const getKplVal = (row: KalkylRow): boolean => (rowEdits[row.id]?.kpl as boolean | undefined) ?? row.kpl;
  const allKplChecked = KALKYL_ROWS.every(getKplVal);
  const someKplChecked = KALKYL_ROWS.some(getKplVal);

  const toggleAllKpl = (checked: boolean) => {
    setRowEdits((prev) => {
      const next = { ...prev };
      KALKYL_ROWS.forEach((row) => {
        next[row.id] = { ...next[row.id], kpl: checked };
      });
      return next;
    });
  };

  const selectedRow = KALKYL_ROWS.find((r) => r.id === selectedRowId) ?? null;
  const editInitial: RedigeraPrislisteradInitial | null = selectedRow
    ? {
      artNr: selectedRow.artNr,
      produkt: selectedRow.fakturatext,
      pakettyp: selectedRow.pakettyp === "0" ? "" : selectedRow.pakettyp === "300" ? "Pk" : "Lp",
      rawara: selectedRow.rawara,
      produktion: selectedRow.prodkost,
      impregnering: selectedRow.impregn,
      malning: selectedRow.malning,
      paketkost: selectedRow.pakettyp,
    }
    : null;

  return (
    <>
      <div className={styles.contractModernTopRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton size="small" onClick={onBack} title="Tillbaka">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography className={styles.contractModernTitle}>Prislistekalkyl</Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          {isEditing ? (
            <>
              <Button variant="contained" size="small" onClick={() => setIsEditing(false)}>
                Spara
              </Button>
              <Button className={styles.contractQuickActionButton} size="small" onClick={() => { setIsEditing(false); setRowEdits({}); }}>
                Avbryt
              </Button>
            </>
          ) : (
            <Button variant="contained" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={() => setIsEditing(true)}>
              Redigera
            </Button>
          )}
          <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
          <Button className={styles.contractQuickActionButton} size="small" disabled={!isEditing}>
            Nollställ vinst
          </Button>
          <Tooltip title="Skriv ut">
            <IconButton size="small" className={styles.contractHeaderDotsButton} style={{ marginLeft: "auto" }}>
              <PrintOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className={styles.contractModernAdditionsWrap}>
        {/* ── Affärsparametrar (info) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", padding: "8px 14px", background: "#f4f6fb", border: "1px solid #dfe3ea", borderRadius: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6a7483", letterSpacing: "0.2px" }}>
            Affärsparametrar
          </span>
          <Divider orientation="vertical" flexItem style={{ margin: "2px 0" }} />
          {(["frakt", "provision", "bonus", "kassarabatt", "kalkylkurs"] as HeaderEditField[]).map((field) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#6a7483", letterSpacing: "0.3px" }}>
                {headerEditConfig[field].label}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#2f3743", minWidth: 56, textAlign: "left" }}>
                {headerEditConfig[field].value}
                {headerEditConfig[field].unit ? ` ${headerEditConfig[field].unit}` : ""}
              </span>
            </div>
          ))}
        </div>
        {/* ── Kalkylgrid ── */}
        <div className={styles.prislistekalkylActionRow}>
          <ActionRow
            items={[
              {
                label: "Prislisterad",
                icon: <AddIcon fontSize="small" />,
                tone: "primary",
              },
              {
                label: "Redigera rad",
                icon: <EditOutlinedIcon fontSize="small" />,
                enabled: selectedRowId !== null,
                onClick: () => setEditDialogOpen(true),
              },
              {
                label: "Uppdatera",
                icon: <RefreshOutlinedIcon fontSize="small" />,
                onClick: () => setUppdateraDialogOpen(true),
              },
              // {
              //   label: "Knapp för KPL och volym om de ska gå att redigera",
              //   icon: <EditOutlinedIcon fontSize="small" />,
              //   enabled: selectedRowId !== null,
              //   onClick: () => setEditDialogOpen(true),
              // },
              // {
              //   label: "Knapp för \"Ska urvalet ändras så att raderna visas i prislistan till kund\"",
              //   // icon: <EditOutlinedIcon fontSize="small" />,
              //   // enabled: selectedRowId !== null,
              // }
            ]}
            rightSlot={
              <>
                <TextField
                  size="small"
                  label="Trädslag"
                  select
                  value={filterTradslag}
                  onChange={(e) => setFilterTradslag(e.target.value)}
                  sx={{ minWidth: 140 }}
                  slotProps={{
                    select: {
                      endAdornment: filterTradslag ? (
                        <IconButton size="small" sx={{ mr: 1 }} onMouseDown={(e) => { e.stopPropagation(); setFilterTradslag(""); }}>
                          <ClearIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      ) : undefined,
                    },
                  }}
                >
                  <MenuItem value="gran">Gran</MenuItem>
                  <MenuItem value="furu">Furu</MenuItem>
                </TextField>
                <Autocomplete
                  multiple
                  size="small"
                  options={["Konstruktion", "Panel", "Trall"]}
                  value={filterUnderproduktgrupp}
                  onChange={(_e, newValue) => setFilterUnderproduktgrupp(newValue)}
                  disableCloseOnSelect
                  sx={{ width: 200, flexShrink: 0, "& .MuiAutocomplete-inputRoot": { flexWrap: "nowrap" } }}
                  renderValue={(selectedOptions) => (
                    <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(selectedOptions as string[]).join(", ")}
                    </span>
                  )}
                  renderOption={(props, option, { selected: isSelected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox size="small" checked={isSelected} style={{ marginRight: 8 }} />
                        {option}
                      </li>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Underproduktgrupp" />}
                />
                <Autocomplete
                  multiple
                  size="small"
                  options={["Lp", "Pk"]}
                  value={filterPakettyp}
                  onChange={(_e, newValue) => setFilterPakettyp(newValue)}
                  disableCloseOnSelect
                  sx={{ width: 160, flexShrink: 0, "& .MuiAutocomplete-inputRoot": { flexWrap: "nowrap" } }}
                  renderValue={(selectedOptions) => (
                    <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(selectedOptions as string[]).join(", ")}
                    </span>
                  )}
                  renderOption={(props, option, { selected: isSelected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox size="small" checked={isSelected} style={{ marginRight: 8 }} />
                        {option}
                      </li>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Pakettyp" />}
                />
              </>
            }
          />
        </div>
        <div style={{ marginTop: -10, flex: 1, minHeight: 0, overflow: "auto", border: "1px solid #dfe3ea", borderRadius: 10, background: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 6 }}>
              {/* Group header row */}
              <tr>
                <th style={{ ...thGroup("left"), ...STICKY_TH, zIndex: 3 }} />
                <th colSpan={5} style={thGroup("left")}>Produkt</th>
                <th colSpan={8} style={thGroup("center", { borderLeft: true })}>Kostnad tillverkning</th>
                <th colSpan={3} style={thGroup("center", { borderLeft: true })}>Affärsparametrar</th>
                <th colSpan={5} style={thGroup("center", { borderLeft: true })}>Aktuell prislista</th>
                <th colSpan={3} style={thGroup("center", { borderLeft: true })}>Föregående prislista</th>
                <th colSpan={1} style={thGroup("right", { borderLeft: true, isValue: true })}>3 706</th>
              </tr>
              {/* Column header row */}
              <tr>
                <th style={{ ...thCol(), ...STICKY_TH }}>Prislisterad ID</th>
                <th style={thCol()}>Grupp</th>
                <th style={{ ...thCol(), background: COL_ORANGE }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isEditing && (
                      <Checkbox
                        size="small"
                        checked={allKplChecked}
                        indeterminate={!allKplChecked && someKplChecked}
                        onChange={(e) => setKplConfirmValue(e.target.checked)}
                        sx={{ padding: "0px" }}
                      />
                    )}
                    KPL
                  </div>
                </th>
                <th style={thCol()}>Nom.dim</th>
                <th style={thCol()}>Längd</th>
                <th style={{ ...thCol(), minWidth: 200 }}>Fakturatext</th>
                <th style={thCol(true, "right")}>Råvara</th>
                <th style={thCol(false, "right")}>Prodkost</th>
                <th style={thCol(false, "right")}>Impregn</th>
                <th style={thCol(false, "right")}>Målning</th>
                <th style={thCol(false, "right")}>Pakettyp</th>
                {renderEditableHeaderCell("korrKost", "Korr kost:", { ...thCol(false, "right"), background: COL_ORANGE })}
                <th style={thCol(false, "right")}>Sum SEK</th>
                <th style={thCol(false, "right")}>Netto SEK</th>
                {renderEditableHeaderCell("niva", "Nivå:", { ...thCol(true, "right"), background: COL_ORANGE })}
                {renderEditableHeaderCell("paslPct", "Påsl%:", { ...thCol(false, "right"), background: COL_ORANGE })}
                {renderEditableHeaderCell("paslag", "Påslag kr:", { ...thCol(false, "right"), background: COL_ORANGE })}
                <th style={thCol(true, "right")}>Pris/pm</th>
                <th style={thCol(false, "right")}>Pris/m3</th>
                <th style={thCol(false, "right")}>Vinst</th>
                <th style={thCol(false, "right")}>% vinst</th>
                <th style={{ ...thCol(false, "right"), background: COL_ORANGE }}>Volym</th>
                <th style={thCol(true, "right")}>Pris</th>
                <th style={thCol(false, "right")}>Balans</th>
                <th style={thCol(false, "right")}>Bal%</th>
                <th style={thCol(true, "right")}>Nettopris/m3</th>
              </tr>
            </thead>
            <tbody>
              {KALKYL_ROWS.map((row, i) => {
                const isSelected = row.id === selectedRowId;
                return (
                  <tr
                    key={i}
                    style={{ background: isSelected ? "#f5e5cc" : "#ffffff", cursor: "pointer" }}
                    onClick={() => setSelectedRowId((prev) => prev === row.id ? null : row.id)}
                    onMouseEnter={(e) => {
                      if (isSelected) return;
                      e.currentTarget.style.background = "#fdf8ee";
                      (e.currentTarget.firstElementChild as HTMLElement).style.background = "#fdf8ee";
                    }}
                    onMouseLeave={(e) => {
                      if (isSelected) return;
                      e.currentTarget.style.background = "#ffffff";
                      (e.currentTarget.firstElementChild as HTMLElement).style.background = "#ffffff";
                    }}
                  >
                    <td style={{ ...td(), ...STICKY_TD, background: isSelected ? "#f5e5cc" : "#ffffff" }}>
                      <button
                        type="button"
                        className={styles.contractLinkButton}
                        onClick={(e) => { e.stopPropagation(); onOpenPriceRowDetail(row.id); }}
                      >
                        {row.id}
                      </button>
                    </td>
                    <td style={td()}>{row.grupp}</td>
                    <td style={{ ...td(), background: isSelected ? undefined : COL_ORANGE }}>
                      <Checkbox
                        size="small"
                        checked={getKplVal(row)}
                        onChange={
                          isEditing
                            ? (e) => setRowEdits((prev) => ({ ...prev, [row.id]: { ...prev[row.id], kpl: e.target.checked } }))
                            : undefined
                        }
                        onClick={(e) => { if (isEditing) e.stopPropagation(); }}
                        disabled={!isEditing}
                        sx={{ padding: "0px" }}
                      />
                    </td>
                    <td style={td()}>{row.nom}</td>
                    <td style={td()}>{row.langd || "–"}</td>
                    <td style={{ ...td(), minWidth: 200 }}>{row.fakturatext}</td>
                    <td style={td(true, "right")}>{row.rawara}</td>
                    <td style={td(false, "right")}>{row.prodkost}</td>
                    <td style={td(false, "right")}>{row.impregn}</td>
                    <td style={td(false, "right")}>{row.malning}</td>
                    <td style={td(false, "right")}>{row.pakettyp}</td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "korrKost", row.korrKost)}
                          onChange={(e) => setRowVal(row.id, "korrKost", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.korrKost}
                    </td>
                    <td style={td(false, "right")}>{row.sumSEK}</td>
                    <td style={td(false, "right")}>{row.nettoSEK}</td>
                    <td style={{ ...td(true, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "niva", row.niva)}
                          onChange={(e) => setRowVal(row.id, "niva", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.niva}
                    </td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslPct", row.paslPct)}
                          onChange={(e) => setRowVal(row.id, "paslPct", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.paslPct}
                    </td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslag", row.paslag)}
                          onChange={(e) => setRowVal(row.id, "paslag", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.paslag}
                    </td>
                    <td style={td(true, "right")}>{row.prisPm}</td>
                    <td style={td(false, "right")}>{row.prism3}</td>
                    <td style={td(false, "right")}>{row.vinst}</td>
                    <td style={td(false, "right")}>{row.vinstPct}</td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "volym", row.volym)}
                          onChange={(e) => setRowVal(row.id, "volym", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.volym}
                    </td>
                    <td style={td(true, "right")}>{row.fPris}</td>
                    <td style={td(false, "right")}>{row.balans}</td>
                    <td style={td(false, "right")}>{row.balPct}</td>
                    <td style={td(true, "right")}>{row.nettom3}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── Ekonomi sammanställning (footer, alltid synlig) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          padding: "8px 14px",
          borderTop: "1px solid #dfe3ea",
          background: "#f9fafb",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 500, color: "#8a93a3", letterSpacing: "0.2px" }}>
          Ekonomi sammanställning
        </span>
        {footerItems.map((item) => (
          <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#8a93a3", letterSpacing: "0.1px" }}>{item.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#2f3743" }}>{item.value || "–"} {item.unit}</span>
          </div>
        ))}
      </div>

      <Popover
        open={headerEdit !== null}
        anchorEl={headerEdit?.el ?? null}
        onClose={() => setHeaderEdit(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {headerEdit && (
          <div style={{ padding: 12, width: 220 }}>
            <TextField
              autoFocus
              size="small"
              fullWidth
              label={headerEditConfig[headerEdit.field].label}
              value={headerEditConfig[headerEdit.field].value}
              onChange={(e) => headerEditConfig[headerEdit.field].onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setHeaderEdit(null); }}
              slotProps={
                headerEditConfig[headerEdit.field].unit
                  ? { input: { endAdornment: <InputAdornment position="end">{headerEditConfig[headerEdit.field].unit}</InputAdornment> } }
                  : undefined
              }
            />
          </div>
        )}
      </Popover>

      <RedigeraPrislisteradDialog
        open={editDialogOpen}
        initial={editInitial}
        onClose={() => setEditDialogOpen(false)}
        onSave={() => setEditDialogOpen(false)}
      />

      <Dialog open={uppdateraDialogOpen} onClose={() => setUppdateraDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Uppdatera</Typography>
            <IconButton size="small" onClick={() => setUppdateraDialogOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className={styles.freightDialogContent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>

            <div>
              <Typography className={styles.contractDataSectionTitle} style={{ marginBottom: 8 }}>Uppdatera kostnader</Typography>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(140px, 1fr))", gap: "8px" }}>
                {([
                  ["rawara", rawara, setRawara, "Råvara"],
                  ["produktion", produktion, setProduktion, "Produktion"],
                  ["impregnering", impregnering, setImpregnering, "Impregnering"],
                  ["malning", malning, setMalning, "Målning"],
                  ["pakettyp", pakettyp, setPakettyp, "Pakettyp"],
                ] as [string, boolean, (v: boolean) => void, string][]).map(([key, val, setter, label]) => (
                  <div
                    key={key}
                    onClick={() => setter(!val)}
                    style={{
                      border: "1px solid rgba(0,0,0,0.23)",
                      borderRadius: 4,
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={val}
                          onChange={(e) => setter(e.target.checked)}
                          sx={{ padding: "2px", mr: "6px" }}
                        />
                      }
                      label={<span style={{ fontSize: 13 }}>{label}</span>}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ margin: 0, width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Typography className={styles.contractDataSectionTitle} style={{ marginBottom: 8 }}>Volymberäkning</Typography>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "10px" }}>
                <TextField
                  size="small"
                  label="Datum från"
                  type="date"
                  value={datumFran}
                  onChange={(e) => setDatumFran(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Datum till"
                  type="date"
                  value={datumTill}
                  onChange={(e) => setDatumTill(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Kund"
                  select
                  value={kund}
                  onChange={(e) => setKund(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">Alla</MenuItem>
                  <MenuItem value="kund1">Kund 1</MenuItem>
                  <MenuItem value="kund2">Kund 2</MenuItem>
                </TextField>
              </div>
            </div>

          </div>
        </DialogContent>

        <DialogActions className={styles.freightDialogActions}>
          <Button variant="contained" size="small" onClick={() => setUppdateraDialogOpen(false)} className={styles.contractSaveButton}>Uppdatera</Button>
          <Button variant="outlined" size="small" onClick={() => setUppdateraDialogOpen(false)} className={styles.bytPrislistaAvbrytButton}>Avbryt</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={kplConfirmValue !== null} onClose={() => setKplConfirmValue(null)} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Ändra KPL</Typography>
            <IconButton size="small" onClick={() => setKplConfirmValue(null)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13, color: "#404753" }}>
            {kplConfirmValue
              ? "Ska urvalet ändras så att raderna visas i prislistan till kund?"
              : "Ska urvalet ändras så att raderna döljs i prislistan till kund?"}
          </Typography>
        </DialogContent>

        <DialogActions className={styles.freightDialogActions}>
          <Button
            variant="contained"
            size="small"
            className={styles.contractSaveButton}
            onClick={() => {
              if (kplConfirmValue !== null) toggleAllKpl(kplConfirmValue);
              setKplConfirmValue(null);
            }}
          >
            Ja
          </Button>
          <Button variant="outlined" size="small" onClick={() => setKplConfirmValue(null)} className={styles.bytPrislistaAvbrytButton}>Avbryt</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

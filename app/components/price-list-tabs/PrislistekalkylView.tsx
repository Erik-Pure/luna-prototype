"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { RedigeraPrislisteradDialog } from "./RedigeraPrislisteradDialog";
import type { RedigeraPrislisteradInitial } from "./RedigeraPrislisteradDialog";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Popover,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { CSSProperties } from "react";
import {
  ColumnFilterButton,
  isColumnFilterActive,
  matchesColumnFilter,
  type ColumnFilterConfig,
  type ColumnFilterValue,
} from "../contract-tabs/StocknotaColumnFilter";
import { ActionRow } from "../shared/ActionRow";
import { getPriceListKund } from "../shared/priceListCustomers";
import { DetailHeader } from "../shared/DetailHeader";
import styles from "../../page.module.scss";

type PrislistekalkylViewProps = {
  priceListId: string;
  onBack?: () => void;
  onOpenPriceRowDetail: (priceRowId: string) => void;
};

type HeaderEditField =
  | "korrKost"
  | "paslPct"
  | "paslag"
  | "frakt"
  | "provision"
  | "bonus"
  | "kassarabatt"
  | "kalkylkurs";

// Kolumner vars huvud justerar alla filtrerade rader relativt (+/− från radens eget värde).
const ROW_HEADER_FIELDS = ["korrKost", "paslPct", "paslag"] as const;
type RowHeaderField = (typeof ROW_HEADER_FIELDS)[number];
const isRowHeaderField = (field: HeaderEditField): field is RowHeaderField =>
  (ROW_HEADER_FIELDS as readonly string[]).includes(field);
const EMPTY_HEADER_DELTAS: Record<RowHeaderField, string> = { korrKost: "", paslPct: "", paslag: "" };

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
  nettoSEK: string;
  paslPct: string;
  paslag: string;
  prisPm: string;
  prism3: string;
  vinst: string;
  vinstPct: string;
  fPris: string;
  balans: string;
  balPct: string;
  nettom3: string;
};

const KALKYL_ROWS: KalkylRow[] = [
  { id: "4840940", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "4,2", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840941", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "2,4", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 811", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "-45", vinstPct: "-1,2", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840942", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "4,8", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840943", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "5,4", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840944", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "2,7", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 765", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "-120", vinstPct: "-3,1", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840945", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "3,0", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 622", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840946", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "4,5", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840947", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "5,1", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840948", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "6,0", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4840949", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "3,6", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4840950", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "3,9", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4840951", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "3,3", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4840952", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "2,4", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 815", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4840953", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "2,7", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 790", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4840954", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "4,2", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4840955", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "4,8", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4840956", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "6,3", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4840957", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "3,6", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4840958", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "2,4", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 600", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
  { id: "4840959", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "3,6", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840960", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "4,5", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840961", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "4,8", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840962", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "5,1", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840963", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "5,4", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840964", artNr: "28045032100000", grupp: "2100", kpl: true, nom: "32*50", langd: "6,0", fakturatext: "28x45 Gran Dim G4-3 Lp", rawara: "2 300", prodkost: "819", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 119", paslPct: "0,0", paslag: "0", prisPm: "5,05", prism3: "3 159", vinst: "0", vinstPct: "0,0", fPris: "3 409", balans: "-250", balPct: "-7", nettom3: "3 119" },
  { id: "4840965", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "1,8", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 811", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "-45", vinstPct: "-1,2", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840966", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "2,1", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 811", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "-45", vinstPct: "-1,2", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840967", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "2,7", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 811", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "-45", vinstPct: "-1,2", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840968", artNr: "45045032100000", grupp: "2125", kpl: true, nom: "47*50", langd: "3,0", fakturatext: "45x45 Gran Vilmaregel G4-2 Kortlängd", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 811", paslPct: "0,0", paslag: "0", prisPm: "9,05", prism3: "3 851", vinst: "-45", vinstPct: "-1,2", fPris: "3 926", balans: "-75", balPct: "-2", nettom3: "3 811" },
  { id: "4840969", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "3,6", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840970", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "4,2", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840971", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "4,5", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840972", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "5,1", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840973", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "5,4", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840974", artNr: "45045032108100", grupp: "2125", kpl: true, nom: "47*50", langd: "6,0", fakturatext: "45x45 Gran Vilmaregel G4-2 Lp", rawara: "3 000", prodkost: "511", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 511", paslPct: "0,0", paslag: "0", prisPm: "8,34", prism3: "3 551", vinst: "0", vinstPct: "0,0", fPris: "3 626", balans: "-75", balPct: "-2", nettom3: "3 511" },
  { id: "4840975", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "3,6", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840976", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "4,2", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840977", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "4,5", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840978", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "4,8", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840979", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "5,1", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840980", artNr: "45070032108100", grupp: "2125", kpl: true, nom: "47*75", langd: "6,0", fakturatext: "45x70 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 465", paslPct: "0,0", paslag: "0", prisPm: "12,36", prism3: "3 505", vinst: "0", vinstPct: "0,0", fPris: "3 580", balans: "-75", balPct: "-2", nettom3: "3 465" },
  { id: "4840981", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "1,8", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 765", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "-120", vinstPct: "-3,1", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840982", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "2,1", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 765", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "-120", vinstPct: "-3,1", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840983", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "2,4", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 765", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "-120", vinstPct: "-3,1", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840984", artNr: "45070032100000", grupp: "2125", kpl: true, nom: "47*75", langd: "3,0", fakturatext: "45x70 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "465", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 765", paslPct: "0,0", paslag: "0", prisPm: "13,41", prism3: "3 805", vinst: "-120", vinstPct: "-3,1", fPris: "3 880", balans: "-75", balPct: "-2", nettom3: "3 765" },
  { id: "4840985", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "1,8", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 622", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840986", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "2,1", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 622", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840987", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "2,4", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 622", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840988", artNr: "45095032100000", grupp: "2125", kpl: true, nom: "47*100", langd: "2,7", fakturatext: "45x95 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "322", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 622", paslPct: "0,0", paslag: "0", prisPm: "17,21", prism3: "3 662", vinst: "0", vinstPct: "0,0", fPris: "3 737", balans: "-75", balPct: "-2", nettom3: "3 622" },
  { id: "4840989", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "3,6", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840990", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "4,2", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840991", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "4,8", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840992", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "5,1", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840993", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "5,4", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840994", artNr: "36098032108100", grupp: "2330", kpl: true, nom: "38*100", langd: "6,0", fakturatext: "36x98 Gran C24 Lp", rawara: "3 000", prodkost: "476", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 476", paslPct: "0,0", paslag: "0", prisPm: "13,36", prism3: "3 516", vinst: "0", vinstPct: "0,0", fPris: "3 591", balans: "-75", balPct: "-2", nettom3: "3 476" },
  { id: "4840995", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "3,6", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840996", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "4,2", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840997", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "4,5", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840998", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "4,8", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4840999", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "5,4", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4841000", artNr: "45145032108100", grupp: "2330", kpl: true, nom: "47*145", langd: "6,0", fakturatext: "45x145 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "298", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 298", paslPct: "0,0", paslag: "0", prisPm: "20,15", prism3: "3 338", vinst: "0", vinstPct: "0,0", fPris: "3 413", balans: "-75", balPct: "-2", nettom3: "3 298" },
  { id: "4841001", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "3,6", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841002", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "4,2", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841003", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "4,5", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841004", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "4,8", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841005", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "5,1", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841006", artNr: "45195032108100", grupp: "2330", kpl: true, nom: "47*195", langd: "5,4", fakturatext: "45x195 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "279", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 279", paslPct: "0,0", paslag: "0", prisPm: "27,08", prism3: "3 319", vinst: "0", vinstPct: "0,0", fPris: "3 394", balans: "-75", balPct: "-2", nettom3: "3 279" },
  { id: "4841007", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "3,0", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841008", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "3,9", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841009", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "4,2", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841010", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "4,5", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841011", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "4,8", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841012", artNr: "22095032108100", grupp: "2410", kpl: false, nom: "22*95", langd: "5,4", fakturatext: "22x95 Furu Panel Lock", rawara: "2 700", prodkost: "612", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 312", paslPct: "0,0", paslag: "0", prisPm: "6,28", prism3: "3 352", vinst: "-8", vinstPct: "-0,2", fPris: "3 452", balans: "-100", balPct: "-3", nettom3: "3 312" },
  { id: "4841013", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "3,0", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841014", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "3,6", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841015", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "4,2", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841016", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "4,5", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841017", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "4,8", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841018", artNr: "22120032108100", grupp: "2410", kpl: false, nom: "22*120", langd: "5,4", fakturatext: "22x120 Furu Panel Lock", rawara: "2 700", prodkost: "588", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 288", paslPct: "0,0", paslag: "0", prisPm: "7,94", prism3: "3 328", vinst: "0", vinstPct: "0,0", fPris: "3 428", balans: "-100", balPct: "-3", nettom3: "3 288" },
  { id: "4841019", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "3,0", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841020", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "3,6", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841021", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "3,9", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841022", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "4,2", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841023", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "4,5", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841024", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "4,8", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841025", artNr: "28070032108100", grupp: "2410", kpl: false, nom: "28*70", langd: "5,4", fakturatext: "28x70 Furu Ribb Målad", rawara: "2 850", prodkost: "701", impregn: "45", malning: "112,50", pakettyp: "0", korrKost: "0", nettoSEK: "3 708", paslPct: "0,0", paslag: "0", prisPm: "11,90", prism3: "3 748", vinst: "0", vinstPct: "0,0", fPris: "3 848", balans: "-140", balPct: "-4", nettom3: "3 708" },
  { id: "4841026", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "1,8", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 815", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4841027", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "2,1", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 815", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4841028", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "2,7", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 815", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4841029", artNr: "45145032300000", grupp: "2520", kpl: true, nom: "47*145", langd: "3,0", fakturatext: "45x145 Gran C24 Kortlängd", rawara: "3 200", prodkost: "315", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 815", paslPct: "0,0", paslag: "0", prisPm: "19,05", prism3: "3 855", vinst: "0", vinstPct: "0,0", fPris: "3 930", balans: "-75", balPct: "-2", nettom3: "3 815" },
  { id: "4841030", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "1,8", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 790", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4841031", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "2,1", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 790", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4841032", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "2,4", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 790", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4841033", artNr: "45195032300000", grupp: "2520", kpl: true, nom: "47*195", langd: "3,0", fakturatext: "45x195 Gran C24 Kortlängd", rawara: "3 200", prodkost: "290", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 790", paslPct: "0,0", paslag: "0", prisPm: "25,72", prism3: "3 830", vinst: "0", vinstPct: "0,0", fPris: "3 905", balans: "-75", balPct: "-2", nettom3: "3 790" },
  { id: "4841034", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "3,0", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841035", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "3,6", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841036", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "3,9", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841037", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "4,5", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841038", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "4,8", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841039", artNr: "34095032108100", grupp: "2620", kpl: true, nom: "34*95", langd: "5,4", fakturatext: "34x95 Gran Trall Slät", rawara: "2 950", prodkost: "544", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 552", paslPct: "0,0", paslag: "0", prisPm: "10,52", prism3: "3 592", vinst: "0", vinstPct: "0,0", fPris: "3 692", balans: "-100", balPct: "-3", nettom3: "3 552" },
  { id: "4841040", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "3,0", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841041", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "3,6", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841042", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "3,9", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841043", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "4,2", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841044", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "4,5", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841045", artNr: "28120032108100", grupp: "2620", kpl: true, nom: "28*120", langd: "5,4", fakturatext: "28x120 Gran Trall Räfflad", rawara: "2 950", prodkost: "512", impregn: "58", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 520", paslPct: "0,0", paslag: "0", prisPm: "8,54", prism3: "3 560", vinst: "0", vinstPct: "0,0", fPris: "3 660", balans: "-100", balPct: "-3", nettom3: "3 520" },
  { id: "4841046", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "3,6", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841047", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "4,2", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841048", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "4,5", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841049", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "4,8", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841050", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "5,1", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841051", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "5,4", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841052", artNr: "45220032108100", grupp: "2125", kpl: true, nom: "47*220", langd: "6,0", fakturatext: "45x220 Gran Regel G4-2 Lp", rawara: "3 000", prodkost: "251", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 251", paslPct: "0,0", paslag: "0", prisPm: "31,88", prism3: "3 291", vinst: "0", vinstPct: "0,0", fPris: "3 366", balans: "-75", balPct: "-2", nettom3: "3 251" },
  { id: "4841053", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "3,0", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841054", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "3,9", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841055", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "4,2", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841056", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "4,5", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841057", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "4,8", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841058", artNr: "19100032108100", grupp: "2410", kpl: false, nom: "19*100", langd: "5,4", fakturatext: "19x100 Furu Panel Fasspont", rawara: "2 650", prodkost: "639", impregn: "0", malning: "0,00", pakettyp: "0", korrKost: "0", nettoSEK: "3 289", paslPct: "0,0", paslag: "0", prisPm: "6,72", prism3: "3 329", vinst: "0", vinstPct: "0,0", fPris: "3 429", balans: "-100", balPct: "-3", nettom3: "3 289" },
  { id: "4841059", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "1,8", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 600", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
  { id: "4841060", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "2,1", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 600", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
  { id: "4841061", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "2,7", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 600", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
  { id: "4841062", artNr: "45145032100000", grupp: "2330", kpl: true, nom: "47*145", langd: "3,0", fakturatext: "45x145 Gran Regel G4-2 Kortlängd", rawara: "3 000", prodkost: "300", impregn: "0", malning: "0,00", pakettyp: "300", korrKost: "0", nettoSEK: "3 600", paslPct: "0,0", paslag: "0", prisPm: "18,62", prism3: "3 640", vinst: "0", vinstPct: "0,0", fPris: "3 715", balans: "-75", balPct: "-2", nettom3: "3 600" },
];

const parseSwedishNumber = (value: string): number => {
  const n = parseFloat(value.replace(/[\s  ]/g, "").replace("\u2212", "-").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const formatSwedishNumber = (value: number): string =>
  value.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatSwedishInteger = (value: number): string =>
  (Math.round(value) + 0).toLocaleString("sv-SE", { maximumFractionDigits: 0 }); // + 0 undviker "−0"

// Default sort: Fakturatext first, then ascending Längd within each fakturatext (no user-facing sort controls).
KALKYL_ROWS.sort((a, b) =>
  a.fakturatext.localeCompare(b.fakturatext, "sv", { numeric: true }) || parseSwedishNumber(a.langd) - parseSwedishNumber(b.langd)
);

const getUnderproduktgrupp = (row: KalkylRow): "Konstruktion" | "Panel" | "Trall" => {
  if (row.grupp === "2620") return "Trall";
  if (row.grupp === "2410") return "Panel";
  return "Konstruktion";
};

const getPakettypLabel = (row: KalkylRow): string => {
  if (row.pakettyp === "300") return "Pk";
  if (row.pakettyp === "0") return "";
  return "Lp";
};

const getTradslag = (row: KalkylRow): string => {
  const text = row.fakturatext.toLowerCase();
  if (text.includes("gran")) return "Gran";
  if (text.includes("furu")) return "Furu";
  return "";
};

// Kolumnfilter i kolumnhuvudena (MudBlazor DataGrid ColumnFilterMenu).
const LANGD_FILTER: ColumnFilterConfig = { kind: "number", defaultOperator: "gte" };
const GRUPP_FILTER: ColumnFilterConfig = { kind: "enum", multiple: true, options: ["Konstruktion", "Panel", "Trall"] };
const TRADSLAG_FILTER: ColumnFilterConfig = { kind: "enum", options: ["Gran", "Furu"] };
const PAKETTYP_EMPTY_LABEL = "(Tom)";
const PAKETTYP_FILTER: ColumnFilterConfig = { kind: "enum", multiple: true, options: ["Lp", "Pk", PAKETTYP_EMPTY_LABEL] };

const toDecimalString = (value: string): string => value.replace(/\s/g, "").replace(",", ".");

const GB = "1px solid #aab4c5";
// Tunn kantlinje mellan alla celler; GB (ovan) markerar tydligare var en kolumnsektion börjar.
const CELL_BORDER = "1px solid #eef1f6";
const AKTUELL_PRISLISTA_MIN_WIDTH = 64;
const COL_ORANGE = "#fff7d6";
const COL_ORANGE_BORDER = "#e5cd8c";

const thGroup = (align: CSSProperties["textAlign"], opts: { borderLeft?: boolean; isValue?: boolean } = {}): CSSProperties => ({
  textAlign: align,
  padding: "5px 8px",
  fontSize: opts.isValue ? 13 : 11,
  fontWeight: opts.isValue ? 800 : 700,
  color: opts.isValue ? "#2f3743" : "#6a7483",
  background: "#f4f6fb",
  borderBottom: "1px solid #e2e6ee",
  borderLeft: opts.borderLeft ? GB : undefined,
  whiteSpace: "nowrap",
  letterSpacing: "0.2px",
  textTransform: opts.isValue ? undefined : "uppercase",
});

// Extra luft till vänster i huvudet för redigerbara kolumner utanför redigeringsläget.
const HEADER_VIEW_SPACER_WIDTH = 16;

const thCol = (borderLeft = false, align: CSSProperties["textAlign"] = "left", clickable = false): CSSProperties => ({
  padding: "9px 8px",
  fontSize: 12,
  fontWeight: 800,
  color: "#2f343b",
  background: "#f9fafb",
  borderBottom: "1px solid #e8ecf2",
  borderLeft: borderLeft ? GB : CELL_BORDER,
  whiteSpace: "nowrap",
  textAlign: align,
  cursor: clickable ? "pointer" : undefined,
  textDecoration: clickable ? "underline dotted" : undefined,
  textUnderlineOffset: clickable ? 3 : undefined,
});

const td = (borderLeft = false, align: CSSProperties["textAlign"] = "left"): CSSProperties => ({
  padding: "4px 8px",
  fontSize: 13,
  color: "#404753",
  borderBottom: "1px solid #eef1f6",
  borderLeft: borderLeft ? GB : CELL_BORDER,
  whiteSpace: "nowrap",
  textAlign: align,
});

export function PrislistekalkylView({ priceListId }: PrislistekalkylViewProps) {
  const [frakt, setFrakt] = useState("12,50");
  const [provision, setProvision] = useState("3,00");
  const [bonus, setBonus] = useState("1,50");
  const [kassarabatt, setKassarabatt] = useState("0,50");
  const [kalkylkurs, setKalkylkurs] = useState("1");
  // Ackumulerad justering sedan senaste Spara/Avbryt, per huvudkolumn.
  const [headerDeltas, setHeaderDeltas] = useState<Record<RowHeaderField, string>>(EMPTY_HEADER_DELTAS);
  const [rawara, setRawara] = useState(false);
  const [produktion, setProduktion] = useState(false);
  const [impregnering, setImpregnering] = useState(false);
  const [malning, setMalning] = useState(false);
  const [pakettyp, setPakettyp] = useState(false);
  const [filterLangd, setFilterLangd] = useState<ColumnFilterValue | undefined>();
  const [filterGrupp, setFilterGrupp] = useState<ColumnFilterValue | undefined>();
  const [filterTradslag, setFilterTradslag] = useState<ColumnFilterValue | undefined>();
  const [filterPakettyp, setFilterPakettyp] = useState<ColumnFilterValue | undefined>();

  const rowMatchesFilters = (row: KalkylRow): boolean => {
    if (filterLangd && isColumnFilterActive(filterLangd)
      && !matchesColumnFilter(toDecimalString(row.langd), { ...filterLangd, value: toDecimalString(filterLangd.value) }, "number")) return false;
    if (filterGrupp && isColumnFilterActive(filterGrupp) && !matchesColumnFilter(getUnderproduktgrupp(row), filterGrupp, "enum")) return false;
    if (filterTradslag && isColumnFilterActive(filterTradslag) && !matchesColumnFilter(getTradslag(row), filterTradslag, "enum")) return false;
    if (filterPakettyp && isColumnFilterActive(filterPakettyp)
      && !matchesColumnFilter(getPakettypLabel(row) || PAKETTYP_EMPTY_LABEL, filterPakettyp, "enum")) return false;
    return true;
  };
  const filteredRows = KALKYL_ROWS.filter(rowMatchesFilters);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uppdateraDialogOpen, setUppdateraDialogOpen] = useState(false);
  const [kplConfirmValue, setKplConfirmValue] = useState<boolean | null>(null);
  const [nollstallVinstConfirmOpen, setNollstallVinstConfirmOpen] = useState(false);
  const [showKostnadKolumner, setShowKostnadKolumner] = useState(false);
  const [showGruppKplKolumner, setShowGruppKplKolumner] = useState(false);
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<KalkylRow>>>({});
  const [headerEdit, setHeaderEdit] = useState<null | { el: HTMLElement; field: HeaderEditField }>(null);

  const getRowVal = (rowId: string, field: keyof KalkylRow, fallback: string): string =>
    (rowEdits[rowId]?.[field] as string | undefined) ?? fallback;
  const setRowVal = (rowId: string, field: keyof KalkylRow, value: string) =>
    setRowEdits((prev) => ({ ...prev, [rowId]: { ...prev[rowId], [field]: value } }));

  // Pris/m3 = Baspris × (1 + Påsl%/100) + Påslag kr. Baspris är senast sparade Pris/m3, annars Netto SEK.
  const computePrisM3 = (row: KalkylRow, edits: Record<string, Partial<KalkylRow>> = rowEdits): number => {
    const base = parseSwedishNumber(edits[row.id]?.prism3 ?? row.nettoSEK);
    const paslPctVal = parseSwedishNumber(edits[row.id]?.paslPct ?? row.paslPct);
    const paslagKr = parseSwedishNumber(edits[row.id]?.paslag ?? row.paslag);
    return base * (1 + paslPctVal / 100) + paslagKr;
  };
  // Redigerat Pris/m3: skillnaden mot priset före Påslag kr läggs i Påslag kr.
  const [prisM3Drafts, setPrisM3Drafts] = useState<Record<string, string>>({});
  const setPrisM3Target = (row: KalkylRow, raw: string) => {
    setPrisM3Drafts((prev) => ({ ...prev, [row.id]: raw }));
    if (!raw.trim()) return;
    const prisUtanPaslagKr = computePrisM3(row) - parseSwedishNumber(getRowVal(row.id, "paslag", row.paslag));
    setRowVal(row.id, "paslag", formatFixed(parseSwedishNumber(raw) - prisUtanPaslagKr, 0));
  };
  const clearPrisM3Draft = (rowId: string) =>
    setPrisM3Drafts((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });

  // Pris/pm = Pris/m3 × tvärsnittsarean (nom.dim i mm).
  const computePrisPm = (row: KalkylRow, prisM3: number): number => {
    const [tjocklek, bredd] = row.nom.split("*").map(parseSwedishNumber);
    return prisM3 * (tjocklek / 1000) * (bredd / 1000);
  };
  // Vinst = sparad vinst + påslagets ökning av Pris/m3 sedan senaste sparning.
  const computeVinst = (row: KalkylRow, prisM3: number, edits: Record<string, Partial<KalkylRow>> = rowEdits): number => {
    const base = parseSwedishNumber(edits[row.id]?.prism3 ?? row.nettoSEK);
    return parseSwedishNumber(edits[row.id]?.vinst ?? row.vinst) + (prisM3 - base);
  };

  const headerEditConfig: Record<HeaderEditField, { label: string; value: string; onChange: (v: string) => void; unit?: string }> = {
    korrKost: { label: "Justera Korr kostnad", value: headerDeltas.korrKost, onChange: (v) => applyHeaderDelta("korrKost", v) },
    paslPct: { label: "Justera Påslag %", value: headerDeltas.paslPct, onChange: (v) => applyHeaderDelta("paslPct", v) },
    paslag: { label: "Justera Påslag kr", value: headerDeltas.paslag, onChange: (v) => applyHeaderDelta("paslag", v) },
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

  const formatFixed = (value: number, decimals: number) =>
    value.toLocaleString("sv-SE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  // Ny justering i huvudet: flytta varje filtrerad rad med skillnaden mot föregående justering.
  function applyHeaderDelta(field: RowHeaderField, raw: string) {
    const diff = parseSwedishNumber(raw) - parseSwedishNumber(headerDeltas[field]);
    setHeaderDeltas((prev) => ({ ...prev, [field]: raw }));
    if (diff === 0) return;
    const { decimals } = headerStepConfig[field];
    setRowEdits((prev) => {
      const next = { ...prev };
      filteredRows.forEach((row) => {
        const current = parseSwedishNumber((prev[row.id]?.[field] as string | undefined) ?? row[field]);
        next[row.id] = { ...next[row.id], [field]: formatFixed(current + diff, decimals) };
      });
      return next;
    });
  }

  const formatHeaderDelta = (field: RowHeaderField): string => {
    const n = parseSwedishNumber(headerDeltas[field]);
    if (n === 0) return "±0";
    return `${n > 0 ? "+" : "−"}${formatFixed(Math.abs(n), headerStepConfig[field].decimals)}`;
  };

  const setHeaderFieldValue = (field: HeaderEditField, value: string) => {
    headerEditConfig[field].onChange(value);
  };

  const headerStepConfig: Record<HeaderEditField, { step: number; decimals: number }> = {
    korrKost: { step: 10, decimals: 0 },
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
    // Justeringar får bli negativa, absoluta faktorer inte.
    const next = isRowHeaderField(field) ? current + direction * step : Math.max(0, current + direction * step);
    setHeaderFieldValue(field, formatFixed(next, decimals));
  };

  const renderEditableHeaderCell = (field: HeaderEditField, shortLabel: string, cellStyle: CSSProperties) => (
    // Huvudet hålls så smalt som möjligt, men på en rad. width: 1 hindrar tabellen från att
    // fördela överbliven bredd till kolumnen när fönstret är brett.
    <th style={{ ...cellStyle, width: 1, paddingLeft: 10, paddingRight: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
        {!isEditing && <span style={{ width: HEADER_VIEW_SPACER_WIDTH, flexShrink: 0 }} />}
        <div style={{ fontSize: 12, fontWeight: 800, color: "#2f343b" }}>{shortLabel}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              minWidth: 40, // Rymmer t.ex. "+10,0" och "+1 000" så att huvudet inte breddas när värdet ändras.
              textAlign: "center",
            }}
          >
            {isRowHeaderField(field) ? formatHeaderDelta(field) : headerEditConfig[field].value || "0"}
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
      </div>
    </th>
  );

  const getKplVal = (row: KalkylRow): boolean => (rowEdits[row.id]?.kpl as boolean | undefined) ?? row.kpl;
  const allKplChecked = filteredRows.every(getKplVal);
  const someKplChecked = filteredRows.some(getKplVal);

  const toggleAllKpl = (checked: boolean) => {
    setRowEdits((prev) => {
      const next = { ...prev };
      filteredRows.forEach((row) => {
        next[row.id] = { ...next[row.id], kpl: checked };
      });
      return next;
    });
  };

  const nollstallVinst = () => {
    setRowEdits((prev) => {
      const next = { ...prev };
      filteredRows.forEach((row) => {
        const zeroed: Partial<KalkylRow> = { vinst: "0", vinstPct: "0,0" };
        ROW_HEADER_FIELDS.forEach((field) => {
          zeroed[field] = formatFixed(0, headerStepConfig[field].decimals);
        });
        next[row.id] = { ...next[row.id], ...zeroed };
      });
      return next;
    });
    setHeaderDeltas(EMPTY_HEADER_DELTAS);
  };

  // Ögonblicksbild av sparade värden så att Avbryt kan återställa dem.
  const [savedRowEdits, setSavedRowEdits] = useState<Record<string, Partial<KalkylRow>>>({});

  const handleRedigera = () => {
    setSavedRowEdits(rowEdits);
    setPrisM3Drafts({});
    setHeaderDeltas(EMPTY_HEADER_DELTAS);
    setIsEditing(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToastOpen, setIsSavedToastOpen] = useState(false);

  // Simulerar en databassparning med en kort fördröjning.
  // Påslagen bakas in i Pris/m3 och affärsparametrarna nollställs.
  const handleSpara = () => {
    setIsSaving(true);
    window.setTimeout(() => {
      setIsSaving(false);
      setRowEdits((prev) => {
        const next = { ...prev };
        KALKYL_ROWS.forEach((row) => {
          const prisM3 = computePrisM3(row, prev);
          next[row.id] = {
            ...next[row.id],
            prism3: formatSwedishInteger(prisM3),
            vinst: formatSwedishInteger(computeVinst(row, prisM3, prev)),
            paslPct: formatFixed(0, headerStepConfig.paslPct.decimals),
            paslag: formatFixed(0, headerStepConfig.paslag.decimals),
          };
        });
        return next;
      });
      setHeaderDeltas(EMPTY_HEADER_DELTAS);
      setIsEditing(false);
      setIsSavedToastOpen(true);
    }, 1000);
  };

  const handleAvbryt = () => {
    setRowEdits(savedRowEdits);
    setHeaderDeltas(EMPTY_HEADER_DELTAS);
    setIsEditing(false);
  };

  // Markerar celler som ändrats sedan redigeringen startade.
  type EditableRowField = RowHeaderField;
  const getSavedVal = (row: KalkylRow, field: EditableRowField): string =>
    (savedRowEdits[row.id]?.[field] as string | undefined) ?? row[field];
  const isCellChanged = (row: KalkylRow, field: EditableRowField): boolean =>
    isEditing && parseSwedishNumber(getRowVal(row.id, field, row[field])) !== parseSwedishNumber(getSavedVal(row, field));
  const changedCellProps = (row: KalkylRow, field: EditableRowField) =>
    isCellChanged(row, field)
      ? { title: `Tidigare: ${getSavedVal(row, field)}`, style: { fontWeight: 700, color: "#000000" } }
      : { title: undefined, style: {} };

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
      <DetailHeader
        entity="priceList"
        label="Prislistekalkyl"
        title={priceListId}
        subtitle={getPriceListKund(priceListId)}
        actions={
        <>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={handleSpara}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {isSaving ? "Sparar…" : "Spara"}
              </Button>
              <Button
                className={styles.contractQuickActionButton}
                size="small"
                onClick={handleAvbryt}
                disabled={isSaving}
              >
                Avbryt
              </Button>
            </>
          ) : (
            <Button variant="contained" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={handleRedigera}>
              Redigera
            </Button>
          )}
          <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
          <Button className={styles.contractQuickActionButton} size="small" disabled={!isEditing} onClick={() => setNollstallVinstConfirmOpen(true)}>
            Nollställ vinst
          </Button>
        </>
        }
      />

      <div className={styles.contractModernAdditionsWrap}>
        {/* ── Affärsparametrar (info) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#696969", letterSpacing: "0.2px" }}>
            Prislistefaktorer
          </span>
          <Divider orientation="vertical" flexItem style={{ margin: "2px 0" }} />
          {(["frakt", "provision", "bonus", "kassarabatt", "kalkylkurs"] as HeaderEditField[]).map((field) => (
            <div key={field} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#6a7483", letterSpacing: "0.3px" }}>
                {headerEditConfig[field].label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2f3743" }}>
                {headerEditConfig[field].value}
                {headerEditConfig[field].unit ? ` ${headerEditConfig[field].unit}` : ""}
              </span>
            </div>
          ))}
        </div>
        <Divider />
        {/* ── Kalkylgrid ── */}
        <div className={styles.prislistekalkylActionRow}>
          <ActionRow
            items={[
              {
                label: "Redigera rad",
                icon: <EditOutlinedIcon fontSize="small" />,
                enabled: !isEditing && selectedRowId !== null,
                onClick: () => setEditDialogOpen(true),
              },
              {
                label: "Uppdatera kostnader",
                icon: <RefreshOutlinedIcon fontSize="small" />,
                enabled: !isEditing,
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
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  className={`${styles.lineItemsToggleButton} ${showKostnadKolumner ? styles.columnsIconButtonActive : ""}`}
                  startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
                  onClick={() => setShowKostnadKolumner((prev) => !prev)}
                >
                  Kostnader
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  className={`${styles.lineItemsToggleButton} ${showGruppKplKolumner ? styles.columnsIconButtonActive : ""}`}
                  startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
                  onClick={() => setShowGruppKplKolumner((prev) => !prev)}
                >
                  Grupp / KPL
                </Button>
              </>
            }
          />
        </div>
        <div style={{ marginTop: -10, flex: 1, minHeight: 0, overflow: "auto", border: "1px solid #dfe3ea", borderRadius: 10, background: "#ffffff" }}>
          <table className={styles.prislistekalkylTable} style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, tableLayout: "auto" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 6 }}>
              {/* Group header row */}
              <tr>
                <th colSpan={showGruppKplKolumner ? 7 : 5} style={thGroup("left")}>Produkt</th>
                <th colSpan={showKostnadKolumner ? 7 : 2} style={thGroup("left", { borderLeft: true })}>Kostnad tillverkning</th>
                <th colSpan={2} style={thGroup("left", { borderLeft: true })}>Affärsparametrar</th>
                <th colSpan={4} style={thGroup("left", { borderLeft: true })}>Aktuell prislista</th>
                <th colSpan={3} style={thGroup("left", { borderLeft: true })}>Föregående prislista</th>
                <th colSpan={1} style={thGroup("right", { borderLeft: true, isValue: true })}>3 706</th>
                {/* Utfyllnadskolumn: tar överbliven bredd så att datakolumnerna förblir kompakta. */}
                <th style={{ ...thGroup("left", { borderLeft: true }), width: "100%", padding: 0 }} />
              </tr>
              {/* Column header row */}
              <tr>
                {showGruppKplKolumner && (
                  <>
                    <th style={thCol()}>
                      <div className={styles.prislistekalkylHeaderLabel}>
                        Grupp
                        <ColumnFilterButton config={GRUPP_FILTER} filter={filterGrupp} onApply={(f) => setFilterGrupp(f ?? undefined)} disabled={isEditing} />
                      </div>
                    </th>
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
                  </>
                )}
                <th style={thCol()}>Nom.dim</th>
                <th style={thCol()}>
                  <div className={styles.prislistekalkylHeaderLabel}>
                    Längd
                    <ColumnFilterButton config={LANGD_FILTER} filter={filterLangd} onApply={(f) => setFilterLangd(f ?? undefined)} disabled={isEditing} />
                  </div>
                </th>
                <th style={{ ...thCol(), minWidth: 200 }}>Fakturatext</th>
                <th style={thCol()}>
                  <div className={styles.prislistekalkylHeaderLabel}>
                    Trädslag
                    <ColumnFilterButton config={TRADSLAG_FILTER} filter={filterTradslag} onApply={(f) => setFilterTradslag(f ?? undefined)} disabled={isEditing} />
                  </div>
                </th>
                <th style={thCol()}>
                  <div className={styles.prislistekalkylHeaderLabel}>
                    Pakettyp
                    <ColumnFilterButton config={PAKETTYP_FILTER} filter={filterPakettyp} onApply={(f) => setFilterPakettyp(f ?? undefined)} disabled={isEditing} />
                  </div>
                </th>
                <th style={thCol(true, "right")}>Råvara</th>
                {showKostnadKolumner && (
                  <>
                    <th style={thCol(false, "right")}>Prodkost</th>
                    <th style={thCol(false, "right")}>Impregn</th>
                    <th style={thCol(false, "right")}>Målning</th>
                    <th style={thCol(false, "right")}>Pakettyp</th>
                    {renderEditableHeaderCell("korrKost", "Korr kost:", { ...thCol(false, "right"), background: COL_ORANGE })}
                  </>
                )}
                <th style={thCol(false, "right")}>Netto SEK</th>
                {renderEditableHeaderCell("paslPct", "Påsl%:", { ...thCol(true, "right"), background: COL_ORANGE })}
                {renderEditableHeaderCell("paslag", "Påslag kr:", { ...thCol(false, "right"), background: COL_ORANGE })}
                {/* Aktuell prislista: gemensam minbredd (på inre element, min-width på tabellceller ignoreras). */}
                <th style={thCol(true, "right")}><div style={{ minWidth: AKTUELL_PRISLISTA_MIN_WIDTH }}>Pris/pm</div></th>
                <th style={{ ...thCol(false, "right"), background: COL_ORANGE }}><div style={{ minWidth: AKTUELL_PRISLISTA_MIN_WIDTH }}>Pris/m3</div></th>
                <th style={thCol(false, "right")}><div style={{ minWidth: AKTUELL_PRISLISTA_MIN_WIDTH }}>Vinst</div></th>
                <th style={thCol(false, "right")}><div style={{ minWidth: AKTUELL_PRISLISTA_MIN_WIDTH }}>% vinst</div></th>
                <th style={thCol(true, "right")}>Pris</th>
                <th style={thCol(false, "right")}>Balans</th>
                <th style={thCol(false, "right")}>Bal%</th>
                <th style={thCol(true, "right")}>Nettopris/m3</th>
                <th style={{ ...thCol(true), padding: 0 }} />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => {
                const isSelected = row.id === selectedRowId;
                const prisM3 = computePrisM3(row);
                const savedPrisM3 = computePrisM3(row, savedRowEdits);
                const isPrisM3Changed = isEditing && Math.round(prisM3) !== Math.round(savedPrisM3);
                const vinst = computeVinst(row, prisM3);
                const vinstPct = prisM3 !== 0 ? Math.round((vinst / prisM3) * 1000) / 10 + 0 : 0;
                return (
                  <tr
                    key={i}
                    style={{ background: isSelected ? "#f5e5cc" : "#ffffff", cursor: "pointer" }}
                    onClick={() => setSelectedRowId((prev) => prev === row.id ? null : row.id)}
                    onMouseEnter={(e) => {
                      if (isSelected) return;
                      e.currentTarget.style.background = "#fdf8ee";
                    }}
                    onMouseLeave={(e) => {
                      if (isSelected) return;
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    {showGruppKplKolumner && (
                      <>
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
                      </>
                    )}
                    <td style={td()}>{row.nom}</td>
                    <td style={td()}>{row.langd || "–"}</td>
                    <td style={{ ...td(), minWidth: 200 }}>{row.fakturatext}</td>
                    <td style={td()}>{getTradslag(row)}</td>
                    <td style={td()}>{getPakettypLabel(row) || "–"}</td>
                    <td style={td(true, "right")}>{row.rawara}</td>
                    {showKostnadKolumner && (
                      <>
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
                              title={changedCellProps(row, "korrKost").title}
                              style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box", ...changedCellProps(row, "korrKost").style }}
                            />
                          ) : getRowVal(row.id, "korrKost", row.korrKost)}
                        </td>
                      </>
                    )}
                    <td style={td(false, "right")}>{row.nettoSEK}</td>
                    <td style={{ ...td(true, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslPct", row.paslPct)}
                          onChange={(e) => setRowVal(row.id, "paslPct", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          title={changedCellProps(row, "paslPct").title}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box", ...changedCellProps(row, "paslPct").style }}
                        />
                      ) : getRowVal(row.id, "paslPct", row.paslPct)}
                    </td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslag", row.paslag)}
                          onChange={(e) => setRowVal(row.id, "paslag", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          title={changedCellProps(row, "paslag").title}
                          style={{ width: "100%", border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box", ...changedCellProps(row, "paslag").style }}
                        />
                      ) : getRowVal(row.id, "paslag", row.paslag)}
                    </td>
                    <td style={td(true, "right")}>{formatSwedishNumber(computePrisPm(row, prisM3))}</td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_ORANGE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={prisM3Drafts[row.id] ?? formatSwedishInteger(prisM3)}
                          onChange={(e) => setPrisM3Target(row, e.target.value)}
                          onBlur={() => clearPrisM3Draft(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          inputMode="decimal"
                          title={isPrisM3Changed ? `Tidigare: ${formatSwedishInteger(savedPrisM3)}` : undefined}
                          style={{ width: 64, border: `1px solid ${COL_ORANGE_BORDER}`, borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box", ...(isPrisM3Changed ? { fontWeight: 700, color: "#000000" } : {}) }}
                        />
                      ) : formatSwedishInteger(prisM3)}
                    </td>
                    <td style={{ ...td(false, "right"), ...(Math.round(vinst) < 0 ? { color: "#c0392b", fontWeight: 700 } : {}) }}>{formatSwedishInteger(vinst)}</td>
                    <td style={{ ...td(false, "right"), ...(vinstPct < 0 ? { color: "#c0392b", fontWeight: 700 } : {}) }}>{formatFixed(vinstPct, 1)}</td>
                    <td style={td(true, "right")}>{row.fPris}</td>
                    <td style={td(false, "right")}>{row.balans}</td>
                    <td style={td(false, "right")}>{row.balPct}</td>
                    <td style={td(true, "right")}>{row.nettom3}</td>
                    <td style={{ ...td(true), padding: 0 }} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
              onChange={(e) => setHeaderFieldValue(headerEdit.field, e.target.value)}
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
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Uppdatera kostnader</Typography>
            <IconButton size="small" onClick={() => setUppdateraDialogOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className={styles.freightDialogContent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>

            <div>
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

      <Dialog open={nollstallVinstConfirmOpen} onClose={() => setNollstallVinstConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Nollställ vinst</Typography>
            <IconButton size="small" onClick={() => setNollstallVinstConfirmOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13, color: "#404753" }}>
            Korr kostnad, Påslag % och Påslag kr sätts till 0 för urvalet, och vinsten nollställs. Ska vinsten nollställas?
          </Typography>
        </DialogContent>

        <DialogActions className={styles.freightDialogActions}>
          <Button
            variant="contained"
            size="small"
            className={styles.contractSaveButton}
            onClick={() => {
              nollstallVinst();
              setNollstallVinstConfirmOpen(false);
            }}
          >
            Ja
          </Button>
          <Button variant="outlined" size="small" onClick={() => setNollstallVinstConfirmOpen(false)} className={styles.bytPrislistaAvbrytButton}>Avbryt</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={isSavedToastOpen}
        autoHideDuration={2200}
        onClose={() => setIsSavedToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setIsSavedToastOpen(false)}>
          Aktuell prislista sparad
        </Alert>
      </Snackbar>
    </>
  );
}

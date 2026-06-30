"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { RedigeraPrislisteradDialog } from "./RedigeraPrislisteradDialog";
import type { RedigeraPrislisteradInitial } from "./RedigeraPrislisteradDialog";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
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
];

const GB = "1px solid #d6dce8";
const COL_ORANGE = "#fff4ed";
const COL_BLUE = "#eef4ff";

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

const thCol = (borderLeft = false, align: CSSProperties["textAlign"] = "left"): CSSProperties => ({
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#2f343b",
  background: "#f9fafb",
  borderBottom: "1px solid #e8ecf2",
  borderLeft: borderLeft ? GB : undefined,
  whiteSpace: "nowrap",
  textAlign: align,
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
  const [losRad, setLosRad] = useState("");
  const [filterTradslag, setFilterTradslag] = useState("");
  const [filterUnderproduktgrupp, setFilterUnderproduktgrupp] = useState("");
  const [filterPakettyp, setFilterPakettyp] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<KalkylRow>>>({});

  const getRowVal = (rowId: string, field: keyof KalkylRow, fallback: string): string =>
    (rowEdits[rowId]?.[field] as string | undefined) ?? fallback;
  const setRowVal = (rowId: string, field: keyof KalkylRow, value: string) =>
    setRowEdits((prev) => ({ ...prev, [rowId]: { ...prev[rowId], [field]: value } }));

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
          <Button className={styles.contractQuickActionButton} size="small">
            Räkna om
          </Button>
          <Button className={styles.contractQuickActionButton} size="small">
            Vinst = 0
          </Button>
          <Tooltip title="Skriv ut">
            <IconButton size="small" className={styles.contractHeaderDotsButton} style={{ marginLeft: "auto" }}>
              <PrintOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className={styles.contractModernAdditionsWrap} style={{ overflowY: "auto" }}>
        <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>

          {/* ── Prislistefaktorer ── */}
          <div className={styles.contractDataSection}>
            <Typography className={styles.contractDataSectionTitle}>Prislistefaktorer</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
              <TextField
                size="small"
                label="Frakt, netto"
                value={frakt}
                onChange={(e) => setFrakt(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">kr</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Provision"
                value={provision}
                onChange={(e) => setProvision(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Bonus"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Kassarabatt"
                value={kassarabatt}
                onChange={(e) => setKassarabatt(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Kalkylkurs"
                value={kalkylkurs}
                onChange={(e) => setKalkylkurs(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing } }}
                fullWidth
              />
            </div>
          </div>

          {/* ── Extra ── */}
          <div className={styles.contractDataSection}>
            <Typography className={styles.contractDataSectionTitle}>Extra</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "10px" }}>
              <TextField
                size="small"
                label="Korr kostnad"
                value={korrKostnad}
                onChange={(e) => setKorrKostnad(e.target.value)}
                fullWidth
                slotProps={{ input: { readOnly: !isEditing } }}
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COL_ORANGE } }}
              />
            </div>

            <Divider sx={{ my: "14px" }} />

            <Typography className={styles.contractDataSectionTitle}>Affärsparametrar</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "10px" }}>
              <TextField
                size="small"
                label="Nivå %"
                value={niva}
                onChange={(e) => setNiva(e.target.value)}
                fullWidth
                slotProps={{ input: { readOnly: !isEditing } }}
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COL_BLUE } }}
              />
              <TextField
                size="small"
                label="Påslag %"
                value={paslagPct}
                onChange={(e) => setPaslagPct(e.target.value)}
                fullWidth
                slotProps={{ input: { readOnly: !isEditing } }}
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COL_BLUE } }}
              />
              <TextField
                size="small"
                label="Påslag kr"
                value={paslagKr}
                onChange={(e) => setPaslagKr(e.target.value)}
                fullWidth
                slotProps={{ input: { readOnly: !isEditing } }}
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COL_BLUE } }}
              />
            </div>
          </div>

          {/* ── Uppdatera kostnader ── */}
          <div className={styles.contractDataSection}>
            <Typography className={styles.contractDataSectionTitle}>Uppdatera kostnader</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "8px" }}>
              {([
                ["rawara", rawara, setRawara, "Råvara"],
                ["produktion", produktion, setProduktion, "Produktion"],
                ["impregnering", impregnering, setImpregnering, "Impregnering"],
                ["malning", malning, setMalning, "Målning"],
                ["pakettyp", pakettyp, setPakettyp, "Pakettyp"],
              ] as [string, boolean, (v: boolean) => void, string][]).map(([key, val, setter, label]) => (
                <div
                  key={key}
                  style={{
                    border: "1px solid rgba(0,0,0,0.23)",
                    borderRadius: 4,
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={val}
                        onChange={(e) => setter(e.target.checked)}
                        disabled={!isEditing}
                        sx={{ padding: "2px", mr: "6px" }}
                      />
                    }
                    label={<span style={{ fontSize: 13 }}>{label}</span>}
                    sx={{ margin: 0 }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Button variant="contained" size="small" disabled={!isEditing}>Uppdatera</Button>
            </div>
          </div>

          {/* ── Volymberäkning ── */}
          <div className={styles.contractDataSection}>
            <Typography className={styles.contractDataSectionTitle}>Volymberäkning</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "10px" }}>
              <TextField
                size="small"
                label="Datum från"
                type="date"
                value={datumFran}
                onChange={(e) => setDatumFran(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: !isEditing } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Datum till"
                type="date"
                value={datumTill}
                onChange={(e) => setDatumTill(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: !isEditing } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Kund"
                select
                value={kund}
                onChange={(e) => setKund(e.target.value)}
                disabled={!isEditing}
                fullWidth
              >
                <MenuItem value="">Alla</MenuItem>
                <MenuItem value="kund1">Kund 1</MenuItem>
                <MenuItem value="kund2">Kund 2</MenuItem>
              </TextField>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Button variant="contained" size="small" disabled={!isEditing}>Uppdatera</Button>
            </div>
          </div>

          {/* ── Ekonomi sammanställning ── */}
          <div className={styles.contractDataSection} style={{ marginBottom: 12 }}>
            <Typography className={styles.contractDataSectionTitle}>Ekonomi sammanställning</Typography>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: "10px" }}>
              <TextField
                size="small"
                label="Antal rader i prislista"
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">st</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Total kalkylerad volym"
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">m3</InputAdornment> } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Vinst för kalkylerad volym"
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }}
                fullWidth
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <TextField
                size="small"
                value={losRad}
                onChange={(e) => setLosRad(e.target.value)}
                slotProps={{ input: { readOnly: !isEditing, endAdornment: <InputAdornment position="end">SEK</InputAdornment> } }}
                style={{ width: "calc(33.333% - 7px)" }}
              />
            </div>
          </div>

        </div>

        {/* ── Kalkylgrid ── */}
        <ActionRow
          items={[
            {
              label: "Prislisterad",
              icon: <AddIcon fontSize="small" />,
              tone: "primary",
            },
            {
              label: "Prislisterad",
              icon: <EditOutlinedIcon fontSize="small" />,
              enabled: selectedRowId !== null,
              onClick: () => setEditDialogOpen(true),
            },
            {
              label: "Knapp för \"Ska urvalet ändras så att raderna visas i prislistan till kund\"",
              // icon: <EditOutlinedIcon fontSize="small" />,
              // enabled: selectedRowId !== null,
            }
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
              <TextField
                size="small"
                label="Underproduktgrupp"
                select
                value={filterUnderproduktgrupp}
                onChange={(e) => setFilterUnderproduktgrupp(e.target.value)}
                sx={{ minWidth: 180 }}
                slotProps={{
                  select: {
                    endAdornment: filterUnderproduktgrupp ? (
                      <IconButton size="small" sx={{ mr: 1 }} onMouseDown={(e) => { e.stopPropagation(); setFilterUnderproduktgrupp(""); }}>
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    ) : undefined,
                  },
                }}
              >
                <MenuItem value="konstruktion">Konstruktion</MenuItem>
                <MenuItem value="panel">Panel</MenuItem>
                <MenuItem value="trall">Trall</MenuItem>
              </TextField>
              <TextField
                size="small"
                label="Pakettyp"
                select
                value={filterPakettyp}
                onChange={(e) => setFilterPakettyp(e.target.value)}
                sx={{ minWidth: 140 }}
                slotProps={{
                  select: {
                    endAdornment: filterPakettyp ? (
                      <IconButton size="small" sx={{ mr: 1 }} onMouseDown={(e) => { e.stopPropagation(); setFilterPakettyp(""); }}>
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    ) : undefined,
                  },
                }}
              >
                <MenuItem value="lp">Lp</MenuItem>
                <MenuItem value="pk">Pk</MenuItem>
              </TextField>
            </>
          }
        />
        <div style={{ overflowX: "auto", border: "1px solid #dfe3ea", borderRadius: 10, background: "#ffffff", flexShrink: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead>
              {/* Group header row */}
              <tr>
                <th colSpan={6} style={thGroup("left")}>Produkt</th>
                <th colSpan={8} style={thGroup("center", { borderLeft: true })}>Kostnad tillverkning</th>
                <th colSpan={3} style={thGroup("center", { borderLeft: true })}>Affärsparametrar</th>
                <th colSpan={5} style={thGroup("center", { borderLeft: true })}>Aktuell prislista</th>
                <th colSpan={3} style={thGroup("center", { borderLeft: true })}>Föregående prislista</th>
                <th colSpan={1} style={thGroup("right", { borderLeft: true, isValue: true })}>3 706</th>
              </tr>
              {/* Column header row */}
              <tr>
                <th style={thCol()}>Prislisterad ID</th>
                <th style={thCol()}>Grupp</th>
                <th style={thCol()}>KPL</th>
                <th style={thCol()}>Nom.dim</th>
                <th style={thCol()}>Längd</th>
                <th style={{ ...thCol(), minWidth: 200 }}>Fakturatext</th>
                <th style={thCol(true, "right")}>Råvara</th>
                <th style={thCol(false, "right")}>Prodkost</th>
                <th style={thCol(false, "right")}>Impregn</th>
                <th style={thCol(false, "right")}>Målning</th>
                <th style={thCol(false, "right")}>Pakettyp</th>
                <th style={{ ...thCol(false, "right"), background: COL_ORANGE }}>Korr kost</th>
                <th style={thCol(false, "right")}>Sum SEK</th>
                <th style={thCol(false, "right")}>Netto SEK</th>
                <th style={{ ...thCol(true, "right"), background: COL_BLUE }}>Nivå</th>
                <th style={{ ...thCol(false, "right"), background: COL_BLUE }}>Påsl%</th>
                <th style={{ ...thCol(false, "right"), background: COL_BLUE }}>Påslag</th>
                <th style={thCol(true, "right")}>Pris/pm</th>
                <th style={thCol(false, "right")}>Pris/m3</th>
                <th style={thCol(false, "right")}>Vinst</th>
                <th style={thCol(false, "right")}>% vinst</th>
                <th style={{ ...thCol(false, "right"), background: COL_BLUE }}>Volym</th>
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
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#fdf8ee"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "#ffffff"; }}
                  >
                    <td style={td()}>
                      <button
                        type="button"
                        className={styles.contractLinkButton}
                        onClick={(e) => { e.stopPropagation(); onOpenPriceRowDetail(row.id); }}
                      >
                        {row.id}
                      </button>
                    </td>
                    <td style={td()}>{row.grupp}</td>
                    <td style={td()}>
                      <Checkbox size="small" checked={row.kpl} readOnly sx={{ padding: "0px" }} />
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
                          style={{ width: "100%", border: "1px solid #c8a87a", borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.korrKost}
                    </td>
                    <td style={td(false, "right")}>{row.sumSEK}</td>
                    <td style={td(false, "right")}>{row.nettoSEK}</td>
                    <td style={{ ...td(true, "right"), background: isSelected ? undefined : COL_BLUE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "niva", row.niva)}
                          onChange={(e) => setRowVal(row.id, "niva", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: "1px solid #93b4d8", borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.niva}
                    </td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_BLUE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslPct", row.paslPct)}
                          onChange={(e) => setRowVal(row.id, "paslPct", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: "1px solid #93b4d8", borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.paslPct}
                    </td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_BLUE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "paslag", row.paslag)}
                          onChange={(e) => setRowVal(row.id, "paslag", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: "1px solid #93b4d8", borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
                        />
                      ) : row.paslag}
                    </td>
                    <td style={td(true, "right")}>{row.prisPm}</td>
                    <td style={td(false, "right")}>{row.prism3}</td>
                    <td style={td(false, "right")}>{row.vinst}</td>
                    <td style={td(false, "right")}>{row.vinstPct}</td>
                    <td style={{ ...td(false, "right"), background: isSelected ? undefined : COL_BLUE, ...(isEditing ? { padding: "4px 6px" } : {}) }}>
                      {isEditing ? (
                        <input
                          value={getRowVal(row.id, "volym", row.volym)}
                          onChange={(e) => setRowVal(row.id, "volym", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", border: "1px solid #93b4d8", borderRadius: 3, background: "transparent", fontSize: 13, color: "#404753", textAlign: "right", outline: "none", padding: "2px 4px", boxSizing: "border-box" }}
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

      <RedigeraPrislisteradDialog
        open={editDialogOpen}
        initial={editInitial}
        onClose={() => setEditDialogOpen(false)}
        onSave={() => setEditDialogOpen(false)}
      />
    </>
  );
}

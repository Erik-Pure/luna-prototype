"use client";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { getPriceListKund } from "../shared/priceListCustomers";
import {
  ColumnFilterButton,
  isColumnFilterActive,
  matchesColumnFilter,
  type ColumnFilterConfig,
  type ColumnFilterValue,
} from "../contract-tabs/StocknotaColumnFilter";
import styles from "../../page.module.scss";

// ── Mockdata ──────────────────────────────────────────────────────────────

type SourcePriceList = {
  id: string;
  externNr: string;
  kund: string;
  aktiv: boolean;
};

// Externnr i stil med befintligt system, t.ex. "2025/03- Attacus" eller "2025/10 Reg 1".
const EXTERN_PERIODS = ["2025/03", "2025/06", "2025/10", "2026/01"];

function getExternNr(kund: string, idx: number) {
  const period = EXTERN_PERIODS[Math.floor(idx / 5) % EXTERN_PERIODS.length];
  return idx % 2 === 0 ? `${period}- ${kund.split(" ")[0]}` : `${period} Reg ${(idx % 4) + 1}`;
}

// Samma prislistor som i prislistetabellen (PriceListView): 17611 och nedåt, sorterade på kund.
const SOURCE_PRICE_LISTS: SourcePriceList[] = Array.from({ length: 26 })
  .map((_, idx) => {
    const id = `${17611 - idx}`;
    const kund = getPriceListKund(id);
    return { id, externNr: getExternNr(kund, idx), kund, aktiv: idx % 4 !== 3 };
  })
  .sort((a, b) => a.kund.localeCompare(b.kund, "sv") || a.id.localeCompare(b.id));

const KUND_OPTIONS = Array.from(new Set(SOURCE_PRICE_LISTS.map((pl) => pl.kund))).sort((a, b) => a.localeCompare(b, "sv"));

// Artikelgrupper: kod + benämning, som i befintligt system.
const GRUPPER: Record<string, string> = {
  "2300": "Hållfasthetsklass C14",
  "2301": "Hållfasthetsklass C14 Impregnerat",
  "2340": "Hållfasthetsklass C24",
  "2341": "Hållfasthetsklass C24 Impregnerat",
  "2350": "Läkt och reglar",
  "2400": "Ytterpanelbräder Finsågad",
  "2401": "Ytterpanelbräder Finsågad STD Grund",
  "2402": "Ytterpanelbräder Finsågad NCS Grund",
  "2403": "Ytterpanelbräder Finsågad STD Mellan",
  "2404": "Ytterpanelbräder Finsågad NCS Mellan",
  "2450": "Ytterpanelbräder Profilerad",
  "2500": "Ytterpanelbräder Lockläkt",
  "2501": "Ytterpanelbräder Lockläkt STD Grund",
  "2503": "Ytterpanelbräder Lockläkt STD Mellan",
  "2550": "Profilerade utvändiga lister",
  "2600": "Trall Impregnerad",
  "2610": "Trall Obehandlad",
};

const GRUPP_OPTIONS = Object.keys(GRUPPER);

type Article = {
  artNr: string;
  produkt: string;
  pakettyp: string;
  langd: string;
  grupp: string;
};

const ARTICLES: Article[] = [
  { artNr: "2102812031008100", produkt: "28x120 Furu Trall G4-2 NTR AB", pakettyp: "Lp", langd: "", grupp: "2600" },
  { artNr: "2104504531001320", produkt: "45x45 Furu C14 NTR AB", pakettyp: "Lp", langd: "", grupp: "2301" },
  { artNr: "2104507031001320", produkt: "45x70 Furu C14 NTR AB", pakettyp: "Lp", langd: "", grupp: "2301" },
  { artNr: "2104509500001500", produkt: "45x95 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104509531001500", produkt: "45x95 Furu C24 NTR AB", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2104512000001500", produkt: "45x120 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104512031001500", produkt: "45x120 Furu C24 NTR AB", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2104514500001500", produkt: "45x145 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104514530001500", produkt: "45x145 Furu C24 NTR A", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2104517000001500", produkt: "45x170 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104517030001500", produkt: "45x170 Furu C24 NTR A", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2104519500001500", produkt: "45x195 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104519530001500", produkt: "45x195 Furu C24 NTR A", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2104522000001500", produkt: "45x220 Furu C24", pakettyp: "Lp", langd: "", grupp: "2340" },
  { artNr: "2104522030001500", produkt: "45x220 Furu C24 NTR A", pakettyp: "Lp", langd: "", grupp: "2341" },
  { artNr: "2201103600001800", produkt: "11x36 Gran Läkt", pakettyp: "Buntat Lp", langd: "", grupp: "2350" },
  { artNr: "2202054000136124", produkt: "20x540 Gran Takfotslucka G4-2 Grund", pakettyp: "Lp", langd: "2,4", grupp: "2550" },
  { artNr: "2202054000136130", produkt: "20x540 Gran Takfotslucka G4-2 Grund", pakettyp: "Lp", langd: "3", grupp: "2550" },
  { artNr: "2202054000136136", produkt: "20x540 Gran Takfotslucka G4-2 Grund", pakettyp: "Lp", langd: "3,6", grupp: "2550" },
  { artNr: "2202054000526124", produkt: "20x540 Gran Takfotslucka G4-2 Mellan", pakettyp: "Lp", langd: "2,4", grupp: "2550" },
  { artNr: "2202054000526130", produkt: "20x540 Gran Takfotslucka G4-2 Mellan", pakettyp: "Lp", langd: "3", grupp: "2550" },
  { artNr: "2202054000526136", produkt: "20x540 Gran Takfotslucka G4-2 Mellan", pakettyp: "Lp", langd: "3,6", grupp: "2550" },
  { artNr: "2202204500002000", produkt: "22x45 Gran Ytterp", pakettyp: "Lp", langd: "", grupp: "2400" },
  { artNr: "2202204500002500", produkt: "22x45 Gran Lockläkt Fasad", pakettyp: "Lp", langd: "", grupp: "2500" },
  { artNr: "2202204500102000", produkt: "22x45 Gran Ytterp Grund Vit STD", pakettyp: "Lp", langd: "", grupp: "2401" },
  { artNr: "2202204500132000", produkt: "22x45 Gran Ytterp Grund LASYR", pakettyp: "Lp", langd: "", grupp: "2402" },
  { artNr: "2202204500152500", produkt: "22x45 Gran Lockläkt Fasad CMP-G Vit STD", pakettyp: "Lp", langd: "", grupp: "2501" },
  { artNr: "2202204500202000", produkt: "22x45 Gran Ytterp CMP-G/M Vit STD", pakettyp: "Lp", langd: "", grupp: "2403" },
  { artNr: "2202204500522000", produkt: "22x45 Gran Ytterp Mellan", pakettyp: "Lp", langd: "", grupp: "2403" },
  { artNr: "2202207000002000", produkt: "22x70 Gran Ytterp", pakettyp: "Lp", langd: "", grupp: "2400" },
  { artNr: "2202295310810042", produkt: "22x95 Furu Trall G4-2 NTR AB", pakettyp: "Lp", langd: "4,2", grupp: "2600" },
  { artNr: "2203409500002000", produkt: "34x95 Gran Trall Slät", pakettyp: "Lp", langd: "4,2", grupp: "2610" },
];

type ArticleRow = Article & {
  volym: string;
  bestalld: boolean;
};

// Deterministiskt urval per prislista: ungefär 4 av 5 artiklar, var fjärde av dem med beställd volym.
function getPriceListArticles(priceListId: string): ArticleRow[] {
  const seed = Number(priceListId);
  return ARTICLES.flatMap((article, idx) => {
    if ((seed + idx * 7) % 5 === 0) return [];
    const isOrdered = (seed * 3 + idx * 11) % 4 === 0;
    const volym = isOrdered ? (((seed + idx * 13) % 300) / 10 + 1.2).toFixed(3).replace(".", ",") : "";
    return [{ ...article, volym, bestalld: isOrdered }];
  });
}

function formatPriceList(pl: SourcePriceList) {
  return [pl.id, pl.externNr, pl.kund].filter(Boolean).join(" — ");
}

// ── Filter ────────────────────────────────────────────────────────────────

type AktivFilter = "alla" | "aktiv" | "inaktiv";

const STATUS_OPTIONS: Array<{ value: AktivFilter; label: string }> = [
  { value: "alla", label: "Godkänd eller avregistrerad" },
  { value: "aktiv", label: "Godkänd" },
  { value: "inaktiv", label: "Avregistrerad" },
];

const matchesStatus = (pl: SourcePriceList, status: AktivFilter) => status === "alla" || pl.aktiv === (status === "aktiv");

const GRUPP_FILTER: ColumnFilterConfig = { kind: "enum", options: GRUPP_OPTIONS, operators: ["is"], optionDescriptions: GRUPPER };
const BESTALLD_FILTER: ColumnFilterConfig = { kind: "enum", options: ["Ja", "Nej"], operators: ["is"] };

type TableFilters = {
  grupp?: ColumnFilterValue;
  bestalld?: ColumnFilterValue;
};

function applyFilters(rows: ArticleRow[], filters: TableFilters) {
  return rows.filter(
    (row) =>
      (!isColumnFilterActive(filters.grupp) || matchesColumnFilter(row.grupp, filters.grupp!, "enum")) &&
      (!isColumnFilterActive(filters.bestalld) || matchesColumnFilter(row.bestalld ? "Ja" : "Nej", filters.bestalld!, "enum"))
  );
}

// ── Tabell ────────────────────────────────────────────────────────────────

// Kompakta kolumnbredder; en tom utfyllnadskolumn sist tar resterande bredd.
const COL = { check: 40, artNr: 140, produkt: 300, pakettyp: 76, langd: 56, volym: 66, grupp: 80, bestalld: 92 };

type ArticleTableProps = {
  rows: ArticleRow[];
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  emptyText: string;
};

function ArticleTable({ rows, selected, onSelectedChange, filters, onFiltersChange, emptyText }: ArticleTableProps) {
  const selectedVisible = rows.filter((row) => selected.has(row.artNr)).length;
  const allSelected = rows.length > 0 && selectedVisible === rows.length;

  const toggleRow = (artNr: string) => {
    const next = new Set(selected);
    if (next.has(artNr)) next.delete(artNr);
    else next.add(artNr);
    onSelectedChange(next);
  };

  // "Markera alla" gäller de rader som syns med aktuellt filter; dolda markeringar behålls.
  const toggleAll = () => {
    const next = new Set(selected);
    rows.forEach((row) => (allSelected ? next.delete(row.artNr) : next.add(row.artNr)));
    onSelectedChange(next);
  };

  const headerLabel = (label: string, filter?: ReactNode) => (
    <div className={styles.prislistekalkylHeaderLabel}>
      {label}
      {filter}
    </div>
  );

  return (
    <TableContainer component={Paper} variant="outlined" className={styles.kopieraTableContainer}>
      <Table size="small" stickyHeader aria-label="Artiklar på prislista" className={styles.kopieraArticleTable}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" style={{ width: COL.check }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selectedVisible > 0 && !allSelected}
                disabled={rows.length === 0}
                onChange={toggleAll}
                slotProps={{ input: { "aria-label": "Markera alla" } }}
              />
            </TableCell>
            <TableCell style={{ width: COL.artNr }}>ArtNr</TableCell>
            <TableCell style={{ width: COL.produkt }}>Produkt</TableCell>
            <TableCell style={{ width: COL.pakettyp }}>Pakettyp</TableCell>
            <TableCell style={{ width: COL.langd }}>Längd</TableCell>
            <TableCell style={{ width: COL.volym }} align="right">Volym</TableCell>
            <TableCell style={{ width: COL.grupp }}>
              {headerLabel(
                "Grupp",
                <ColumnFilterButton config={GRUPP_FILTER} filter={filters.grupp} onApply={(f) => onFiltersChange({ ...filters, grupp: f ?? undefined })} />
              )}
            </TableCell>
            <TableCell style={{ width: COL.bestalld }}>
              {headerLabel(
                "Beställd",
                <ColumnFilterButton config={BESTALLD_FILTER} filter={filters.bestalld} onApply={(f) => onFiltersChange({ ...filters, bestalld: f ?? undefined })} />
              )}
            </TableCell>
            <TableCell aria-hidden="true" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className={styles.kopieraEmptyCell}>{emptyText}</TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const isSelected = selected.has(row.artNr);
              return (
                <TableRow
                  key={row.artNr}
                  hover
                  selected={isSelected}
                  className={styles.kopieraArticleRow}
                  onClick={() => toggleRow(row.artNr)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleRow(row.artNr)}
                      slotProps={{ input: { "aria-label": `Markera ${row.produkt}` } }}
                    />
                  </TableCell>
                  <TableCell className={styles.kopieraNumericCell}>{row.artNr}</TableCell>
                  <TableCell title={row.produkt}>{row.produkt}</TableCell>
                  <TableCell>{row.pakettyp}</TableCell>
                  <TableCell>{row.langd}</TableCell>
                  <TableCell align="right" className={styles.kopieraNumericCell}>{row.volym}</TableCell>
                  <TableCell title={GRUPPER[row.grupp]} className={styles.kopieraNumericCell}>
                    {row.grupp}
                  </TableCell>
                  <TableCell>{row.bestalld ? "Ja" : ""}</TableCell>
                  <TableCell aria-hidden="true" />
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Dialog ────────────────────────────────────────────────────────────────

type KopieraPrislisteraderDialogProps = {
  open: boolean;
  targetPriceListId: string;
  onClose: () => void;
  onCopy: (result: { count: number; fromPriceListId: string }) => void;
};

export function KopieraPrislisteraderDialog({ open, targetPriceListId, onClose, onCopy }: KopieraPrislisteraderDialogProps) {
  const [kund, setKund] = useState("");
  const [aktivFilter, setAktivFilter] = useState<AktivFilter>("aktiv");
  const [fromPriceListId, setFromPriceListId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<TableFilters>({});
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setKund("");
      setAktivFilter("aktiv");
      setFromPriceListId("");
      setSelected(new Set());
      setFilters({});
    }
  }

  const priceListOptions = SOURCE_PRICE_LISTS.filter(
    (pl) => pl.id !== targetPriceListId && (kund === "" || pl.kund === kund) && matchesStatus(pl, aktivFilter)
  );

  const selectSource = (id: string) => {
    setFromPriceListId(id);
    setSelected(new Set());
  };

  // Om kund- eller aktivfiltret döljer vald prislista nollställs valet.
  const updateSourceFilter = (nextKund: string, nextAktiv: AktivFilter) => {
    setKund(nextKund);
    setAktivFilter(nextAktiv);
    const stillVisible = SOURCE_PRICE_LISTS.some(
      (pl) => pl.id === fromPriceListId && (nextKund === "" || pl.kund === nextKund) && matchesStatus(pl, nextAktiv)
    );
    if (!stillVisible) selectSource("");
  };

  const sourceRows = fromPriceListId ? getPriceListArticles(fromPriceListId) : [];
  const visibleRows = applyFilters(sourceRows, filters);
  const visibleKeys = new Set(visibleRows.map((row) => row.artNr));
  const selectedCount = selected.size;
  const hiddenSelectedCount = [...selected].filter((key) => !visibleKeys.has(key)).length;

  const summary =
    selectedCount === 0
      ? `Inga rader markerade av ${sourceRows.length}`
      : `${selectedCount} av ${sourceRows.length} rader markerade${hiddenSelectedCount > 0 ? ` (${hiddenSelectedCount} dolda av filter)` : ""}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { className: `${styles.freightDialogPaper} ${styles.kopieraDialogPaper}` } }}
    >
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Kopiera prislisterader</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={`${styles.freightDialogContent} ${styles.kopieraDialogContent}`}>
        {/* Källa */}
        <div className={styles.kopieraSourceRow}>
          <Autocomplete
            size="small"
            options={KUND_OPTIONS}
            value={kund || null}
            onChange={(_event, newValue) => updateSourceFilter(newValue ?? "", aktivFilter)}
            popupIcon={<KeyboardArrowDownIcon />}
            noOptionsText="Ingen kund matchar"
            className={styles.kopieraKundField}
            renderInput={(params) => <TextField {...params} label="Från kund" />}
          />
          <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
          <TextField
            select
            size="small"
            label="Status prislista"
            value={aktivFilter}
            onChange={(e) => updateSourceFilter(kund, e.target.value as AktivFilter)}
            className={styles.kopieraStatusField}
            slotProps={{ select: { IconComponent: KeyboardArrowDownIcon } }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Autocomplete
            size="small"
            options={priceListOptions}
            value={SOURCE_PRICE_LISTS.find((pl) => pl.id === fromPriceListId) ?? null}
            onChange={(_event, newValue) => selectSource(newValue?.id ?? "")}
            getOptionLabel={formatPriceList}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={({ key, ...optionProps }, pl) => (
              <li key={key} {...optionProps} className={`${optionProps.className ?? ""} ${styles.kopieraPrislistaOption}`}>
                <span className={styles.kopieraNumericCell}>{pl.id}</span>
                <span>{pl.externNr}</span>
                <span>{pl.kund}</span>
              </li>
            )}
            popupIcon={<KeyboardArrowDownIcon />}
            noOptionsText="Inga prislistor matchar"
            slotProps={{
              listbox: { style: { maxHeight: 360 } },
              popper: { placement: "bottom-start", style: { width: 520 } },
            }}
            className={styles.kopieraPrislistaField}
            renderInput={(params) => <TextField {...params} label="Från prislista" />}
          />
          <TextField
            size="small"
            label="Till prislista"
            value={targetPriceListId}
            disabled
            className={styles.kopieraTillField}
          />
        </div>

        {/* Artiklar */}
        <section className={styles.kopieraPanel}>
          <Typography className={styles.contractSectionTitle}>Artiklar på prislista</Typography>
          <ArticleTable
            rows={visibleRows}
            selected={selected}
            onSelectedChange={setSelected}
            filters={filters}
            onFiltersChange={setFilters}
            emptyText={!fromPriceListId ? "Välj en prislista för att se dess artiklar." : "Inga artiklar matchar filtret."}
          />
        </section>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        {fromPriceListId ? (
          <Typography className={styles.kopieraSelectionSummary}>{summary}</Typography>
        ) : null}
        <Button
          variant="contained"
          size="small"
          disabled={selectedCount === 0}
          onClick={() => onCopy({ count: selectedCount, fromPriceListId })}
          className={styles.bytPrislistaOkButton}
        >
          Kopiera
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

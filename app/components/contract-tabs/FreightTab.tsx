"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

type ProductType = "Virke" | "Ströprodukt";
type CurrencyCode = "SEK" | "EUR" | "USD" | "NOK";

const CURRENCY_OPTIONS: CurrencyCode[] = ["SEK", "EUR", "USD", "NOK"];
const DEFAULT_CURRENCY: CurrencyCode = "SEK";
const UNIT_OPTIONS = [
  "BP Hammerdal Byggprodukter",
  "BP Hissmofors Byggprodukter",
  "BP Kåge Byggprodukter",
  "Huvudkontor",
  "NT Hissmofors Såg",
  "NT Kåge Såg",
  "NT Stolfabrik Agnäs",
  "NT Sävar Såg",
] as const;
const ROUTE_OPTIONS = [
  "Sävar - Mariestad",
  "Krokom - Mariestad",
  "Kåge - Mariestad",
  "Hammerdal - Mariestad",
] as const;

type VirkeRow = {
  typ: ProductType;
  bolag: string;
  avtalsrutt: string;
  frakt: string;
  fraktCurrency: CurrencyCode;
  sped: string;
  spedCurrency: CurrencyCode;
  sjofrakt: string;
  sjofraktCurrency: CurrencyCode;
  haulage: string;
  haulageCurrency: CurrencyCode;
};

type FreightRow = Record<string, string | undefined>;
type VirkeColumnKey = keyof VirkeRow | "totalFraktkostnad" | "_actions";
type FreightAmountKey = "frakt" | "sped" | "sjofrakt" | "haulage";
type FreightCurrencyKey = "fraktCurrency" | "spedCurrency" | "sjofraktCurrency" | "haulageCurrency";

const FREIGHT_FIELDS: Array<{
  amountKey: FreightAmountKey;
  currencyKey: FreightCurrencyKey;
  label: string;
}> = [
    { amountKey: "frakt", currencyKey: "fraktCurrency", label: "Frakt Bil / Jvg" },
    { amountKey: "sped", currencyKey: "spedCurrency", label: "Sped/termkostn." },
    { amountKey: "sjofrakt", currencyKey: "sjofraktCurrency", label: "Sjöfrakt" },
    { amountKey: "haulage", currencyKey: "haulageCurrency", label: "Haulage" },
  ];

const SNITT_COLUMNS = [
  { key: "lastbare", label: "Lastbärare" },
  { key: "valutakod", label: "Valutakod" },
  { key: "snittvolym", label: "Snittvolym" },
  { key: "hammerdal", label: "Hammerdal" },
  { key: "krokom", label: "Krokom" },
  { key: "kage", label: "Kåge" },
  { key: "savar", label: "Sävar" },
];

const SNITT_ROWS: FreightRow[] = [
  { lastbare: "Bil", valutakod: "SEK", snittvolym: "22", hammerdal: "-", krokom: "357", kage: "-", savar: "419" },
  { lastbare: "Bil & Släp", valutakod: "SEK", snittvolym: "69", hammerdal: "-", krokom: "215", kage: "227", savar: "211" },
  { lastbare: "Släp", valutakod: "SEK", snittvolym: "47", hammerdal: "282", krokom: "248", kage: "-", savar: "-" },
  { lastbare: "Trailer (25 ton)", valutakod: "SEK", snittvolym: "49", hammerdal: "207", krokom: "-", kage: "218", savar: "-" },
  { lastbare: "Trailer (30 ton)", valutakod: "SEK", snittvolym: "52", hammerdal: "-", krokom: "-", kage: "-", savar: "-" },
];

const VIRKE_COLUMNS: Array<{ key: VirkeColumnKey; label: string; pinnedRight?: boolean }> = [
  { key: "typ", label: "Typ" },
  { key: "bolag", label: "Enhet" },
  { key: "avtalsrutt", label: "Avtalsrutt" },
  { key: "frakt", label: "Frakt Bil / Jvg" },
  { key: "sped", label: "Sped/termkostn." },
  { key: "sjofrakt", label: "Sjöfrakt" },
  { key: "haulage", label: "Haulage" },
  { key: "totalFraktkostnad", label: "Total fraktkostnad" },
  { key: "_actions", label: "", pinnedRight: true },
];

const emptyVirkeRow = (): VirkeRow => ({
  typ: "Virke",
  bolag: "",
  avtalsrutt: "",
  frakt: "",
  fraktCurrency: DEFAULT_CURRENCY,
  sped: "",
  spedCurrency: DEFAULT_CURRENCY,
  sjofrakt: "",
  sjofraktCurrency: DEFAULT_CURRENCY,
  haulage: "",
  haulageCurrency: DEFAULT_CURRENCY,
});

const emptyStröproduktRow = (): VirkeRow => ({
  typ: "Ströprodukt",
  bolag: "",
  avtalsrutt: "",
  frakt: "0",
  fraktCurrency: DEFAULT_CURRENCY,
  sped: "0",
  spedCurrency: DEFAULT_CURRENCY,
  sjofrakt: "0",
  sjofraktCurrency: DEFAULT_CURRENCY,
  haulage: "0",
  haulageCurrency: DEFAULT_CURRENCY,
});

const LEGACY_INITIAL_VIRKE_ROWS: Array<Partial<VirkeRow>> = [
  { typ: "Virke", bolag: "NT Hissmofors Såg", avtalsrutt: "Krokom - Mariestad", frakt: "123 SEK", sped: "0 SEK", sjofrakt: "0 SEK", haulage: "0 SEK" },
];

const isCurrencyCode = (value: string | undefined): value is CurrencyCode =>
  CURRENCY_OPTIONS.includes((value ?? "") as CurrencyCode);

const parseLegacyFreightValue = (value: string | undefined): { amount: string; currency: CurrencyCode } => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { amount: "", currency: DEFAULT_CURRENCY };
  }

  const parts = trimmed.split(/\s+/);
  const lastPart = parts.at(-1)?.toUpperCase();

  if (lastPart && isCurrencyCode(lastPart)) {
    return {
      amount: parts.slice(0, -1).join(" "),
      currency: lastPart,
    };
  }

  return { amount: trimmed, currency: DEFAULT_CURRENCY };
};

const normalizeVirkeRow = (row: Partial<VirkeRow>): VirkeRow => {
  const normalized = emptyVirkeRow();
  normalized.typ = row.typ ?? normalized.typ;
  normalized.bolag = row.bolag ?? normalized.bolag;
  normalized.avtalsrutt = row.avtalsrutt ?? normalized.avtalsrutt;

  FREIGHT_FIELDS.forEach(({ amountKey, currencyKey }) => {
    const parsed = parseLegacyFreightValue(row[amountKey]);
    normalized[amountKey] = parsed.amount;
    normalized[currencyKey] = isCurrencyCode(row[currencyKey]) ? row[currencyKey] : parsed.currency;
  });

  return normalized;
};

const INITIAL_VIRKE_ROWS: VirkeRow[] = LEGACY_INITIAL_VIRKE_ROWS.map(normalizeVirkeRow);

const parseAmountInput = (value: string): number => {
  const normalized = value
    .replace(/\s+/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/,/g, ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrencyValue = (value: number, currency: CurrencyCode): string => {
  const hasDecimals = Math.abs(value % 1) > 0;
  return `${new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
};

const getFreightDisplayValue = (row: VirkeRow, amountKey: FreightAmountKey): string => {
  const field = FREIGHT_FIELDS.find((entry) => entry.amountKey === amountKey);
  if (!field) {
    return "-";
  }

  const amount = row[amountKey].trim();
  if (!amount) {
    return "-";
  }

  return formatCurrencyValue(parseAmountInput(amount), row[field.currencyKey]);
};

const getTotalFreightCost = (row: VirkeRow): number =>
  FREIGHT_FIELDS.reduce((sum, field) => sum + parseAmountInput(row[field.amountKey]), 0);

const getTotalFreightSummary = (row: VirkeRow): string => {
  const activeFields = FREIGHT_FIELDS.filter((field) => row[field.amountKey].trim() !== "");

  if (activeFields.length === 0) {
    return formatCurrencyValue(0, DEFAULT_CURRENCY);
  }

  const currencies = [...new Set(activeFields.map((field) => row[field.currencyKey]))];
  if (currencies.length !== 1) {
    return "Blandad valuta";
  }

  return formatCurrencyValue(getTotalFreightCost(row), currencies[0]);
};

type FormState =
  | { mode: "closed" }
  | { mode: "add"; draft: VirkeRow }
  | { mode: "edit"; index: number; draft: VirkeRow };

export function FreightTab() {
  const [virkeRows, setVirkeRows] = useState<VirkeRow[]>(INITIAL_VIRKE_ROWS);
  const [selectedSnittRow, setSelectedSnittRow] = useState<number | null>(null);
  const [freightInfoExpanded, setFreightInfoExpanded] = useState(false);
  const [selectedVirkeRow, setSelectedVirkeRow] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const [keepDialogValues, setKeepDialogValues] = useState(false);
  const [lastFreightDraft, setLastFreightDraft] = useState<VirkeRow | null>(null);
  const [createFeedback, setCreateFeedback] = useState({ open: false, key: 0 });

  const openAddStröprodukt = () => {
    const initialDraft = keepDialogValues && lastFreightDraft ? { ...lastFreightDraft, typ: "Ströprodukt" as ProductType } : emptyStröproduktRow();
    setForm({ mode: "add", draft: initialDraft });
    setSelectedVirkeRow(null);
  };


  const openEdit = (index: number) => {
    setForm({ mode: "edit", index, draft: normalizeVirkeRow(virkeRows[index]) });
    setSelectedVirkeRow(index);
  };

  const openClone = (index: number) => {
    setForm({ mode: "add", draft: normalizeVirkeRow(virkeRows[index]) });
    setSelectedVirkeRow(null);
  };

  const closeForm = () => setForm({ mode: "closed" });

  const setDraftField = (key: keyof VirkeRow, value: string) => {
    setForm((prev) =>
      prev.mode === "closed" ? prev : { ...prev, draft: { ...prev.draft, [key]: value } }
    );
  };

  const saveForm = () => {
    if (form.mode === "closed") {
      return;
    }

    const nextDraft = normalizeVirkeRow(form.draft);

    if (form.mode === "add") {
      setVirkeRows((prev) => [...prev, nextDraft]);
      setLastFreightDraft(keepDialogValues ? nextDraft : null);
      setCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));
      if (keepDialogOpen) {
        setForm({ mode: "add", draft: keepDialogValues ? nextDraft : emptyVirkeRow() });
        return;
      }
    } else if (form.mode === "edit") {
      setVirkeRows((prev) =>
        prev.map((row, i) => (i === form.index ? nextDraft : row))
      );
      if (keepDialogOpen) {
        setForm({ mode: "edit", index: form.index, draft: nextDraft });
        return;
      }
    }

    closeForm();
  };

  const draft = form.mode !== "closed" ? form.draft : null;
  const isDialogOpen = draft !== null;
  const totalFreightSummary = draft ? getTotalFreightSummary(draft) : getTotalFreightSummary(emptyVirkeRow());

  return (
    <div className={styles.freightTabContent}>
      <div className={styles.freightSection}>
        <div className={styles.freightInfoSection}>
          <div className={styles.freightInfoTitleRow}>
            <Typography className={styles.freightInfoTitle}>Fraktrader för virke skapas automatiskt</Typography>
            <button
              type="button"
              className={styles.freightInfoToggle}
              aria-expanded={freightInfoExpanded}
              aria-label="Mer information"
              onClick={() => setFreightInfoExpanded((prev) => !prev)}
            >
              ?
            </button>
          </div>
          {freightInfoExpanded ? (
            <>
              <Typography className={styles.freightInfoText}>
                Fraktrader för virke läggs till automatiskt utifrån avtalsrutt. Värdet för Frakt Bil / Jvg hämtas från C-Load och kan, likt eventuella övriga fraktkostnader, justeras manuellt.
              </Typography>
              <Typography className={styles.freightInfoText}>
                För ströprodukter behöver alla fält fyllas i manuellt.
              </Typography>
            </>

          ) : null}
        </div>

        <div className={styles.freightSectionHeader}>
          <Button
            className={styles.freightNewButton}
            startIcon={<AddIcon />}
            onClick={openAddStröprodukt}
          >
            Ny frakt (ströprodukt)
          </Button>
        </div>

        <div className={styles.freightTableWrap}>
          <div className={styles.freightTable}>
            <DataTable
              variant="line"
              columns={VIRKE_COLUMNS}
              rows={virkeRows}
              rowKey={(_row, index) => `virke-${index}`}
              selectedRowIndex={selectedVirkeRow}
              onRowClick={(index) => setSelectedVirkeRow((prev) => (prev === index ? null : index))}
              renderCell={(row, column, rowIndex) => {
                if (column.key === "_actions") {
                  const virkeRow = row as VirkeRow;
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(rowIndex);
                        }}
                        title="Redigera rad"
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      {virkeRow.typ === "Ströprodukt" ? (
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            openClone(rowIndex);
                          }}
                          title="Duplicera rad"
                        >
                          <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                        </IconButton>
                      ) : null}
                    </span>
                  );
                }
                if (column.key === "totalFraktkostnad") {
                  return getTotalFreightSummary(row as VirkeRow);
                }
                if (["frakt", "sped", "sjofrakt", "haulage"].includes(column.key)) {
                  return getFreightDisplayValue(row as VirkeRow, column.key as FreightAmountKey);
                }
                return row[column.key as keyof VirkeRow];
              }}
            />
          </div>
        </div>

        <Dialog
          open={isDialogOpen}
          onClose={closeForm}
          fullWidth
          maxWidth="md"
          classes={{ paper: styles.freightDialogPaper }}
        >
          <DialogTitle className={styles.freightDialogTitle}>
            <div className={styles.freightDialogTitleRow}>
              <span>{form.mode === "add" ? "Ny frakt (ströprodukt)" : "Redigera frakt"}</span>
              {form.mode === "add" ? (
                <div className={styles.freightDialogToggles}>
                  <label className={styles.freightDialogKeepOpen}>
                    <Checkbox
                      size="small"
                      checked={keepDialogOpen}
                      onChange={(event) => setKeepDialogOpen(event.target.checked)}
                    />
                    <span>Behåll öppen</span>
                  </label>
                  <label className={styles.freightDialogKeepOpen}>
                    <Checkbox
                      size="small"
                      checked={keepDialogValues}
                      onChange={(event) => {
                        setKeepDialogValues(event.target.checked);
                        if (event.target.checked) setKeepDialogOpen(true);
                      }}
                    />
                    <span>Behåll värden</span>
                  </label>
                </div>
              ) : null}
            </div>
          </DialogTitle>
          <DialogContent className={styles.freightDialogContent}>
            {draft !== null ? (
              <div className={styles.freightFormGrid}>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Typ</Typography>
                  <Select
                    size="small"
                    value={draft.typ}
                    onChange={(e) => setDraftField("typ", e.target.value as ProductType)}
                    className={styles.freightFormInput}
                    disabled={form.mode === "add" || form.mode === "edit"}
                  >
                    <MenuItem value="Virke">Virke</MenuItem>
                    <MenuItem value="Ströprodukt">Ströprodukt</MenuItem>
                  </Select>
                </div>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Enhet</Typography>
                  <Select
                    size="small"
                    value={draft.bolag}
                    onChange={(e) => setDraftField("bolag", e.target.value)}
                    className={styles.freightFormInput}
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div className={styles.freightFormField}>
                  <Typography className={styles.freightFormLabel}>Avtalsrutt</Typography>
                  <Select
                    size="small"
                    value={draft.avtalsrutt}
                    onChange={(e) => setDraftField("avtalsrutt", e.target.value)}
                    className={styles.freightFormInput}
                  >
                    {ROUTE_OPTIONS.map((route) => (
                      <MenuItem key={route} value={route}>
                        {route}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                {FREIGHT_FIELDS.map((field) => (
                  <div key={field.amountKey} className={styles.freightFormField}>
                    <Typography className={styles.freightFormLabel}>{field.label}</Typography>
                    <div className={styles.freightAmountCurrencyRow}>
                      <TextField
                        size="small"
                        value={draft[field.amountKey]}
                        onChange={(e) => setDraftField(field.amountKey, e.target.value)}
                        className={`${styles.freightFormInput} ${styles.freightAmountInput}`}
                      />
                      <Select
                        size="small"
                        value={draft[field.currencyKey]}
                        onChange={(e) => setDraftField(field.currencyKey, e.target.value as CurrencyCode)}
                        className={`${styles.freightFormInput} ${styles.freightCurrencyInput}`}
                      >
                        {CURRENCY_OPTIONS.map((currency) => (
                          <MenuItem key={currency} value={currency}>
                            {currency}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </DialogContent>
          <DialogActions className={styles.freightDialogActions}>
            {form.mode !== "closed" ? (
              <div className={styles.freightTotalCostWrap}>
                <Typography className={styles.freightTotalCostLabel}>Total fraktkostnad</Typography>
                <Typography className={styles.freightTotalCostValue}>{totalFreightSummary}</Typography>
              </div>
            ) : null}
            <Button size="small" className={styles.freightSaveButton} onClick={saveForm}>
              {form.mode === "add" ? "Lägg till" : "Spara"}
            </Button>
            <Button size="small" className={styles.freightCancelButton} onClick={closeForm}>
              Avbryt
            </Button>
          </DialogActions>
        </Dialog>

        <div className={styles.freightSnittCard}>
          <div className={styles.freightSnittHeader}>
            <Typography className={styles.freightSnittTitle}>
              Snittpriser i C-Load (valuta/m3) till Mariestad
            </Typography>
            <Tooltip title="Uppdatera" placement="top">
              <IconButton size="small" className={styles.contractHeaderDotsButton}>
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className={styles.freightTableWrap}>
            <div className={styles.freightTable}>
              <DataTable
                variant="line"
                columns={SNITT_COLUMNS}
                rows={SNITT_ROWS}
                rowKey={(_row, index) => `snitt-${index}`}
                selectedRowIndex={selectedSnittRow}
                onRowClick={setSelectedSnittRow}
              />
            </div>
          </div>
        </div>

        <Snackbar
          key={createFeedback.key}
          open={createFeedback.open}
          autoHideDuration={2200}
          onClose={() => setCreateFeedback((previous) => ({ ...previous, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setCreateFeedback((previous) => ({ ...previous, open: false }))}
            severity="success"
            variant="filled"
          >
            Post skapad
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

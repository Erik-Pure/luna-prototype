"use client";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

type PriceListOption = {
  id: string;
  externalNr: string;
  customer: string;
};

type PriceChoice = "kontrakt" | "prislista";

type MissingRow = {
  rowId: string;
  produkt: string;
  currentPris: string;
};

type ExistingRow = {
  rowId: string;
  produkt: string;
  kontraktsPris: string;
  prislistePris: string;
};

const AVAILABLE_PRICE_LISTS: PriceListOption[] = [
  { id: "17537", externalNr: "2025/10 Reg. 4", customer: "Mestergruppen - Region 4" },
  { id: "17538", externalNr: "2025/11 Reg. 2", customer: "Norr TräHus" },
  { id: "17539", externalNr: "2026/01 Reg. 3", customer: "Acme AB" },
];

const PRODUCTS_IN_PRICE_LIST: Record<string, Set<string>> = {
  "17537": new Set(["1", "2", "4", "5", "7", "9", "10", "11"]),
  "17538": new Set(["1", "3", "5", "6", "8", "10", "12"]),
  "17539": new Set(["2", "3", "4", "7", "8", "9"]),
};

const PRICE_LIST_PRICES: Record<string, Record<string, string>> = {
  "17537": {
    "1": "820 SEK/m³", "2": "875 SEK/m³", "4": "950 SEK/m³",
    "5": "1 020 SEK/m³", "7": "1 115 SEK/m³", "9": "1 240 SEK/m³",
    "10": "1 300 SEK/m³", "11": "1 380 SEK/m³",
  },
  "17538": {
    "1": "830 SEK/m³", "3": "900 SEK/m³", "5": "1 030 SEK/m³",
    "6": "1 075 SEK/m³", "8": "1 170 SEK/m³", "10": "1 310 SEK/m³",
    "12": "1 460 SEK/m³",
  },
  "17539": {
    "2": "885 SEK/m³", "3": "910 SEK/m³", "4": "960 SEK/m³",
    "7": "1 125 SEK/m³", "8": "1 180 SEK/m³", "9": "1 255 SEK/m³",
  },
};

const PRICE_UNIT = "SEK/m³";

const formatAmount = (amount: number) => String(amount).replace(/\B(?=(\d{3})+$)/g, " ");

const ALL_CONTRACT_ROWS = Array.from({ length: 12 }).map((_, idx) => ({
  rowId: `${idx + 1}`,
  produkt: ["Gran flisad spå", "Furu hyvlad", "Gran v-styrp"][idx % 3],
  currentPris: formatAmount(800 + idx * 70),
}));

function buildRows(priceListId: string): { missing: MissingRow[]; existing: ExistingRow[] } {
  const inList = PRODUCTS_IN_PRICE_LIST[priceListId] ?? new Set<string>();
  const prices = PRICE_LIST_PRICES[priceListId] ?? {};
  const missing: MissingRow[] = [];
  const existing: ExistingRow[] = [];
  for (const row of ALL_CONTRACT_ROWS) {
    if (inList.has(row.rowId)) {
      existing.push({ rowId: row.rowId, produkt: row.produkt, kontraktsPris: `${row.currentPris} ${PRICE_UNIT}`, prislistePris: prices[row.rowId] ?? "—" });
    } else {
      missing.push({ rowId: row.rowId, produkt: row.produkt, currentPris: row.currentPris });
    }
  }
  return { missing, existing };
}

type BytPrislistaDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function formatPriceList(priceList: PriceListOption) {
  return `${priceList.id} — ${priceList.externalNr} — ${priceList.customer}`;
}

export function BytPrislistaDialog({ open, onClose, onConfirm }: BytPrislistaDialogProps) {
  const [selectedPriceListId, setSelectedPriceListId] = useState(AVAILABLE_PRICE_LISTS[0].id);
  const [missingPrices, setMissingPrices] = useState<Record<string, string>>({});
  const [priceChoices, setPriceChoices] = useState<Record<string, PriceChoice>>({});
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedPriceListId(AVAILABLE_PRICE_LISTS[0].id);
      setMissingPrices({});
      setPriceChoices({});
    }
  }

  const { missing, existing } = buildRows(selectedPriceListId);

  const handlePriceListChange = (newId: string) => {
    setSelectedPriceListId(newId);
    setMissingPrices({});
    setPriceChoices({});
  };

  const handlePriceChoice = (rowId: string, choice: PriceChoice) => {
    setPriceChoices((prev) => ({ ...prev, [rowId]: choice }));
  };

  const selectAll = (choice: PriceChoice) => {
    const next: Record<string, PriceChoice> = {};
    for (const row of existing) next[row.rowId] = choice;
    setPriceChoices(next);
  };

  const renderPriceOption = (rowId: string, choice: PriceChoice, price: string) => (
    <FormControlLabel
      className={styles.bytPrislistaPriceOption}
      value={choice}
      checked={(priceChoices[rowId] ?? "kontrakt") === choice}
      onChange={() => handlePriceChoice(rowId, choice)}
      control={<Radio size="small" name={`byt-prislista-${rowId}`} />}
      label={price}
    />
  );

  const renderSelectAllOption = (choice: PriceChoice, label: string) => (
    <Tooltip title={`Välj ${label.toLowerCase()} på alla rader`} placement="top">
      <FormControlLabel
        className={styles.bytPrislistaPriceOption}
        value={choice}
        checked={existing.every((row) => (priceChoices[row.rowId] ?? "kontrakt") === choice)}
        onChange={() => selectAll(choice)}
        control={<Radio size="small" name="byt-prislista-alla" />}
        label={label}
      />
    </Tooltip>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Byt prislista</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Price list selector */}
        <FormControl size="small" fullWidth>
          <InputLabel id="byt-prislista-label">Byt till prislista</InputLabel>
          <Select
            labelId="byt-prislista-label"
            label="Byt till prislista"
            value={selectedPriceListId}
            IconComponent={KeyboardArrowDownIcon}
            onChange={(e) => handlePriceListChange(e.target.value)}
          >
            {AVAILABLE_PRICE_LISTS.map((pl) => (
              <MenuItem key={pl.id} value={pl.id}>{formatPriceList(pl)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Missing rows */}
        <section className={styles.bytPrislistaSection}>
          <Typography className={styles.contractSectionTitle}>Saknas i vald prislista</Typography>
          {missing.length === 0 ? (
            <Typography className={styles.bytPrislistaEmpty}>Alla produkter finns i den valda prislistan.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" className={styles.bytPrislistaTableContainer}>
              <Table size="small" className={styles.bytPrislistaTable}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "40%" }}>Produkt</TableCell>
                    <TableCell>Pris på kontraktsrad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missing.map((row) => (
                    <TableRow key={row.rowId}>
                      <TableCell>{row.produkt}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={missingPrices[row.rowId] ?? row.currentPris}
                          onChange={(e) => setMissingPrices((prev) => ({ ...prev, [row.rowId]: e.target.value }))}
                          className={styles.bytPrislistaPriceInput}
                          slotProps={{
                            htmlInput: { "aria-label": `Pris för ${row.produkt}` },
                            input: { endAdornment: <InputAdornment position="end">{PRICE_UNIT}</InputAdornment> },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </section>

        {/* Existing rows – radio price selection */}
        <section className={styles.bytPrislistaSection}>
          <Typography className={styles.contractSectionTitle}>Välj pris</Typography>
          {existing.length === 0 ? (
            <Typography className={styles.bytPrislistaEmpty}>Inga kontraktsrader matchar den valda prislistan.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" className={styles.bytPrislistaTableContainer}>
              <Table size="small" className={styles.bytPrislistaTable}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "40%" }}>Produkt</TableCell>
                    <TableCell style={{ width: "30%" }}>{renderSelectAllOption("kontrakt", "Kontraktspris")}</TableCell>
                    <TableCell style={{ width: "30%" }}>{renderSelectAllOption("prislista", "Prislistepris")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {existing.map((row) => (
                    <TableRow key={row.rowId}>
                      <TableCell>{row.produkt}</TableCell>
                      <TableCell>{renderPriceOption(row.rowId, "kontrakt", row.kontraktsPris)}</TableCell>
                      <TableCell>{renderPriceOption(row.rowId, "prislista", row.prislistePris)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </section>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button variant="contained" size="small" onClick={onConfirm} className={styles.bytPrislistaOkButton}>
          Spara
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

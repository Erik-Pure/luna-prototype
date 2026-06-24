"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

type PriceListOption = {
  id: string;
  externalNr: string;
  customer: string;
};

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
  "17537": new Set(["RAD-1001", "RAD-1002", "RAD-1004", "RAD-1005", "RAD-1007", "RAD-1009", "RAD-1010", "RAD-1011"]),
  "17538": new Set(["RAD-1001", "RAD-1003", "RAD-1005", "RAD-1006", "RAD-1008", "RAD-1010", "RAD-1012"]),
  "17539": new Set(["RAD-1002", "RAD-1003", "RAD-1004", "RAD-1007", "RAD-1008", "RAD-1009"]),
};

const PRICE_LIST_PRICES: Record<string, Record<string, string>> = {
  "17537": {
    "RAD-1001": "820 SEK/m³", "RAD-1002": "875 SEK/m³", "RAD-1004": "950 SEK/m³",
    "RAD-1005": "1 020 SEK/m³", "RAD-1007": "1 115 SEK/m³", "RAD-1009": "1 240 SEK/m³",
    "RAD-1010": "1 300 SEK/m³", "RAD-1011": "1 380 SEK/m³",
  },
  "17538": {
    "RAD-1001": "830 SEK/m³", "RAD-1003": "900 SEK/m³", "RAD-1005": "1 030 SEK/m³",
    "RAD-1006": "1 075 SEK/m³", "RAD-1008": "1 170 SEK/m³", "RAD-1010": "1 310 SEK/m³",
    "RAD-1012": "1 460 SEK/m³",
  },
  "17539": {
    "RAD-1002": "885 SEK/m³", "RAD-1003": "910 SEK/m³", "RAD-1004": "960 SEK/m³",
    "RAD-1007": "1 125 SEK/m³", "RAD-1008": "1 180 SEK/m³", "RAD-1009": "1 255 SEK/m³",
  },
};

const ALL_CONTRACT_ROWS = Array.from({ length: 12 }).map((_, idx) => ({
  rowId: `RAD-${1001 + idx}`,
  produkt: ["Gran flisad spå", "Furu hyvlad", "Gran v-styrp"][idx % 3],
  currentPris: `${800 + idx * 70} SEK/m³`,
}));

function buildRows(priceListId: string): { missing: MissingRow[]; existing: ExistingRow[] } {
  const inList = PRODUCTS_IN_PRICE_LIST[priceListId] ?? new Set<string>();
  const prices = PRICE_LIST_PRICES[priceListId] ?? {};
  const missing: MissingRow[] = [];
  const existing: ExistingRow[] = [];
  for (const row of ALL_CONTRACT_ROWS) {
    if (inList.has(row.rowId)) {
      existing.push({ rowId: row.rowId, produkt: row.produkt, kontraktsPris: row.currentPris, prislistePris: prices[row.rowId] ?? "—" });
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

export function BytPrislistaDialog({ open, onClose, onConfirm }: BytPrislistaDialogProps) {
  const [selectedPriceListId, setSelectedPriceListId] = useState(AVAILABLE_PRICE_LISTS[0].id);
  const [missingPrices, setMissingPrices] = useState<Record<string, string>>({});
  const [priceChoices, setPriceChoices] = useState<Record<string, "kontrakt" | "prislista">>({});

  const { missing, existing } = buildRows(selectedPriceListId);

  const handlePriceListChange = (newId: string) => {
    setSelectedPriceListId(newId);
    setMissingPrices({});
    setPriceChoices({});
  };

  const handlePriceChoice = (rowId: string, choice: "kontrakt" | "prislista") => {
    setPriceChoices((prev) => ({ ...prev, [rowId]: choice }));
  };

  const selectAll = (choice: "kontrakt" | "prislista") => {
    const next: Record<string, "kontrakt" | "prislista"> = {};
    for (const row of existing) next[row.rowId] = choice;
    setPriceChoices(next);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ className: styles.bytPrislistaDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Byt prislista</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Price list selector */}
        <div className={styles.bytPrislistaSelectorRow}>
          <Typography className={styles.bytPrislistaSelectorLabel}>Byt till prislista</Typography>
          <Select
            size="small"
            value={selectedPriceListId}
            onChange={(e) => handlePriceListChange(e.target.value)}
            className={styles.bytPrislistaSelect}
            renderValue={(id) => {
              const pl = AVAILABLE_PRICE_LISTS.find((p) => p.id === id);
              return pl ? `${pl.id} — ${pl.externalNr} — ${pl.customer}` : id;
            }}
          >
            {AVAILABLE_PRICE_LISTS.map((pl) => (
              <MenuItem key={pl.id} value={pl.id}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{pl.id}</span>
                <span style={{ color: "#4f5968", marginRight: 8 }}>{pl.externalNr}</span>
                <span style={{ color: "#6a7483" }}>{pl.customer}</span>
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Missing rows */}
        <div>
          <Typography className={styles.bytPrislistaSectionTitle}>
            Saknas i vald prislista
            {missing.length > 0 && <span className={styles.bytPrislistaSectionCount}>{missing.length}</span>}
          </Typography>
          {missing.length === 0 ? (
            <p className={styles.bytPrislistaEmpty}>Alla produkter finns i den valda prislistan.</p>
          ) : (
            <div className={styles.bytPrislistaTableWrap}>
              <table className={styles.bytPrislistaTable}>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Pris på kontraktsrad</th>
                  </tr>
                </thead>
                <tbody>
                  {missing.map((row) => {
                    const [defaultAmount, ...unitParts] = row.currentPris.split(" ");
                    const unit = unitParts.join(" ");
                    const value = missingPrices[row.rowId] ?? defaultAmount;
                    return (
                      <tr key={row.rowId}>
                        <td>{row.produkt}</td>
                        <td>
                          <TextField
                            size="small"
                            value={value}
                            onChange={(e) => setMissingPrices((prev) => ({ ...prev, [row.rowId]: e.target.value }))}
                            className={styles.bytPrislastaPriceInput}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Existing rows – radio price selection */}
        <div>
          <div className={styles.bytPrislistaSectionHeader}>
            <Typography className={styles.bytPrislistaSectionTitle} style={{ marginBottom: 0 }}>
              Välj pris
              {existing.length > 0 && <span className={styles.bytPrislistaSectionCount}>{existing.length}</span>}
            </Typography>
            {existing.length > 0 && (
              <div className={styles.bytPrislistaSelectAllRow}>
                <Typography className={styles.bytPrislistaSelectAllLabel}>Välj alla: </Typography>
                <Button variant="outlined" size="small" className={styles.bytPrislistaSelectAllBtn} onClick={() => selectAll("kontrakt")}>
                  Kontraktspris
                </Button>
                <Button variant="outlined" size="small" className={styles.bytPrislistaSelectAllBtn} onClick={() => selectAll("prislista")}>
                  Prislistepris
                </Button>
              </div>
            )}
          </div>
          {existing.length === 0 ? (
            <p className={styles.bytPrislistaEmpty}>Inga kontraktsrader matchar den valda prislistan.</p>
          ) : (
            <div className={styles.bytPrislistaTableWrap} style={{ marginTop: 10 }}>
              <table className={styles.bytPrislistaTable}>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Kontraktspris</th>
                    <th>Prislistepris</th>
                  </tr>
                </thead>
                <tbody>
                  {existing.map((row) => {
                    const choice = priceChoices[row.rowId] ?? "kontrakt";
                    return (
                      <tr key={row.rowId}>
                        <td>{row.produkt}</td>
                        <td>
                          <label className={styles.bytPrislistaRadioLabel}>
                            <input
                              type="radio"
                              name={row.rowId}
                              value="kontrakt"
                              checked={choice === "kontrakt"}
                              onChange={() => handlePriceChoice(row.rowId, "kontrakt")}
                              className={styles.bytPrislistaRadio}
                            />
                            {row.kontraktsPris}
                          </label>
                        </td>
                        <td>
                          <label className={styles.bytPrislistaRadioLabel}>
                            <input
                              type="radio"
                              name={row.rowId}
                              value="prislista"
                              checked={choice === "prislista"}
                              onChange={() => handlePriceChoice(row.rowId, "prislista")}
                              className={styles.bytPrislistaRadio}
                            />
                            {row.prislistePris}
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

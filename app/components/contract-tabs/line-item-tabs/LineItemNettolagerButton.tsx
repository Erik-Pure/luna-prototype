"use client";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../../shared/DataTable";
import styles from "../../../page.module.scss";

type NettolagerRow = {
  bolag: string;
  lagerstalle: string;
  pakettyp: string;
  volym: string;
};

const NETTOLAGER_COLUMNS: Array<{ key: keyof NettolagerRow; label: string; width?: number }> = [
  { key: "bolag", label: "Bolag", width: 220 },
  { key: "lagerstalle", label: "Lagerställe", width: 140 },
  { key: "pakettyp", label: "Pakettyp", width: 100 },
  { key: "volym", label: "Volym", width: 110 },
];

// Mockat nettolager per bolag – i riktiga systemet hämtas allas lager för vald produkt.
const NETTOLAGER_MOCK_ROWS: NettolagerRow[] = [
  { bolag: "BP Hissmofors Byggprodukter", lagerstalle: "Krokom", pakettyp: "Lp", volym: "12,400 m3" },
  { bolag: "BP Hissmofors Byggprodukter", lagerstalle: "Hissmofors", pakettyp: "Paket", volym: "8,750 m3" },
  { bolag: "BP Hammerdal Byggprodukter", lagerstalle: "Hammerdal", pakettyp: "Lp", volym: "5,120 m3" },
  { bolag: "BP Kåge Byggprodukter", lagerstalle: "Kåge", pakettyp: "Lp", volym: "3,300 m3" },
];

type LineItemNettolagerButtonProps = {
  artNr: string;
  product: string;
};

export function LineItemNettolagerButton({ artNr, product }: LineItemNettolagerButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const hasProduct = artNr.trim().length > 0;

  return (
    <>
      <Tooltip title={hasProduct ? "Visa nettolager" : "Välj ArtNr för att visa nettolager"} placement="top">
        {/* pointerEvents: auto så att knappen går att använda även när sektionen är låst (visningsläge). */}
        <span style={{ pointerEvents: "auto", display: "inline-flex" }}>
          <IconButton
            size="small"
            className={styles.lineItemFieldActionButton}
            disabled={!hasProduct}
            onClick={() => setOpen(true)}
            aria-label="Visa nettolager"
          >
            <WarehouseOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Nettolager – {product || artNr}</span>
            <Tooltip title="Uppdatera" placement="top">
              <IconButton size="small" className={styles.contractHeaderDotsButton}>
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <div className={styles.lineItemsTableFrame}>
            <div className={styles.freightTableWrap}>
              <div className={styles.freightTable}>
                <DataTable
                  variant="line"
                  fillRemainingSpace
                  columns={NETTOLAGER_COLUMNS}
                  rows={NETTOLAGER_MOCK_ROWS}
                  rowKey={(row, index) => `${row.bolag}-${row.lagerstalle}-${index}`}
                  selectedRowIndex={selectedRow}
                  onRowClick={(index) => setSelectedRow((previous) => (previous === index ? null : index))}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setOpen(false)}>
            Stäng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

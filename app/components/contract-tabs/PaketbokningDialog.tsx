"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { PaketbokningView, type BokadPaketRow } from "./PaketbokningView";
import styles from "../../page.module.scss";

type PaketbokningDialogProps = {
  open: boolean;
  title: string;
  initialReservationstyp: string;
  produkt?: string;
  volym?: string;
  enhet?: string;
  onClose: () => void;
  onReservera: (rows: BokadPaketRow[]) => void;
  onSkaLastasUt: (rows: BokadPaketRow[]) => void;
};

/** Paketbokning i en dialog ovanpå aktuell vy. */
export function PaketbokningDialog({
  open,
  title,
  initialReservationstyp,
  produkt,
  volym,
  enhet,
  onClose,
  onReservera,
  onSkaLastasUt,
}: PaketbokningDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" classes={{ paper: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <span>{title}</span>
          <IconButton size="small" onClick={onClose} aria-label="Stäng">
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", minHeight: "60vh" }}>
        <PaketbokningView
          hideHeader
          initialReservationstyp={initialReservationstyp}
          produkt={produkt}
          volym={volym}
          enhet={enhet}
          onBack={onClose}
          onReservera={onReservera}
          onSkaLastasUt={onSkaLastasUt}
        />
      </DialogContent>
    </Dialog>
  );
}

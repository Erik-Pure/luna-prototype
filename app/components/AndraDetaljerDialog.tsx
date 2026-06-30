"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import styles from "../page.module.scss";

const LEVERANSDAG_OPTIONS = [
  "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag",
  "Början", "Mitten", "Slutet",
];

const UTLASTANDE_ENHET_OPTIONS = ["BP Hissmofors", "BP Kramfors", "BP Bollstabruk"];
const UTLASTANDE_LAGERSTALLE_OPTIONS = ["Krokom", "Östersund", "Sundsvall", "Kramfors"];
const ANSVARIG_ENHET_OPTIONS = ["BP Hissmofors", "BP Kramfors", "BP Bollstabruk"];

type Draft = {
  kundmarke: string;
  leveransvecka: string;
  leveransdag: string;
  utlastandeEnhet: string;
  utlastandeLagerstalle: string;
  ansvarigEnhet: string;
  levFonsterMin: string;
  levFonsterMax: string;
};

const EMPTY_DRAFT: Draft = {
  kundmarke: "",
  leveransvecka: "",
  leveransdag: "",
  utlastandeEnhet: "",
  utlastandeLagerstalle: "",
  ansvarigEnhet: "",
  levFonsterMin: "",
  levFonsterMax: "",
};

export type { Draft as AndraDetaljerDraft };

type AndraDetaljerDialogProps = {
  open: boolean;
  initialDraft?: Partial<Draft>;
  onClose: () => void;
  onSave: (draft: Draft) => void;
};

export function AndraDetaljerDialog({ open, initialDraft, onClose, onSave }: AndraDetaljerDialogProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    if (open) setDraft({ ...EMPTY_DRAFT, ...initialDraft });
  }, [open, initialDraft]);

  const set = (key: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const canSave =
    draft.leveransvecka.trim() !== "" &&
    draft.utlastandeEnhet !== "" &&
    draft.utlastandeLagerstalle !== "" &&
    draft.ansvarigEnhet !== "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Ändra detaljer</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
          <div className={styles.contractModernFormGrid}>
            <TextField
              fullWidth size="small"
              label="Kundmärke"
              value={draft.kundmarke}
              onChange={(e) => set("kundmarke", e.target.value)}
              style={{ gridColumn: "1 / -1" }}
            />
            <TextField
              fullWidth size="small"
              label="Leveransvecka *"
              value={draft.leveransvecka}
              onChange={(e) => set("leveransvecka", e.target.value)}
              className={styles.lineItemRequiredControl}
            />
            <TextField
              select fullWidth size="small"
              label="Leveransdag"
              value={draft.leveransdag}
              onChange={(e) => set("leveransdag", e.target.value)}
            >
              <MenuItem value="">—</MenuItem>
              {LEVERANSDAG_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select fullWidth size="small"
              label="Utlastande enhet *"
              value={draft.utlastandeEnhet}
              onChange={(e) => set("utlastandeEnhet", e.target.value)}
              className={styles.lineItemRequiredControl}
              style={{ gridColumn: "1 / -1" }}
            >
              <MenuItem value="">—</MenuItem>
              {UTLASTANDE_ENHET_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select fullWidth size="small"
              label="Utlastande lagerställe *"
              value={draft.utlastandeLagerstalle}
              onChange={(e) => set("utlastandeLagerstalle", e.target.value)}
              className={styles.lineItemRequiredControl}
              style={{ gridColumn: "1 / -1" }}
            >
              <MenuItem value="">—</MenuItem>
              {UTLASTANDE_LAGERSTALLE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select fullWidth size="small"
              label="Ansvarig enhet *"
              value={draft.ansvarigEnhet}
              onChange={(e) => set("ansvarigEnhet", e.target.value)}
              className={styles.lineItemRequiredControl}
              style={{ gridColumn: "1 / -1" }}
            >
              <MenuItem value="">—</MenuItem>
              {ANSVARIG_ENHET_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth size="small"
              label="Lev.fönster min"
              value={draft.levFonsterMin}
              onChange={(e) => set("levFonsterMin", e.target.value)}
            />
            <TextField
              fullWidth size="small"
              label="Lev.fönster max"
              value={draft.levFonsterMax}
              onChange={(e) => set("levFonsterMax", e.target.value)}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button
          variant="contained"
          size="small"
          disabled={!canSave}
          onClick={() => { onSave(draft); onClose(); }}
          className={styles.bytPrislistaOkButton}
        >
          Spara
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

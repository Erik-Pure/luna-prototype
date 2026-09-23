"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

type KostnadRad = {
  label: string;
  prislisterad: string;
  kalkylfaktor: string;
};

type RedigeraDraft = {
  artNr: string;
  produkt: string;
  pakettyp: string;
  kostnader: KostnadRad[];
};

export type RedigeraPrislisteradInitial = {
  artNr: string;
  produkt: string;
  pakettyp: string;
  rawara: string;
  produktion: string;
  impregnering: string;
  malning: string;
  paketkost: string;
};

type Props = {
  open: boolean;
  initial: RedigeraPrislisteradInitial | null;
  onClose: () => void;
  onSave: (draft: RedigeraDraft) => void;
};

const KOSTNADS_LABELS = ["Råvara", "Produktion", "Impregnering", "Målning", "Pakettyp"];

function buildDraft(initial: RedigeraPrislisteradInitial | null): RedigeraDraft {
  const vals = initial
    ? [initial.rawara, initial.produktion, initial.impregnering, initial.malning, initial.paketkost]
    : ["", "", "", "", ""];
  return {
    artNr: initial?.artNr ?? "",
    produkt: initial?.produkt ?? "",
    pakettyp: initial?.pakettyp ?? "",
    kostnader: KOSTNADS_LABELS.map((label, i) => ({
      label,
      prislisterad: vals[i],
      kalkylfaktor: vals[i],
    })),
  };
}

export function RedigeraPrislisteradDialog({ open, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<RedigeraDraft>(() => buildDraft(initial));
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(buildDraft(initial));
  }

  const setPrislisterad = (index: number, value: string) =>
    setDraft((prev) => {
      const kostnader = prev.kostnader.map((r, i) =>
        i === index ? { ...r, prislisterad: value } : r
      );
      return { ...prev, kostnader };
    });

  const thStyle: React.CSSProperties = {
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    color: "#6a7483",
    textAlign: "right",
    background: "#f4f6fb",
    borderBottom: "1px solid #e2e6ee",
    whiteSpace: "nowrap",
    // textTransform: "uppercase",
    letterSpacing: "0.2px",
  };

  const labelCellStyle: React.CSSProperties = {
    padding: "6px 10px",
    fontSize: 13,
    color: "#404753",
    fontWeight: 500,
    borderBottom: "1px solid #eef1f6",
    whiteSpace: "nowrap",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Redigera prislisterad</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextField
              size="small"
              label="ArtNr"
              fullWidth
              value={draft.artNr}
              InputProps={{ readOnly: true }}
              style={{ gridColumn: "1 / -1" }}
            />
            <TextField
              size="small"
              label="Produkt"
              fullWidth
              value={draft.produkt}
              InputProps={{ readOnly: true }}
              style={{ gridColumn: "1 / -1" }}
            />
            <TextField
              size="small"
              label="Pakettyp"
              fullWidth
              value={draft.pakettyp === "0" ? "—" : draft.pakettyp}
              InputProps={{ readOnly: true }}
            />
          </div>

          <div style={{ border: "1px solid #dfe3ea", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: "left", width: "40%" }} />
                  <th style={thStyle}>Prislisterad</th>
                  <th style={{ ...thStyle, borderLeft: "1px solid #e2e6ee" }}>Kalkylfaktor</th>
                </tr>
              </thead>
              <tbody>
                {draft.kostnader.map((rad, i) => (
                  <tr key={rad.label}>
                    <td style={labelCellStyle}>{rad.label}</td>
                    <td style={{ ...labelCellStyle, padding: "4px 8px" }}>
                      <TextField
                        size="small"
                        required
                        className={styles.requiredFieldControl}
                        value={rad.prislisterad}
                        onChange={(e) => setPrislisterad(i, e.target.value)}
                        inputProps={{ style: { textAlign: "right", fontSize: 13 } }}
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
                      />
                    </td>
                    <td style={{ ...labelCellStyle, padding: "4px 8px", borderLeft: "1px solid #eef1f6" }}>
                      <TextField
                        size="small"
                        value={rad.kalkylfaktor}
                        InputProps={{ readOnly: true }}
                        inputProps={{ style: { textAlign: "right", fontSize: 13 } }}
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button variant="contained" size="small" onClick={() => onSave(draft)} className={styles.contractSaveButton}>Spara</Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>Avbryt</Button>
      </DialogActions>
    </Dialog>
  );
}

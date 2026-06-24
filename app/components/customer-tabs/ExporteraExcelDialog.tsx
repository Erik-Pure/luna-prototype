"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

type ExporteraExcelDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function ExporteraExcelDialog({ open, onClose }: ExporteraExcelDialogProps) {
  const [urval, setUrval] = useState<"valda" | "alla">("valda");
  const [inkluderaKontaktpersoner, setInkluderaKontaktpersoner] = useState(false);
  const [datumFran, setDatumFran] = useState("");
  const [datumTom, setDatumTom] = useState("");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Exportera till Excel</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
        <RadioGroup value={urval} onChange={(e) => setUrval(e.target.value as "valda" | "alla")}>
          <FormControlLabel
            value="valda"
            control={<Radio size="small" />}
            label={<Typography style={{ fontSize: 13 }}>Valda kunder (kundlistan)</Typography>}
          />
          <FormControlLabel
            value="alla"
            control={<Radio size="small" />}
            label={<Typography style={{ fontSize: 13 }}>Alla aktiva kunder</Typography>}
          />
        </RadioGroup>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={inkluderaKontaktpersoner}
              onChange={(e) => setInkluderaKontaktpersoner(e.target.checked)}
            />
          }
          label={<Typography style={{ fontSize: 13 }}>Inkludera kontaktpersoner</Typography>}
        />

        <Divider style={{ marginTop: 8, marginBottom: 8 }} />

        <Typography style={{ fontSize: 13, fontWeight: 600, color: "#2f3743", marginBottom: 8 }}>
          Levererad volym
        </Typography>

        <div style={{ display: "flex", gap: 12 }}>
          <TextField
            size="small"
            label="Datum från"
            type="date"
            value={datumFran}
            onChange={(e) => setDatumFran(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            size="small"
            label="Datum tom"
            type="date"
            value={datumTom}
            onChange={(e) => setDatumTom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </div>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button variant="contained" size="small" onClick={onClose} className={styles.bytPrislistaOkButton}>
          Exportera
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

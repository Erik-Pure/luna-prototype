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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import styles from "../../page.module.scss";

const KUNDGRUPP_OPTIONS = ["A", "B", "C"];

type AndraKundgruppDialogProps = {
  open: boolean;
  kortnamn: string;
  currentKundgrupp: string;
  onClose: () => void;
  onSave: (newKundgrupp: string) => void;
};

export function AndraKundgruppDialog({ open, kortnamn, currentKundgrupp, onClose, onSave }: AndraKundgruppDialogProps) {
  const [kundgrupp, setKundgrupp] = useState(currentKundgrupp);

  useEffect(() => {
    if (open) setKundgrupp(currentKundgrupp);
  }, [open, currentKundgrupp]);

  const handleSave = () => {
    onSave(kundgrupp);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Ändra kundgrupp</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
        <TextField
          size="small"
          label="Kortnamn"
          value={kortnamn}
          disabled
          fullWidth
        />
        <FormControl size="small" fullWidth>
          <InputLabel>Kundgrupp</InputLabel>
          <Select
            value={kundgrupp}
            label="Kundgrupp"
            IconComponent={KeyboardArrowDownIcon}
            onChange={(e) => setKundgrupp(e.target.value)}
          >
            {KUNDGRUPP_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions className={styles.freightDialogActions}>
        <Button variant="contained" size="small" onClick={handleSave} className={styles.bytPrislistaOkButton}>
          Spara
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

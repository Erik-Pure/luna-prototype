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
  FormGroup,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

const FUNKTION_OPTIONS = [
  "Inköpare",
  "Inköpschef",
  "Ekonomichef",
  "Logistikansvarig",
  "Säljare",
  "Teknisk chef",
  "VD",
  "Kontaktperson",
];

const LAND_OPTIONS = [
  { value: "SE", label: "SE — Sverige" },
  { value: "NO", label: "NO — Norge" },
  { value: "FI", label: "FI — Finland" },
  { value: "DK", label: "DK — Danmark" },
  { value: "DE", label: "DE — Tyskland" },
  { value: "EE", label: "EE — Estland" },
];

const ADRESSTYP_OPTIONS = ["Faktura", "Leverans", "Annan adress"];

const INFORMATION_OPTIONS = ["Faktura", "Följesedel", "Leveransavisering", "WoodX"];

const UTSKICK_OPTIONS = [
  "NKI",
  "Norra Timber News (tryckt, eng)",
  "Norra Timber News (tryckt, sv)",
  "Nyhetsbrev engelska (sågkund)",
  "Nyhetsbrev svenska (BP-kund)",
  "Nyhetsbrev svenska (sågkund)",
  "Prislista",
  "Återförsäljare",
];

type Draft = {
  namn: string;
  funktion: string;
  telefon: string;
  mobil: string;
  epost: string;
  adresstyp: string;
  foretagsnamn: string;
  adress1: string;
  adress2: string;
  postadress: string;
  land: string;
  giltigFran: string;
  giltigTom: string;
  kommentar: string;
  information: Set<string>;
  utskick: Set<string>;
};

const EMPTY_DRAFT: Draft = {
  namn: "",
  funktion: "",
  telefon: "",
  mobil: "",
  epost: "",
  adresstyp: "",
  foretagsnamn: "",
  adress1: "",
  adress2: "",
  postadress: "",
  land: "",
  giltigFran: "",
  giltigTom: "",
  kommentar: "",
  information: new Set(),
  utskick: new Set(),
};

export type { Draft as KontaktpersonDraft };

export type KundAdresser = {
  faktura: string;
  leverans: string;
};

type NyKontaktpersonDialogProps = {
  open: boolean;
  initialDraft?: Draft;
  title?: string;
  kundAdresser?: KundAdresser;
  onClose: () => void;
  onSave: (draft: Draft) => void;
};

export function NyKontaktpersonDialog({ open, initialDraft, title = "Ny kontaktperson", kundAdresser, onClose, onSave }: NyKontaktpersonDialogProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(initialDraft ?? EMPTY_DRAFT);
  }

  const set = (key: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleSet = (key: "information" | "utskick", value: string) =>
    setDraft((prev) => {
      const next = new Set(prev[key]);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return { ...prev, [key]: next };
    });

  const showAnnanAdress = draft.adresstyp === "Annan adress";
  const adressText =
    draft.adresstyp === "Faktura" ? (kundAdresser?.faktura ?? null) :
      draft.adresstyp === "Leverans" ? (kundAdresser?.leverans ?? null) :
        null;

  const canSave =
    draft.namn.trim() !== "" &&
    (!showAnnanAdress || (draft.adress1.trim() !== "" && draft.postadress.trim() !== "" && draft.land !== ""));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>{title}</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4 }}>

          {/* ── Grunduppgifter ── */}
          <div>
            <Typography style={{ fontSize: 12, fontWeight: 700, color: "#2f3743", letterSpacing: "0.05em", marginBottom: 8 }}>
              Grunduppgifter
            </Typography>
            <div className={styles.contractModernFormGrid}>
              <TextField
                fullWidth size="small"
                label="Namn *"
                value={draft.namn}
                onChange={(e) => set("namn", e.target.value)}
                className={styles.lineItemRequiredControl}
                style={{ gridColumn: "1 / -1" }}
              />
              <TextField
                select fullWidth size="small"
                label="Funktion"
                value={draft.funktion}
                onChange={(e) => set("funktion", e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {FUNKTION_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
              <TextField
                fullWidth size="small"
                label="Telefon"
                value={draft.telefon}
                onChange={(e) => set("telefon", e.target.value)}
              />
              <TextField
                fullWidth size="small"
                label="Mobil"
                value={draft.mobil}
                onChange={(e) => set("mobil", e.target.value)}
              />
              <TextField
                fullWidth size="small"
                label="E-post"
                type="email"
                value={draft.epost}
                onChange={(e) => set("epost", e.target.value)}
              />
            </div>
          </div>


          {/* ── Adress ── */}
          <div className={styles.contractModernFormGrid}>
            <TextField
              select fullWidth size="small"
              label="Adresstyp"
              value={draft.adresstyp}
              onChange={(e) => set("adresstyp", e.target.value)}
              style={{ gridColumn: "1 / -1" }}
            >
              <MenuItem value="">—</MenuItem>
              {ADRESSTYP_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>

            {adressText !== null && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#f5f7fa",
                  border: "1px solid #e2e6ed",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#404753",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                }}
              >
                {adressText}
              </div>
            )}

            {showAnnanAdress && (
              <>
                <TextField
                  fullWidth size="small"
                  label="Företagsnamn"
                  value={draft.foretagsnamn}
                  onChange={(e) => set("foretagsnamn", e.target.value)}
                  style={{ gridColumn: "1 / -1" }}
                />
                <TextField
                  fullWidth size="small"
                  label="Adress *"
                  value={draft.adress1}
                  onChange={(e) => set("adress1", e.target.value)}
                  className={styles.lineItemRequiredControl}
                  style={{ gridColumn: "1 / -1" }}
                />
                <TextField
                  fullWidth size="small"
                  label="Adress 2"
                  value={draft.adress2}
                  onChange={(e) => set("adress2", e.target.value)}
                  style={{ gridColumn: "1 / -1" }}
                />
                <TextField
                  fullWidth size="small"
                  label="Postadress *"
                  value={draft.postadress}
                  onChange={(e) => set("postadress", e.target.value)}
                  className={styles.lineItemRequiredControl}
                />
                <TextField
                  select fullWidth size="small"
                  label="Land *"
                  value={draft.land}
                  onChange={(e) => set("land", e.target.value)}
                  className={styles.lineItemRequiredControl}
                >
                  <MenuItem value="">—</MenuItem>
                  {LAND_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <TextField
                  fullWidth size="small"
                  label="Giltig från"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={draft.giltigFran}
                  onChange={(e) => set("giltigFran", e.target.value)}
                />
                <TextField
                  fullWidth size="small"
                  label="Giltig till"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={draft.giltigTom}
                  onChange={(e) => set("giltigTom", e.target.value)}
                />
              </>
            )}
          </div>



          {/* ── Kommentar ── */}
          <TextField
            fullWidth size="small"
            label="Kommentar"
            multiline
            rows={2}
            value={draft.kommentar}
            onChange={(e) => set("kommentar", e.target.value)}
          />

          <Divider />

          {/* ── Information ── */}
          <div>
            <Typography style={{ fontSize: 12, fontWeight: 700, color: "#2f3743", letterSpacing: "0.05em", marginBottom: 8 }}>
              Information
            </Typography>
            <FormGroup row style={{ gap: "0 16px" }}>
              {INFORMATION_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt}
                  control={
                    <Checkbox
                      size="small"
                      checked={draft.information.has(opt)}
                      onChange={() => toggleSet("information", opt)}
                    />
                  }
                  label={<Typography style={{ fontSize: 13 }}>{opt}</Typography>}
                />
              ))}
            </FormGroup>
          </div>

          <Divider />

          {/* ── Utskick ── */}
          <div>
            <Typography style={{ fontSize: 12, fontWeight: 700, color: "#2f3743", letterSpacing: "0.05em", marginBottom: 8 }}>
              Utskick
            </Typography>
            <FormGroup style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              {UTSKICK_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt}
                  control={
                    <Checkbox
                      size="small"
                      checked={draft.utskick.has(opt)}
                      onChange={() => toggleSet("utskick", opt)}
                    />
                  }
                  label={<Typography style={{ fontSize: 13 }}>{opt}</Typography>}
                />
              ))}
            </FormGroup>
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
          {initialDraft ? "Spara" : "Lägg till"}
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} className={styles.bytPrislistaAvbrytButton}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

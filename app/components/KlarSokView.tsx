"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "../page.module.scss";

const ART_NR_OPTIONS = [
  "2202209500002000",
  "2202209500003000",
  "2202212000001000",
] as const;

type Draft = {
  artNr: string;
  pakettyp: string;
  fakturaEnhet: string;
  pris: string;
  saljtyp: string;
  // optional
  produkt: string;
  fakturatext: string;
  internKommentar: string;
};

const emptyDraft: Draft = {
  artNr: "",
  pakettyp: "Lp",
  fakturaEnhet: "m3 nominell",
  pris: "",
  saljtyp: "Eget virke",
  produkt: "",
  fakturatext: "",
  internKommentar: "",
};

export function KlarSokView() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [fastTrackEnabled, setFastTrackEnabled] = useState(true);

  const update = (key: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const optionalTabIndex = fastTrackEnabled ? -1 : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Titelrad */}
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>Ny kontraktsrad — tabIndex-test</Typography>
        </div>
      </div>

      {/* Snabbspår-bar */}
      <div className={styles.lineItemFastTrackBar}>
        <div className={styles.lineItemFastTrackMain}>
          <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
          <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
          <span className={styles.lineItemFastTrackText}>
            Tabba endast mellan obligatoriska fält&nbsp;— ingen custom Tab-hantering
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#748195" }}>Snabbspår</span>
            <Switch
              checked={fastTrackEnabled}
              onChange={() => setFastTrackEnabled((v) => !v)}
              size="medium"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#c47900" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#c47900" },
              }}
            />
          </div>
        </div>
      </div>

      {/* Formulär */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        <div className={styles.contractModernAccordionWrap}>
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            className={styles.contractSectionAccordion}
          >
            {/* AccordionSummary: tabIndex={-1} i snabbspår så expand-knappen hoppas över */}
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={styles.contractSectionSummary}
              tabIndex={fastTrackEnabled ? -1 : undefined}
            >
              <span className={styles.contractSectionTitleRow}>
                <TableChartOutlinedIcon className={styles.contractSectionIcon} />
                <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
              </span>
            </AccordionSummary>
            <AccordionDetails className={styles.contractSectionDetailsArea}>
              <div className={styles.contractModernFormGrid}>

                {/* ── Obligatoriska fält ── */}

                <FormControl size="small" fullWidth className={styles.lineItemRequiredControl}>
                  <InputLabel>ArtNr *</InputLabel>
                  <Select
                    label="ArtNr *"
                    value={draft.artNr}
                    onChange={(e) => update("artNr", e.target.value)}
                    inputProps={{ tabIndex: 0 }}
                  >
                    <MenuItem value="">-</MenuItem>
                    {ART_NR_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  select fullWidth size="small"
                  label="Pakettyp *"
                  value={draft.pakettyp}
                  onChange={(e) => update("pakettyp", e.target.value)}
                  className={styles.lineItemRequiredControl}
                  SelectProps={{ inputProps: { tabIndex: 0 } }}
                >
                  <MenuItem value="Lp">Lp</MenuItem>
                  <MenuItem value="Pk">Pk</MenuItem>
                </TextField>

                <TextField
                  select fullWidth size="small"
                  label="Fakturaenhet *"
                  value={draft.fakturaEnhet}
                  onChange={(e) => update("fakturaEnhet", e.target.value)}
                  className={styles.lineItemRequiredControl}
                  SelectProps={{ inputProps: { tabIndex: 0 } }}
                >
                  {["m3 nominell", "m3 aktuell", "lpm", "m2", "paket", "st"].map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth size="small"
                  label="Pris *"
                  value={draft.pris}
                  onChange={(e) => update("pris", e.target.value)}
                  className={styles.lineItemRequiredControl}
                  InputProps={{ endAdornment: <InputAdornment position="end">SEK/m3</InputAdornment> }}
                  inputProps={{ tabIndex: 0 }}
                />

                <TextField
                  select fullWidth size="small"
                  label="Säljtyp *"
                  value={draft.saljtyp}
                  onChange={(e) => update("saljtyp", e.target.value)}
                  className={styles.lineItemRequiredControl}
                  SelectProps={{ inputProps: { tabIndex: 0 } }}
                >
                  {["Eget virke", "Inköp", "Agentur"].map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </TextField>

                {/* ── Valfria fält — tabIndex={-1} i snabbspår ── */}

                <TextField
                  fullWidth size="small"
                  label="Produkt"
                  value={draft.produkt}
                  onChange={(e) => update("produkt", e.target.value)}
                  inputProps={{ tabIndex: optionalTabIndex }}
                />

                <TextField
                  fullWidth size="small"
                  label="Fakturatext"
                  value={draft.fakturatext}
                  onChange={(e) => update("fakturatext", e.target.value)}
                  inputProps={{ tabIndex: optionalTabIndex }}
                />

                <TextField
                  fullWidth size="small"
                  label="Intern kommentar"
                  value={draft.internKommentar}
                  onChange={(e) => update("internKommentar", e.target.value)}
                  inputProps={{ tabIndex: optionalTabIndex }}
                />

              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* "Spara och fortsätt" placerad i DOM-ordning EFTER fälten */}
        <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
          <Button className={styles.contractSaveButton} size="small">
            Spara och fortsätt
          </Button>
          <Button className={styles.contractQuickActionButton} size="small" tabIndex={fastTrackEnabled ? -1 : undefined}>
            Avbryt
          </Button>
        </div>
      </div>
    </div>
  );
}

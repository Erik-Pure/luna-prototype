"use client";

import { Divider, MenuItem, TextField, Typography } from "@mui/material";
import styles from "../../page.module.scss";

// Separat leveransadress på kunden. Visas i panelen Kontaktuppgifter när
// "Använd samma leveransadress" är urkryssad, och i Leverans-tabben.
export type LeveransadressValues = {
  levNamn: string;
  levAdress1: string;
  levAdress2: string;
  levPostadress: string;
  levLand: string;
  levTelefon: string;
  levEpost: string;
  levLeveransort: string;
  levPostnummer: string;
};

export const EMPTY_LEVERANSADRESS: LeveransadressValues = {
  levNamn: "",
  levAdress1: "",
  levAdress2: "",
  levPostadress: "",
  levLand: "",
  levTelefon: "",
  levEpost: "",
  levLeveransort: "",
  levPostnummer: "",
};

type Props = {
  values: LeveransadressValues;
  onChange: (key: keyof LeveransadressValues, value: string) => void;
  /** Markera Namn, Postadress och Land som obligatoriska (skapa-formuläret). */
  markRequired?: boolean;
};

export function LeveransadressFields({ values, onChange, markRequired = false }: Props) {
  const req = (label: string) => (markRequired ? `${label} *` : label);
  const reqClass = markRequired ? styles.lineItemRequiredControl : undefined;

  return (
    <>
      <Divider className={styles.contractSectionDivider} />
      <Typography style={{ fontSize: 13, fontWeight: 600, color: "#2f3743", marginBottom: 10 }}>
        Leveransadress
      </Typography>
      <div className={styles.contractModernFormGrid}>
        <TextField fullWidth size="small" label={req("Namn")} value={values.levNamn} onChange={(e) => onChange("levNamn", e.target.value)} style={{ gridColumn: "1 / -1" }} className={reqClass} />
        <TextField fullWidth size="small" label="Adress" value={values.levAdress1} onChange={(e) => onChange("levAdress1", e.target.value)} style={{ gridColumn: "1 / -1" }} />
        <TextField fullWidth size="small" label="Adress 2" value={values.levAdress2} onChange={(e) => onChange("levAdress2", e.target.value)} style={{ gridColumn: "1 / -1" }} />
        <TextField fullWidth size="small" label={req("Postadress")} value={values.levPostadress} onChange={(e) => onChange("levPostadress", e.target.value)} className={reqClass} />
        <TextField select fullWidth size="small" label={req("Land")} value={values.levLand} onChange={(e) => onChange("levLand", e.target.value)} className={reqClass}>
          <MenuItem value="">—</MenuItem>
          <MenuItem value="SE">SE — Sverige</MenuItem>
          <MenuItem value="NO">NO — Norge</MenuItem>
          <MenuItem value="FI">FI — Finland</MenuItem>
          <MenuItem value="DK">DK — Danmark</MenuItem>
          <MenuItem value="DE">DE — Tyskland</MenuItem>
          <MenuItem value="EE">EE — Estland</MenuItem>
        </TextField>
      </div>

      <Divider className={styles.contractSectionDivider} />
      <div className={styles.contractModernFormGrid}>
        <TextField fullWidth size="small" label="Telefon" value={values.levTelefon} onChange={(e) => onChange("levTelefon", e.target.value)} />
        <TextField fullWidth size="small" label="E-post" type="email" value={values.levEpost} onChange={(e) => onChange("levEpost", e.target.value)} />
        <TextField fullWidth size="small" label="Leveransort" value={values.levLeveransort} onChange={(e) => onChange("levLeveransort", e.target.value)} />
        <TextField fullWidth size="small" label="Postnummer" value={values.levPostnummer} onChange={(e) => onChange("levPostnummer", e.target.value)} />
      </div>
    </>
  );
}

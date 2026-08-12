"use client";

import { Typography } from "@mui/material";
import type { ContractDetails } from "./contractDetails";
import styles from "../../page.module.scss";

type TermsTabProps = {
  contractDetails?: ContractDetails;
};

const VALUTA_BETALNING = ["Valuta", "Betalningsvillkor", "Betalningsvillkor dagar", "Moms"];
const KONTRAKT_LEVERANS = [
  "Certifiering",
  "Kontraktsformulär",
  "Kontraktsformular",
  "Leveranssätt",
  "Leveranssatt",
  "Leveransvillkor",
  "Leveransvillkor ort",
];
const AGENTER = ["Agent 1"];
const RABATTER = [
  "Kassarabatt",
  "Bonus",
  "Plocktillägg",
  "Plocktillagg",
  "Målningstillägg",
  "Malningstillagg",
  "Införselavgift",
  "Inforselavgift",
];
const LAGER = ["Konsignationslager"];

function groupFields(
  fields: { label: string; value: string }[],
  keys: string[]
) {
  return fields.filter((f) => keys.some((k) => f.label.toLowerCase() === k.toLowerCase()));
}

export function TermsTab({ contractDetails }: TermsTabProps) {
  if (!contractDetails) {
    return (
      <div className={styles.contractTabPlaceholder}>
        <Typography className={styles.contractInfoValue}>Villkor - innehallsvy for prototyp.</Typography>
      </div>
    );
  }

  const v = contractDetails.villkor;
  const betalningFields = groupFields(v, VALUTA_BETALNING);
  const kontraktFields = groupFields(v, KONTRAKT_LEVERANS);
  const agentFields = groupFields(v, AGENTER);
  const rabattFields = groupFields(v, RABATTER);
  const lagerFields = groupFields(v, LAGER);

  const renderedKeys = new Set([
    ...VALUTA_BETALNING,
    ...KONTRAKT_LEVERANS,
    ...AGENTER,
    ...RABATTER,
    ...LAGER,
  ].map((k) => k.toLowerCase()));
  const ovrigaFields = v.filter((f) => !renderedKeys.has(f.label.toLowerCase()));

  return (
    <div className={styles.contractFlatSection}>
      <Typography className={styles.contractSectionGroupLabel}>Valuta &amp; Betalning</Typography>
      <div className={styles.contractDataGrid}>
        {betalningFields.map((field) => (
          <div key={field.label} className={styles.contractDataItem}>
            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
            <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
          </div>
        ))}
      </div>

      {kontraktFields.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <Typography className={styles.contractSectionGroupLabel}>Kontrakt &amp; Leverans</Typography>
          <div className={styles.contractDataGrid}>
            {kontraktFields.map((field) => (
              <div key={field.label} className={styles.contractDataItem}>
                <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {agentFields.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <Typography className={styles.contractSectionGroupLabel}>Agenter</Typography>
          <div className={styles.contractDataGrid}>
            {agentFields.map((field) => (
              <div key={field.label} className={styles.contractDataItem}>
                <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {rabattFields.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <Typography className={styles.contractSectionGroupLabel}>Rabatter &amp; Avgifter</Typography>
          <div className={styles.contractDataGrid}>
            {rabattFields.map((field) => (
              <div key={field.label} className={styles.contractDataItem}>
                <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {lagerFields.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <Typography className={styles.contractSectionGroupLabel}>Lager</Typography>
          <div className={styles.contractDataGrid}>
            {lagerFields.map((field) => (
              <div key={field.label} className={styles.contractDataItem}>
                <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
              </div>
            ))}
          </div>
        </>
      )}

      {ovrigaFields.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <Typography className={styles.contractSectionGroupLabel}>Övrigt</Typography>
          <div className={styles.contractDataGrid}>
            {ovrigaFields.map((field) => (
              <div key={field.label} className={styles.contractDataItem}>
                <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className={styles.contractFlatDivider} />
      <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>
      <div className={styles.contractDataGrid}>
        {contractDetails.kommentarer.map((field) => (
          <div key={field.label} className={`${styles.contractDataItem} ${styles.contractDataItemWide}`}>
            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
            <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

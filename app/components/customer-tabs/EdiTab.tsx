"use client";

import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useState } from "react";
import styles from "../../page.module.scss";

const EDI_OPTIONS = [
  "PRI handel: Beställning",
  "PRI handel: Orderbekräftelse",
  "PRI handel: Leveransavisering",
  "PRI handel: Faktura",
];

export function EdiTab() {
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const isDirty = JSON.stringify([...selected].sort()) !== JSON.stringify([...saved].sort());

  const toggle = (value: string) =>
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  return (
    <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div className={styles.contractDataSection} style={{ width: "600px" }}>
        <Typography className={styles.contractDataSectionTitle}>Dokument</Typography>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 14 }}>
          {EDI_OPTIONS.map((o) => (
            <FormControlLabel
              key={o}
              label={<Typography style={{ fontSize: 13, color: "#2f3743" }}>{o}</Typography>}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(o)}
                  onChange={() => toggle(o)}
                  sx={{ py: 0.5 }}
                />
              }
            />
          ))}
        </div>

        <div style={{ display: "flex", justifySelf: 'end', gap: 6 }}>
          <Button
            size="small"
            variant="contained"
            disabled={!isDirty}
            onClick={() => setSaved(selected)}
            className={styles.freightSaveButton}
          >
            Spara
          </Button>
          <Button
            size="small"
            disabled={!isDirty}
            onClick={() => setSelected(saved)}
            className={styles.freightCancelButton}
          >
            Ångra
          </Button>
        </div>
      </div>
    </div>
  );
}

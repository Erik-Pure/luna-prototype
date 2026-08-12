"use client";

import { MenuItem, Select, TextField, Typography } from "@mui/material";
import styles from "../../page.module.scss";

type OverviewTabProps = {
  contractId: string;
};

export function OverviewTab({ contractId }: OverviewTabProps) {
  return (
    <div className={styles.contractFlatSection}>
      <Typography className={styles.contractSectionGroupLabel}>Allmänt</Typography>

      <div className={styles.contractFormGrid}>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Kund*</Typography>
          <Select defaultValue="Stocka Emballage" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Stocka Emballage">Stocka Emballage</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Status*</Typography>
          <Select defaultValue="Aktivt kontrakt" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Aktivt kontrakt">Aktivt kontrakt</MenuItem>
            <MenuItem value="Utkast">Utkast</MenuItem>
            <MenuItem value="Avslutat">Avslutat</MenuItem>
            <MenuItem value="Pausat">Pausat</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Registrerad av*</Typography>
          <Select defaultValue="Tobias Albertsson" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Tobias Albertsson">Tobias Albertsson</MenuItem>
            <MenuItem value="John Doe">John Doe</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Kontraktsdatum*</Typography>
          <TextField defaultValue="04/12/2025" size="small" className={styles.searchFieldControl} />
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Språk*</Typography>
          <Select defaultValue="Svenska" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Svenska">Svenska</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Deutsch">Deutsch</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Kundens referens</Typography>
          <Select defaultValue="Faktura" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Faktura">Faktura</MenuItem>
            <MenuItem value="Offert">Offert</MenuItem>
            <MenuItem value="Order">Order</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Externt kontraktsnr</Typography>
          <TextField defaultValue="" size="small" className={styles.searchFieldControl} />
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Giltig t.o.m.</Typography>
          <TextField defaultValue="" size="small" className={styles.searchFieldControl} />
        </div>
      </div>

      <hr className={styles.contractFlatDivider} />
      <Typography className={styles.contractSectionGroupLabel}>Systeminformation</Typography>

      <div className={styles.contractDataGrid} style={{ marginBottom: 4 }}>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Kontraktsnr</Typography>
          <Typography className={styles.contractDataValue}>{contractId}</Typography>
        </div>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Kontraktstyp</Typography>
          <Typography className={styles.contractDataValue}>Försäljningskontrakt</Typography>
        </div>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Kopierat från</Typography>
          <Typography className={styles.contractDataValue}>-</Typography>
        </div>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Prislista</Typography>
          <Typography className={styles.contractDataValue}>-</Typography>
        </div>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Kategori</Typography>
          <Typography className={styles.contractDataValue}>Träindustri</Typography>
        </div>
        <div className={styles.contractDataItem}>
          <Typography className={styles.contractDataLabel}>Land</Typography>
          <Typography className={styles.contractDataValue}>Sverige</Typography>
        </div>
      </div>

      <hr className={styles.contractFlatDivider} />
      <Typography className={styles.contractSectionGroupLabel}>Anteckningar</Typography>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Övrigt</Typography>
          <TextField
            size="small"
            multiline
            minRows={3}
            className={styles.searchFieldControl}
            placeholder="Visas på utskrift av kontrakt och orderbekräftelse."
          />
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Egen anmärkning</Typography>
          <TextField
            size="small"
            multiline
            minRows={3}
            className={styles.searchFieldControl}
          />
        </div>
      </div>
    </div>
  );
}

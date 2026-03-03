"use client";

import { MenuItem, Select, TextField, Typography } from "@mui/material";
import styles from "../../page.module.scss";

type OverviewTabProps = {
  contractId: string;
};

export function OverviewTab({ contractId }: OverviewTabProps) {
  return (
    <>
      <div className={styles.contractFormGrid}>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Status*</Typography>
          <Select defaultValue="Aktivt kontrakt" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Aktivt kontrakt">Aktivt kontrakt</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Kundens referens*</Typography>
          <Select defaultValue="Stocka Emballage" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Stocka Emballage">Stocka Emballage</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Externt kontraktsnr</Typography>
          <TextField defaultValue="" size="small" className={styles.searchFieldControl} />
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Kund*</Typography>
          <Select defaultValue="Stocka Emballage" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Stocka Emballage">Stocka Emballage</MenuItem>
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
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Upprättat av*</Typography>
          <Select defaultValue="Tobias Albertsson" size="small" className={styles.searchFieldControl}>
            <MenuItem value="Tobias Albertsson">Tobias Albertsson</MenuItem>
          </Select>
        </div>
        <div className={styles.contractFormItem}>
          <Typography className={styles.searchFieldLabel}>Giltig t.o.m.*</Typography>
          <TextField defaultValue="04/12/2025" size="small" className={styles.searchFieldControl} />
        </div>
      </div>

      <div className={styles.contractInfoGrid}>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Kontraktsnr</Typography>
          <Typography className={styles.contractInfoValue}>{contractId}</Typography>
        </div>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Kontraktstyp</Typography>
          <Typography className={styles.contractInfoValue}>Försäljningskontrakt</Typography>
        </div>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Kopierat från</Typography>
          <Typography className={styles.contractInfoValue}>-</Typography>
        </div>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Prislista</Typography>
          <Typography className={styles.contractInfoValue}>-</Typography>
        </div>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Kategori</Typography>
          <Typography className={styles.contractInfoValue}>Träindustri</Typography>
        </div>
        <div className={styles.contractInfoItem}>
          <Typography className={styles.contractInfoLabel}>Land</Typography>
          <Typography className={styles.contractInfoValue}>Sverige</Typography>
        </div>
      </div>

      <Typography className={styles.contractOtherHeading}>Övrigt</Typography>
    </>
  );
}

"use client";

import { Typography } from "@mui/material";
import styles from "../../page.module.scss";

export function PrintOptionsTab() {
  return (
    <div className={styles.contractTabPlaceholder}>
      <Typography className={styles.contractInfoValue}>
        Utskriftsalternativ - innehållsvy för prototyp.
      </Typography>
    </div>
  );
}

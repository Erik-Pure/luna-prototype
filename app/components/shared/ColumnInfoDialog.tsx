"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { COLUMN_INFO } from "./columnInfo";
import styles from "../../page.module.scss";

type ColumnInfoDialogProps = {
  columnKey: string | null;
  onClose: () => void;
};

export function ColumnInfoDialog({ columnKey, onClose }: ColumnInfoDialogProps) {
  const info = columnKey ? COLUMN_INFO[columnKey] : undefined;

  return (
    <Dialog open={Boolean(columnKey)} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>{info?.title ?? ""}</Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.columnInfoDialogContent}>
        {info?.kind === "text" ? (
          <Typography style={{ fontSize: 14, color: "#404753", paddingTop: 4 }}>{info.description}</Typography>
        ) : null}
        {info?.kind === "legend" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
            {info.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 40,
                    height: 24,
                    borderRadius: 4,
                    border: item.bgColor === "#ffffff" ? "1px solid #d7dbe3" : "none",
                    backgroundColor: item.bgColor,
                    color: item.textColor,
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  120
                </span>
                <Typography className={styles.columnInfoLegendLabel} style={{ color: "#404753" }}>
                  {item.label}
                </Typography>
              </div>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

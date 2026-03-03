"use client";

import { Typography } from "@mui/material";
import type { ReactNode } from "react";
import styles from "../../page.module.scss";

type ActionRowItem = {
  label: string;
  icon?: ReactNode;
  enabled?: boolean;
  onClick?: () => void;
};

type ActionRowProps = {
  items: ActionRowItem[];
  rightSlot?: ReactNode;
};

export function ActionRow({ items, rightSlot }: ActionRowProps) {
  return (
    <div className={styles.actionRow}>
      {items.map((item, index) => {
        const enabled = item.enabled ?? true;
        const classes = `${styles.actionItem} ${enabled ? styles.actionEnabled : styles.actionDisabled} ${
          item.onClick ? styles.actionItemButton : ""
        }`;

        if (item.onClick) {
          return (
            <button key={item.label} type="button" className={classes} onClick={item.onClick}>
              {item.icon}
              <Typography className={styles.actionLabel}>{item.label}</Typography>
              {index !== items.length - 1 ? <span className={styles.actionSeparator} /> : null}
            </button>
          );
        }

        return (
          <div key={item.label} className={classes}>
            {item.icon}
            <Typography className={styles.actionLabel}>{item.label}</Typography>
            {index !== items.length - 1 ? <span className={styles.actionSeparator} /> : null}
          </div>
        );
      })}

      {rightSlot ? <div className={`${styles.rightControlRail} ${styles.rightControlGroup}`}>{rightSlot}</div> : null}
    </div>
  );
}

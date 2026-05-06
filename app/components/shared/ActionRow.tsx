"use client";

import { Button } from "@mui/material";
import type { ReactNode } from "react";
import styles from "../../page.module.scss";

type ActionRowItem = {
  key?: string;
  kind?: "button" | "divider";
  label: string;
  icon?: ReactNode;
  enabled?: boolean;
  onClick?: () => void;
  tone?: "default" | "primary";
};

type ActionRowProps = {
  items: ActionRowItem[];
  rightSlot?: ReactNode;
};

export function ActionRow({ items, rightSlot }: ActionRowProps) {
  return (
    <div className={styles.actionRow}>
      {items.map((item, index) => {
        if (item.kind === "divider") {
          return <span key={item.key ?? `divider-${index}`} className={styles.actionSeparator} aria-hidden="true" />;
        }

        const enabled = item.enabled ?? true;
        const isPrimary = item.tone === "primary";

        return (
          <Button
            key={item.key ?? `${item.label}-${index}`}
            size="small"
            variant={isPrimary ? "contained" : "outlined"}
            color={isPrimary ? "primary" : "inherit"}
            disabled={!enabled}
            startIcon={item.icon}
            className={isPrimary ? styles.actionItemPrimary : styles.lineItemsToggleButton}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        );
      })}

      {rightSlot ? <div className={`${styles.rightControlRail} ${styles.rightControlGroup}`}>{rightSlot}</div> : null}
    </div>
  );
}

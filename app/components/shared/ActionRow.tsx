"use client";

import { Button, Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import styles from "../../page.module.scss";

type ActionRowItem =
  | {
    key?: string;
    kind?: "button";
    label: string;
    icon?: ReactNode;
    enabled?: boolean;
    onClick?: () => void;
    tone?: "default" | "primary";
    title?: string;
  }
  | { key?: string; kind: "divider"; label?: string }
  | { key?: string; kind: "node"; node: ReactNode; label?: string };

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

        if (item.kind === "node") {
          return <span key={item.key ?? `node-${index}`}>{item.node}</span>;
        }

        const enabled = item.enabled ?? true;
        const isPrimary = item.tone === "primary";

        const button = (
          <Button
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

        const wrapperStyle = enabled ? undefined : { cursor: "not-allowed" as const };

        if (!item.title) {
          return <span key={item.key ?? `${item.label}-${index}`} style={wrapperStyle}>{button}</span>;
        }

        return (
          <Tooltip key={item.key ?? `${item.label}-${index}`} title={item.title}>
            <span style={wrapperStyle}>{button}</span>
          </Tooltip>
        );
      })}

      {rightSlot ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>{rightSlot}</div> : null}
    </div>
  );
}

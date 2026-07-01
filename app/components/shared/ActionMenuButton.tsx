"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "../../page.module.scss";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  enabled?: boolean;
  onClick?: () => void;
};

type ActionMenuButtonProps = {
  label: string;
  icon?: ReactNode;
  tone?: "primary" | "default";
  enabled?: boolean;
  items: ActionMenuItem[];
};

export function ActionMenuButton({ label, icon, tone = "default", enabled = true, items }: ActionMenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const isPrimary = tone === "primary";

  return (
    <>
      <Button
        size="small"
        variant={isPrimary ? "contained" : "outlined"}
        color={isPrimary ? "primary" : "inherit"}
        disabled={!enabled}
        startIcon={icon}
        endIcon={
          <KeyboardArrowDownIcon
            className={`${styles.actionMenuChevron} ${open ? styles.actionMenuChevronOpen : ""}`}
          />
        }
        className={isPrimary ? styles.actionItemPrimary : styles.lineItemsToggleButton}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.actionMenuPaper } }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.enabled === false}
            className={styles.actionMenuItem}
            onClick={() => {
              setAnchorEl(null);
              item.onClick?.();
            }}
          >
            {item.icon ? <ListItemIcon className={styles.actionMenuItemIcon}>{item.icon}</ListItemIcon> : null}
            <ListItemText primaryTypographyProps={{ fontSize: 14.5 }}>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

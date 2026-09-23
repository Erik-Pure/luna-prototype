"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import styles from "../../page.module.scss";

export type DetailEntity = "contract" | "customer" | "priceList" | "delivery";

const ENTITY_CONFIG: Record<DetailEntity, { label: string; icon: ReactNode }> = {
  contract: { label: "Kontrakt", icon: <GavelOutlinedIcon fontSize="small" /> },
  customer: { label: "Kund", icon: <PersonIcon fontSize="small" /> },
  priceList: { label: "Prislista", icon: <RequestQuoteIcon fontSize="small" /> },
  delivery: { label: "Leverans", icon: <LocalShippingOutlinedIcon fontSize="small" /> },
};

type DetailHeaderProps = {
  entity: DetailEntity;
  /** Override av överskriftstexten, t.ex. "Kontraktsrad" för en vy som ärver kontraktets ikon. */
  label?: string;
  title: ReactNode;
  /** En andra, mindre textrad under titeln. */
  subtitle?: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
};

export function DetailHeader({ entity, label, title, subtitle, chips, actions, onBack }: DetailHeaderProps) {
  const config = ENTITY_CONFIG[entity];

  return (
    <div className={styles.detailHeader}>
      <div className={styles.detailHeaderMain}>
        {onBack ? (
          <IconButton
            size="small"
            className={styles.detailHeaderBackButton}
            onClick={onBack}
            title="Tillbaka"
            aria-label="Tillbaka"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        ) : null}
        <span className={styles.detailHeaderIcon} aria-hidden>
          {config.icon}
        </span>
        <div className={styles.detailHeaderText}>
          <Typography className={styles.detailHeaderOverline}>{label ?? config.label}</Typography>
          <Typography component="h1" className={styles.detailHeaderTitle}>{title}</Typography>
          {subtitle ? <Typography className={styles.detailHeaderSubtitle}>{subtitle}</Typography> : null}
        </div>
        {chips ? <div className={styles.detailHeaderChips}>{chips}</div> : null}
      </div>
      {actions ? <div className={styles.contractModernTopActions}>{actions}</div> : null}
    </div>
  );
}

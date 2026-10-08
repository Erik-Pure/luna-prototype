"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { IconButton, Typography } from "@mui/material";
import { Fragment } from "react";
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
  /** Override av överskriftstexten, t.ex. "Kontraktsrad" för en vy som ärver kontraktets ikon. `null` döljer överskriften. */
  label?: string | null;
  /** Döljer entitetsikonen, t.ex. för undervyer inuti en flik. */
  hideIcon?: boolean;
  /** Mindre titel, t.ex. för undervyer inuti en flik. */
  compact?: boolean;
  title: ReactNode;
  /** Kompletterande text på samma rad som titeln. Flera delar (array) separeras med en punkt. */
  subtitle?: ReactNode | ReactNode[];
  chips?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
};

export function DetailHeader({ entity, label, hideIcon = false, compact = false, title, subtitle, chips, actions, onBack }: DetailHeaderProps) {
  const config = ENTITY_CONFIG[entity];
  const subtitleParts = (Array.isArray(subtitle) ? subtitle : [subtitle]).filter(Boolean);

  return (
    <div className={`${styles.detailHeader} ${compact ? styles.detailHeaderCompact : ""}`}>
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
        {!hideIcon ? (
          <span className={styles.detailHeaderIcon} aria-hidden>
            {config.icon}
          </span>
        ) : null}
        <div className={styles.detailHeaderText}>
          {label !== null ? (
            <Typography className={styles.detailHeaderOverline}>{label ?? config.label}</Typography>
          ) : null}
          <div className={styles.detailHeaderTitleRow}>
            <Typography component="h1" className={styles.detailHeaderTitle}>{title}</Typography>
            {subtitleParts.length > 0 ? (
              <span className={styles.detailHeaderSubtitle}>
                {subtitleParts.map((part, i) => (
                  <Fragment key={i}>
                    {i > 0 ? <span className={styles.detailHeaderSubtitleSeparator} aria-hidden>·</span> : null}
                    <span>{part}</span>
                  </Fragment>
                ))}
              </span>
            ) : null}
          </div>
        </div>
        {chips ? <div className={styles.detailHeaderChips}>{chips}</div> : null}
      </div>
      {actions ? <div className={styles.contractModernTopActions}>{actions}</div> : null}
    </div>
  );
}

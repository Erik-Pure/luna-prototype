"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Button } from "@mui/material";
import styles from "../../page.module.scss";

export type QuickNavSection = {
  key: string;
  label: string;
};

type SectionQuickNavProps = {
  sections: QuickNavSection[];
  onSelect: (key: string) => void;
};

// Accounts for the sticky panel header (title + quick nav + edit row) so the
// target section's summary lands below it instead of underneath the overlay.
export function scrollSectionIntoView(target: HTMLElement, stickyHeaderEl: HTMLElement | null) {
  let container: HTMLElement | null = target.parentElement;
  while (container) {
    if (/(auto|scroll)/.test(window.getComputedStyle(container).overflowY)) break;
    container = container.parentElement;
  }
  const headerHeight = stickyHeaderEl?.getBoundingClientRect().height ?? 0;
  const gap = 8;
  if (container) {
    const targetTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: targetTop - headerHeight - gap, behavior: "smooth" });
  } else {
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: targetTop - headerHeight - gap, behavior: "smooth" });
  }
}

export function SectionQuickNav({ sections, onSelect }: SectionQuickNavProps) {
  if (sections.length === 0) return null;
  return (
    <div className={styles.contractSectionsQuickNav}>
      <ArrowDownwardIcon className={styles.contractSectionsQuickNavIcon} />
      {sections.map((section) => (
        <Button
          key={section.key}
          size="small"
          className={styles.contractSectionsQuickNavBtn}
          onClick={() => onSelect(section.key)}
        >
          {section.label}
        </Button>
      ))}
    </div>
  );
}

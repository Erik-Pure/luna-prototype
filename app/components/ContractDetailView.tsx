"use client";

import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { Button, Typography } from "@mui/material";
import { useEffect, useState, type RefObject } from "react";
import { CallOffTab } from "./contract-tabs/CallOffTab";
import { ContractRowsTab } from "./contract-tabs/ContractRowsTab";
import { DeliveryTab } from "./contract-tabs/DeliveryTab";
import { DocumentsTab } from "./contract-tabs/DocumentsTab";
import { FreightTab } from "./contract-tabs/FreightTab";
import {
  LineItemDetailView,
  type LineItemDetailTab,
  type NewLineItemDraft
} from "./contract-tabs/LineItemDetailView";
import { OverviewTab } from "./contract-tabs/OverviewTab";
import { PrintOptionsTab } from "./contract-tabs/PrintOptionsTab";
import { TermsTab } from "./contract-tabs/TermsTab";
import styles from "../page.module.scss";

const CONTRACT_OVERVIEW_OPEN_KEY = "luna:contract-overview-open";
const CONTRACT_OVERVIEW_WIDTH_KEY = "luna:contract-overview-width";
const CONTRACT_OVERVIEW_MIN_WIDTH = 240;
const CONTRACT_OVERVIEW_MAX_WIDTH = 980;

type ContractDetailViewProps = {
  isLineItemDetailOpen: boolean;
  selectedLineItemId: string | null;
  newLineItemDraftVersion: number;
  activeLineItemTab: LineItemDetailTab;
  onChangeLineItemTab: (tab: LineItemDetailTab) => void;
  newLineItemDraftSeed: Partial<NewLineItemDraft>;
  onSaveAndCreateNewLineItem: (draft: NewLineItemDraft) => void;
  contractTabs: readonly string[];
  activeContractTabForView: string;
  onChangeContractTab: (tab: string) => void;
  selectedContractId: string | null;
  visibleLineColumns: Array<{ key: string; label: string }>;
  lineItemRows: Array<Record<string, string>>;
  draftLineColumns: Array<{ key: string; label: string; visible: boolean }>;
  isLineColumnsMenuOpen: boolean;
  lineColumnsMenuRef: RefObject<HTMLDivElement | null>;
  lineColumnsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenLineColumnsMenu: () => void;
  onCancelLineColumnsMenu: () => void;
  onToggleLineColumnVisibility: (key: string) => void;
  onMoveLineColumn: (key: string, direction: "up" | "down") => void;
  onSaveLineColumnChanges: () => void;
  onResetLineColumnChanges: () => void;
  onOpenLineItemDetail: (lineItemId: string) => void;
  onCreateLineItem: () => void;
};

export function ContractDetailView({
  isLineItemDetailOpen,
  selectedLineItemId,
  newLineItemDraftVersion,
  activeLineItemTab,
  onChangeLineItemTab,
  newLineItemDraftSeed,
  onSaveAndCreateNewLineItem,
  contractTabs,
  activeContractTabForView,
  onChangeContractTab,
  selectedContractId,
  visibleLineColumns,
  lineItemRows,
  draftLineColumns,
  isLineColumnsMenuOpen,
  lineColumnsMenuRef,
  lineColumnsButtonRef,
  onOpenLineColumnsMenu,
  onCancelLineColumnsMenu,
  onToggleLineColumnVisibility,
  onMoveLineColumn,
  onSaveLineColumnChanges,
  onResetLineColumnChanges,
  onOpenLineItemDetail,
  onCreateLineItem
}: ContractDetailViewProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return localStorage.getItem(CONTRACT_OVERVIEW_OPEN_KEY) !== "0";
  });
  const [overviewWidth, setOverviewWidth] = useState(() => {
    if (typeof window === "undefined") {
      return 280;
    }
    const savedWidth = Number(localStorage.getItem(CONTRACT_OVERVIEW_WIDTH_KEY));
    if (Number.isNaN(savedWidth)) {
      return 280;
    }
    return Math.min(CONTRACT_OVERVIEW_MAX_WIDTH, Math.max(CONTRACT_OVERVIEW_MIN_WIDTH, savedWidth));
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem(CONTRACT_OVERVIEW_OPEN_KEY, isOverviewOpen ? "1" : "0");
  }, [isOverviewOpen]);

  useEffect(() => {
    localStorage.setItem(CONTRACT_OVERVIEW_WIDTH_KEY, String(overviewWidth));
  }, [overviewWidth]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(CONTRACT_OVERVIEW_MAX_WIDTH, Math.max(CONTRACT_OVERVIEW_MIN_WIDTH, event.clientX - 16));
      setOverviewWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className={styles.contractDetailPanel}>
      {isLineItemDetailOpen ? (
        <LineItemDetailView
          key={`line-item-detail-${selectedLineItemId ?? "new"}-${newLineItemDraftVersion}`}
          lineItemId={selectedLineItemId ?? "new"}
          activeTab={activeLineItemTab}
          onChangeTab={onChangeLineItemTab}
          newDraftSeed={newLineItemDraftSeed}
          onSaveAndCreateNew={onSaveAndCreateNewLineItem}
        />
      ) : (
        <>
          <div className={styles.contractDetailTabControlRow}>
            <button
              type="button"
              className={styles.contractDetailOverviewToggle}
              onClick={() => setIsOverviewOpen((previous) => !previous)}
              aria-expanded={isOverviewOpen}
            >
              <MenuOpenIcon
                className={`${styles.overviewToggleIcon} ${
                  isOverviewOpen ? styles.overviewToggleIconOpen : styles.overviewToggleIconClosed
                }`}
                fontSize="small"
              />
              <span>Översikt</span>
            </button>
            <div className={styles.contractTabBar}>
              {contractTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.contractTabButton} ${
                    activeContractTabForView === tab ? styles.contractTabButtonActive : ""
                  }`}
                  onClick={() => onChangeContractTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.contractDetailContentLayout}>
            {isOverviewOpen ? (
              <aside
                className={styles.contractDetailOverviewPanel}
                style={{ width: `${overviewWidth}px`, flexBasis: `${overviewWidth}px` }}
              >
                <div className={styles.contractDetailOverviewHeader}>
                  <Typography className={styles.contractDetailOverviewTitle}>Översikt</Typography>
                </div>
                <div className={styles.contractDetailOverviewBody}>
                  <OverviewTab contractId={selectedContractId ?? "163311"} />
                </div>
              </aside>
            ) : null}
            {isOverviewOpen ? (
              <div
                className={styles.contractDetailResizeHandle}
                onMouseDown={() => setIsResizing(true)}
                role="separator"
                aria-orientation="vertical"
                aria-label="Justera panelbredd"
              />
            ) : null}
            <div className={styles.contractDetailMainContent}>
              {activeContractTabForView !== "Kontraktsrader" ? (
                <div className={styles.contractDetailHeader}>
                  <Typography className={styles.contractDetailTitle}>Kontrakt {selectedContractId}</Typography>
                  <div className={styles.contractDetailHeaderActions}>
                    <Button className={styles.contractSaveButton} size="small">
                      Spara
                    </Button>
                    <button type="button" className={styles.contractHeaderLink}>
                      Granska kontrakt
                    </button>
                    <button type="button" className={styles.contractHeaderLink}>
                      Orderbekräftelse
                    </button>
                    <button type="button" className={styles.contractHeaderDots}>
                      ...
                    </button>
                  </div>
                </div>
              ) : null}

              {activeContractTabForView === "Villkor" ? <TermsTab /> : null}
              {activeContractTabForView === "Leverans" ? <DeliveryTab /> : null}
              {activeContractTabForView === "Kontraktsrader" ? (
                <ContractRowsTab
                  visibleColumns={visibleLineColumns}
                  rows={lineItemRows}
                  draftColumns={draftLineColumns}
                  isColumnsMenuOpen={isLineColumnsMenuOpen}
                  columnsMenuRef={lineColumnsMenuRef}
                  columnsButtonRef={lineColumnsButtonRef}
                  onOpenColumnsMenu={onOpenLineColumnsMenu}
                  onCancelColumnsMenu={onCancelLineColumnsMenu}
                  onToggleColumnVisibility={onToggleLineColumnVisibility}
                  onMoveColumn={onMoveLineColumn}
                  onSaveColumnChanges={onSaveLineColumnChanges}
                  onResetColumnChanges={onResetLineColumnChanges}
                  onOpenRowDetail={onOpenLineItemDetail}
                  onCreateRow={onCreateLineItem}
                />
              ) : null}
              {activeContractTabForView === "Frakt" ? <FreightTab /> : null}
              {activeContractTabForView === "Avrop" ? <CallOffTab /> : null}
              {activeContractTabForView === "Dokument" ? <DocumentsTab /> : null}
              {activeContractTabForView === "Utskriftsalternativ" ? <PrintOptionsTab /> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

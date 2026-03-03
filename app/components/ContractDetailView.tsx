"use client";

import { Button, Typography } from "@mui/material";
import type { RefObject } from "react";
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

          {activeContractTabForView === "Översikt" ? <OverviewTab contractId={selectedContractId ?? "163311"} /> : null}
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
        </>
      )}
    </div>
  );
}

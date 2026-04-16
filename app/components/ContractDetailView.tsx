"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { Accordion, AccordionDetails, AccordionSummary, Chip, TextField, Typography } from "@mui/material";
import { useState, type RefObject } from "react";
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
  const isNewContract = selectedContractId === "new";
  const [expandedPanels, setExpandedPanels] = useState<string[]>(isNewContract ? [] : ["allmant"]);

  const togglePanel = (panel: string) => {
    setExpandedPanels((previous) =>
      previous.includes(panel) ? previous.filter((item) => item !== panel) : [...previous, panel]
    );
  };

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
          <div className={styles.contractModernTopRow}>
            <div className={styles.contractModernTitleWrap}>
              <Typography className={styles.contractModernTitle}>Kontrakt {selectedContractId}</Typography>
              <Chip label="Kunden har överskriden limit" size="small" className={styles.contractModernAlertChip} />
            </div>
            <div className={styles.contractModernTopActions} />
          </div>

          <div className={styles.contractModernSummaryGrid}>
            <div className={styles.contractModernSummaryCard}>
              <Typography className={styles.contractInfoLabel}>Kund</Typography>
              <Typography className={styles.contractInfoValue}>Acme AB</Typography>
            </div>
            <div className={styles.contractModernSummaryCard}>
              <Typography className={styles.contractInfoLabel}>Kontraktsdatum</Typography>
              <Typography className={styles.contractInfoValue}>2026-03-27</Typography>
            </div>
            <div className={styles.contractModernSummaryCard}>
              <Typography className={styles.contractInfoLabel}>Upprättat av</Typography>
              <Typography className={styles.contractInfoValue}>Alex Wahlroos</Typography>
            </div>
            <div className={styles.contractModernSummaryCard}>
              <Typography className={styles.contractInfoLabel}>Status</Typography>
              <Chip label="Aktivt kontrakt" size="small" className={styles.contractModernStatusChip} />
            </div>
          </div>

          <div className={styles.detailTwoColumnLayout}>
            <div className={styles.detailFormColumn}>
              <div className={styles.contractModernAccordionWrap}>
                <Accordion
                  expanded={expandedPanels.includes("allmant")}
                  onChange={() => togglePanel("allmant")}
                  className={styles.contractModernAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                    <div className={styles.contractModernAccordionTitleRow}>
                      <TableChartOutlinedIcon className={styles.contractModernAccordionIcon} />
                      <Typography className={styles.contractModernAccordionTitle}>Allmänt</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className={styles.contractModernFormGrid}>
                      <TextField label="Kund" size="small" defaultValue="Acme AB" />
                      <TextField label="Kontraktsnr" size="small" defaultValue={selectedContractId ?? "163311"} />
                      <TextField label="Prislista" size="small" defaultValue="Standard" />
                    </div>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandedPanels.includes("villkor")}
                  onChange={() => togglePanel("villkor")}
                  className={styles.contractModernAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                    <div className={styles.contractModernAccordionTitleRow}>
                      <GavelOutlinedIcon className={styles.contractModernAccordionIcon} />
                      <Typography className={styles.contractModernAccordionTitle}>Villkor</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className={styles.contractModernFormGrid}>
                      <TextField label="Betalningsvillkor" size="small" defaultValue="30 dagar netto" />
                      <TextField label="Leveransvillkor" size="small" defaultValue="Fritt lager" />
                    </div>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandedPanels.includes("leverans")}
                  onChange={() => togglePanel("leverans")}
                  className={styles.contractModernAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                    <div className={styles.contractModernAccordionTitleRow}>
                      <LocalShippingOutlinedIcon className={styles.contractModernAccordionIcon} />
                      <Typography className={styles.contractModernAccordionTitle}>Leverans</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DeliveryTab />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandedPanels.includes("dokument")}
                  onChange={() => togglePanel("dokument")}
                  className={styles.contractModernAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                    <div className={styles.contractModernAccordionTitleRow}>
                      <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                      <Typography className={styles.contractModernAccordionTitle}>Dokument</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DocumentsTab />
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
            <div className={styles.detailTabsColumn}>
              <div className={styles.contractModernAdditionsWrap}>
                <Typography className={styles.contractModernAdditionsTitle}>Kontraktstillägg</Typography>
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
                <div className={styles.contractDetailMainContent}>
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
                  {activeContractTabForView === "Dokument" ? <TermsTab /> : null}
                  {activeContractTabForView === "Utskriftsalternativ" ? <PrintOptionsTab /> : null}
                  {activeContractTabForView === "Villkor" ? <TermsTab /> : null}
                  {activeContractTabForView === "Leverans" ? <DeliveryTab /> : null}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

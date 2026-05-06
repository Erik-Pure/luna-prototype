"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, Divider, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState, useSyncExternalStore, type MouseEvent, type RefObject } from "react";
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
import { TilläggsTab } from "./contract-tabs/TilläggsTab";
import { getContractDetails } from "./contract-tabs/contractDetails";
import { ContractCreateView } from "./ContractCreateView";
import styles from "../page.module.scss";

type ContractDetailViewProps = {
  isLineItemDetailOpen: boolean;
  selectedLineItemId: string | null;
  newLineItemDraftVersion: number;
  activeLineItemTab: LineItemDetailTab;
  onChangeLineItemTab: (tab: LineItemDetailTab) => void;
  newLineItemDraftSeed: Partial<NewLineItemDraft>;
  pinnedLineItemFields: Set<keyof NewLineItemDraft>;
  onTogglePinnedLineItemField: (key: keyof NewLineItemDraft) => void;
  keepLineItemOpenAfterSave: boolean;
  onToggleKeepLineItemOpenAfterSave: (checked: boolean) => void;
  onSaveAndCreateNewLineItem: (draft: NewLineItemDraft) => void;
  onSaveAndCloseLineItem: () => void;
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
  onToggleLineColumnPin: (key: string) => void;
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
  pinnedLineItemFields,
  onTogglePinnedLineItemField,
  keepLineItemOpenAfterSave,
  onToggleKeepLineItemOpenAfterSave,
  onSaveAndCreateNewLineItem,
  onSaveAndCloseLineItem,
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
  onToggleLineColumnPin,
  onOpenLineItemDetail,
  onCreateLineItem
}: ContractDetailViewProps) {
  const contractDetails = getContractDetails(selectedContractId);
  const leveransAllmant = [
    { label: "Leveransort", value: contractDetails.leverans.location },
    { label: "Postnummer", value: contractDetails.leverans.postalCode },
    { label: "Mottagarland", value: contractDetails.leverans.receiverCountry },
    { label: "Leveransperiod", value: contractDetails.leverans.deliveryPeriod },
    { label: "Leveransadress", value: contractDetails.leverans.deliveryAddress },
  ];
  const leveransLossning = [
    { label: "Telefon lossning", value: contractDetails.leverans.unloadingPhone },
    { label: "Öppettider", value: contractDetails.leverans.unloadingHours },
    { label: "Aviseringstelefon", value: contractDetails.leverans.notificationPhone },
    { label: "Aviseringsinformation", value: contractDetails.leverans.notificationInfo },
  ];
  const leveransSjofrakt = [
    { label: "Utlastande hamn", value: contractDetails.leverans.portOfLoading },
    { label: "Speditör", value: contractDetails.leverans.freightForwarder },
    { label: "Mottagande hamn", value: contractDetails.leverans.portOfDischarge },
  ];
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [sectionsPanelWidth, setSectionsPanelWidth] = useState<number | null>(null);

  const isWide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1280px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false
  );

  const isExtraWide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1700px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1700px)").matches,
    () => false
  );

  const startResizeSections = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sectionsPanelWidth ?? (isExtraWide ? 380 : 290);
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const delta = startX - e.clientX;
      setSectionsPanelWidth(Math.max(220, Math.min(900, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const isMoreMenuOpen = moreMenuAnchor !== null;

  const openMoreMenu = (event: MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const closeMoreMenu = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <div className={styles.contractDetailPanel}>
      {selectedContractId === "new" ? (
        <ContractCreateView
          onSave={() => {
            // TODO: Handle contract save
          }}
          onCancel={() => {
            // TODO: Handle cancel - navigate back to list
          }}
        />
      ) : isLineItemDetailOpen ? (
        <LineItemDetailView
          key={`line-item-detail-${selectedLineItemId ?? "new"}-${newLineItemDraftVersion}`}
          lineItemId={selectedLineItemId ?? "new"}
          activeTab={activeLineItemTab}
          onChangeTab={onChangeLineItemTab}
          newDraftSeed={newLineItemDraftSeed}
          pinnedFields={pinnedLineItemFields}
          onTogglePinnedField={onTogglePinnedLineItemField}
          keepOpenAfterSave={keepLineItemOpenAfterSave}
          onToggleKeepOpenAfterSave={onToggleKeepLineItemOpenAfterSave}
          onSaveAndCreateNew={onSaveAndCreateNewLineItem}
          onSaveAndClose={onSaveAndCloseLineItem}
        />
      ) : (
        <>
          <div className={styles.contractModernTopRow}>
            <div className={styles.contractModernTitleWrap}>
              <Typography className={styles.contractModernTitle}>Kontrakt {selectedContractId}</Typography>
              {contractDetails.summary.warning ? (
                <Chip
                  label={contractDetails.summary.warning}
                  size="small"
                  color="error"
                  style={{ marginLeft: 8, fontWeight: 500, padding: "0 4px" }}
                />
              ) : null}
            </div>
            <div className={styles.contractModernTopActions}>
              <Button className={styles.contractSaveButton} size="small" startIcon={<EditOutlinedIcon fontSize="small" />}>
                Redigera
              </Button>
              <Button className={styles.contractQuickActionButton} size="small" startIcon={<ReceiptLongOutlinedIcon fontSize="small" />}>
                Orderbekräftelse
              </Button>
              <Button className={styles.contractQuickActionButton} size="small" startIcon={<DescriptionOutlinedIcon fontSize="small" />}>
                Granska
              </Button>
              <IconButton
                size="small"
                className={styles.contractHeaderDotsButton}
                aria-label="Skriv ut"
                title="Skriv ut"
              >
                <PrintOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                className={styles.contractHeaderDotsButton}
                aria-label="Fler åtgärder"
                onClick={openMoreMenu}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={moreMenuAnchor}
                open={isMoreMenuOpen}
                onClose={closeMoreMenu}
                classes={{ paper: styles.contractMoreMenuPaper }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem className={styles.contractMoreMenuItem} onClick={closeMoreMenu}>
                  Skapa prislista
                </MenuItem>
                <MenuItem className={styles.contractMoreMenuItem} onClick={closeMoreMenu}>
                  Byt prislista
                </MenuItem>
                <Divider className={styles.contractMoreMenuDivider} />
                <MenuItem className={styles.contractMoreMenuItem} onClick={closeMoreMenu}>
                  Skapa plocklista
                </MenuItem>
                <MenuItem className={styles.contractMoreMenuItem} onClick={closeMoreMenu}>
                  Läs in plocklista
                </MenuItem>
                <Divider className={styles.contractMoreMenuDivider} />
                <MenuItem className={styles.contractMoreMenuItem} onClick={closeMoreMenu}>
                  Läs in stocknota
                </MenuItem>
                <Divider className={styles.contractMoreMenuDivider} />
                <MenuItem className={`${styles.contractMoreMenuItem} ${styles.contractMoreMenuItemDanger}`} onClick={closeMoreMenu}>
                  <DeleteOutlineOutlinedIcon fontSize="small" className={styles.contractMoreMenuIcon} />
                  Ta bort
                </MenuItem>
              </Menu>
            </div>
          </div>

          <div className={`${styles.contractBodyLayout} ${isWide ? styles.contractBodyLayoutWide : ""}`}>
            {/* Right on large / top on small: accordion detail sections */}
            <div
              className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : ""} ${isExtraWide && !sectionsPanelWidth ? styles.contractBodySectionsColExtraWide : ""}`}
              style={isWide && sectionsPanelWidth ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
            >
              {isWide ? (
                <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
              ) : null}

              {/* ── Allmänt ── */}
              <Accordion defaultExpanded disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <InfoOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <div className={styles.contractDataGridCompact}>
                    {contractDetails.allmant.map((field) => (
                      <div key={field.label} className={styles.contractDataItem}>
                        <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                        <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                      </div>
                    ))}
                  </div>
                  {contractDetails.kommentarer.length > 0 ? (
                    <>
                      <Divider className={styles.contractSectionDivider} />
                      <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>
                      <div className={styles.contractDataGridCompact}>
                        {contractDetails.kommentarer.map((field) => (
                          <div key={field.label} className={`${styles.contractDataItem} ${styles.contractDataItemWide}`}>
                            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                            <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </AccordionDetails>
              </Accordion>

              {/* ── Villkor ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <GavelOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Villkor</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  {/* Valuta & Betalning */}
                  <Typography className={styles.contractSectionGroupLabel}>Valuta &amp; Betalning</Typography>
                  <div className={styles.contractDataGridCompact}>
                    {contractDetails.villkor
                      .filter((f) => ["Valuta", "Betalningsvillkor", "Betalningsvillkor dagar", "Moms"].includes(f.label))
                      .map((field) => (
                        <div key={field.label} className={styles.contractDataItem}>
                          <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                          <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                        </div>
                      ))}
                  </div>
                  {/* Kontrakt & Leverans */}
                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Kontrakt &amp; Leverans</Typography>
                  <div className={styles.contractDataGridCompact}>
                    {contractDetails.villkor
                      .filter((f) => ["Certifiering", "Kontraktsformular", "Kontraktsformulär", "Leveranssatt", "Leveranssätt", "Leveransvillkor", "Leveransvillkor ort"].includes(f.label))
                      .map((field) => (
                        <div key={field.label} className={styles.contractDataItem}>
                          <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                          <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                        </div>
                      ))}
                  </div>
                  {/* Agenter */}
                  {contractDetails.villkor.some((f) => f.label.startsWith("Agent")) ? (
                    <>
                      <Divider className={styles.contractSectionDivider} />
                      <Typography className={styles.contractSectionGroupLabel}>Agenter</Typography>
                      <div className={styles.contractDataGridCompact}>
                        {contractDetails.villkor
                          .filter((f) => f.label.startsWith("Agent"))
                          .map((field) => (
                            <div key={field.label} className={styles.contractDataItem}>
                              <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                              <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : null}
                  {/* Rabatter & Avgifter */}
                  {contractDetails.villkor.some((f) => ["Kassarabatt", "Bonus", "Plocktillagg", "Plocktillägg", "Malningstillagg", "Målningstillägg", "Inforselavgift", "Införselavgift"].includes(f.label)) ? (
                    <>
                      <Divider className={styles.contractSectionDivider} />
                      <Typography className={styles.contractSectionGroupLabel}>Rabatter &amp; Avgifter</Typography>
                      <div className={styles.contractDataGridCompact}>
                        {contractDetails.villkor
                          .filter((f) => ["Kassarabatt", "Bonus", "Plocktillagg", "Plocktillägg", "Malningstillagg", "Målningstillägg", "Inforselavgift", "Införselavgift"].includes(f.label))
                          .map((field) => (
                            <div key={field.label} className={styles.contractDataItem}>
                              <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                              <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : null}
                  {/* Lager */}
                  {contractDetails.villkor.some((f) => f.label === "Konsignationslager") ? (
                    <>
                      <Divider className={styles.contractSectionDivider} />
                      <Typography className={styles.contractSectionGroupLabel}>Lager</Typography>
                      <div className={styles.contractDataGridCompact}>
                        {contractDetails.villkor
                          .filter((f) => f.label === "Konsignationslager")
                          .map((field) => (
                            <div key={field.label} className={styles.contractDataItem}>
                              <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                              <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : null}
                </AccordionDetails>
              </Accordion>

              {/* ── Leverans ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <LocalShippingOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Leverans</Typography>
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  <Typography className={styles.contractSectionGroupLabel}>Allmänt</Typography>
                  <div className={styles.contractDataGridCompact}>
                    {leveransAllmant.map((field) => (
                      <div key={field.label} className={styles.contractDataItem}>
                        <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                        <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                      </div>
                    ))}
                  </div>
                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Lossning</Typography>
                  <div className={styles.contractDataGridCompact}>
                    {leveransLossning.map((field) => (
                      <div key={field.label} className={styles.contractDataItem}>
                        <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                        <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                      </div>
                    ))}
                  </div>
                  <Divider className={styles.contractSectionDivider} />
                  <Typography className={styles.contractSectionGroupLabel}>Sjöfrakt</Typography>
                  <div className={styles.contractDataGridCompact}>
                    {leveransSjofrakt.map((field) => (
                      <div key={field.label} className={styles.contractDataItem}>
                        <Typography className={styles.contractDataLabel}>{field.label}</Typography>
                        <Typography className={styles.contractDataValue}>{field.value || "—"}</Typography>
                      </div>
                    ))}
                  </div>
                </AccordionDetails>
              </Accordion>

              {/* ── Dokument ── */}
              <Accordion disableGutters elevation={0} className={styles.contractSectionAccordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                  <span className={styles.contractSectionTitleRow}>
                    <FolderOutlinedIcon className={styles.contractSectionIcon} />
                    <Typography className={styles.contractSectionTitle}>Dokument</Typography>
                    {contractDetails.dokument.length > 0 ? (
                      <Chip
                        label={contractDetails.dokument.length}
                        size="small"
                        className={styles.contractSectionCountChip}
                      />
                    ) : null}
                  </span>
                </AccordionSummary>
                <AccordionDetails className={styles.contractSectionDetailsArea}>
                  {contractDetails.dokument.length === 0 ? (
                    <Typography className={styles.contractDataLabel} style={{ padding: "4px 0", fontStyle: "italic" }}>
                      Inga dokument uppladdade.
                    </Typography>
                  ) : (
                    <div className={styles.contractDocumentList}>
                      {contractDetails.dokument.map((doc) => (
                        <div key={`${doc.name}-${doc.addedAt}`} className={styles.contractFileRow}>
                          <span className={styles.contractFileRowIcon}>
                            {doc.name.endsWith(".pdf") ? "📄" : doc.name.endsWith(".docx") ? "📝" : doc.name.endsWith(".xlsx") ? "📊" : "📁"}
                          </span>
                          <div className={styles.contractFileRowInfo}>
                            <p className={styles.contractFileName}>{doc.name}</p>
                            <p className={styles.contractFileSize}>{doc.size} — {doc.addedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>

            </div>

            {/* Left on large / bottom on small: contract tabs */}
            <div className={`${styles.contractBodyTabsCol} ${isWide ? styles.contractBodyTabsColWide : ""}`}>
              <div className={styles.contractModernAdditionsWrap}>
                <div className={styles.contractMudTabBar}>
                  {contractTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`${styles.contractMudTabItem} ${activeContractTabForView === tab ? styles.contractMudTabItemActive : ""}`}
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
                      onToggleColumnPin={onToggleLineColumnPin}
                      onOpenRowDetail={onOpenLineItemDetail}
                      onCreateRow={onCreateLineItem}
                    />
                  ) : null}
                  {activeContractTabForView === "Frakt" ? <FreightTab /> : null}
                  {activeContractTabForView === "Tillägg" ? <TilläggsTab /> : null}
                  {activeContractTabForView === "Avrop" ? <CallOffTab /> : null}
                  {activeContractTabForView === "Dokument" ? <DocumentsTab contractDetails={contractDetails} /> : null}
                  {activeContractTabForView === "Utskriftsalternativ" ? <PrintOptionsTab /> : null}
                  {activeContractTabForView === "Villkor" ? <TermsTab contractDetails={contractDetails} /> : null}
                  {activeContractTabForView === "Leverans" ? <DeliveryTab contractDetails={contractDetails} /> : null}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

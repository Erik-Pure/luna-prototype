"use client";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, Divider, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
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
import { getContractDetails, type ContractDetails, type FieldValue } from "./contract-tabs/contractDetails";
import { BytPrislistaDialog } from "./contract-tabs/BytPrislistaDialog";
import { ContractCreateView, type NewContractDraft } from "./ContractCreateView";
import styles from "../page.module.scss";

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const findFieldValue = (fields: FieldValue[], label: string) =>
  fields.find((f) => stripDiacritics(f.label) === stripDiacritics(label))?.value ?? "";

const matchSelectOption = (value: string, options: string[]) =>
  options.find((option) => stripDiacritics(option) === stripDiacritics(value)) ?? "";

const extractNumber = (value: string) => value.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".") ?? "";

function buildContractDraftFromDetails(details: ContractDetails): NewContractDraft {
  const { allmant, villkor, leverans } = details;
  const agentRaw = findFieldValue(villkor, "Agent 1");
  const bonusRaw = findFieldValue(villkor, "Bonus");

  return {
    customer: details.summary.customer,
    status: details.summary.status,
    createdBy: details.summary.createdBy,
    contractDate: details.summary.contractDate,
    language: matchSelectOption(findFieldValue(allmant, "Sprak"), ["Svenska", "English", "Deutsch"]),
    currency: matchSelectOption(findFieldValue(villkor, "Valuta"), ["SEK", "EUR", "USD"]),
    paymentTerms: matchSelectOption(findFieldValue(villkor, "Betalningsvillkor"), ["30 dagar netto", "14 dagar netto", "Förskott"]),
    certification: matchSelectOption(findFieldValue(villkor, "Certifiering"), ["ISO 9001", "ISO 14001", "CE-märkning", "Ingen"]),
    contractForm: matchSelectOption(findFieldValue(villkor, "Kontraktsformular"), ["Example contract", "Standard avtal", "Ramavtal"]),
    deliveryMethod: matchSelectOption(findFieldValue(villkor, "Leveranssatt"), ["Hämta", "DHL Express", "PostNord", "Egen transport"]),
    deliveryTerms: matchSelectOption(findFieldValue(villkor, "Leveransvillkor"), ["FCA", "EXW", "DAP", "DDP", "CIF", "FOB"]),
    deliveryTermsCity: findFieldValue(villkor, "Leveransvillkor ort"),
    agent1: matchSelectOption(agentRaw.split(" (")[0], ["Janne B", "Anna K", "Erik S"]),
    agent1Pct: agentRaw.match(/\((\d+(?:[.,]\d+)?)%\)/)?.[1]?.replace(",", ".") ?? "0",
    deliveryLocation: leverans.location,
    deliveryLocationPostalCode: leverans.postalCode,
    customerRef: matchSelectOption(findFieldValue(allmant, "Kundens referens"), ["Faktura", "Offert", "Order", "Avtal"]),
    priceList: findFieldValue(allmant, "Prislista"),
    externalContractNumber: findFieldValue(allmant, "Externt kontraktsnr"),
    priceAdjustPct: "",
    category: matchSelectOption(findFieldValue(allmant, "Kategori"), ["Bygghandel", "Industri", "Offentlig sektor", "Grossist", "Övrigt"]),
    country: matchSelectOption(findFieldValue(allmant, "Land"), ["Sverige", "Norge", "Danmark", "Finland", "Tyskland", "Frankrike", "Övriga EU"]),
    contractType: matchSelectOption(findFieldValue(allmant, "Kontraktstyp"), ["Försäljningskontrakt", "Ramavtal", "Inköpskontrakt", "Servicekontrakt", "Samarbetsavtal"]),
    validUntil: findFieldValue(allmant, "Giltig t.o.m."),
    miscNote: "",
    internalNote: "",
    exchangeRateDate: "",
    vat: extractNumber(findFieldValue(villkor, "Moms")) || "25",
    exchangeRate: "",
    paymentTermsDays: findFieldValue(villkor, "Betalningsvillkor dagar"),
    cashDiscount: extractNumber(findFieldValue(villkor, "Kassarabatt")),
    bonus: extractNumber(bonusRaw),
    bonusBase: /fakturerat/i.test(bonusRaw) ? "Fakturerat värde" : /netto/i.test(bonusRaw) ? "Nettovärde" : "Bruttovärde",
    pickingSurchargeMin: extractNumber(findFieldValue(villkor, "Plocktillagg")),
    pickingSurchargePct: "",
    paintingSurcharge: extractNumber(findFieldValue(villkor, "Malningstillagg")),
    paintingSurchargeThreshold: "",
    importFee: extractNumber(findFieldValue(villkor, "Inforselavgift")),
    consignmentStock: stripDiacritics(findFieldValue(villkor, "Konsignationslager")) === "ja",
    receiverCountry: matchSelectOption(leverans.receiverCountry, ["Sverige", "Norge", "Danmark", "Finland", "Tyskland", "Frankrike", "Övriga EU"]),
    deliveryPeriod: leverans.deliveryPeriod,
    deliveryAddress: leverans.deliveryAddress,
    unloadingPhone: leverans.unloadingPhone,
    unloadingHours: leverans.unloadingHours,
    notificationPhone: leverans.notificationPhone,
    notificationInfo: leverans.notificationInfo,
  };
}

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
  onOpenContainer: () => void;
  onCreateAvropsrad: () => void;
  onOpenAvropsrad: (id: string, data?: Record<string, string>) => void;
};

const MIN_SECTIONS_PANEL_WIDTH = 220;
const MAX_SECTIONS_PANEL_WIDTH = 900;

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
  onCreateLineItem,
  onOpenContainer,
  onCreateAvropsrad,
  onOpenAvropsrad,
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
  const [isSectionsPanelCollapsed, setIsSectionsPanelCollapsed] = useState(false);
  const [isBytPrislistaOpen, setIsBytPrislistaOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [expandedDialogOpen, setExpandedDialogOpen] = useState(false);

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
      setSectionsPanelWidth(Math.max(MIN_SECTIONS_PANEL_WIDTH, Math.min(MAX_SECTIONS_PANEL_WIDTH, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const isSectionsPanelMaxWidth = sectionsPanelWidth === MAX_SECTIONS_PANEL_WIDTH;

  const toggleSectionsPanelWidth = () => {
    setSectionsPanelWidth((current) => (current === MAX_SECTIONS_PANEL_WIDTH ? null : MAX_SECTIONS_PANEL_WIDTH));
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
      {expandedDialogOpen ? (
        <ContractCreateView
          mode="edit"
          title={`Kontrakt ${selectedContractId} - ${contractDetails.summary.customer}`}
          initialDraft={buildContractDraftFromDetails(contractDetails)}
          onSave={() => setExpandedDialogOpen(false)}
          onCancel={() => setExpandedDialogOpen(false)}
        />
      ) : selectedContractId === "new" ? (
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
          onCreateAvropsrad={onCreateAvropsrad}
          onOpenAvropsrad={onOpenAvropsrad}
        />
      ) : (
        <>
          <div className={styles.contractModernTopRow}>
            <div className={styles.contractModernTitleWrap}>
              <Typography className={styles.contractModernTitle}>Kontrakt {selectedContractId} - {contractDetails.summary.customer}</Typography>
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
              <Button className={styles.contractQuickActionButton} size="small" startIcon={<ReceiptLongOutlinedIcon fontSize="small" />}>
                Orderbekräftelse
              </Button>
              <Button className={styles.contractQuickActionButton} size="small" startIcon={<DescriptionOutlinedIcon fontSize="small" />}>
                Granska
              </Button>
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
                <MenuItem className={styles.contractMoreMenuItem} onClick={() => { closeMoreMenu(); setIsBytPrislistaOpen(true); }}>
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
              className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : ""} ${isExtraWide && !sectionsPanelWidth && !isSectionsPanelCollapsed ? styles.contractBodySectionsColExtraWide : ""} ${isSectionsPanelCollapsed ? styles.contractBodySectionsColCollapsed : ""}`}
              style={isWide && sectionsPanelWidth && !isSectionsPanelCollapsed ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
            >
              {isWide && !isSectionsPanelCollapsed ? (
                <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
              ) : null}

              {/* Panel header: minimize button left + Redigera button right */}
              <div className={styles.contractSectionsPanelHeader}>
                <div className={styles.contractSectionsPanelTitleRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
                  {!isSectionsPanelCollapsed ? (
                    <Typography className={styles.contractSectionsPanelTitle}>Kontraktsinformation</Typography>
                  ) : null}
                  <Tooltip title={isSectionsPanelCollapsed ? "Expandera kontrakshuvud" : "Minimera kontrakshuvud"}>
                    <IconButton
                      size="small"
                      className={styles.contractSectionsPanelMinimizeBtn}
                      onClick={() => setIsSectionsPanelCollapsed((v) => !v)}
                    >
                      <MenuOpenIcon fontSize="small" style={isSectionsPanelCollapsed ? { transform: "scaleX(1)" } : { transform: "scaleX(-1)" }} />
                    </IconButton>
                  </Tooltip>
                </div>
                {!isSectionsPanelCollapsed ? (
                  <div className={styles.contractSectionsPanelHeaderActionsRow}>
                    {isEditingInfo ? (
                      <>
                        <Button
                          size="small"
                          className={styles.freightSaveButton}
                          onClick={() => setIsEditingInfo(false)}
                        >
                          Spara
                        </Button>
                        <Button
                          size="small"
                          className={styles.freightCancelButton}
                          onClick={() => setIsEditingInfo(false)}
                        >
                          Avbryt
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        className={styles.contractSaveButton}
                        startIcon={<EditOutlinedIcon fontSize="small" />}
                        onClick={() => setIsEditingInfo(true)}
                      >
                        Redigera
                      </Button>
                    )}
                    <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
                    <Tooltip title="Redigera i formulär">
                      <Button
                        size="small"
                        className={styles.contractHeaderDotsButton}
                        onClick={() => setExpandedDialogOpen(true)}
                        style={{ minWidth: 0 }}
                      >
                        <EditNoteOutlinedIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    {isWide ? (
                      <Tooltip title={isSectionsPanelMaxWidth ? "Återställ panelbredd" : "Maximera panelbredd"}>
                        <Button
                          size="small"
                          className={styles.contractHeaderDotsButton}
                          onClick={toggleSectionsPanelWidth}
                          style={{ minWidth: 0 }}
                        >
                          {isSectionsPanelMaxWidth ? (
                            <KeyboardDoubleArrowRightIcon fontSize="small" />
                          ) : (
                            <KeyboardDoubleArrowLeftIcon fontSize="small" />
                          )}
                        </Button>
                      </Tooltip>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {!isSectionsPanelCollapsed ? (<>
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
              </>) : null}

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
                      onOpenContainer={onOpenContainer}
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
      <BytPrislistaDialog
        open={isBytPrislistaOpen}
        onClose={() => setIsBytPrislistaOpen(false)}
        onConfirm={() => setIsBytPrislistaOpen(false)}
      />
    </div>
  );
}

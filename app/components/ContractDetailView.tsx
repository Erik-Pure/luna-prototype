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
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Chip, Divider, IconButton, InputAdornment, Menu, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import { useRef, useState, type MouseEvent, type RefObject } from "react";
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
import { ContractCreateView, mockCustomers, mockDeliveryLocations, mockDeliveryAddresses, type NewContractDraft } from "./ContractCreateView";
import { SectionQuickNav, scrollSectionIntoView, type QuickNavSection } from "./shared/SectionQuickNav";
import { useMediaQuery, WIDE_LAYOUT_QUERY, EXTRA_WIDE_LAYOUT_QUERY } from "../hooks/useMediaQuery";
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
  getLineColumnWidth?: (key: string) => number | undefined;
  onIncreaseLineColumnWidth?: (key: string) => void;
  onDecreaseLineColumnWidth?: (key: string) => void;
  onOpenLineItemDetail: (lineItemId: string) => void;
  onCreateLineItem: () => void;
  onOpenContainer: () => void;
  onCreateAvropsrad: () => void;
  onOpenAvropsrad: (id: string, data?: Record<string, string>) => void;
  onCancelNewContract: () => void;
};

const MIN_SECTIONS_PANEL_WIDTH = 220;
const MAX_SECTIONS_PANEL_WIDTH = 900;

const CONTRACT_SECTIONS: QuickNavSection[] = [
  { key: "allmant", label: "Allmänt" },
  { key: "villkor", label: "Villkor" },
  { key: "leverans", label: "Leverans" },
  { key: "dokument", label: "Dokument" },
];

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
  getLineColumnWidth,
  onIncreaseLineColumnWidth,
  onDecreaseLineColumnWidth,
  onOpenLineItemDetail,
  onCreateLineItem,
  onOpenContainer,
  onCreateAvropsrad,
  onOpenAvropsrad,
  onCancelNewContract,
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
  const [draft, setDraft] = useState<NewContractDraft>(() => buildContractDraftFromDetails(contractDetails));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(CONTRACT_SECTIONS.map((section) => section.key))
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionsHeaderRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (key: string, isExpanded: boolean) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const jumpToSection = (key: string) => {
    setExpandedSections((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    requestAnimationFrame(() => {
      const target = sectionRefs.current[key];
      if (target) scrollSectionIntoView(target, sectionsHeaderRef.current);
    });
  };

  const set = (key: keyof NewContractDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleDeliveryLocationChange = (locationName: string) => {
    set("deliveryLocation", locationName);
    const location = mockDeliveryLocations.find((l) => l.name === locationName);
    if (location) set("deliveryLocationPostalCode", location.postalCode);
  };

  const agent2Field = contractDetails.villkor.find((f) => f.label === "Agent 2");

  const isWide = useMediaQuery(WIDE_LAYOUT_QUERY);
  const isExtraWide = useMediaQuery(EXTRA_WIDE_LAYOUT_QUERY);

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
          onCancel={onCancelNewContract}
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
                  icon={<WarningIcon />}
                  label={contractDetails.summary.warning}
                  size="medium"
                  className={`${contractDetails.summary.warningTone === "orange" ? styles.limitModerateChip : styles.limitErrorChip} ${styles.customerHeaderWarningChip}`}
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
              className={`${styles.contractBodySectionsCol} ${isWide ? styles.contractBodySectionsColWide : styles.contractBodySectionsColStacked} ${isExtraWide && !sectionsPanelWidth && !isSectionsPanelCollapsed ? styles.contractBodySectionsColExtraWide : ""} ${isSectionsPanelCollapsed ? (isWide ? styles.contractBodySectionsColCollapsed : styles.contractBodySectionsColCollapsedNarrow) : ""}`}
              style={isWide && sectionsPanelWidth && !isSectionsPanelCollapsed ? { width: sectionsPanelWidth, maxWidth: sectionsPanelWidth } : undefined}
            >
              {isWide && !isSectionsPanelCollapsed ? (
                <div className={styles.contractSectionsResizeHandle} onMouseDown={startResizeSections} />
              ) : null}

              {/* Panel header: minimize button left + Redigera button right */}
              <div ref={sectionsHeaderRef} className={styles.contractSectionsPanelHeader}>
                <div className={styles.contractSectionsPanelTitleRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
                  {!isSectionsPanelCollapsed || !isWide ? (
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
                  <SectionQuickNav sections={CONTRACT_SECTIONS} onSelect={jumpToSection} />
                ) : null}
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
                <Accordion
                  expanded={expandedSections.has("allmant")}
                  onChange={(_, isExpanded) => toggleSection("allmant", isExpanded)}
                  ref={(el) => { sectionRefs.current.allmant = el; }}
                  disableGutters
                  elevation={0}
                  className={styles.contractSectionAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                    <span className={styles.contractSectionTitleRow}>
                      <InfoOutlinedIcon className={styles.contractSectionIcon} />
                      <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                    </span>
                  </AccordionSummary>
                  <AccordionDetails className={`${styles.contractSectionDetailsArea} ${!isEditingInfo ? styles.contractSectionDetailsAreaLocked : ""}`}>
                    <Typography className={styles.contractSectionGroupLabel}>Grunduppgifter</Typography>
                    <div className={styles.contractModernFormGrid}>
                      <TextField select fullWidth size="small" label="Kund" value={draft.customer} onChange={(e) => set("customer", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        {mockCustomers.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
                      </TextField>
                      <TextField fullWidth size="small" label="Kontraktsnr" value={selectedContractId ?? ""} disabled />
                      <TextField fullWidth size="small" label="Externt kontraktsnr" value={draft.externalContractNumber} onChange={(e) => set("externalContractNumber", e.target.value)} />
                      <TextField select fullWidth size="small" label="Prislista" value={draft.priceList} onChange={(e) => set("priceList", e.target.value)}>
                        <MenuItem value="">— Standardpris —</MenuItem>
                        <MenuItem value="PL-2024-A">PL-2024-A (Storkundspris)</MenuItem>
                        <MenuItem value="PL-2024-B">PL-2024-B (Återförsäljare)</MenuItem>
                        <MenuItem value="PL-2024-C">PL-2024-C (Kampanjpris)</MenuItem>
                        <MenuItem value="PL-Export">PL-Export (Exportpris)</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Status" value={draft.status} onChange={(e) => set("status", e.target.value)}>
                        <MenuItem value="Aktivt kontrakt">Aktivt kontrakt</MenuItem>
                        <MenuItem value="Utkast">Utkast</MenuItem>
                        <MenuItem value="Avslutat">Avslutat</MenuItem>
                        <MenuItem value="Pausat">Pausat</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Upprättat av" value={draft.createdBy} onChange={(e) => set("createdBy", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="John Doe">John Doe</MenuItem>
                        <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Språk" value={draft.language} onChange={(e) => set("language", e.target.value)}>
                        <MenuItem value="Svenska">Svenska</MenuItem>
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Deutsch">Deutsch</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Kategori" value={draft.category} onChange={(e) => set("category", e.target.value)}>
                        <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                        <MenuItem value="Industri">Industri</MenuItem>
                        <MenuItem value="Offentlig sektor">Offentlig sektor</MenuItem>
                        <MenuItem value="Grossist">Grossist</MenuItem>
                        <MenuItem value="Övrigt">Övrigt</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Land" value={draft.country} onChange={(e) => set("country", e.target.value)}>
                        <MenuItem value="Sverige">Sverige</MenuItem>
                        <MenuItem value="Norge">Norge</MenuItem>
                        <MenuItem value="Danmark">Danmark</MenuItem>
                        <MenuItem value="Finland">Finland</MenuItem>
                        <MenuItem value="Tyskland">Tyskland</MenuItem>
                        <MenuItem value="Frankrike">Frankrike</MenuItem>
                        <MenuItem value="Övriga EU">Övriga EU</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Kontraktstyp" value={draft.contractType} onChange={(e) => set("contractType", e.target.value)}>
                        <MenuItem value="Försäljningskontrakt">Försäljningskontrakt</MenuItem>
                        <MenuItem value="Ramavtal">Ramavtal</MenuItem>
                        <MenuItem value="Inköpskontrakt">Inköpskontrakt</MenuItem>
                        <MenuItem value="Servicekontrakt">Servicekontrakt</MenuItem>
                        <MenuItem value="Samarbetsavtal">Samarbetsavtal</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Kundens referens" value={draft.customerRef} onChange={(e) => set("customerRef", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="Faktura">Faktura</MenuItem>
                        <MenuItem value="Offert">Offert</MenuItem>
                        <MenuItem value="Order">Order</MenuItem>
                        <MenuItem value="Avtal">Avtal</MenuItem>
                      </TextField>
                      <TextField fullWidth size="small" label="Giltig t.o.m." type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
                    </div>
                    {contractDetails.kommentarer.length > 0 ? (
                      <>
                        <Divider className={styles.contractSectionDivider} />
                        <Typography className={styles.contractSectionGroupLabel}>Kommentarer</Typography>
                        <div className={styles.contractModernFormGrid}>
                          {contractDetails.kommentarer.map((field) => (
                            <TextField
                              key={field.label}
                              fullWidth
                              size="small"
                              multiline
                              rows={3}
                              label={field.label}
                              value={field.value}
                              disabled
                              style={{ gridColumn: "1 / -1" }}
                            />
                          ))}
                        </div>
                      </>
                    ) : null}
                  </AccordionDetails>
                </Accordion>

                {/* ── Villkor ── */}
                <Accordion
                  expanded={expandedSections.has("villkor")}
                  onChange={(_, isExpanded) => toggleSection("villkor", isExpanded)}
                  ref={(el) => { sectionRefs.current.villkor = el; }}
                  disableGutters
                  elevation={0}
                  className={styles.contractSectionAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                    <span className={styles.contractSectionTitleRow}>
                      <GavelOutlinedIcon className={styles.contractSectionIcon} />
                      <Typography className={styles.contractSectionTitle}>Villkor</Typography>
                    </span>
                  </AccordionSummary>
                  <AccordionDetails className={`${styles.contractSectionDetailsArea} ${!isEditingInfo ? styles.contractSectionDetailsAreaLocked : ""}`}>
                    {/* Valuta & Betalning */}
                    <Typography className={styles.contractSectionGroupLabel}>Valuta &amp; Betalning</Typography>
                    <div className={styles.contractModernFormGrid}>
                      <TextField select fullWidth size="small" label="Valuta" value={draft.currency} onChange={(e) => set("currency", e.target.value)}>
                        <MenuItem value="SEK">SEK</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Betalningsvillkor" value={draft.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
                        <MenuItem value="30 dagar netto">30 dagar netto</MenuItem>
                        <MenuItem value="14 dagar netto">14 dagar netto</MenuItem>
                        <MenuItem value="Förskott">Förskott</MenuItem>
                      </TextField>
                      <TextField fullWidth size="small" label="Betalningsvillkor dagar" type="number" value={draft.paymentTermsDays} onChange={(e) => set("paymentTermsDays", e.target.value)} />
                      <TextField select fullWidth size="small" label="Moms" value={draft.vat} onChange={(e) => set("vat", e.target.value)}>
                        <MenuItem value="25">25%</MenuItem>
                        <MenuItem value="12">12%</MenuItem>
                        <MenuItem value="6">6%</MenuItem>
                        <MenuItem value="0">0% (momsfri)</MenuItem>
                      </TextField>
                    </div>
                    {/* Kontrakt & Leverans */}
                    <Divider className={styles.contractSectionDivider} />
                    <Typography className={styles.contractSectionGroupLabel}>Kontrakt &amp; Leverans</Typography>
                    <div className={styles.contractModernFormGrid}>
                      <TextField select fullWidth size="small" label="Certifiering" value={draft.certification} onChange={(e) => set("certification", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="ISO 9001">ISO 9001</MenuItem>
                        <MenuItem value="ISO 14001">ISO 14001</MenuItem>
                        <MenuItem value="CE-märkning">CE-märkning</MenuItem>
                        <MenuItem value="Ingen">Ingen</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Kontraktsformulär" value={draft.contractForm} onChange={(e) => set("contractForm", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="Example contract">Example contract</MenuItem>
                        <MenuItem value="Standard avtal">Standard avtal</MenuItem>
                        <MenuItem value="Ramavtal">Ramavtal</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Leveranssätt" value={draft.deliveryMethod} onChange={(e) => set("deliveryMethod", e.target.value)}>
                        <MenuItem value="Hämta">Hämta</MenuItem>
                        <MenuItem value="DHL Express">DHL Express</MenuItem>
                        <MenuItem value="PostNord">PostNord</MenuItem>
                        <MenuItem value="Egen transport">Egen transport</MenuItem>
                      </TextField>
                      <TextField select fullWidth size="small" label="Leveransvillkor" value={draft.deliveryTerms} onChange={(e) => set("deliveryTerms", e.target.value)}>
                        <MenuItem value="FCA">FCA</MenuItem>
                        <MenuItem value="EXW">EXW</MenuItem>
                        <MenuItem value="DAP">DAP</MenuItem>
                        <MenuItem value="DDP">DDP</MenuItem>
                        <MenuItem value="CIF">CIF</MenuItem>
                        <MenuItem value="FOB">FOB</MenuItem>
                      </TextField>
                      <TextField fullWidth size="small" label="Leveransvillkor ort" value={draft.deliveryTermsCity} onChange={(e) => set("deliveryTermsCity", e.target.value)} />
                    </div>
                    {/* Agenter */}
                    {contractDetails.villkor.some((f) => f.label.startsWith("Agent")) ? (
                      <>
                        <Divider className={styles.contractSectionDivider} />
                        <Typography className={styles.contractSectionGroupLabel}>Agenter</Typography>
                        <div className={styles.contractModernFormGrid}>
                          <TextField select fullWidth size="small" label="Agent 1" value={draft.agent1} onChange={(e) => set("agent1", e.target.value)}>
                            <MenuItem value="">—</MenuItem>
                            <MenuItem value="Janne B">Janne B</MenuItem>
                            <MenuItem value="Anna K">Anna K</MenuItem>
                            <MenuItem value="Erik S">Erik S</MenuItem>
                          </TextField>
                          <TextField fullWidth size="small" label="Provision agent 1" type="number" value={draft.agent1Pct} onChange={(e) => set("agent1Pct", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                          {agent2Field ? (
                            <TextField fullWidth size="small" label="Agent 2" value={agent2Field.value} disabled />
                          ) : null}
                        </div>
                      </>
                    ) : null}
                    {/* Rabatter & Avgifter */}
                    {contractDetails.villkor.some((f) => ["Kassarabatt", "Bonus", "Plocktillagg", "Plocktillägg", "Malningstillagg", "Målningstillägg", "Inforselavgift", "Införselavgift"].includes(f.label)) ? (
                      <>
                        <Divider className={styles.contractSectionDivider} />
                        <Typography className={styles.contractSectionGroupLabel}>Rabatter &amp; Avgifter</Typography>
                        <div className={styles.contractModernFormGrid}>
                          <TextField fullWidth size="small" label="Kassarabatt" type="number" value={draft.cashDiscount} onChange={(e) => set("cashDiscount", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                          <TextField fullWidth size="small" label="Bonus" type="number" value={draft.bonus} onChange={(e) => set("bonus", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
                          <TextField select fullWidth size="small" label="Bonusbas" value={draft.bonusBase} onChange={(e) => set("bonusBase", e.target.value)}>
                            <MenuItem value="Bruttovärde">Bruttovärde</MenuItem>
                            <MenuItem value="Nettovärde">Nettovärde</MenuItem>
                            <MenuItem value="Fakturerat värde">Fakturerat värde</MenuItem>
                          </TextField>
                          <TextField fullWidth size="small" label="Plocktillägg, minst" type="number" value={draft.pickingSurchargeMin} onChange={(e) => set("pickingSurchargeMin", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">{`${draft.currency}/avropsrad`}</InputAdornment> } }} />
                          <TextField fullWidth size="small" label="Målningstillägg" type="number" value={draft.paintingSurcharge} onChange={(e) => set("paintingSurcharge", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">{`${draft.currency}/avropsrad`}</InputAdornment> } }} />
                          <TextField fullWidth size="small" label="Införselavgift" type="number" value={draft.importFee} onChange={(e) => set("importFee", e.target.value)}
                            slotProps={{ input: { endAdornment: <InputAdornment position="end">{draft.currency}</InputAdornment> } }} />
                        </div>
                      </>
                    ) : null}
                    {/* Lager */}
                    {contractDetails.villkor.some((f) => f.label === "Konsignationslager") ? (
                      <>
                        <Divider className={styles.contractSectionDivider} />
                        <Typography className={styles.contractSectionGroupLabel}>Lager</Typography>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: isEditingInfo ? "pointer" : "default" }}>
                          <Checkbox checked={draft.consignmentStock} onChange={(e) => set("consignmentStock", e.target.checked)} size="small" disabled={!isEditingInfo} />
                          <Typography variant="body2">Konsignationslager</Typography>
                        </label>
                      </>
                    ) : null}
                  </AccordionDetails>
                </Accordion>

                {/* ── Leverans ── */}
                <Accordion
                  expanded={expandedSections.has("leverans")}
                  onChange={(_, isExpanded) => toggleSection("leverans", isExpanded)}
                  ref={(el) => { sectionRefs.current.leverans = el; }}
                  disableGutters
                  elevation={0}
                  className={styles.contractSectionAccordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                    <span className={styles.contractSectionTitleRow}>
                      <LocalShippingOutlinedIcon className={styles.contractSectionIcon} />
                      <Typography className={styles.contractSectionTitle}>Leverans</Typography>
                    </span>
                  </AccordionSummary>
                  <AccordionDetails className={`${styles.contractSectionDetailsArea} ${!isEditingInfo ? styles.contractSectionDetailsAreaLocked : ""}`}>
                    <Typography className={styles.contractSectionGroupLabel}>Allmänt</Typography>
                    <div className={styles.contractModernFormGrid}>
                      <TextField select fullWidth size="small" label="Leveransort" value={draft.deliveryLocation} onChange={(e) => handleDeliveryLocationChange(e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        {mockDeliveryLocations.map((loc) => (
                          <MenuItem key={`${loc.name}-${loc.postalCode}`} value={loc.name}>{loc.name} ({loc.postalCode})</MenuItem>
                        ))}
                      </TextField>
                      <TextField fullWidth size="small" label="Postnummer" value={draft.deliveryLocationPostalCode} disabled helperText="Fylls i automatiskt" />
                      <TextField select fullWidth size="small" label="Mottagarland" value={draft.receiverCountry} onChange={(e) => set("receiverCountry", e.target.value)}>
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="Sverige">Sverige</MenuItem>
                        <MenuItem value="Norge">Norge</MenuItem>
                        <MenuItem value="Danmark">Danmark</MenuItem>
                        <MenuItem value="Finland">Finland</MenuItem>
                        <MenuItem value="Tyskland">Tyskland</MenuItem>
                        <MenuItem value="Frankrike">Frankrike</MenuItem>
                        <MenuItem value="Övriga EU">Övriga EU</MenuItem>
                      </TextField>
                      <TextField fullWidth size="small" label="Leveransperiod" value={draft.deliveryPeriod} onChange={(e) => set("deliveryPeriod", e.target.value)} />
                      <TextField select fullWidth size="small" label="Leveransadress" value={draft.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} style={{ gridColumn: "1 / -1" }}>
                        <MenuItem value="">—</MenuItem>
                        {mockDeliveryAddresses.map((addr) => <MenuItem key={addr} value={addr}>{addr}</MenuItem>)}
                      </TextField>
                    </div>
                    <Divider className={styles.contractSectionDivider} />
                    <Typography className={styles.contractSectionGroupLabel}>Lossning</Typography>
                    <div className={styles.contractModernFormGrid}>
                      <TextField fullWidth size="small" label="Telefon lossning" type="tel" value={draft.unloadingPhone} onChange={(e) => set("unloadingPhone", e.target.value)} />
                      <TextField fullWidth size="small" label="Öppettider" value={draft.unloadingHours} onChange={(e) => set("unloadingHours", e.target.value)} />
                      <TextField fullWidth size="small" label="Aviseringstelefon" type="tel" value={draft.notificationPhone} onChange={(e) => set("notificationPhone", e.target.value)} />
                      <TextField fullWidth size="small" label="Aviseringsinformation" multiline rows={3} value={draft.notificationInfo} onChange={(e) => set("notificationInfo", e.target.value)} style={{ gridColumn: "1 / -1" }} />
                    </div>
                    <Divider className={styles.contractSectionDivider} />
                    <Typography className={styles.contractSectionGroupLabel}>Sjöfrakt</Typography>
                    <div className={styles.contractModernFormGrid}>
                      {leveransSjofrakt.map((field) => (
                        <TextField key={field.label} fullWidth size="small" label={field.label} value={field.value} disabled />
                      ))}
                    </div>
                  </AccordionDetails>
                </Accordion>

                {/* ── Dokument ── */}
                <Accordion
                  expanded={expandedSections.has("dokument")}
                  onChange={(_, isExpanded) => toggleSection("dokument", isExpanded)}
                  ref={(el) => { sectionRefs.current.dokument = el; }}
                  disableGutters
                  elevation={0}
                  className={styles.contractSectionAccordion}
                >
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
                <div className={`${styles.contractMudTabBar} ${!isWide ? styles.contractMudTabBarStackedSticky : ""}`}>
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
                      getColumnWidth={getLineColumnWidth}
                      onIncreaseColumnWidth={onIncreaseLineColumnWidth}
                      onDecreaseColumnWidth={onDecreaseLineColumnWidth}
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

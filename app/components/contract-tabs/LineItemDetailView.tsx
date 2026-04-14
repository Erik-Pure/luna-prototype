"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import styles from "../../page.module.scss";

const lineItemDetailTabs = [
  "Längdfördelning",
  "Periodisering",
  "Nettolager",
  "Avropsrad",
  "Produktionsplanering",
  "Leveransbokade paket"
] as const;

export type LineItemDetailTab = (typeof lineItemDetailTabs)[number];
export type NewLineItemDraft = {
  senderCompany: string;
  senderWarehouse: string;
  artNr: string;
  quantity: string;
  price: string;
  status: string;
  deliveryWeek: string;
  deliveryWindowMin: string;
  deliveryWindowMax: string;
  deliverArtNr: string;
  product: string;
  packageType: string;
  length: string;
  deliveryDay: string;
  internalComment: string;
  externalComment: string;
};

const emptyNewLineItemDraft: NewLineItemDraft = {
  senderCompany: "BP Hissmofors Byggprodukter",
  senderWarehouse: "Krokom",
  artNr: "",
  quantity: "",
  price: "",
  status: "Aktiv",
  deliveryWeek: "",
  deliveryWindowMin: "",
  deliveryWindowMax: "",
  deliverArtNr: "",
  product: "",
  packageType: "Lp",
  length: "",
  deliveryDay: "",
  internalComment: "",
  externalComment: ""
};

const existingLineItemDraft: NewLineItemDraft = {
  senderCompany: "BP Hissmofors Byggprodukter",
  senderWarehouse: "Krokom",
  artNr: "2202209500002000",
  quantity: "1",
  price: "10,29 SEK/lpm",
  status: "Aktiv",
  deliveryWeek: "202550",
  deliveryWindowMin: "2025-12-05",
  deliveryWindowMax: "2025-12-10",
  deliverArtNr: "2202209500002000",
  product: "22x95 Gran Ytterp",
  packageType: "Lp",
  length: "5,400",
  deliveryDay: "",
  internalComment: "",
  externalComment: ""
};
const lineItemReadonlyFields = [
  { label: "Kontraktsnr", value: "163352" },
  { label: "ProduktNr", value: "7295:1:5400" },
  { label: "Volym", value: "3,421 m3" },
  { label: "Slutvolym", value: "3,079 m3" },
  { label: "Prisjusterad", value: "0 %" },
  { label: "Belopp", value: "14 669 SEK" },
  { label: "Belopp spons", value: "0 SEK" },
  { label: "Avropsradsstatus", value: "Load planned" }
] as const;

type LineItemDetailViewProps = {
  lineItemId: string;
  activeTab: LineItemDetailTab;
  onChangeTab: (tab: LineItemDetailTab) => void;
  newDraftSeed?: Partial<NewLineItemDraft>;
  onSaveAndCreateNew?: (draft: NewLineItemDraft) => void;
};

export function LineItemDetailView({
  lineItemId,
  activeTab,
  onChangeTab,
  newDraftSeed = {},
  onSaveAndCreateNew
}: LineItemDetailViewProps) {
  const isNewLineItem = lineItemId === "new";
  const [newLineItemDraft, setNewLineItemDraft] = useState<NewLineItemDraft>({
    ...(isNewLineItem ? emptyNewLineItemDraft : existingLineItemDraft),
    ...newDraftSeed
  });
  const [expandedPanels, setExpandedPanels] = useState<string[]>(isNewLineItem ? ["obligatoriska"] : ["allmant"]);

  const updateDraftField = (key: keyof NewLineItemDraft, value: string) => {
    setNewLineItemDraft((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const togglePanel = (panel: string) => {
    setExpandedPanels((previous) =>
      previous.includes(panel) ? previous.filter((item) => item !== panel) : [...previous, panel]
    );
  };

  return (
    <div className={styles.lineItemDetailPanel}>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>
            {isNewLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${lineItemId}`}
          </Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          <Button className={styles.lineItemBackButton} size="small" disabled>
            Föregående
          </Button>
          <Button className={styles.lineItemBackButton} size="small" disabled>
            Nästa
          </Button>
          {isNewLineItem ? (
            <Button className={styles.lineItemBackButton} size="small" onClick={() => onSaveAndCreateNew?.(newLineItemDraft)}>
              Spara och skapa ny
            </Button>
          ) : null}
        </div>
      </div>

      <div className={styles.detailTwoColumnLayout}>
        <div className={styles.detailFormColumn}>
          <div className={styles.contractModernAccordionWrap}>
            {isNewLineItem ? (
              <Accordion
                expanded={expandedPanels.includes("obligatoriska")}
                onChange={() => togglePanel("obligatoriska")}
                className={`${styles.contractModernAccordion} ${styles.lineItemRequiredSection}`}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                  <div className={styles.contractModernAccordionTitleRow}>
                    <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                    <Typography className={styles.contractModernAccordionTitle}>Obligatoriska fält</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className={styles.lineItemRequiredGrid}>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>ArtNr *</Typography>
                      <TextField
                        value={newLineItemDraft.artNr}
                        onChange={(event) => updateDraftField("artNr", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Mängd *</Typography>
                      <TextField
                        value={newLineItemDraft.quantity}
                        onChange={(event) => updateDraftField("quantity", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Pris *</Typography>
                      <TextField
                        value={newLineItemDraft.price}
                        onChange={(event) => updateDraftField("price", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Status *</Typography>
                      <Select
                        value={newLineItemDraft.status}
                        onChange={(event) => updateDraftField("status", String(event.target.value))}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      >
                        <MenuItem value="Aktiv">Aktiv</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Leveransvecka *</Typography>
                      <TextField
                        value={newLineItemDraft.deliveryWeek}
                        onChange={(event) => updateDraftField("deliveryWeek", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Lev.fönster min *</Typography>
                      <TextField
                        value={newLineItemDraft.deliveryWindowMin}
                        onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Lev.fönster max *</Typography>
                      <TextField
                        value={newLineItemDraft.deliveryWindowMax}
                        onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Utsändande bolag *</Typography>
                      <Select
                        value={newLineItemDraft.senderCompany}
                        onChange={(event) => updateDraftField("senderCompany", String(event.target.value))}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      >
                        <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Utsändande lagerställe *</Typography>
                      <Select
                        value={newLineItemDraft.senderWarehouse}
                        onChange={(event) => updateDraftField("senderWarehouse", String(event.target.value))}
                        size="small"
                        className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                      >
                        <MenuItem value="Krokom">Krokom</MenuItem>
                      </Select>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ) : null}

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
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande bolag</Typography>
                    <Select
                      value={newLineItemDraft.senderCompany}
                      onChange={(event) => updateDraftField("senderCompany", String(event.target.value))}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande lagerställe</Typography>
                    <Select
                      value={newLineItemDraft.senderWarehouse}
                      onChange={(event) => updateDraftField("senderWarehouse", String(event.target.value))}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="Krokom">Krokom</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Status</Typography>
                    <Select
                      value={newLineItemDraft.status}
                      onChange={(event) => updateDraftField("status", String(event.target.value))}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="Aktiv">Aktiv</MenuItem>
                    </Select>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("produkt")}
              onChange={() => togglePanel("produkt")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Produkt</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.lineItemRequiredGrid}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leverera artNr</Typography>
                    <TextField
                      value={newLineItemDraft.deliverArtNr}
                      onChange={(event) => updateDraftField("deliverArtNr", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemFieldFull}>
                    <Typography className={styles.searchFieldLabel}>Produkt</Typography>
                    <TextField
                      value={newLineItemDraft.product}
                      onChange={(event) => updateDraftField("product", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Pakettyp</Typography>
                    <Select
                      value={newLineItemDraft.packageType}
                      onChange={(event) => updateDraftField("packageType", String(event.target.value))}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="Lp">Lp</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Längd</Typography>
                    <TextField
                      value={newLineItemDraft.length}
                      onChange={(event) => updateDraftField("length", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("affar")}
              onChange={() => togglePanel("affar")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <GavelOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Affär</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.contractModernFormGrid}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Mängd</Typography>
                    <TextField
                      value={newLineItemDraft.quantity}
                      onChange={(event) => updateDraftField("quantity", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Pris</Typography>
                    <TextField
                      value={newLineItemDraft.price}
                      onChange={(event) => updateDraftField("price", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  {lineItemReadonlyFields.slice(0, 2).map((field) => (
                    <div key={field.label} className={styles.lineItemReadonlyItem}>
                      <Typography className={styles.lineItemReadonlyLabel}>{field.label}</Typography>
                      <Typography className={styles.lineItemReadonlyValue}>{field.value}</Typography>
                    </div>
                  ))}
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
                <div className={styles.contractModernFormGrid}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leveransvecka</Typography>
                    <TextField
                      value={newLineItemDraft.deliveryWeek}
                      onChange={(event) => updateDraftField("deliveryWeek", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster min</Typography>
                    <TextField
                      value={newLineItemDraft.deliveryWindowMin}
                      onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster max</Typography>
                    <TextField
                      value={newLineItemDraft.deliveryWindowMax}
                      onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                </div>
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
                <div className={styles.contractModernFormGrid}>
                  <div className={styles.lineItemReadonlyItem}>
                    <Typography className={styles.lineItemReadonlyLabel}>Dokumentstatus</Typography>
                    <Typography className={styles.lineItemReadonlyValue}>Inga dokument uppladdade</Typography>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
        <div className={styles.detailTabsColumn}>
          <div className={styles.contractModernAdditionsWrap}>
            <Typography className={styles.contractModernAdditionsTitle}>Kontraktsradstillägg</Typography>
            <div className={styles.contractTabBar}>
              {lineItemDetailTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.contractTabButton} ${activeTab === tab ? styles.contractTabButtonActive : ""}`}
                  onClick={() => onChangeTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.contractDetailMainContent}>
              <div className={styles.contractTabPlaceholder}>
                <Typography className={styles.contractInfoValue}>{activeTab} - tabell-/detaljvy för kontraktsrad.</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

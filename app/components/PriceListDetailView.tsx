"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Accordion, AccordionDetails, AccordionSummary, Chip, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { FreightTab } from "./contract-tabs/FreightTab";
import { PrintOptionsTab } from "./contract-tabs/PrintOptionsTab";
import { TermsTab } from "./contract-tabs/TermsTab";
import { ActionRow } from "./shared/ActionRow";
import { DataTable } from "./shared/DataTable";
import styles from "../page.module.scss";

type PriceListDetailViewProps = {
  selectedPriceListId: string;
  onOpenPriceRowDetail: (priceRowId: string) => void;
  onCreatePriceRow: () => void;
};

type PriceListDraft = {
  pricelistId: string;
  copiedFrom: string;
  customer: string;
  customerReference: string;
  externalNumber: string;
  category: string;
  country: string;
  language: string;
  validFrom: string;
  validTo: string;
  status: string;
  createdBy: string;
  createdDate: string;
  noteInternal: string;
  noteExternal: string;
};

const existingDraft: PriceListDraft = {
  pricelistId: "17611",
  copiedFrom: "17364",
  customer: "Norr TräHus",
  customerReference: "",
  externalNumber: "2025/10, NTM TräHus",
  category: "Hus/Industri",
  country: "Sverige",
  language: "Svenska",
  validFrom: "2025-12-19",
  validTo: "2025-12-30",
  status: "Godkänd",
  createdBy: "Hans Hemström",
  createdDate: "2025-12-19",
  noteInternal: "På ordererkännande och fakturor ska anges 100% PEFC",
  noteExternal: "På ordererkännande och fakturor ska anges 100% PEFC"
};

const emptyNewDraft: PriceListDraft = {
  pricelistId: "",
  copiedFrom: "",
  customer: "",
  customerReference: "",
  externalNumber: "",
  category: "Hus/Industri",
  country: "Sverige",
  language: "Svenska",
  validFrom: "",
  validTo: "",
  status: "Utkast",
  createdBy: "",
  createdDate: "",
  noteInternal: "",
  noteExternal: ""
};

const priceRowColumns = [
  { key: "artNr", label: "ArtNr" },
  { key: "produkt", label: "Produkt" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "langd", label: "Längd" },
  { key: "valutyp", label: "Valutyp" },
  { key: "pris", label: "Pris" },
  { key: "valuta", label: "Valuta" },
  { key: "enhet", label: "Enhet" },
  { key: "internKommentar", label: "Intern kommentar" },
  { key: "externKommentar", label: "Extern kommentar" },
  { key: "saljtyp", label: "Säljtyp" },
  { key: "fritext", label: "Frn/o" },
  { key: "nobb", label: "NOBB" },
  { key: "nettoprisM3", label: "Nettopris/m3" }
] as const;

const priceRows: Array<Record<(typeof priceRowColumns)[number]["key"], string>> = Array.from({ length: 18 }).map(
  (_, index) => ({
    artNr: `22022${950 + index}3108`,
    produkt: ["22x95 Furu Trall G4-2 NTR AB", "28x120 Furu Trall G4-2 NTR AB", "34x145 Furu Trall G4-2 NTR AB"][
      index % 3
    ],
    pakettyp: "Lp",
    langd: ["L", "L", "L"][index % 3],
    valutyp: "L",
    pris: `${(9.73 + index * 0.35).toFixed(2)} SEK`,
    valuta: "SEK",
    enhet: "lpm",
    internKommentar: "Eget virke",
    externKommentar: "",
    saljtyp: index % 2 === 0 ? "Ja" : "Nej",
    fritext: index % 2 === 0 ? "x" : "",
    nobb: index % 3 === 0 ? "x" : "",
    nettoprisM3: `${(3713 - index * 23).toString()}`
  })
);

const priceRowActionIcons = {
  Ny: <AddIcon fontSize="small" />,
  "Ta bort": <DeleteOutlineOutlinedIcon fontSize="small" />,
  Kopiera: <ContentCopyOutlinedIcon fontSize="small" />,
  Prislistkalkyl: <TableChartOutlinedIcon fontSize="small" />,
  "Import NOBB": <UploadFileOutlinedIcon fontSize="small" />,
  Inaktivera: <BlockOutlinedIcon fontSize="small" />,
  "Uppdatera listan": <RefreshOutlinedIcon fontSize="small" />
} as const;

const priceRowActions = [
  "Ny",
  "Ta bort",
  "Kopiera",
  "Prislistkalkyl",
  "Import NOBB",
  "Inaktivera",
  "Uppdatera listan"
] as const;

export function PriceListDetailView({
  selectedPriceListId,
  onOpenPriceRowDetail,
  onCreatePriceRow
}: PriceListDetailViewProps) {
  const isNewPriceList = selectedPriceListId === "new";
  const [draft, setDraft] = useState<PriceListDraft>(
    isNewPriceList ? emptyNewDraft : { ...existingDraft, pricelistId: selectedPriceListId }
  );
  const [selectedPriceRowIndex, setSelectedPriceRowIndex] = useState<number | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(
    isNewPriceList ? ["obligatoriska"] : ["allmant"]
  );

  const togglePanel = (panel: string) => {
    setExpandedPanels((previous) =>
      previous.includes(panel) ? previous.filter((item) => item !== panel) : [...previous, panel]
    );
  };

  const updateField = (key: keyof PriceListDraft, value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className={styles.contractDetailPanel}>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>
            {isNewPriceList ? "Ny prislista" : `Prislista ${selectedPriceListId}`}
          </Typography>
          {!isNewPriceList ? <Chip label="Aktiv prislista" size="small" className={styles.contractModernStatusChip} /> : null}
        </div>
        <div className={styles.contractModernTopActions} />
      </div>

      <div className={styles.contractModernSummaryGrid}>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Kund</Typography>
          <Typography className={styles.contractInfoValue}>{draft.customer || "-"}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Status</Typography>
          <Typography className={styles.contractInfoValue}>{draft.status || "-"}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Upprättat av</Typography>
          <Typography className={styles.contractInfoValue}>{draft.createdBy || "-"}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Giltighet</Typography>
          <Typography className={styles.contractInfoValue}>
            {draft.validFrom || "-"} - {draft.validTo || "-"}
          </Typography>
        </div>
      </div>

      <div className={styles.detailTwoColumnLayout}>
        <div className={styles.detailFormColumn}>
          <div className={styles.contractModernAccordionWrap}>
            {isNewPriceList ? (
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
                      <Typography className={styles.searchFieldLabel}>Prislistenr *</Typography>
                      <TextField
                        size="small"
                        value={draft.pricelistId}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("pricelistId", event.target.value)}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Kund *</Typography>
                      <TextField
                        size="small"
                        value={draft.customer}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("customer", event.target.value)}
                      />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Kategori *</Typography>
                      <Select
                        size="small"
                        value={draft.category}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("category", String(event.target.value))}
                      >
                        <MenuItem value="Hus/Industri">Hus/Industri</MenuItem>
                        <MenuItem value="Bygg">Bygg</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Land *</Typography>
                      <Select
                        size="small"
                        value={draft.country}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("country", String(event.target.value))}
                      >
                        <MenuItem value="Sverige">Sverige</MenuItem>
                        <MenuItem value="Norge">Norge</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Språk *</Typography>
                      <Select
                        size="small"
                        value={draft.language}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("language", String(event.target.value))}
                      >
                        <MenuItem value="Svenska">Svenska</MenuItem>
                        <MenuItem value="Norska">Norska</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Status *</Typography>
                      <Select
                        size="small"
                        value={draft.status}
                        className={styles.searchFieldControl}
                        onChange={(event) => updateField("status", String(event.target.value))}
                      >
                        <MenuItem value="Utkast">Utkast</MenuItem>
                        <MenuItem value="Godkänd">Godkänd</MenuItem>
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
                  <TextField label="Prislistenr" size="small" value={draft.pricelistId} onChange={(event) => updateField("pricelistId", event.target.value)} />
                  <TextField label="Kopierat från" size="small" value={draft.copiedFrom} onChange={(event) => updateField("copiedFrom", event.target.value)} />
                  <TextField label="Kund" size="small" value={draft.customer} onChange={(event) => updateField("customer", event.target.value)} />
                  <TextField label="Kundens referens" size="small" value={draft.customerReference} onChange={(event) => updateField("customerReference", event.target.value)} />
                  <TextField label="Externt prislistenr" size="small" value={draft.externalNumber} onChange={(event) => updateField("externalNumber", event.target.value)} />
                  <TextField label="Upprättat av" size="small" value={draft.createdBy} onChange={(event) => updateField("createdBy", event.target.value)} />
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
                <TermsTab />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("frakt")}
              onChange={() => togglePanel("frakt")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <LocalShippingOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Frakt</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <FreightTab />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanels.includes("utskrift")}
              onChange={() => togglePanel("utskrift")}
              className={styles.contractModernAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                <div className={styles.contractModernAccordionTitleRow}>
                  <DescriptionOutlinedIcon className={styles.contractModernAccordionIcon} />
                  <Typography className={styles.contractModernAccordionTitle}>Utskrift</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <PrintOptionsTab />
              </AccordionDetails>
            </Accordion>
          </div>
        </div>

        <div className={styles.detailTabsColumn}>
          <div className={styles.contractModernAdditionsWrap}>
            <Typography className={styles.contractModernAdditionsTitle}>Prisrader</Typography>
            <ActionRow
              items={priceRowActions.map((label) => ({
                label,
                icon: priceRowActionIcons[label],
                enabled: label.includes("Ny") || label.includes("Uppdatera") || selectedPriceRowIndex !== null,
                onClick: label === "Ny" ? onCreatePriceRow : undefined
              }))}
            />
            <div className={styles.contractDetailMainContent}>
              <div className={styles.tableScrollWrap}>
                <div className={styles.tableInner}>
                  <DataTable
                    variant="main"
                    columns={priceRowColumns.map((column) => ({ key: column.key, label: column.label }))}
                    rows={priceRows}
                    rowKey={(row, index) => `${row.artNr}-${index}`}
                    selectedRowIndex={selectedPriceRowIndex}
                    onRowClick={(index) => {
                      setSelectedPriceRowIndex((previous) => (previous === index ? null : index));
                    }}
                    renderCell={(row, column) =>
                      column.key === "artNr" ? (
                        <button
                          type="button"
                          className={styles.contractLinkButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenPriceRowDetail(row.artNr);
                          }}
                        >
                          {row.artNr}
                        </button>
                      ) : (
                        row[column.key as keyof typeof row]
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

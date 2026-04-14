"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import styles from "../page.module.scss";

type PriceListRowDetailViewProps = {
  priceListId: string;
  priceRowId: string;
};

type PriceRowDraft = {
  artNr: string;
  produkt: string;
  fakturatext: string;
  pakettyp: string;
  langd: string;
  bunt: string;
  emballage: string;
  folie: string;
  fakturaEnhet: string;
  pris: string;
  saljtyp: string;
  internKommentar: string;
  externKommentar: string;
  certifiering: string;
  visaKund: boolean;
  kundensArtNr: string;
};

const emptyDraft: PriceRowDraft = {
  artNr: "",
  produkt: "",
  fakturatext: "",
  pakettyp: "Lp",
  langd: "",
  bunt: "",
  emballage: "",
  folie: "",
  fakturaEnhet: "m3 nominell",
  pris: "",
  saljtyp: "Eget virke",
  internKommentar: "",
  externKommentar: "",
  certifiering: "",
  visaKund: false,
  kundensArtNr: ""
};

const existingDraft: PriceRowDraft = {
  artNr: "22022953108100",
  produkt: "22x95 Furu Trall G4-2 NTR AB",
  fakturatext: "",
  pakettyp: "Lp",
  langd: "4,2",
  bunt: "1",
  emballage: "Standard",
  folie: "Nej",
  fakturaEnhet: "m3 nominell",
  pris: "9,73",
  saljtyp: "Eget virke",
  internKommentar: "",
  externKommentar: "",
  certifiering: "",
  visaKund: true,
  kundensArtNr: ""
};

export function PriceListRowDetailView({ priceListId, priceRowId }: PriceListRowDetailViewProps) {
  const isNewPriceRow = priceRowId === "new";
  const [draft, setDraft] = useState<PriceRowDraft>(isNewPriceRow ? emptyDraft : existingDraft);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(
    isNewPriceRow ? ["obligatoriska"] : ["allmant"]
  );

  const togglePanel = (panel: string) => {
    setExpandedPanels((previous) =>
      previous.includes(panel) ? previous.filter((item) => item !== panel) : [...previous, panel]
    );
  };

  const updateField = (key: keyof PriceRowDraft, value: string | boolean) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className={styles.contractDetailPanel}>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>
            {isNewPriceRow ? "Ny prislistrad" : `Prislistrad ${priceRowId}`}
          </Typography>
        </div>
        <div className={styles.contractModernTopActions} />
      </div>

      <div className={styles.contractModernSummaryGrid}>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Prislista</Typography>
          <Typography className={styles.contractInfoValue}>{priceListId}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>ArtNr</Typography>
          <Typography className={styles.contractInfoValue}>{draft.artNr || "-"}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Pakettyp</Typography>
          <Typography className={styles.contractInfoValue}>{draft.pakettyp || "-"}</Typography>
        </div>
        <div className={styles.contractModernSummaryCard}>
          <Typography className={styles.contractInfoLabel}>Pris</Typography>
          <Typography className={styles.contractInfoValue}>{draft.pris || "-"}</Typography>
        </div>
      </div>

      <div className={`${styles.detailTwoColumnLayout} ${styles.detailNoAsideLayout}`}>
        <div className={styles.detailFormColumn}>
          <div className={styles.contractModernAccordionWrap}>
            {isNewPriceRow ? (
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
                      <TextField size="small" value={draft.artNr} className={styles.searchFieldControl} onChange={(event) => updateField("artNr", event.target.value)} />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Produkt *</Typography>
                      <TextField size="small" value={draft.produkt} className={styles.searchFieldControl} onChange={(event) => updateField("produkt", event.target.value)} />
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Pakettyp *</Typography>
                      <Select size="small" value={draft.pakettyp} className={styles.searchFieldControl} onChange={(event) => updateField("pakettyp", String(event.target.value))}>
                        <MenuItem value="Lp">Lp</MenuItem>
                        <MenuItem value="Pk">Pk</MenuItem>
                      </Select>
                    </div>
                    <div className={styles.lineItemField}>
                      <Typography className={styles.searchFieldLabel}>Pris *</Typography>
                      <TextField size="small" value={draft.pris} className={styles.searchFieldControl} onChange={(event) => updateField("pris", event.target.value)} />
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
                  <TextField label="ArtNr" size="small" value={draft.artNr} onChange={(event) => updateField("artNr", event.target.value)} />
                  <TextField label="Produkt" size="small" value={draft.produkt} onChange={(event) => updateField("produkt", event.target.value)} />
                  <TextField label="Fakturatext" size="small" value={draft.fakturatext} onChange={(event) => updateField("fakturatext", event.target.value)} />
                  <Select size="small" value={draft.pakettyp} onChange={(event) => updateField("pakettyp", String(event.target.value))}>
                    <MenuItem value="Lp">Lp</MenuItem>
                    <MenuItem value="Pk">Pk</MenuItem>
                  </Select>
                  <TextField label="Längd" size="small" value={draft.langd} onChange={(event) => updateField("langd", event.target.value)} />
                  <TextField label="Bunt" size="small" value={draft.bunt} onChange={(event) => updateField("bunt", event.target.value)} />
                  <TextField label="Emballage" size="small" value={draft.emballage} onChange={(event) => updateField("emballage", event.target.value)} />
                  <TextField label="Folie" size="small" value={draft.folie} onChange={(event) => updateField("folie", event.target.value)} />
                  <TextField label="Intern kommentar" size="small" value={draft.internKommentar} onChange={(event) => updateField("internKommentar", event.target.value)} />
                  <TextField label="Extern kommentar" size="small" value={draft.externKommentar} onChange={(event) => updateField("externKommentar", event.target.value)} />
                  <TextField label="Certifiering" size="small" value={draft.certifiering} onChange={(event) => updateField("certifiering", event.target.value)} />
                  <TextField label="Kundens ArtNr" size="small" value={draft.kundensArtNr} onChange={(event) => updateField("kundensArtNr", event.target.value)} />
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
      </div>
    </div>
  );
}

"use client";

import { Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import styles from "../../page.module.scss";

const lineItemDetailTabs = [
  "Översikt",
  "Längdfördelning",
  "Periodisering",
  "Nettolager",
  "Avropsrad",
  "Produktionsplanering",
  "Leveransbokade paket",
  "Dokument"
] as const;

export type LineItemDetailTab = (typeof lineItemDetailTabs)[number];

type LineItemDetailViewProps = {
  lineItemId: string;
  activeTab: LineItemDetailTab;
  onChangeTab: (tab: LineItemDetailTab) => void;
  onBack: () => void;
};

export function LineItemDetailView({
  lineItemId,
  activeTab,
  onChangeTab,
  onBack
}: LineItemDetailViewProps) {
  return (
    <div className={styles.lineItemDetailPanel}>
      <div className={styles.contractTabBar}>
        {lineItemDetailTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.contractTabButton} ${
              activeTab === tab ? styles.contractTabButtonActive : ""
            }`}
            onClick={() => onChangeTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.lineItemDetailTopBar}>
        <Typography className={styles.lineItemDetailTitle}>Kontraktsrad {lineItemId}</Typography>
        <Button className={styles.lineItemBackButton} size="small" onClick={onBack}>
          Tillbaka till kontraktsrader
        </Button>
      </div>

      {activeTab === "Översikt" ? (
        <div className={styles.lineItemOverviewContent}>
          <section className={styles.lineItemSectionBox}>
            <Typography className={styles.lineItemSectionTitle}>Allmänt</Typography>
            <div className={styles.lineItemGridThree}>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Utsändande bolag</Typography>
                <Select defaultValue="BP Hissmofors Byggprodukter" size="small" className={styles.searchFieldControl}>
                  <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                </Select>
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Utsändande lagerställe</Typography>
                <Select defaultValue="Krokom" size="small" className={styles.searchFieldControl}>
                  <MenuItem value="Krokom">Krokom</MenuItem>
                </Select>
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Kontraktsnr</Typography>
                <TextField defaultValue="163352" size="small" className={styles.searchFieldControl} />
              </div>
            </div>
          </section>

          <section className={styles.lineItemSectionBox}>
            <Typography className={styles.lineItemSectionTitle}>Produkt</Typography>
            <div className={styles.lineItemGridThree}>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>ArtNr</Typography>
                <TextField defaultValue="2202209500002000" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>ProduktNr</Typography>
                <TextField defaultValue="7295:1:5400" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Leverera artNr</Typography>
                <TextField defaultValue="2202209500002000" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemFieldFull}>
                <Typography className={styles.searchFieldLabel}>Produkt</Typography>
                <TextField defaultValue="22x95 Gran Ytterp" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Pakettyp</Typography>
                <Select defaultValue="Lp" size="small" className={styles.searchFieldControl}>
                  <MenuItem value="Lp">Lp</MenuItem>
                </Select>
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Längd</Typography>
                <TextField defaultValue="5,400" size="small" className={styles.searchFieldControl} />
              </div>
            </div>
          </section>

          <section className={styles.lineItemSectionBox}>
            <Typography className={styles.lineItemSectionTitle}>Affär</Typography>
            <div className={styles.lineItemGridTwo}>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Mängd</Typography>
                <TextField defaultValue="1" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Volym</Typography>
                <TextField defaultValue="3,421 m3" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Pris</Typography>
                <TextField defaultValue="10,29 SEK/lpm" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Belopp</Typography>
                <TextField defaultValue="14 669 SEK" size="small" className={styles.searchFieldControl} />
              </div>
            </div>
          </section>

          <section className={styles.lineItemSectionBox}>
            <Typography className={styles.lineItemSectionTitle}>Leverans</Typography>
            <div className={styles.lineItemGridTwo}>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Leveransvecka</Typography>
                <TextField defaultValue="202550" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Lev.fönster min</Typography>
                <TextField defaultValue="2025-12-05" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Leveransdag</Typography>
                <Select defaultValue="" size="small" className={styles.searchFieldControl}>
                  <MenuItem value="">-</MenuItem>
                </Select>
              </div>
              <div className={styles.lineItemField}>
                <Typography className={styles.searchFieldLabel}>Lev.fönster max</Typography>
                <TextField defaultValue="2025-12-10" size="small" className={styles.searchFieldControl} />
              </div>
            </div>
          </section>

          <section className={styles.lineItemSectionBox}>
            <Typography className={styles.lineItemSectionTitle}>Övrigt</Typography>
            <div className={styles.lineItemGridOne}>
              <div className={styles.lineItemFieldFull}>
                <Typography className={styles.searchFieldLabel}>Intern kommentar</Typography>
                <TextField defaultValue="" size="small" className={styles.searchFieldControl} />
              </div>
              <div className={styles.lineItemFieldFull}>
                <Typography className={styles.searchFieldLabel}>Extern kommentar</Typography>
                <TextField defaultValue="" size="small" className={styles.searchFieldControl} />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.contractTabPlaceholder}>
          <Typography className={styles.contractInfoValue}>
            {activeTab} - innehållsvy för kontraktsrad.
          </Typography>
        </div>
      )}
    </div>
  );
}

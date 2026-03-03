"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
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
type LineItemOverviewMode = "quick" | "all";
type LineItemSectionKey = "allmant" | "produkt" | "affar" | "leverans" | "ovrigt";
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
  senderCompany: "",
  senderWarehouse: "",
  artNr: "",
  quantity: "",
  price: "",
  status: "",
  deliveryWeek: "",
  deliveryWindowMin: "",
  deliveryWindowMax: "",
  deliverArtNr: "",
  product: "",
  packageType: "",
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

function LineItemSection({
  sectionKey,
  title,
  meta,
  isCollapsed,
  onToggle,
  children
}: {
  sectionKey: LineItemSectionKey;
  title: string;
  meta: string;
  isCollapsed: boolean;
  onToggle: (sectionKey: LineItemSectionKey) => void;
  children: ReactNode;
}) {
  return (
    <section className={styles.lineItemSectionBox}>
      <button
        type="button"
        className={styles.lineItemSectionToggle}
        onClick={() => onToggle(sectionKey)}
        aria-expanded={!isCollapsed}
      >
        <span className={styles.lineItemSectionToggleTitle}>{title}</span>
        <span className={styles.lineItemSectionToggleMeta}>{meta}</span>
        <span className={styles.lineItemSectionToggleChevron}>{isCollapsed ? "▸" : "▾"}</span>
      </button>
      {!isCollapsed ? children : null}
    </section>
  );
}

export function LineItemDetailView({
  lineItemId,
  activeTab,
  onChangeTab,
  newDraftSeed,
  onSaveAndCreateNew
}: LineItemDetailViewProps) {
  const isNewLineItem = lineItemId === "new";
  const [newLineItemDraft, setNewLineItemDraft] = useState<NewLineItemDraft>(() => ({
    ...(isNewLineItem ? emptyNewLineItemDraft : existingLineItemDraft),
    ...(isNewLineItem ? newDraftSeed : {})
  }));
  const [overviewMode, setOverviewMode] = useState<LineItemOverviewMode>("quick");
  const [collapsedSections, setCollapsedSections] = useState<Record<LineItemSectionKey, boolean>>({
    allmant: true,
    produkt: true,
    affar: true,
    leverans: true,
    ovrigt: true
  });

  const sectionMeta = useMemo(
    () => ({
      allmant: "2/2 ifyllda",
      produkt: "1/1 obligatoriska ifyllda",
      affar: "2/2 obligatoriska ifyllda",
      leverans: "3/3 obligatoriska ifyllda",
      ovrigt: "0 obligatoriska fält"
    }),
    []
  );

  const readonlyFields = useMemo(
    () =>
      lineItemReadonlyFields.map((field) => ({
        ...field,
        value: isNewLineItem ? "" : field.value
      })),
    [isNewLineItem]
  );

  const updateDraftField = (key: keyof NewLineItemDraft, value: string) => {
    setNewLineItemDraft((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleToggleSection = (sectionKey: LineItemSectionKey) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey]
    }));
  };

  const handleChangeOverviewMode = (nextMode: LineItemOverviewMode) => {
    if (nextMode === overviewMode) {
      return;
    }

    setOverviewMode(nextMode);
    if (nextMode === "quick") {
      setCollapsedSections({
        allmant: true,
        produkt: true,
        affar: true,
        leverans: true,
        ovrigt: true
      });
      return;
    }

    setCollapsedSections({
      allmant: false,
      produkt: false,
      affar: false,
      leverans: false,
      ovrigt: false
    });
  };

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
        <Typography className={styles.lineItemDetailTitle}>
          {isNewLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${lineItemId}`}
        </Typography>
        <div className={styles.lineItemDetailTopActions}>
          <div className={styles.lineItemOverviewModeToggle}>
            <span
              className={`${styles.lineItemOverviewModeLabel} ${
                overviewMode === "quick" ? styles.lineItemOverviewModeLabelActive : ""
              }`}
            >
              Snabbvy
            </span>
            <Switch
              checked={overviewMode === "all"}
              onChange={(_event, checked) => handleChangeOverviewMode(checked ? "all" : "quick")}
              size="small"
              inputProps={{ "aria-label": "Växla mellan snabbvy och alla fält" }}
            />
            <span
              className={`${styles.lineItemOverviewModeLabel} ${
                overviewMode === "all" ? styles.lineItemOverviewModeLabelActive : ""
              }`}
            >
              Alla fält
            </span>
          </div>
          <Button className={styles.lineItemBackButton} size="small" disabled>
            Föregående
          </Button>
          <Button className={styles.lineItemBackButton} size="small" disabled>
            Nästa
          </Button>
          {isNewLineItem ? (
            <Button
              className={styles.lineItemBackButton}
              size="small"
              onClick={() => onSaveAndCreateNew?.(newLineItemDraft)}
            >
              Spara och skapa ny
            </Button>
          ) : null}
        </div>
      </div>

      {activeTab === "Översikt" ? (
        <div className={styles.lineItemOverviewContent}>
          <div className={styles.lineItemOverviewLayout}>
            <div className={styles.lineItemOverviewMain}>
              <section className={`${styles.lineItemSectionBox} ${styles.lineItemRequiredSection}`}>
                <div className={styles.lineItemSectionHeaderRow}>
                  <Typography className={styles.lineItemSectionTitle}>Obligatoriskt att fylla i</Typography>
                  <Typography className={styles.lineItemSectionHeaderMeta}>9/9 ifyllda</Typography>
                </div>
                <div className={styles.lineItemRequiredGrid}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>ArtNr</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.artNr : "2202209500002000"}
                      onChange={(event) => updateDraftField("artNr", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Mängd</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.quantity : "1"}
                      onChange={(event) => updateDraftField("quantity", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Pris</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.price : "10,29 SEK/lpm"}
                      onChange={(event) => updateDraftField("price", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Status</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.status : "Aktiv"}
                      onChange={(event) => updateDraftField("status", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Aktiv">Aktiv</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leveransvecka</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWeek : "202550"}
                      onChange={(event) => updateDraftField("deliveryWeek", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster min</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWindowMin : "2025-12-05"}
                      onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster max</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWindowMax : "2025-12-10"}
                      onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande bolag</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.senderCompany : "BP Hissmofors Byggprodukter"}
                      onChange={(event) => updateDraftField("senderCompany", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande lagerställe</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.senderWarehouse : "Krokom"}
                      onChange={(event) => updateDraftField("senderWarehouse", event.target.value)}
                      size="small"
                      className={`${styles.searchFieldControl} ${styles.lineItemRequiredControl}`}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Krokom">Krokom</MenuItem>
                    </Select>
                  </div>
                </div>
              </section>

              <LineItemSection
                sectionKey="allmant"
                title="Allmänt"
                meta={sectionMeta.allmant}
                isCollapsed={collapsedSections.allmant}
                onToggle={handleToggleSection}
              >
                <div className={styles.lineItemGridTwo}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande bolag</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.senderCompany : "BP Hissmofors Byggprodukter"}
                      onChange={(event) => updateDraftField("senderCompany", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="BP Hissmofors Byggprodukter">BP Hissmofors Byggprodukter</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Utsändande lagerställe</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.senderWarehouse : "Krokom"}
                      onChange={(event) => updateDraftField("senderWarehouse", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Krokom">Krokom</MenuItem>
                    </Select>
                  </div>
                </div>
              </LineItemSection>

              <LineItemSection
                sectionKey="produkt"
                title="Produkt"
                meta={sectionMeta.produkt}
                isCollapsed={collapsedSections.produkt}
                onToggle={handleToggleSection}
              >
                <div className={styles.lineItemGridThree}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>ArtNr</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.artNr : "2202209500002000"}
                      onChange={(event) => updateDraftField("artNr", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leverera artNr</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliverArtNr : "2202209500002000"}
                      onChange={(event) => updateDraftField("deliverArtNr", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemFieldFull}>
                    <Typography className={styles.searchFieldLabel}>Produkt</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.product : "22x95 Gran Ytterp"}
                      onChange={(event) => updateDraftField("product", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Pakettyp</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.packageType : "Lp"}
                      onChange={(event) => updateDraftField("packageType", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="">-</MenuItem>
                      <MenuItem value="Lp">Lp</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Längd</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.length : "5,400"}
                      onChange={(event) => updateDraftField("length", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                </div>
              </LineItemSection>

              <LineItemSection
                sectionKey="affar"
                title="Affär"
                meta={sectionMeta.affar}
                isCollapsed={collapsedSections.affar}
                onToggle={handleToggleSection}
              >
                <div className={styles.lineItemGridTwo}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Mängd</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.quantity : "1"}
                      onChange={(event) => updateDraftField("quantity", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Pris</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.price : "10,29 SEK/lpm"}
                      onChange={(event) => updateDraftField("price", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                </div>
              </LineItemSection>

              <LineItemSection
                sectionKey="leverans"
                title="Leverans"
                meta={sectionMeta.leverans}
                isCollapsed={collapsedSections.leverans}
                onToggle={handleToggleSection}
              >
                <div className={styles.lineItemGridTwo}>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leveransvecka</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWeek : "202550"}
                      onChange={(event) => updateDraftField("deliveryWeek", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster min</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWindowMin : "2025-12-05"}
                      onChange={(event) => updateDraftField("deliveryWindowMin", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Leveransdag</Typography>
                    <Select
                      value={isNewLineItem ? newLineItemDraft.deliveryDay : ""}
                      onChange={(event) => updateDraftField("deliveryDay", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    >
                      <MenuItem value="">-</MenuItem>
                    </Select>
                  </div>
                  <div className={styles.lineItemField}>
                    <Typography className={styles.searchFieldLabel}>Lev.fönster max</Typography>
                    <TextField
                      value={isNewLineItem ? newLineItemDraft.deliveryWindowMax : "2025-12-10"}
                      onChange={(event) => updateDraftField("deliveryWindowMax", event.target.value)}
                      size="small"
                      className={styles.searchFieldControl}
                    />
                  </div>
                </div>
              </LineItemSection>

              {overviewMode === "all" ? (
                <LineItemSection
                  sectionKey="ovrigt"
                  title="Övrigt"
                  meta={sectionMeta.ovrigt}
                  isCollapsed={collapsedSections.ovrigt}
                  onToggle={handleToggleSection}
                >
                  <div className={styles.lineItemGridOne}>
                    <div className={styles.lineItemFieldFull}>
                      <Typography className={styles.searchFieldLabel}>Intern kommentar</Typography>
                      <TextField
                        value={isNewLineItem ? newLineItemDraft.internalComment : ""}
                        onChange={(event) => updateDraftField("internalComment", event.target.value)}
                        size="small"
                        className={styles.searchFieldControl}
                      />
                    </div>
                    <div className={styles.lineItemFieldFull}>
                      <Typography className={styles.searchFieldLabel}>Extern kommentar</Typography>
                      <TextField
                        value={isNewLineItem ? newLineItemDraft.externalComment : ""}
                        onChange={(event) => updateDraftField("externalComment", event.target.value)}
                        size="small"
                        className={styles.searchFieldControl}
                      />
                    </div>
                  </div>
                </LineItemSection>
              ) : null}
            </div>

            <aside className={styles.lineItemOverviewSidePanel}>
              <section className={styles.lineItemSectionBox}>
                <div className={styles.lineItemSectionHeaderRow}>
                  <Typography className={styles.lineItemSectionTitle}>Systemfält (read-only)</Typography>
                  <Typography className={styles.lineItemSectionHeaderMeta}>Automatiskt satta</Typography>
                </div>
                <div className={styles.lineItemReadonlyList}>
                  {readonlyFields.map((field) => (
                    <div key={field.label} className={styles.lineItemReadonlyItem}>
                      <Typography className={styles.lineItemReadonlyLabel}>{field.label}</Typography>
                      <Typography className={styles.lineItemReadonlyValue}>{field.value || "-"}</Typography>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
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

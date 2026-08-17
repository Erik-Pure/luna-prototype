"use client";

import { useState } from "react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import styles from "../page.module.scss";

const ENHET_OPTIONS = ["BP Hissmofors", "BP Kramfors", "BP Bollstabruk"];

const VISA_ITEMS = [
  "Paket", "Kund", "Prislista", "Kontrakt", "Lastorder",
  "Transport", "Faktura", "Sågorder", "Justerorder",
  "Produktionsorder", "Målningsorder",
] as const;

type VisaItem = typeof VISA_ITEMS[number];

const emptyVisa = () =>
  Object.fromEntries(VISA_ITEMS.map((k) => [k, false])) as Record<VisaItem, boolean>;

const defaultVisa = () =>
  Object.fromEntries(VISA_ITEMS.map((k) => [k, true])) as Record<VisaItem, boolean>;

export function KlarSokPanel() {
  const [activeTab, setActiveTab] = useState<"allmant" | "visa">("allmant");
  const [showAllFields, setShowAllFields] = useState(true);
  const [enhet, setEnhet] = useState("");
  const [kundNr, setKundNr] = useState("");
  const [prislisteNr, setPrislisteNr] = useState("");
  const [kontraktsNr, setKontraktsNr] = useState("");
  const [lastorderNr, setLastorderNr] = useState("");
  const [transportNr, setTransportNr] = useState("");
  const [fakturaNr, setFakturaNr] = useState("");
  const [paketNr, setPaketNr] = useState("");
  const [paketNrExact, setPaketNrExact] = useState(false);
  const [orderNr, setOrderNr] = useState("");
  const [aktiv, setAktiv] = useState<true | false | null>(false);
  const [visaValues, setVisaValues] = useState<Record<VisaItem, boolean>>(defaultVisa());

  const cycleAktiv = () =>
    setAktiv((prev) => (prev === null ? true : prev === true ? false : null));

  const toggleVisa = (item: VisaItem) =>
    setVisaValues((prev) => ({ ...prev, [item]: !prev[item] }));

  const clearAll = () => {
    setEnhet(""); setKundNr(""); setPrislisteNr(""); setKontraktsNr("");
    setLastorderNr(""); setTransportNr(""); setFakturaNr("");
    setPaketNr(""); setPaketNrExact(false); setOrderNr(""); setAktiv(false);
    setVisaValues(defaultVisa());
  };

  return (
    <div className={styles.advancedFiltersContainer}>
      <div className={styles.advancedFiltersHeader}>
        <div className={styles.advancedFiltersPresets}>
          <button
            type="button"
            className={`${styles.advancedFiltersPresetBtn} ${activeTab === "allmant" ? styles.advancedFiltersPresetBtnActive : ""}`}
            onClick={() => setActiveTab("allmant")}
          >
            Allmänt
          </button>
          <button
            type="button"
            className={`${styles.advancedFiltersPresetBtn} ${activeTab === "visa" ? styles.advancedFiltersPresetBtnActive : ""}`}
            onClick={() => setActiveTab("visa")}
          >
            Visa
          </button>
        </div>
        <div className={styles.advancedFiltersHeaderActions}>
          <button
            type="button"
            className={styles.advancedFiltersToggleButton}
            onClick={() => setShowAllFields((v) => !v)}
          >
            <KeyboardArrowDownIcon
              className={`${styles.moreFiltersChevron} ${showAllFields ? styles.moreFiltersChevronOpen : ""}`}
            />
            Alla sökfält
          </button>
          <button
            type="button"
            className={styles.advancedFiltersClearIconButton}
            title="Rensa filter"
            aria-label="Rensa filter"
            onClick={clearAll}
          >
            <RestartAltIcon />
          </button>
        </div>
      </div>

      {activeTab === "allmant" && (
        <div className={styles.advancedFiltersBody}>
          <div className={styles.advancedFiltersGrid}>
            <FormControl size="small" className={styles.searchFieldControl}>
              <InputLabel>Enhet</InputLabel>
              <Select
                value={enhet}
                label="Enhet"
                onChange={(e) => setEnhet(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="">-</MenuItem>
                {ENHET_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField size="small" label="Kund/Kundnr" className={styles.searchFieldControl}
              value={kundNr} onChange={(e) => setKundNr(e.target.value)} />

            <TextField size="small" label="PrislisteNr" className={styles.searchFieldControl}
              value={prislisteNr} onChange={(e) => setPrislisteNr(e.target.value)} />

            <TextField size="small" label="KontraktsNr" className={styles.searchFieldControl}
              value={kontraktsNr} onChange={(e) => setKontraktsNr(e.target.value)} />

            {showAllFields && (
              <>
                <TextField size="small" label="LastorderNr" className={styles.searchFieldControl}
                  value={lastorderNr} onChange={(e) => setLastorderNr(e.target.value)} />

                <TextField size="small" label="TransportNr" className={styles.searchFieldControl}
                  value={transportNr} onChange={(e) => setTransportNr(e.target.value)} />

                <TextField size="small" label="FakturaNr" className={styles.searchFieldControl}
                  value={fakturaNr} onChange={(e) => setFakturaNr(e.target.value)} />

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Tooltip title="Exakt sökning på PaketNr" placement="top">
                    <button
                      type="button"
                      className={`${styles.klarSokExactBtn} ${paketNrExact ? styles.klarSokExactBtnActive : ""}`}
                      onClick={() => setPaketNrExact((v) => !v)}
                      aria-label="Exakt sökning på PaketNr"
                      aria-pressed={paketNrExact}
                    >
                      =
                    </button>
                  </Tooltip>
                  <TextField
                    size="small"
                    label="PaketNr"
                    className={styles.searchFieldControl}
                    style={{ flex: 1, minWidth: 0 }}
                    value={paketNr}
                    onChange={(e) => setPaketNr(e.target.value)}
                  />
                </div>

                <TextField size="small" label="OrderNr" className={styles.searchFieldControl}
                  value={orderNr} onChange={(e) => setOrderNr(e.target.value)} />

                <label className={styles.klarSokGridCheckbox} onClick={cycleAktiv}>
                  <Checkbox
                    size="small"
                    checked={aktiv === true}
                    indeterminate={aktiv === false}
                    readOnly
                  />
                  <Typography className={styles.searchCheckboxLabel}>Aktiv</Typography>
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "visa" && (
        <div className={styles.advancedFiltersBody}>
          <div className={styles.advancedCheckboxWrap}>
            {VISA_ITEMS.map((item) => (
              <label key={item} className={styles.searchCheckboxItem}>
                <Checkbox
                  size="small"
                  checked={visaValues[item]}
                  onChange={() => toggleVisa(item)}
                />
                <Typography className={styles.searchCheckboxLabel}>{item}</Typography>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

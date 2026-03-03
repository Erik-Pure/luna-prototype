"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import {
  Button,
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent
} from "@mui/material";
import styles from "../page.module.scss";

type DeliverySearchControl = "text" | "select" | "checkbox";

type DeliverySearchField = {
  key: string;
  label: string;
  control: DeliverySearchControl;
  visible: boolean;
};

type DeliveryColumn = {
  key: string;
  label: string;
  visible: boolean;
  pinned: boolean;
};

type DeliveryRow = Record<string, string>;

const deliverySearchFieldsDefault: DeliverySearchField[] = [
  { key: "avtalstatus", label: "Avtalstatus", control: "select", visible: true },
  { key: "avtalsnr", label: "Avtalsnr", control: "text", visible: true },
  { key: "extKontraktsnr", label: "Ext. kontraktsnr", control: "text", visible: true },
  { key: "ansvarig", label: "Ansvarig", control: "text", visible: true },
  { key: "ansvarigNr", label: "Ansvarig nr", control: "text", visible: true },
  { key: "mottagarland", label: "Mottagarland", control: "select", visible: true },
  { key: "lev", label: "Lev", control: "text", visible: true },
  { key: "avg", label: "Avg", control: "text", visible: true },
  { key: "vecka", label: "Vecka (AABblv)", control: "text", visible: true },
  { key: "leveranssatt", label: "Leveranssätt", control: "select", visible: true },
  { key: "levTidigt", label: "Lev. tidigast", control: "text", visible: true },
  { key: "levSenast", label: "Lev. senast", control: "text", visible: true },
  { key: "saknasPlanned", label: "Saknas planned", control: "checkbox", visible: true },
  { key: "customerPlanned", label: "Customer planned", control: "checkbox", visible: true },
  { key: "loadPlanned", label: "Load planned", control: "checkbox", visible: true }
];

const deliverySearchSelectOptions: Record<string, string[]> = {
  avtalstatus: ["Aktivt", "Inaktivt", "Stoppat", "Alla"],
  mottagarland: ["SE", "NO", "FI", "DK"],
  leveranssatt: ["Bil", "Tåg", "Båt", "Hämtas"]
};

const deliveryColumnsDefault: DeliveryColumn[] = [
  { key: "id", label: "ID", visible: true, pinned: true },
  { key: "avtalstatus", label: "Avtalstatus", visible: true, pinned: false },
  { key: "utsandandeBolag", label: "Utsändande bolag", visible: true, pinned: false },
  { key: "ansvarig", label: "Ansvarig", visible: true, pinned: false },
  { key: "typ", label: "Typ", visible: true, pinned: false },
  { key: "kund", label: "Kund", visible: true, pinned: false },
  { key: "produkt", label: "Produkt", visible: true, pinned: false },
  { key: "platstyp", label: "Platstyp", visible: true, pinned: false },
  { key: "pris", label: "Pris", visible: true, pinned: false },
  { key: "volym", label: "Volym", visible: true, pinned: false },
  { key: "enhet", label: "Enhet", visible: true, pinned: false },
  { key: "nettopris", label: "Nettopris/kg", visible: true, pinned: false },
  { key: "levererad", label: "Levererad", visible: true, pinned: false },
  { key: "avropsnr", label: "Avropsnr", visible: true, pinned: false },
  { key: "nettovolym", label: "Nettovolym", visible: true, pinned: false },
  { key: "lastkod", label: "Lastkod", visible: true, pinned: false },
  { key: "dag", label: "Dag", visible: true, pinned: false },
  { key: "langd", label: "Längd", visible: true, pinned: false },
  { key: "vtlFe", label: "VTL FE", visible: true, pinned: false },
  { key: "produceradVecka", label: "Producerad vecka", visible: true, pinned: false },
  { key: "vecka", label: "Vecka", visible: true, pinned: false },
  { key: "aktiv", label: "Aktiv", visible: true, pinned: false },
  { key: "typ2", label: "Typ 2", visible: true, pinned: false },
  { key: "kundensMarke", label: "Kundens märke", visible: true, pinned: false }
];

const deliveryRows: DeliveryRow[] = Array.from({ length: 34 }).map((_, idx) => ({
  id: `${126700 + idx}`,
  avtalstatus: ["Aktivt", "Inaktivt", "Stoppat"][idx % 3],
  utsandandeBolag: "BP Hissmofors",
  ansvarig: ["JN", "EK", "LM", "AA"][idx % 4],
  typ: ["A", "B", "C"][idx % 3],
  kund: ["XL Bygg", "Derome", "Optimera", "Byggmax"][idx % 4],
  produkt: ["45x170 Furu C24", "22x95 Gran V", "34x145 C24", "95x95 C30"][idx % 4],
  platstyp: ["Ag Frn", "Tp", "Pt"][idx % 3],
  pris: `${230 + idx}`,
  volym: `${(200 + idx * 3).toString()}`,
  enhet: "M3",
  nettopris: `${(43 + (idx % 8)).toString()}`,
  levererad: `${(190 + idx * 2).toString()}`,
  avropsnr: `${2700 + idx}`,
  nettovolym: `${(170 + idx).toString()}`,
  lastkod: `${(10 + (idx % 60)).toString()}`,
  dag: `${(idx % 31) + 1}`,
  langd: ["42", "45", "47", "50"][idx % 4],
  vtlFe: `${(35 + (idx % 15)).toString()}`,
  produceradVecka: `${202545 + (idx % 7)}`,
  vecka: `${202550 + (idx % 6)}`,
  aktiv: idx % 5 === 0 ? "0" : "1",
  typ2: ["A-23", "B-19", "C-11", "A-8"][idx % 4],
  kundensMarke: ["AAA 321 S", "BVG 03", "MHA-12", "CHEVRON"][idx % 4]
}));

const deliveryActionItems = ["Ny", "Ta bort", "Skriv ut", "Kopiera", "Inaktivera", "Ändra pris"];

export function DeliveryListView() {
  const [searchValues, setSearchValues] = useState<Record<string, string | boolean>>({
    avtalstatus: "Aktivt",
    avtalsnr: "",
    extKontraktsnr: "",
    ansvarig: "",
    ansvarigNr: "",
    mottagarland: "",
    lev: "",
    avg: "",
    vecka: "",
    leveranssatt: "",
    levTidigt: "",
    levSenast: "",
    saknasPlanned: false,
    customerPlanned: false,
    loadPlanned: false
  });
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [appliedSearchFields, setAppliedSearchFields] = useState<DeliverySearchField[]>(
    deliverySearchFieldsDefault
  );
  const [draftSearchFields, setDraftSearchFields] = useState<DeliverySearchField[]>(
    deliverySearchFieldsDefault
  );
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [appliedColumns, setAppliedColumns] = useState<DeliveryColumn[]>(deliveryColumnsDefault);
  const [draftColumns, setDraftColumns] = useState<DeliveryColumn[]>(deliveryColumnsDefault);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const searchMenuRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const columnsButtonRef = useRef<HTMLButtonElement | null>(null);

  const orderedVisibleColumns = useMemo(() => {
    const pinned = appliedColumns.filter((column) => column.visible && column.pinned);
    const regular = appliedColumns.filter((column) => column.visible && !column.pinned);
    return [...pinned, ...regular];
  }, [appliedColumns]);

  const visibleSearchFields = useMemo(
    () => appliedSearchFields.filter((field) => field.visible),
    [appliedSearchFields]
  );

  const textSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "text"),
    [visibleSearchFields]
  );

  const selectSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "select"),
    [visibleSearchFields]
  );

  const checkboxSearchFields = useMemo(
    () => visibleSearchFields.filter((field) => field.control === "checkbox"),
    [visibleSearchFields]
  );

  useEffect(() => {
    if (!isColumnsMenuOpen && !isSearchMenuOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSearchMenu = searchMenuRef.current?.contains(target);
      const clickedSearchButton = searchButtonRef.current?.contains(target);
      const clickedInsideColumnsMenu = columnsMenuRef.current?.contains(target);
      const clickedColumnsButton = columnsButtonRef.current?.contains(target);

      if (isSearchMenuOpen && !clickedInsideSearchMenu && !clickedSearchButton) {
        setDraftSearchFields(appliedSearchFields);
        setIsSearchMenuOpen(false);
      }

      if (isColumnsMenuOpen && !clickedInsideColumnsMenu && !clickedColumnsButton) {
        setDraftColumns(appliedColumns);
        setIsColumnsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColumnsMenuOpen, isSearchMenuOpen, appliedColumns, appliedSearchFields]);

  const handleSearchTextChange = (key: string, value: string) => {
    setSearchValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSearchSelectChange = (key: string, event: SelectChangeEvent) => {
    setSearchValues((previous) => ({ ...previous, [key]: event.target.value }));
  };

  const handleSearchCheckboxChange = (key: string, checked: boolean) => {
    setSearchValues((previous) => ({ ...previous, [key]: checked }));
  };

  const openSearchMenu = () => {
    setDraftSearchFields(appliedSearchFields);
    setIsColumnsMenuOpen(false);
    setIsSearchMenuOpen(true);
  };

  const toggleSearchFieldVisibility = (key: string) => {
    setDraftSearchFields((previous) =>
      previous.map((field) => (field.key === key ? { ...field, visible: !field.visible } : field))
    );
  };

  const saveSearchFieldChanges = () => {
    setAppliedSearchFields(draftSearchFields);
    setIsSearchMenuOpen(false);
  };

  const cancelSearchFieldChanges = () => {
    setDraftSearchFields(appliedSearchFields);
    setIsSearchMenuOpen(false);
  };

  const clearSearchFieldChanges = () => {
    setDraftSearchFields((previous) =>
      previous.map((field) => ({
        ...field,
        visible: false
      }))
    );
  };

  const openColumnsMenu = () => {
    setDraftColumns(appliedColumns);
    setIsSearchMenuOpen(false);
    setIsColumnsMenuOpen(true);
  };

  const toggleColumnVisibility = (key: string) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const toggleColumnPin = (key: string) => {
    setDraftColumns((previous) =>
      previous.map((column) =>
        column.key === key ? { ...column, pinned: !column.pinned } : column
      )
    );
  };

  const moveColumn = (key: string, direction: "up" | "down") => {
    setDraftColumns((previous) => {
      const index = previous.findIndex((column) => column.key === key);
      if (index < 0) {
        return previous;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const saveColumnChanges = () => {
    setAppliedColumns(draftColumns);
    setIsColumnsMenuOpen(false);
  };

  const cancelColumnChanges = () => {
    setDraftColumns(appliedColumns);
    setIsColumnsMenuOpen(false);
  };

  const resetColumnChanges = () => {
    setDraftColumns(deliveryColumnsDefault);
  };

  const selectOptionsForField = (key: string) => deliverySearchSelectOptions[key] ?? ["Ja", "Nej"];

  return (
    <>
      <div className={styles.filterRow}>
        <div className={styles.searchFieldsPanel}>
          <div className={styles.searchFieldsContainer}>
            <div className={styles.searchFieldsTopRow}>
              <div className={styles.searchFieldsContent}>
                {textSearchFields.length > 0 ? (
                  <div className={styles.searchFieldsGroup}>
                    <div className={styles.searchFieldsGrid}>
                      {textSearchFields.map((field) => (
                        <div key={field.key} className={styles.searchFieldItem}>
                          <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                          <TextField
                            size="small"
                            className={styles.searchFieldControl}
                            value={String(searchValues[field.key] ?? "")}
                            onChange={(event) => handleSearchTextChange(field.key, event.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectSearchFields.length > 0 ? (
                  <div className={styles.searchFieldsGroup}>
                    <div className={styles.searchFieldsGrid}>
                      {selectSearchFields.map((field) => (
                        <div key={field.key} className={styles.searchFieldItem}>
                          <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                          <Select
                            size="small"
                            className={styles.searchFieldControl}
                            value={String(searchValues[field.key] ?? "")}
                            onChange={(event) => handleSearchSelectChange(field.key, event)}
                            IconComponent={KeyboardArrowDownIcon}
                          >
                            <MenuItem value="">-</MenuItem>
                            {selectOptionsForField(field.key).map((option) => (
                              <MenuItem key={`${field.key}-${option}`} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {checkboxSearchFields.length > 0 ? (
                  <div className={styles.searchFieldsGroup}>
                    <div className={styles.searchCheckboxGrid}>
                      {checkboxSearchFields.map((field) => (
                        <label key={field.key} className={styles.searchCheckboxItem}>
                          <Checkbox
                            size="small"
                            checked={Boolean(searchValues[field.key])}
                            onChange={(event) => handleSearchCheckboxChange(field.key, event.target.checked)}
                          />
                          <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {textSearchFields.length === 0 &&
                selectSearchFields.length === 0 &&
                checkboxSearchFields.length === 0 ? (
                  <div className={`${styles.searchFieldsGroup} ${styles.searchFieldsEmptyGroup}`}>
                    <Typography className={styles.searchFieldLabel}>
                      Inga filter valda. Öppna Sökfält för att visa filter.
                    </Typography>
                  </div>
                ) : null}
              </div>
              <div className={styles.searchFieldsActions}>
                <div className={styles.searchMenuWrapper}>
                  <Button
                    ref={searchButtonRef}
                    className={styles.searchActionButton}
                    variant="outlined"
                    startIcon={<SearchIcon className={styles.searchActionIcon} />}
                    onClick={isSearchMenuOpen ? cancelSearchFieldChanges : openSearchMenu}
                  >
                    Sökfält
                  </Button>

                  {isSearchMenuOpen ? (
                    <div className={styles.searchFieldsDropdown} ref={searchMenuRef}>
                      <div className={styles.searchFieldsDropdownList}>
                        {draftSearchFields.map((field) => (
                          <div key={field.key} className={styles.searchFieldsDropdownRow}>
                            <button
                              type="button"
                              className={styles.searchFieldsDropdownName}
                              onClick={() => toggleSearchFieldVisibility(field.key)}
                            >
                              <Checkbox
                                size="small"
                                checked={field.visible}
                                className={styles.dropdownCheckbox}
                              />
                              <Typography className={styles.searchFieldsDropdownLabel}>
                                {field.label}
                              </Typography>
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className={styles.columnsDropdownFooter}>
                        <Button className={styles.dropdownSave} size="small" onClick={saveSearchFieldChanges}>
                          Spara
                        </Button>
                        <Button className={styles.dropdownCancel} size="small" onClick={cancelSearchFieldChanges}>
                          Avbryt
                        </Button>
                        <Button className={styles.dropdownClear} size="small" onClick={clearSearchFieldChanges}>
                          Rensa
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ruleDivider} />

      <div className={styles.actionRow}>
        {deliveryActionItems.map((label, index) => (
          <div
            key={label}
            className={`${styles.actionItem} ${
              selectedRowId === null && label !== "Ny" ? styles.actionDisabled : styles.actionEnabled
            }`}
          >
            <Typography className={styles.actionLabel}>{label}</Typography>
            {index !== deliveryActionItems.length - 1 ? <span className={styles.actionSeparator} /> : null}
          </div>
        ))}

        <div className={`${styles.rightControlRail} ${styles.rightControlGroup}`}>
          <div className={styles.columnsMenuWrapper}>
            <Button
              ref={columnsButtonRef}
              className={styles.columnsButton}
              variant="outlined"
              size="small"
              startIcon={<ViewColumnOutlinedIcon fontSize="small" />}
              onClick={isColumnsMenuOpen ? cancelColumnChanges : openColumnsMenu}
            >
              Kolumner
            </Button>

            {isColumnsMenuOpen ? (
              <div className={styles.columnsDropdown} ref={columnsMenuRef}>
                <div className={styles.columnsDropdownList}>
                  {draftColumns.map((column, index) => (
                    <div key={column.key} className={styles.columnsDropdownRow}>
                      <button
                        type="button"
                        className={styles.columnsDropdownName}
                        onClick={() => toggleColumnVisibility(column.key)}
                      >
                        <Checkbox size="small" checked={column.visible} className={styles.dropdownCheckbox} />
                        <Typography className={styles.columnsDropdownLabel}>{column.label}</Typography>
                      </button>

                      <div className={styles.columnsDropdownActions}>
                        <IconButton
                          size="small"
                          onClick={() => toggleColumnPin(column.key)}
                          className={`${styles.columnsActionIcon} ${
                            column.pinned ? styles.columnsActionPinned : ""
                          }`}
                        >
                          {column.pinned ? (
                            <PushPinIcon fontSize="inherit" />
                          ) : (
                            <PushPinOutlinedIcon fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          className={styles.columnsActionIcon}
                          onClick={() => moveColumn(column.key, "up")}
                          disabled={index === 0}
                        >
                          <KeyboardArrowUpIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          className={styles.columnsActionIcon}
                          onClick={() => moveColumn(column.key, "down")}
                          disabled={index === draftColumns.length - 1}
                        >
                          <KeyboardArrowDownIcon fontSize="inherit" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.columnsDropdownFooter}>
                  <Button className={styles.dropdownSave} size="small" onClick={saveColumnChanges}>
                    Spara
                  </Button>
                  <Button className={styles.dropdownCancel} size="small" onClick={cancelColumnChanges}>
                    Avbryt
                  </Button>
                  <Button className={styles.dropdownClear} size="small" onClick={resetColumnChanges}>
                    Rensa
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.tablesLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <div className={styles.tableHeader}>
                {orderedVisibleColumns.map((column, columnIndex) => (
                  <Typography
                    key={column.key}
                    className={`${styles.tableHeaderCell} ${
                      columnIndex === 0 ? styles.stickyMainHeaderCell : ""
                    }`}
                  >
                    {column.label}
                  </Typography>
                ))}
              </div>

              {deliveryRows.map((row, idx) => (
                <div
                  key={`${row.id}-${idx}`}
                  className={`${styles.tableRow} ${selectedRowId === idx ? styles.tableRowSelected : ""}`}
                  onClick={() => setSelectedRowId((previous) => (previous === idx ? null : idx))}
                >
                  {orderedVisibleColumns.map((column, columnIndex) => (
                    <Typography
                      key={`${row.id}-${column.key}`}
                      className={`${styles.tableCell} ${columnIndex === 0 ? styles.stickyMainCell : ""}`}
                    >
                      {row[column.key] ?? "-"}
                    </Typography>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>
    </>
  );
}

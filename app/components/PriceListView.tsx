"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, Tooltip } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { ActionRow } from "./shared/ActionRow";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { useColumnManager } from "../hooks/useColumnManager";
import { useRowSelection } from "../hooks/useRowSelection";
import styles from "../page.module.scss";

type PriceListSearchFieldKey =
  | "prislistenr"
  | "artNr"
  | "kund"
  | "upprattatAv"
  | "status"
  | "externPrislistenr"
  | "prisdatumFran"
  | "prisdatumTill"
  | "land"
  | "tillhor";

type PriceListSearchField = {
  key: PriceListSearchFieldKey;
  label: string;
  control: "text" | "date" | "select" | "checkbox";
  visible: boolean;
  favorite: boolean;
};

type PriceListColumnKey =
  | "prislistenr"
  | "externPrislistenr"
  | "kund"
  | "land"
  | "prisdatum"
  | "giltigFrom"
  | "giltigTom"
  | "egenAnmarkning"
  | "status"
  | "upprattatAv"
  | "tillhor";

type PriceListRow = Record<PriceListColumnKey, string>;

type PriceListViewProps = {
  onOpenPriceListDetail: (priceListId: string) => void;
  onCreatePriceList: () => void;
};

const defaultSearchFields: PriceListSearchField[] = [
  { key: "prislistenr", label: "Prislistenr", control: "text", visible: true, favorite: true },
  { key: "artNr", label: "ArtNr", control: "text", visible: true, favorite: true },
  { key: "kund", label: "Kund", control: "select", visible: true, favorite: true },
  { key: "upprattatAv", label: "Upprättat av", control: "select", visible: true, favorite: true },
  { key: "status", label: "Status", control: "select", visible: true, favorite: false },
  { key: "externPrislistenr", label: "Externt prislistenr", control: "text", visible: true, favorite: false },
  { key: "prisdatumFran", label: "Prisdatum från", control: "date", visible: true, favorite: false },
  { key: "prisdatumTill", label: "Prisdatum till", control: "date", visible: true, favorite: false },
  { key: "land", label: "Land", control: "select", visible: true, favorite: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: true, favorite: false },
];

const searchSelectOptions: Partial<Record<PriceListSearchFieldKey, string[]>> = {
  kund: ["Martinsons", "Skogmo Bruk", "Hernes", "JäTre", "Moelv Tre"],
  upprattatAv: ["Per-Ola Engerup", "Erik Högbom", "Hans Hemström"],
  status: ["Godkänd", "Utkast", "Inaktiv"],
  land: ["SE", "NO", "FI", "DK"],
};

const initialSearchValues: Record<PriceListSearchFieldKey, string | boolean> = {
  prislistenr: "",
  artNr: "",
  kund: "",
  upprattatAv: "",
  status: "",
  externPrislistenr: "",
  prisdatumFran: "",
  prisdatumTill: "",
  land: "",
  tillhor: "",
};

const defaultColumns = [
  { key: "prislistenr" as PriceListColumnKey, label: "Prislistenr", visible: true, pinned: true },
  { key: "externPrislistenr" as PriceListColumnKey, label: "Externt prislistenr", visible: true, pinned: false },
  { key: "kund" as PriceListColumnKey, label: "Kund", visible: true, pinned: false },
  { key: "land" as PriceListColumnKey, label: "Land", visible: true, pinned: false },
  { key: "prisdatum" as PriceListColumnKey, label: "Prisdatum", visible: true, pinned: false },
  { key: "giltigFrom" as PriceListColumnKey, label: "Giltig från", visible: true, pinned: false },
  { key: "giltigTom" as PriceListColumnKey, label: "Giltig till", visible: true, pinned: false },
  { key: "egenAnmarkning" as PriceListColumnKey, label: "Egen anmärkning", visible: true, pinned: false },
  { key: "status" as PriceListColumnKey, label: "Status", visible: true, pinned: false },
  { key: "upprattatAv" as PriceListColumnKey, label: "Upprättat av", visible: true, pinned: false },
  { key: "tillhor" as PriceListColumnKey, label: "Tillhör", visible: true, pinned: false },
];

const tableRows: PriceListRow[] = Array.from({ length: 26 }).map((_, idx) => ({
  prislistenr: `${17611 - idx}`,
  externPrislistenr: idx % 3 === 0 ? `2025/10 Region ${idx % 7}` : "-",
  kund: ["Martinsons", "Skogmo Bruk", "Hernes", "JäTre", "Moelv Tre"][idx % 5],
  land: ["SE", "NO", "NO", "NO", "NO"][idx % 5],
  prisdatum: `2025-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 25) + 1).padStart(2, "0")}`,
  giltigFrom: idx % 4 === 0 ? "2025-10-01" : "-",
  giltigTom: idx % 4 === 0 ? "2025-12-31" : "-",
  egenAnmarkning: idx % 6 === 0 ? "Interprislista fr depå" : "-",
  status: "Godkänd",
  upprattatAv: ["Per-Ola Engerup", "Erik Högbom", "Hans Hemström"][idx % 3],
  tillhor: ["Norr TräHus", "Hus/Ind Ovriga", "Bygg Region 3", "Byggmaker HK"][idx % 4],
}));

export function PriceListView({ onOpenPriceListDetail, onCreatePriceList }: PriceListViewProps) {
  const [searchValues, setSearchValues] = useState<Record<PriceListSearchFieldKey, string | boolean>>(initialSearchValues);
  const [draftFields, setDraftFields] = useState<PriceListSearchField[]>(defaultSearchFields);
  const [isTableSearchOpen, setIsTableSearchOpen] = useState(false);
  const [tableSearchValue, setTableSearchValue] = useState("");
  const tableSearchWrapperRef = useRef<HTMLDivElement>(null);
  const tableSearchInputRef = useRef<HTMLInputElement>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const columnsButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);

  const columnsManager = useColumnManager(defaultColumns);
  const rowSelection = useRowSelection();

  const allTextFields = useMemo(
    () => defaultSearchFields.filter((f) => f.control === "text" || f.control === "date"),
    []
  );
  const allSelectFields = useMemo(
    () => defaultSearchFields.filter((f) => f.control === "select"),
    []
  );
  const allCheckboxFields = useMemo(
    () => defaultSearchFields.filter((f) => f.control === "checkbox"),
    []
  );

  const handleToggleFavorite = (key: string) => {
    setDraftFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, favorite: !f.favorite } : f))
    );
  };

  const handleSaveFavoriteKeys = (orderedKeys: string[]) => {
    setDraftFields((prev) => {
      const orderedSet = new Set(orderedKeys);
      const nonFavorites = prev.filter((f) => !orderedSet.has(f.key));
      const favorites = orderedKeys
        .map((key) => prev.find((f) => f.key === key))
        .filter((f): f is PriceListSearchField => f !== undefined)
        .map((f) => ({ ...f, favorite: true }));
      return [...favorites, ...nonFavorites.map((f) => ({ ...f, favorite: false }))];
    });
  };

  const handleClearValues = () => {
    setSearchValues(initialSearchValues);
    setTableSearchValue("");
  };

  const handleToggleTableSearch = () => {
    setIsTableSearchOpen((prev) => {
      if (!prev) setTimeout(() => tableSearchInputRef.current?.focus(), 0);
      return !prev;
    });
  };

  return (
    <>
      <SearchFiltersPanel
        textFields={allTextFields}
        selectFields={allSelectFields}
        checkboxFields={allCheckboxFields}
        allTextFields={allTextFields}
        allSelectFields={allSelectFields}
        allCheckboxFields={allCheckboxFields}
        values={searchValues}
        isMenuOpen={false}
        draftFields={draftFields}
        searchButtonRef={searchButtonRef}
        searchMenuRef={searchPanelRef}
        getSelectOptions={(key) => searchSelectOptions[key as PriceListSearchFieldKey] ?? []}
        useAdvancedFilterLayout
        hideGlobalSearch
        onOpenMenu={() => { }}
        onCancelMenu={() => { }}
        onToggleFieldVisibility={() => { }}
        onToggleFieldFavorite={handleToggleFavorite}
        onSaveFavoriteKeys={handleSaveFavoriteKeys}
        onSaveMenu={() => { }}
        onClearMenu={handleClearValues}
        onClearValues={handleClearValues}
        onTextChange={(key, value) => setSearchValues((prev) => ({ ...prev, [key]: value }))}
        onSelectChange={(key, value) => setSearchValues((prev) => ({ ...prev, [key]: value }))}
        onCheckboxChange={(key, checked) => setSearchValues((prev) => ({ ...prev, [key]: checked }))}
      />

      <ActionRow
        items={[
          {
            label: "Prislista",
            icon: <AddIcon fontSize="small" />,
            tone: "primary",
            onClick: onCreatePriceList,
          },
          {
            label: "Kopiera",
            icon: <ContentCopyIcon fontSize="small" />,
            enabled: rowSelection.hasSelectedRow,
          },
          {
            label: "Avregistrera",
            icon: <RemoveCircleOutlineIcon fontSize="small" />,
            enabled: rowSelection.hasSelectedRow,
          },
        ]}
        rightSlot={
          <>
            <div className={styles.tableSearchWrapper} ref={tableSearchWrapperRef}>
              <Button
                className={`${styles.lineItemsToggleButton} ${isTableSearchOpen || tableSearchValue ? styles.tableSearchButtonActive : ""}`}
                variant="outlined"
                size="small"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleToggleTableSearch}
              >
                Filtrera
              </Button>
              {isTableSearchOpen ? (
                <div className={styles.tableSearchDropdown}>
                  <input
                    ref={tableSearchInputRef}
                    type="text"
                    className={styles.tableSearchDropdownInput}
                    placeholder="Filtrera i tabell..."
                    value={tableSearchValue}
                    onChange={(e) => setTableSearchValue(e.target.value)}
                  />
                  {tableSearchValue ? (
                    <button
                      type="button"
                      className={styles.tableSearchDropdownClear}
                      onClick={() => setTableSearchValue("")}
                      aria-label="Rensa filtrering"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <ColumnManagerDropdown
              isOpen={columnsManager.isOpen}
              columns={columnsManager.draftColumns}
              menuRef={columnsMenuRef}
              buttonRef={columnsButtonRef}
              onOpen={() => columnsManager.open()}
              onCancel={columnsManager.cancel}
              onToggleVisibility={(key) => columnsManager.toggleVisibility(key as PriceListColumnKey)}
              onMove={(key, dir) => columnsManager.move(key as PriceListColumnKey, dir)}
              onSave={columnsManager.save}
              onReset={columnsManager.reset}
              onTogglePin={(key) => columnsManager.togglePin(key as PriceListColumnKey)}
              iconOnly
            />
          </>
        }
      />

      <div className={styles.tablesLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={columnsManager.orderedVisibleColumns}
                rows={tableRows}
                rowKey={(row, index) => `${row.prislistenr}-${index}`}
                selectedRowIndex={rowSelection.selectedRowIndex}
                onRowClick={rowSelection.toggleRowSelection}
                renderCell={(row, column) =>
                  column.key === "prislistenr" ? (
                    <button
                      type="button"
                      className={styles.contractLinkButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenPriceListDetail(row[column.key as PriceListColumnKey] ?? "");
                      }}
                    >
                      {row[column.key as PriceListColumnKey]}
                    </button>
                  ) : (
                    row[column.key as PriceListColumnKey] ?? "-"
                  )
                }
              />
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ActionRow } from "./shared/ActionRow";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { useColumnManager } from "../hooks/useColumnManager";
import { useRowSelection } from "../hooks/useRowSelection";
import { useSearchFields } from "../hooks/useSearchFields";
import styles from "../page.module.scss";

type DeliverySearchField = {
  key: string;
  label: string;
  control: "text" | "select" | "checkbox";
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
  const searchManager = useSearchFields(deliverySearchFieldsDefault, {
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
  const columnsManager = useColumnManager(deliveryColumnsDefault);
  const rowSelection = useRowSelection();
  const searchMenuRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const columnsButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!columnsManager.isOpen && !searchManager.isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSearchMenu = searchMenuRef.current?.contains(target);
      const clickedSearchButton = searchButtonRef.current?.contains(target);
      const clickedInsideColumnsMenu = columnsMenuRef.current?.contains(target);
      const clickedColumnsButton = columnsButtonRef.current?.contains(target);

      if (searchManager.isMenuOpen && !clickedInsideSearchMenu && !clickedSearchButton) {
        searchManager.cancelMenu();
      }

      if (columnsManager.isOpen && !clickedInsideColumnsMenu && !clickedColumnsButton) {
        columnsManager.cancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnsManager, searchManager]);

  const selectOptionsForField = (key: string) => deliverySearchSelectOptions[key] ?? ["Ja", "Nej"];
  const actionItems = deliveryActionItems.map((label) => ({
    label,
    enabled: label === "Ny" || rowSelection.hasSelectedRow
  }));

  return (
    <>
      <SearchFiltersPanel
        textFields={searchManager.textFields}
        selectFields={searchManager.selectFields}
        checkboxFields={searchManager.checkboxFields}
        values={searchManager.values}
        isMenuOpen={searchManager.isMenuOpen}
        draftFields={searchManager.draftFields}
        searchButtonRef={searchButtonRef}
        searchMenuRef={searchMenuRef}
        getSelectOptions={selectOptionsForField}
        onOpenMenu={() => {
          columnsManager.setIsOpen(false);
          searchManager.openMenu();
        }}
        onCancelMenu={searchManager.cancelMenu}
        onToggleFieldVisibility={searchManager.toggleFieldVisibility}
        onSaveMenu={searchManager.saveMenu}
        onClearMenu={searchManager.clearMenu}
        onTextChange={searchManager.updateText}
        onSelectChange={searchManager.updateSelect}
        onCheckboxChange={searchManager.updateCheckbox}
      />

      <div className={styles.ruleDivider} />

      <ActionRow
        items={actionItems}
        rightSlot={
          <ColumnManagerDropdown
            isOpen={columnsManager.isOpen}
            columns={columnsManager.draftColumns}
            menuRef={columnsMenuRef}
            buttonRef={columnsButtonRef}
            onOpen={() => {
              searchManager.setIsMenuOpen(false);
              columnsManager.open();
            }}
            onCancel={columnsManager.cancel}
            onToggleVisibility={columnsManager.toggleVisibility}
            onMove={columnsManager.move}
            onSave={columnsManager.save}
            onReset={columnsManager.reset}
            onTogglePin={columnsManager.togglePin}
          />
        }
      />

      <div className={styles.tablesLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={columnsManager.orderedVisibleColumns}
                rows={deliveryRows}
                rowKey={(row, index) => `${row.id}-${index}`}
                selectedRowIndex={rowSelection.selectedRowIndex}
                onRowClick={rowSelection.toggleRowSelection}
                renderCell={(row, column) => row[column.key] ?? "-"}
              />
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>
    </>
  );
}

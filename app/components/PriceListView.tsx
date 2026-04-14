"use client";

import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { useEffect, useRef } from "react";
import { ActionRow } from "./shared/ActionRow";
import { ColumnManagerDropdown } from "./shared/ColumnManagerDropdown";
import { DataTable } from "./shared/DataTable";
import { SearchFiltersPanel } from "./shared/SearchFiltersPanel";
import { useColumnManager } from "../hooks/useColumnManager";
import { useRowSelection } from "../hooks/useRowSelection";
import { useSearchFields } from "../hooks/useSearchFields";
import styles from "../page.module.scss";

type PriceListSearchField = {
  key: string;
  label: string;
  control: "text" | "select" | "checkbox";
  visible: boolean;
};

type PriceListColumn = {
  key: string;
  label: string;
  visible: boolean;
  pinned: boolean;
};

type PriceListRow = Record<string, string>;

type PriceListViewProps = {
  onOpenPriceListDetail: (priceListId: string) => void;
  onCreatePriceList: () => void;
};

const priceListSearchFieldsDefault: PriceListSearchField[] = [
  { key: "status", label: "Status", control: "select", visible: false },
  { key: "prislistenr", label: "Prislistenr", control: "text", visible: true },
  { key: "externPrislistenr", label: "Externt prislistenr", control: "text", visible: false },
  { key: "prisdatum", label: "Prisdatum", control: "text", visible: false },
  { key: "artNr", label: "ArtNr", control: "text", visible: false },
  { key: "kund", label: "Kund", control: "text", visible: false },
  { key: "land", label: "Land", control: "select", visible: false },
  { key: "upprattatAv", label: "Upprättat av", control: "text", visible: false },
  { key: "tillhor", label: "Tillhör", control: "text", visible: false }
];

const priceListSearchSelectOptions: Record<string, string[]> = {
  status: ["Godkänd", "Utkast", "Inaktiv", "Alla"],
  land: ["SE", "NO", "FI", "DK"]
};

const priceListColumnsDefault: PriceListColumn[] = [
  { key: "prislistenr", label: "Prislistenr", visible: true, pinned: true },
  { key: "externPrislistenr", label: "Externt prislistenr", visible: true, pinned: false },
  { key: "kund", label: "Kund", visible: true, pinned: false },
  { key: "land", label: "Land", visible: true, pinned: false },
  { key: "prisdatum", label: "Prisdatum", visible: true, pinned: false },
  { key: "giltigFrom", label: "Giltig f.o.m.", visible: true, pinned: false },
  { key: "giltigTom", label: "Giltig t.o.m.", visible: true, pinned: false },
  { key: "egenAnmarkning", label: "Egen anmärkning", visible: true, pinned: false },
  { key: "status", label: "Status", visible: true, pinned: false },
  { key: "upprattatAv", label: "Upprättat av", visible: true, pinned: false },
  { key: "tillhor", label: "Tillhör", visible: true, pinned: false }
];

const priceListRows: PriceListRow[] = Array.from({ length: 26 }).map((_, idx) => ({
  prislistenr: `${17611 - idx}`,
  externPrislistenr: idx % 3 === 0 ? `2025/10 Region ${idx % 7}` : "-",
  kund: ["Martinsons", "Skogmo Bruk", "Hernes", "JäTre", "Moelv Tre"][idx % 5],
  land: ["SE", "NO", "NO", "NO", "NO"][idx % 5],
  prisdatum: `2025-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 25) + 1).padStart(2, "0")}`,
  giltigFrom: idx % 4 === 0 ? "2025-10-01" : "",
  giltigTom: idx % 4 === 0 ? "2025-12-31" : "",
  egenAnmarkning: idx % 6 === 0 ? "Interprislista fr depå" : "",
  status: "Godkänd",
  upprattatAv: ["Per-Ola Engerup", "Erik Högbom", "Hans Hemström"][idx % 3],
  tillhor: ["Norr TräHus", "Hus/Ind Ovriga", "Bygg Region 3", "Byggmaker HK"][idx % 4]
}));

const priceListActionItems = ["Ny", "Ta bort", "Skriv ut", "Kopiera", "Inaktivera", "Ändra pris"];
const priceListActionIcons: Record<string, JSX.Element> = {
  Ny: <AddIcon fontSize="small" />,
  "Ta bort": <DeleteOutlineOutlinedIcon fontSize="small" />,
  "Skriv ut": <PrintOutlinedIcon fontSize="small" />,
  Kopiera: <ContentCopyOutlinedIcon fontSize="small" />,
  Inaktivera: <BlockOutlinedIcon fontSize="small" />,
  "Ändra pris": <EditOutlinedIcon fontSize="small" />
};

export function PriceListView({ onOpenPriceListDetail, onCreatePriceList }: PriceListViewProps) {
  const searchManager = useSearchFields(priceListSearchFieldsDefault, {
    status: "Godkänd",
    prislistenr: "",
    externPrislistenr: "",
    prisdatum: "",
    artNr: "",
    kund: "",
    land: "",
    upprattatAv: "",
    tillhor: ""
  });
  const columnsManager = useColumnManager(priceListColumnsDefault);
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

  const selectOptionsForField = (key: string) => priceListSearchSelectOptions[key] ?? ["Ja", "Nej"];
  const actionItems = priceListActionItems.map((label) => ({
    label,
    icon: priceListActionIcons[label],
    enabled: label === "Ny" || rowSelection.hasSelectedRow,
    onClick: label === "Ny" ? onCreatePriceList : undefined
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
                rows={priceListRows}
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
                        onOpenPriceListDetail(row[column.key] ?? "");
                      }}
                    >
                      {row[column.key]}
                    </button>
                  ) : (
                    row[column.key] ?? "-"
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

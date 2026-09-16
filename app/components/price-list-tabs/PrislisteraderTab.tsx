"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";

type PrislisteradRow = {
  _id: string;
  artNr: string;
  produkt: string;
  pakettyp: string;
  langd: string;
  varutyp: string;
  pris: string;
  valuta: string;
  enhet: string;
  internKommentar: string;
  externKommentar: string;
  saljtyp: string;
  finfo: boolean;
  nobb: boolean;
  nettoprisM3: string;
};

const COLUMNS = [
  { key: "_id", label: "Prislisterad ID", pinned: true, width: 110 },
  { key: "artNr", label: "ArtNr", width: 130 },
  { key: "produkt", label: "Produkt", width: 220 },
  { key: "pakettyp", label: "Pakettyp", width: 80 },
  { key: "langd", label: "Längd", width: 70 },
  { key: "varutyp", label: "Varutyp", width: 104 },
  { key: "pris", label: "Pris", width: 76 },
  { key: "valuta", label: "Valuta", width: 70 },
  { key: "enhet", label: "Enhet", width: 68 },
  { key: "internKommentar", label: "Intern kommentar", width: 150 },
  { key: "externKommentar", label: "Extern kommentar", width: 150 },
  { key: "saljtyp", label: "Säljtyp", width: 88 },
  { key: "finfo", label: "Finfo", width: 68 },
  { key: "nobb", label: "NOBB", width: 68 },
  { key: "nettoprisM3", label: "Nettopris/m3", width: 104 },
] satisfies Array<{ key: string; label: string; pinned?: boolean; pinnedRight?: boolean; width?: number }>;

const INITIAL_ROWS: PrislisteradRow[] = [
  { _id: "4840940", artNr: "22022953108100", produkt: "22x95 Furu Trall G4-2 NTR AB", pakettyp: "Lp", langd: "4,2", varutyp: "Trall", pris: "9,73", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: true, nobb: false, nettoprisM3: "9,73" },
  { _id: "4840941", artNr: "22028003108100", produkt: "22x100 Gran Hyvlad T2 AB", pakettyp: "Lp", langd: "3,6", varutyp: "Panel", pris: "8,50", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: false, nobb: true, nettoprisM3: "8,50" },
  { _id: "4840942", artNr: "44025003100000", produkt: "44x100 Furu Konstruktionsvirke C18", pakettyp: "Pk", langd: "4,8", varutyp: "Konstruktion", pris: "11,20", valuta: "SEK", enhet: "m3", internKommentar: "Kampanjpris", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: false, nettoprisM3: "11,20" },
  { _id: "4840945", artNr: "44025003100001", produkt: "44x100 Furu Konstruktionsvirke C18", pakettyp: "Pk", langd: "4,2", varutyp: "Konstruktion", pris: "11,20", valuta: "SEK", enhet: "m3", internKommentar: "Kampanjpris", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: false, nettoprisM3: "11,20" },
  { _id: "4840946", artNr: "44025003100002", produkt: "44x100 Furu Konstruktionsvirke C18", pakettyp: "Pk", langd: "3,6", varutyp: "Konstruktion", pris: "11,45", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: false, nettoprisM3: "11,45" },
  { _id: "4840947", artNr: "44025003100003", produkt: "44x100 Furu Konstruktionsvirke C18", pakettyp: "Pk", langd: "3,0", varutyp: "Konstruktion", pris: "11,80", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: false, nettoprisM3: "11,80" },
  { _id: "4840943", artNr: "50015002500000", produkt: "50x150 Gran Konstruktionsvirke C24", pakettyp: "Pk", langd: "5,4", varutyp: "Konstruktion", pris: "13,45", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: true, nobb: true, nettoprisM3: "13,45" },
  { _id: "4840948", artNr: "50015002500001", produkt: "50x150 Gran Konstruktionsvirke C24", pakettyp: "Pk", langd: "4,8", varutyp: "Konstruktion", pris: "13,45", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: true, nobb: true, nettoprisM3: "13,45" },
  { _id: "4840949", artNr: "50015002500002", produkt: "50x150 Gran Konstruktionsvirke C24", pakettyp: "Pk", langd: "4,2", varutyp: "Konstruktion", pris: "13,70", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: true, nobb: true, nettoprisM3: "13,70" },
  { _id: "4840944", artNr: "28012703600000", produkt: "28x127 Furu Panel T1-3 AB", pakettyp: "Lp", langd: "3,9", varutyp: "Panel", pris: "10,80", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "Inkl. frakt", saljtyp: "Lager", finfo: false, nobb: false, nettoprisM3: "10,80" },
  { _id: "4840950", artNr: "47095032108100", produkt: "47x95 Gran Regel G4-2 Lp", pakettyp: "Lp", langd: "4,2", varutyp: "Konstruktion", pris: "9,95", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: true, nettoprisM3: "9,95" },
  { _id: "4840951", artNr: "34095032108100", produkt: "34x95 Gran Trall Slät", pakettyp: "Lp", langd: "4,2", varutyp: "Trall", pris: "12,10", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: true, nobb: false, nettoprisM3: "12,10" },
  { _id: "4840952", artNr: "28120032108100", produkt: "28x120 Gran Trall Räfflad", pakettyp: "Lp", langd: "4,8", varutyp: "Trall", pris: "11,60", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: true, nettoprisM3: "11,60" },
  { _id: "4840953", artNr: "22120032108100", produkt: "22x120 Furu Panel Lock", pakettyp: "Lp", langd: "3,9", varutyp: "Panel", pris: "9,40", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: false, nobb: false, nettoprisM3: "9,40" },
  { _id: "4840954", artNr: "45145032108100", produkt: "45x145 Gran Regel G4-2 Lp", pakettyp: "Lp", langd: "5,1", varutyp: "Konstruktion", pris: "10,75", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: true, nobb: true, nettoprisM3: "10,75" },
  { _id: "4840955", artNr: "45195032108100", produkt: "45x195 Gran Regel G4-2 Lp", pakettyp: "Lp", langd: "6,0", varutyp: "Konstruktion", pris: "12,30", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Order", finfo: false, nobb: false, nettoprisM3: "12,30" },
  { _id: "4840956", artNr: "19100032108100", produkt: "19x100 Furu Panel Fasspont", pakettyp: "Lp", langd: "3,6", varutyp: "Panel", pris: "8,90", valuta: "SEK", enhet: "m3", internKommentar: "", externKommentar: "", saljtyp: "Lager", finfo: false, nobb: true, nettoprisM3: "8,90" },
  { _id: "4840957", artNr: "28070032108100", produkt: "28x70 Furu Ribb Målad", pakettyp: "Lp", langd: "3,3", varutyp: "Panel", pris: "14,20", valuta: "SEK", enhet: "m3", internKommentar: "Målad", externKommentar: "", saljtyp: "Order", finfo: true, nobb: false, nettoprisM3: "14,20" },
];

const parseSwedishNumber = (value: string): number => {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// Default sort: Produkt (fakturatext) first, then ascending Längd within each produkt (no user-facing sort controls).
INITIAL_ROWS.sort((a, b) =>
  a.produkt.localeCompare(b.produkt, "sv") || parseSwedishNumber(a.langd) - parseSwedishNumber(b.langd)
);

type PrislisteraderTabProps = {
  onOpenPriceRowDetail: (priceRowId: string) => void;
  onCreatePriceRow: () => void;
  onOpenPrislistekalkyl: () => void;
};

export function PrislisteraderTab({ onOpenPriceRowDetail, onCreatePriceRow, onOpenPrislistekalkyl }: PrislisteraderTabProps) {
  const [rows] = useState<PrislisteradRow[]>(INITIAL_ROWS);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasSelectedRow = selectedRowIndex !== null;

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 0);
      return !prev;
    });
  };

  const filteredRows = filterValue
    ? rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(filterValue.toLowerCase()))
    )
    : rows;

  return (
    <>
      <ActionRow
        items={[
          {
            label: "Prislisterad",
            icon: <AddIcon fontSize="small" />,
            tone: "primary",
            onClick: onCreatePriceRow,
          },
          {
            label: "Kopiera",
            icon: <ContentCopyIcon fontSize="small" />,
            enabled: hasSelectedRow,
          },
          { kind: "divider" },
          {
            label: "Prislistekalkyl",
            onClick: onOpenPrislistekalkyl,
          },
          {
            label: "Import NOBB",
          },
        ]}
        rightSlot={
          <>
            <div className={styles.tableSearchWrapper} ref={searchWrapperRef}>
              <Button
                className={`${styles.lineItemsToggleButton} ${isSearchOpen || filterValue ? styles.tableSearchButtonActive : ""}`}
                variant="outlined"
                size="small"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleToggleSearch}
              >
                Filtrera
              </Button>
              {isSearchOpen ? (
                <div className={styles.tableSearchDropdown}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.tableSearchDropdownInput}
                    placeholder="Filtrera i tabell..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                  {filterValue ? (
                    <button
                      type="button"
                      className={styles.tableSearchDropdownClear}
                      onClick={() => setFilterValue("")}
                      aria-label="Rensa filtrering"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Tooltip title="Uppdatera" placement="top">
              <IconButton size="small" className={styles.contractHeaderDotsButton}>
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        }
      />
      <div className={styles.tablesLayout}>
        <div className={`${styles.tableContainer} ${styles.contractTableCompact}`}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={COLUMNS}
                rows={filteredRows}
                rowKey={(row) => row._id}
                selectedRowIndex={selectedRowIndex}
                onRowClick={(idx) => setSelectedRowIndex((prev) => prev === idx ? null : idx)}
                renderCell={(row, col) => {
                  if (col.key === "_id") {
                    return (
                      <button
                        type="button"
                        className={styles.contractLinkButton}
                        onClick={(e) => { e.stopPropagation(); onOpenPriceRowDetail(row._id); }}
                      >
                        {row._id}
                      </button>
                    );
                  }
                  if (col.key === "finfo") return row.finfo ? "Ja" : "";
                  if (col.key === "nobb") return row.nobb ? "Ja" : "";
                  const val = row[col.key as keyof PrislisteradRow];
                  return typeof val === "boolean" ? "" : (val || "-");
                }}
              />
            </div>
          </div>
          <div className={styles.tableFiller} />
        </div>
      </div>
    </>
  );
}

"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Button, IconButton } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../../shared/DataTable";
import { DetailHeader } from "../../shared/DetailHeader";
import { AVROPSRAD_COLUMNS, INITIAL_AVROPSRADER, type AvropsradRow } from "../CallOffTab";
import { PaketbokningDialog } from "../PaketbokningDialog";
import { type BokadPaketRow } from "../PaketbokningView";
import styles from "../../../page.module.scss";

const AVROPSRADER_TAB_COLUMNS = AVROPSRAD_COLUMNS;

type BokadPaketColumnKey = keyof BokadPaketRow | "_actions";

const BOKADE_PAKET_COLUMNS: Array<{ key: BokadPaketColumnKey; label: string; pinnedRight?: boolean; width?: number }> = [
  { key: "paketnr", label: "Paketnr" },
  { key: "lpm", label: "Lpm" },
  { key: "produkt", label: "Produkt" },
  { key: "lagerstalle", label: "Lagerställe" },
  { key: "lagerplats", label: "Lagerplats" },
  { key: "mdlangd", label: "Mdllängd" },
  { key: "skaLastasUt", label: "Ska lastas ut" },
  { key: "_actions", label: "", pinnedRight: true, width: 48 },
];

const INITIAL_BOKADE_PAKET: BokadPaketRow[] = [
  { paketnr: "15134", lpm: "123", produkt: "5x150 Furu Svarvad Stolp", lagerstalle: "Krokom", lagerplats: "A1-01", mdlangd: "123", skaLastasUt: "Ja" },
];

type LineItemAvropsraderTabProps = {
  produkt?: string;
  orderedUnit?: string;
  onCreateAvropsrad?: () => void;
  onOpenAvropsrad?: (id: string, data?: Record<string, string>) => void;
};

export function LineItemAvropsraderTab({ produkt, orderedUnit, onCreateAvropsrad, onOpenAvropsrad }: LineItemAvropsraderTabProps) {
  const [avropsrader] = useState<AvropsradRow[]>(INITIAL_AVROPSRADER);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [leveransbokaForRow, setLeveransbokaForRow] = useState<number | null>(null);
  const [isPaketbokningOpen, setIsPaketbokningOpen] = useState(false);
  const [bokadePaketRows, setBokadePaketRows] = useState<BokadPaketRow[]>(INITIAL_BOKADE_PAKET);

  const bokadRad = leveransbokaForRow !== null ? avropsrader[leveransbokaForRow] : null;

  const addBokadePaket = (rows: BokadPaketRow[]) => {
    setBokadePaketRows((previous) => [...previous, ...rows]);
    setIsPaketbokningOpen(false);
  };

  // ── Leveransbokade paket för vald avropsrad ──
  if (bokadRad) {
    return (
      <>
        <DetailHeader
          entity="contract"
          label={null}
          hideIcon
          compact
          title={`Leveransbokade paket – avropsrad ${bokadRad.avropsradNr}`}
          onBack={() => setLeveransbokaForRow(null)}
        />
        <div style={{ padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <Button
              className={styles.freightNewButton}
              startIcon={<Inventory2OutlinedIcon />}
              size="small"
              onClick={() => setIsPaketbokningOpen(true)}
            >
              Hantera paket
            </Button>
          </div>
          <div className={styles.bokadePaketTableWrap}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={BOKADE_PAKET_COLUMNS}
              rows={bokadePaketRows}
              rowKey={(row, index) => `bokat-paket-${row.paketnr}-${index}`}
              selectedRowIndex={null}
              onRowClick={() => undefined}
              renderCell={(row, column, rowIndex) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setBokadePaketRows((previous) => previous.filter((_, index) => index !== rowIndex));
                        }}
                        title="Ta bort"
                      >
                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                return row[column.key as keyof BokadPaketRow] || "-";
              }}
            />
          </div>
          <div className={styles.bokadePaketFooter}>
            <span className={styles.bokadePaketStat}>
              <span className={styles.bokadePaketStatLabel}>Summa lpm</span>
              <span className={styles.bokadePaketStatValue}>
                {bokadePaketRows.reduce((sum, row) => sum + (Number(row.lpm) || 0), 0).toFixed(1)}
              </span>
            </span>
            <span className={styles.bokadePaketStat}>
              <span className={styles.bokadePaketStatLabel}>Antal paket</span>
              <span className={styles.bokadePaketStatValue}>{bokadePaketRows.length}</span>
            </span>
          </div>
        </div>
        <PaketbokningDialog
          open={isPaketbokningOpen}
          title={`Paketbokning – avropsrad ${bokadRad.avropsradNr}${bokadRad.fakturatext ? ` · ${bokadRad.fakturatext}` : ""}`}
          initialReservationstyp="Avroprad"
          produkt={bokadRad.fakturatext || produkt || undefined}
          volym={bokadRad.volym || undefined}
          enhet={bokadRad.enhet || orderedUnit || undefined}
          onClose={() => setIsPaketbokningOpen(false)}
          onReservera={addBokadePaket}
          onSkaLastasUt={addBokadePaket}
        />
      </>
    );
  }

  // ── Avropsrader ──
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Button
          className={styles.freightNewButton}
          startIcon={<AddIcon />}
          onClick={onCreateAvropsrad}
        >
          Avropsrad
        </Button>
        <Button
          className={styles.freightCancelButton}
          startIcon={<Inventory2OutlinedIcon />}
          disabled={selectedRow === null}
          title={selectedRow === null ? "Välj en avropsrad först" : undefined}
          onClick={() => {
            if (selectedRow !== null) setLeveransbokaForRow(selectedRow);
          }}
        >
          Leveransboka paket
        </Button>
      </div>
      <div className={styles.lineItemsTableFrame}>
        <div className={styles.freightTableWrap}>
          <div className={styles.freightTable}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={AVROPSRADER_TAB_COLUMNS}
              rows={avropsrader as unknown as Array<Record<string, string | undefined>>}
              rowKey={(_row, index) => `avropsrad-${index}`}
              selectedRowIndex={selectedRow}
              onRowClick={(index) => setSelectedRow((previous) => (previous === index ? null : index))}
              renderCell={(row, column) => {
                if (column.key === "avropsradNr") {
                  return (
                    <button
                      type="button"
                      className={`${styles.lineItemLinkButton} ${styles.lineItemLinkButtonStretched}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenAvropsrad?.(row.avropsradNr ?? "", row as Record<string, string>);
                      }}
                    >
                      {row.avropsradNr}
                    </button>
                  );
                }
                return row[column.key] || "-";
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

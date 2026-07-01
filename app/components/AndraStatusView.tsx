"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { ActionRow } from "./shared/ActionRow";
import { DataTable } from "./shared/DataTable";
import styles from "../page.module.scss";

type AndraStatusRow = {
  avropradNr: string;
  status: string;
  kontraktsNr: string;
  kortNamn: string;
  kundmarke: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  mangd: string;
  enhet: string;
  leveransvecka: string;
};

const COLUMNS = [
  { key: "__checkbox__", label: "", width: 40 },
  { key: "avropradNr", label: "Avroprad Nr", pinned: true as const },
  { key: "status", label: "Status" },
  { key: "kontraktsNr", label: "KontraktsNr" },
  { key: "kortNamn", label: "KortNamn" },
  { key: "kundmarke", label: "Kundmärke" },
  { key: "artNr", label: "ArtNr" },
  { key: "fakturatext", label: "Fakturatext" },
  { key: "pakettyp", label: "Pakettyp" },
  { key: "mangd", label: "Mängd" },
  { key: "enhet", label: "Enhet" },
  { key: "leveransvecka", label: "Leveransvecka" },
];

const ROWS: AndraStatusRow[] = [
  { avropradNr: "001", status: "Planerad", kontraktsNr: "K-2024-001", kortNamn: "XLBYG", kundmarke: "XLB-REF", artNr: "22120", fakturatext: "Gran flisad spå", pakettyp: "LP", mangd: "50", enhet: "m3", leveransvecka: "26" },
  { avropradNr: "002", status: "Bekräftad", kontraktsNr: "K-2024-002", kortNamn: "DEROM", kundmarke: "DER-REF2", artNr: "22122", fakturatext: "Gran v-styrp", pakettyp: "Kapping", mangd: "40", enhet: "m3", leveransvecka: "27" },
  { avropradNr: "003", status: "Levererad", kontraktsNr: "K-2024-003", kortNamn: "OPTIM", kundmarke: "OPT-C3", artNr: "22124", fakturatext: "Furu hyvlad", pakettyp: "Halvlängd", mangd: "30", enhet: "m3", leveransvecka: "28" },
  { avropradNr: "004", status: "Planerad", kontraktsNr: "K-2024-001", kortNamn: "XLBYG", kundmarke: "XLB-REF2", artNr: "22121", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "LP", mangd: "25", enhet: "m3", leveransvecka: "26" },
  { avropradNr: "005", status: "Planerad", kontraktsNr: "K-2024-004", kortNamn: "BXMAX", kundmarke: "BXM-001", artNr: "22125", fakturatext: "Furu konstruktion", pakettyp: "LP", mangd: "60", enhet: "m3", leveransvecka: "29" },
  { avropradNr: "006", status: "Bekräftad", kontraktsNr: "K-2024-002", kortNamn: "DEROM", kundmarke: "DER-REF3", artNr: "22123", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", mangd: "35", enhet: "m3", leveransvecka: "27" },
];

const AVROPRADSTATUS_OPTIONS = [
  "Sales planned",
  "Customer planned",
  "Load planned",
  "Planerad",
  "Bekräftad",
  "Levererad",
  "Avregistrerad",
];

type AndraStatusViewProps = {
  onBack: () => void;
};

export function AndraStatusView({ onBack }: AndraStatusViewProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avropradstatus, setAvropradstatus] = useState("");
  const [leveransvecka, setLeveransvecka] = useState("");
  const [statusError, setStatusError] = useState(false);

  const toggleRow = (i: number) => setSelectedRows((prev) => {
    const next = new Set(prev);
    if (next.has(i)) { next.delete(i); } else { next.add(i); }
    return next;
  });

  const allSelected = ROWS.length > 0 && selectedRows.size === ROWS.length;
  const indeterminate = selectedRows.size > 0 && selectedRows.size < ROWS.length;

  const openDialog = () => {
    setAvropradstatus("");
    setLeveransvecka("");
    setStatusError(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!avropradstatus) {
      setStatusError(true);
      return;
    }
    setDialogOpen(false);
    setSelectedRows(new Set());
  };

  return (
    <>
      <div className={styles.contractModernTopRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton size="small" onClick={onBack} title="Tillbaka">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography className={styles.contractModernTitle}>Ändra status</Typography>
        </div>
        <div />
      </div>

      <div className={styles.deliveryRowsTableSection} style={{ marginTop: 8 }}>
        <ActionRow
          items={[
            {
              label: "Ändra status",
              tone: "primary",
              enabled: selectedRows.size > 0,
              onClick: openDialog,
            },
          ]}
        />

        <div className={styles.tableContainer}>
          <div className={styles.tableScrollWrap}>
            <div className={styles.tableInner}>
              <DataTable
                variant="main"
                columns={COLUMNS}
                rows={ROWS}
                rowKey={(_, i) => String(i)}
                selectedRowIndices={selectedRows}
                onRowClick={(i) => toggleRow(i)}
                renderHeaderCell={(column) => {
                  if (column.key === "__checkbox__") {
                    return (
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={indeterminate}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => setSelectedRows(allSelected ? new Set() : new Set(ROWS.map((_, i) => i)))}
                      />
                    );
                  }
                  return column.label;
                }}
                renderCell={(row, column, rowIndex) => {
                  if (column.key === "__checkbox__") {
                    return (
                      <Checkbox
                        size="small"
                        checked={selectedRows.has(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleRow(rowIndex)}
                      />
                    );
                  }
                  return (row as Record<string, string>)[column.key];
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { className: styles.freightDialogPaper } }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Ändra status</Typography>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          <TextField
            label="Antal valda avropsrader"
            value={selectedRows.size}
            size="small"
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <FormControl size="small" fullWidth error={statusError} className={styles.requiredFieldControl}>
            <InputLabel>Avropradstatus</InputLabel>
            <Select
              label="Avropradstatus"
              value={avropradstatus}
              onChange={(e) => { setAvropradstatus(e.target.value); setStatusError(false); }}
            >
              {AVROPRADSTATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
            {statusError && <FormHelperText>Obligatoriskt fält</FormHelperText>}
          </FormControl>
          <TextField
            label="Leveransvecka"
            value={leveransvecka}
            size="small"
            fullWidth
            helperText="Ändras inte om värde saknas"
            onChange={(e) => setLeveransvecka(e.target.value)}
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button variant="contained" size="small" className={styles.bytPrislistaOkButton} onClick={handleSave}>
            Spara
          </Button>
          <Button variant="outlined" size="small" className={styles.bytPrislistaAvbrytButton} onClick={() => setDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

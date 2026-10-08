"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../../shared/DataTable";
import styles from "../../../page.module.scss";

type LengthDistributionRow = {
  id: string;
  langd: string;
  mangd: string;
  enhet: string;
};

type LengthDistributionColumnKey = keyof Omit<LengthDistributionRow, "id"> | "_actions";

const LENGTH_DISTRIBUTION_COLUMNS: Array<{ key: LengthDistributionColumnKey; label: string; pinnedRight?: boolean; width?: number }> = [
  { key: "langd", label: "Längd", width: 120 },
  { key: "mangd", label: "Mängd", width: 120 },
  { key: "enhet", label: "Beställd enhet", width: 160 },
  { key: "_actions", label: "", pinnedRight: true, width: 112 },
];

const emptyLengthDistributionRow = (): Omit<LengthDistributionRow, "id"> => ({
  langd: "",
  mangd: "",
  enhet: "m3 nominell",
});

const initialLengthDistributionRows: LengthDistributionRow[] = [
  {
    id: "ld-1",
    langd: "5,400",
    mangd: "27",
    enhet: "m3 nominell",
  }
];

type LengthDistributionFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<LengthDistributionRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<LengthDistributionRow, "id"> };

type LineItemLangdspecifikationTabProps = {
  /** Placerar knappen till höger, t.ex. i helsidesformuläret. */
  alignButtonRight?: boolean;
};

export function LineItemLangdspecifikationTab({ alignButtonRight = false }: LineItemLangdspecifikationTabProps) {
  const [lengthDistributionRows, setLengthDistributionRows] = useState<LengthDistributionRow[]>(initialLengthDistributionRows);
  const [selectedLengthDistributionRow, setSelectedLengthDistributionRow] = useState<number | null>(null);
  const [lengthDistributionForm, setLengthDistributionForm] = useState<LengthDistributionFormState>({ mode: "closed" });
  const [keepLengthDistributionDialogOpen, setKeepLengthDistributionDialogOpen] = useState(true);
  const [keepLengthDistributionValues, setKeepLengthDistributionValues] = useState(false);
  const [lastLengthDistributionDraft, setLastLengthDistributionDraft] = useState<Omit<LengthDistributionRow, "id"> | null>(null);
  const [lengthDistributionCreateFeedback, setLengthDistributionCreateFeedback] = useState({ open: false, key: 0 });

  const openLengthDistributionAdd = () => {
    setKeepLengthDistributionValues(false);
    const initialDraft = keepLengthDistributionValues && lastLengthDistributionDraft
      ? lastLengthDistributionDraft
      : emptyLengthDistributionRow();
    setLengthDistributionForm({ mode: "add", draft: initialDraft });
    setSelectedLengthDistributionRow(null);
  };

  const openLengthDistributionEdit = (index: number) => {
    setKeepLengthDistributionValues(false);
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setLengthDistributionForm({ mode: "edit", id, draft });
    setSelectedLengthDistributionRow(index);
  };

  const openLengthDistributionClone = (index: number) => {
    setKeepLengthDistributionValues(false);
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    void id;
    setLengthDistributionForm({ mode: "add", draft });
    setSelectedLengthDistributionRow(null);
  };

  const closeLengthDistributionForm = () => {
    setLengthDistributionForm({ mode: "closed" });
  };

  const setLengthDistributionDraftField = (key: keyof Omit<LengthDistributionRow, "id">, value: string) => {
    setLengthDistributionForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const saveLengthDistributionForm = () => {
    if (lengthDistributionForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...lengthDistributionForm.draft };

    if (lengthDistributionForm.mode === "add") {
      setLengthDistributionRows((previous) => [
        ...previous,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft }
      ]);
      setLastLengthDistributionDraft(keepLengthDistributionValues ? nextDraft : null);
      setLengthDistributionCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));

      if (keepLengthDistributionDialogOpen) {
        setLengthDistributionForm({
          mode: "add",
          draft: keepLengthDistributionValues ? nextDraft : emptyLengthDistributionRow()
        });
        return;
      }
    }

    if (lengthDistributionForm.mode === "edit") {
      setLengthDistributionRows((previous) =>
        previous.map((row) =>
          row.id === lengthDistributionForm.id ? { ...row, ...nextDraft } : row
        )
      );

      if (keepLengthDistributionDialogOpen) {
        setLengthDistributionForm({ mode: "edit", id: lengthDistributionForm.id, draft: nextDraft });
        return;
      }
    }

    closeLengthDistributionForm();
  };

  const deleteLengthDistributionRow = (index: number) => {
    const row = lengthDistributionRows[index];
    if (!row) {
      return;
    }

    setLengthDistributionRows((previous) =>
      previous.filter((current) => current.id !== row.id)
    );
    setSelectedLengthDistributionRow((previous) => (previous === index ? null : previous));
    closeLengthDistributionForm();
  };

  const lengthDistributionDraft = lengthDistributionForm.mode !== "closed" ? lengthDistributionForm.draft : null;
  const isLengthDistributionDialogOpen = lengthDistributionDraft !== null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: alignButtonRight ? "flex-end" : "flex-start", marginBottom: 12 }}>
        <Button
          className={styles.freightNewButton}
          startIcon={<AddIcon />}
          onClick={openLengthDistributionAdd}
        >
          Längdspecifikation
        </Button>
      </div>
      <div className={styles.lineItemsTableFrame}>
        <div className={styles.freightTableWrap}>
          <div className={styles.freightTable}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={LENGTH_DISTRIBUTION_COLUMNS}
              rows={lengthDistributionRows}
              rowKey={(row, index) => `${row.id}-${index}`}
              selectedRowIndex={selectedLengthDistributionRow}
              onRowClick={(index) =>
                setSelectedLengthDistributionRow((previous) => (previous === index ? null : index))
              }
              renderCell={(row, column, rowIndex) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openLengthDistributionEdit(rowIndex);
                        }}
                        title="Redigera rad"
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openLengthDistributionClone(rowIndex);
                        }}
                        title="Duplicera rad"
                      >
                        <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteLengthDistributionRow(rowIndex);
                        }}
                        title="Ta bort rad"
                      >
                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                const value = row[column.key as keyof Omit<LengthDistributionRow, "id">];
                return value?.trim() ? value : "-";
              }}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={isLengthDistributionDialogOpen}
        onClose={closeLengthDistributionForm}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>{lengthDistributionForm.mode === "add" ? "Ny längdspecifikation" : "Redigera längdspecifikation"}</span>
            {lengthDistributionForm.mode === "add" ? (
              <div className={styles.freightDialogToggles}>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepLengthDistributionDialogOpen}
                    onChange={(event) => setKeepLengthDistributionDialogOpen(event.target.checked)}
                  />
                  <span>Behåll öppen</span>
                </label>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepLengthDistributionValues}
                    onChange={(event) => {
                      setKeepLengthDistributionValues(event.target.checked);
                      if (event.target.checked) setKeepLengthDistributionDialogOpen(true);
                    }}
                  />
                  <span>Behåll värden</span>
                </label>
              </div>
            ) : null}
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          {lengthDistributionDraft !== null ? (
            <div className={styles.avropFormGrid}>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Längd</Typography>
                <TextField
                  size="small"
                  value={lengthDistributionDraft.langd}
                  onChange={(e) => setLengthDistributionDraftField("langd", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Mängd</Typography>
                <TextField
                  size="small"
                  value={lengthDistributionDraft.mangd}
                  onChange={(e) => setLengthDistributionDraftField("mangd", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Enhet</Typography>
                <Select
                  size="small"
                  value={lengthDistributionDraft.enhet}
                  onChange={(e) => setLengthDistributionDraftField("enhet", String(e.target.value))}
                  className={styles.freightFormInput}
                >
                  <MenuItem value="m3 nominell">m3 nominell</MenuItem>
                  <MenuItem value="m3 fast">m3 fast</MenuItem>
                  <MenuItem value="lpm">lpm</MenuItem>
                  <MenuItem value="st">st</MenuItem>
                </Select>
              </div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightSaveButton} onClick={saveLengthDistributionForm}>
            {lengthDistributionForm.mode === "add" ? "Lägg till" : "Spara"}
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={closeLengthDistributionForm}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={`length-create-${lengthDistributionCreateFeedback.key}`}
        open={lengthDistributionCreateFeedback.open}
        autoHideDuration={2200}
        onClose={() => setLengthDistributionCreateFeedback((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setLengthDistributionCreateFeedback((previous) => ({ ...previous, open: false }))}
          severity="success"
          variant="filled"
        >
          Post skapad
        </Alert>
      </Snackbar>
    </>
  );
}

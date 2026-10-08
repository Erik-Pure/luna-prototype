"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { DataTable } from "../../shared/DataTable";
import styles from "../../../page.module.scss";

type ProductionPlanningRow = {
  id: string;
  producerandeBolag: string;
  produktionsstalle: string;
  produktionslinje: string;
  kommentarProduktion: string;
  farg: string;
  pigmentering: string;
};

type ProductionPlanningColumnKey = keyof Omit<ProductionPlanningRow, "id"> | "_actions";

const PRODUCTION_PLANNING_COLUMNS: Array<{ key: ProductionPlanningColumnKey; label: string; pinnedRight?: boolean; width?: number }> = [
  { key: "producerandeBolag", label: "Producerande bolag", width: 200 },
  { key: "produktionsstalle", label: "Produktionsställe", width: 140 },
  { key: "produktionslinje", label: "Produktionslinje", width: 140 },
  { key: "kommentarProduktion", label: "Kommentar produktion", width: 180 },
  { key: "farg", label: "Färg", width: 100 },
  { key: "pigmentering", label: "Pigmentering", width: 120 },
  { key: "_actions", label: "", pinnedRight: true, width: 112 },
];

const emptyProductionPlanningRow = (): Omit<ProductionPlanningRow, "id"> => ({
  producerandeBolag: "",
  produktionsstalle: "",
  produktionslinje: "",
  kommentarProduktion: "",
  farg: "",
  pigmentering: "",
});

const initialProductionPlanningRows: ProductionPlanningRow[] = [
  {
    id: "pp-1",
    producerandeBolag: "BP Hissmofors Byggprodukter",
    produktionsstalle: "Krokom",
    produktionslinje: "Linje 1",
    kommentarProduktion: "Standardkörning",
    farg: "Natur",
    pigmentering: "Ingen",
  },
];

type ProductionPlanningFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<ProductionPlanningRow, "id"> }
  | { mode: "edit"; id: string; draft: Omit<ProductionPlanningRow, "id"> };

type LineItemProduktionsplaneringTabProps = {
  /** Placerar knappen till höger, t.ex. i helsidesformuläret. */
  alignButtonRight?: boolean;
};

export function LineItemProduktionsplaneringTab({ alignButtonRight = false }: LineItemProduktionsplaneringTabProps) {
  const [productionPlanningRows, setProductionPlanningRows] = useState<ProductionPlanningRow[]>(initialProductionPlanningRows);
  const [selectedProductionPlanningRow, setSelectedProductionPlanningRow] = useState<number | null>(null);
  const [productionPlanningForm, setProductionPlanningForm] = useState<ProductionPlanningFormState>({ mode: "closed" });
  const [keepProductionPlanningDialogOpen, setKeepProductionPlanningDialogOpen] = useState(false);
  const [keepProductionPlanningValues, setKeepProductionPlanningValues] = useState(false);
  const [lastProductionPlanningDraft, setLastProductionPlanningDraft] = useState<Omit<ProductionPlanningRow, "id"> | null>(null);
  const [productionPlanningCreateFeedback, setProductionPlanningCreateFeedback] = useState({ open: false, key: 0 });

  const openProductionPlanningAdd = () => {
    setKeepProductionPlanningValues(false);
    const initialDraft = keepProductionPlanningValues && lastProductionPlanningDraft
      ? lastProductionPlanningDraft
      : emptyProductionPlanningRow();
    setProductionPlanningForm({ mode: "add", draft: initialDraft });
    setSelectedProductionPlanningRow(null);
  };

  const openProductionPlanningEdit = (index: number) => {
    setKeepProductionPlanningValues(false);
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    setProductionPlanningForm({ mode: "edit", id, draft });
    setSelectedProductionPlanningRow(index);
  };

  const openProductionPlanningClone = (index: number) => {
    setKeepProductionPlanningValues(false);
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    const { id, ...draft } = row;
    void id;
    setProductionPlanningForm({ mode: "add", draft });
    setSelectedProductionPlanningRow(null);
  };

  const closeProductionPlanningForm = () => {
    setProductionPlanningForm({ mode: "closed" });
  };

  const setProductionPlanningDraftField = (key: keyof Omit<ProductionPlanningRow, "id">, value: string) => {
    setProductionPlanningForm((previous) =>
      previous.mode === "closed"
        ? previous
        : { ...previous, draft: { ...previous.draft, [key]: value } }
    );
  };

  const saveProductionPlanningForm = () => {
    if (productionPlanningForm.mode === "closed") {
      return;
    }

    const nextDraft = { ...productionPlanningForm.draft };

    if (productionPlanningForm.mode === "add") {
      setProductionPlanningRows((previous) => [
        ...previous,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...nextDraft }
      ]);
      setLastProductionPlanningDraft(keepProductionPlanningValues ? nextDraft : null);
      setProductionPlanningCreateFeedback((previous) => ({ open: true, key: previous.key + 1 }));

      if (keepProductionPlanningDialogOpen) {
        setProductionPlanningForm({
          mode: "add",
          draft: keepProductionPlanningValues ? nextDraft : emptyProductionPlanningRow()
        });
        return;
      }
    }

    if (productionPlanningForm.mode === "edit") {
      setProductionPlanningRows((previous) =>
        previous.map((row) =>
          row.id === productionPlanningForm.id ? { ...row, ...nextDraft } : row
        )
      );

      if (keepProductionPlanningDialogOpen) {
        setProductionPlanningForm({ mode: "edit", id: productionPlanningForm.id, draft: nextDraft });
        return;
      }
    }

    closeProductionPlanningForm();
  };

  const deleteProductionPlanningRow = (index: number) => {
    const row = productionPlanningRows[index];
    if (!row) {
      return;
    }

    setProductionPlanningRows((previous) =>
      previous.filter((current) => current.id !== row.id)
    );
    setSelectedProductionPlanningRow((previous) => (previous === index ? null : previous));
    closeProductionPlanningForm();
  };

  const productionPlanningDraft = productionPlanningForm.mode !== "closed" ? productionPlanningForm.draft : null;
  const isProductionPlanningDialogOpen = productionPlanningDraft !== null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: alignButtonRight ? "flex-end" : "flex-start", marginBottom: 12 }}>
        <Button
          className={styles.freightNewButton}
          startIcon={<AddIcon />}
          onClick={openProductionPlanningAdd}
        >
          Produktionsplanering
        </Button>
      </div>

      <div className={styles.lineItemsTableFrame}>
        <div className={styles.freightTableWrap}>
          <div className={`${styles.freightTable} ${styles.productionPlanningTable}`}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={PRODUCTION_PLANNING_COLUMNS}
              rows={productionPlanningRows}
              rowKey={(row, index) => `${row.id}-${index}`}
              selectedRowIndex={selectedProductionPlanningRow}
              onRowClick={(index) =>
                setSelectedProductionPlanningRow((previous) => (previous === index ? null : index))
              }
              renderCell={(row, column, rowIndex) => {
                if (column.key === "_actions") {
                  return (
                    <span className={`${styles.freightActionCell} ${styles.productionPlanningActionCell}`}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openProductionPlanningEdit(rowIndex);
                        }}
                        title="Redigera rad"
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openProductionPlanningClone(rowIndex);
                        }}
                        title="Duplicera rad"
                      >
                        <ContentCopyOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteProductionPlanningRow(rowIndex);
                        }}
                        title="Ta bort rad"
                      >
                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }

                const value = row[column.key as keyof Omit<ProductionPlanningRow, "id">];
                return value?.trim() ? value : "-";
              }}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={isProductionPlanningDialogOpen}
        onClose={closeProductionPlanningForm}
        fullWidth
        maxWidth="md"
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>{productionPlanningForm.mode === "add" ? "Ny produktionsplanering" : "Redigera produktionsplanering"}</span>
            {productionPlanningForm.mode === "add" ? (
              <div className={styles.freightDialogToggles}>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepProductionPlanningDialogOpen}
                    onChange={(event) => setKeepProductionPlanningDialogOpen(event.target.checked)}
                  />
                  <span>Behåll öppen</span>
                </label>
                <label className={styles.freightDialogKeepOpen}>
                  <Checkbox
                    size="small"
                    checked={keepProductionPlanningValues}
                    onChange={(event) => {
                      setKeepProductionPlanningValues(event.target.checked);
                      if (event.target.checked) setKeepProductionPlanningDialogOpen(true);
                    }}
                  />
                  <span>Behåll värden</span>
                </label>
              </div>
            ) : null}
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          {productionPlanningDraft !== null ? (
            <div className={styles.avropFormGrid}>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Producerande bolag</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.producerandeBolag}
                  onChange={(e) => setProductionPlanningDraftField("producerandeBolag", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Produktionsställe</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.produktionsstalle}
                  onChange={(e) => setProductionPlanningDraftField("produktionsstalle", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Produktionslinje</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.produktionslinje}
                  onChange={(e) => setProductionPlanningDraftField("produktionslinje", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Kommentar produktion</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.kommentarProduktion}
                  onChange={(e) => setProductionPlanningDraftField("kommentarProduktion", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Färg</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.farg}
                  onChange={(e) => setProductionPlanningDraftField("farg", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
              <div className={styles.freightFormField}>
                <Typography className={styles.freightFormLabel}>Pigmentering</Typography>
                <TextField
                  size="small"
                  value={productionPlanningDraft.pigmentering}
                  onChange={(e) => setProductionPlanningDraftField("pigmentering", e.target.value)}
                  className={styles.freightFormInput}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightSaveButton} onClick={saveProductionPlanningForm}>
            {productionPlanningForm.mode === "add" ? "Lägg till" : "Spara"}
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={closeProductionPlanningForm}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={`production-planning-${productionPlanningCreateFeedback.key}`}
        open={productionPlanningCreateFeedback.open}
        autoHideDuration={2200}
        onClose={() => setProductionPlanningCreateFeedback((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setProductionPlanningCreateFeedback((previous) => ({ ...previous, open: false }))}
          severity="success"
          variant="filled"
        >
          Post skapad
        </Alert>
      </Snackbar>
    </>
  );
}

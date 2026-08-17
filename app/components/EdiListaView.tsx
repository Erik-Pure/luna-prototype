"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataTable } from "./shared/DataTable";
import styles from "../page.module.scss";

// ── Options ────────────────────────────────────────────────────────────────────

const KUND_OPTIONS = [
  "Acme AB",
  "Globex Corp",
  "Initech HB",
  "Nordic Sten & Mark AB",
  "Luna Infrastruktur AB",
  "Skandinavisk Industriservice",
];

const PRODUKT_OPTIONS = [
  "22x95 Gran Ytterpanel",
  "22x120 Gran Ytterpanel",
  "50x225 Furu VI",
  "50x200 Furu V",
  "Gran flisad spå",
  "Furu hyvlad",
];

const PAKETTYP_OPTIONS = ["LP", "Pk", "Halvlängd", "Kapping", "Kombi", "Special"];

// ── Types ──────────────────────────────────────────────────────────────────────

type TriState = true | false | null;

type EdiRow = {
  _id: string;
  kund: string;
  artNrKund: string;
  benamningKund: string;
  produktILuna: string;
  langd: string;
  aktiv: string;
  langdMin: string;
  langdMax: string;
};

type EditDraft = {
  kund: string;
  produktILuna: string;
  langd: string;
  aktiv: string;
  langdMin: string;
  langdMax: string;
};

type PaketPost = {
  _id: string;
  pakettyp: string;
  paketHojd: string;
  paketBredd: string;
  paketAntal: string;
  medellangd: string;
};

type PaketPostFormState =
  | { mode: "closed" }
  | { mode: "add"; draft: Omit<PaketPost, "_id"> }
  | { mode: "edit"; id: string; draft: Omit<PaketPost, "_id"> };

// ── Table columns ──────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "kund", label: "Kund", width: 200 },
  { key: "artNrKund", label: "ArtNr Kund", width: 110 },
  { key: "benamningKund", label: "Benämning Kund", width: 200 },
  { key: "produktILuna", label: "Produkt i Luna", width: 200 },
  { key: "langd", label: "Längd", width: 80 },
  { key: "aktiv", label: "Aktiv", width: 70 },
  { key: "langdMin", label: "Längd min", width: 90 },
  { key: "langdMax", label: "Längd max", width: 90 },
  { key: "_actions", label: "", pinnedRight: true, width: 48 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

const PAKET_POST_COLUMNS = [
  { key: "pakettyp", label: "Pakettyp", width: 110 },
  { key: "paketHojd", label: "PaketHöjd", width: 100 },
  { key: "paketBredd", label: "PaketBredd", width: 100 },
  { key: "paketAntal", label: "PaketAntal", width: 100 },
  { key: "medellangd", label: "Medellängd", width: 100 },
  { key: "_actions", label: "", pinnedRight: true, width: 72 },
] satisfies Array<{ key: string; label: string; pinnedRight?: boolean; width?: number }>;

const emptyPaketPost = (): Omit<PaketPost, "_id"> => ({
  pakettyp: "", paketHojd: "", paketBredd: "", paketAntal: "", medellangd: "",
});

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL_ROWS: EdiRow[] = [
  {
    _id: "1", kund: "Acme AB", artNrKund: "AC-9920", benamningKund: "Ytterpanel 22x95",
    produktILuna: "22x95 Gran Ytterpanel", langd: "3.6",
    aktiv: "Ja", langdMin: "3.0", langdMax: "4.2",
  },
  {
    _id: "2", kund: "Acme AB", artNrKund: "AC-9922", benamningKund: "Ytterpanel 22x120",
    produktILuna: "22x120 Gran Ytterpanel", langd: "4.2",
    aktiv: "Ja", langdMin: "3.6", langdMax: "5.1",
  },
  {
    _id: "3", kund: "Globex Corp", artNrKund: "GX-0441", benamningKund: "Furu panel 50x225",
    produktILuna: "50x225 Furu VI", langd: "5.1",
    aktiv: "Ja", langdMin: "4.5", langdMax: "5.4",
  },
  {
    _id: "4", kund: "Nordic Sten & Mark AB", artNrKund: "NSM-812",
    benamningKund: "Gran spå flisad", produktILuna: "Gran flisad spå", langd: "2.4",
    aktiv: "Nej", langdMin: "1.8", langdMax: "3.0",
  },
  {
    _id: "5", kund: "Luna Infrastruktur AB", artNrKund: "LI-3301", benamningKund: "Furu hyvlad 50x200",
    produktILuna: "50x200 Furu V", langd: "4.8",
    aktiv: "Ja", langdMin: "4.2", langdMax: "5.4",
  },
];

const INITIAL_PAKET_POSTER: Record<string, PaketPost[]> = {
  "1": [
    { _id: "1-1", pakettyp: "LP", paketHojd: "35", paketBredd: "95", paketAntal: "80", medellangd: "3.8" },
  ],
  "2": [],
  "3": [
    { _id: "3-1", pakettyp: "Pk", paketHojd: "45", paketBredd: "225", paketAntal: "20", medellangd: "5.0" },
  ],
  "4": [],
  "5": [
    { _id: "5-1", pakettyp: "LP", paketHojd: "45", paketBredd: "200", paketAntal: "24", medellangd: "4.8" },
    { _id: "5-2", pakettyp: "Pk", paketHojd: "40", paketBredd: "150", paketAntal: "50", medellangd: "3.6" },
  ],
};

// ── Read-only field helper ─────────────────────────────────────────────────────

function ROField({ label, value }: { label: string; value: string }) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
      sx={{
        opacity: 0.45,
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)", borderWidth: 1 },
        },
        "& .MuiInputBase-input": { cursor: "default", color: "#2f3743" },
      }}
    />
  );
}

// ── Edit dialog (row fields) ────────────────────────────────────────────────────

function EditDialog({
  open,
  row,
  onClose,
  onSave,
}: {
  open: boolean;
  row: EdiRow | null;
  onClose: () => void;
  onSave: (id: string, draft: EditDraft) => void;
}) {
  const [draft, setDraft] = useState<EditDraft>({
    kund: row?.kund ?? "",
    produktILuna: row?.produktILuna ?? "",
    langd: row?.langd ?? "",
    aktiv: row?.aktiv ?? "Ja",
    langdMin: row?.langdMin ?? "",
    langdMax: row?.langdMax ?? "",
  });

  const set = (key: keyof EditDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { className: styles.freightDialogPaper } }}
    >
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>
            Redigera EDI-koppling
          </Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 4 }}>
          <TextField
            select fullWidth size="small" label="Kund"
            value={draft.kund}
            onChange={(e) => set("kund", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {KUND_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <ROField label="ArtNr Kund" value={row?.artNrKund ?? ""} />
          <ROField label="Benämning Kund" value={row?.benamningKund ?? ""} />
          <TextField
            select fullWidth size="small" label="Produkt i Luna"
            value={draft.produktILuna}
            onChange={(e) => set("produktILuna", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {PRODUKT_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth size="small" label="Längd"
            value={draft.langd}
            onChange={(e) => set("langd", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select fullWidth size="small" label="Aktiv"
            value={draft.aktiv}
            onChange={(e) => set("aktiv", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value="Ja">Ja</MenuItem>
            <MenuItem value="Nej">Nej</MenuItem>
          </TextField>
          <TextField
            fullWidth size="small" label="Längd min"
            value={draft.langdMin}
            onChange={(e) => set("langdMin", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth size="small" label="Längd max"
            value={draft.langdMax}
            onChange={(e) => set("langdMax", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button
          size="small"
          className={styles.freightSaveButton}
          onClick={() => { if (row) onSave(row._id, draft); onClose(); }}
        >
          Spara
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Post form dialog (add/edit a single produktpost) ────────────────────────────

function PostFormDialog({
  form,
  onClose,
  onSave,
  onChange,
}: {
  form: PaketPostFormState;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: keyof Omit<PaketPost, "_id">, value: string) => void;
}) {
  return (
    <Dialog
      open={form.mode !== "closed"}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { className: styles.freightDialogPaper } }}
    >
      <DialogTitle className={styles.freightDialogTitle}>
        <div className={styles.freightDialogTitleRow}>
          <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>
            {form.mode === "add" ? "Ny specifikation" : "Redigera specifikation"}
          </Typography>
          <IconButton size="small" onClick={onClose} style={{ color: "#6a7483" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={styles.freightDialogContent}>
        {form.mode !== "closed" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, paddingTop: 4 }}>
            <TextField
              select fullWidth size="small" label="Pakettyp"
              value={form.draft.pakettyp}
              onChange={(e) => onChange("pakettyp", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            >
              <MenuItem value=""><em>—</em></MenuItem>
              {PAKETTYP_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth size="small" label="PaketHöjd"
              value={form.draft.paketHojd}
              onChange={(e) => onChange("paketHojd", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth size="small" label="PaketBredd"
              value={form.draft.paketBredd}
              onChange={(e) => onChange("paketBredd", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth size="small" label="PaketAntal"
              value={form.draft.paketAntal}
              onChange={(e) => onChange("paketAntal", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth size="small" label="Medellängd"
              value={form.draft.medellangd}
              onChange={(e) => onChange("medellangd", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions className={styles.freightDialogActions}>
        <Button size="small" className={styles.freightSaveButton} onClick={onSave}>
          {form.mode === "add" ? "Lägg till" : "Spara"}
        </Button>
        <Button size="small" className={styles.freightCancelButton} onClick={onClose}>
          Avbryt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Produktposter detail section ────────────────────────────────────────────────

function ProduktposterSection({
  posts,
  selectedPostIndex,
  onSelectPost,
  onAdd,
  onEdit,
  onDelete,
}: {
  posts: PaketPost[];
  selectedPostIndex: number | null;
  onSelectPost: (index: number) => void;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div className={styles.avropTableSection} style={{ flex: "none", minHeight: 0, marginTop: 16 }}>
      <div className={styles.avropTableHeader}>
        <Button
          className={styles.freightNewButton}
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Specifikation
        </Button>
      </div>

      <div className={styles.lineItemsSection}>
        <div className={styles.lineItemsTableWrap}>
          <div className={styles.lineItemsTable}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={PAKET_POST_COLUMNS}
              rows={posts}
              rowKey={(post, index) => `${post._id}-${index}`}
              selectedRowIndex={selectedPostIndex}
              onRowClick={(index) => onSelectPost(index)}
              renderCell={(post, column, rowIndex) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(rowIndex); }} title="Redigera post">
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(rowIndex); }} title="Ta bort post">
                        <DeleteOutlineOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                const value = (post as unknown as Record<string, string>)[column.key];
                return value?.trim() ? value : "-";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EdiListaView() {
  // Search filter state
  const [kund, setKund] = useState("");
  const [produkt, setProdukt] = useState("");
  const [utanProdukt, setUtanProdukt] = useState<TriState>(null);
  const [aktiv, setAktiv] = useState<TriState>(null);

  const cycleTriState = (setter: (fn: (prev: TriState) => TriState) => void) => {
    setter((prev) => (prev === null ? true : prev === true ? false : null));
  };

  const clearAll = () => {
    setKund(""); setProdukt(""); setUtanProdukt(null); setAktiv(null);
  };

  // Table state
  const [rows, setRows] = useState<EdiRow[]>(INITIAL_ROWS);
  const [paketPosterByRow, setPaketPosterByRow] = useState<Record<string, PaketPost[]>>(INITIAL_PAKET_POSTER);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<EdiRow | null>(null);
  const [postForm, setPostForm] = useState<PaketPostFormState>({ mode: "closed" });
  const [postsVisible, setPostsVisible] = useState(true);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const selectedRow = selectedRowIndex !== null ? rows[selectedRowIndex] ?? null : null;
  const selectedPosts = selectedRow ? paketPosterByRow[selectedRow._id] ?? [] : [];

  const handleSelectRow = (index: number) => {
    setSelectedRowIndex((prev) => (prev === index ? null : index));
    setSelectedPostIndex(null);
  };

  const handleSaveRow = (id: string, draft: EditDraft) => {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, ...draft } : r)));
  };

  const openPostAdd = () => {
    setPostForm({ mode: "add", draft: emptyPaketPost() });
    setSelectedPostIndex(null);
  };

  const openPostEdit = (index: number) => {
    const post = selectedPosts[index];
    if (!post) return;
    const { _id, ...postDraft } = post;
    setPostForm({ mode: "edit", id: _id, draft: postDraft });
    setSelectedPostIndex(index);
  };

  const closePostForm = () => setPostForm({ mode: "closed" });

  const setPostDraftField = (key: keyof Omit<PaketPost, "_id">, value: string) => {
    setPostForm((prev) => (prev.mode === "closed" ? prev : { ...prev, draft: { ...prev.draft, [key]: value } }));
  };

  const savePostForm = () => {
    if (postForm.mode === "closed" || !selectedRow) return;
    const rowId = selectedRow._id;
    if (postForm.mode === "add") {
      const newPost: PaketPost = { _id: `pp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...postForm.draft };
      setPaketPosterByRow((prev) => ({ ...prev, [rowId]: [...(prev[rowId] ?? []), newPost] }));
    } else {
      setPaketPosterByRow((prev) => ({
        ...prev,
        [rowId]: (prev[rowId] ?? []).map((p) => (p._id === postForm.id ? { ...p, ...postForm.draft } : p)),
      }));
    }
    closePostForm();
  };

  const requestDeletePost = (index: number) => setDeleteConfirmIndex(index);

  const cancelDeletePost = () => setDeleteConfirmIndex(null);

  const confirmDeletePost = () => {
    if (deleteConfirmIndex === null || !selectedRow) return;
    const rowId = selectedRow._id;
    setPaketPosterByRow((prev) => ({ ...prev, [rowId]: (prev[rowId] ?? []).filter((_, i) => i !== deleteConfirmIndex) }));
    setSelectedPostIndex(null);
    setDeleteConfirmIndex(null);
  };

  return (
    <>
      {/* Search filters */}
      <div className={styles.filterRow}>
        <div className={styles.advancedSearchPanel}>
          <div className={styles.advancedFiltersContainer}>
            <div className={`${styles.advancedFiltersHeader} ${styles.advancedFiltersHeaderCompact}`}>
              <span />
              <div className={styles.advancedFiltersHeaderActions}>
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
            <div className={styles.advancedFiltersBody}>
              <div className={styles.advancedFiltersGrid}>
                <FormControl size="small" className={styles.searchFieldControl}>
                  <InputLabel>Kund</InputLabel>
                  <Select
                    value={kund}
                    label="Kund"
                    onChange={(e) => setKund(e.target.value)}
                    IconComponent={KeyboardArrowDownIcon}
                  >
                    <MenuItem value="">-</MenuItem>
                    {KUND_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" className={styles.searchFieldControl}>
                  <InputLabel>Produkt (Kund)</InputLabel>
                  <Select
                    value={produkt}
                    label="Produkt (Kund)"
                    onChange={(e) => setProdukt(e.target.value)}
                    IconComponent={KeyboardArrowDownIcon}
                  >
                    <MenuItem value="">-</MenuItem>
                    {PRODUKT_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <label
                  className={styles.klarSokGridCheckbox}
                  onClick={() => cycleTriState(setUtanProdukt)}
                >
                  <Checkbox
                    size="small"
                    checked={utanProdukt === true}
                    indeterminate={utanProdukt === false}
                    readOnly
                  />
                  <Typography className={styles.searchCheckboxLabel}>Utan produkt</Typography>
                </label>
                <label
                  className={styles.klarSokGridCheckbox}
                  onClick={() => cycleTriState(setAktiv)}
                >
                  <Checkbox
                    size="small"
                    checked={aktiv === true}
                    indeterminate={aktiv === false}
                    readOnly
                  />
                  <Typography className={styles.searchCheckboxLabel}>Aktiv</Typography>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <Tooltip title="Visa/dölj produktspecifikation" placement="top">
          <IconButton
            onClick={() => setPostsVisible((v) => !v)}
            className={`${styles.columnsIconButton} ${postsVisible ? styles.columnsIconButtonActive : ""}`}
          >
            <Inventory2OutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <div className={`${styles.tableContainer} ${postsVisible && selectedRow ? styles.tableContainerShrink : ""}`}>
        <div className={styles.tableScrollWrap}>
          <div className={styles.tableInner}>
            <DataTable
              variant="main"
              columns={COLUMNS}
              rows={rows}
              rowKey={(row) => row._id}
              selectedRowIndex={selectedRowIndex}
              onRowClick={(i) => handleSelectRow(i)}
              fillRemainingSpace
              renderCell={(row, column) => {
                if (column.key === "_actions") {
                  return (
                    <span className={styles.freightActionCell}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRow(row);
                        }}
                      >
                        <EditOutlinedIcon className={styles.freightActionIcon} />
                      </IconButton>
                    </span>
                  );
                }
                return row[column.key as keyof EdiRow] ?? "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Produktposter (detail table for selected row) */}
      {postsVisible && selectedRow && (
        <ProduktposterSection
          posts={selectedPosts}
          selectedPostIndex={selectedPostIndex}
          onSelectPost={(index) => setSelectedPostIndex((prev) => (prev === index ? null : index))}
          onAdd={openPostAdd}
          onEdit={openPostEdit}
          onDelete={requestDeletePost}
        />
      )}

      {/* Edit dialog (row fields) */}
      <EditDialog
        key={editingRow?._id ?? "none"}
        open={editingRow !== null}
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={handleSaveRow}
      />

      {/* Post form dialog (add/edit produktpost) */}
      <PostFormDialog
        form={postForm}
        onClose={closePostForm}
        onSave={savePostForm}
        onChange={setPostDraftField}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmIndex !== null} onClose={cancelDeletePost} maxWidth="xs" fullWidth>
        <DialogTitle fontSize={16}>Ta bort specifikation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" lineHeight={1} marginBottom={0}>
            Vill du ta bort denna specifikation?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ margin: "0 12px 12px 0" }}>
          <Button color="error" variant="contained" onClick={confirmDeletePost} sx={{ textTransform: "none" }}>
            Ta bort
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            className={styles.lineItemsToggleButton}
            onClick={cancelDeletePost}
            sx={{ textTransform: "none" }}
          >
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

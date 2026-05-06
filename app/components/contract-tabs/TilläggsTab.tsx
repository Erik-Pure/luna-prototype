"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { ActionRow } from "../shared/ActionRow";
import styles from "../../page.module.scss";

type TillaggItem = {
    id: number;
    bolag: string;
    tillagg: string;
    mangd: string;
    enhet: string;
    aPris: string;
    valuta: string;
    konto: string;
    avtalsnrCanea: string;
    textPaFaktura: string;
};

const EMPTY_DRAFT: Omit<TillaggItem, "id"> = {
    bolag: "",
    tillagg: "",
    mangd: "",
    enhet: "st",
    aPris: "",
    valuta: "SEK",
    konto: "",
    avtalsnrCanea: "",
    textPaFaktura: "",
};

let _nextId = 1;

function calcBelopp(mangd: string, aPris: string): string {
    const m = parseFloat(mangd);
    const p = parseFloat(aPris);
    if (!isNaN(m) && !isNaN(p)) return (m * p).toFixed(2);
    return "";
}

export function TilläggsTab() {
    const [items, setItems] = useState<TillaggItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [draft, setDraft] = useState<Omit<TillaggItem, "id">>(EMPTY_DRAFT);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [keepDialogOpen, setKeepDialogOpen] = useState(false);
    const [keepDialogValues, setKeepDialogValues] = useState(true);
    const [lastDraft, setLastDraft] = useState<Omit<TillaggItem, "id">>(EMPTY_DRAFT);

    function openDialog() {
        setDraft(keepDialogValues ? lastDraft : EMPTY_DRAFT);
        setEditingId(null);
        setDialogOpen(true);
    }

    function openEditDialog(item: TillaggItem) {
        const { id, ...rest } = item;
        setDraft(rest);
        setEditingId(id);
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setEditingId(null);
    }

    function saveDraft() {
        if (editingId !== null) {
            setItems((prev) => prev.map((item) => item.id === editingId ? { id: editingId, ...draft } : item));
            if (keepDialogOpen) return;
        } else {
            setItems((prev) => [...prev, { id: _nextId++, ...draft }]);
            setLastDraft(keepDialogValues ? draft : EMPTY_DRAFT);
            if (keepDialogOpen) {
                setDraft(keepDialogValues ? draft : EMPTY_DRAFT);
                return;
            }
        }
        setDialogOpen(false);
        setEditingId(null);
    }

    function setDraftField(field: keyof typeof draft, value: string) {
        setDraft((prev) => ({ ...prev, [field]: value }));
    }

    function removeItem(id: number) {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }

    const TABLE_COLS = [
        { key: "tillagg", label: "Tillägg" },
        { key: "bolag", label: "Bolag" },
        { key: "mangd", label: "Mängd" },
        { key: "enhet", label: "Enhet" },
        { key: "aPris", label: "À-pris" },
        { key: "valuta", label: "Valuta" },
        { key: "belopp", label: "Belopp" },
        { key: "konto", label: "Konto" },
        { key: "textPaFaktura", label: "Text på faktura" },
        { key: "avtalsnrCanea", label: "Avtalsnr Canea" },
        { key: "_actions", label: "" },
    ];

    return (
        <div className={styles.lineItemsSection}>
            <ActionRow
                items={[
                    {
                        label: "Ny",
                        icon: <AddIcon fontSize="small" />,
                        tone: "primary",
                        onClick: openDialog,
                    },
                ]}
            />

            {/* Table */}
            <div className={styles.tillaggTableWrap}>
                <div className={styles.lineItemsTable}>
                    <div className={styles.lineItemsHeaderRow}>
                        {TABLE_COLS.map((col) => (
                            <div key={col.key} className={styles.lineItemsHeaderCell}>
                                {col.label}
                            </div>
                        ))}
                    </div>

                    {items.length === 0 ? (
                        <div className={styles.tillaggEmptyRow}>
                            <Typography className={styles.tillaggEmpty}>Inga tillägg tillagda</Typography>
                        </div>
                    ) : (
                        items.map((item) => {
                            const belopp = calcBelopp(item.mangd, item.aPris);
                            return (
                                <div key={item.id} className={styles.lineItemsRow}>
                                    <div className={styles.lineItemsCell}>{item.tillagg || "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.bolag || "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.mangd || "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.enhet}</div>
                                    <div className={styles.lineItemsCell}>{item.aPris || "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.valuta}</div>
                                    <div className={styles.lineItemsCell}>{belopp ? `${belopp} ${item.valuta}` : "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.konto || "—"}</div>
                                    <div className={`${styles.lineItemsCell} ${styles.tillaggCellTruncate}`}>{item.textPaFaktura || "—"}</div>
                                    <div className={styles.lineItemsCell}>{item.avtalsnrCanea || "—"}</div>
                                    <div className={`${styles.lineItemsCell} ${styles.tillaggActionsCell}`}>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditDialog(item); }}>
                                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                        </IconButton>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                        </IconButton>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="md"
                fullWidth
                classes={{ paper: styles.freightDialogPaper }}
            >
                <DialogTitle className={styles.freightDialogTitle}>
                    <div className={styles.freightDialogTitleRow}>
                        <span>{editingId !== null ? "Redigera tillägg" : "Lägg till tillägg"}</span>
                        {editingId === null && (
                            <div className={styles.freightDialogToggles}>
                                <label className={styles.freightDialogKeepOpen}>
                                    <Checkbox
                                        size="small"
                                        checked={keepDialogOpen}
                                        onChange={(e) => setKeepDialogOpen(e.target.checked)}
                                    />
                                    <span>Behåll öppen</span>
                                </label>
                                <label className={styles.freightDialogKeepOpen}>
                                    <Checkbox
                                        size="small"
                                        checked={keepDialogValues}
                                        onChange={(e) => setKeepDialogValues(e.target.checked)}
                                    />
                                    <span>Behåll värden</span>
                                </label>
                            </div>
                        )}
                    </div>
                </DialogTitle>

                <DialogContent className={styles.freightDialogContent}>
                    <div className={styles.freightFormGrid}>
                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Bolag</Typography>
                            <Select size="small" className={styles.freightFormInput} value={draft.bolag} onChange={(e) => setDraftField("bolag", e.target.value)}>
                                <MenuItem value="">— Välj —</MenuItem>
                                <MenuItem value="Bolag AB">Bolag AB</MenuItem>
                                <MenuItem value="Dotterbolag AB">Dotterbolag AB</MenuItem>
                                <MenuItem value="Intressebolag HB">Intressebolag HB</MenuItem>
                            </Select>
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Tillägg</Typography>
                            <Select size="small" className={styles.freightFormInput} value={draft.tillagg} onChange={(e) => setDraftField("tillagg", e.target.value)}>
                                <MenuItem value="">— Välj —</MenuItem>
                                <MenuItem value="Dellossning">Dellossning</MenuItem>
                                <MenuItem value="Frakttillägg">Frakttillägg</MenuItem>
                                <MenuItem value="Färg">Färg</MenuItem>
                                <MenuItem value="Målningstillägg">Målningstillägg</MenuItem>
                                <MenuItem value="Plocktillägg">Plocktillägg</MenuItem>
                                <MenuItem value="Postningstillägg">Postningstillägg</MenuItem>
                                <MenuItem value="Ställkostnad">Ställkostnad</MenuItem>
                            </Select>
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Mängd</Typography>
                            <TextField size="small" type="number" className={styles.freightFormInput} value={draft.mangd} onChange={(e) => setDraftField("mangd", e.target.value)} />
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Enhet</Typography>
                            <Select size="small" className={styles.freightFormInput} value={draft.enhet} onChange={(e) => setDraftField("enhet", e.target.value)}>
                                <MenuItem value="st">st</MenuItem>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="m">m</MenuItem>
                                <MenuItem value="m²">m²</MenuItem>
                                <MenuItem value="m³">m³</MenuItem>
                                <MenuItem value="lpm">lpm</MenuItem>
                                <MenuItem value="tim">tim</MenuItem>
                            </Select>
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>À-pris</Typography>
                            <TextField size="small" type="number" className={styles.freightFormInput} value={draft.aPris} onChange={(e) => setDraftField("aPris", e.target.value)} />
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Valuta</Typography>
                            <Select size="small" className={styles.freightFormInput} value={draft.valuta} onChange={(e) => setDraftField("valuta", e.target.value)}>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="SEK">SEK</MenuItem>
                                <MenuItem value="USD">USD</MenuItem>
                            </Select>
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Belopp</Typography>
                            <TextField
                                size="small"
                                className={styles.freightFormInput}
                                value={calcBelopp(draft.mangd, draft.aPris)}
                                helperText="Beräknas automatiskt"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        endAdornment: draft.valuta ? (
                                            <InputAdornment position="end">{draft.valuta}</InputAdornment>
                                        ) : undefined,
                                    },
                                }}
                            />
                        </div>

                        <div className={styles.freightFormField}>
                            <Typography className={styles.freightFormLabel}>Konto</Typography>
                            <Select size="small" className={styles.freightFormInput} value={draft.konto} onChange={(e) => setDraftField("konto", e.target.value)}>
                                <MenuItem value="">— Välj —</MenuItem>
                                <MenuItem value="Frakt">Frakt</MenuItem>
                                <MenuItem value="Färg">Färg</MenuItem>
                                <MenuItem value="Postning/Plockningstillägg">Postning/Plockningstillägg</MenuItem>
                            </Select>
                        </div>

                        <div className={`${styles.freightFormField} ${styles.tillaggDialogFullCol}`}>
                            <Typography className={styles.freightFormLabel}>Avtalsnr i Canea</Typography>
                            <TextField size="small" className={styles.freightFormInput} value={draft.avtalsnrCanea} onChange={(e) => setDraftField("avtalsnrCanea", e.target.value)} />
                        </div>

                        <div className={`${styles.freightFormField} ${styles.tillaggDialogFullCol}`}>
                            <Typography className={styles.freightFormLabel}>Text på faktura</Typography>
                            <TextField size="small" className={styles.freightFormInput} value={draft.textPaFaktura} onChange={(e) => setDraftField("textPaFaktura", e.target.value)} />
                        </div>
                    </div>
                </DialogContent>

                <DialogActions className={styles.freightDialogActions}>
                    <Button size="small" className={styles.freightCancelButton} onClick={closeDialog}>
                        Avbryt
                    </Button>
                    <Button size="small" className={styles.freightSaveButton} onClick={saveDraft}>
                        {editingId !== null ? "Spara" : "Lägg till"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

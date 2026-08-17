"use client";

import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import styles from "../page.module.scss";

const ART_NR_OPTIONS = [
  "2202209500002000",
  "2202209500003000",
  "2202212000001000",
] as const;

type PriceRowDraft = {
  artNr: string;
  produkt: string;
  fakturatext: string;
  pakettyp: string;
  langd: string;
  emballage: string;
  bunt: string;
  folie: string;
  fakturaEnhet: string;
  pris: string;
  saljtyp: string;
  internKommentar: string;
  externKommentar: string;
  certifiering: string;
  kundensArtNr: string;
  visaKund: boolean;
};

type UploadedFile = {
  id: string;
  name: string;
  addedAt: Date;
};

type PriceListRowDetailViewProps = {
  priceListId: string;
  priceRowId: string;
  onClose?: () => void;
};

const emptyDraft: PriceRowDraft = {
  artNr: "",
  produkt: "",
  fakturatext: "",
  pakettyp: "Lp",
  langd: "",
  emballage: "",
  bunt: "",
  folie: "Nej",
  fakturaEnhet: "m3 nominell",
  pris: "",
  saljtyp: "Eget virke",
  internKommentar: "",
  externKommentar: "",
  certifiering: "",
  kundensArtNr: "",
  visaKund: false,
};

const existingDraft: PriceRowDraft = {
  artNr: "2202209500002000",
  produkt: "22x95 Furu Trall G4-2 NTR AB",
  fakturatext: "",
  pakettyp: "Lp",
  langd: "4,2",
  emballage: "Standard",
  bunt: "1",
  folie: "Nej",
  fakturaEnhet: "m3 nominell",
  pris: "9,73",
  saljtyp: "Eget virke",
  internKommentar: "",
  externKommentar: "",
  certifiering: "",
  kundensArtNr: "",
  visaKund: true,
};

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return <PictureAsPdfOutlinedIcon fontSize="small" />;
    case "doc":
    case "docx": return <DescriptionOutlinedIcon fontSize="small" />;
    case "xls":
    case "xlsx": return <TableChartOutlinedIcon fontSize="small" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp": return <ImageOutlinedIcon fontSize="small" />;
    case "zip":
    case "rar":
    case "7z": return <FolderZipOutlinedIcon fontSize="small" />;
    default: return <InsertDriveFileOutlinedIcon fontSize="small" />;
  }
}

export function PriceListRowDetailView({ priceRowId, onClose }: PriceListRowDetailViewProps) {
  const isNewPriceRow = priceRowId === "new";
  const [draft, setDraft] = useState<PriceRowDraft>(isNewPriceRow ? emptyDraft : existingDraft);
  const [savedDraft, setSavedDraft] = useState<PriceRowDraft>(isNewPriceRow ? emptyDraft : existingDraft);
  const [isEditing, setIsEditing] = useState(isNewPriceRow);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(["allmant", "dokument"]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const accordionWrapRef = useRef<HTMLDivElement | null>(null);

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    onClose?.();
  };

  const getFastTrackFocusableElements = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(`.${styles.lineItemRequiredControl} .MuiInputBase-root`));

  const handleFastTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
    const container = accordionWrapRef.current;
    if (!container) return;
    const controls = getFastTrackFocusableElements(container);
    if (controls.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const currentIndex = controls.findIndex((el) => el === active || el.contains(active));
    event.preventDefault();
    if (currentIndex === -1) { controls[0]?.focus(); return; }
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + controls.length) % controls.length
      : (currentIndex + 1) % controls.length;
    controls[nextIndex]?.focus();
  };

  const update = (key: keyof PriceRowDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const togglePanel = (panel: string) =>
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );

  const handleAddFile = () => {
    setUploadedFiles((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: `prislisterad_dokument_${prev.length + 1}.pdf`,
        addedAt: new Date(),
      },
    ]);
  };

  const handleRemoveFile = (id: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handleAddFile(); };

  return (
    <>
      <div className={styles.contractModernTopRow}>
        <div className={styles.contractModernTitleWrap}>
          <Typography className={styles.contractModernTitle}>
            {isNewPriceRow ? "Ny prislisterad" : `Prislisterad ${priceRowId}`}
          </Typography>
        </div>
        <div className={styles.contractModernTopActions}>
          {isEditing ? (
            <>
              <Button
                className={styles.contractSaveButton}
                size="small"
                onClick={() => { setSavedDraft(draft); setIsEditing(false); }}
              >
                {isNewPriceRow ? "Skapa prislisterad" : "Spara"}
              </Button>
              <Button
                className={styles.contractQuickActionButton}
                size="small"
                onClick={() => { setDraft(savedDraft); setIsEditing(false); }}
              >
                Avbryt
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<EditOutlinedIcon fontSize="small" />}
                onClick={() => setIsEditing(true)}
              >
                Redigera
              </Button>
              {onClose && (
                <Button className={styles.contractQuickActionButton} size="small" onClick={onClose}>
                  Stäng
                </Button>
              )}
              {!isNewPriceRow && (
                <>
                  <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
                  <Tooltip title="Ta bort">
                    <IconButton
                      size="small"
                      className={styles.contractHeaderDotsButton}
                      aria-label="Ta bort prislisterad"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className={`${styles.detailTwoColumnLayout} ${styles.lineItemCreateStackLayout} ${styles.contractCreateLayout}`}
        style={{ flex: 1, overflowY: "auto" }}
      >
        <div className={styles.detailFormColumn}>
          <div
            ref={accordionWrapRef}
            className={styles.contractModernAccordionWrap}
            onKeyDownCapture={handleFastTrackKeyDown}
          >

            <div className={styles.lineItemFastTrackBar}>
              <div className={styles.lineItemFastTrackMain}>
                <span className={styles.lineItemFastTrackTitle}>Snabbspår</span>
                <span className={styles.lineItemFastTrackDivider} aria-hidden="true">-</span>
                <span className={styles.lineItemFastTrackText}>Tryck Ctrl+Enter för att hoppa mellan obligatoriska fält</span>
              </div>
            </div>

            {/* ── Allmänt ── */}
            <Accordion
              expanded={expandedPanels.includes("allmant")}
              onChange={() => togglePanel("allmant")}
              disableGutters
              elevation={0}
              className={styles.contractSectionAccordion}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                <span className={styles.contractSectionTitleRow}>
                  <TableChartOutlinedIcon className={styles.contractSectionIcon} />
                  <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                </span>
              </AccordionSummary>
              <AccordionDetails className={styles.contractSectionDetailsArea}>
                <div className={styles.contractModernFormGrid}>

                  {/* ArtNr — select with action button, same pattern as Ny kontraktrad */}
                  <div className={styles.lineItemFieldWithAction}>
                    <FormControl
                      size="small"
                      fullWidth
                      className={`${styles.lineItemRequiredControl} ${styles.lineItemFieldActionInput}`}
                    >
                      <InputLabel>ArtNr</InputLabel>
                      <Select
                        label="ArtNr"
                        value={draft.artNr}
                        onChange={(e) => update("artNr", String(e.target.value))}
                      >
                        <MenuItem value="">-</MenuItem>
                        {ART_NR_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      size="small"
                      className={styles.lineItemFieldActionButton}
                      disabled={!draft.artNr}
                      title="Öppna produktdetalj"
                      aria-label="Öppna produktdetalj"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </div>

                  <TextField
                    fullWidth size="small"
                    label="Produkt"
                    value={draft.produkt}
                    onChange={(e) => update("produkt", e.target.value)}
                  />

                  <TextField
                    fullWidth size="small"
                    label="Fakturatext"
                    value={draft.fakturatext}
                    onChange={(e) => update("fakturatext", e.target.value)}
                  />

                  <TextField
                    select fullWidth size="small"
                    label="Pakettyp"
                    value={draft.pakettyp}
                    onChange={(e) => update("pakettyp", e.target.value)}
                    className={styles.lineItemRequiredControl}
                  >
                    <MenuItem value="Lp">Lp</MenuItem>
                    <MenuItem value="Pk">Pk</MenuItem>
                  </TextField>

                  <TextField
                    select fullWidth size="small"
                    label="Längd"
                    value={draft.langd}
                    onChange={(e) => update("langd", e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    {["2,7", "3,0", "3,6", "3,9", "4,2", "4,5", "4,8", "5,1", "5,4", "5,7", "6,0"].map((l) => (
                      <MenuItem key={l} value={l}>{l}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select fullWidth size="small"
                    label="Emballage"
                    value={draft.emballage}
                    onChange={(e) => update("emballage", e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    {["Standard", "Plast", "Papper", "Utan"].map((o) => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth size="small"
                    label="Bunt"
                    value={draft.bunt}
                    onChange={(e) => update("bunt", e.target.value)}
                  />

                  <TextField
                    select fullWidth size="small"
                    label="Folie"
                    value={draft.folie}
                    onChange={(e) => update("folie", e.target.value)}
                  >
                    <MenuItem value="Nej">Nej</MenuItem>
                    <MenuItem value="Ja">Ja</MenuItem>
                  </TextField>

                  <TextField
                    select fullWidth size="small"
                    label="Fakturaenhet"
                    value={draft.fakturaEnhet}
                    onChange={(e) => update("fakturaEnhet", e.target.value)}
                    className={styles.lineItemRequiredControl}
                  >
                    {["m3 nominell", "m3 aktuell", "lpm", "m2", "paket", "st"].map((o) => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth size="small"
                    label="Pris"
                    value={draft.pris}
                    onChange={(e) => update("pris", e.target.value)}
                    className={styles.lineItemRequiredControl}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">SEK/m3 nominell</InputAdornment>,
                    }}
                  />

                  <TextField
                    select fullWidth size="small"
                    label="Säljtyp"
                    value={draft.saljtyp}
                    onChange={(e) => update("saljtyp", e.target.value)}
                    className={styles.lineItemRequiredControl}
                  >
                    {["Eget virke", "Inköp", "Agentur"].map((o) => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth size="small"
                    label="Intern kommentar"
                    value={draft.internKommentar}
                    onChange={(e) => update("internKommentar", e.target.value)}
                  />

                  <TextField
                    fullWidth size="small"
                    label="Extern kommentar"
                    value={draft.externKommentar}
                    onChange={(e) => update("externKommentar", e.target.value)}
                  />

                  <TextField
                    select fullWidth size="small"
                    label="Certifiering"
                    value={draft.certifiering}
                    onChange={(e) => update("certifiering", e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    <MenuItem value="FSC">FSC</MenuItem>
                    <MenuItem value="PEFC">PEFC</MenuItem>
                    <MenuItem value="FSC & PEFC">FSC &amp; PEFC</MenuItem>
                  </TextField>

                  <div
                    style={{
                      border: "1px solid rgba(0,0,0,0.23)",
                      borderRadius: 7,
                      padding: "5px 14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.visaKund}
                          onChange={(e) => update("visaKund", e.target.checked)}
                          style={{ paddingTop: 2, paddingBottom: 2 }}
                        />
                      }
                      label={<Typography style={{ fontSize: 13 }}>Visa kund</Typography>}
                    />
                  </div>

                  <TextField
                    fullWidth size="small"
                    label="Kundens ArtNr"
                    value={draft.kundensArtNr}
                    onChange={(e) => update("kundensArtNr", e.target.value)}
                    helperText="Endast vid ehandel för att skilja prislisterader åt med samma produkt/pakettyp"
                    style={{ gridColumn: "1 / -1" }}
                  />



                </div>

              </AccordionDetails>
            </Accordion>

            {/* ── Dokument ── */}
            <Accordion
              expanded={expandedPanels.includes("dokument")}
              onChange={() => togglePanel("dokument")}
              disableGutters
              elevation={0}
              className={styles.contractSectionAccordion}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                <span className={styles.contractSectionTitleRow}>
                  <FolderOpenOutlinedIcon className={styles.contractSectionIcon} />
                  <Typography className={styles.contractSectionTitle}>
                    Dokument
                    {uploadedFiles.length > 0 && (
                      <Chip label={uploadedFiles.length} size="small" className={styles.contractSectionCountChip} sx={{ ml: 1 }} />
                    )}
                  </Typography>
                </span>
              </AccordionSummary>
              <AccordionDetails className={styles.contractSectionDetailsArea}>
                <Stack spacing={1.5}>
                  <Paper
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    elevation={0}
                    className={`${styles.contractCreateDropZone} ${isDragOver ? styles.contractCreateDropZoneActive : ""}`}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Dra och släpp filer här</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>eller</Typography>
                      <Button variant="outlined" size="small" startIcon={<AttachFileOutlinedIcon />} onClick={handleAddFile}>
                        Välj filer
                      </Button>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>PDF, Word, Excel, bilder — max 20 MB per fil</Typography>
                    </Stack>
                  </Paper>
                  {uploadedFiles.length > 0 && (
                    <>
                      <Typography className={styles.contractCreateFilesTitle}>BIFOGADE FILER ({uploadedFiles.length})</Typography>
                      <Stack spacing={0.5}>
                        {uploadedFiles.map((file) => (
                          <Paper key={file.id} elevation={0} className={styles.contractCreateDocFileRow}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {getFileIcon(file.name)}
                              <div>
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{file.name}</Typography>
                                <Typography variant="caption" sx={{ color: "text.disabled" }}>{file.addedAt.toLocaleString("sv-SE")}</Typography>
                              </div>
                            </Stack>
                            <IconButton size="small" onClick={() => handleRemoveFile(file.id)}>
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

          </div>
        </div>
      </div >

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontSize={16}>Ta bort prislisterad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" lineHeight={1} marginBottom={0}>
            Vill du ta bort prislisterad {priceRowId}? Åtgärden går inte att ångra.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ margin: "0 12px 12px 0" }}>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm} sx={{ textTransform: "none" }}>
            Ta bort
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => setIsDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

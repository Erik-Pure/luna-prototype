"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningIcon from "@mui/icons-material/Warning";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import styles from "../../page.module.scss";
import { ENHET_OPTIONS } from "./PaketbokningView";

type ContainerVolymRow = {
  enhet: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  volym: string;
  volymIContainer: string;
  delAvContainer: string;
};

type ContainerTableRow = {
  enhet: string;
  artNr: string;
  fakturatext: string;
  pakettyp: string;
  volym: string;
  nummer: string;
  delAvContainer: string;
};

const CONTAINER_VOLYM_COLUMNS = [
  { key: "enhet", label: "Enhet", width: 210 },
  { key: "artNr", label: "ArtNr", width: 80 },
  { key: "fakturatext", label: "Fakturatext", width: 180 },
  { key: "pakettyp", label: "Pakettyp", width: 90 },
  { key: "volym", label: "Volym", width: 80 },
  { key: "volymIContainer", label: "Volym i container", width: 140 },
  { key: "delAvContainer", label: "Del av container", width: 120 },
];


const INITIAL_VOLYM_ROWS: ContainerVolymRow[] = [
  { enhet: "BP Hammerdal Byggprodukter", artNr: "22120", fakturatext: "Gran flisad spå", pakettyp: "Lp", volym: "48", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "BP Hammerdal Byggprodukter", artNr: "22121", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "48", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "BP Hammerdal Byggprodukter", artNr: "22123", fakturatext: "45x145 Konstruktionsvirke", pakettyp: "Paket", volym: "96", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "BP Hissmofors Byggprodukter", artNr: "22122", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "12", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "BP Hissmofors Byggprodukter", artNr: "22124", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "18", volymIContainer: "48", delAvContainer: "false" },
  { enhet: "NT Kåge Såg", artNr: "22125", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "24", volymIContainer: "48", delAvContainer: "true" },
  { enhet: "NT Kåge Såg", artNr: "22126", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "12", volymIContainer: "48", delAvContainer: "false" },
];

const INITIAL_CONTAINER_ROWS: ContainerTableRow[] = [
  { enhet: "HA", artNr: "22120", fakturatext: "Gran flisad spå", pakettyp: "Lp", volym: "48", nummer: "1", delAvContainer: "false" },
  { enhet: "HA", artNr: "22121", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "144", nummer: "2", delAvContainer: "false" },
  { enhet: "HS", artNr: "22122", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "14", nummer: "0", delAvContainer: "true" },
  { enhet: "HS", artNr: "22124", fakturatext: "Furu hyvlad", pakettyp: "Lp", volym: "12", nummer: "5", delAvContainer: "false" },
  { enhet: "KS", artNr: "22125", fakturatext: "Gran v-styrp", pakettyp: "Lp", volym: "18", nummer: "5", delAvContainer: "false" },
  { enhet: "KS", artNr: "22126", fakturatext: "22x95 Gran Ytterpanel", pakettyp: "Lp", volym: "8", nummer: "0", delAvContainer: "true" },
];

type ContainerViewProps = {
  onBack: () => void;
};

export function ContainerView({ onBack }: ContainerViewProps) {
  const [activeTab, setActiveTab] = useState<"volym" | "containrar">("volym");
  const [visaEnhet, setVisaEnhet] = useState("");
  const [containerVolym, setContainerVolym] = useState("48");
  const [rows, setRows] = useState<ContainerVolymRow[]>(INITIAL_VOLYM_ROWS);
  const [containerRows, setContainerRows] = useState<ContainerTableRow[]>(INITIAL_CONTAINER_ROWS);
  // Tracks selection by original (unsorted) array index
  const [selectedOriginalIndices, setSelectedOriginalIndices] = useState<Set<number>>(new Set());
  const [kapacitetOpen, setKapacitetOpen] = useState(false);
  const [kapacitetDraft, setKapacitetDraft] = useState("");
  const [delAvExpanded, setDelAvExpanded] = useState(true);
  const [helExpanded, setHelExpanded] = useState(true);
  const [flyttaToast, setFlyttaToast] = useState<{ open: boolean; message: string; key: number }>({ open: false, message: "", key: 0 });
  const [containrarUnlocked, setContainrarUnlocked] = useState(false);
  const [kundmarkeDialogOpen, setKundmarkeDialogOpen] = useState(false);
  const [kundmarkeDraft, setKundmarkeDraft] = useState("");
  const [raderaDialogOpen, setRaderaDialogOpen] = useState(false);
  const [delAvSammanfattningOpen, setDelAvSammanfattningOpen] = useState(false);

  // ── Volym tab ────────────────────────────────────────────────────────────────

  const filteredVolymIndices = useMemo(
    () => rows.reduce<number[]>((acc, r, i) => {
      if (!visaEnhet || r.enhet === visaEnhet) acc.push(i);
      return acc;
    }, []),
    [rows, visaEnhet]
  );

  const filteredRows = filteredVolymIndices.map((i) => rows[i]!);

  const updateVolymIContainer = (filteredIdx: number, value: string) => {
    const originalIdx = filteredVolymIndices[filteredIdx];
    if (originalIdx === undefined) return;
    setRows((prev) => {
      const next = [...prev];
      next[originalIdx] = { ...next[originalIdx]!, volymIContainer: value };
      return next;
    });
  };

  const toggleDelAvContainer = (filteredIdx: number) => {
    const originalIdx = filteredVolymIndices[filteredIdx];
    if (originalIdx === undefined) return;
    setRows((prev) => {
      const next = [...prev];
      next[originalIdx] = {
        ...next[originalIdx]!,
        delAvContainer: next[originalIdx]!.delAvContainer === "true" ? "false" : "true",
      };
      return next;
    });
  };

  const totalVolym = filteredRows.reduce((sum, r) => sum + (parseFloat(r.volym) || 0), 0);
  const totalVolymIContainer = filteredRows.reduce((sum, r) => sum + (parseFloat(r.volymIContainer) || 0), 0);

  // ── Containrar tab ────────────────────────────────────────────────────────────

  const { delAvContainerGroups, helContainerGroups } = useMemo(() => {
    const buildGroups = (flag: string) => {
      const map = new Map<string, number[]>();
      containerRows.forEach((r, i) => {
        if (r.delAvContainer !== flag) return;
        if (!map.has(r.nummer)) map.set(r.nummer, []);
        map.get(r.nummer)!.push(i);
      });
      return Array.from(map.entries())
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([nummer, idxs]) => ({
          nummer,
          originalIndices: idxs,
          totalVolym: idxs.reduce((sum, i) => sum + (parseFloat(containerRows[i]!.volym) || 0), 0),
        }));
    };
    return { delAvContainerGroups: buildGroups("true"), helContainerGroups: buildGroups("false") };
  }, [containerRows]);

  const toggleContainerRowSelection = (originalIdx: number) => {
    setSelectedOriginalIndices((prev) => {
      const next = new Set(prev);
      if (next.has(originalIdx)) next.delete(originalIdx);
      else next.add(originalIdx);
      return next;
    });
  };

  const handleFlyttaTillHel = () => {
    const nummers = [...new Set(
      Array.from(selectedOriginalIndices).map((i) => containerRows[i]!.nummer)
    )].sort((a, b) => parseInt(a) - parseInt(b));
    const label = nummers.length === 1
      ? `Container ${nummers[0]}`
      : `Container ${nummers.join(", ")}`;
    setContainerRows((prev) => prev.map((r, i) =>
      selectedOriginalIndices.has(i) ? { ...r, delAvContainer: "false" } : r
    ));
    setSelectedOriginalIndices(new Set());
    setFlyttaToast((prev) => ({ open: true, message: `Flyttad till ${label}`, key: prev.key + 1 }));
  };

  const handleFlyttaTillDel = () => {
    setContainerRows((prev) => prev.map((r, i) =>
      selectedOriginalIndices.has(i) ? { ...r, delAvContainer: "true" } : r
    ));
    setSelectedOriginalIndices(new Set());
  };

  const selectedDelAvEnheter = new Set(
    Array.from(selectedOriginalIndices)
      .filter((i) => containerRows[i]?.delAvContainer === "true")
      .map((i) => containerRows[i]!.enhet)
  );
  const flyttaTillHelEnhetMismatch = selectedDelAvEnheter.size > 1;
  const canFlyttaTillHel = selectedDelAvEnheter.size > 0 && !flyttaTillHelEnhetMismatch;
  const canFlyttaTillDel = Array.from(selectedOriginalIndices).some((i) => containerRows[i]?.delAvContainer === "false");

  // Assigns the lowest nummer among selected rows to all selected rows.
  const handleSamfrakta = () => {
    if (selectedOriginalIndices.size < 2) return;
    const indices = Array.from(selectedOriginalIndices);
    const minNummer = Math.min(...indices.map((i) => parseInt(containerRows[i]!.nummer) || 0));
    setContainerRows((prev) => {
      const next = [...prev];
      for (const i of indices) {
        next[i] = { ...next[i]!, nummer: String(minNummer) };
      }
      return next;
    });
    setSelectedOriginalIndices(new Set());
  };

  const canSamfrakta = selectedOriginalIndices.size > 1;

  const delAvSammanfattning = useMemo(() => {
    const map = new Map<string, { volym125: number; volymTP: number; volymOvriga: number }>();
    rows.filter((r) => r.delAvContainer === "true").forEach((r) => {
      const bolag = r.enhet;
      if (!map.has(bolag)) map.set(bolag, { volym125: 0, volymTP: 0, volymOvriga: 0 });
      const entry = map.get(bolag)!;
      const vol = parseFloat(r.volymIContainer) || 0;
      const nr = parseInt(r.artNr);
      if (nr % 3 === 0) entry.volym125 += vol;
      else if (nr % 3 === 1) entry.volymTP += vol;
      else entry.volymOvriga += vol;
    });
    return Array.from(map.entries()).map(([bolag, vols]) => ({ bolag, ...vols }));
  }, [rows]);

  const containerActionItems = [
    {
      key: "spara",
      label: "Spara",
      // icon: <SaveOutlinedIcon fontSize="small" />,
      tone: "primary" as const,
      enabled: true,
      onClick: () => { },
    },
    { key: "divider1", kind: "divider" as const },
    {
      key: "radera",
      label: "Radera containrar",
      icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
      enabled: true,
      onClick: () => setRaderaDialogOpen(true),
    },
    {
      key: "kundmarke",
      label: "Sätt kundens märke",
      icon: <LabelOutlinedIcon fontSize="small" />,
      enabled: true,
      onClick: () => { setKundmarkeDraft(""); setKundmarkeDialogOpen(true); },
    },
    // {
    //   key: "samfrakta",
    //   label: "Samfrakta",
    //   icon: <LocalShippingOutlinedIcon fontSize="small" />,
    //   enabled: canSamfrakta,
    //   onClick: handleSamfrakta,
    // },
    { key: "divider2", kind: "divider" as const },
    {
      key: "flytta-till-hel",
      label: "Flytta till Hel container",
      enabled: canFlyttaTillHel,
      title: flyttaTillHelEnhetMismatch ? "Enhet måste vara samma" : undefined,
      onClick: handleFlyttaTillHel,
    },
    {
      key: "flytta-till-del",
      label: "Flytta till Del av container",
      enabled: canFlyttaTillDel,
      onClick: handleFlyttaTillDel,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className={styles.contractModernTopRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton size="small" onClick={onBack} title="Tillbaka">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography className={styles.contractModernTitle}>Container</Typography>
        </div>
        <div className={styles.contractModernTopActions} />
      </div>

      {/* Wizard bar */}
      <div className={styles.lineItemWizardBar} style={{ top: "40px" }}>
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${activeTab === "volym" ? styles.lineItemWizardStepActive : ""}`} onClick={() => setActiveTab("volym")}
        >
          <span className={styles.lineItemWizardStepDot}>1</span>
          <span className={styles.lineItemWizardStepLabel}>Volym</span>
        </button>
        <div className={styles.lineItemWizardConnector} />
        <button
          type="button"
          className={`${styles.lineItemWizardStep} ${activeTab === "containrar" ? styles.lineItemWizardStepActive : ""} ${!containrarUnlocked ? styles.lineItemWizardStepLocked : ""}`}
          onClick={containrarUnlocked ? () => setActiveTab("containrar") : undefined}
          disabled={!containrarUnlocked}
        >
          <span className={styles.lineItemWizardStepDot}>2</span>
          <span className={styles.lineItemWizardStepLabel}>Containrar</span>
        </button>
      </div>

      {activeTab === "volym" ? (
        <div className={styles.paketbokningLayout}>
          <ActionRow
            items={[
              {
                key: "skapa-containrar",
                label: "Skapa containrar",
                tone: "primary" as const,
                enabled: true,
                onClick: () => { setContainrarUnlocked(true); setActiveTab("containrar"); },
              },
              {
                key: "kapacitet",
                label: "Volym i container",
                icon: <EditOutlinedIcon fontSize="small" />,
                enabled: true,
                onClick: () => { setKapacitetDraft(containerVolym); setKapacitetOpen(true); },
              },
              { key: "divider1", kind: "divider" as const },
              {
                key: "visa-enhet",
                kind: "node" as const,
                node: (
                  <Select
                    size="small"
                    value={visaEnhet}
                    displayEmpty
                    className={styles.containerViewEnhetSelect}
                    onChange={(e) => setVisaEnhet(e.target.value)}
                    renderValue={(v) => v || "Alla enheter"}
                  >
                    <MenuItem value=""><em>Alla enheter</em></MenuItem>
                    {ENHET_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </Select>
                ),
              },
            ]}
          />

          <div className={styles.paketbokningTableWrap}>
            <DataTable
              variant="line"
              fillRemainingSpace
              columns={CONTAINER_VOLYM_COLUMNS}
              rows={filteredRows}
              rowKey={(row, index) => `cv-${(row as ContainerVolymRow).artNr}-${index}`}
              selectedRowIndex={null}
              onRowClick={() => { }}
              renderCell={(row, column, rowIndex) => {
                const r = row as ContainerVolymRow;
                if (column.key === "volymIContainer") {
                  return (
                    <TextField
                      size="small"
                      value={r.volymIContainer}
                      onChange={(e) => updateVolymIContainer(rowIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      variant="outlined"
                      className={styles.containerViewCellInput}
                    />
                  );
                }
                if (column.key === "delAvContainer") {
                  return (
                    <Checkbox
                      size="small"
                      checked={r.delAvContainer === "true"}
                      onChange={() => toggleDelAvContainer(rowIndex)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ padding: "2px" }}
                    />
                  );
                }
                return (r as unknown as Record<string, string>)[column.key] ?? "-";
              }}
            />
          </div>

          <div className={styles.paketbokningFooter}>
            <div className={styles.paketbokningFooterItem}>
              <span className={styles.paketbokningFooterLabel}>Total volym</span>
              <span className={styles.paketbokningFooterValue}>{totalVolym.toFixed(2)} m³</span>
            </div>
            <div className={styles.paketbokningFooterItem}>
              <span className={styles.paketbokningFooterLabel}>Volym i container</span>
              <span className={styles.paketbokningFooterValue}>{totalVolymIContainer.toFixed(2)} m³</span>
            </div>
            <div className={styles.paketbokningFooterItem}>
              <span className={styles.paketbokningFooterLabel}>Del av container</span>
              <button
                type="button"
                onClick={() => setDelAvSammanfattningOpen(true)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#c47900", textDecoration: "underline" }}
              >
                Visa sammanfattning
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.paketbokningLayout}>
          <ActionRow items={containerActionItems} />

          <div className={styles.paketbokningTableWrap}>
            {/* Column header */}
            <div className={styles.ctHeaderRow}>
              <div className={styles.ctColCheck} />
              <div className={`${styles.ctHeaderCell} ${styles.ctColEnhet}`}>Enhet</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColArtNr}`}>ArtNr</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColText}`}>Fakturatext</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColPaket}`}>Pakettyp</div>
              <div className={`${styles.ctHeaderCell} ${styles.ctColVolym}`}>Volym</div>
            </div>

            {(() => {
              const maxVol = parseFloat(containerVolym);
              const hasMax = !isNaN(maxVol) && containerVolym !== "";

              const renderFlatRows = (groups: typeof delAvContainerGroups, prefix: string) =>
                groups.flatMap(({ originalIndices }) =>
                  originalIndices.map((originalIdx) => {
                    const r = containerRows[originalIdx]!;
                    const isSelected = selectedOriginalIndices.has(originalIdx);
                    return (
                      <div
                        key={`${prefix}-flat-${originalIdx}`}
                        className={`${styles.ctItemRow} ${isSelected ? styles.ctItemRowSelected : ""}`}
                        onClick={() => toggleContainerRowSelection(originalIdx)}
                      >
                        <div className={styles.ctColCheck}>
                          <Checkbox size="small" checked={isSelected} onChange={() => toggleContainerRowSelection(originalIdx)} onClick={(e) => e.stopPropagation()} sx={{ padding: "2px" }} />
                        </div>
                        <div className={styles.ctColEnhet}>{r.enhet}</div>
                        <div className={styles.ctColArtNr}>{r.artNr}</div>
                        <div className={styles.ctColText}>{r.fakturatext}</div>
                        <div className={styles.ctColPaket}>{r.pakettyp}</div>
                        <div className={styles.ctColVolym}>{r.volym}</div>
                      </div>
                    );
                  })
                );

              const renderGroups = (groups: typeof delAvContainerGroups, prefix: string) =>
                groups.map(({ nummer, originalIndices, totalVolym: groupVol }) => {
                  const startNr = parseInt(nummer);
                  const numContainers = hasMax && maxVol > 0 ? Math.ceil(groupVol / maxVol) : 1;
                  const label = numContainers > 1
                    ? `Container ${startNr}–${startNr + numContainers - 1}`
                    : `Container ${startNr}`;
                  const volymText = numContainers > 1 ? `${maxVol} m³ / st` : `${groupVol} m³`;
                  const underCapacity = hasMax && groupVol < maxVol - 1;
                  return (
                    <Fragment key={`${prefix}-group-${nummer}`}>
                      <div className={styles.ctGroupRow}>
                        <div className={styles.ctGroupRowTitle}>
                          {underCapacity && (
                            <Tooltip title={`Under kapacitet (max ${containerVolym} m³)`}>
                              <WarningIcon sx={{ fontSize: 15, color: "#e6a817", mr: "8px" }} />
                            </Tooltip>
                          )}
                          {label}
                        </div>
                        <span className={styles.ctGroupRowVolym}>{volymText}</span>
                      </div>
                      {originalIndices.map((originalIdx) => {
                        const r = containerRows[originalIdx]!;
                        const isSelected = selectedOriginalIndices.has(originalIdx);
                        return (
                          <div
                            key={`${prefix}-${originalIdx}`}
                            className={`${styles.ctItemRow} ${isSelected ? styles.ctItemRowSelected : ""}`}
                            onClick={() => toggleContainerRowSelection(originalIdx)}
                          >
                            <div className={styles.ctColCheck}>
                              <Checkbox size="small" checked={isSelected} onChange={() => toggleContainerRowSelection(originalIdx)} onClick={(e) => e.stopPropagation()} sx={{ padding: "2px" }} />
                            </div>
                            <div className={styles.ctColEnhet}>{r.enhet}</div>
                            <div className={styles.ctColArtNr}>{r.artNr}</div>
                            <div className={styles.ctColText}>{r.fakturatext}</div>
                            <div className={styles.ctColPaket}>{r.pakettyp}</div>
                            <div className={styles.ctColVolym}>{r.volym}</div>
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                });

              return (
                <>
                  {/* Del av container */}
                  <div className={styles.ctCategoryRow} onClick={() => setDelAvExpanded((v) => !v)}>
                    {delAvExpanded
                      ? <ExpandMoreIcon fontSize="small" className={styles.ctCategoryIcon} />
                      : <ChevronRightIcon fontSize="small" className={styles.ctCategoryIcon} />}
                    <span className={styles.ctCategoryLabel}>Del av container</span>
                  </div>
                  {delAvExpanded && (
                    delAvContainerGroups.length === 0
                      ? <div className={styles.ctEmptyState}>Inga rader</div>
                      : renderFlatRows(delAvContainerGroups, "del")
                  )}

                  {/* Hel container */}
                  {(() => {
                    const helHasWarning = hasMax && helContainerGroups.some(({ totalVolym: v }) => v < maxVol - 1);
                    return (
                      <div className={styles.ctCategoryRow} onClick={() => setHelExpanded((v) => !v)}>
                        {helExpanded
                          ? <ExpandMoreIcon fontSize="small" className={styles.ctCategoryIcon} />
                          : <ChevronRightIcon fontSize="small" className={styles.ctCategoryIcon} />}
                        <span className={styles.ctCategoryLabel}>Hel container</span>
                        {helHasWarning && (
                          <Tooltip title="En eller flera containrar är under kapacitet">
                            <WarningIcon sx={{ fontSize: 15, color: "#e6a817", ml: "8px" }} />
                          </Tooltip>
                        )}
                      </div>
                    );
                  })()}
                  {helExpanded && (
                    helContainerGroups.length === 0
                      ? <div className={styles.ctEmptyState}>Inga rader</div>
                      : renderGroups(helContainerGroups, "hel")
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      <Dialog open={kapacitetOpen} onClose={() => setKapacitetOpen(false)} maxWidth="xs" fullWidth PaperProps={{ className: styles.freightDialogPaper }}>
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Volym i container</Typography>
            <IconButton size="small" onClick={() => setKapacitetOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent} style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          <Typography style={{ fontSize: 14, color: "#4e5155", marginBottom: 6 }}>
            Uppdatera rader med {"\""}Volym i container{"\""} = {containerVolym} m³ till:
          </Typography>
          <TextField
            autoFocus
            size="small"
            label="Volym i container (m³)"
            value={kapacitetDraft}
            onChange={(e) => setKapacitetDraft(e.target.value)}
            placeholder="m³"
            fullWidth
          />
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button variant="contained" size="small" onClick={() => {
            setRows((prev) => prev.map((r) => (r.volymIContainer === containerVolym ? { ...r, volymIContainer: kapacitetDraft } : r)));
            setContainerVolym(kapacitetDraft);
            setKapacitetOpen(false);
          }} className={styles.bytPrislistaOkButton}>
            Spara
          </Button>
          <Button variant="outlined" size="small" onClick={() => setKapacitetOpen(false)} className={styles.bytPrislistaAvbrytButton}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={raderaDialogOpen}
        onClose={() => setRaderaDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Radera containrar</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Typography style={{ fontSize: 13 }}>
            Är du säker på att du vill radera de valda containrarna?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightDeleteButton} onClick={() => setRaderaDialogOpen(false)}>
            Radera
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setRaderaDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={kundmarkeDialogOpen}
        onClose={() => setKundmarkeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <span>Sätt kundens märke</span>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <div className={styles.freightFormField} style={{ marginTop: 4 }}>
            <Typography className={styles.freightFormLabel}>Kundens märke</Typography>
            <TextField
              size="small"
              fullWidth
              autoFocus
              value={kundmarkeDraft}
              onChange={(e) => setKundmarkeDraft(e.target.value)}
              className={styles.freightFormInput}
            />
          </div>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" className={styles.freightSaveButton} onClick={() => setKundmarkeDialogOpen(false)}>
            Spara
          </Button>
          <Button size="small" className={styles.freightCancelButton} onClick={() => setKundmarkeDialogOpen(false)}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={delAvSammanfattningOpen}
        onClose={() => setDelAvSammanfattningOpen(false)}
        maxWidth="md"
        fullWidth
        classes={{ paper: styles.freightDialogPaper }}
      >
        <DialogTitle className={styles.freightDialogTitle}>
          <div className={styles.freightDialogTitleRow}>
            <Typography style={{ fontSize: 16, fontWeight: 700, color: "#2f3743" }}>Sammanfattning – Del av container</Typography>
            <IconButton size="small" onClick={() => setDelAvSammanfattningOpen(false)} style={{ color: "#6a7483" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={styles.freightDialogContent}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bolag</TableCell>
                <TableCell align="right">Volym 125</TableCell>
                <TableCell align="right">Volym TP</TableCell>
                <TableCell align="right">Volym övriga</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delAvSammanfattning.map((row) => (
                <TableRow key={row.bolag}>
                  <TableCell>{row.bolag}</TableCell>
                  <TableCell align="right">{row.volym125 > 0 ? `${row.volym125} m³` : "–"}</TableCell>
                  <TableCell align="right">{row.volymTP > 0 ? `${row.volymTP} m³` : "–"}</TableCell>
                  <TableCell align="right">{row.volymOvriga > 0 ? `${row.volymOvriga} m³` : "–"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions className={styles.freightDialogActions}>
          <Button size="small" variant="outlined" onClick={() => setDelAvSammanfattningOpen(false)} className={styles.bytPrislistaAvbrytButton}>
            Stäng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={flyttaToast.key}
        open={flyttaToast.open}
        autoHideDuration={2200}
        onClose={() => setFlyttaToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setFlyttaToast((prev) => ({ ...prev, open: false }))}
        >
          {flyttaToast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

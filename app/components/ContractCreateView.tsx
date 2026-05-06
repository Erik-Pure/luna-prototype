"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Checkbox,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    TextField,
    Typography,
    Paper,
    Stack
} from "@mui/material";
import { useState } from "react";
import styles from "../page.module.scss";

export type NewContractDraft = {
    // Obligatoriska
    customer: string;
    status: string;
    createdBy: string;
    contractDate: string;
    language: string;
    currency: string;
    paymentTerms: string;
    certification: string;
    contractForm: string;
    deliveryMethod: string;
    deliveryTerms: string;
    deliveryTermsCity: string;
    agent1: string;
    agent1Pct: string;
    deliveryLocation: string;
    deliveryLocationPostalCode: string;

    // Valfria
    customerRef: string;
    priceList: string;
    externalContractNumber: string;
    priceAdjustPct: string;
    category: string;
    country: string;
    contractType: string;
    validUntil: string;
    miscNote: string;
    internalNote: string;
    exchangeRateDate: string;
    vat: string;
    exchangeRate: string;
    paymentTermsDays: string;
    cashDiscount: string;
    bonus: string;
    bonusBase: string;
    pickingSurchargeMin: string;
    pickingSurchargePct: string;
    paintingSurcharge: string;
    paintingSurchargeThreshold: string;
    importFee: string;
    consignmentStock: boolean;
    receiverCountry: string;
    deliveryPeriod: string;
    deliveryAddress: string;
    unloadingPhone: string;
    unloadingHours: string;
    notificationPhone: string;
    notificationInfo: string;
};

type UploadedFileItem = {
    id: string;
    name: string;
    size: string;
    addedAt: Date;
};

type CustomerData = {
    name: string;
    orgNr: string;
    language: string;
    paymentTerms: string;
    currency: string;
    customerComment?: string;
    internalComment?: string;
};

const emptyNewContractDraft: NewContractDraft = {
    customer: "",
    status: "Aktivt kontrakt",
    createdBy: "John Doe",
    contractDate: new Date().toISOString().split("T")[0],
    language: "Svenska",
    currency: "SEK",
    paymentTerms: "30 dagar netto",
    certification: "",
    contractForm: "",
    deliveryMethod: "Hämta",
    deliveryTerms: "FCA",
    deliveryTermsCity: "",
    agent1: "",
    agent1Pct: "0",
    deliveryLocation: "",
    deliveryLocationPostalCode: "",
    customerRef: "",
    priceList: "",
    externalContractNumber: "",
    priceAdjustPct: "",
    category: "Bygghandel",
    country: "Sverige",
    contractType: "Försäljningskontrakt",
    validUntil: "",
    miscNote: "",
    internalNote: "",
    exchangeRateDate: "",
    vat: "25",
    exchangeRate: "",
    paymentTermsDays: "",
    cashDiscount: "",
    bonus: "",
    bonusBase: "Bruttovärde",
    pickingSurchargeMin: "",
    pickingSurchargePct: "",
    paintingSurcharge: "",
    paintingSurchargeThreshold: "",
    importFee: "",
    consignmentStock: false,
    receiverCountry: "",
    deliveryPeriod: "",
    deliveryAddress: "",
    unloadingPhone: "",
    unloadingHours: "",
    notificationPhone: "",
    notificationInfo: ""
};

const mockCustomers: CustomerData[] = [
    {
        name: "Acme AB",
        orgNr: "556123-4567",
        language: "Svenska",
        paymentTerms: "30 dagar netto",
        currency: "SEK",
        customerComment: "Leverans sker alltid till huvudkontoret. Kontakta inköpschef Lars vid frågor.",
        internalComment: "Viktig kund — prioritera vid kapacitetsbrist."
    },
    {
        name: "Globex Corp",
        orgNr: "556987-6543",
        language: "English",
        paymentTerms: "14 dagar netto",
        currency: "EUR",
        customerComment: "Requires English documentation.",
        internalComment: "Long-standing account. Sensitive to price changes."
    },
    {
        name: "Initech HB",
        orgNr: "969100-0001",
        language: "Svenska",
        paymentTerms: "Förskott",
        currency: "SEK",
        customerComment: "Föredrar leverans på tisdagar.",
        internalComment: "Betalningshistorik OK."
    }
];

const mockDeliveryLocations = [
    { name: "Stockholm", postalCode: "111 20" },
    { name: "Stockholm", postalCode: "114 35" },
    { name: "Göteborg", postalCode: "411 17" },
    { name: "Göteborg", postalCode: "417 56" },
    { name: "Malmö", postalCode: "211 19" },
    { name: "Berlin", postalCode: "10115" }
];

const mockDeliveryAddresses = [
    "Byggmax Abildsö, Enebakkveien 309, NO-1188 OSLO, Norge",
    "Lager Stockholm, Industrigatan 12, 112 46 Stockholm, Sverige",
    "Göteborg Hamn, Hamnvägen 1, 417 07 Göteborg, Sverige"
];


export type ContractCreateViewProps = {
    onSave?: (draft: NewContractDraft, files: UploadedFileItem[]) => void;
    onCancel?: () => void;
};

export function ContractCreateView({ onSave, onCancel }: ContractCreateViewProps) {
    const [draft, setDraft] = useState<NewContractDraft>(emptyNewContractDraft);
    const [expandedPanels, setExpandedPanels] = useState<string[]>(["obligatoriska", "allmant", "villkor", "leverans", "dokument"]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

    const updateDraftField = (key: keyof NewContractDraft, value: string | boolean) => {
        setDraft((previous) => ({
            ...previous,
            [key]: value
        }));
    };

    const togglePanel = (panel: string) => {
        setExpandedPanels((previous) =>
            previous.includes(panel)
                ? previous.filter((item) => item !== panel)
                : [...previous, panel]
        );
    };

    const handleCustomerChange = (customerName: string) => {
        updateDraftField("customer", customerName);
        const customer = mockCustomers.find((c) => c.name === customerName);
        if (customer) {
            setSelectedCustomer(customer);
            updateDraftField("language", customer.language);
            updateDraftField("paymentTerms", customer.paymentTerms);
            updateDraftField("currency", customer.currency);
        } else {
            setSelectedCustomer(null);
        }
    };

    const handleDeliveryLocationChange = (locationName: string) => {
        updateDraftField("deliveryLocation", locationName);
        const location = mockDeliveryLocations.find((l) => l.name === locationName);
        if (location) {
            updateDraftField("deliveryLocationPostalCode", location.postalCode);
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setUploadedFiles((previous) => previous.filter((f) => f.id !== fileId));
    };

    const handleAddFile = () => {
        const newFile: UploadedFileItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: `dokument_${uploadedFiles.length + 1}.pdf`,
            size: "—",
            addedAt: new Date()
        };
        setUploadedFiles((previous) => [...previous, newFile]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleAddFile();
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "pdf":
                return <PictureAsPdfOutlinedIcon fontSize="small" />;
            case "doc":
            case "docx":
                return <DescriptionOutlinedIcon fontSize="small" />;
            case "xls":
            case "xlsx":
                return <TableChartOutlinedIcon fontSize="small" />;
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "webp":
                return <ImageOutlinedIcon fontSize="small" />;
            case "zip":
            case "rar":
            case "7z":
                return <FolderZipOutlinedIcon fontSize="small" />;
            default:
                return <InsertDriveFileOutlinedIcon fontSize="small" />;
        }
    };

    const handleSave = () => {
        onSave?.(draft, uploadedFiles);
    };

    const handleCancel = () => {
        onCancel?.();
    };

    const customerWarnings = (() => {
        switch (draft.customer) {
            case "Acme AB":
                return { exceededClaim: true, exceededLimit: false };
            case "Globex Corp":
                return { exceededClaim: false, exceededLimit: true };
            case "Initech HB":
                return { exceededClaim: true, exceededLimit: true };
            default:
                return { exceededClaim: false, exceededLimit: false };
        }
    })();

    return (
        <>
            <div className={styles.contractModernTopRow}>
                <div className={styles.contractModernTitleWrap}>
                    <Typography className={styles.contractModernTitle} style={{ letterSpacing: "-0.5px" }}>Nytt kontrakt</Typography>
                </div>
                <div className={styles.contractModernTopActions}>
                    <Button className={styles.contractQuickActionButton} size="small" onClick={handleCancel}>
                        Avbryt
                    </Button>
                    <Button className={styles.contractSaveButton} size="small" onClick={handleSave}>
                        Skapa kontrakt
                    </Button>
                </div>
            </div>

            <div className={`${styles.detailTwoColumnLayout} ${styles.lineItemCreateStackLayout} ${styles.contractCreateLayout}`} style={{ flex: 1, overflowY: "auto" }}>
                <div className={styles.detailFormColumn}>
                    <div className={styles.contractModernAccordionWrap}>

                        {/* ── OBLIGATORISKA FÄLT ── */}
                        <Accordion
                            expanded={expandedPanels.includes("obligatoriska")}
                            onChange={() => togglePanel("obligatoriska")}
                            className={`${styles.contractModernAccordion} ${styles.lineItemRequiredSection}`}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractModernAccordionSummary}>
                                <div className={styles.contractModernAccordionTitleRow}>
                                    <AssignmentTurnedInOutlinedIcon className={styles.contractModernAccordionIcon} />
                                    <Typography className={styles.contractModernAccordionTitle}>Obligatoriska fält</Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails className={styles.contractCreateRequiredContent}>
                                <Typography className={styles.contractCreateRequiredHint}>Alla fält nedan krävs för att skapa kontraktet</Typography>

                                {/* ── Allmänt ── */}
                                <Typography className={styles.contractSectionChip}>Allmänt</Typography>

                                {/* Kund — full-width standalone with search adornment */}
                                <div style={{ marginBottom: 10 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Kund *"
                                        value={draft.customer}
                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchOutlinedIcon fontSize="small" style={{ color: "#9aa3af" }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    >
                                        <MenuItem value="">— Välj kund —</MenuItem>
                                        {mockCustomers.map((c) => (
                                            <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>

                                {/* Customer warnings — immediately below Kund */}
                                {(customerWarnings.exceededClaim || customerWarnings.exceededLimit) && (
                                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                        {customerWarnings.exceededClaim && (
                                            <Chip label="Kunden har överskriden fordran" color="warning" size="medium" />
                                        )}
                                        {customerWarnings.exceededLimit && (
                                            <Chip label="Kunden har överskriden limit" color="error" size="medium" />
                                        )}
                                    </div>
                                )}

                                {/* Status, Upprättat av, Datum, Språk — explicit 2-col grid */}
                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Status *" value={draft.status} onChange={(e) => updateDraftField("status", e.target.value)} size="small">
                                        <MenuItem value="Aktivt kontrakt">Aktivt kontrakt</MenuItem>
                                        <MenuItem value="Utkast">Utkast</MenuItem>
                                        <MenuItem value="Avslutat">Avslutat</MenuItem>
                                        <MenuItem value="Pausat">Pausat</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Upprättat av *" value={draft.createdBy} onChange={(e) => updateDraftField("createdBy", e.target.value)} size="small">
                                        <MenuItem value="">— Välj person —</MenuItem>
                                        <MenuItem value="John Doe">John Doe</MenuItem>
                                        <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                                    </TextField>
                                    <TextField fullWidth type="date" value={draft.contractDate} onChange={(e) => updateDraftField("contractDate", e.target.value)} label="Kontraktsdatum *" InputLabelProps={{ shrink: true }} size="small" />
                                    <TextField select fullWidth label="Språk *" value={draft.language} onChange={(e) => updateDraftField("language", e.target.value)} size="small">
                                        <MenuItem value="Svenska">Svenska</MenuItem>
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="Deutsch">Deutsch</MenuItem>
                                    </TextField>
                                </div>

                                <div className={styles.contractCreateSectionDivider} />

                                {/* ── Villkor ── */}
                                <Typography className={styles.contractSectionChip}>Villkor</Typography>

                                {/* Row 1 – 3-col: Valuta, Betalningsvillkor, Certifiering */}
                                <div className={styles.contractFormGrid3} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Valuta *" value={draft.currency} onChange={(e) => updateDraftField("currency", e.target.value)} size="small">
                                        <MenuItem value="SEK">SEK</MenuItem>
                                        <MenuItem value="EUR">EUR</MenuItem>
                                        <MenuItem value="USD">USD</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Betalningsvillkor *" value={draft.paymentTerms} onChange={(e) => updateDraftField("paymentTerms", e.target.value)} size="small">
                                        <MenuItem value="30 dagar netto">30 dagar netto</MenuItem>
                                        <MenuItem value="14 dagar netto">14 dagar netto</MenuItem>
                                        <MenuItem value="Förskott">Förskott</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Certifiering *" value={draft.certification} onChange={(e) => updateDraftField("certification", e.target.value)} size="small">
                                        <MenuItem value="">— Välj —</MenuItem>
                                        <MenuItem value="ISO 9001">ISO 9001</MenuItem>
                                        <MenuItem value="ISO 14001">ISO 14001</MenuItem>
                                        <MenuItem value="CE-märkning">CE-märkning</MenuItem>
                                        <MenuItem value="Ingen">Ingen</MenuItem>
                                    </TextField>
                                </div>

                                {/* Row 2 – 3-col: Kontraktsformulär, Leveranssätt, Leveransvillkor */}
                                <div className={styles.contractFormGrid3} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Kontraktsformulär *" value={draft.contractForm} onChange={(e) => updateDraftField("contractForm", e.target.value)} size="small">
                                        <MenuItem value="">— Välj —</MenuItem>
                                        <MenuItem value="Example contract">Example contract</MenuItem>
                                        <MenuItem value="Standard avtal">Standard avtal</MenuItem>
                                        <MenuItem value="Ramavtal">Ramavtal</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Leveranssätt *" value={draft.deliveryMethod} onChange={(e) => updateDraftField("deliveryMethod", e.target.value)} size="small">
                                        <MenuItem value="Hämta">Hämta</MenuItem>
                                        <MenuItem value="DHL Express">DHL Express</MenuItem>
                                        <MenuItem value="PostNord">PostNord</MenuItem>
                                        <MenuItem value="Egen transport">Egen transport</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Leveransvillkor *" value={draft.deliveryTerms} onChange={(e) => updateDraftField("deliveryTerms", e.target.value)} size="small">
                                        <MenuItem value="FCA">FCA</MenuItem>
                                        <MenuItem value="EXW">EXW</MenuItem>
                                        <MenuItem value="DAP">DAP</MenuItem>
                                        <MenuItem value="DDP">DDP</MenuItem>
                                        <MenuItem value="CIF">CIF</MenuItem>
                                        <MenuItem value="FOB">FOB</MenuItem>
                                    </TextField>
                                </div>

                                {/* Leveransvillkor ort — full-width */}
                                <div style={{ marginBottom: 10 }}>
                                    <TextField fullWidth value={draft.deliveryTermsCity} onChange={(e) => updateDraftField("deliveryTermsCity", e.target.value)} label="Leveransvillkor ort *" size="small" />
                                </div>

                                {/* 2:1 grid: Agent 1 + Provision */}
                                <div className={styles.contractFormGrid82} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Agent 1 *" value={draft.agent1} onChange={(e) => updateDraftField("agent1", e.target.value)} size="small">
                                        <MenuItem value="">— Välj —</MenuItem>
                                        <MenuItem value="Janne B">Janne B</MenuItem>
                                        <MenuItem value="Anna K">Anna K</MenuItem>
                                        <MenuItem value="Erik S">Erik S</MenuItem>
                                    </TextField>
                                    <TextField fullWidth type="number" value={draft.agent1Pct} onChange={(e) => updateDraftField("agent1Pct", e.target.value)} label="Provision (%)" size="small"
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />

                                {/* ── Leverans ── */}
                                <Typography className={styles.contractSectionChip}>Leverans</Typography>
                                <div className={styles.contractFormGrid82}>
                                    <TextField select fullWidth label="Leveransort *" value={draft.deliveryLocation} onChange={(e) => handleDeliveryLocationChange(e.target.value)} size="small">
                                        <MenuItem value="">— Välj ort —</MenuItem>
                                        {mockDeliveryLocations.map((loc) => (
                                            <MenuItem key={`${loc.name}-${loc.postalCode}`} value={loc.name}>{loc.name} ({loc.postalCode})</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField fullWidth value={draft.deliveryLocationPostalCode} disabled label="Postnummer" helperText="Fylls i automatiskt" size="small" />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />

                                {/* ── Kommentarer ── plain text, 2-col */}
                                <Typography className={styles.contractSectionChip}>Kommentarer</Typography>
                                <div className={styles.contractFormGrid2}>
                                    <div>
                                        <Typography variant="caption" style={{ display: "block", marginBottom: 3, color: "#6b7585" }}>Kommentar från kund</Typography>
                                        <Typography variant="body2" style={!selectedCustomer?.customerComment ? { color: "rgba(0,0,0,0.38)", fontStyle: "italic" } : {}}>
                                            {selectedCustomer?.customerComment || "Ingen kommentar"}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" style={{ display: "block", marginBottom: 3, color: "#6b7585" }}>Kommentar från innesälj</Typography>
                                        <Typography variant="body2" style={!selectedCustomer?.internalComment ? { color: "rgba(0,0,0,0.38)", fontStyle: "italic" } : {}}>
                                            {selectedCustomer?.internalComment || "Ingen kommentar"}
                                        </Typography>
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>

                        <Typography sx={{ ml: 0.5, mb: 1, mt: 1, display: "block" }}>
                            Kompletterande uppgifter
                        </Typography>

                        {/* ── ALLMÄNT ── */}
                        <Accordion expanded={expandedPanels.includes("allmant")} onChange={() => togglePanel("allmant")} disableGutters elevation={0} className={styles.contractSectionAccordion}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                                <span className={styles.contractSectionTitleRow}>
                                    <BusinessOutlinedIcon className={styles.contractSectionIcon} />
                                    <Typography className={styles.contractSectionTitle}>Allmänt</Typography>
                                </span>
                            </AccordionSummary>
                            <AccordionDetails className={styles.contractSectionDetailsArea}>
                                <Typography className={styles.contractSectionSubLabel} style={{ marginTop: 0 }}>Allmänt</Typography>
                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Kundens referens" value={draft.customerRef} onChange={(e) => updateDraftField("customerRef", e.target.value)} size="small">
                                        <MenuItem value="">— Välj —</MenuItem>
                                        <MenuItem value="Faktura">Faktura</MenuItem>
                                        <MenuItem value="Offert">Offert</MenuItem>
                                        <MenuItem value="Order">Order</MenuItem>
                                        <MenuItem value="Avtal">Avtal</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Prislista" value={draft.priceList} onChange={(e) => updateDraftField("priceList", e.target.value)} size="small">
                                        <MenuItem value="">— Standardpris —</MenuItem>
                                        <MenuItem value="PL-2024-A">PL-2024-A (Storkundspris)</MenuItem>
                                        <MenuItem value="PL-2024-B">PL-2024-B (Återförsäljare)</MenuItem>
                                        <MenuItem value="PL-2024-C">PL-2024-C (Kampanjpris)</MenuItem>
                                        <MenuItem value="PL-Export">PL-Export (Exportpris)</MenuItem>
                                    </TextField>
                                    <TextField fullWidth value={draft.externalContractNumber} onChange={(e) => updateDraftField("externalContractNumber", e.target.value)} label="Externt kontraktsnummer" size="small" />
                                    <TextField fullWidth type="number" value={draft.priceAdjustPct} onChange={(e) => updateDraftField("priceAdjustPct", e.target.value)} label="Prisjustera"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                                    <TextField select fullWidth label="Kategori" value={draft.category} onChange={(e) => updateDraftField("category", e.target.value)} size="small">
                                        <MenuItem value="Bygghandel">Bygghandel</MenuItem>
                                        <MenuItem value="Industri">Industri</MenuItem>
                                        <MenuItem value="Offentlig sektor">Offentlig sektor</MenuItem>
                                        <MenuItem value="Grossist">Grossist</MenuItem>
                                        <MenuItem value="Övrigt">Övrigt</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Land" value={draft.country} onChange={(e) => updateDraftField("country", e.target.value)} size="small">
                                        <MenuItem value="Sverige">Sverige</MenuItem>
                                        <MenuItem value="Norge">Norge</MenuItem>
                                        <MenuItem value="Danmark">Danmark</MenuItem>
                                        <MenuItem value="Finland">Finland</MenuItem>
                                        <MenuItem value="Tyskland">Tyskland</MenuItem>
                                        <MenuItem value="Frankrike">Frankrike</MenuItem>
                                        <MenuItem value="Övriga EU">Övriga EU</MenuItem>
                                    </TextField>
                                    <TextField select fullWidth label="Kontraktstyp" value={draft.contractType} onChange={(e) => updateDraftField("contractType", e.target.value)} size="small">
                                        <MenuItem value="Försäljningskontrakt">Försäljningskontrakt</MenuItem>
                                        <MenuItem value="Ramavtal">Ramavtal</MenuItem>
                                        <MenuItem value="Inköpskontrakt">Inköpskontrakt</MenuItem>
                                        <MenuItem value="Servicekontrakt">Servicekontrakt</MenuItem>
                                        <MenuItem value="Samarbetsavtal">Samarbetsavtal</MenuItem>
                                    </TextField>
                                    <TextField fullWidth type="date" value={draft.validUntil} onChange={(e) => updateDraftField("validUntil", e.target.value)} label="Giltig t.o.m" InputLabelProps={{ shrink: true }} size="small" />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />
                                <Typography className={styles.contractSectionSubLabel}>Anteckningar</Typography>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <TextField fullWidth multiline rows={3} value={draft.miscNote} onChange={(e) => updateDraftField("miscNote", e.target.value)} label="Övrigt" size="small"
                                        helperText="Visas på utskrift av kontrakt och orderbekräftelse. Skickas även vid orderbekräftelse till PRI Handel" />
                                    <TextField fullWidth multiline rows={3} value={draft.internalNote} onChange={(e) => updateDraftField("internalNote", e.target.value)} label="Egen anmärkning" size="small" />
                                </div>
                            </AccordionDetails>
                        </Accordion>

                        {/* ── VILLKOR ── */}
                        <Accordion expanded={expandedPanels.includes("villkor")} onChange={() => togglePanel("villkor")} disableGutters elevation={0} className={styles.contractSectionAccordion}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                                <span className={styles.contractSectionTitleRow}>
                                    <GavelOutlinedIcon className={styles.contractSectionIcon} />
                                    <Typography className={styles.contractSectionTitle}>Villkor</Typography>
                                </span>
                            </AccordionSummary>
                            <AccordionDetails className={styles.contractSectionDetailsArea}>
                                <Typography className={styles.contractSectionSubLabel} style={{ marginTop: 0 }}>Valuta &amp; Betalning</Typography>
                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField fullWidth type="date" value={draft.exchangeRateDate} onChange={(e) => updateDraftField("exchangeRateDate", e.target.value)} label="Kursdatum valuta" InputLabelProps={{ shrink: true }} size="small" />
                                    <TextField select fullWidth label="Moms" value={draft.vat} onChange={(e) => updateDraftField("vat", e.target.value)} size="small">
                                        <MenuItem value="25">25%</MenuItem>
                                        <MenuItem value="12">12%</MenuItem>
                                        <MenuItem value="6">6%</MenuItem>
                                        <MenuItem value="0">0% (momsfri)</MenuItem>
                                    </TextField>
                                    <TextField fullWidth type="number" value={draft.exchangeRate} onChange={(e) => updateDraftField("exchangeRate", e.target.value)} label="Kurs"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">{`SEK = 1 ${draft.currency}`}</InputAdornment> }} />
                                    <TextField fullWidth type="number" value={draft.paymentTermsDays} onChange={(e) => updateDraftField("paymentTermsDays", e.target.value)} label="Betalningsvillkor dagar" size="small" />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />
                                <Typography className={styles.contractSectionSubLabel}>Rabatter &amp; Avgifter</Typography>
                                <div className={styles.contractFormGrid3} style={{ marginBottom: 10 }}>
                                    <TextField fullWidth type="number" value={draft.cashDiscount} onChange={(e) => updateDraftField("cashDiscount", e.target.value)} label="Kassarabatt"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                                    <TextField fullWidth type="number" value={draft.bonus} onChange={(e) => updateDraftField("bonus", e.target.value)} label="Bonus"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                                    <TextField select fullWidth label="Bonusbas" value={draft.bonusBase} onChange={(e) => updateDraftField("bonusBase", e.target.value)} size="small">
                                        <MenuItem value="Bruttovärde">Bruttovärde</MenuItem>
                                        <MenuItem value="Nettovärde">Nettovärde</MenuItem>
                                        <MenuItem value="Fakturerat värde">Fakturerat värde</MenuItem>
                                    </TextField>
                                </div>
                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField fullWidth type="number" value={draft.pickingSurchargeMin} onChange={(e) => updateDraftField("pickingSurchargeMin", e.target.value)} label="Plocktillägg, minst"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">{`${draft.currency}/avropsrad`}</InputAdornment> }} />
                                    <TextField fullWidth type="number" value={draft.pickingSurchargePct} onChange={(e) => updateDraftField("pickingSurchargePct", e.target.value)} label="Plocktillägg"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">%/avropsrad</InputAdornment> }} />
                                    <TextField fullWidth type="number" value={draft.paintingSurcharge} onChange={(e) => updateDraftField("paintingSurcharge", e.target.value)} label="Målningstillägg"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">{`${draft.currency}/avroprad`}</InputAdornment> }} />
                                    <TextField fullWidth type="number" value={draft.paintingSurchargeThreshold} onChange={(e) => updateDraftField("paintingSurchargeThreshold", e.target.value)} label="Målningstillägg tröskel"
                                        size="small" helperText="Tillägg vid mindre än detta värde"
                                        InputProps={{ endAdornment: <InputAdornment position="end">lpm</InputAdornment> }} />
                                </div>
                                <div style={{ marginBottom: 10 }}>
                                    <TextField fullWidth type="number" value={draft.importFee} onChange={(e) => updateDraftField("importFee", e.target.value)} label="Införselavgift"
                                        size="small" InputProps={{ endAdornment: <InputAdornment position="end">{draft.currency}</InputAdornment> }} />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />
                                <Typography className={styles.contractSectionSubLabel}>Lager</Typography>
                                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 10 }}>
                                    <Checkbox checked={draft.consignmentStock} onChange={(e) => updateDraftField("consignmentStock", e.target.checked)} size="small" />
                                    <Typography variant="body2">Konsignationslager</Typography>
                                </label>
                            </AccordionDetails>
                        </Accordion>

                        {/* ── LEVERANS ── */}
                        <Accordion expanded={expandedPanels.includes("leverans")} onChange={() => togglePanel("leverans")} disableGutters elevation={0} className={styles.contractSectionAccordion}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.contractSectionSummary}>
                                <span className={styles.contractSectionTitleRow}>
                                    <LocalShippingOutlinedIcon className={styles.contractSectionIcon} />
                                    <Typography className={styles.contractSectionTitle}>Leverans</Typography>
                                </span>
                            </AccordionSummary>
                            <AccordionDetails className={styles.contractSectionDetailsArea}>
                                <Typography className={styles.contractSectionSubLabel} style={{ marginTop: 0 }}>Allmänt</Typography>

                                {/* Read-only mirror of required fields */}
                                <div className={styles.contractFormGrid3} style={{ marginBottom: 10 }}>
                                    <TextField fullWidth size="small" label="Leveranssätt" value={draft.deliveryMethod} InputProps={{ readOnly: true }} helperText="Satt i obligatoriska fält" />
                                    <TextField fullWidth size="small" label="Leveransvillkor" value={draft.deliveryTerms} InputProps={{ readOnly: true }} helperText="Satt i obligatoriska fält" />
                                    <TextField fullWidth size="small" label="Lev. villkor ort" value={draft.deliveryTermsCity} InputProps={{ readOnly: true }} helperText="Satt i obligatoriska fält" />
                                </div>

                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Mottagarland" value={draft.receiverCountry} onChange={(e) => updateDraftField("receiverCountry", e.target.value)} size="small">
                                        <MenuItem value="">— Välj —</MenuItem>
                                        <MenuItem value="Sverige">Sverige</MenuItem>
                                        <MenuItem value="Norge">Norge</MenuItem>
                                        <MenuItem value="Danmark">Danmark</MenuItem>
                                        <MenuItem value="Finland">Finland</MenuItem>
                                        <MenuItem value="Tyskland">Tyskland</MenuItem>
                                        <MenuItem value="Frankrike">Frankrike</MenuItem>
                                        <MenuItem value="Övriga EU">Övriga EU</MenuItem>
                                    </TextField>
                                    <TextField fullWidth value={draft.deliveryPeriod} onChange={(e) => updateDraftField("deliveryPeriod", e.target.value)} label="Leveransperiod" size="small" />
                                </div>

                                <div style={{ marginBottom: 10 }}>
                                    <TextField select fullWidth label="Leveransadress" value={draft.deliveryAddress} onChange={(e) => updateDraftField("deliveryAddress", e.target.value)} size="small">
                                        <MenuItem value="">— Välj adress —</MenuItem>
                                        {mockDeliveryAddresses.map((addr) => (
                                            <MenuItem key={addr} value={addr}>{addr}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>

                                {draft.deliveryAddress && (
                                    <Paper elevation={0} className={styles.contractCreateAddressPreview}>
                                        <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                                            {draft.deliveryAddress.replace(/, /g, "\n")}
                                        </Typography>
                                    </Paper>
                                )}

                                <div className={styles.contractCreateSectionDivider} />
                                <Typography className={styles.contractSectionSubLabel}>Lossning</Typography>
                                <div className={styles.contractFormGrid2} style={{ marginBottom: 10 }}>
                                    <TextField fullWidth value={draft.unloadingPhone} onChange={(e) => updateDraftField("unloadingPhone", e.target.value)} label="Telefon" type="tel" size="small" />
                                    <TextField fullWidth value={draft.unloadingHours} onChange={(e) => updateDraftField("unloadingHours", e.target.value)} label="Öppettider" size="small" helperText="Visas på fraktsedel" />
                                    <TextField fullWidth value={draft.notificationPhone} onChange={(e) => updateDraftField("notificationPhone", e.target.value)} label="Aviseringstelefon" type="tel" size="small" />
                                    <TextField fullWidth multiline rows={3} value={draft.notificationInfo} onChange={(e) => updateDraftField("notificationInfo", e.target.value)} label="Aviseringsinformation" size="small" helperText="Visas på fraktsedel, skickas till C-Load" />
                                </div>

                                <div className={styles.contractCreateSectionDivider} />
                                <Typography className={styles.contractSectionSubLabel}>Sjöfrakt</Typography>
                                <div className={styles.contractFormGrid3}>
                                    <TextField fullWidth size="small" label="Utlastande hamn" value="" InputProps={{ readOnly: true }} />
                                    <TextField fullWidth size="small" label="Speditör" value="" InputProps={{ readOnly: true }} />
                                    <TextField fullWidth size="small" label="Mottagande hamn" value="" InputProps={{ readOnly: true }} />
                                </div>
                            </AccordionDetails>
                        </Accordion>

                        {/* ── DOKUMENT ── */}
                        <Accordion expanded={expandedPanels.includes("dokument")} onChange={() => togglePanel("dokument")} disableGutters elevation={0} className={styles.contractSectionAccordion} sx={{ mb: 2 }}>
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
                    <div className={styles.contractCreateFooter}>
                        <Button variant="text" size="small" onClick={handleCancel} style={{ color: "#555e6d" }}>
                            Avbryt
                        </Button>
                        <Button className={styles.contractSaveButton} size="small" onClick={handleSave}>
                            Skapa kontrakt
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

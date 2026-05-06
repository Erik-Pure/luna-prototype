"use client";

import { Chip, Typography } from "@mui/material";
import styles from "../page.module.scss";

export type CustomerDetailData = {
    customerNumber: string;
    organizationNumber: string;
    country: string;
    city: string;
    primaryContact: string;
    accountManager: string;
    email: string;
    phone: string;
    activeContracts: string;
    priceList: string;
    creditLimit: string;
    limitStatus: "ok" | "warning" | "error";
    comment: string;
};

type CustomerDetailViewProps = {
    customerName: string;
    detail: CustomerDetailData | null;
};

export function CustomerDetailView({ customerName, detail }: CustomerDetailViewProps) {
    const limitTone = detail?.limitStatus === "error" ? "error" : detail?.limitStatus === "warning" ? "warning" : "success";
    const limitLabel = detail?.limitStatus === "error"
        ? "Limit överskriden"
        : detail?.limitStatus === "warning"
            ? "Limitvarning"
            : "Aktiv kund";

    const infoRows = [
        { label: "Kundnummer", value: detail?.customerNumber ?? "-" },
        { label: "Organisationsnummer", value: detail?.organizationNumber ?? "-" },
        { label: "Land", value: detail?.country ?? "-" },
        { label: "Ort", value: detail?.city ?? "-" },
        { label: "Primär kontakt", value: detail?.primaryContact ?? "-" },
        { label: "Ansvarig säljare", value: detail?.accountManager ?? "-" },
        { label: "E-post", value: detail?.email ?? "-" },
        { label: "Telefon", value: detail?.phone ?? "-" },
        { label: "Aktiva kontrakt", value: detail?.activeContracts ?? "-" },
        { label: "Prislista", value: detail?.priceList ?? "-" },
        { label: "Limit", value: detail?.creditLimit ?? "-" },
    ];

    return (
        <div className={styles.customerDetailPanel}>
            <div className={styles.customerDetailHeader}>
                <div>
                    <Typography className={styles.customerDetailTitle}>{customerName}</Typography>
                    <Typography className={styles.customerDetailSubtitle}>Kunddetalj från kundlista</Typography>
                </div>
                <Chip label={limitLabel} color={limitTone} size="small" />
            </div>

            <div className={styles.customerDetailGrid}>
                {infoRows.map((row) => (
                    <div key={row.label} className={styles.customerDetailCard}>
                        <Typography className={styles.contractInfoLabel}>{row.label}</Typography>
                        <Typography className={styles.contractInfoValue}>{row.value}</Typography>
                    </div>
                ))}
            </div>

            <div className={styles.customerDetailCommentCard}>
                <Typography className={styles.contractInfoLabel}>Kommentar</Typography>
                <Typography className={styles.contractInfoValue}>{detail?.comment ?? "Ingen kommentar tillgänglig."}</Typography>
            </div>
        </div>
    );
}
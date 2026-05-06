"use client";

import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { Button, Typography } from "@mui/material";
import styles from "../../page.module.scss";

type HomeViewProps = {
    selectedCompany: string;
    onNavigateToContracts: () => void;
    onNavigateToDeliveries: () => void;
    onNavigateToPriceLists: () => void;
    onNavigateToReports: () => void;
};

const recentContracts = [
    { id: "163890", customer: "Skandinavisk Industriservice", date: "2025-04-18", status: "Aktivt kontrakt", amount: "26 651 SEK" },
    { id: "163744", customer: "Luna Infrastruktur AB", date: "2025-04-15", status: "Aktivt kontrakt", amount: "26 651 SEK" },
    { id: "163601", customer: "Nordic Sten & Mark AB", date: "2025-04-10", status: "Aktivt kontrakt", amount: "26 651 SEK" },
    { id: "163518", customer: "Initech HB", date: "2025-04-07", status: "Aktivt kontrakt", amount: "26 651 SEK" },
    { id: "163452", customer: "Globex Corp", date: "2025-04-02", status: "Aktivt kontrakt", amount: "26 651 SEK" },
];

const noticeItems = [
    { text: "3 kontrakt saknar godkänd limitnivå", level: "warning" as const },
    { text: "Leveransvecka 18 har 12 öppna avropsrader", level: "info" as const },
    { text: "Prislista 2025-SE uppdaterades idag", level: "info" as const },
];

const quickLinks = [
    {
        label: "Kontraktlista",
        helper: "Skapa, sök och följ upp kontrakt",
        icon: <DescriptionOutlinedIcon className={styles.homeQuickLinkIcon} />,
    },
    {
        label: "Leveranslista",
        helper: "Se öppna leveranser och planering",
        icon: <LocalShippingOutlinedIcon className={styles.homeQuickLinkIcon} />,
    },
    {
        label: "Prislistor",
        helper: "Hantera prisnivåer och rader",
        icon: <TableChartOutlinedIcon className={styles.homeQuickLinkIcon} />,
    },
    {
        label: "Rapporter",
        helper: "Analyser och nyckeltal",
        icon: <TimelineOutlinedIcon className={styles.homeQuickLinkIcon} />,
    },
] as const;

export function HomeView({
    selectedCompany,
    onNavigateToContracts,
    onNavigateToDeliveries,
    onNavigateToPriceLists,
    onNavigateToReports,
}: HomeViewProps) {
    const quickLinkActions = [
        onNavigateToContracts,
        onNavigateToDeliveries,
        onNavigateToPriceLists,
        onNavigateToReports,
    ] as const;

    const today = new Date().toLocaleDateString("sv-SE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const recentContractHeaders = ["Kontraktsnr", "Kund", "Datum", "Belopp"] as const;

    return (
        <div className={styles.homeViewRoot}>
            <div className={styles.homeContentWidth}>

                {/* Welcome banner */}
                <div className={styles.homeWelcomeBanner}>
                    <div>
                        <Typography className={styles.homeWelcomeTitle}>Välkommen till Luna</Typography>
                        <Typography className={styles.homeWelcomeCompany}>{selectedCompany}</Typography>
                    </div>
                    <Typography className={styles.homeWelcomeDate}>{today}</Typography>
                </div>

                {/* Recent contracts */}
                <div className={styles.homeCard}>
                    <Typography className={styles.homeCardTitle}>Senaste kontrakt</Typography>
                    <div className={styles.homeRecentTableWrap}>
                        <table className={styles.homeRecentTable}>
                            <thead>
                                <tr>
                                    {recentContractHeaders.map((header) => (
                                        <th key={header} className={styles.homeRecentTh}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentContracts.map((contract) => (
                                    <tr key={contract.id} className={styles.homeRecentRow}>
                                        <td className={styles.homeRecentTd} data-label={recentContractHeaders[0]}>
                                            {contract.id}
                                        </td>
                                        <td className={styles.homeRecentTd} data-label={recentContractHeaders[1]}>
                                            {contract.customer}
                                        </td>
                                        <td className={styles.homeRecentTd} data-label={recentContractHeaders[2]}>
                                            {contract.date}
                                        </td>
                                        <td className={styles.homeRecentTd} data-label={recentContractHeaders[3]}>
                                            {contract.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button
                        size="small"
                        className={styles.homeCardLinkButton}
                        onClick={onNavigateToContracts}
                    >
                        Visa alla kontrakt
                    </Button>
                </div>

                <div className={styles.homeBottomRow}>
                    {/* Quick links */}
                    <div className={styles.homeCard}>
                        <Typography className={styles.homeCardTitle}>Snabblänkar</Typography>
                        <div className={styles.homeQuickLinks}>
                            {quickLinks.map((item, index) => (
                                <Button
                                    key={item.label}
                                    className={styles.homeQuickLinkButton}
                                    variant="outlined"
                                    onClick={quickLinkActions[index]}
                                >
                                    <span className={styles.homeQuickLinkButtonInner}>
                                        <span className={styles.homeQuickLinkMeta}>
                                            <span className={styles.homeQuickLinkLeading}>{item.icon}</span>
                                            <span>
                                                <span className={styles.homeQuickLinkTitle}>{item.label}</span>
                                                <span className={styles.homeQuickLinkHelper}>{item.helper}</span>
                                            </span>
                                        </span>
                                        <ArrowOutwardIcon className={styles.homeQuickLinkArrow} />
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Notices */}
                    <div className={styles.homeCard}>
                        <Typography className={styles.homeCardTitle}>Meddelanden</Typography>
                        <div className={styles.homeNoticeList}>
                            {noticeItems.map((notice) => (
                                <div
                                    key={notice.text}
                                    className={`${styles.homeNoticeItem} ${notice.level === "warning" ? styles.homeNoticeWarning : styles.homeNoticeInfo}`}
                                >
                                    <Typography className={styles.homeNoticeText}>{notice.text}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

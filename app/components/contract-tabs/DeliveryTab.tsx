"use client";

import { Typography } from "@mui/material";
import type { ContractDetails } from "./contractDetails";
import styles from "../../page.module.scss";

type DeliveryTabProps = {
  contractDetails?: ContractDetails;
  compact?: boolean;
};

export function DeliveryTab({ contractDetails, compact = false }: DeliveryTabProps) {
  if (!contractDetails) {
    return (
      <div className={styles.contractTabPlaceholder}>
        <Typography className={styles.contractInfoValue}>Leverans - innehallsvy for prototyp.</Typography>
      </div>
    );
  }

  const delivery = contractDetails.leverans;

  const generalFields = [
    { label: "Leveransort", value: delivery.location },
    { label: "Postnummer", value: delivery.postalCode },
    { label: "Mottagarland", value: delivery.receiverCountry },
    { label: "Leveransperiod", value: delivery.deliveryPeriod },
    { label: "Leveransadress", value: delivery.deliveryAddress, wide: true },
  ];

  const unloadingFields = [
    { label: "Telefon lossning", value: delivery.unloadingPhone },
    { label: "Öppettider", value: delivery.unloadingHours },
    { label: "Aviseringstelefon", value: delivery.notificationPhone },
    { label: "Aviseringsinformation", value: delivery.notificationInfo },
  ];

  const seaFreightFields = [
    { label: "Utlastande hamn", value: delivery.portOfLoading },
    { label: "Speditör", value: delivery.freightForwarder },
    { label: "Mottagande hamn", value: delivery.portOfDischarge },
  ];

  return (
    <div className={styles.contractFlatSection} style={compact ? { gap: 0 } : undefined}>
      <span className={styles.contractSectionChip}>Allmänt</span>
      <div className={styles.contractDataGrid}>
        {generalFields.map((field) => (
          <div
            key={field.label}
            className={field.wide ? `${styles.contractDataItem} ${styles.contractDataItemWide}` : styles.contractDataItem}
          >
            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
            <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
          </div>
        ))}
      </div>

      <hr className={styles.contractFlatDivider} />
      <span className={styles.contractSectionChip}>Lossning</span>
      <div className={styles.contractDataGrid}>
        {unloadingFields.map((field) => (
          <div key={field.label} className={styles.contractDataItem}>
            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
            <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
          </div>
        ))}
      </div>

      <hr className={styles.contractFlatDivider} />
      <span className={styles.contractSectionChip}>Sjöfrakt</span>
      <div className={styles.contractDataGrid}>
        {seaFreightFields.map((field) => (
          <div key={field.label} className={styles.contractDataItem}>
            <Typography className={styles.contractDataLabel}>{field.label}</Typography>
            <Typography className={styles.contractDataValue}>{field.value || "-"}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

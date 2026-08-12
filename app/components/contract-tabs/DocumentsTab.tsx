"use client";

import { Typography } from "@mui/material";
import type { ContractDetails } from "./contractDetails";
import styles from "../../page.module.scss";

type DocumentsTabProps = {
  contractDetails?: ContractDetails;
  compact?: boolean;
};

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "📄";
  if (ext === "doc" || ext === "docx") return "📝";
  if (ext === "xls" || ext === "xlsx") return "📊";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼";
  if (["zip", "rar", "7z"].includes(ext)) return "🗜";
  return "📁";
}

export function DocumentsTab({ contractDetails, compact = false }: DocumentsTabProps) {
  if (!contractDetails) {
    return (
      <div className={styles.contractTabPlaceholder}>
        <Typography className={styles.contractInfoValue}>Dokument - innehallsvy for prototyp.</Typography>
      </div>
    );
  }

  return (
    <div className={styles.contractFlatSection} style={compact ? { gap: 0 } : undefined}>
      <Typography className={styles.contractSectionGroupLabel}>Dokument</Typography>

      <div className={styles.contractDropZone}>
        <p className={styles.contractDropZoneTitle}>Dra och släpp filer här</p>
        <p className={styles.contractDropZoneOrText}>eller</p>
        <button type="button" className={styles.contractDropZoneButton}>
          Välj filer
        </button>
        <p className={styles.contractDropZoneHint}>PDF, Word, Excel, bilder — max 20 MB per fil</p>
      </div>

      {contractDetails.dokument.length > 0 && (
        <>
          <hr className={styles.contractFlatDivider} />
          <p className={styles.contractFilesHeading}>
            Bifogade filer ({contractDetails.dokument.length})
          </p>
          {contractDetails.dokument.map((doc) => (
            <div key={`${doc.name}-${doc.addedAt}`} className={styles.contractFileRow}>
              <span className={styles.contractFileRowIcon}>{getFileIcon(doc.name)}</span>
              <div className={styles.contractFileRowInfo}>
                <p className={styles.contractFileName}>{doc.name}</p>
                <p className={styles.contractFileSize}>{doc.size} — {doc.addedAt}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {contractDetails.dokument.length === 0 && (
        <p style={{ fontSize: 13, color: "#9aa3af", fontStyle: "italic", margin: "8px 0 0" }}>
          Inga dokument uppladdade.
        </p>
      )}
    </div>
  );
}

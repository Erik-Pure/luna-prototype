"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { ActionRow } from "../shared/ActionRow";
import { DataTable } from "../shared/DataTable";
import { NyKontaktpersonDialog, type KontaktpersonDraft, type KundAdresser } from "./NyKontaktpersonDialog";
import styles from "../../page.module.scss";

type KontaktpersonRow = {
  _id: string;
  namn: string;
  funktion: string;
  telefon: string;
  mobil: string;
  epost: string;
  kommentar: string;
  adresstyp: string;
  foretagsnamn: string;
  adress: string;
  adress2: string;
  postadress: string;
  land: string;
  information: string;
  utskick: string;
};

const COLUMNS = [
  { key: "namn", label: "Namn", pinned: true },
  { key: "funktion", label: "Funktion" },
  { key: "telefon", label: "Telefon" },
  { key: "mobil", label: "Mobil" },
  { key: "epost", label: "Epost" },
  { key: "kommentar", label: "Kommentar" },
  { key: "adresstyp", label: "Adresstyp" },
  { key: "foretagsnamn", label: "Företagsnamn" },
  { key: "adress", label: "Adress" },
  { key: "adress2", label: "Adress 2" },
  { key: "postadress", label: "Postadress" },
  { key: "land", label: "Land" },
  { key: "information", label: "Information" },
  { key: "utskick", label: "Utskick" },
  { key: "_actions", label: "", pinnedRight: true, width: 72 },
] satisfies Array<{ key: string; label: string; pinned?: boolean; pinnedRight?: boolean; width?: number }>;

let nextId = 3;

const INITIAL_ROWS: KontaktpersonRow[] = [
  {
    _id: "1",
    namn: "Anna Svensson",
    funktion: "Inköpschef",
    telefon: "08-123 45 67",
    mobil: "070-123 45 67",
    epost: "anna.svensson@kund.se",
    kommentar: "",
    adresstyp: "Faktura",
    foretagsnamn: "Kund AB",
    adress: "Storgatan 1",
    adress2: "",
    postadress: "123 45 Stockholm",
    land: "SE",
    information: "",
    utskick: "Ja",
  },
  {
    _id: "2",
    namn: "Björn Lindgren",
    funktion: "Ekonomichef",
    telefon: "08-765 43 21",
    mobil: "073-765 43 21",
    epost: "bjorn.lindgren@kund.se",
    kommentar: "Primärkontakt för fakturafrågor",
    adresstyp: "Leverans",
    foretagsnamn: "Kund AB",
    adress: "Industrivägen 5",
    adress2: "Box 100",
    postadress: "456 78 Göteborg",
    land: "SE",
    information: "",
    utskick: "Nej",
  },
];

function rowToDraft(row: KontaktpersonRow): KontaktpersonDraft {
  return {
    namn: row.namn,
    funktion: row.funktion,
    telefon: row.telefon,
    mobil: row.mobil,
    epost: row.epost,
    adresstyp: row.adresstyp,
    foretagsnamn: row.foretagsnamn,
    adress1: row.adress,
    adress2: row.adress2,
    postadress: row.postadress,
    land: row.land,
    giltigFran: "",
    giltigTom: "",
    kommentar: row.kommentar,
    information: new Set(row.information ? row.information.split(", ") : []),
    utskick: new Set(row.utskick ? row.utskick.split(", ") : []),
  };
}

function draftToRow(draft: KontaktpersonDraft, id: string): KontaktpersonRow {
  return {
    _id: id,
    namn: draft.namn,
    funktion: draft.funktion,
    telefon: draft.telefon,
    mobil: draft.mobil,
    epost: draft.epost,
    kommentar: draft.kommentar,
    adresstyp: draft.adresstyp,
    foretagsnamn: draft.foretagsnamn,
    adress: draft.adress1,
    adress2: draft.adress2,
    postadress: draft.postadress,
    land: draft.land,
    information: Array.from(draft.information).join(", "),
    utskick: Array.from(draft.utskick).join(", "),
  };
}

const MOCK_KUND_ADRESSER: KundAdresser = {
  faktura: "Kund AB\nStorgatan 1\n123 45 Stockholm\nSverige",
  leverans: "Kund AB\nIndustrivägen 5\n456 78 Göteborg\nSverige",
};

export function KontaktpersonerTab() {
  const [rows, setRows] = useState<KontaktpersonRow[]>(INITIAL_ROWS);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<KontaktpersonRow | null>(null);

  const handleCreate = (draft: KontaktpersonDraft) => {
    const id = String(nextId++);
    setRows((prev) => [...prev, draftToRow(draft, id)]);
  };

  const handleEdit = (draft: KontaktpersonDraft) => {
    if (!editingRow) return;
    setRows((prev) => prev.map((r) => r._id === editingRow._id ? draftToRow(draft, r._id) : r));
    setEditingRow(null);
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r._id !== id));
    setSelectedRowIndex(null);
  };

  return (
    <div className={styles.lineItemsSection}>
      <ActionRow
        items={[
          {
            label: "Kontaktperson",
            icon: <AddIcon fontSize="small" />,
            tone: "primary",
            onClick: () => setCreateDialogOpen(true),
          },
        ]}
      />
      <DataTable
        variant="main"
        columns={COLUMNS}
        rows={rows}
        rowKey={(row) => row._id}
        selectedRowIndex={selectedRowIndex}
        onRowClick={(i) => setSelectedRowIndex(i === selectedRowIndex ? null : i)}
        fillRemainingSpace
        renderCell={(row, column) => {
          if (column.key === "_actions") {
            return (
              <span className={styles.freightActionCell}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setEditingRow(row); }}
                >
                  <EditOutlinedIcon className={styles.freightActionIcon} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }}
                >
                  <DeleteOutlineIcon className={styles.freightActionIcon} />
                </IconButton>
              </span>
            );
          }
          return row[column.key as keyof KontaktpersonRow] ?? "";
        }}
      />

      <NyKontaktpersonDialog
        open={createDialogOpen}
        kundAdresser={MOCK_KUND_ADRESSER}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreate}
      />

      <NyKontaktpersonDialog
        open={editingRow !== null}
        initialDraft={editingRow ? rowToDraft(editingRow) : undefined}
        title="Redigera kontaktperson"
        kundAdresser={MOCK_KUND_ADRESSER}
        onClose={() => setEditingRow(null)}
        onSave={handleEdit}
      />
    </div>
  );
}

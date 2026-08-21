export type ContractSummary = {
  customer: string;
  contractDate: string;
  createdBy: string;
  status: string;
  warning?: string;
  warningTone?: "orange" | "red";
};

export type FieldValue = {
  label: string;
  value: string;
};

export type ContractDeliveryDetails = {
  location: string;
  postalCode: string;
  receiverCountry: string;
  deliveryPeriod: string;
  deliveryAddress: string;
  unloadingPhone: string;
  unloadingHours: string;
  notificationPhone: string;
  notificationInfo: string;
  portOfLoading: string;
  freightForwarder: string;
  portOfDischarge: string;
};

export type ContractDocument = {
  name: string;
  size: string;
  addedAt: string;
};

export type ContractDetails = {
  id: string;
  summary: ContractSummary;
  allmant: FieldValue[];
  villkor: FieldValue[];
  leverans: ContractDeliveryDetails;
  kommentarer: FieldValue[];
  dokument: ContractDocument[];
};

const defaultContractDetails: ContractDetails = {
  id: "default",
  summary: {
    customer: "Acme AB",
    contractDate: "2026-03-27",
    createdBy: "Alex Wahlroos",
    status: "Aktivt kontrakt",
    warning: "Kunden har överskriden limit"
  },
  allmant: [
    { label: "Kund", value: "Acme AB" },
    { label: "Kontraktsnr", value: "163311" },
    { label: "Prislista", value: "Standard" },
    { label: "Status", value: "Aktivt kontrakt" },
    { label: "Sprak", value: "Svenska" },
    { label: "Land", value: "Sverige" }
  ],
  villkor: [
    { label: "Valuta", value: "SEK" },
    { label: "Betalningsvillkor", value: "30 dagar netto" },
    { label: "Leveransvillkor", value: "FCA" },
    { label: "Leveransvillkor ort", value: "Stockholm" }
  ],
  leverans: {
    location: "Stockholm",
    postalCode: "111 20",
    receiverCountry: "Sverige",
    deliveryPeriod: "Q2 2026",
    deliveryAddress: "Lager Stockholm, Industrigatan 12, 112 46 Stockholm, Sverige",
    unloadingPhone: "+46 8 123 45 67",
    unloadingHours: "07:00-16:00",
    notificationPhone: "+46 70 123 45 67",
    notificationInfo: "Avisera minst 2 timmar innan ankomst.",
    portOfLoading: "Sundsvall",
    freightForwarder: "DHL Express",
    portOfDischarge: "Oslo"
  },
  kommentarer: [
    {
      label: "Kommentar fran kund",
      value: "Leverans sker alltid till huvudkontoret. Kontakta inkopschef Lars vid fragor."
    },
    {
      label: "Kommentar fran innesalj",
      value: "Viktig kund. Prioritera vid kapacitetsbrist. Rabattniva godkand av saljchef."
    }
  ],
  dokument: []
};

const contract163311: ContractDetails = {
  id: "163311",
  summary: {
    customer: "Acme AB",
    contractDate: "2026-04-21",
    createdBy: "John Doe",
    status: "Aktivt kontrakt",
    warning: "Kunden har överskriden limit"
  },
  allmant: [
    { label: "Kund", value: "Acme AB" },
    { label: "Kontraktsnr", value: "163311" },
    { label: "Externt kontraktsnr", value: "2025/03 Reg 2" },
    { label: "Prislista", value: "PL-2024-A (Storkundspris)" },
    { label: "Status", value: "Aktivt kontrakt" },
    { label: "Upprattat av", value: "John Doe" },
    { label: "Sprak", value: "Svenska" },
    { label: "Kategori", value: "Bygghandel" },
    { label: "Land", value: "Sverige" },
    { label: "Kontraktstyp", value: "Forsaljningskontrakt" },
    { label: "Kundens referens", value: "Faktura" },
    { label: "Giltig t.o.m.", value: "2026-12-31" }
  ],
  villkor: [
    { label: "Valuta", value: "SEK" },
    { label: "Betalningsvillkor", value: "30 dagar netto" },
    { label: "Betalningsvillkor dagar", value: "30" },
    { label: "Certifiering", value: "ISO 9001" },
    { label: "Kontraktsformular", value: "Example contract" },
    { label: "Leveranssatt", value: "Hamta" },
    { label: "Leveransvillkor", value: "FCA" },
    { label: "Leveransvillkor ort", value: "Stockholm" },
    { label: "Agent 1", value: "Janne B (5%)" },
    { label: "Agent 2", value: "Anna K (2%)" },
    { label: "Moms", value: "25%" },
    { label: "Bonus", value: "2% pa bruttovarde" },
    { label: "Kassarabatt", value: "1,5%" },
    { label: "Plocktillagg", value: "12 SEK/avropsrad" },
    { label: "Malningstillagg", value: "45 SEK/avropsrad" },
    { label: "Inforselavgift", value: "250 SEK" },
    { label: "Konsignationslager", value: "Ja" }
  ],
  leverans: {
    location: "Stockholm",
    postalCode: "111 20",
    receiverCountry: "Sverige",
    deliveryPeriod: "V.17-V.32",
    deliveryAddress: "Byggmax Abildso, Enebakkveien 309, NO-1188 OSLO, Norge",
    unloadingPhone: "+46 8 555 00 11",
    unloadingHours: "M-F 07:00-16:00",
    notificationPhone: "+46 70 888 22 11",
    notificationInfo: "Visas pa fraktsedel, skickas till C-Load.",
    portOfLoading: "Sundsvall",
    freightForwarder: "DHL Express",
    portOfDischarge: "Oslo"
  },
  kommentarer: [
    {
      label: "Kommentar fran kund",
      value: "Leverans sker alltid till huvudkontoret. Kontakta inkopschef Lars vid fragor."
    },
    {
      label: "Kommentar fran innesalj",
      value: "Viktig kund. Prioritera vid kapacitetsbrist. Rabattniva godkand av saljchef."
    }
  ],
  dokument: [
    { name: "kontrakt_acme_163311.pdf", size: "1.8 MB", addedAt: "2026-04-21 09:42" },
    { name: "leveransinstruktioner_acme.docx", size: "340 KB", addedAt: "2026-04-21 09:45" },
    { name: "prislista_pl-2024-a.xlsx", size: "512 KB", addedAt: "2026-04-21 09:47" }
  ]
};

const contractDetailsById: Record<string, ContractDetails> = {
  "163311": contract163311
};

export const getContractDetails = (contractId: string | null): ContractDetails => {
  if (!contractId) {
    return defaultContractDetails;
  }

  const specific = contractDetailsById[contractId];
  if (specific) {
    return specific;
  }

  return {
    ...defaultContractDetails,
    id: contractId,
    allmant: defaultContractDetails.allmant.map((field) =>
      field.label === "Kontraktsnr" ? { ...field, value: contractId } : field
    )
  };
};

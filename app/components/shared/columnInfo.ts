export type ColumnInfoEntry =
  | { kind: "text"; title: string; description: string }
  | { kind: "legend"; title: string; items: { textColor: string; bgColor: string; label: string }[] };

export const COLUMN_INFO: Record<string, ColumnInfoEntry> = {
  "Volym": {
    kind: "text",
    title: "Volym",
    description: "Visar den sålda volymen i m3",
  },
  "Tillg. lager": {
    kind: "text",
    title: "Tillg. lager",
    description: "Visar tillgänglig volym. Lassbokade och leveransbokade volymer räknas bort. Siffrorna visas i rött om volym är reserverad mot lagerflytt.",
  },
  "Volym LO": {
    kind: "legend",
    title: "Volym LO",
    items: [
      { textColor: "#1f2937", bgColor: "#e8f0fe", label: "LO finns, men inga leverans- eller lassbokade paket" },
      { textColor: "#d92d20", bgColor: "#e8f0fe", label: "LO finns med leveransbokade paket" },
      { textColor: "#d92d20", bgColor: "#ffffff", label: "Lassbokade paket på LO" },
      { textColor: "#1f2937", bgColor: "#ffffff", label: "Det finns levererad volym på raden" },
    ],
  },
  "utlastningssparr": {
    kind: "text",
    title: "Utlastningsspärr",
    description: "Anger om kontraktet är spärrat för utlastning. En aktiv spärr hindrar leverans tills den lyfts.",
  },
  "avropatProcent": {
    kind: "text",
    title: "Avropat %",
    description: "Andel av kontraktsvolymen som hittills har avropats, i procent.",
  },
  "tillhor": {
    kind: "text",
    title: "Tillhör",
    description: "Visar vilken avdelning eller enhet som raden tillhör.",
  },
  "prislistaNr": {
    kind: "text",
    title: "Prislista nr",
    description: "Numret på den prislista som kontraktets priser hämtas ifrån.",
  },
  "olevVolym": {
    kind: "text",
    title: "Rest",
    description: "Kvarvarande volym på kontraktet som ännu inte har levererats, det vill säga kontraktsvolym minus levererad volym.",
  },
  "egenAnmarkning": {
    kind: "text",
    title: "Egen anmärkning",
    description: "Fritextfält för intern notering, t.ex. kreditkontroll eller annan information kopplad till raden.",
  },
  "kreditforsakring": {
    kind: "text",
    title: "Kreditförsäkring",
    description: "Anger om kundens fordringar täcks av en kreditförsäkring.",
  },
};

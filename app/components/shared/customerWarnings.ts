export type CustomerWarningSource = {
  varningsnivaFordran?: string;
  varningsnivaLimit?: string;
};

export type CustomerWarning = {
  type: "Limit" | "Fordran";
  label: string;
};

export type CustomerWarningTone = "none" | "orange" | "red";

export function getCustomerWarnings(row: CustomerWarningSource): CustomerWarning[] {
  const warnings: CustomerWarning[] = [];
  if (row.varningsnivaLimit === "Hög") warnings.push({ type: "Limit", label: "Överskriden limit" });
  if (row.varningsnivaFordran === "Hög") warnings.push({ type: "Fordran", label: "Förfallen fordran" });
  return warnings;
}

export function getWarningTone(row: CustomerWarningSource): CustomerWarningTone {
  if (row.varningsnivaLimit === "Hög") return "red";
  if (row.varningsnivaFordran === "Hög") return "orange";
  return "none";
}

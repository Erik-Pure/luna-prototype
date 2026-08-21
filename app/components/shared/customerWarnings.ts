export type CustomerWarningSource = {
  varningsnivaFordran?: string;
  varningsnivaLimit?: string;
};

export type CustomerWarningTone = "amber" | "orange" | "red";

export type CustomerWarning = {
  type: "Limit" | "Fordran";
  label: string;
  tone: CustomerWarningTone;
};

export function getCustomerWarnings(row: CustomerWarningSource): CustomerWarning[] {
  const warnings: CustomerWarning[] = [];
  if (row.varningsnivaLimit === "Hög") {
    warnings.push({ type: "Limit", label: "Överskriden limit", tone: "red" });
  } else if (row.varningsnivaLimit === "Medium") {
    warnings.push({ type: "Limit", label: "Överskriden limit", tone: "orange" });
  }
  if (row.varningsnivaFordran === "Hög") {
    warnings.push({ type: "Fordran", label: "Förfallen fordran", tone: "amber" });
  }
  return warnings;
}

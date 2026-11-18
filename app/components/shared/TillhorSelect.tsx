"use client";

import { MenuItem, TextField } from "@mui/material";

// Mock-data: kunder som en kund kan "tillhöra" (moderbolag/kedja). Värdet är kundnumret.
export const TILLHOR_KUNDER: { namn: string; kundnr: string }[] = [
  { namn: "Almbergs Bygg & Trä", kundnr: "4317" },
  { namn: "Berglunds Snickeri", kundnr: "6158" },
  { namn: "Björkviks Sågverk", kundnr: "512094" },
  { namn: "Dala Byggvaror", kundnr: "7031" },
  { namn: "E&K Fastighetsservice", kundnr: "7289" },
  { namn: "Fjällnäs Trävaror", kundnr: "18842" },
  { namn: "Granholm Industri", kundnr: "3906" },
  { namn: "Hedmark Tre & Bygg", kundnr: "472615" },
  { namn: "Kustens Bygghandel", kundnr: "8124" },
  { namn: "Lindqvist Entreprenad", kundnr: "5570" },
  { namn: "Mälardalens Träcenter", kundnr: "26413" },
  { namn: "Norrskog Timber", kundnr: "9302" },
  { namn: "Råsunda Byggtjänst", kundnr: "6847" },
  { namn: "Sjöbergs Golv & Panel", kundnr: "15309" },
  { namn: "Vänerns Trähus", kundnr: "4498" },
];

type TillhorSelectProps = {
  value: string;
  onChange: (kundnr: string) => void;
  label?: string;
  className?: string;
};

export function TillhorSelect({ value, onChange, label = "Tillhör", className }: TillhorSelectProps) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      slotProps={{
        select: {
          renderValue: (selected) => {
            const kund = TILLHOR_KUNDER.find((k) => k.kundnr === selected);
            return kund ? `${kund.namn} (${kund.kundnr})` : "";
          },
          MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } },
        },
      }}
    >
      <MenuItem value="">—</MenuItem>
      {TILLHOR_KUNDER.map((kund) => (
        <MenuItem key={kund.kundnr} value={kund.kundnr} sx={{ display: "flex", gap: 2, py: 0.5 }}>
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {kund.namn}
          </span>
          <span style={{ width: 72, flexShrink: 0, opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
            {kund.kundnr}
          </span>
        </MenuItem>
      ))}
    </TextField>
  );
}

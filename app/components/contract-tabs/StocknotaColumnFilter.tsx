"use client";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { Autocomplete, Button, Checkbox, IconButton, MenuItem, Popover, TextField } from "@mui/material";
import { useState } from "react";
import type React from "react";
import styles from "../../page.module.scss";

// Kolumnfilter i stil med MudBlazors DataGrid (FilterMode.ColumnFilterMenu):
// filterikon i kolumnhuvudet öppnar en popover med Operator, Värde och Rensa/Filtrera.

export type ColumnFilterKind = "text" | "enum" | "number";

export type ColumnFilterConfig = {
  kind: ColumnFilterKind;
  options?: readonly string[];
  defaultOperator?: string;
  /** Begränsar vilka operatorer som går att välja (default: alla för kolumntypen). */
  operators?: readonly string[];
  /** Enum-kolumn där flera värden kan väljas (matchar om cellen är något av dem). */
  multiple?: boolean;
  /** Ersätter operatorernas visningsnamn, t.ex. "Större än" i stället för ">". */
  operatorLabels?: Readonly<Record<string, string>>;
};

export type ColumnFilterValue = { operator: string; value: string; values?: string[] };

const OPERATORS: Record<ColumnFilterKind, Array<{ value: string; label: string }>> = {
  text: [
    { value: "contains", label: "innehåller" },
    { value: "notContains", label: "innehåller inte" },
    { value: "equals", label: "är lika med" },
    { value: "notEquals", label: "är inte lika med" },
    { value: "startsWith", label: "börjar med" },
    { value: "endsWith", label: "slutar med" },
    { value: "isEmpty", label: "är tom" },
    { value: "isNotEmpty", label: "är inte tom" },
  ],
  enum: [
    { value: "is", label: "är" },
    { value: "isNot", label: "är inte" },
  ],
  number: [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
    { value: "isEmpty", label: "är tom" },
    { value: "isNotEmpty", label: "är inte tom" },
  ],
};

const OPERATORS_WITHOUT_VALUE = new Set(["isEmpty", "isNotEmpty"]);

const MULTIPLE_ENUM_OPERATORS = [
  { value: "is", label: "är något av" },
  { value: "isNot", label: "är inget av" },
];

function operatorsFor(config: ColumnFilterConfig) {
  const all = config.kind === "enum" && config.multiple ? MULTIPLE_ENUM_OPERATORS : OPERATORS[config.kind];
  const ops = config.operators ? all.filter((op) => config.operators!.includes(op.value)) : all;
  return config.operatorLabels ? ops.map((op) => ({ ...op, label: config.operatorLabels![op.value] ?? op.label })) : ops;
}

function defaultFilter(config: ColumnFilterConfig): ColumnFilterValue {
  const operator = config.defaultOperator ?? operatorsFor(config)[0]!.value;
  return config.multiple ? { operator, value: "", values: [] } : { operator, value: "" };
}

export function isColumnFilterActive(filter: ColumnFilterValue | undefined): boolean {
  if (!filter) return false;
  if (OPERATORS_WITHOUT_VALUE.has(filter.operator)) return true;
  if (filter.values) return filter.values.length > 0;
  return filter.value.trim() !== "";
}

export function matchesColumnFilter(cellValue: string, filter: ColumnFilterValue, kind: ColumnFilterKind): boolean {
  const cell = cellValue.trim();
  if (filter.operator === "isEmpty") return cell === "";
  if (filter.operator === "isNotEmpty") return cell !== "";

  if (filter.values) {
    const isMatch = filter.values.some((v) => v.toLowerCase() === cell.toLowerCase());
    return filter.operator === "isNot" ? !isMatch : isMatch;
  }

  if (kind === "number") {
    if (cell === "") return false;
    const a = parseFloat(cell);
    const b = parseFloat(filter.value);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (filter.operator) {
      case "eq": return a === b;
      case "neq": return a !== b;
      case "gt": return a > b;
      case "gte": return a >= b;
      case "lt": return a < b;
      case "lte": return a <= b;
      default: return true;
    }
  }

  const c = cell.toLowerCase();
  const v = filter.value.trim().toLowerCase();
  switch (filter.operator) {
    case "is":
    case "equals": return c === v;
    case "isNot":
    case "notEquals": return c !== v;
    case "contains": return c.includes(v);
    case "notContains": return !c.includes(v);
    case "startsWith": return c.startsWith(v);
    case "endsWith": return c.endsWith(v);
    default: return true;
  }
}

type ColumnFilterButtonProps = {
  config: ColumnFilterConfig;
  filter: ColumnFilterValue | undefined;
  onApply: (filter: ColumnFilterValue | null) => void;
  disabled?: boolean;
};

export function ColumnFilterButton({ config, filter, onApply, disabled }: ColumnFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<ColumnFilterValue>(() => filter ?? defaultFilter(config));
  const isActive = isColumnFilterActive(filter);
  const needsValue = !OPERATORS_WITHOUT_VALUE.has(draft.operator);

  const open = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setDraft(filter ?? defaultFilter(config));
    setAnchorEl(event.currentTarget);
  };
  const close = () => setAnchorEl(null);
  const apply = () => {
    onApply(isColumnFilterActive(draft) ? draft : null);
    close();
  };
  const clear = () => {
    onApply(null);
    close();
  };
  const onEnter = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") apply();
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="Filtrera"
        disabled={disabled}
        className={`${styles.stocknotaFilterButton} ${isActive || anchorEl ? styles.stocknotaFilterButtonActive : ""}`}
        onClick={open}
      >
        {isActive ? <FilterAltIcon fontSize="inherit" /> : <FilterAltOutlinedIcon fontSize="inherit" />}
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.stocknotaFilterPopover } }}
      >
        <div className={styles.stocknotaFilterFields}>
          <TextField
            select
            variant="standard"
            size="small"
            label="Operator"
            value={draft.operator}
            onChange={(e) => setDraft((prev) => ({ ...prev, operator: e.target.value }))}
            fullWidth
          >
            {operatorsFor(config).map((op) => (
              <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
            ))}
          </TextField>
          {needsValue ? (
            config.kind === "enum" && config.multiple ? (
              <Autocomplete
                multiple
                size="small"
                options={[...(config.options ?? [])]}
                value={draft.values ?? []}
                onChange={(_e, newValue) => setDraft((prev) => ({ ...prev, values: newValue }))}
                disableCloseOnSelect
                sx={{ "& .MuiAutocomplete-inputRoot": { flexWrap: "nowrap" } }}
                renderValue={(selectedOptions) => (
                  <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(selectedOptions as string[]).join(", ")}
                  </span>
                )}
                renderOption={(props, option, { selected: isSelected }) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      <Checkbox size="small" checked={isSelected} style={{ marginRight: 8 }} />
                      {option}
                    </li>
                  );
                }}
                renderInput={(params) => <TextField {...params} variant="standard" label="Värde" />}
                fullWidth
              />
            ) : config.kind === "enum" ? (
              <TextField
                select
                variant="standard"
                size="small"
                label="Värde"
                value={draft.value}
                onChange={(e) => setDraft((prev) => ({ ...prev, value: e.target.value }))}
                fullWidth
              >
                {(config.options ?? []).map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                variant="standard"
                size="small"
                label="Värde"
                type={config.kind === "number" ? "number" : "text"}
                value={draft.value}
                onChange={(e) => setDraft((prev) => ({ ...prev, value: e.target.value }))}
                onKeyDown={onEnter}
                autoFocus
                fullWidth
              />
            )
          ) : null}
        </div>
        <div className={styles.stocknotaFilterActions}>
          <Button size="small" color="inherit" onClick={clear}>Rensa</Button>
          <Button size="small" color="primary" onClick={apply}>Filtrera</Button>
        </div>
      </Popover>
    </>
  );
}

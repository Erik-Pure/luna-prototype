"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Autocomplete, Button, Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { useState, type ReactNode, type RefObject } from "react";
import styles from "../../page.module.scss";

type SearchFieldConfig = {
  key: string;
  label: string;
  control: "text" | "date" | "select" | "checkbox";
  multi?: boolean;
};

type FieldSetField = {
  key: string;
  label?: string;
  nomLabel?: string;
  control: "text" | "select" | "checkbox" | "checkbox-tri" | "divider";
  options?: string[];
  tableOptions?: Array<{ code: string; label: string }>;
  syncTo?: string;
  nomToggle?: boolean;
  nomGroup?: string;
  sectionLabel?: string;
  dividerLabel?: string;
  multi?: boolean;
  disabled?: boolean;
  defaultValue?: boolean | null;
};

type FieldSet = { label: string; fields: FieldSetField[] };

type SearchFiltersPanelProps = {
  textFields: SearchFieldConfig[];
  selectFields: SearchFieldConfig[];
  checkboxFields: SearchFieldConfig[];
  allTextFields?: SearchFieldConfig[];
  allSelectFields?: SearchFieldConfig[];
  allCheckboxFields?: SearchFieldConfig[];
  values: Record<string, string | string[] | boolean>;
  globalSearchValue?: string;
  onGlobalSearchChange?: (value: string) => void;
  hideGlobalSearch?: boolean;
  isMenuOpen: boolean;
  draftFields: Array<SearchFieldConfig & { visible: boolean; favorite?: boolean }>;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  searchMenuRef: RefObject<HTMLDivElement | null>;
  getSelectOptions: (key: string) => string[];
  useAdvancedFilterLayout?: boolean;
  fieldSets?: FieldSet[];
  defaultActivePresetIndex?: number;
  onOpenMenu: () => void;
  onCancelMenu: () => void;
  onToggleFieldVisibility: (key: string) => void;
  onToggleFieldFavorite?: (key: string) => void;
  onSaveFavoriteKeys?: (orderedKeys: string[]) => void;
  onSaveMenu: () => void;
  onClearMenu: () => void;
  onClearValues?: () => void;
  onTextChange: (key: string, value: string) => void;
  onSelectChange: (key: string, value: string | string[]) => void;
  onCheckboxChange: (key: string, checked: boolean) => void;
  sidePanel?: ReactNode;
};

export function SearchFiltersPanel({
  textFields,
  selectFields,
  checkboxFields,
  allTextFields,
  allSelectFields,
  allCheckboxFields,
  values,
  globalSearchValue,
  onGlobalSearchChange,
  hideGlobalSearch = false,
  isMenuOpen,
  draftFields,
  searchButtonRef,
  searchMenuRef,
  getSelectOptions,
  useAdvancedFilterLayout = false,
  fieldSets,
  defaultActivePresetIndex,
  onOpenMenu,
  onCancelMenu,
  onToggleFieldVisibility,
  onToggleFieldFavorite,
  onSaveFavoriteKeys,
  onSaveMenu,
  onClearMenu,
  onClearValues,
  onTextChange,
  onSelectChange,
  onCheckboxChange,
  sidePanel
}: SearchFiltersPanelProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(defaultActivePresetIndex ?? null);
  const [presetValues, setPresetValues] = useState<Record<number, Record<string, string | string[] | boolean | null>>>({});
  const [editFavoriteKeys, setEditFavoriteKeys] = useState<string[]>([]);
  const [draggedFavoriteKey, setDraggedFavoriteKey] = useState<string | null>(null);
  const [dropTargetFavoriteKey, setDropTargetFavoriteKey] = useState<string | null>(null);

  const renderSelectField = (field: SearchFieldConfig) => {
    if (field.multi) {
      const selected = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
      return (
        <Autocomplete
          key={field.key}
          multiple
          size="small"
          className={styles.searchFieldControl}
          options={getSelectOptions(field.key)}
          value={selected}
          onChange={(_event, newValue) => onSelectChange(field.key, newValue)}
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
          renderInput={(params) => <TextField {...params} label={field.label} />}
        />
      );
    }
    return (
      <FormControl key={field.key} size="small" className={styles.searchFieldControl}>
        <InputLabel>{field.label}</InputLabel>
        <Select
          value={String(values[field.key] ?? "")}
          label={field.label}
          onChange={(event) => onSelectChange(field.key, event.target.value)}
          IconComponent={KeyboardArrowDownIcon}
        >
          <MenuItem value="">-</MenuItem>
          {getSelectOptions(field.key).map((option) => (
            <MenuItem key={`${field.key}-${option}`} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  if (useAdvancedFilterLayout) {
    const compareByLabel = (a: SearchFieldConfig, b: SearchFieldConfig) =>
      a.label.localeCompare(b.label, "sv", { sensitivity: "base" });
    const advancedTextFields = allTextFields ?? textFields;
    const advancedSelectFields = allSelectFields ?? selectFields;
    const advancedCheckboxFields = allCheckboxFields ?? checkboxFields;
    const favoriteFieldKeys = new Set(draftFields.filter((field) => field.favorite).map((field) => field.key));

    const activePreset = activePresetIndex !== null && fieldSets ? fieldSets[activePresetIndex] : null;

    const favoriteTextFields = advancedTextFields.filter((field) => favoriteFieldKeys.has(field.key));
    const favoriteSelectFields = advancedSelectFields.filter((field) => favoriteFieldKeys.has(field.key));
    const favoriteCheckboxFields = advancedCheckboxFields.filter((field) => favoriteFieldKeys.has(field.key));
    const moreTextFields = advancedTextFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const moreSelectFields = advancedSelectFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const moreCheckboxFields = advancedCheckboxFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const sortedMoreNonCheckboxFields = [...moreTextFields, ...moreSelectFields].sort(compareByLabel);
    const sortedMoreCheckboxFields = [...moreCheckboxFields].sort(compareByLabel);

    const hasMoreFilters = activePreset
      ? activePreset.fields.length > 4
      : (moreTextFields.length > 0 || moreSelectFields.length > 0 || moreCheckboxFields.length > 0);
    const hasFavorites = !activePreset && (favoriteTextFields.length > 0 || favoriteSelectFields.length > 0 || favoriteCheckboxFields.length > 0);
    const allFields = [...advancedTextFields, ...advancedSelectFields, ...advancedCheckboxFields];
    const sortedAllFields = [...allFields].sort(compareByLabel);

    const handleStartEdit = () => {
      // Preserve existing favorite order, then add any new favorites at end
      const currentOrdered = draftFields
        .filter((f) => f.favorite)
        .map((f) => f.key);
      setEditFavoriteKeys(currentOrdered);
      setIsEditingFavorites(true);
    };

    const handleSaveFavorites = () => {
      if (onSaveFavoriteKeys) {
        onSaveFavoriteKeys(editFavoriteKeys);
      } else {
        // Fallback: toggle-based
        const original = new Set(draftFields.filter((f) => f.favorite).map((f) => f.key));
        const next = new Set(editFavoriteKeys);
        const allKeys = new Set([...original, ...next]);
        for (const key of allKeys) {
          if (original.has(key) !== next.has(key)) {
            onToggleFieldFavorite?.(key);
          }
        }
      }
      setIsEditingFavorites(false);
    };

    const handleCancelEdit = () => {
      setIsEditingFavorites(false);
    };

    const handleEditToggle = (key: string) => {
      setEditFavoriteKeys((previous) => {
        if (previous.includes(key)) return previous.filter((k) => k !== key);
        return [...previous, key];
      });
    };

    const reorderFavoriteKeys = (fromKey: string, toKey: string) => {
      setEditFavoriteKeys((previous) => {
        const fromIndex = previous.indexOf(fromKey);
        const toIndex = previous.indexOf(toKey);

        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return previous;
        }

        const next = [...previous];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    };

    const renderPresetFields = (fields: FieldSetField[], presetIndex: number) => {
      type Segment =
        | { type: "grid"; fields: FieldSetField[] }
        | { type: "divider"; label?: string }
        | { type: "checkboxes"; sectionLabel?: string; fields: FieldSetField[] };

      const segments: Segment[] = [];
      let currentGrid: FieldSetField[] | null = null;
      let currentCheckboxes: { sectionLabel?: string; fields: FieldSetField[] } | null = null;

      const flushGrid = () => {
        if (currentGrid && currentGrid.length > 0) segments.push({ type: "grid", fields: currentGrid });
        currentGrid = null;
      };
      const flushCheckboxes = () => {
        if (currentCheckboxes && currentCheckboxes.fields.length > 0) segments.push({ type: "checkboxes", ...currentCheckboxes });
        currentCheckboxes = null;
      };

      for (const field of fields) {
        if (field.control === "divider") {
          flushGrid(); flushCheckboxes();
          segments.push({ type: "divider", label: field.dividerLabel });
        } else if (field.control === "text" || field.control === "select") {
          flushCheckboxes();
          if (!currentGrid) currentGrid = [];
          currentGrid.push(field);
        } else {
          flushGrid();
          if (!currentCheckboxes || field.sectionLabel) {
            flushCheckboxes();
            currentCheckboxes = { sectionLabel: field.sectionLabel, fields: [] };
          }
          currentCheckboxes.fields.push(field);
        }
      }
      flushGrid(); flushCheckboxes();

      return (
        <>
          {segments.map((seg, si) => {
            if (seg.type === "divider") {
              return seg.label ? (
                <div key={`div-${si}`} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                  <hr className={styles.advancedFiltersDivider} style={{ flex: 1, margin: 0 }} />
                  <Typography style={{ fontSize: 11, fontWeight: 600, color: "#6a7585", whiteSpace: "nowrap" }}>{seg.label}</Typography>
                  <hr className={styles.advancedFiltersDivider} style={{ flex: 1, margin: 0 }} />
                </div>
              ) : (
                <hr key={`div-${si}`} className={styles.advancedFiltersDivider} />
              );
            }
            if (seg.type === "grid") {
              return (
                <div key={`grid-${si}`} className={styles.advancedFiltersGrid}>
                  {seg.fields.map((field) => {
                    const nomKey = `${field.nomGroup ?? field.key}_nom`;
                    const isNom = field.nomToggle && Boolean(presetValues[presetIndex]?.[nomKey]);
                    const activeLabel = isNom ? (field.nomLabel ?? field.label?.replace(/^Akt /, "Nom ")) : field.label;
                    const input = field.control === "text" ? (
                      <TextField
                        key={field.key}
                        size="small"
                        label={activeLabel}
                        className={styles.searchFieldControl}
                        style={field.nomToggle ? { flex: 1, minWidth: 0 } : undefined}
                        value={String(presetValues[presetIndex]?.[field.key] ?? "")}
                        onChange={(e) => setPresetValues((prev) => ({
                          ...prev,
                          [presetIndex]: { ...prev[presetIndex], [field.key]: e.target.value },
                        }))}
                      />
                    ) : field.multi ? (
                      <Autocomplete
                        key={field.key}
                        multiple
                        size="small"
                        className={styles.searchFieldControl}
                        style={field.nomToggle ? { flex: 1, minWidth: 0 } : undefined}
                        options={field.options ?? []}
                        value={Array.isArray(presetValues[presetIndex]?.[field.key]) ? (presetValues[presetIndex]?.[field.key] as string[]) : []}
                        onChange={(_event, newValue) => setPresetValues((prev) => ({
                          ...prev,
                          [presetIndex]: { ...prev[presetIndex], [field.key]: newValue },
                        }))}
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
                        renderInput={(params) => <TextField {...params} label={activeLabel} />}
                      />
                    ) : (
                      <FormControl key={field.key} size="small" className={styles.searchFieldControl} style={field.nomToggle ? { flex: 1, minWidth: 0 } : undefined}>
                        <InputLabel>{activeLabel}</InputLabel>
                        <Select
                          value={String(presetValues[presetIndex]?.[field.key] ?? "")}
                          label={activeLabel}
                          onChange={(e) => setPresetValues((prev) => ({
                            ...prev,
                            [presetIndex]: {
                              ...prev[presetIndex],
                              [field.key]: e.target.value,
                              ...(field.syncTo ? { [field.syncTo]: e.target.value } : {}),
                            },
                          }))}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="">-</MenuItem>
                          {field.tableOptions
                            ? field.tableOptions.map((opt) => (
                              <MenuItem key={opt.code} value={opt.code}>
                                <span style={{ display: "inline-block", minWidth: 24, color: "#6a7585", fontVariantNumeric: "tabular-nums", marginRight: 8 }}>{opt.code}</span>
                                {opt.label}
                              </MenuItem>
                            ))
                            : (field.options ?? []).map((opt) => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    );
                    if (!field.nomToggle) return input;
                    return (
                      <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Tooltip title={isNom ? "Växla till Akt" : "Växla till Nom"} placement="top">
                          <IconButton
                            size="small"
                            onClick={() => setPresetValues((prev) => ({
                              ...prev,
                              [presetIndex]: { ...prev[presetIndex], [nomKey]: !isNom },
                            }))}
                            className={styles.lineItemFieldActionButton}
                            aria-label={isNom ? "Växla till Akt" : "Växla till Nom"}
                          >
                            <SwapHorizIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {input}
                      </div>
                    );
                  })}
                </div>
              );
            }
            // checkboxes
            // Tri-state cycle: true = checked only, false = indeterminate ("both"), null = unchecked only.
            const triCycle = (cur: unknown) => cur === true ? false : cur === false ? null : true;
            return (
              <div key={`cb-${si}`}>
                {seg.sectionLabel ? (
                  <Typography style={{ fontSize: 11, fontWeight: 600, color: "#6a7585", marginBottom: 4 }}>{seg.sectionLabel}</Typography>
                ) : null}
                <div className={styles.advancedCheckboxWrap}>
                  {seg.fields.map((field) => {
                    if (field.control === "checkbox-tri") {
                      const rawVal = presetValues[presetIndex]?.[field.key];
                      const val = rawVal !== undefined ? rawVal : (field.defaultValue ?? null);
                      const isChecked = val === true;
                      const isIndet = val === false;
                      const isDisabled = Boolean(field.disabled);
                      return (
                        <label
                          key={field.key}
                          className={`${styles.searchCheckboxItem} ${isDisabled ? styles.searchCheckboxItemDisabled : ""}`}
                          style={{ cursor: isDisabled ? "default" : "pointer" }}
                          onClick={isDisabled ? undefined : () => setPresetValues((prev) => ({
                            ...prev,
                            [presetIndex]: { ...prev[presetIndex], [field.key]: triCycle(val) },
                          }))}
                        >
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            indeterminate={isIndet}
                            disabled={isDisabled}
                            readOnly
                          />
                          <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                        </label>
                      );
                    }
                    return (
                      <label key={field.key} className={styles.searchCheckboxItem}>
                        <Checkbox
                          size="small"
                          checked={Boolean(presetValues[presetIndex]?.[field.key])}
                          onChange={(e) => setPresetValues((prev) => ({
                            ...prev,
                            [presetIndex]: { ...prev[presetIndex], [field.key]: e.target.checked },
                          }))}
                        />
                        <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      );
    };

    return (
      <div className={styles.filterRow}>
        <div className={styles.advancedSearchPanel}>
          <div className={styles.advancedFiltersContainer} ref={searchMenuRef}>
            <div className={`${styles.advancedFiltersHeader} ${hideGlobalSearch && !isEditingFavorites && !(fieldSets && fieldSets.length > 0) ? styles.advancedFiltersHeaderCompact : ""}`}>

              {isEditingFavorites ? null : fieldSets && fieldSets.length > 0 ? (
                <div className={styles.advancedFiltersPresets}>
                  {fieldSets.map((fs, i) => (
                    <button
                      key={fs.label}
                      type="button"
                      className={`${styles.advancedFiltersPresetBtn} ${activePresetIndex === i ? styles.advancedFiltersPresetBtnActive : ""}`}
                      onClick={() => setActivePresetIndex((prev) => (defaultActivePresetIndex !== undefined || prev !== i) ? i : null)}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              ) : hideGlobalSearch ? null : (
                <TextField
                  size="small"
                  placeholder="Sök..."
                  className={styles.advancedSearchInput}
                  value={globalSearchValue ?? ""}
                  onChange={(event) => onGlobalSearchChange?.(event.target.value)}
                />
              )}
              {isEditingFavorites ? (
                <button type="button" className={styles.advancedFiltersToggleButton} style={{ marginLeft: "auto" }} onClick={handleCancelEdit}>
                  Avbryt
                </button>
              ) : (
                <div className={styles.advancedFiltersHeaderActions}>
                  {hasMoreFilters ? (
                    <button
                      type="button"
                      className={styles.advancedFiltersToggleButton}
                      onClick={() => setShowMoreFilters((previous) => !previous)}
                    >
                      <KeyboardArrowDownIcon
                        className={`${styles.moreFiltersChevron} ${showMoreFilters ? styles.moreFiltersChevronOpen : ""}`}
                      />
                      Alla sökfält
                    </button>
                  ) : null}
                  {onToggleFieldFavorite ? (
                    <button
                      type="button"
                      className={styles.advancedFiltersEditButton}
                      title="Redigera favoritfilter"
                      aria-label="Redigera favoritfilter"
                      onClick={handleStartEdit}
                    >
                      <EditOutlinedIcon />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.advancedFiltersClearIconButton}
                    title="Rensa filter"
                    aria-label="Rensa filter"
                    onClick={onClearValues ?? onClearMenu}
                  >
                    <RestartAltIcon />
                  </button>
                </div>
              )}
            </div>

            {isEditingFavorites ? (
              <>
                <div className={styles.advancedFiltersBody}>
                  <div className={styles.favoriteEditLayout}>
                    <div className={styles.favoriteEditLeft}>
                      <Typography className={styles.favoriteEditSectionTitle}>Tillgängliga fält</Typography>
                      <div className={styles.favoriteEditList}>
                        {sortedAllFields.map((field) => (
                          <label key={field.key} className={`${styles.favoriteEditRow} ${editFavoriteKeys.includes(field.key) ? styles.favoriteEditRowSelected : ""}`}>
                            <Checkbox
                              size="small"
                              checked={editFavoriteKeys.includes(field.key)}
                              onChange={() => handleEditToggle(field.key)}
                            />
                            <Typography className={styles.favoriteEditLabel}>{field.label}</Typography>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className={styles.favoriteEditRight}>
                      <Typography className={styles.favoriteEditSectionTitle}>
                        Visningsordning
                      </Typography>
                      {editFavoriteKeys.length === 0 ? (
                        <Typography className={styles.favoriteEditEmpty}>
                          Kryssa i fält till vänster för att lägga till dem.
                        </Typography>
                      ) : (
                        <div className={styles.favoriteOrderList}>
                          {editFavoriteKeys.map((key, index) => {
                            const field = allFields.find((f) => f.key === key);
                            if (!field) return null;
                            return (
                              <div
                                key={key}
                                className={`${styles.favoriteOrderRow} ${draggedFavoriteKey === key ? styles.favoriteOrderRowDragging : ""} ${dropTargetFavoriteKey === key ? styles.favoriteOrderRowDropTarget : ""}`}
                                draggable
                                onDragStart={() => {
                                  setDraggedFavoriteKey(key);
                                  setDropTargetFavoriteKey(key);
                                }}
                                onDragOver={(event) => {
                                  event.preventDefault();
                                  if (dropTargetFavoriteKey !== key) {
                                    setDropTargetFavoriteKey(key);
                                  }
                                }}
                                onDragEnd={() => {
                                  setDraggedFavoriteKey(null);
                                  setDropTargetFavoriteKey(null);
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  if (draggedFavoriteKey) {
                                    reorderFavoriteKeys(draggedFavoriteKey, key);
                                  }
                                  setDraggedFavoriteKey(null);
                                  setDropTargetFavoriteKey(null);
                                }}
                              >
                                <span className={styles.favoriteOrderIndex}>{index + 1}</span>
                                <Typography className={styles.favoriteOrderLabel}>{field.label}</Typography>
                                <span className={styles.favoriteOrderHandle} title="Dra för att ändra ordning">
                                  <DragIndicatorIcon fontSize="inherit" />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.favoriteEditFooter}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      className={styles.actionItemPrimary}
                      onClick={handleSaveFavorites}
                    >
                      Spara urval
                    </Button>
                  </div>
                </div>
              </>
            ) : activePreset && activePresetIndex !== null ? (
              <div className={styles.advancedFiltersBody}>
                {renderPresetFields(activePreset.fields.slice(0, 4), activePresetIndex)}
                {showMoreFilters && activePreset.fields.length > 4 ? (
                  <>
                    <hr className={styles.advancedFiltersDivider} />
                    {renderPresetFields(activePreset.fields.slice(4), activePresetIndex)}
                  </>
                ) : null}
              </div>
            ) : (
              <>
                <div className={styles.advancedFiltersBody}>
                  {!hasFavorites ? (
                    <Typography className={styles.advancedFiltersHint}>
                      Inga filter valda. Klicka Redigera för att välja vilka filter som ska visas här.
                    </Typography>
                  ) : null}

                  <div className={styles.advancedFiltersGrid}>
                    {favoriteTextFields.map((field) => (
                      <TextField
                        key={field.key}
                        size="small"
                        label={field.label}
                        type={field.control === "date" ? "date" : undefined}
                        slotProps={field.control === "date" ? { inputLabel: { shrink: true } } : undefined}
                        className={styles.searchFieldControl}
                        value={String(values[field.key] ?? "")}
                        onChange={(event) => onTextChange(field.key, event.target.value)}
                      />
                    ))}
                    {favoriteSelectFields.map((field) => renderSelectField(field))}
                  </div>

                  {favoriteCheckboxFields.length > 0 ? (
                    <div className={styles.advancedCheckboxWrap}>
                      {favoriteCheckboxFields.map((field) => (
                        <label key={field.key} className={styles.searchCheckboxItem}>
                          <Checkbox
                            size="small"
                            checked={Boolean(values[field.key])}
                            onChange={(event) => onCheckboxChange(field.key, event.target.checked)}
                          />
                          <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {hasMoreFilters && showMoreFilters ? (
                    <>
                      <hr className={styles.advancedFiltersDivider} />
                      <div className={styles.advancedFiltersGrid}>
                        {sortedMoreNonCheckboxFields.map((field) =>
                          field.control === "text" || field.control === "date" ? (
                            <TextField
                              key={field.key}
                              size="small"
                              label={field.label}
                              type={field.control === "date" ? "date" : undefined}
                              slotProps={field.control === "date" ? { inputLabel: { shrink: true } } : undefined}
                              className={styles.searchFieldControl}
                              value={String(values[field.key] ?? "")}
                              onChange={(event) => onTextChange(field.key, event.target.value)}
                            />
                          ) : renderSelectField(field)
                        )}
                      </div>
                      {sortedMoreCheckboxFields.length > 0 ? (
                        <div className={styles.advancedCheckboxWrap}>
                          {sortedMoreCheckboxFields.map((field) => (
                            <label key={field.key} className={styles.searchCheckboxItem}>
                              <Checkbox
                                size="small"
                                checked={Boolean(values[field.key])}
                                onChange={(event) => onCheckboxChange(field.key, event.target.checked)}
                              />
                              <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
        {sidePanel}
      </div>
    );
  }

  return (
    <div className={styles.filterRow}>
      <div className={styles.searchFieldsPanel}>
        <div className={styles.searchFieldsContainer}>
          <div className={styles.searchFieldsTopRow}>
            <div className={styles.searchFieldsContent}>
              {textFields.length > 0 ? (
                <div className={styles.searchFieldsGroup}>
                  <div className={styles.searchFieldsGrid}>
                    {textFields.map((field) => (
                      <div key={field.key} className={styles.searchFieldItem}>
                        <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                        <TextField
                          size="small"
                          className={styles.searchFieldControl}
                          value={String(values[field.key] ?? "")}
                          onChange={(event) => onTextChange(field.key, event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectFields.length > 0 ? (
                <div className={styles.searchFieldsGroup}>
                  <div className={styles.searchFieldsGrid}>
                    {selectFields.map((field) => (
                      <div key={field.key} className={styles.searchFieldItem}>
                        <Typography className={styles.searchFieldLabel}>{field.label}</Typography>
                        <Select
                          size="small"
                          className={styles.searchFieldControl}
                          value={String(values[field.key] ?? "")}
                          onChange={(event) => onSelectChange(field.key, event.target.value)}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="">-</MenuItem>
                          {getSelectOptions(field.key).map((option) => (
                            <MenuItem key={`${field.key}-${option}`} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {checkboxFields.length > 0 ? (
                <div className={styles.searchFieldsGroup}>
                  <div className={styles.searchCheckboxGrid}>
                    {checkboxFields.map((field) => (
                      <label key={field.key} className={styles.searchCheckboxItem}>
                        <Checkbox
                          size="small"
                          checked={Boolean(values[field.key])}
                          onChange={(event) => onCheckboxChange(field.key, event.target.checked)}
                        />
                        <Typography className={styles.searchCheckboxLabel}>{field.label}</Typography>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {textFields.length === 0 && selectFields.length === 0 && checkboxFields.length === 0 ? (
                <div className={`${styles.searchFieldsGroup} ${styles.searchFieldsEmptyGroup}`}>
                  <Typography className={styles.searchFieldLabel}>
                    Inga filter valda. Öppna Sökfält för att visa filter.
                  </Typography>
                </div>
              ) : null}
            </div>

            <div className={styles.searchFieldsActions}>
              <div className={styles.searchMenuWrapper}>
                <Button
                  ref={searchButtonRef}
                  className={styles.searchActionButton}
                  variant="outlined"
                  startIcon={<SearchIcon className={styles.searchActionIcon} />}
                  onClick={isMenuOpen ? onCancelMenu : onOpenMenu}
                >
                  Sökfält
                </Button>

                {isMenuOpen ? (
                  <div className={styles.searchFieldsDropdown} ref={searchMenuRef}>
                    <div className={styles.searchFieldsDropdownList}>
                      {draftFields.map((field) => (
                        <div key={field.key} className={styles.searchFieldsDropdownRow}>
                          <button
                            type="button"
                            className={styles.searchFieldsDropdownName}
                            onClick={() => onToggleFieldVisibility(field.key)}
                          >
                            <Checkbox
                              size="small"
                              checked={field.visible}
                              className={styles.dropdownCheckbox}
                            />
                            <Typography className={styles.searchFieldsDropdownLabel}>
                              {field.label}
                            </Typography>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.columnsDropdownFooter}>
                      <Button className={styles.dropdownSave} size="small" onClick={onSaveMenu}>
                        Spara
                      </Button>
                      <Button className={styles.dropdownCancel} size="small" onClick={onCancelMenu}>
                        Avbryt
                      </Button>
                      <Button className={styles.dropdownClear} size="small" onClick={onClearMenu}>
                        Rensa
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

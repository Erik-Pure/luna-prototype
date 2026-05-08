"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState, type RefObject } from "react";
import styles from "../../page.module.scss";

type SearchFieldConfig = {
  key: string;
  label: string;
  control: "text" | "select" | "checkbox";
};

type SearchFiltersPanelProps = {
  textFields: SearchFieldConfig[];
  selectFields: SearchFieldConfig[];
  checkboxFields: SearchFieldConfig[];
  allTextFields?: SearchFieldConfig[];
  allSelectFields?: SearchFieldConfig[];
  allCheckboxFields?: SearchFieldConfig[];
  values: Record<string, string | boolean>;
  globalSearchValue?: string;
  onGlobalSearchChange?: (value: string) => void;
  isMenuOpen: boolean;
  draftFields: Array<SearchFieldConfig & { visible: boolean; favorite?: boolean }>;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  searchMenuRef: RefObject<HTMLDivElement | null>;
  getSelectOptions: (key: string) => string[];
  useAdvancedFilterLayout?: boolean;
  onOpenMenu: () => void;
  onCancelMenu: () => void;
  onToggleFieldVisibility: (key: string) => void;
  onToggleFieldFavorite?: (key: string) => void;
  onSaveFavoriteKeys?: (orderedKeys: string[]) => void;
  onSaveMenu: () => void;
  onClearMenu: () => void;
  onClearValues?: () => void;
  onTextChange: (key: string, value: string) => void;
  onSelectChange: (key: string, value: string) => void;
  onCheckboxChange: (key: string, checked: boolean) => void;
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
  isMenuOpen,
  draftFields,
  searchButtonRef,
  searchMenuRef,
  getSelectOptions,
  useAdvancedFilterLayout = false,
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
  onCheckboxChange
}: SearchFiltersPanelProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  const [editFavoriteKeys, setEditFavoriteKeys] = useState<string[]>([]);
  const [draggedFavoriteKey, setDraggedFavoriteKey] = useState<string | null>(null);
  const [dropTargetFavoriteKey, setDropTargetFavoriteKey] = useState<string | null>(null);

  if (useAdvancedFilterLayout) {
    const compareByLabel = (a: SearchFieldConfig, b: SearchFieldConfig) =>
      a.label.localeCompare(b.label, "sv", { sensitivity: "base" });
    const advancedTextFields = allTextFields ?? textFields;
    const advancedSelectFields = allSelectFields ?? selectFields;
    const advancedCheckboxFields = allCheckboxFields ?? checkboxFields;
    const favoriteFieldKeys = new Set(draftFields.filter((field) => field.favorite).map((field) => field.key));

    const favoriteTextFields = advancedTextFields.filter((field) => favoriteFieldKeys.has(field.key));
    const favoriteSelectFields = advancedSelectFields.filter((field) => favoriteFieldKeys.has(field.key));
    const favoriteCheckboxFields = advancedCheckboxFields.filter((field) => favoriteFieldKeys.has(field.key));
    const moreTextFields = advancedTextFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const moreSelectFields = advancedSelectFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const moreCheckboxFields = advancedCheckboxFields.filter((field) => !favoriteFieldKeys.has(field.key));
    const sortedMoreNonCheckboxFields = [...moreTextFields, ...moreSelectFields].sort(compareByLabel);
    const sortedMoreCheckboxFields = [...moreCheckboxFields].sort(compareByLabel);
    const hasMoreFilters =
      moreTextFields.length > 0 || moreSelectFields.length > 0 || moreCheckboxFields.length > 0;
    const hasFavorites =
      favoriteTextFields.length > 0 || favoriteSelectFields.length > 0 || favoriteCheckboxFields.length > 0;
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

    return (
      <div className={styles.filterRow}>
        <div className={styles.advancedSearchPanel}>
          <div className={styles.advancedFiltersContainer} ref={searchMenuRef}>
            <div className={styles.advancedFiltersHeader}>
              {isEditingFavorites ? (
                <Typography className={styles.advancedFiltersTitle}>Välj filter att spara</Typography>
              ) : (
                <TextField
                  size="small"
                  placeholder="Sök..."
                  className={styles.advancedSearchInput}
                  value={globalSearchValue ?? ""}
                  onChange={(event) => onGlobalSearchChange?.(event.target.value)}
                />
              )}
              {isEditingFavorites ? (
                <button type="button" className={styles.advancedFiltersToggleButton} onClick={handleCancelEdit}>
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
                      Alla filter
                    </button>
                  ) : null}
                  {onToggleFieldFavorite ? (
                    <button type="button" className={styles.advancedFiltersEditButton} onClick={handleStartEdit}>
                      Redigera
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
                </div>
                <div className={styles.advancedFiltersFooter}>
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
              </>
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
                        className={styles.searchFieldControl}
                        value={String(values[field.key] ?? "")}
                        onChange={(event) => onTextChange(field.key, event.target.value)}
                      />
                    ))}

                    {favoriteSelectFields.map((field) => (
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
                            <MenuItem key={`${field.key}-${option}`} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
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
                      <Typography className={styles.advancedFiltersSectionTitle}>Alla filter</Typography>
                      <div className={styles.advancedFiltersGrid}>
                        {sortedMoreNonCheckboxFields.map((field) =>
                          field.control === "text" ? (
                            <TextField
                              key={field.key}
                              size="small"
                              label={field.label}
                              className={styles.searchFieldControl}
                              value={String(values[field.key] ?? "")}
                              onChange={(event) => onTextChange(field.key, event.target.value)}
                            />
                          ) : (
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
                                  <MenuItem key={`${field.key}-${option}`} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )
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

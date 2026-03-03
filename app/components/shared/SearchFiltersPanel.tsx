"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Checkbox, MenuItem, Select, TextField, Typography } from "@mui/material";
import type { RefObject } from "react";
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
  values: Record<string, string | boolean>;
  isMenuOpen: boolean;
  draftFields: Array<SearchFieldConfig & { visible: boolean }>;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  searchMenuRef: RefObject<HTMLDivElement | null>;
  getSelectOptions: (key: string) => string[];
  onOpenMenu: () => void;
  onCancelMenu: () => void;
  onToggleFieldVisibility: (key: string) => void;
  onSaveMenu: () => void;
  onClearMenu: () => void;
  onTextChange: (key: string, value: string) => void;
  onSelectChange: (key: string, value: string) => void;
  onCheckboxChange: (key: string, checked: boolean) => void;
};

export function SearchFiltersPanel({
  textFields,
  selectFields,
  checkboxFields,
  values,
  isMenuOpen,
  draftFields,
  searchButtonRef,
  searchMenuRef,
  getSelectOptions,
  onOpenMenu,
  onCancelMenu,
  onToggleFieldVisibility,
  onSaveMenu,
  onClearMenu,
  onTextChange,
  onSelectChange,
  onCheckboxChange
}: SearchFiltersPanelProps) {
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

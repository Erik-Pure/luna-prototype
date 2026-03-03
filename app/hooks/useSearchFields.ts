"use client";

import { useMemo, useState } from "react";

export type ManagedSearchField<TFieldKey extends string> = {
  key: TFieldKey;
  label: string;
  control: "text" | "select" | "checkbox";
  visible: boolean;
};

export function useSearchFields<TFieldKey extends string>(
  initialFields: Array<ManagedSearchField<TFieldKey>>,
  initialValues: Record<TFieldKey, string | boolean>
) {
  const [values, setValues] = useState<Record<TFieldKey, string | boolean>>(initialValues);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [appliedFields, setAppliedFields] = useState<Array<ManagedSearchField<TFieldKey>>>(initialFields);
  const [draftFields, setDraftFields] = useState<Array<ManagedSearchField<TFieldKey>>>(initialFields);

  const visibleFields = useMemo(
    () => appliedFields.filter((field) => field.visible),
    [appliedFields]
  );
  const textFields = useMemo(
    () => visibleFields.filter((field) => field.control === "text"),
    [visibleFields]
  );
  const selectFields = useMemo(
    () => visibleFields.filter((field) => field.control === "select"),
    [visibleFields]
  );
  const checkboxFields = useMemo(
    () => visibleFields.filter((field) => field.control === "checkbox"),
    [visibleFields]
  );

  const openMenu = () => {
    setDraftFields(appliedFields);
    setIsMenuOpen(true);
  };

  const cancelMenu = () => {
    setDraftFields(appliedFields);
    setIsMenuOpen(false);
  };

  const saveMenu = () => {
    setAppliedFields(draftFields);
    setIsMenuOpen(false);
  };

  const clearMenu = () => {
    setDraftFields((previous) =>
      previous.map((field) => ({
        ...field,
        visible: false
      }))
    );
  };

  const toggleFieldVisibility = (key: TFieldKey) => {
    setDraftFields((previous) =>
      previous.map((field) =>
        field.key === key ? { ...field, visible: !field.visible } : field
      )
    );
  };

  const updateText = (key: TFieldKey, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const updateSelect = (key: TFieldKey, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const updateCheckbox = (key: TFieldKey, checked: boolean) => {
    setValues((previous) => ({ ...previous, [key]: checked }));
  };

  return {
    values,
    isMenuOpen,
    setIsMenuOpen,
    appliedFields,
    draftFields,
    visibleFields,
    textFields,
    selectFields,
    checkboxFields,
    openMenu,
    cancelMenu,
    saveMenu,
    clearMenu,
    toggleFieldVisibility,
    updateText,
    updateSelect,
    updateCheckbox
  };
}

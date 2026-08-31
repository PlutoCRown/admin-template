import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  applyFieldTypeDefaults,
  createFormBuilderField,
  getDefaultFormBuilderFields,
  getDefaultFormBuilderSettings,
  type FormBuilderField,
  type FormBuilderFieldType,
  type FormBuilderSettings,
} from "#pages/form-builder/schema";

interface FormBuilderState {
  fields: FormBuilderField[];
  settings: FormBuilderSettings;
  /** 重置时递增，用于强制表单 remount */
  epoch: number;
  exportOpen: boolean;
  setFields: (fields: FormBuilderField[]) => void;
  updateField: (id: string, patch: Partial<FormBuilderField>) => void;
  changeFieldType: (id: string, type: FormBuilderFieldType) => void;
  removeField: (id: string) => void;
  addField: () => void;
  moveField: (fromIndex: number, toIndex: number) => void;
  patchSettings: (patch: Partial<FormBuilderSettings>) => void;
  reset: () => void;
  setExportOpen: (open: boolean) => void;
}

export const useFormBuilderStore = create<FormBuilderState>()(
  persist(
    immer((set) => ({
      fields: getDefaultFormBuilderFields(),
      settings: getDefaultFormBuilderSettings(),
      epoch: 0,
      exportOpen: false,
      setFields: (fields) => {
        set((state) => {
          state.fields = fields;
        });
      },
      updateField: (id, patch) => {
        set((state) => {
          const field = state.fields.find((item) => item.id === id);
          if (field) {
            Object.assign(field, patch);
          }
        });
      },
      changeFieldType: (id, type) => {
        set((state) => {
          const field = state.fields.find((item) => item.id === id);
          if (field) {
            Object.assign(field, applyFieldTypeDefaults(field, type));
          }
        });
      },
      removeField: (id) => {
        set((state) => {
          state.fields = state.fields.filter((item) => item.id !== id);
        });
      },
      addField: () => {
        set((state) => {
          state.fields.push(createFormBuilderField());
        });
      },
      moveField: (fromIndex, toIndex) => {
        set((state) => {
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= state.fields.length ||
            toIndex >= state.fields.length
          ) {
            return;
          }
          const [moved] = state.fields.splice(fromIndex, 1);
          if (moved) {
            state.fields.splice(toIndex, 0, moved);
          }
        });
      },
      patchSettings: (patch) => {
        set((state) => {
          Object.assign(state.settings, patch);
        });
      },
      reset: () => {
        set((state) => {
          state.fields = getDefaultFormBuilderFields();
          state.settings = getDefaultFormBuilderSettings();
          state.epoch += 1;
          state.exportOpen = false;
        });
      },
      setExportOpen: (open) => {
        set((state) => {
          state.exportOpen = open;
        });
      },
    })),
    {
      name: "admin-form-builder",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fields: state.fields,
        settings: state.settings,
      }),
    },
  ),
);

export function useFormBuilderHydration() {
  return useSyncExternalStore(
    (onChange) => useFormBuilderStore.persist.onFinishHydration(onChange),
    () => useFormBuilderStore.persist.hasHydrated(),
    () => false,
  );
}

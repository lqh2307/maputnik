import { DialogAction, DialogStore } from "./Types";
import { createInitDialog } from "./Utils";
import { create } from "zustand";

/** Zustand hook for runtime visibility of editor dialogs. */
export const useDialogStore = create<DialogStore & DialogAction>()((set) => {
  // =========================
  // Start Methods
  // =========================

  /** Shallow-merge one or more dialog visibility values. */
  function updateDialog(opt?: DialogStore): boolean {
    if (!opt) {
      return false;
    }

    set(opt);

    return true;
  }

  /** Close all dialogs. Cross-store workflows call this from their component. */
  function closeDialogs(): void {
    set(createInitDialog());
  }

  // =========================
  // End Methods
  // =========================

  return {
    // =========================
    // Attributes
    // =========================

    ...createInitDialog(),

    // =========================
    // Methods
    // =========================

    updateDialog,
    closeDialogs,
  };
});

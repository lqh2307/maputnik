import { MapModeAction, MapModeStore } from "./Types";
import { MapMode } from "../layouts/Types";
import { create } from "zustand";

/** Zustand hook for the map canvas interaction mode. */
export const useMapModeStore = create<MapModeStore & MapModeAction>()((set) => {
  // =========================
  // Start Methods
  // =========================

  /** Switches the canvas between navigation and feature inspection. */
  function setMapMode(mapMode: MapMode): void {
    set({
      mapMode,
    });
  }

  // =========================
  // End Methods
  // =========================

  return {
    // =========================
    // Attributes
    // =========================

    mapMode: "map",

    // =========================
    // Methods
    // =========================

    setMapMode,
  };
});

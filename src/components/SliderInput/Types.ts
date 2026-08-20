import { SliderProps } from "@mui/material";
import React from "react";

/** Defines slider input prop. */
export type SliderInputProp = Omit<SliderProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (value: number) => void;
};

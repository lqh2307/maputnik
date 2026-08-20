import { CheckboxProps } from "@mui/material";
import React from "react";

/** Defines tooltip checkbox prop. */
export type TooltipCheckboxProp = Omit<CheckboxProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Text label displayed to the user. */
  label?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (checked: boolean, value: string) => void;
};

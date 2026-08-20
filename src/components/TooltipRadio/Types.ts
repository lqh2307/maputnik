import { RadioProps } from "@mui/material";
import React from "react";

/** Defines tooltip radio prop. */
export type TooltipRadioProp = Omit<RadioProps, "onChange"> & {
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

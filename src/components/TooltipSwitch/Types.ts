import { SwitchProps, SxProps, Theme } from "@mui/material";
import React from "react";

/** Defines tooltip switch prop. */
export type TooltipSwitchProp = Omit<SwitchProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Text label displayed to the user. */
  label?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Configuration for wrapper sx. */
  wrapperSx?: SxProps<Theme>;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (checked: boolean, value: string) => void;
};

import { ButtonProps, TooltipProps } from "@mui/material";
import React from "react";

/** Defines import file button prop. */
export type ImportFileButtonProp = Omit<ButtonProps, "onClick"> & {
  /** Human-readable title. */
  title?: string;
  /** Configuration for title placement. */
  titlePlacement?: TooltipProps["placement"];
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Delay in milliseconds. */
  delay?: number;

  /** Event callback for click. */
  onClick?: (value: string) => void;

  /** Configuration for progress. */
  progress?: number;

  /** Configuration for accept mime type. */
  acceptMimeType?: string;
  /** Event callback for file loaded. */
  onFileLoaded: (file: File) => void;
};

import { ButtonProps, PopperPlacementType, TooltipProps } from "@mui/material";
import React from "react";

/** Defines toggle button prop. */
export type ToggleButtonProp = Omit<ButtonProps, "onClick"> & {
  /** Human-readable title. */
  title?: string;
  /** Configuration for title placement. */
  titlePlacement?: TooltipProps["placement"];
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Configuration for background. */
  background?: React.CSSProperties["background"];
  /** Configuration for outline. */
  outline?: React.CSSProperties["outline"];

  /** Configuration for context menu. */
  contextMenu?: React.ReactNode;
  /** Configuration for context menu placement. */
  contextMenuPlacement?: PopperPlacementType;
  /** Whether context menu close on click away. */
  contextMenuCloseOnClickAway?: boolean;
  /** Whether context menu close on click inside. */
  contextMenuCloseOnClickInside?: boolean;

  /** Delay in milliseconds. */
  delay?: number;
  /** Whether checked. */
  checked?: boolean;
  /** Whether default checked. */
  defaultChecked?: boolean;
  /** Event callback for click. */
  onClick?: (value: string, checked: boolean) => void;

  /** Configuration for progress. */
  progress?: number;
};

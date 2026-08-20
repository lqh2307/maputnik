import { ButtonProps, PopperPlacementType, TooltipProps } from "@mui/material";
import React from "react";

/** Defines tooltip button prop. */
export type TooltipButtonProp = Omit<ButtonProps, "onClick" | "contextMenu"> & {
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
  /** Called immediately before this button opens or toggles its context menu. */
  onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for click. */
  onClick?: (value: string, event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Configuration for progress. */
  progress?: number;
};

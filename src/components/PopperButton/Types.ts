import { ButtonProps, PopperPlacementType, TooltipProps } from "@mui/material";
import React from "react";

/** Defines popper button prop. */
export type PopperButtonProp = Omit<ButtonProps, "onClick"> & {
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
  /** Whether init open. */
  initOpen?: boolean;

  /** Configuration for placement. */
  placement?: PopperPlacementType;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for click. */
  onClick?: (value: string) => void;

  /** Configuration for progress. */
  progress?: number;

  /** Whether close on click away. */
  closeOnClickAway?: boolean;
  /** Whether close on click inside. */
  closeOnClickInside?: boolean;
};

import { SxProps, Theme, TooltipProps } from "@mui/material";
import React from "react";

/** Defines grid item prop. */
export type GridItemProp = {
  /** Human-readable title. */
  title?: string;
  /** Configuration for title placement. */
  titlePlacement?: TooltipProps["placement"];
  /** Current input value. */
  value: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for image src. */
  imageSrc?: string;
  /** Configuration for image alt. */
  imageAlt?: string;
  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for click. */
  onClick?: (value: string) => void | Promise<void>;
  /** MUI system styles applied to the component. */
  sx?: SxProps<Theme>;
};

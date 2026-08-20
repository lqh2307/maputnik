import { TabProps, TooltipProps } from "@mui/material";
import React from "react";

/** Defines tooltip tab prop. */
export type TooltipTabProp = Omit<TabProps, "title"> & {
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Human-readable title displayed in the tooltip. */
  title?: TooltipProps["title"];
  /** Configuration for tooltip placement. */
  titlePlacement?: TooltipProps["placement"];
};

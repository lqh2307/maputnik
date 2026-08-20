import { SvgIconProps } from "@mui/material";

/** Defines LayerTypeIcon component props. */
export type LayerTypeIconProp = SvgIconProps & {
  /** MapLibre layer type string (fill, line, symbol, circle, heatmap, etc.). */
  type: string;
};

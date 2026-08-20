import { Vector2d } from "konva/lib/types";
import { BoxProps } from "@mui/material";

/** Defines position tooltip prop. */
export type PositionTooltipProp = Omit<BoxProps, "position"> & {
  /** Position in the parent coordinate system. */
  position?: Vector2d;
  /** Configuration for container. */
  container?: HTMLElement;
  /** Configuration for offset. */
  offset?: Vector2d;
};

/** Defines tooltip info. */
export type TooltipInfo = Pick<
  PositionTooltipProp,
  "position" | "offset" | "children"
>;

/** Defines position tooltip api. */
export type PositionTooltipAPI = {
  /** Updates the current value. */
  update: (info: TooltipInfo) => void;
  /** Resets the current value. */
  reset: () => void;
};

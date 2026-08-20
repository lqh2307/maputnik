import { Vector2d } from "konva/lib/types";
import { BoxProps } from "@mui/material";

/** Defines position box prop. */
export type PositionBoxProp = Omit<BoxProps, "position"> & {
  /** Position in the parent coordinate system. */
  position?: Vector2d;
  /** Configuration for container. */
  container?: HTMLElement;
  /** Configuration for offset. */
  offset?: Vector2d;
  /** Whether close on click away. */
  closeOnClickAway?: boolean;
  /** Whether close on click inside. */
  closeOnClickInside?: boolean;
};

/** Defines position box info. */
export type PositionBoxInfo = Pick<
  PositionBoxProp,
  "position" | "offset" | "children"
>;

/** Defines position box api. */
export type PositionBoxAPI = {
  /** Updates the current value. */
  update: (info?: PositionBoxInfo) => void;
  /** Resets the current value. */
  reset: () => void;
};

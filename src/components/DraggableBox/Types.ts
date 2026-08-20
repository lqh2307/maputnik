import { Vector2d } from "konva/lib/types";
import { BoxProps } from "@mui/material";

/** Defines draggable box props. */
export type DraggableBoxProps = BoxProps & {
  /** Unique identifier for this entity. */
  id?: string;
  /** Configuration for default position. */
  defaultPosition?: Vector2d;
  /** Configuration for container ref. */
  containerRef?: React.RefObject<HTMLElement>;
  /** Whether draggable. */
  draggable?: boolean;
};

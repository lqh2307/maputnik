import { BoxProps } from "@mui/material";

/** Defines loading prop. */
export type LoadingProp = BoxProps & {
  /** Whether the component is open. */
  open?: boolean;

  /** Width and height dimensions. */
  size?: number;

  /** Whether full parent. */
  fullParent?: boolean;
};

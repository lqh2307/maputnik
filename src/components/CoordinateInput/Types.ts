import { SxProps, TextFieldProps, Theme } from "@mui/material";

/** Defines coordinate input mode. */
export type CoordinateInputMode = "decimal" | "dms";
/** Defines coordinate layout. */
export type CoordinateLayout = "row" | "column";

/** Defines coordinate input prop. */
export type CoordinateInputProp = Omit<TextFieldProps, "onChange" | "label"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Whether shrink. */
  shrink?: boolean;
  /** Configuration for layout. */
  layout?: CoordinateLayout;
  /** Whether show mode toggle. */
  showModeToggle?: boolean;
  /** Configuration for init mode. */
  initMode?: CoordinateInputMode;
  /** Event callback for mode change. */
  onModeChange?: (mode: CoordinateInputMode) => void;
  /** Configuration for wrapper sx. */
  wrapperSx?: SxProps<Theme>;
  /** Configuration for toggle sx. */
  toggleSx?: SxProps<Theme>;

  /** Label shown while entering decimal coordinates. */
  decimalLabel?: string;
  /** Label shown for the degree portion of a DMS coordinate. */
  degreeLabel?: string;
  /** Label shown for the minute portion of a DMS coordinate. */
  minuteLabel?: string;
  /** Label shown for the second portion of a DMS coordinate. */
  secondLabel?: string;
  /** Label shown for the X axis when `isGeographic` is false. */
  xLabel?: string;
  /** Label shown for the Y axis when `isGeographic` is false. */
  yLabel?: string;

  /** Whether lat. */
  isLat?: boolean;

  /** True for longitude/latitude coordinates; false for projected X/Y coordinates. */
  isGeographic?: boolean;

  /** Configuration for decimal step. */
  decimalStep?: number;
  /** Configuration for minute step. */
  minuteStep?: number;
  /** Configuration for second step. */
  secondStep?: number;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (value: number) => void;
};

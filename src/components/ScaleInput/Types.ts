import { SxProps, TextFieldProps, Theme } from "@mui/material";
import { TileSize } from "../../types/Common";

/** Defines scale input mode. */
export type ScaleInputMode = "scale" | "zoom";
/** Defines scale input layout. */
export type ScaleInputLayout = "row" | "column";

/** Defines scale input prop. */
export type ScaleInputProp = Omit<TextFieldProps, "onChange" | "label"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Whether shrink. */
  shrink?: boolean;
  /** Configuration for layout. */
  layout?: ScaleInputLayout;
  /** Whether show mode toggle. */
  showModeToggle?: boolean;
  /** Initial input mode. */
  initMode?: ScaleInputMode;
  /** Event callback for mode change. */
  onModeChange?: (mode: ScaleInputMode) => void;
  /** Configuration for wrapper sx. */
  wrapperSx?: SxProps<Theme>;
  /** Configuration for toggle sx. */
  toggleSx?: SxProps<Theme>;

  /** Label shown while entering a map scale. */
  scaleLabel?: string;
  /** Label shown while entering a map zoom. */
  zoomLabel?: string;

  /** Minimum scale denominator exposed to the native input. */
  minScale?: number;
  /** Maximum scale denominator exposed to the native input. */
  maxScale?: number;
  /** Minimum zoom level exposed to the native input. */
  minZoom?: number;
  /** Maximum zoom level exposed to the native input. */
  maxZoom?: number;
  /** Step when entering a scale denominator. */
  scaleStep?: number;
  /** Step when entering a zoom level. */
  zoomStep?: number;
  /** Tile size used to convert scale and zoom. */
  tileSize?: TileSize;
  /** Pixels per inch used to convert scale and zoom. */
  ppi?: number;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for a scale denominator change; a blank input yields `0`. */
  onChange?: (value: number) => void;
};

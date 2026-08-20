import { CSSProperties } from "react";
import { SxProps, Theme } from "@mui/material";

/** Reusable icon size small sx. */
export const ICON_SMALL: SxProps<Theme> = {
  fontSize: "small",
};

/** Reusable centered item icon container sx. */
export const ITEM_ICON: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Reusable 100% width and height container sx. */
export const FULL_SIZE: CSSProperties = {
  width: "100%",
  height: "100%",
};

/** Centered flex container sx. */
export const FLEX_CENTER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Flex row with vertically centered items sx. */
export const FLEX_ROW_CENTER: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};

/** Flex column container sx. */
export const FLEX_COLUMN: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

/** Single line text overflow ellipsis sx. */
export const TEXT_ELLIPSIS: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Monospace font styling for code/JSON textareas sx. */
export const CODE_TEXTAREA: SxProps<Theme> = {
  "& textarea": {
    fontFamily: "monospace",
    fontSize: 12,
  },
};

/** Small text button styling sx. */
export const TEXT_BUTTON: CSSProperties = {
  fontSize: "10px",
};

/** Dialog title styling sx. */
export const DIALOG_TITLE: SxProps<Theme> = {
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "error.main",
};

/** Dialog content scrolling container sx. */
export const DIALOG_CONTENT: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  overflowY: "auto",
  maxHeight: "32rem",
};

/** Auto scrolling container sx. */
export const SCROLL_AUTO: CSSProperties = {
  overflow: "auto",
};

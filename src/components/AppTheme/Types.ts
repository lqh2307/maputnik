import { ThemeOptions } from "@mui/material";
import { PropsWithChildren } from "react";

/** Defines theme mode. */
export type ThemeMode = "system" | "black" | "blue" | "grey" | "white";

/** Defines app theme prop. */
export type AppThemeProp = PropsWithChildren & {
  /** Configuration for theme. */
  theme?: ThemeMode;
  /** Configuration for mui theme options. */
  muiThemeOptions?: ThemeOptions;
  /** Whether enable css baseline. */
  enableCssBaseline?: boolean;
};

/** Defines token item. */
export type TokenItem = {
  /** Current input value. */
  value: string;
};

/** Defines theme token map. */
export type ThemeTokenMap = Record<string, TokenItem>;

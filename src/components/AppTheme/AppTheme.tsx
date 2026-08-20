import { AppThemeProp, ThemeMode, ThemeTokenMap } from "./Types";
import { getTokenValue, normalizeThemeMode } from "./utils";
import colorTokens from "../../configs/color/color.json";
import { capitalizeWords } from "../../utils/String";
import { WHITE_COLOR } from "../../configs";
import React from "react";
import {
  ThemeProvider,
  useMediaQuery,
  createTheme,
  CssBaseline,
} from "@mui/material";

/** Renders the AppTheme component. */
export const AppTheme = React.memo(
  ({
    children,
    theme = "system",
    muiThemeOptions = {},
    enableCssBaseline = true,
  }: AppThemeProp): React.JSX.Element => {
    const prefersDarkMode: boolean = useMediaQuery(
      "(prefers-color-scheme: dark)"
    );
    const normalizedTheme: ThemeMode = React.useMemo(() => {
      return normalizeThemeMode(theme ?? "system");
    }, [theme]);

    const resolvedTheme = React.useMemo<Exclude<ThemeMode, "system">>(() => {
      if (normalizedTheme === "system") {
        return prefersDarkMode ? "black" : "white";
      }

      return normalizedTheme;
    }, [normalizedTheme, prefersDarkMode]);

    const muiTheme = React.useMemo(() => {
      const tokenMap: ThemeTokenMap =
        (colorTokens as Record<string, ThemeTokenMap>)[
          capitalizeWords(resolvedTheme)
        ] ?? {};

      return createTheme({
        ...muiThemeOptions,
        palette: {
          ...muiThemeOptions.palette,
          mode: resolvedTheme === "black" ? "dark" : "light",
          primary: {
            ...muiThemeOptions.palette?.primary,
            main: getTokenValue(tokenMap, "bg-button-primary", "#0065ff"),
            contrastText: getTokenValue(
              tokenMap,
              "text-on-primary",
              WHITE_COLOR
            ),
          },
          error: {
            ...muiThemeOptions.palette?.error,
            main: getTokenValue(tokenMap, "bg-button-danger", "#da1e28"),
            contrastText: getTokenValue(
              tokenMap,
              "text-on-danger",
              WHITE_COLOR
            ),
          },
          text: {
            ...muiThemeOptions.palette?.text,
            primary: getTokenValue(tokenMap, "text-primary", "#202328"),
            secondary: getTokenValue(tokenMap, "text-secondary", "#515f70"),
            disabled: getTokenValue(tokenMap, "text-disabled", "#a0b0c4"),
          },
          background: {
            ...muiThemeOptions.palette?.background,
            default: getTokenValue(tokenMap, "bg-page", WHITE_COLOR),
            paper: getTokenValue(tokenMap, "bg-sidebar", "#f4f5f7"),
          },
          divider: getTokenValue(tokenMap, "border-default", "#dce3ea"),
          action: {
            ...muiThemeOptions.palette?.action,
            hover: getTokenValue(tokenMap, "bg-button-ghost-hover", "#f0f2f5"),
            selected: getTokenValue(tokenMap, "bg-selected", "#dce8f6"),
          },
        },
        components: {
          ...muiThemeOptions.components,
          MuiTabs: {
            styleOverrides: {
              indicator: {
                display: "none",
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  boxShadow: "inset 0 -2px currentColor",
                },
              },
            },
          },
        },
      });
    }, [resolvedTheme, muiThemeOptions]);

    return (
      <ThemeProvider theme={muiTheme}>
        {enableCssBaseline && <CssBaseline />}

        {children}
      </ThemeProvider>
    );
  }
);

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
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                minHeight: 32,
                textTransform: "none",
                fontWeight: 600,
                transition:
                  "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease",
              },
              contained: ({ theme }) => {
                return {
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: `0 3px 10px ${theme.palette.primary.main}33`,
                  },
                };
              },
              outlined: ({ theme }) => {
                return {
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                };
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: ({ theme }) => {
                return {
                  color: theme.palette.text.secondary,
                  border: "1px solid transparent",
                  borderRadius: 8,
                  transition:
                    "background-color 140ms ease, border-color 140ms ease, color 140ms ease",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.divider,
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&.Mui-disabled": {
                    color: theme.palette.text.disabled,
                  },
                };
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: ({ theme }) => {
                return {
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  textTransform: "none",
                  transition:
                    "background-color 140ms ease, border-color 140ms ease, color 140ms ease",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.action.selected,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: theme.palette.action.selected,
                  },
                };
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: ({ theme }) => {
                return {
                  minHeight: 38,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                };
              },
              indicator: {
                display: "none",
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: ({ theme }) => {
                return {
                  minHeight: 38,
                  padding: "7px 10px",
                  color: theme.palette.text.secondary,
                  textTransform: "none",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    color: theme.palette.primary.main,
                    boxShadow: "inset 0 -2px currentColor",
                  },
                };
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

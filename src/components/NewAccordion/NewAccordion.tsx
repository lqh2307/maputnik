import { ExpandMoreTwoTone } from "@mui/icons-material";
import { NewAccordionProp } from "./Types";
import React from "react";
import {
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
  SxProps,
  Stack,
  Theme,
  Box,
} from "@mui/material";

/** Renders the NewAccordion component. */
export const NewAccordion = React.memo(
  ({
    display = "block",
    title,
    children,
    expandIcon,
    summary,
    summaryAction,
    titleSx = {},
    summaryProps,
    detailsProps,
    disableGutters = true,
    square = true,
    ...props
  }: NewAccordionProp): React.JSX.Element => {
    const mergedTitleSx = React.useMemo<SxProps<Theme>>(() => {
      return {
        fontSize: 12,
        textTransform: "uppercase",
        ...titleSx,
      };
    }, [titleSx]);

    const mergedDetailsSx = React.useMemo<SxProps<Theme>>(() => {
      return {
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxSizing: "border-box",
        width: "100%",
        maxHeight: "200px",
        overflowX: "hidden",
        overflowY: "auto",
        ...(detailsProps?.sx ?? {}),
      };
    }, [detailsProps?.sx]);

    const styles = React.useMemo(() => {
      return {
        stack: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
        box: {
          "& > .MuiStack-root": {
            width: "auto",
          },
        },
      };
    }, []);

    const stopPropagation = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
      },
      []
    );

    return (
      display !== "none" && (
        <Accordion disableGutters={disableGutters} square={square} {...props}>
          <AccordionSummary
            component={"div"}
            expandIcon={expandIcon ?? <ExpandMoreTwoTone />}
            {...summaryProps}
          >
            {summary ??
              (summaryAction ? (
                <Stack sx={styles.stack}>
                  <Typography sx={mergedTitleSx}>{title}</Typography>

                  <Box onClick={stopPropagation} sx={styles.box}>
                    {summaryAction}
                  </Box>
                </Stack>
              ) : (
                <Typography sx={mergedTitleSx}>{title}</Typography>
              ))}
          </AccordionSummary>

          <AccordionDetails {...detailsProps} sx={mergedDetailsSx}>
            {children}
          </AccordionDetails>
        </Accordion>
      )
    );
  }
);

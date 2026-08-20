import { Box, CircularProgress, Typography } from "@mui/material";
import { PartialItemGridProp } from "./Types";
import { Grid } from "react-window";
import React from "react";

/** Renders the PartialItemGrid component. */
export const PartialItemGrid = React.memo(
  ({
    items,
    renderColumn,
    renderRow,
    gapX = 8,
    gapY = 8,
    itemWidth,
    itemHeight,
    style,
    loading,
    progress,
    ...props
  }: PartialItemGridProp): React.JSX.Element => {
    const styles = React.useMemo(() => {
      return {
        progressWrap: {
          position: "relative",
          display: "inline-flex",
        },
        progressOverlay: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      };
    }, []);

    if (!items) {
      return;
    }

    const totalRow: number = Math.ceil(items.length / renderColumn);
    const columnWidth: number = itemWidth + gapX;
    const rowHeight: number = itemHeight + gapY;
    const gridWidth: number =
      columnWidth * renderColumn + (totalRow > renderRow ? 17 : 0);
    const gridHeight: number = rowHeight * renderRow;

    return loading ? (
      <Box
        style={{
          width: gridWidth,
          height: gridHeight,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.paper",
          // border: "1px solid rgba(204, 204, 204, 1)",
          // boxShadow: "2px 4px 6px rgba(0, 0, 0, 0.2)",
          ...style,
        }}
      >
        <Box sx={styles.progressWrap}>
          <CircularProgress
            color={"inherit"}
            variant={progress ? "determinate" : "indeterminate"}
            value={progress}
          />

          {progress && (
            <Box sx={styles.progressOverlay}>
              <Typography variant={"caption"} component={"div"}>
                {`${progress}%`}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    ) : (
      <Grid
        cellProps={{
          items,
        }}
        columnCount={renderColumn}
        columnWidth={columnWidth}
        rowCount={totalRow}
        rowHeight={rowHeight}
        style={{
          width: gridWidth,
          height: gridHeight,
          backgroundColor: "background.paper",
          // border: "1px solid rgba(204, 204, 204, 1)",
          // boxShadow: "2px 4px 6px rgba(0, 0, 0, 0.2)",
          ...style,
        }}
        {...props}
      />
    );
  }
);

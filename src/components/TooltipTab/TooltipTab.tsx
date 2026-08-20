import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { Tab, Tooltip } from "@mui/material";
import { TooltipTabProp } from "./Types";
import React from "react";

const TooltipTabInner = React.forwardRef<HTMLDivElement, TooltipTabProp>(
  (
    { display = "flex", title, titlePlacement = "bottom", sx = {}, ...props },
    ref
  ): React.JSX.Element => {
    const tabSx = React.useMemo(() => {
      return {
        display: "flex",
        minWidth: 0,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        ...INTERACTIVE_HOVER_STYLE,
        ...sx,
      };
    }, [sx]);

    return (
      display !== "none" && (
        <Tooltip title={title} placement={titlePlacement}>
          <Tab ref={ref} {...props} sx={tabSx} />
        </Tooltip>
      )
    );
  }
);

/** Renders a Tab with a tooltip while preserving TabList selection props. */
export const TooltipTab = React.memo(TooltipTabInner);

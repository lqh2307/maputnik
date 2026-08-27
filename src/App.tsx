import { useEventListener } from "./hooks";
import { FULL_VIEWPORT } from "./configs";
import { Box } from "@mui/material";
import { Editor } from "./layouts";
import React from "react";

/** Renders the Maputnik editor application. */
export default function App(): React.JSX.Element {
  const handler = React.useMemo(() => {
    return {
      keyDown: (e: KeyboardEvent): void => {
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === "s" ||
            e.key === "i" ||
            e.key === "u" ||
            e.key === "w" ||
            e.key === "-" ||
            e.key === "+")
        ) {
          e.preventDefault();
        }
      },
      wheel: (e: WheelEvent): void => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      },
    };
  }, []);

  useEventListener(window, "keydown", handler.keyDown);
  useEventListener(window, "wheel", handler.wheel, {
    passive: false,
  });

  return (
    <Box className={"App"} sx={FULL_VIEWPORT}>
      <Editor />
    </Box>
  );
}

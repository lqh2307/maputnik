import { Box, Chip, Stack, Typography } from "@mui/material";
import { MapRounded } from "@mui/icons-material";
import { useGlobalStore } from "../../stores";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the brand logo, application name, style title, and dirty badge. */
export const TopBarBrand = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const translate = React.useCallback(
    (section: string): string => {
      return t(`common.app.${section}`);
    },
    [t]
  );

  const styleName = useGlobalStore((state) => {
    return state.style.name;
  });

  const dirty = useGlobalStore((state) => {
    return state.dirty;
  });

  const styles = React.useMemo(() => {
    return {
      brand: {
        minWidth: 190,
        alignItems: "center",
      },
      logo: {
        width: 30,
        height: 30,
        borderRadius: 1.5,
        display: "grid",
        placeItems: "center",
        color: "primary.contrastText",
        bgcolor: "primary.main",
      },
      title: {
        minWidth: 0,
      },
      subtitle: {
        display: "block",
      },
    };
  }, []);

  return (
    <Stack direction="row" spacing={1} sx={styles.brand}>
      <Box sx={styles.logo}>
        <MapRounded fontSize={"small"} />
      </Box>

      <Box sx={styles.title}>
        <Typography variant={"subtitle2"} noWrap>
          {translate("name")}
        </Typography>

        <Typography
          variant={"caption"}
          color={"text.secondary"}
          noWrap
          sx={styles.subtitle}
        >
          {styleName || translate("untitled")}
        </Typography>
      </Box>

      {dirty && (
        <Chip label={translate("edited")} size={"small"} variant={"outlined"} />
      )}
    </Stack>
  );
});

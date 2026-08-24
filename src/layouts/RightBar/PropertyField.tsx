import {
  BorderColorTwoTone,
  CodeRounded,
  OpacityTwoTone,
  RestartAltRounded,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipSwitch } from "../../components/TooltipSwitch";
import { ColorInput } from "../../components/ColorInput";
import { SelectInput } from "../../components/SelectInput";
import { SliderInput } from "../../components/SliderInput";
import { JSONEditor } from "../../components/JSONEditor";
import { TextInput } from "../../components/TextInput";
import { colorToRGBA, colorToRGBAString } from "../../utils/Color";
import { normalizedMarks } from "../../types/Common";
import { useTranslation } from "react-i18next";
import { JSONValue } from "../../utils/Object";
import {
  JsonValueEditorProp,
  PrimitiveTextEditorProp,
  PropertyFieldProp,
} from "./Types";
import React from "react";

function isStructured(value: unknown): boolean {
  return Array.isArray(value) || (!!value && typeof value === "object");
}

/** Renders an expression or structured property using the shared JSON editor. */
function JsonValueEditor({
  value,
  onChange,
}: JsonValueEditorProp): React.JSX.Element {
  const styles = React.useMemo(() => {
    return {
      editor: {
        height: 180,
        minHeight: 120,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      },
    };
  }, []);

  const normalizedValue: JSONValue =
    value === undefined ? null : (value as JSONValue);

  return (
    <Box sx={styles.editor}>
      <JSONEditor
        embedded
        compact
        defaultTreeCollapsed
        value={normalizedValue}
        onChange={(nextValue) => {
          onChange(nextValue as unknown);
        }}
      />
    </Box>
  );
}

/** Renders a commit-on-blur primitive property value. */
function PrimitiveTextEditor({
  value,
  onChange,
  type = "text",
}: PrimitiveTextEditorProp): React.JSX.Element {
  const [draft, setDraft] = React.useState(String(value ?? ""));

  React.useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  const handler = React.useMemo(() => {
    return {
      change: (value: string): void => {
        setDraft(value);
      },
      commit: (): void => {
        if (type === "number") {
          const parsed = Number(draft);
          if (Number.isFinite(parsed)) {
            onChange(parsed);
          }
        } else {
          onChange(draft);
        }
      },
      keyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === "Enter") {
          handler.commit();
        }
      },
    };
  }, [draft, onChange, type]);

  return (
    <TextInput
      type={type}
      value={draft}
      onChange={handler.change}
      onBlur={handler.commit}
      onKeyDown={handler.keyDown}
      multiline={false}
      size={"small"}
      fullWidth
    />
  );
}

function rgbaToHex(color: ReturnType<typeof colorToRGBA>): string {
  if (!color) {
    return "#000000";
  }

  const channelToHex = (channel?: number): string => {
    return Math.round(channel ?? 0)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${channelToHex(color.r)}${channelToHex(color.g)}${channelToHex(color.b)}`;
}

function formatColorValue(color: string, opacity: number): string {
  const parsed = colorToRGBA(color, opacity);

  if (!parsed) {
    return color;
  }

  if (opacity >= 1) {
    return rgbaToHex(parsed);
  }

  return colorToRGBAString(color, opacity);
}

/** Renders a color picker beside an opacity slider for color properties. */
function ColorOpacityEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const parsed = colorToRGBA(value);
  const color = rgbaToHex(parsed);
  const opacity = parsed?.a ?? 1;

  const handler = React.useMemo(() => {
    return {
      color: (nextColor: string): void => {
        onChange(formatColorValue(nextColor, opacity));
      },
      opacity: (nextOpacity: number): void => {
        onChange(formatColorValue(color, nextOpacity));
      },
    };
  }, [color, onChange, opacity]);

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100%",
        alignItems: "center",
        "& > .MuiStack-root": {
          minWidth: 0,
          flex: 1,
        },
      },
      colorInput: {
        minWidth: 0,
      },
      opacitySlider: {
        minWidth: 0,
      },
    };
  }, []);

  return (
    <Stack direction="row" spacing={1} sx={styles.root}>
      <ColorInput
        icon={<BorderColorTwoTone fontSize="small" />}
        title={t("properties.color")}
        value={color}
        onChange={handler.color}
        sx={styles.colorInput}
      />

      <SliderInput
        icon={<OpacityTwoTone fontSize="small" />}
        title={t("properties.opacity")}
        value={opacity}
        min={0}
        max={1}
        step={0.05}
        marks={normalizedMarks}
        onChange={handler.opacity}
        sx={styles.opacitySlider}
      />
    </Stack>
  );
}

/** Renders an editor selected from one style property's specification. */
export const PropertyField = React.memo(
  ({ name, spec, value, onChange }: PropertyFieldProp): React.JSX.Element => {
    const { t } = useTranslation();
    const overridden = value !== undefined;
    const resolvedValue = overridden ? value : spec.default;
    const [expressionMode, setExpressionMode] = React.useState(
      isStructured(resolvedValue)
    );

    React.useEffect(() => {
      setExpressionMode(isStructured(resolvedValue));
    }, [resolvedValue]);

    const handler = React.useMemo(() => {
      return {
        toggleExpression: (): void => {
          setExpressionMode((current) => {
            return !current;
          });
        },
        reset: (): void => {
          onChange(undefined);
        },
        slider: (next: number): void => {
          onChange(next);
        },
        booleanChange: (checked: boolean): void => {
          onChange(checked);
        },
        enumChange: (value: string): void => {
          onChange(value);
        },
      };
    }, [onChange]);

    const styles = React.useMemo(() => {
      return {
        root: {
          px: 1.25,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
        },
        header: {
          mb: 0.75,
          alignItems: "center",
        },
        labelBox: {
          minWidth: 0,
          flex: 1,
        },
        label: {
          display: "block",
          fontWeight: 700,
        },
        units: {
          display: "block",
          fontSize: 10,
        },
        colorEditor: {
          width: "100%",
        },
        slider: {
          minWidth: 80,
        },
        actionBtn: {
          minWidth: 26,
          width: 26,
          height: 26,
          p: 0,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          color: "text.secondary",
          bgcolor: "background.paper",
          "&&:hover": {
            outline: "none",
            borderColor: "primary.main",
            color: "primary.main",
            bgcolor: "action.hover",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            opacity: 1,
            borderColor: "divider",
            color: "text.disabled",
            bgcolor: "action.hover",
          },
        },
        icon: {
          fontSize: 16,
        },
        doc: {
          mt: 0.75,
          lineHeight: 1.35,
        },
      };
    }, []);

    let editor: React.ReactNode;
    if (expressionMode || isStructured(resolvedValue)) {
      editor = (
        <JsonValueEditor value={resolvedValue ?? null} onChange={onChange} />
      );
    } else if (spec.type === "boolean") {
      editor = (
        <TooltipSwitch
          checked={Boolean(resolvedValue)}
          onChange={handler.booleanChange}
        />
      );
    } else if (spec.type === "enum") {
      editor = (
        <SelectInput
          value={String(resolvedValue ?? "")}
          options={Object.keys(spec.values ?? {}).map((option) => {
            return {
              title: option,
              value: option,
            };
          })}
          onChange={handler.enumChange}
        />
      );
    } else if (spec.type === "number") {
      const numeric = Number(resolvedValue ?? 0);
      const hasUsefulRange =
        Number.isFinite(spec.minimum) &&
        Number.isFinite(spec.maximum) &&
        Number(spec.maximum) - Number(spec.minimum) <= 10000;
      editor = hasUsefulRange ? (
        <SliderInput
          value={numeric}
          min={spec.minimum}
          max={spec.maximum}
          step={spec.maximum! - spec.minimum! <= 2 ? 0.01 : 1}
          valueLabelDisplay="on"
          onChange={handler.slider}
          sx={styles.slider}
        />
      ) : (
        <PrimitiveTextEditor
          value={numeric}
          onChange={onChange}
          type="number"
        />
      );
    } else if (spec.type === "color") {
      editor = (
        <Box sx={styles.colorEditor}>
          <ColorOpacityEditor
            value={String(resolvedValue ?? "#000000")}
            onChange={onChange}
          />
        </Box>
      );
    } else {
      editor = (
        <PrimitiveTextEditor value={resolvedValue ?? ""} onChange={onChange} />
      );
    }

    return (
      <Box sx={styles.root}>
        <Stack direction="row" spacing={0.5} sx={styles.header}>
          <Box sx={styles.labelBox}>
            <Typography variant={"caption"} noWrap sx={styles.label}>
              {name}
            </Typography>

            {(spec.units || !overridden) && (
              <Typography
                variant={"caption"}
                color={"text.secondary"}
                noWrap
                sx={styles.units}
              >
                {spec.units
                  ? spec.units
                  : `default: ${JSON.stringify(spec.default)}`}
              </Typography>
            )}
          </Box>

          {spec.expression && (
            <TooltipButton
              title={t("properties.toggleExpression")}
              color={expressionMode ? "primary" : "inherit"}
              icon={<CodeRounded sx={styles.icon} />}
              aria-label={t("properties.toggleExpression")}
              fullWidth={false}
              onClick={handler.toggleExpression}
              sx={styles.actionBtn}
            />
          )}

          <TooltipButton
            title={t("properties.resetDefault")}
            disabled={!overridden}
            icon={<RestartAltRounded sx={styles.icon} />}
            aria-label={t("properties.resetDefault")}
            fullWidth={false}
            onClick={handler.reset}
            sx={styles.actionBtn}
          />
        </Stack>

        {editor}

        {spec.doc && (
          <Typography
            variant={"caption"}
            color={"text.secondary"}
            component="p"
            sx={styles.doc}
          >
            {spec.doc}
          </Typography>
        )}
      </Box>
    );
  }
);

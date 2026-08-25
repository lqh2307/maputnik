import {
  AccountTreeRounded,
  AddRounded,
  CodeRounded,
  DeleteOutlineRounded,
  TuneRounded,
} from "@mui/icons-material";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { JSONEditor } from "../../components/JSONEditor";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { JSONValue } from "../../utils/Object";
import { useTranslation } from "react-i18next";

type GroupOperator = "all" | "any" | "none";
type RuleOperator =
  "==" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "!in" | "has" | "!has";

type ScalarValue = string | number | boolean | null;

type FilterGroup = {
  kind: "group";
  operator: GroupOperator;
  children: FilterNode[];
};

type FilterRule = {
  kind: "rule";
  operator: RuleOperator;
  property: string;
  values: ScalarValue[];
};

type FilterNode = FilterGroup | FilterRule;

type FilterEditorProp = {
  /** Current MapLibre filter expression. */
  value: unknown;
  /** Called whenever the builder or JSON editor changes the filter. */
  onChange: (value: unknown) => void;
};

const GROUP_OPERATORS: Array<{ value: GroupOperator }> = [
  {
    value: "all",
  },
  {
    value: "any",
  },
  {
    value: "none",
  },
];

const RULE_OPERATORS: Array<{ value: RuleOperator }> = [
  {
    value: "==",
  },
  {
    value: "!=",
  },
  {
    value: ">",
  },
  {
    value: ">=",
  },
  {
    value: "<",
  },
  {
    value: "<=",
  },
  {
    value: "in",
  },
  {
    value: "!in",
  },
  {
    value: "has",
  },
  {
    value: "!has",
  },
];

const FILTER_OPERATORS = [...GROUP_OPERATORS, ...RULE_OPERATORS].map((item) => {
  return {
    title: item.value,
    value: item.value,
  };
});

const VALUE_TYPES = [
  {
    value: "string",
  },
  {
    value: "number",
  },
  {
    value: "boolean",
  },
  {
    value: "null",
  },
];

function isGroupOperator(value: string): value is GroupOperator {
  return GROUP_OPERATORS.some((item) => {
    return item.value === value;
  });
}

function isRuleOperator(value: string): value is RuleOperator {
  return RULE_OPERATORS.some((item) => {
    return item.value === value;
  });
}

function isScalarValue(value: unknown): value is ScalarValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function parseFilter(value: unknown): FilterNode | undefined {
  if (!Array.isArray(value) || typeof value[0] !== "string") {
    return undefined;
  }

  const operator = value[0];
  if (isGroupOperator(operator)) {
    const children: FilterNode[] = [];
    for (const child of value.slice(1)) {
      const parsedChild = parseFilter(child);
      if (!parsedChild) {
        return undefined;
      }
      children.push(parsedChild);
    }
    return {
      kind: "group",
      operator,
      children,
    };
  }

  if (!isRuleOperator(operator) || typeof value[1] !== "string") {
    return undefined;
  }

  if (operator === "has" || operator === "!has") {
    return {
      kind: "rule",
      operator,
      property: value[1],
      values: [],
    };
  }

  const values = value.slice(2);
  if (!values.length || !values.every(isScalarValue)) {
    return undefined;
  }

  return {
    kind: "rule",
    operator,
    property: value[1],
    values,
  };
}

function serializeFilter(node: FilterNode): JSONValue {
  if (node.kind === "group") {
    return [node.operator, ...node.children.map(serializeFilter)];
  }

  if (node.operator === "has" || node.operator === "!has") {
    return [node.operator, node.property];
  }

  const values =
    node.operator === "in" || node.operator === "!in"
      ? node.values
      : [node.values[0] ?? ""];

  return [node.operator, node.property, ...values];
}

function createGroup(operator: GroupOperator = "all"): FilterGroup {
  return {
    kind: "group",
    operator,
    children: [],
  };
}

function createRule(operator: RuleOperator = "=="): FilterRule {
  return {
    kind: "rule",
    operator,
    property: "",
    values: operator === "has" || operator === "!has" ? [] : [""],
  };
}

function getValueType(value: ScalarValue): string {
  if (value === null) {
    return "null";
  }
  return typeof value;
}

function createValue(type: string): ScalarValue {
  if (type === "number") {
    return 0;
  }
  if (type === "boolean") {
    return false;
  }
  if (type === "null") {
    return null;
  }
  return "";
}

type FilterValueEditorProp = {
  value: ScalarValue;
  onChange: (value: ScalarValue) => void;
};

function FilterValueEditor({
  value,
  onChange,
}: FilterValueEditorProp): React.JSX.Element {
  const { t } = useTranslation();
  const valueType = getValueType(value);
  const valueTypeOptions = React.useMemo(() => {
    return VALUE_TYPES.map((item) => {
      return {
        ...item,
        title: t(`rightBar.properties.filterValueType.${item.value}`),
      };
    });
  }, [t]);

  const handler = React.useMemo(() => {
    return {
      typeChange: (type: string): void => {
        onChange(createValue(type));
      },
      textChange: (nextValue: string): void => {
        onChange(nextValue);
      },
      numberChange: (nextValue: string): void => {
        const parsed = Number(nextValue);
        if (Number.isFinite(parsed)) {
          onChange(parsed);
        }
      },
      booleanChange: (nextValue: string): void => {
        onChange(nextValue === "true");
      },
    };
  }, [onChange]);

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        minWidth: 0,
        flex: 1,
      }}
    >
      <SelectInput
        value={valueType}
        options={valueTypeOptions}
        onChange={handler.typeChange}
        sx={{
          minWidth: 102,
          width: 102,
        }}
      />

      {valueType === "string" && (
        <TextInput
          value={String(value ?? "")}
          onChange={handler.textChange}
          multiline={false}
          placeholder={t("rightBar.properties.value")}
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        />
      )}

      {valueType === "number" && (
        <TextInput
          type="number"
          value={String(value)}
          onChange={handler.numberChange}
          multiline={false}
          placeholder={t("rightBar.properties.value")}
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        />
      )}

      {valueType === "boolean" && (
        <SelectInput
          value={String(value)}
          options={[
            {
              title: "true",
              value: "true",
            },
            {
              title: "false",
              value: "false",
            },
          ]}
          onChange={handler.booleanChange}
          sx={{
            minWidth: 84,
            width: 84,
          }}
        />
      )}

      {valueType === "null" && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            alignSelf: "center",
            px: 1,
          }}
        >
          null
        </Typography>
      )}
    </Stack>
  );
}

type FilterNodeEditorProp = {
  node: FilterNode;
  onChange: (node: FilterNode) => void;
  onRemove?: () => void;
  depth: number;
};

function FilterNodeEditor({
  node,
  onChange,
  onRemove,
  depth,
}: FilterNodeEditorProp): React.JSX.Element {
  const { t } = useTranslation();
  const operatorOptions = React.useMemo(() => {
    return FILTER_OPERATORS.map((item) => {
      return {
        ...item,
        title: isGroupOperator(item.value)
          ? t(`rightBar.properties.filterOperator.${item.value}`)
          : item.title,
      };
    });
  }, [t]);

  const handler = React.useMemo(() => {
    return {
      operatorChange: (operator: string): void => {
        if (isGroupOperator(operator)) {
          onChange({
            ...createGroup(operator),
            children: node.kind === "group" ? node.children : [],
          });
        } else if (isRuleOperator(operator)) {
          const nextRule = createRule(operator);
          if (node.kind === "rule") {
            nextRule.property = node.property;
            nextRule.values =
              operator === "has" || operator === "!has"
                ? []
                : operator === "in" || operator === "!in"
                  ? node.values.length
                    ? node.values
                    : [""]
                  : [node.values[0] ?? ""];
          }
          onChange(nextRule);
        }
      },
      propertyChange: (property: string): void => {
        if (node.kind === "rule") {
          onChange({
            ...node,
            property,
          });
        }
      },
      valueChange: (index: number, value: ScalarValue): void => {
        if (node.kind === "rule") {
          const values = [...node.values];
          values[index] = value;
          onChange({
            ...node,
            values,
          });
        }
      },
      addValue: (): void => {
        if (node.kind === "rule") {
          onChange({
            ...node,
            values: [...node.values, ""],
          });
        }
      },
      removeValue: (index: number): void => {
        if (node.kind === "rule") {
          const values = node.values.filter((_, valueIndex) => {
            return valueIndex !== index;
          });
          onChange({
            ...node,
            values: values.length ? values : [""],
          });
        }
      },
      addRule: (): void => {
        if (node.kind === "group") {
          onChange({
            ...node,
            children: [...node.children, createRule()],
          });
        }
      },
      addGroup: (): void => {
        if (node.kind === "group") {
          onChange({
            ...node,
            children: [...node.children, createGroup()],
          });
        }
      },
      remove: (): void => {
        onRemove?.();
      },
    };
  }, [node, onChange, onRemove]);

  const styles = React.useMemo(() => {
    return {
      node: {
        p: 1,
        borderColor: depth === 0 ? "divider" : "rgba(59, 130, 246, 0.3)",
        bgcolor: depth === 0 ? "background.paper" : "rgba(239, 246, 255, 0.65)",
      },
      children: {
        mt: 1,
        ml: 1,
        pl: 1,
        borderLeft: 2,
        borderColor: "rgba(59, 130, 246, 0.28)",
      },
      field: {
        minWidth: 0,
        flex: 1,
      },
      action: {
        minWidth: 26,
        width: 26,
        height: 26,
        p: 0,
      },
      empty: {
        py: 1,
        color: "text.secondary",
      },
    };
  }, [depth]);

  return (
    <Paper variant="outlined" sx={styles.node}>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          alignItems: "center",
        }}
      >
        <SelectInput
          value={node.operator}
          options={operatorOptions}
          onChange={handler.operatorChange}
          sx={{
            minWidth: 76,
            width: 96,
          }}
        />

        {onRemove && (
          <TooltipButton
            title={t("rightBar.properties.filterRemove")}
            icon={<DeleteOutlineRounded fontSize={"small"} />}
            fullWidth={false}
            onClick={handler.remove}
            sx={styles.action}
          />
        )}
      </Stack>

      {node.kind === "rule" ? (
        <Stack
          spacing={0.75}
          sx={{
            mt: 1,
          }}
        >
          <TextInput
            value={node.property}
            onChange={handler.propertyChange}
            multiline={false}
            placeholder={t("rightBar.properties.filterProperty")}
            sx={styles.field}
          />

          {node.operator !== "has" && node.operator !== "!has" && (
            <Stack spacing={0.5}>
              {node.values.map((value, index) => {
                return (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: "center",
                    }}
                    key={`${depth}-${index}`}
                  >
                    <FilterValueEditor
                      value={value}
                      onChange={(nextValue) => {
                        return handler.valueChange(index, nextValue);
                      }}
                    />
                    {(node.operator === "in" || node.operator === "!in") && (
                      <TooltipButton
                        title={t("rightBar.properties.filterRemoveValue")}
                        icon={<DeleteOutlineRounded fontSize={"small"} />}
                        fullWidth={false}
                        onClick={() => {
                          return handler.removeValue(index);
                        }}
                        sx={styles.action}
                      />
                    )}
                  </Stack>
                );
              })}

              {(node.operator === "in" || node.operator === "!in") && (
                <TooltipButton
                  title={t("rightBar.properties.filterAddValue")}
                  icon={<AddRounded fontSize={"small"} />}
                  fullWidth={false}
                  onClick={handler.addValue}
                  sx={styles.action}
                />
              )}
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack spacing={0.75} sx={styles.children}>
          {node.children.length === 0 && (
            <Typography variant="caption" sx={styles.empty}>
              {t("rightBar.properties.filterNoConditions")}
            </Typography>
          )}

          {node.children.map((child, index) => {
            return (
              <FilterNodeEditor
                key={`${depth}-${index}`}
                node={child}
                depth={depth + 1}
                onChange={(nextChild) => {
                  const children = [...node.children];
                  children[index] = nextChild;
                  onChange({
                    ...node,
                    children,
                  });
                }}
                onRemove={() => {
                  onChange({
                    ...node,
                    children: node.children.filter((_, childIndex) => {
                      return childIndex !== index;
                    }),
                  });
                }}
              />
            );
          })}

          <Stack direction="row" spacing={0.5}>
            <TooltipButton
              title={t("rightBar.properties.filterAddRule")}
              icon={<AddRounded fontSize={"small"} />}
              fullWidth={false}
              onClick={handler.addRule}
              sx={styles.action}
            />
            <TooltipButton
              title={t("rightBar.properties.filterAddGroup")}
              icon={<AccountTreeRounded fontSize={"small"} />}
              fullWidth={false}
              onClick={handler.addGroup}
              sx={styles.action}
            />
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}

/** Renders a visual MapLibre filter builder with a full JSON fallback. */
export const FilterEditor = React.memo(
  ({ value, onChange }: FilterEditorProp): React.JSX.Element => {
    const { t } = useTranslation();
    const serializedValue = JSON.stringify(value ?? ["all"]);
    const parsedFilter = React.useMemo(() => {
      return parseFilter(value ?? ["all"]);
    }, [serializedValue]);
    const [advanced, setAdvanced] = React.useState(!parsedFilter);

    React.useEffect(() => {
      if (!parsedFilter) {
        setAdvanced(true);
      }
    }, [parsedFilter]);

    const normalizedValue = React.useMemo((): JSONValue => {
      return (value ?? ["all"]) as JSONValue;
    }, [serializedValue]);

    const handler = React.useMemo(() => {
      return {
        modeChange: (nextAdvanced: boolean): void => {
          if (nextAdvanced || parsedFilter) {
            setAdvanced(nextAdvanced);
          }
        },
        builderChange: (nextFilter: FilterNode): void => {
          onChange(serializeFilter(nextFilter));
        },
        jsonChange: (nextValue: JSONValue): void => {
          onChange(nextValue);
        },
      };
    }, [onChange, parsedFilter]);

    const styles = React.useMemo(() => {
      return {
        root: {
          p: 1.25,
          minHeight: "100%",
          bgcolor: "background.default",
        },
        toolbar: {
          mb: 1,
          alignItems: "center",
          justifyContent: "space-between",
        },
        modeButton: {
          minWidth: 30,
          width: 30,
          height: 30,
          p: 0,
        },
        editor: {
          height: "calc(100vh - 170px)",
          minHeight: 360,
          maxHeight: 720,
        },
        hint: {
          mb: 1,
        },
      };
    }, []);

    return (
      <Box sx={styles.root}>
        <Stack direction="row" sx={styles.toolbar}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
            }}
          >
            {advanced
              ? t("rightBar.properties.filterJsonMode")
              : t("rightBar.properties.filterBuilder")}
          </Typography>

          <Stack direction="row" spacing={0.5}>
            <TooltipButton
              title={t("rightBar.properties.filterBuilder")}
              icon={<TuneRounded fontSize={"small"} />}
              fullWidth={false}
              color={!advanced ? "primary" : "inherit"}
              disabled={!parsedFilter}
              onClick={() => {
                return handler.modeChange(false);
              }}
              sx={styles.modeButton}
            />
            <TooltipButton
              title={t("rightBar.properties.filterJsonMode")}
              icon={<CodeRounded fontSize={"small"} />}
              fullWidth={false}
              color={advanced ? "primary" : "inherit"}
              onClick={() => {
                return handler.modeChange(true);
              }}
              sx={styles.modeButton}
            />
          </Stack>
        </Stack>

        {advanced ? (
          <>
            {!parsedFilter && (
              <Alert severity="info" sx={styles.hint}>
                {t("rightBar.properties.filterJsonHint")}
              </Alert>
            )}
            <Box sx={styles.editor}>
              <JSONEditor
                embedded
                compact
                value={normalizedValue}
                onChange={handler.jsonChange}
              />
            </Box>
          </>
        ) : (
          <FilterNodeEditor
            node={parsedFilter ?? createGroup()}
            depth={0}
            onChange={handler.builderChange}
          />
        )}
      </Box>
    );
  }
);

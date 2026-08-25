import { Box } from "@mui/material";
import { PropertyField } from "./PropertyField";
import { PropertySpec } from "./Types";
import React from "react";

export type SpecObjectEditorProp = {
  /** Current object being edited. */
  value?: Record<string, unknown>;
  /** Property definitions for the object. */
  specs: Record<string, PropertySpec>;
  /** Called when one known property changes. */
  onChange: (name: string, value: unknown) => void;
  /** Properties that should not be rendered in this object editor. */
  exclude?: string[];
};

/** Renders a schema-defined object using the shared property field controls. */
export const SpecObjectEditor = React.memo(
  ({ value, specs, onChange, exclude = [] }: SpecObjectEditorProp) => {
    const excluded = React.useMemo(() => {
      return new Set(exclude);
    }, [...exclude]);

    const entries = React.useMemo(() => {
      return Object.entries(specs)
        .filter(([name]) => {
          return name !== "*" && !excluded.has(name);
        })
        .sort(([firstName, firstSpec], [secondName, secondSpec]) => {
          const firstOverridden = value?.[firstName] !== undefined ? 0 : 1;
          const secondOverridden = value?.[secondName] !== undefined ? 0 : 1;

          return (
            firstOverridden - secondOverridden ||
            Number(Boolean(secondSpec.required)) -
              Number(Boolean(firstSpec.required)) ||
            firstName.localeCompare(secondName)
          );
        });
    }, [excluded, specs, value]);

    const changeHandlers = React.useMemo(() => {
      return new Map(
        entries.map(([name]) => {
          return [
            name,
            (nextValue: unknown): void => {
              onChange(name, nextValue);
            },
          ] as const;
        })
      );
    }, [entries, onChange]);

    return (
      <Box>
        {entries.map(([name, spec]) => {
          return (
            <PropertyField
              key={name}
              name={name}
              spec={spec}
              value={value?.[name]}
              onChange={changeHandlers.get(name)!}
            />
          );
        })}
      </Box>
    );
  }
);

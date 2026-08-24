/** Defines one MapLibre style-spec property. */
export type PropertySpec = {
  /** Primitive type of the property (color, number, string, enum, boolean, array, etc.). */
  type: string;
  /** Whether the property is required by the style specification. */
  required?: boolean;
  /** Default value specified by the style spec. */
  default?: unknown;
  /** Element type or nested schema for array-like values. */
  value?: string | PropertySpec;
  /** Fixed array length, when required by the style specification. */
  length?: number;
  /** Minimum numerical boundary. */
  minimum?: number;
  /** Maximum numerical boundary. */
  maximum?: number;
  /** Physical units (e.g. px, ms, degrees). */
  units?: string;
  /** Enum dictionary of allowed string values with optional documentation. */
  values?: Record<
    string,
    {
      doc?: string;
    }
  >;
  /** Property documentation string. */
  doc?: string;
  /** Expression metadata. */
  expression?: unknown;
  /** Whether the property supports a matching transition property. */
  transition?: boolean;
  /** Property category used by MapLibre. */
  propertyType?: string;
  /** SDK support metadata from the style specification. */
  sdkSupport?: Record<string, Record<string, string>>;
};

/** Defines the property tables loaded from the MapLibre style specification. */
export type StyleSpecificationSchema = Record<
  string,
  Record<string, PropertySpec>
>;

/** Defines PropertyField component props. */
export type PropertyFieldProp = {
  /** Property key name (e.g. fill-color, line-width). */
  name: string;
  /** Specification definition for this property. */
  spec: PropertySpec;
  /** Current value of the property in the active layer. */
  value: unknown;
  /** Callback fired when the property value changes. */
  onChange: (value: unknown) => void;
};

/** Defines a commit-on-blur text field. */
export type CommitTextFieldProp = {
  /** Label for the text input. */
  label: string;
  /** Value bound to the input. */
  value: string | number;
  /** Callback fired on blur or Enter press. */
  onCommit: (value: string) => void;
  /** Whether the field is in an error state. */
  error?: boolean;
};

/** Defines a JSON section editor. */
export type JsonSectionProp = {
  /** Object or array value being edited as JSON. */
  value: unknown;
  /** Callback fired when JSON edits are committed. */
  onCommit: (value: unknown) => void;
  /** Default value used when current value is undefined. */
  emptyValue: unknown;
};

/** Defines a JSON property value editor. */
export type JsonValueEditorProp = {
  /** Current raw value. */
  value: unknown;
  /** Callback when JSON is modified. */
  onChange: (value: unknown) => void;
};

/** Defines a primitive property value editor. */
export type PrimitiveTextEditorProp = JsonValueEditorProp & {
  /** Field input type. */
  type?: "text" | "number";
};

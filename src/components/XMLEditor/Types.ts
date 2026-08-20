/** Defines xmlattribute. */
export type XMLAttribute = {
  /** Unique identifier for this entity. */
  id?: string;
  /** Human-readable name. */
  name?: string;
  /** Current value. */
  value?: string;
};

/** Defines xmlnode type. */
export type XMLNodeType = "element" | "text" | "comment" | "cdata";

/** Defines xmltree node. */
export type XMLTreeNode = {
  /** Unique identifier for this entity. */
  id?: string;
  /** Human-readable name. */
  name?: string;
  /** Current value. */
  value?: string;
  /** Variant or category. */
  type?: XMLNodeType;
  /** Configuration for attributes. */
  attributes?: XMLAttribute[];
  /** Configuration for childrens. */
  childrens?: XMLTreeNode[];
};

export type XMLEditorErrorContext = "source" | "node";

export type XMLEditorProps = {
  /** Controlled XML source. */
  value?: string;
  /** Called whenever valid XML changes. */
  onChange?: (value: string) => void;
  /** Called when XML parsing fails. */
  onError?: (error: Error, context: XMLEditorErrorContext) => void;
  /** Called after a new empty XML document is created. */
  onNew?: (value: string) => void;
  /** Header title. */
  title?: string;
  /** Additional content rendered before the header actions. */
  headerExtra?: React.ReactNode;
  /** Fills the parent instead of the viewport when true. */
  embedded?: boolean;
};

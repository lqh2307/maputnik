import { GridProps } from "react-window";

/** Defines partial item grid prop. */
export type PartialItemGridProp = Omit<
  GridProps<any>,
  "columnCount" | "columnWidth" | "rowCount" | "rowHeight" | "cellProps"
> & {
  /** Items rendered by the component. */
  items: any;
  /** Configuration for render column. */
  renderColumn: number;
  /** Configuration for render row. */
  renderRow: number;

  /** Configuration for padding x. */
  paddingX?: number;
  /** Configuration for padding y. */
  paddingY?: number;

  /** Configuration for gap x. */
  gapX?: number;
  /** Configuration for gap y. */
  gapY?: number;

  /** item width in pixels. */
  itemWidth: number;
  /** item height in pixels. */
  itemHeight: number;

  /** Whether content is loading. */
  loading?: boolean;
  /** Configuration for progress. */
  progress?: number;
};

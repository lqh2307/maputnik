import { Unit } from "../../types/Common";

/** Options for converting a metric length to pixels or invert. */
export type ToFromPixelOption = {
  /** Metric value to convert. */
  value: number;
  /** Unit of the input value. */
  unit: Unit;
  /** Pixels per inch. Defaults to 96. */
  ppi?: number;
  /** Whether to round the converted value to the nearest integer. */
  round?: boolean;
};

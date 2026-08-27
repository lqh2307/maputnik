/** Defines get on-land event option. */
export type GetOnLandEventOption = {
  /** Configuration for controller. */
  controller?: AbortController;

  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** On-land event danger impact values. */
export enum OnLandEventDangerImpact {
  NGHIEM_TRONG = "NGHIEM_TRONG",
  TRUNG_BINH = "TRUNG_BINH",
  DANG_CHU_Y = "DANG_CHU_Y",
}

/** Describes a flexible on-land event record from the catalog service. */
export type OnLandEvent = Record<string, unknown>;

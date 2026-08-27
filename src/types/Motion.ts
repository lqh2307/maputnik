/** Defines shape motion type. */
export type ShapeMotionType =
  "move" | "rotate" | "zoom" | "explode" | "fade" | "pulse" | "fly" | "bounce";
/** Defines shape motion start mode. */
export type ShapeMotionStartMode =
  "on-click" | "with-previous" | "after-previous";

/** Defines motion direction. */
export type MotionDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/** Defines shape motion base. */
export type ShapeMotionBase = {
  /** Unique identifier for this entity. */
  id: string;
  /** Variant or category. */
  type: ShapeMotionType;

  /**
   * Thứ tự chạy trong slide (càng nhỏ chạy trước).
   * Nếu không set thì hệ thống sẽ tự gán theo thứ tự khai báo.
   */
  order?: number;

  /** Tổng thời lượng (ms). */
  duration?: number;

  /** Delay trước khi play (ms). */
  delayStart?: number;

  /** Tên easing (map sang Konva.Easings). Ví dụ: "Linear", "EaseInOut"... */
  easing?: string;
  /** Configuration for start. */
  triggerStart?: ShapeMotionStartMode;
  /** Identifier of the associated trigger shape. */
  triggerShapeId?: string;
  /** Configuration for repeat count. */
  repeatCount?: number;
  /** Whether auto reverse. */
  autoReverse?: boolean;
};

/** Defines shape motion point. */
export type ShapeMotionPoint = {
  /** Horizontal coordinate. */
  x: number;
  /** Vertical coordinate. */
  y: number;
};

/** Defines shape move motion. */
export type ShapeMoveMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "move";
  /** Đường đi nhiều điểm. Nếu có, sẽ ưu tiên chạy theo path thay vì to/by. */
  path?: ShapeMotionPoint[];
  /** Absolute target position. */
  to?: {
    /** Optional target x coordinate. */
    x?: number;
    /** Optional target y coordinate. */
    y?: number;
  };
  /** Relative movement delta. */
  by?: {
    /** Optional horizontal delta. */
    x?: number;
    /** Optional vertical delta. */
    y?: number;
  };
};

/** Defines shape rotate motion. */
export type ShapeRotateMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "rotate";
  /** Rotation (deg) */
  to?: number;
  /** Rotation delta (deg) */
  by?: number;
};

/** Defines shape zoom motion. */
export type ShapeZoomMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "zoom";
  /** Uniform scale */
  to?: number;
  /** Uniform scale delta */
  by?: number;
  /** Non-uniform scale (optional) */
  toX?: number;
  /** Configuration for to y. */
  toY?: number;
};

/** Defines shape explode motion. */
export type ShapeExplodeMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "explode";
  /** Scale up/down while exploding */
  scaleTo?: number;
  /** Fade out while exploding */
  opacityTo?: number;
  /** If true, set visible=false when finished */
  hideAtEnd?: boolean;
};

/** Defines shape fade motion. */
export type ShapeFadeMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "fade";
  /** Optional opacity to apply before playing. Useful for fade-in. */
  fromOpacity?: number;
  /** Target opacity. */
  toOpacity?: number;
  /** If true, set visible=false when finished. */
  hideAtEnd?: boolean;
};

/** Defines shape pulse motion. */
export type ShapePulseMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "pulse";
  /** Configuration for scale to. */
  scaleTo?: number;
  /** Configuration for opacity to. */
  opacityTo?: number;
};

/** Defines shape fly motion. */
export type ShapeFlyMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "fly";
  /** Configuration for direction. */
  direction?: MotionDirection;
  /** Configuration for distance. */
  distance?: number;
  /** Configuration for mode. */
  mode?: "in" | "out";
};

/** Defines shape bounce motion. */
export type ShapeBounceMotion = ShapeMotionBase & {
  /** Variant or category. */
  type: "bounce";
  /** Configuration for direction. */
  direction?: MotionDirection;
  /** Configuration for distance. */
  distance?: number;
};

/** Defines shape motion. */
export type ShapeMotion =
  | ShapeMoveMotion
  | ShapeRotateMotion
  | ShapeZoomMotion
  | ShapeExplodeMotion
  | ShapeFadeMotion
  | ShapePulseMotion
  | ShapeFlyMotion
  | ShapeBounceMotion;

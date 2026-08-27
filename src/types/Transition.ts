import { max, min } from "../utils/Number";

/** Visual effect applied when changing slides. */
export type SlideTransitionType = "none" | "fade" | "wipe" | "push" | "zoom";

/** Direction used by directional slide-transition effects. */
export type SlideTransitionDirection = "left" | "right" | "up" | "down";

/** Timing and effect settings for one slide transition. */
export type SlideTransition = {
  /** Transition effect to play. */
  type: SlideTransitionType;
  /** Optional transition duration in milliseconds. */
  duration?: number;
  /** Optional direction for wipe and push effects. */
  direction?: SlideTransitionDirection;
  /** Optional CSS-compatible easing function. */
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
};

/** Supported transition effects in the order shown by the editor. */
export const SLIDE_TRANSITION_TYPES: readonly SlideTransitionType[] = [
  "none",
  "fade",
  "wipe",
  "push",
  "zoom",
];

/** Supported directions for directional slide transitions. */
export const SLIDE_TRANSITION_DIRECTIONS: readonly SlideTransitionDirection[] =
  ["left", "right", "up", "down"];

/** CSS timing functions supported by slide transitions. */
export const SLIDE_TRANSITION_EASINGS: readonly NonNullable<
  SlideTransition["easing"]
>[] = ["ease", "ease-in", "ease-out", "ease-in-out", "linear"];

/** Configuration constant for default slide transition. */
export const DEFAULT_SLIDE_TRANSITION: SlideTransition = {
  type: "none",
  duration: 500,
  direction: "right",
  easing: "ease-in-out",
};

/**
 * Fill optional transition fields and constrain values loaded from documents.
 * @param transition Partial transition from editor state or imported data.
 * @returns Complete transition with bounded duration and defaults.
 */
export function normalizeSlideTransition(
  transition?: Partial<SlideTransition>
): Required<SlideTransition> {
  const duration = Number(transition?.duration);
  const type = SLIDE_TRANSITION_TYPES.includes(
    transition?.type as SlideTransitionType
  )
    ? (transition.type as SlideTransitionType)
    : DEFAULT_SLIDE_TRANSITION.type;
  const direction = SLIDE_TRANSITION_DIRECTIONS.includes(
    transition?.direction as SlideTransitionDirection
  )
    ? (transition.direction as SlideTransitionDirection)
    : DEFAULT_SLIDE_TRANSITION.direction;
  const easing = SLIDE_TRANSITION_EASINGS.includes(
    transition?.easing as NonNullable<SlideTransition["easing"]>
  )
    ? (transition.easing as NonNullable<SlideTransition["easing"]>)
    : DEFAULT_SLIDE_TRANSITION.easing;

  return {
    type,
    duration: Number.isFinite(duration)
      ? min(5000, max(100, duration))
      : DEFAULT_SLIDE_TRANSITION.duration,
    direction,
    easing,
  } as Required<SlideTransition>;
}

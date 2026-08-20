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

/** Fill optional transition fields and constrain values loaded from documents. */
export function normalizeSlideTransition(
  transition?: Partial<SlideTransition>
): Required<SlideTransition> {
  const duration = Number(transition?.duration);

  return {
    ...DEFAULT_SLIDE_TRANSITION,
    ...transition,
    duration: Number.isFinite(duration)
      ? min(5000, max(100, duration))
      : DEFAULT_SLIDE_TRANSITION.duration,
  } as Required<SlideTransition>;
}

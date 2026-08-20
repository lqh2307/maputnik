/** One selectable mark displayed on a range control. */
export type Mark = {
  /** Numeric value represented by the mark. */
  value: number;
  /** Optional label rendered next to the mark. */
  label?: React.ReactNode;
};

/** Provides normalized marks. */
export const normalizedMarks: Mark[] = [
  {
    value: 0,
  },
  {
    value: 0.25,
  },
  {
    value: 0.5,
  },
  {
    value: 0.75,
  },
  {
    value: 1,
  },
];

/** Provides common scale marks. */
export const scaleMarks: Mark[] = [
  {
    value: 0.5,
  },
  {
    value: 1,
  },
  {
    value: 1.5,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
];

/** Provides signed normalized marks. */
export const signedNormalizedMarks: Mark[] = [
  {
    value: -1,
  },
  {
    value: -0.5,
  },
  {
    value: 0,
  },
  {
    value: 0.5,
  },
  {
    value: 1,
  },
];

/** Provides percent marks. */
export const percentMarks: Mark[] = [
  {
    value: 0,
  },
  {
    value: 25,
  },
  {
    value: 50,
  },
  {
    value: 75,
  },
  {
    value: 100,
  },
];

/** Provides signed percent marks. */
export const signedPercentMarks: Mark[] = [
  {
    value: -100,
  },
  {
    value: -50,
  },
  {
    value: 0,
  },
  {
    value: 50,
  },
  {
    value: 100,
  },
];

/** Provides angle degree marks. */
export const angleDegreeMarks: Mark[] = [
  {
    value: 0,
  },
  {
    value: 45,
  },
  {
    value: 90,
  },
  {
    value: 135,
  },
  {
    value: 180,
  },
  {
    value: 225,
  },
  {
    value: 270,
  },
  {
    value: 315,
  },
  {
    value: 360,
  },
];

/** Provides signed angle degree marks. */
export const signedAngleDegreeMarks: Mark[] = [
  {
    value: -180,
  },
  {
    value: -135,
  },
  {
    value: -90,
  },
  {
    value: -45,
  },
  {
    value: 0,
  },
  {
    value: 45,
  },
  {
    value: 90,
  },
  {
    value: 135,
  },
  {
    value: 180,
  },
];

/** Provides rotation marks for controls supporting multiple full turns. */
export const rotationDegreeMarks: Mark[] = [
  {
    value: -360,
  },
  {
    value: 0,
  },
  {
    value: 360,
  },
];

/** Provides speed marks. */
export const speedMarks: Mark[] = [
  {
    value: 0,
  },
  {
    value: 0.5,
  },
  {
    value: 1.0,
  },
  {
    value: 1.5,
  },
  {
    value: 2.0,
  },
];

/** Provides polygon point marks. */
export const polygonPointMarks: Mark[] = [
  {
    value: 3,
  },
  {
    value: 4,
  },
  {
    value: 5,
  },
  {
    value: 6,
  },
];

/** Provides kaleidoscope power marks. */
export const kaleidoscopePowerMarks: Mark[] = [
  {
    value: 0,
  },
  {
    value: 1,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
  {
    value: 4,
  },
  {
    value: 5,
  },
  {
    value: 6,
  },
];

/** Provides level marks. */
export const levelMarks: Mark[] = [
  {
    value: 1,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
];

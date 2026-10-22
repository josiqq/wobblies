import { ensureContrast, mixOklch, type OklchPalette } from "./color";
import type { Layout } from "./layout";

/** Every {@link Mood}, in a fixed order. */
export const MOODS = ["idle", "happy", "sad", "mad"] as const;
/** Facial expression of an avatar. */
export type Mood = (typeof MOODS)[number];

/**
 * A mood is a small set of offsets applied to the eyes (both, or only the
 * second eye with the *2 fields), plus a body offset and an optional tint.
 */
export interface MoodParams {
  scaleX: number;
  scaleY: number;
  /** Mirrored tilt in degrees (left eye gets -tilt). */
  tilt: number;
  dx: number;
  dy: number;
  scaleX2: number;
  scaleY2: number;
  tilt2: number;
  /** 1 = ignore the avatar's natural eye lean. */
  lock: number;
  /** 0..1 blend toward an angry red. */
  heat: number;
  bodyDy: number;
}

const NEUTRAL: MoodParams = {
  scaleX: 1,
  scaleY: 1,
  tilt: 0,
  dx: 0,
  dy: 0,
  scaleX2: 0,
  scaleY2: 0,
  tilt2: 0,
  lock: 0,
  heat: 0,
  bodyDy: 0,
};

export const MOOD_PARAMS: Record<Mood, MoodParams> = {
  idle: NEUTRAL,
  // squinty smiling arcs
  happy: {
    ...NEUTRAL,
    scaleX: 1.7,
    scaleY: 0.32,
    tilt: 9,
    dx: 1.4,
    dy: -1.4,
    scaleX2: 0.08,
    scaleY2: 0.05,
    tilt2: -15,
    lock: 1,
    bodyDy: -2,
  },
  // droopy, outward-sloped
  sad: {
    ...NEUTRAL,
    scaleX: 0.62,
    scaleY: 0.58,
    tilt: 24,
    dx: 1.8,
    dy: 3.4,
    scaleX2: -0.05,
    scaleY2: -0.06,
    tilt2: -6,
    lock: 1,
    bodyDy: 2.4,
  },
  // narrowed, inward-sloped
  mad: {
    ...NEUTRAL,
    scaleX: 1.8,
    scaleY: 0.28,
    tilt: -30,
    dx: 0.6,
    dy: 0.4,
    scaleY2: -0.03,
    tilt2: 5,
    lock: 1,
    heat: 0.6,
    bodyDy: 0.8,
  },
};

export function applyMood(l: Layout, p: MoodParams): Layout {
  return {
    ...l,
    eyes: l.eyes.map((e, i) => {
      const side = i ? 1 : -1;
      return {
        ...e,
        cx: e.cx + p.dx * side,
        cy: e.cy + p.dy,
        rx: e.rx * (p.scaleX + (i ? p.scaleX2 : 0)),
        ry: e.ry * (p.scaleY + (i ? p.scaleY2 : 0)),
        rot: e.rot * (1 - p.lock) + (p.tilt + (i ? p.tilt2 : 0)) * side,
      };
    }) as Layout["eyes"],
  };
}

const ANGRY = { l: 0.58, c: 0.18, h: 27 };

export function tintForMood(p: OklchPalette, mood: MoodParams): OklchPalette {
  if (!mood.heat) return p;
  const body = mixOklch(p.body, ANGRY, mood.heat);
  return { ...p, body, eye: ensureContrast(p.eye, body, 4.5) };
}

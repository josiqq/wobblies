import { createTraits, type Overrides } from "./hash";
import { SHAPE_POSITIONS, SHAPES, type Shape, shapeFor } from "./layout";

/**
 * Typed overrides for an avatar's name-derived traits.
 *
 * Numbers are positions in `[0, 1)` along each trait's range. Out-of-range finite numbers are
 * clamped to `[0, 0.999999]`; `NaN` and `±Infinity` are ignored (the trait is derived from the
 * name instead).
 */
export interface TraitOverrides {
  /** Force a body shape. */
  shape?: Shape;
  /** Hue position, `[0, 1)` → 0–360°. */
  hue?: number;
  /** Colour family: pastel / chalk / fresh / vivid / neon / dark, `[0, 1)`. */
  tone?: number;
  /** Distance between the eyes, `[0, 1)`. */
  eyeGap?: number;
  /** Size of the second eye relative to the first, `[0, 1)`. */
  eyeSize?: number;
  /** Horizontal gaze, `[0, 1)`. */
  gaze?: number;
}

/** Public numeric trait names → internal trait keys. Unstable. */
export const TRAIT_KEYS = {
  hue: "hue",
  tone: "tone",
  eyeGap: "eye.gap",
  eyeSize: "eye.scale",
  gaze: "gaze.x",
} as const;

const NUMERIC_TRAITS = Object.keys(TRAIT_KEYS) as Array<keyof typeof TRAIT_KEYS>;

const clamp = (v: number) => Math.min(0.999999, Math.max(0, v));

/** Converts typed public overrides into the engine's internal trait-key overrides. */
export function toInternalOverrides(traits?: TraitOverrides): Overrides {
  const out: Overrides = {};
  if (!traits) return out;
  if (traits.shape !== undefined && (SHAPES as readonly string[]).includes(traits.shape)) {
    out.shape = SHAPE_POSITIONS[traits.shape];
  }
  for (const key of NUMERIC_TRAITS) {
    const v = traits[key];
    if (typeof v === "number" && Number.isFinite(v)) out[TRAIT_KEYS[key]] = clamp(v);
  }
  return out;
}

/** The trait values `createAvatar` actually uses for `name`, after `traits` overrides. */
export function deriveTraits(name: string, traits?: TraitOverrides): Required<TraitOverrides> {
  const t = createTraits(String(name ?? ""), toInternalOverrides(traits));
  return {
    shape: shapeFor(t("shape")),
    hue: t(TRAIT_KEYS.hue),
    tone: t(TRAIT_KEYS.tone),
    eyeGap: t(TRAIT_KEYS.eyeGap),
    eyeSize: t(TRAIT_KEYS.eyeSize),
    gaze: t(TRAIT_KEYS.gaze),
  };
}

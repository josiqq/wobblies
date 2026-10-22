import type { Superellipse } from "./geometry";
import type { Traits } from "./hash";

/** Every body {@link Shape}, in a fixed order. */
export const SHAPES = ["round", "organic", "boxy", "nub", "cloud", "sun"] as const;
/** Body shape of an avatar. */
export type Shape = (typeof SHAPES)[number];

// Cumulative thresholds over the "shape" trait: rounder shapes are more common.
const SHAPE_WEIGHTS: Array<[number, Shape]> = [
  [0.26, "round"],
  [0.56, "organic"],
  [0.7, "boxy"],
  [0.83, "nub"],
  [0.93, "cloud"],
  [1, "sun"],
];

/** Middle of each shape's trait band, used by the shape picker arrows. */
export const SHAPE_POSITIONS: Record<Shape, number> = (() => {
  const out = {} as Record<Shape, number>;
  let prev = 0;
  for (const [max, shape] of SHAPE_WEIGHTS) {
    out[shape] = (prev + max) / 2;
    prev = max;
  }
  return out;
})();

export function shapeFor(v: number): Shape {
  return (SHAPE_WEIGHTS.find(([max]) => v < max) ?? SHAPE_WEIGHTS[0])[1];
}

// Size compensation so add-ons (petals, nubs) don't push the blob off-canvas.
const SHAPE_SCALE: Record<Shape, number> = {
  round: 1,
  organic: 0.97,
  boxy: 0.87,
  nub: 0.87,
  cloud: 0.78,
  sun: 0.7,
};

export interface Body extends Required<Superellipse> {
  radii: number[];
}

export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

export interface Eye extends Required<Superellipse> {}

export interface Layout {
  shape: Shape;
  body: Body;
  extras: Circle[];
  eyes: [Eye, Eye];
}

export function layout(t: Traits): Layout {
  const shape = shapeFor(t("shape"));
  const rx = t.num("body.r", 31, 38) * SHAPE_SCALE[shape];
  const ry = rx * t.num("body.ratio", 0.92, 1.08);

  const body: Body = {
    cx: 50 + t.jitter("body.x", 1.5),
    cy: 50 + t.jitter("body.y", 1.5),
    rx,
    ry,
    n: shape === "boxy" ? t.num("body.n", 3.4, 6) : t.num("body.n", 1.9, 2.5),
    rot: shape === "boxy" ? t.num("body.rot", -18, 18) : 0,
    radii: Array.from(
      { length: t.int("body.pts", 6, 8) },
      (_, i) => 1 + t.jitter(`body.r${i}`, 0.15),
    ),
  };

  // --- eyes -----------------------------------------------------------------
  const gazeX = t.jitter("gaze.x", 0.09) * rx;
  const gazeY = t.num("gaze.y", -0.2, 0.08) * ry;
  const eyeRx = t.num("eye.rx", 0.075, 0.105) * rx;
  const eyeRatio = t.num("eye.ratio", 1.9, 3.2); // tall pill eyes
  const scale = t.num("eye.scale", 0.78, 1.24); // right eye vs left eye
  const stretch = t.num("eye.stretch", 0.85, 1.18);
  const gap = t.num("eye.gap", 0.1, 0.24) * rx;

  // Fit both eyes inside the body: shrink if the outermost point escapes.
  const maxW = eyeRx * Math.max(1, scale);
  const maxH = eyeRx * eyeRatio * Math.max(1, scale * stretch);
  const half = maxW + 0.03 * rx + gap;
  const room = shape === "organic" || shape === "cloud" ? 0.95 * Math.min(...body.radii) : 1;
  const reach = (Math.abs(gazeX) + half + Math.hypot(maxW, maxH)) / rx;
  const fit = reach > 0.9 * room ? (0.9 * room) / reach : 1;

  const erx = eyeRx * fit;
  const ery = erx * eyeRatio;
  const offset = half * fit;

  const maxLean = Math.min(12, (Math.asin(Math.min(1, gap / maxH)) * 180) / Math.PI);
  const leanL = t.num("eye.lean", -1, 1) * maxLean;
  const leanR = Math.max(-12, Math.min(12, leanL + t.jitter("eye.lean2", 3.5)));
  const eyeN = t.num("eye.n", 3.5, 6);

  const eyes: [Eye, Eye] = [
    { cx: body.cx + gazeX - offset, cy: body.cy + gazeY, rx: erx, ry: ery, n: eyeN, rot: leanL },
    {
      cx: body.cx + gazeX + offset,
      cy: body.cy + gazeY + t.jitter("eye.dy", 0.04) * ry,
      rx: erx * scale,
      ry: ery * scale * stretch,
      n: eyeN,
      rot: leanR,
    },
  ];

  // --- shape extras -----------------------------------------------------------
  const extras: Circle[] = [];
  if (shape === "sun") {
    const n = t.int("sun.n", 6, 9);
    const dist = rx * t.num("sun.dist", 1, 1.08);
    const r = rx * t.num("sun.r", 0.2, 0.26);
    const rot = t.num("sun.rot", 0, 2 * Math.PI);
    for (let i = 0; i < n; i++) {
      const a = rot + (2 * Math.PI * i) / n;
      extras.push({ cx: body.cx + Math.cos(a) * dist, cy: body.cy + Math.sin(a) * dist, r });
    }
  } else if (shape === "cloud") {
    const n = t.int("cloud.n", 4, 6);
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (Math.PI * (i + 0.5)) / n; // upper half only
      extras.push({
        cx: body.cx + Math.cos(a) * rx * 0.8,
        cy: body.cy + Math.sin(a) * rx * 0.5,
        r: rx * t.num(`cloud.r${i}`, 0.44, 0.62),
      });
    }
  } else if (shape === "nub") {
    const n = t.int("nub.n", 1, 2);
    for (let i = 0; i < n; i++) {
      const a = t.num(`nub.a${i}`, 0, 2 * Math.PI);
      extras.push({
        cx: body.cx + Math.cos(a) * rx * 0.88,
        cy: body.cy + Math.sin(a) * rx * 0.88,
        r: rx * t.num(`nub.r${i}`, 0.24, 0.4),
      });
    }
  }

  return { shape, body, extras, eyes };
}

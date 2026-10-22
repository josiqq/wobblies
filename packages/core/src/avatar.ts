import { buildPalette, type Palette, paletteToHex } from "./color";
import { fmt, organicPath, superellipsePath } from "./geometry";
import { createTraits } from "./hash";
import { type Layout, layout, type Shape } from "./layout";
import { applyMood, MOOD_PARAMS, MOODS, type Mood, tintForMood } from "./moods";
import { type SvgNode, serialize } from "./nodes";
import { type TraitOverrides, toInternalOverrides } from "./traits";

/** Shape drawn behind the figure. `"none"` leaves the background transparent. */
export type Background = "circle" | "squircle" | "square" | "none";

/** Options for {@link createAvatar}. Every field is optional. */
export interface AvatarOptions {
  /** Facial expression. Default `"idle"`. */
  mood?: Mood;
  /** Background shape. Default `"circle"`. */
  background?: Background;
  /** `width`/`height` attributes in pixels. Omitted (or not a positive finite number) → fluid SVG. */
  size?: number;
  /** Accessible `<title>` text; escaped. */
  title?: string;
  /** Adds CSS class hooks for the blink / breathe / look animations (see `ANIMATIONS_CSS`). */
  animated?: boolean;
  /** Colour overrides; any colour left out is derived from the name. */
  palette?: Partial<Palette>;
  /** Overrides for name-derived traits. */
  traits?: TraitOverrides;
}

/** A rendered avatar. */
export interface Avatar {
  /** The complete SVG markup. */
  svg: string;
  /** Children of the root `<svg>` element, as a primitive render tree. */
  nodes: SvgNode[];
  /** Attributes of the root `<svg>` element (`xmlns`, `viewBox`, optional `width`/`height`/`class`). */
  rootAttrs: Record<string, string>;
  /** The colours used, as hex strings (after overrides). */
  palette: Palette;
  /** The body shape used. */
  shape: Shape;
}

const PALETTE_KEYS = ["bg", "body", "eye"] as const;

function bodyPath(l: Layout): string {
  const b = l.body;
  if (l.shape === "organic" || l.shape === "cloud") {
    return organicPath(b.cx, b.cy, b.rx, b.ry, b.radii, l.shape === "cloud" ? 0 : b.rot);
  }
  return superellipsePath(b);
}

function backgroundPath(bg: Background): string | null {
  if (bg === "none") return null;
  if (bg === "square") return "M0 0H100V100H0Z";
  return superellipsePath({ cx: 50, cy: 50, rx: 50, ry: 50, n: bg === "squircle" ? 5 : 2 });
}

/**
 * Creates a deterministic avatar for `name`.
 *
 * The name is normalized (NFC, trimmed, leading `@` stripped, lowercased), so `"@Ana "` and
 * `"ana"` give the same avatar. A non-string `name` is treated as `String(name ?? "")`.
 *
 * @example
 * ```ts
 * import { createAvatar } from "@wobblies/core";
 *
 * const avatar = createAvatar("Ana López", { mood: "happy", size: 64, title: "Ana López" });
 * element.innerHTML = avatar.svg;
 * ```
 */
export function createAvatar(name: string, options: AvatarOptions = {}): Avatar {
  const traits = createTraits(String(name ?? ""), toInternalOverrides(options.traits));
  const mood = MOOD_PARAMS[MOODS.includes(options.mood as Mood) ? (options.mood as Mood) : "idle"];

  const oklch = tintForMood(buildPalette(traits.num("hue", 0, 360), traits("tone")), mood);
  const palette: Palette = paletteToHex(oklch);
  for (const key of PALETTE_KEYS) {
    const v = options.palette?.[key];
    if (typeof v === "string") palette[key] = v;
  }

  const l = applyMood(layout(traits), mood);
  const anim = options.animated === true;

  const eyes: SvgNode[] = l.eyes.map((e) => {
    const path: SvgNode = { tag: "path", attrs: { d: superellipsePath(e) } };
    return anim ? { tag: "g", attrs: { class: "wobbly-eye" }, children: [path] } : path;
  });

  const body: SvgNode[] = l.extras.map((c) => ({
    tag: "circle",
    attrs: { cx: fmt(c.cx), cy: fmt(c.cy), r: fmt(c.r) },
  }));
  body.push({ tag: "path", attrs: { d: bodyPath(l) } });

  const eyeAttrs: Record<string, string> = { fill: palette.eye };
  if (anim) eyeAttrs.class = "wobbly-eyes";

  let figure: SvgNode[] = [
    { tag: "g", attrs: { fill: palette.body }, children: body },
    { tag: "g", attrs: eyeAttrs, children: eyes },
  ];
  if (anim) figure = [{ tag: "g", attrs: { class: "wobbly-breathe" }, children: figure }];
  if (mood.bodyDy) {
    figure = [
      { tag: "g", attrs: { transform: `translate(0 ${fmt(mood.bodyDy)})` }, children: figure },
    ];
  }

  const nodes: SvgNode[] = [];
  if (options.title) nodes.push({ tag: "title", text: String(options.title) });
  const bg = backgroundPath(options.background ?? "circle");
  if (bg) nodes.push({ tag: "path", attrs: { d: bg, fill: palette.bg } });
  nodes.push(...figure);

  const rootAttrs: Record<string, string> = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 100 100",
  };
  const size = options.size;
  if (typeof size === "number" && Number.isFinite(size) && size > 0) {
    rootAttrs.width = String(size);
    rootAttrs.height = String(size);
  }
  if (anim) rootAttrs.class = "wobbly-root";

  return { svg: serialize(rootAttrs, nodes), nodes, rootAttrs, palette, shape: l.shape };
}

/**
 * Encodes an SVG string as a `data:` URI, e.g. for an `<img src>` or CSS `url()`.
 *
 * @example
 * ```ts
 * import { createAvatar, toDataUri } from "@wobblies/core";
 *
 * img.src = toDataUri(createAvatar("ana").svg);
 * ```
 */
export function toDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

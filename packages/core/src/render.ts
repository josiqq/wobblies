import { buildPalette, type Palette, paletteToHex } from "./color";
import { fmt, organicPath, superellipsePath } from "./geometry";
import { createTraits, type Overrides } from "./hash";
import { type Layout, layout } from "./layout";
import { applyMood, MOOD_PARAMS, type Mood, tintForMood } from "./moods";

export type Background = false | "circle" | "squircle" | "square";

export interface AvatarOptions {
  /** Trait overrides in [0,1): "shape", "hue", "tone", "eye.gap", ... */
  overrides?: Overrides;
  mood?: Mood;
  background?: Background;
  /** Pixel width/height attribute; omit for a fluid SVG. */
  size?: number;
  /** Adds CSS hooks for blink / breathe animations (see style.css). */
  animated?: boolean;
  title?: string;
  palette?: Partial<Palette>;
}

export interface Avatar {
  layout: Layout;
  palette: Palette;
  svg: string;
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: ported verbatim from the draft engine
const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function bodyPath(l: Layout): string {
  const b = l.body;
  if (l.shape === "organic" || l.shape === "cloud") {
    return organicPath(b.cx, b.cy, b.rx, b.ry, b.radii, l.shape === "cloud" ? 0 : b.rot);
  }
  return superellipsePath(b);
}

function backgroundPath(bg: Background): string | null {
  if (bg === false) return null;
  if (bg === "square") return "M0 0H100V100H0Z";
  return superellipsePath({ cx: 50, cy: 50, rx: 50, ry: 50, n: bg === "circle" ? 2 : 5 });
}

export function createAvatar(name: string, opts: AvatarOptions = {}): Avatar {
  const traits = createTraits(name, opts.overrides);
  const mood = MOOD_PARAMS[opts.mood ?? "idle"];

  const oklch = tintForMood(buildPalette(traits.num("hue", 0, 360), traits("tone")), mood);
  const palette: Palette = { ...paletteToHex(oklch), ...opts.palette };

  const l = applyMood(layout(traits), mood);
  const anim = opts.animated ?? false;

  const eyes = l.eyes
    .map((e, i) => {
      const path = `<path d="${superellipsePath(e)}"/>`;
      return anim
        ? `<g class="av-eye" style="--av-side:${i ? 1 : -1};transform-origin:${fmt(e.cx)}px ${fmt(e.cy)}px">${path}</g>`
        : path;
    })
    .join("");

  const extras = l.extras
    .map((c) => `<circle cx="${fmt(c.cx)}" cy="${fmt(c.cy)}" r="${fmt(c.r)}"/>`)
    .join("");

  let figure =
    `<g fill="${palette.body}">${extras}<path d="${bodyPath(l)}"/></g>` +
    `<g fill="${palette.eye}"${anim ? ' class="av-eyes"' : ""}>${eyes}</g>`;
  if (mood.bodyDy) figure = `<g transform="translate(0 ${fmt(mood.bodyDy)})">${figure}</g>`;
  if (anim) figure = `<g class="av-breathe">${figure}</g>`;

  const bg = backgroundPath(opts.background ?? "circle");
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size}${anim ? ' class="av-root"' : ""}>` +
    (opts.title ? `<title>${escape(opts.title)}</title>` : "") +
    (bg ? `<path d="${bg}" fill="${palette.bg}"/>` : "") +
    figure +
    `</svg>`;

  return { layout: l, palette, svg };
}

export function toDataUri(svg: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

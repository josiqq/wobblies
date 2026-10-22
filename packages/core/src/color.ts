// OKLCH colour helpers with gamut mapping and WCAG contrast enforcement.

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

type Rgb = [number, number, number];

function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1.0001);

/** Converts to linear sRGB, reducing chroma (binary search) until it fits. */
export function toLinearSrgb(color: Oklch): Rgb {
  let rgb = oklchToLinear(color);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinear({ ...color, c: lo });
  }
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as Rgb;
}

const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function toHex(color: Oklch): string {
  return (
    "#" +
    toLinearSrgb(color)
      .map((v) =>
        Math.round(255 * encode(v))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function luminance(color: Oklch): number {
  const [r, g, b] = toLinearSrgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Oklch, b: Oklch): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Nudges lightness of `color` away from `against` until `ratio` is met. */
export function ensureContrast(color: Oklch, against: Oklch, ratio: number): Oklch {
  if (contrast(color, against) >= ratio) return color;
  const first = color.l >= against.l ? 1 : -1;
  for (const dir of [first, -first]) {
    const c = { ...color };
    for (let i = 0; i < 50; i++) {
      c.l = Math.min(1, Math.max(0, c.l + 0.02 * dir));
      if (contrast(c, against) >= ratio) return c;
      if (c.l === 0 || c.l === 1) break;
    }
  }
  const black = { ...color, l: 0, c: 0 };
  const white = { ...color, l: 1, c: 0 };
  return contrast(black, against) >= contrast(white, against) ? black : white;
}

// Tone stops: tone in [0,1) picks a lightness/chroma "family" for the body.
const TONES: Array<[number, { l: number; c: number }]> = [
  [0.18, { l: 0.88, c: 0.07 }], // pastel
  [0.32, { l: 0.92, c: 0.03 }], // chalk
  [0.6, { l: 0.76, c: 0.13 }], // fresh
  [0.78, { l: 0.65, c: 0.16 }], // vivid
  [0.92, { l: 0.85, c: 0.15 }], // neon-ish
  [1, { l: 0.36, c: 0.04 }], // dark
];

export interface Palette {
  bg: string;
  body: string;
  eye: string;
}

export interface OklchPalette {
  bg: Oklch;
  body: Oklch;
  eye: Oklch;
}

export function buildPalette(hue: number, tone: number): OklchPalette {
  const stop = (TONES.find(([max]) => tone < max) ?? TONES[0])[1];
  const bg: Oklch = { l: 0.965, c: 0.012, h: hue };
  // Keep the body visible against both the page and its own background.
  let body = ensureContrast({ l: stop.l, c: stop.c, h: hue }, { l: 0.15, c: 0, h: 0 }, 1.5);
  body = ensureContrast(body, bg, 1.25);
  const eyeBase: Oklch =
    body.l >= 0.5 ? { l: 0.18, c: 0.02, h: hue } : { l: 0.97, c: 0.012, h: hue };
  const eye = ensureContrast(eyeBase, body, 4.5);
  return { bg, body, eye };
}

export function paletteToHex(p: OklchPalette): Palette {
  return { bg: toHex(p.bg), body: toHex(p.body), eye: toHex(p.eye) };
}

export function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  // Mix in OKLab (cartesian) to avoid hue wrap-around artefacts.
  const r = (d: number) => (d * Math.PI) / 180;
  const ax = a.c * Math.cos(r(a.h));
  const ay = a.c * Math.sin(r(a.h));
  const bx = b.c * Math.cos(r(b.h));
  const by = b.c * Math.sin(r(b.h));
  const x = ax + (bx - ax) * t;
  const y = ay + (by - ay) * t;
  return { l: a.l + (b.l - a.l) * t, c: Math.hypot(x, y), h: (Math.atan2(y, x) * 180) / Math.PI };
}

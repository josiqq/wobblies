// SVG path builders. Coordinates live in a 100x100 viewBox.

export const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

export interface Superellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Exponent: 2 = ellipse, higher = squarer. */
  n?: number;
  /** Rotation in degrees. */
  rot?: number;
}

/**
 * Approximates a superellipse with four cubic Béziers. The handle length is
 * derived from where the curve crosses the diagonal (2^(-1/n)), which yields
 * the classic 0.5523 kappa when n = 2.
 */
export function superellipsePath({ cx, cy, rx, ry, n = 4, rot = 0 }: Superellipse): string {
  const k = Math.min(1, (8 * 2 ** (-1 / n) - 4) / 3);
  const hx = rx * k;
  const hy = ry * k;
  const pts: Array<[number, number]> = [
    [rx, 0],
    [rx, hy],
    [hx, ry],
    [0, ry],
    [-hx, ry],
    [-rx, hy],
    [-rx, 0],
    [-rx, -hy],
    [-hx, -ry],
    [0, -ry],
    [hx, -ry],
    [rx, -hy],
    [rx, 0],
  ];
  const a = (rot * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const p = (i: number) => {
    const [x, y] = pts[i];
    return `${fmt(cx + x * cos - y * sin)} ${fmt(cy + x * sin + y * cos)}`;
  };
  let d = `M${p(0)}`;
  for (let i = 1; i < 13; i += 3) d += `C${p(i)} ${p(i + 1)} ${p(i + 2)}`;
  return d + "Z";
}

/** Closed Catmull–Rom spline through radially-jittered points (organic blobs). */
export function organicPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  radii: number[],
  rotDeg = 0,
): string {
  const count = radii.length;
  const off = (rotDeg * Math.PI) / 180;
  const pts = radii.map((r, i) => {
    const a = off + (2 * Math.PI * i) / count;
    return [cx + rx * r * Math.cos(a), cy + ry * r * Math.sin(a)] as const;
  });
  const at = (i: number) => pts[((i % count) + count) % count];
  let d = `M${fmt(at(0)[0])} ${fmt(at(0)[1])}`;
  for (let i = 0; i < count; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    d +=
      `C${fmt(x1 + (x2 - x0) / 6)} ${fmt(y1 + (y2 - y0) / 6)} ` +
      `${fmt(x2 - (x3 - x1) / 6)} ${fmt(y2 - (y3 - y1) / 6)} ${fmt(x2)} ${fmt(y2)}`;
  }
  return d + "Z";
}

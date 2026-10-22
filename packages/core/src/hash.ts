// Deterministic per-trait randomness.
// Every trait is hashed independently from (name, traitKey), so adding a new
// trait never reshuffles the existing ones, and any trait can be overridden.

const encoder = new TextEncoder();

function mix(h: number, bytes: Uint8Array): number {
  for (let i = 0; i < bytes.length; i++) {
    h = Math.imul(h ^ bytes[i], 0x5bd1e995);
    h = (h << 15) | (h >>> 17);
  }
  return h;
}

// murmur3 finalizer: spreads entropy across all 32 bits.
function fmix32(h: number): number {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

export function normalizeName(name: string): string {
  return name.normalize("NFC").trim().replace(/^@+/, "").toLowerCase();
}

export function seedFrom(name: string): number {
  const n = normalizeName(name);
  return mix(0x9e3779b9 ^ n.length, encoder.encode(n));
}

/** Values in [0,1) that override a trait. */
export type Overrides = Partial<Record<string, number>>;

export interface Traits {
  (key: string): number;
  num(key: string, min: number, max: number): number;
  int(key: string, min: number, max: number): number;
  jitter(key: string, amount: number): number;
}

export function createTraits(name: string, overrides: Overrides = {}): Traits {
  const seed = seedFrom(name);
  const sep = Uint8Array.of(0);

  const t = ((key: string) => {
    const o = overrides[key];
    if (o !== undefined) return Math.min(0.999999, Math.max(0, o));
    return fmix32(mix(mix(seed, sep), encoder.encode(key))) / 0x100000000;
  }) as Traits;

  t.num = (key, min, max) => min + t(key) * (max - min);
  t.int = (key, min, max) => min + Math.floor(t(key) * (max - min + 1));
  t.jitter = (key, amount) => (2 * t(key) - 1) * amount;
  return t;
}

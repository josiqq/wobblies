import { describe, expect, it } from "vitest";
import { SHAPES } from "../src/index";
import { SHAPE_POSITIONS } from "../src/internal";
import { deriveTraits, toInternalOverrides } from "../src/traits";

describe("toInternalOverrides", () => {
  it("maps shape to its band midpoint", () => {
    expect(toInternalOverrides({ shape: "cloud" }).shape).toBe(SHAPE_POSITIONS.cloud);
  });

  it("maps public names onto internal keys", () => {
    const o = toInternalOverrides({ eyeGap: 0.3, eyeSize: 0.4, gaze: 0.5, hue: 0.1, tone: 0.2 });
    expect(o["eye.gap"]).toBe(0.3);
    expect(o["eye.scale"]).toBe(0.4);
    expect(o["gaze.x"]).toBe(0.5);
    expect(o.hue).toBe(0.1);
    expect(o.tone).toBe(0.2);
  });

  it("clamps finite values to [0, 0.999999]", () => {
    expect(toInternalOverrides({ hue: 2 }).hue).toBe(0.999999);
    expect(toInternalOverrides({ hue: -1 }).hue).toBe(0);
  });

  it("drops non-finite values", () => {
    expect("hue" in toInternalOverrides({ hue: Number.NaN })).toBe(false);
    expect("hue" in toInternalOverrides({ hue: Number.POSITIVE_INFINITY })).toBe(false);
  });

  it("returns an empty object without traits", () => {
    expect(toInternalOverrides()).toEqual({});
  });
});

describe("deriveTraits", () => {
  it("returns all six traits derived from the name", () => {
    const t = deriveTraits("ana");
    expect(Object.keys(t).sort()).toEqual(
      ["eyeGap", "eyeSize", "gaze", "hue", "shape", "tone"].sort(),
    );
    expect(SHAPES).toContain(t.shape);
    for (const k of ["hue", "tone", "eyeGap", "eyeSize", "gaze"] as const) {
      expect(typeof t[k]).toBe("number");
      expect(t[k]).toBeGreaterThanOrEqual(0);
      expect(t[k]).toBeLessThan(1);
    }
  });

  it("reflects overrides", () => {
    expect(deriveTraits("ana", { hue: 0.5 }).hue).toBe(0.5);
    expect(deriveTraits("ana", { shape: "sun" }).shape).toBe("sun");
  });
});

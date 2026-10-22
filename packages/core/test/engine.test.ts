import { describe, expect, it } from "vitest";
import { buildPalette, contrast } from "../src/color";
import { createAvatar, SHAPES } from "../src/index";
import { createTraits, layout, SHAPE_POSITIONS, shapeFor } from "../src/internal";

describe("engine", () => {
  it("is deterministic and normalises names", () => {
    expect(createAvatar("@Ana ").svg).toBe(createAvatar("ana").svg);
    expect(createAvatar("ana").svg).not.toBe(createAvatar("bruno").svg);
  });

  it("produces traits in [0,1) and honours overrides", () => {
    const t = createTraits("x", { hue: 0.25 });
    expect(t("hue")).toBe(0.25);
    for (const k of ["shape", "tone", "eye.gap"]) {
      expect(t(k)).toBeGreaterThanOrEqual(0);
      expect(t(k)).toBeLessThan(1);
    }
  });

  it("maps every shape position back to its shape", () => {
    for (const s of SHAPES) expect(shapeFor(SHAPE_POSITIONS[s])).toBe(s);
  });

  it("covers every shape over many names", () => {
    const seen = new Set(Array.from({ length: 500 }, (_, i) => createAvatar(`user${i}`).shape));
    expect(seen.size).toBe(SHAPES.length);
  });

  it("keeps eyes readable against the body", () => {
    for (let i = 0; i < 40; i++) {
      const p = buildPalette(i * 9, i / 40);
      expect(contrast(p.eye, p.body)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps the figure inside the canvas", () => {
    for (let i = 0; i < 300; i++) {
      const l = layout(createTraits(`n${i}`));
      for (const c of l.extras) {
        expect(c.cx - c.r).toBeGreaterThan(-1);
        expect(c.cx + c.r).toBeLessThan(101);
      }
      for (const e of l.eyes) expect(Math.abs(e.cx - l.body.cx)).toBeLessThan(l.body.rx);
    }
  });
});

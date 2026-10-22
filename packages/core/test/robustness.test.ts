import { describe, expect, it } from "vitest";
import { createAvatar, toDataUri } from "../src/index";

describe("robustness (Review Focus)", () => {
  it("1: treats undefined / null / numbers as String(name ?? '')", () => {
    const empty = createAvatar("").svg;
    expect(createAvatar(undefined as unknown as string).svg).toBe(empty);
    expect(createAvatar(null as unknown as string).svg).toBe(empty);
    expect(createAvatar(42 as unknown as string).svg).toBe(createAvatar("42").svg);
  });

  it("2: escapes untrusted palette strings", () => {
    const { svg } = createAvatar("ana", { palette: { bg: '"/><script>alert(1)</script>' } });
    expect(svg).not.toContain("<script");
    expect(svg).toContain('fill="&quot;/&gt;&lt;script&gt;alert(1)&lt;/script&gt;"');
  });

  it("2: escapes untrusted titles", () => {
    const { svg } = createAvatar("ana", { title: '<b>&"' });
    expect(svg).toContain('<title>&lt;b&gt;&amp;"</title>');
    expect(svg).not.toContain("<b>");
  });

  it("2: replaces a lone surrogate in a title with U+FFFD", () => {
    const title = "Ana 😀".slice(0, 5); // cuts the emoji in half → lone high surrogate
    const { svg } = createAvatar("a", { title });
    expect(() => toDataUri(svg)).not.toThrow();
    expect(svg).toContain("<title>Ana \uFFFD</title>");
  });

  it("2: replaces XML-invalid controls and keeps tab / LF / CR", () => {
    const { svg } = createAvatar("a", {
      title: "\u0001x\t\n\r\uFFFE",
      palette: { bg: "\u0000red" },
    });
    expect(svg).not.toContain("\u0001");
    expect(svg).not.toContain("\u0000");
    expect(svg).toContain("<title>\uFFFDx\t\n\r\uFFFD</title>");
    expect(svg).toContain('fill="\uFFFDred"');
  });

  it("2: keeps valid surrogate pairs intact", () => {
    expect(createAvatar("a", { title: "🦊" }).svg).toContain("<title>🦊</title>");
  });

  it("2: ignores undefined palette entries", () => {
    expect(createAvatar("ana", { palette: { bg: undefined } }).svg).toBe(createAvatar("ana").svg);
  });

  it("3: ignores non-finite trait overrides", () => {
    const { svg } = createAvatar("ana", {
      traits: { hue: Number.NaN, tone: Number.POSITIVE_INFINITY },
    });
    expect(svg).toBe(createAvatar("ana").svg);
    expect(svg).not.toContain("NaN");
  });

  it("3: clamps out-of-range trait overrides", () => {
    const { svg } = createAvatar("ana", { traits: { hue: 7, eyeGap: -3, gaze: 1e9 } });
    expect(svg).not.toContain("NaN");
    expect(svg).toBe(
      createAvatar("ana", { traits: { hue: 0.999999, eyeGap: 0, gaze: 0.999999 } }).svg,
    );
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])("4: omits width for size %s", (size) => {
    const a = createAvatar("ana", { size });
    expect(a.rootAttrs.width).toBeUndefined();
    expect(a.svg).not.toContain("width=");
    expect(a.svg).not.toContain("height=");
  });

  it("5: gives NFD and NFC names the same avatar", () => {
    expect(createAvatar("José").svg).toBe(createAvatar("José").svg);
  });

  it("5: renders a 10 000-char name quickly", () => {
    const name = "abcdefghij".repeat(1000);
    createAvatar("warmup");
    const t0 = performance.now();
    const { svg } = createAvatar(name);
    expect(performance.now() - t0).toBeLessThan(50);
    expect(svg.startsWith("<svg")).toBe(true);
  });
});

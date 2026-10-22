import { describe, expect, it } from "vitest";
import { ANIMATIONS_CSS, createAvatar, MOODS, SHAPES, type SvgNode, toDataUri } from "../src/index";

const SQUARE = "M0 0H100V100H0Z";

function walk(nodes: SvgNode[], visit: (n: SvgNode) => void): void {
  for (const n of nodes) {
    visit(n);
    if ("children" in n) walk(n.children, visit);
  }
}

function count(nodes: SvgNode[]): number {
  let c = 0;
  walk(nodes, () => c++);
  return c;
}

describe("createAvatar", () => {
  it("reports a known shape", () => {
    expect(SHAPES).toContain(createAvatar("ana").shape);
  });

  it("honours a shape override", () => {
    expect(createAvatar("ana", { traits: { shape: "sun" } }).shape).toBe("sun");
  });

  it("applies palette overrides", () => {
    const a = createAvatar("ana", { palette: { bg: "#ffffff" } });
    expect(a.palette.bg).toBe("#ffffff");
    expect(a.svg).toContain('fill="#ffffff"');
  });

  it('omits the background for "none"', () => {
    const none = createAvatar("ana", { background: "none" });
    const square = createAvatar("ana", { background: "square" });
    expect(square.svg).toContain(`d="${SQUARE}"`);
    expect(none.svg).not.toContain(`d="${SQUARE}"`);
    walk(none.nodes, (n) => {
      if (n.tag === "path") expect(n.attrs.d).not.toBe(SQUARE);
    });
    expect(count(none.nodes)).toBe(count(square.nodes) - 1);
  });

  it("sets width/height only when size is given", () => {
    const a = createAvatar("ana", { size: 64 });
    expect(a.rootAttrs.width).toBe("64");
    expect(a.rootAttrs.height).toBe("64");
    expect(createAvatar("ana").rootAttrs.width).toBeUndefined();
    expect(createAvatar("ana").svg).not.toContain("width=");
  });

  it("starts with a title node when titled", () => {
    expect(createAvatar("ana", { title: "Ana" }).nodes[0]).toEqual({ tag: "title", text: "Ana" });
    expect(createAvatar("ana").nodes[0].tag).not.toBe("title");
  });

  it("puts root attributes in a fixed order", () => {
    const a = createAvatar("ana", { size: 10, animated: true });
    expect(Object.keys(a.rootAttrs)).toEqual(["xmlns", "viewBox", "width", "height", "class"]);
    expect(a.svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"')).toBe(
      true,
    );
  });

  it("emits animation class hooks and no inline styles", () => {
    const a = createAvatar("ana", { animated: true });
    expect(a.rootAttrs.class).toBe("wobbly-root");
    expect(a.svg).toContain("wobbly-breathe");
    expect(a.svg).toContain("wobbly-eyes");
    expect(a.svg).toContain("wobbly-eye");
    expect(a.svg).not.toContain("style=");
    expect(createAvatar("ana").svg).not.toContain("class=");
  });

  it("keeps the mood translate in the animated tree", () => {
    const a = createAvatar("ana", { animated: true, mood: "happy" });
    expect(a.svg).toContain('<g transform="translate(0 -2)"><g class="wobbly-breathe">');
  });

  it("styles every class it emits", () => {
    const classes = new Set<string>();
    for (const mood of MOODS) {
      const a = createAvatar("ana", { animated: true, mood });
      if (a.rootAttrs.class) classes.add(a.rootAttrs.class);
      walk(a.nodes, (n) => {
        if ("attrs" in n && n.attrs.class) classes.add(n.attrs.class);
      });
    }
    expect([...classes].sort()).toEqual(
      ["wobbly-breathe", "wobbly-eye", "wobbly-eyes", "wobbly-root"].sort(),
    );
    for (const c of classes) expect(ANIMATIONS_CSS).toContain(`.${c}`);
  });
});

describe("ANIMATIONS_CSS", () => {
  it("respects reduced motion and uses namespaced keyframes", () => {
    expect(ANIMATIONS_CSS).toContain("prefers-reduced-motion");
    for (const k of ["wobbly-breathe", "wobbly-blink", "wobbly-look"]) {
      expect(ANIMATIONS_CSS).toContain(`@keyframes ${k}`);
    }
    expect(ANIMATIONS_CSS).not.toContain("av-");
  });
});

describe("toDataUri", () => {
  it("percent-encodes the svg", () => {
    expect(toDataUri("<svg/>")).toBe("data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E");
  });
});

describe("constants", () => {
  it("exposes the spec tuples", () => {
    expect(MOODS).toEqual(["idle", "happy", "sad", "mad"]);
    expect(SHAPES).toEqual(["round", "organic", "boxy", "nub", "cloud", "sun"]);
  });
});

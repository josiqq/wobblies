import { describe, expect, it } from "vitest";
import { createAvatar } from "../src/index";
import { serialize } from "../src/nodes";
import { STABILITY_NAMES } from "./fixtures/names";

describe("serialize", () => {
  it("self-closes childless elements and keeps attribute order", () => {
    expect(
      serialize({ viewBox: "0 0 1 1" }, [{ tag: "path", attrs: { d: "M0 0", fill: "#000" } }]),
    ).toBe('<svg viewBox="0 0 1 1"><path d="M0 0" fill="#000"/></svg>');
  });

  it("nests groups", () => {
    expect(
      serialize({}, [
        { tag: "g", attrs: { fill: "red" }, children: [{ tag: "circle", attrs: { r: "1" } }] },
      ]),
    ).toBe('<svg><g fill="red"><circle r="1"/></g></svg>');
  });

  it('escapes & < > " in attribute values', () => {
    expect(serialize({ a: `&<>"'` }, [])).toBe(`<svg a="&amp;&lt;&gt;&quot;'"/>`);
  });

  it("escapes & < > in title text", () => {
    expect(serialize({}, [{ tag: "title", text: `&<>"` }])).toBe(
      `<svg><title>&amp;&lt;&gt;"</title></svg>`,
    );
  });

  it("produces exactly avatar.svg from avatar.nodes", () => {
    for (const n of STABILITY_NAMES.slice(0, 50)) {
      const a = createAvatar(n);
      expect(a.svg).toBe(serialize(a.rootAttrs, a.nodes));
      const b = createAvatar(n, { animated: true, title: n, size: 32, mood: "sad" });
      expect(b.svg).toBe(serialize(b.rootAttrs, b.nodes));
    }
  });
});

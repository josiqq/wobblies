import { describe, expect, it } from "vitest";
import { type Background, createAvatar } from "../src/index";
import { hashSvg, type MOOD_LIST, SNAPSHOT_NAMES, STABILITY_NAMES, slug } from "./fixtures/names";
import fixture from "./fixtures/stability.json";

type Mood = (typeof MOOD_LIST)[number];

/** Renders one corpus case through the public API. */
const render = (name: string, mood: Mood, bg: string): string =>
  createAvatar(name, { mood, background: bg as Background }).svg;

/** Keys split on the last two "|" so names stay intact. */
function splitKey(key: string): [string, Mood, string] {
  const bgAt = key.lastIndexOf("|");
  const moodAt = key.lastIndexOf("|", bgAt - 1);
  return [key.slice(0, moodAt), key.slice(moodAt + 1, bgAt) as Mood, key.slice(bgAt + 1)];
}

describe("stability", () => {
  it("has no corpus name containing |", () => {
    expect(STABILITY_NAMES.filter((n) => n.includes("|"))).toEqual([]);
  });

  it("matches the frozen output for every corpus case", () => {
    const mismatches = Object.entries(fixture.cases).filter(([key, hash]) => {
      const [name, mood, bg] = splitKey(key);
      return hashSvg(render(name, mood, bg)) !== hash;
    });
    expect(mismatches.map(([k]) => k)).toEqual([]);
  });

  it("covers 200 names × 4 moods × 4 backgrounds", () => {
    expect(STABILITY_NAMES).toHaveLength(200);
    expect(Object.keys(fixture.cases)).toHaveLength(3200);
  });

  it.each(SNAPSHOT_NAMES.map((name, i) => [i, name] as const))(
    "svg snapshot %i: %s",
    async (i, name) => {
      const file = `${String(i).padStart(2, "0")}-${slug(name) || "name"}.svg`;
      await expect(render(name, "idle", "circle")).toMatchFileSnapshot(`__snapshots__/svg/${file}`);
    },
  );
});

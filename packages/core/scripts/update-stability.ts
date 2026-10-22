import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createAvatar } from "../src/index";
import {
  BACKGROUND_LIST,
  hashSvg,
  MOOD_LIST,
  STABILITY_NAMES,
  stabilityKey,
} from "../test/fixtures/names";

const cases: Record<string, string> = {};
for (const name of STABILITY_NAMES) {
  for (const mood of MOOD_LIST) {
    for (const bg of BACKGROUND_LIST) {
      const { svg } = createAvatar(name, { mood, background: bg });
      cases[stabilityKey(name, mood, bg)] = hashSvg(svg);
    }
  }
}

const sorted = Object.fromEntries(
  Object.entries(cases).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);
const out = fileURLToPath(new URL("../test/fixtures/stability.json", import.meta.url));
writeFileSync(out, `${JSON.stringify({ version: 1, cases: sorted }, null, 2)}\n`);
console.log(`wrote ${Object.keys(sorted).length} cases to ${out}`);

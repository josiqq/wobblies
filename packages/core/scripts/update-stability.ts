import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createAvatar } from "../src/index";
import {
  BACKGROUND_LIST,
  hashSvg,
  MOOD_LIST,
  OPTION_MATRIX,
  OPTION_NAMES,
  optionsKey,
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

const options: Record<string, string> = {};
for (const name of OPTION_NAMES) {
  for (const opts of OPTION_MATRIX) {
    options[optionsKey(name, opts)] = hashSvg(createAvatar(name, opts).svg);
  }
}

const sortKeys = (o: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

const fixture = { version: 1, cases: sortKeys(cases), options: sortKeys(options) };
const out = fileURLToPath(new URL("../test/fixtures/stability.json", import.meta.url));
writeFileSync(out, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(
  `wrote ${Object.keys(fixture.cases).length} cases and ${Object.keys(fixture.options).length} option cases to ${out}`,
);

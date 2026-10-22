// Removes MDX-only lines (component imports and island tags) from the generated llms*.txt files.
// starlight-llms-txt reads raw page sources, which include these lines; they are noise for LLMs
// and could be mistaken for part of the Wobblies API. Lines inside fenced code blocks are kept.
import { readdir, readFile, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const MDX_IMPORT =
  /^import\s.+\sfrom\s+["'](@astrojs\/starlight\/components|\.{1,2}\/[^"']*)["'];?\s*$/;
const ISLAND_TAG = /^<[A-Z][\w.]*(\s[^>]*)?\/>\s*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;

function clean(text) {
  let fence = null;
  const kept = [];
  for (const line of text.split("\n")) {
    const match = line.match(FENCE);
    if (match) {
      const marker = match[1];
      if (fence === null) fence = marker[0].repeat(marker.length);
      else if (marker.startsWith(fence)) fence = null;
      kept.push(line);
    } else if (fence !== null || !(MDX_IMPORT.test(line) || ISLAND_TAG.test(line))) {
      kept.push(line);
    }
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}

const files = (await readdir(dist)).filter((f) => /^llms.*\.txt$/.test(f));
for (const file of files) {
  const url = new URL(file, dist);
  await writeFile(url, clean(await readFile(url, "utf8")));
}
console.log(`clean-llms: cleaned ${files.length} file(s)`);

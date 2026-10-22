import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAvatar, MOODS, SHAPES } from "@wobblies/core";

const ROWS = 3;
const COLS = 12;
const CELL = 72;
const GAP = 12;
const NAMES = [
  "Ana",
  "Bruno",
  "Chloe",
  "Dmitri",
  "Eun-ji",
  "Farid",
  "Greta",
  "Hiro",
  "Ines",
  "Jamal",
  "Kai",
  "Lena",
  "Mateo",
  "Nia",
  "Omar",
  "Priya",
  "Quentin",
  "Rosa",
  "Sven",
  "Tavita",
  "Uma",
  "Viktor",
  "Wen",
  "Ximena",
  "Yara",
  "Zane",
  "Aiko",
  "Bao",
  "Carmen",
  "Dara",
  "Elif",
  "Finn",
  "Gus",
  "Hana",
  "Ivo",
  "Juno",
];

const width = COLS * CELL + (COLS - 1) * GAP;
const height = ROWS * CELL + (ROWS - 1) * GAP;

const cells: string[] = [];
for (let i = 0; i < ROWS * COLS; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const { svg } = createAvatar(NAMES[i] ?? `wobbly-${i}`, {
    traits: { shape: SHAPES[i % SHAPES.length] },
    mood: MOODS[(i * 5 + row) % MOODS.length],
    background: "none",
  });
  const x = col * (CELL + GAP);
  const y = row * (CELL + GAP);
  cells.push(svg.replace("<svg ", `<svg x="${x}" y="${y}" width="${CELL}" height="${CELL}" `));
}

const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="A gallery of Wobblies avatars">${cells.join("")}</svg>\n`;

const target = resolve(dirname(fileURLToPath(import.meta.url)), "../assets/gallery.svg");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out);
console.log(`Wrote ${target} (${out.length} bytes)`);

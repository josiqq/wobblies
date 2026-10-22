// Writes ANIMATIONS_CSS to dist/animations.css (run by tsup after each build).
import { writeFile } from "node:fs/promises";
import { ANIMATIONS_CSS } from "../dist/index.js";

await writeFile(new URL("../dist/animations.css", import.meta.url), ANIMATIONS_CSS);

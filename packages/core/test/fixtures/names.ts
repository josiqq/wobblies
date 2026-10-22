import { createHash } from "node:crypto";
import type { AvatarOptions } from "../../src/index";

const HAND_PICKED: string[] = [
  "",
  "   ",
  "@ana",
  "@@Ana ",
  "ana",
  "ÁNGEL",
  "José",
  "Zoë",
  "François",
  "Łukasz",
  "Øyvind",
  "李小龙",
  "さくら",
  "김민준",
  "Алексей",
  "محمد",
  "🦊 fox",
  "👩🏽‍💻",
  "a".repeat(200),
  "john.doe@example.com",
  "+54 9 11 5555-0000",
  "O'Brien",
  "<script>",
  "tab\tname",
  "Bruno",
  "Carla",
  "Diego",
  "Elena",
  "Facundo",
  "Gabriela",
  "Hugo",
  "Isabel",
  "Julián",
  "Karen",
  "Lucía",
  "Mateo",
  "Natalia",
  "Olivia",
  "Pablo",
  "Quentin",
];

export const STABILITY_NAMES: readonly string[] = [
  ...HAND_PICKED,
  ...Array.from({ length: 160 }, (_, i) => `user${i}`),
];

export const SNAPSHOT_NAMES: readonly string[] = [
  "ana",
  "José",
  "李小龙",
  "🦊 fox",
  ...Array.from({ length: 8 }, (_, i) => `user${i}`),
];

/** Names for the option-matrix fixture (a cross-section of the corpus). */
export const OPTION_NAMES: readonly string[] = ["", "ana", "José", "李小龙", "🦊 fox", "user0"];

/** Option sets frozen by the option-matrix fixture, one per non-default output path. */
export const OPTION_MATRIX: readonly AvatarOptions[] = [
  { animated: true },
  { size: 64 },
  { title: "Ana" },
  { traits: { shape: "sun", hue: 0.3 } },
  { palette: { bg: "#ffffff" } },
];

/** Option-matrix key: name, "|", then the options as JSON (neither part contains "|"). */
export const optionsKey = (name: string, options: AvatarOptions): string =>
  `${name}|${JSON.stringify(options)}`;

export const MOOD_LIST = ["idle", "happy", "sad", "mad"] as const;
export const BACKGROUND_LIST = ["circle", "squircle", "square", "none"] as const;

export const hashSvg = (svg: string): string =>
  createHash("sha256").update(svg).digest("hex").slice(0, 16);

export const stabilityKey = (name: string, mood: string, background: string): string =>
  `${name}|${mood}|${background}`;

/** Lowercase ASCII file-name slug: NFD, strip combining marks, non-alphanumerics to "-". */
export const slug = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

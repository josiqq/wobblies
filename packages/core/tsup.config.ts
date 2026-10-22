import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/internal.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  onSuccess: "node scripts/emit-css.mjs",
});

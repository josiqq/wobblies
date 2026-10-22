import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLlmsTxt from "starlight-llms-txt";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";

const [coreApi, coreApiSidebar] = createStarlightTypeDocPlugin();
const [reactApi, reactApiSidebar] = createStarlightTypeDocPlugin();
const [nativeApi, nativeApiSidebar] = createStarlightTypeDocPlugin();

export default defineConfig({
  site: "https://josiqq.github.io",
  base: "/wobblies",
  integrations: [
    react(),
    starlight({
      title: "Wobblies",
      description:
        "Friendly, deterministic default avatars as SVG for the web, Node and React Native.",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/josiqq/wobblies" }],
      editLink: { baseUrl: "https://github.com/josiqq/wobblies/edit/main/apps/docs/" },
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "text/plain",
            href: "/wobblies/llms.txt",
            title: "Wobblies docs for LLMs",
          },
        },
      ],
      plugins: [
        starlightLlmsTxt({
          projectName: "Wobblies",
          // The plugin can't render React islands (Demo, Gallery, Playground), so it reads
          // each page's Markdown source instead of the rendered HTML.
          rawContent: true,
          description:
            "Wobblies generates friendly, deterministic default avatars as SVG from a name. The same name always produces the same avatar.",
          details: [
            "Key facts for writing correct code:",
            "",
            '- Packages: `@wobblies/core` (zero-dependency SVG strings, data URIs and a render tree; Node, browsers, workers, edge), `@wobblies/react` (`<Wobbly />` for React DOM, SSR and Server Components, no `"use client"` needed) and `@wobblies/react-native` (`<Wobbly />` built on `react-native-svg`).',
            "- Core API: `createAvatar(name, { mood, background, size, title, animated, palette, traits })` returns `{ svg, nodes, rootAttrs, palette, shape }`; `toDataUri(svg)` turns the string into a `data:` URI for `<img src>`.",
            '- `mood` is `"idle" | "happy" | "sad" | "mad"`. `background` is `"circle" | "squircle" | "square" | "none"`.',
            '- `traits.shape` is a shape name (`"round" | "organic" | "boxy" | "nub" | "cloud" | "sun"`), never a number. The other traits (`hue`, `tone`, `eyeGap`, `eyeSize`, `gaze`) are numbers in [0, 1); non-finite values are ignored and others are clamped.',
            '- Names are normalized before hashing: Unicode NFC, trim, strip leading `@`, lowercase. `"@Ana "` and `"ana"` give the same avatar.',
            '- Animations are web-only and need `import "@wobblies/core/animations.css"` plus `animated`. React Native has no animations.',
            '- React `Wobbly` sets its size only through `size` (no `width`/`height`/`viewBox` props). `decorative` hides it from assistive technology; otherwise it is labelled with `title`, then `name`, then "Avatar".',
            "- React Native `Wobbly` defaults to `size` 40 and needs `react-native-svg` installed (`npx expo install react-native-svg` on Expo).",
          ].join("\n"),
          optionalLinks: [
            {
              label: "GitHub repository",
              url: "https://github.com/josiqq/wobblies",
              description: "Source code, issues, changelogs and contributing guide.",
            },
          ],
          promote: ["index*", "getting-started/**", "guides/**"],
          demote: ["api/**"],
          exclude: ["api/**", "playground"],
        }),

        coreApi({
          entryPoints: ["../../packages/core/src/index.ts"],
          tsconfig: "../../packages/core/tsconfig.json",
          output: "api/core",
          typeDoc: { entryFileName: "index" },
          sidebar: { label: "@wobblies/core", collapsed: true },
        }),
        reactApi({
          entryPoints: ["../../packages/react/src/index.ts"],
          tsconfig: "../../packages/react/tsconfig.json",
          output: "api/react",
          typeDoc: { entryFileName: "index" },
          sidebar: { label: "@wobblies/react", collapsed: true },
        }),
        nativeApi({
          entryPoints: ["../../packages/react-native/src/index.ts"],
          tsconfig: "../../packages/react-native/tsconfig.json",
          output: "api/react-native",
          typeDoc: { entryFileName: "index" },
          sidebar: { label: "@wobblies/react-native", collapsed: true },
        }),
      ],
      sidebar: [
        { label: "Getting started", items: [{ autogenerate: { directory: "getting-started" } }] },
        { label: "Guides", items: [{ autogenerate: { directory: "guides" } }] },
        { label: "Recipes", items: [{ autogenerate: { directory: "recipes" } }] },
        { label: "Concepts", items: [{ autogenerate: { directory: "concepts" } }] },
        { label: "API reference", items: [coreApiSidebar, reactApiSidebar, nativeApiSidebar] },
        { label: "Playground", link: "/playground/" },
      ],
    }),
  ],
});

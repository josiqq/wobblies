import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
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
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/josiqq/wobblies" }],
      editLink: { baseUrl: "https://github.com/josiqq/wobblies/edit/main/apps/docs/" },
      customCss: ["./src/styles/custom.css"],
      plugins: [
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
        // Task 9 adds: Guides (guides/), Recipes (recipes/), Concepts (concepts/)
        // as `autogenerate` groups, in that order, before API reference.
        { label: "API reference", items: [coreApiSidebar, reactApiSidebar, nativeApiSidebar] },
        // Task 10 adds: { label: "Playground", link: "/playground/" }
      ],
    }),
  ],
});

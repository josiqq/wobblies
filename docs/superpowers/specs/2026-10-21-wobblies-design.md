# Wobblies — Design Spec

- **Date:** 2026-10-21
- **Status:** Approved in brainstorming, pending written-spec review
- **Origin:** draft engine at `~/Escritorio/avatars-generator` (TypeScript, Vite playground)

## 1. Goal

Wobblies is an open-source library that generates **deterministic default avatars** from a
name: friendly blob-like creatures with pill-shaped eyes, several body shapes, moods and an
accessible OKLCH palette. The same input name always yields the same avatar.

It must work in any JavaScript environment (browser, Node, edge runtimes, React Native) and
ship first-class components for React (DOM) and React Native. The first consumer is an Expo
app, but nothing in the library is specific to it.

### Success criteria

1. `npm i @wobblies/core` (or `@wobblies/react` / `@wobblies/react-native`) works out of the
   box in a Vite/Next.js web app, in Node, and in an Expo app.
2. The React Native component renders smoothly in long virtualized lists (FlashList/FlatList)
   without parsing XML at render time.
3. A newcomer can go from zero to a rendered avatar on any supported platform using only the
   docs site, in under five minutes.
4. The public API and the visual output for a given name are guarded against accidental
   changes by CI.

### Non-goals (v0.x)

- Animations in React Native.
- Vue, Svelte, Angular or Web Component adapters (the core's SVG string covers them; recipes
  may be added later).
- PNG/raster export inside the published packages (provided as a documented recipe).
- Integration into any specific consumer app.

### Language

All project artifacts — code, comments, docs, READMEs, commit messages, changelogs — are in
**English**.

## 2. Repository structure

Repository: `github.com/josiqq/wobblies`, local path `~/Escritorio/wobblies`.

```
wobblies/
├── packages/
│   ├── core/            @wobblies/core          zero dependencies
│   ├── react/           @wobblies/react         peers: react >=18
│   └── react-native/    @wobblies/react-native  peers: react, react-native, react-native-svg >=13
├── apps/
│   ├── docs/            Astro Starlight docs site + playground (private)
│   └── expo-example/    minimal Expo app exercising the RN adapter (private)
├── assets/              generated gallery SVG for the README
├── scripts/             gallery generation, maintenance scripts
├── .changeset/
├── .github/
│   ├── workflows/       ci.yml, release.yml, docs.yml
│   ├── ISSUE_TEMPLATE/  bug_report.yml, feature_request.yml
│   └── pull_request_template.md
├── biome.json
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md  SECURITY.md  LICENSE (MIT)
```

### Tooling

| Concern            | Tool                                                        |
| ------------------ | ----------------------------------------------------------- |
| Package manager    | pnpm workspaces                                             |
| Task orchestration | Turborepo                                                   |
| Language           | TypeScript, `strict: true`, shared `tsconfig.base.json`     |
| Build              | tsup → ESM + CJS + `.d.ts` per package                      |
| Lint & format      | Biome                                                       |
| Tests              | vitest (core, react); Jest + `jest-expo` (react-native)     |
| Package validation | publint, `@arethetypeswrong/cli`                            |
| Public API guard   | API Extractor (`*.api.md` report committed per package)     |
| Bundle budget      | size-limit (core < 6 kB min+gzip)                           |
| Versioning         | Changesets, **fixed** mode (all three packages share a version) |

### npm

- Scope `@wobblies` is owned by npm user `wobblies` (verified on 2026-10-21).
- All packages are public, MIT-licensed, published with `--provenance`.
- Each package declares `exports`, `types`, `sideEffects` (`false`, except the CSS file),
  `files`, `repository`, `homepage`, `keywords`, `engines`.

## 3. `@wobblies/core`

Pure TypeScript, no dependencies, no DOM access. Ported from the draft's `src/engine`
(`hash`, `color`, `geometry`, `layout`, `moods`, `render`), with the public surface redesigned.

### Public API

```ts
import { createAvatar, toDataUri, ANIMATIONS_CSS, SHAPES, MOODS } from "@wobblies/core";

const avatar = createAvatar("Ana López", {
  mood: "happy",            // Mood = "idle" | "happy" | "sad" | "mad"      (default "idle")
  background: "circle",     // Background = "circle" | "squircle" | "square" | "none" (default "circle")
  size: 64,                 // width/height attributes; omitted → fluid SVG
  title: "Ana López",       // accessible <title>, escaped
  animated: false,          // adds CSS class hooks for blink/breathe (web only)
  palette: { bg: "#fff" },  // Partial<Palette> color override
  traits: { hue: 0.6, shape: "cloud" }, // TraitOverrides
});

avatar.svg;      // string
avatar.nodes;    // SvgNode[] — primitive render tree (see below)
avatar.palette;  // Palette { bg: string; body: string; eye: string } (hex)
avatar.shape;    // Shape

toDataUri(avatar.svg); // "data:image/svg+xml;charset=utf-8,..."
```

Exported types: `AvatarOptions`, `Avatar`, `Mood`, `Shape`, `Background`, `Palette`,
`TraitOverrides`, `SvgNode`.

Exported constants: `SHAPES` and `MOODS` (readonly tuples), `ANIMATIONS_CSS` (string).

### Trait overrides

```ts
interface TraitOverrides {
  shape?: Shape;   // force a body shape
  hue?: number;    // [0, 1) → 0–360°
  tone?: number;   // [0, 1) → pastel / chalk / fresh / vivid / neon / dark family
  eyeGap?: number; // [0, 1)
  eyeSize?: number;// [0, 1)
  gaze?: number;   // [0, 1) horizontal gaze
}
```

Public names map onto internal trait keys (`shape` → shape band midpoint, `eyeGap` →
`"eye.gap"`, `eyeSize` → `"eye.scale"`, `gaze` → `"gaze.x"`). Internal keys are private and
may change in any release. Out-of-range numbers are clamped to `[0, 1)`.

### Render tree

```ts
type SvgNode =
  | { tag: "svg" | "g"; attrs: Record<string, string>; children: SvgNode[] }
  | { tag: "path" | "circle"; attrs: Record<string, string> }
  | { tag: "title"; text: string };
```

`createAvatar` builds `nodes` first; `svg` is produced by a single serializer from that tree.
The tree contains drawing primitives only — no semantic geometry (no "left eye" objects) — so
it can be public without freezing the internal layout model. Animation hooks are expressed as
`class` attributes in the tree.

### Name normalization (contract)

`NFC` → `trim` → strip leading `@` characters → lowercase. `"@Ana "` and `"ana"` produce the
same avatar. Empty input after normalization is valid and produces a fixed avatar.

### Animations

`@wobblies/core/animations.css` (and the identical `ANIMATIONS_CSS` string) defines blink,
breathe and look animations keyed on the classes emitted when `animated: true`. It respects
`prefers-reduced-motion`.

### Internal subpath

`@wobblies/core/internal` exposes `layout`, `createTraits` and trait-key helpers for the
playground. It is explicitly documented as **unstable and excluded from semver** and from the
API Extractor report.

### Removed from the draft

- `layout` field on the returned avatar (moved to `/internal`).
- `overrides: Record<string, number>` (replaced by typed `traits`).
- `background: false` (replaced by `"none"`).
- `export.ts` PNG/grid/download helpers (become a docs recipe and playground code).

## 4. `@wobblies/react`

```tsx
import { Wobbly } from "@wobblies/react";
import "@wobblies/core/animations.css"; // only when using `animated`

<Wobbly name="Ana" size={40} mood="happy" background="circle" animated className="avatar" />
```

- Props: all `AvatarOptions` + `name` + `decorative?: boolean` + standard SVG props
  (`className`, `style`, event handlers) forwarded to the root `<svg>`; `ref` forwarded.
- Renders real React elements from `avatar.nodes` — no `dangerouslySetInnerHTML` (CSP-safe,
  SSR/RSC-safe).
- Accessibility: `role="img"` + `aria-label={title ?? name}` by default; `decorative` switches
  to `aria-hidden="true"` and omits the title.
- No effects or browser APIs; works in `renderToString` and React Server Components.
- Output computed with `useMemo` keyed on the props that affect the avatar.
- Peer: `react >= 18`. Depends on `@wobblies/core` (same fixed version).

## 5. `@wobblies/react-native`

```tsx
import { Wobbly } from "@wobblies/react-native";

<Wobbly name="Ana" size={40} />
```

- Maps `avatar.nodes` to `react-native-svg` components (`Svg`, `G`, `Path`, `Circle`). No XML
  parsing at render time.
- Props: `AvatarOptions` except `animated`, plus `name`, `size` (default 40), `style`,
  `accessibilityLabel` (default `title ?? name`), `decorative`.
- `accessibilityRole="image"` by default; `decorative` hides it from accessibility.
- Wrapped in `React.memo` for list performance.
- Works on iOS, Android and Expo Web.
- Peers: `react >= 18`, `react-native >= 0.72`, `react-native-svg >= 13`.

## 6. Stability contract

1. **Visual stability:** for a given normalized name and options, the SVG output is stable
   within a major version. Any change to it is a breaking change.
2. **Guard:** snapshot tests over a fixed corpus of ~200 names (ASCII, accented, emoji, CJK,
   whitespace-only, empty) × all moods × all backgrounds. A changed snapshot requires a major
   changeset; this rule is documented in `CONTRIBUTING.md` and the PR template.
3. **API stability:** API Extractor reports (`packages/*/etc/*.api.md`) are committed; CI fails
   if a report is out of date, so every public API change is visible in review.
4. **Pre-1.0:** releases start at `0.1.0`. Breaking changes are allowed in minor bumps during
   0.x; the visual and API contracts freeze at `1.0.0`.

## 7. Documentation

### Docs site (`apps/docs`, Astro Starlight)

Deployed to GitHub Pages at `https://josiqq.github.io/wobblies`. Live demos and the playground
are React islands built on `@wobblies/react`, so the docs exercise the real package.

```
Getting started
  Introduction          what it is, gallery, when to use it
  Installation          per-platform tabs (core / React / React Native / Expo)
  Quick start           first avatar in three lines per platform
Guides
  React                 SSR, Next.js / RSC, accessibility, animations
  React Native & Expo   react-native-svg setup, virtualized lists, Expo Web
  Vanilla & server      <img> via data URI, Node / edge (Open Graph images, emails), plain HTML
Recipes
  Profile photo fallback
  Exporting PNG         canvas-based recipe (ported from the draft's export.ts)
  Avatar groups         overlapping stacks
  Theming & dark mode   palette overrides, background: "none"
  Animations            CSS hooks, prefers-reduced-motion
Concepts
  Determinism & stability
  Name normalization
  Color & accessibility OKLCH, gamut mapping, WCAG contrast guarantees
  How it works          shapes, traits, moods, with diagrams
API reference           generated from TSDoc (starlight-typedoc)
Playground              port of the draft editor: name, seed, shape, mood, traits, export
```

### In-repo documentation

- **Root `README.md`:** generated gallery hero (`assets/gallery.svg`, produced by
  `pnpm gallery`), badges (npm version, CI, bundle size, license), per-platform quick start,
  package table, links to docs, contributing and license.
- **Per-package `README.md`:** install, minimal usage, props/options table, link to docs. This
  is what npmjs.com shows.
- **`CONTRIBUTING.md`:** prerequisites, setup, scripts, repo layout, changesets workflow,
  stability rule, API report workflow, commit style (Conventional Commits).
- **`CODE_OF_CONDUCT.md`:** Contributor Covenant 2.1.
- **`SECURITY.md`:** private vulnerability reporting via GitHub Security Advisories.
- **`LICENSE`:** MIT.
- **Templates:** issue forms (bug report with platform/version fields, feature request) and a
  PR template with a checklist (changeset, tests, API report, snapshot impact).
- **TSDoc:** required on every public export, with `@example` on `createAvatar`, `toDataUri`
  and both `Wobbly` components. Source of the API reference.
- **`CHANGELOG.md`:** generated per package by changesets.

### Example app (`apps/expo-example`)

Minimal Expo app with a FlashList of 200 `Wobbly` avatars and a mood/background switcher.
Used to verify the RN adapter manually and to capture screenshots for the docs. Not published.

## 8. Testing

| Package        | Runner | Coverage                                                                                          |
| -------------- | ------ | ------------------------------------------------------------------------------------------------- |
| core           | vitest | determinism, normalization, trait ranges and clamping, typed overrides, every shape reachable, eye/body contrast ≥ 4.5, figure inside canvas, title escaping, `svg === serialize(nodes)`, stability snapshots |
| react          | vitest + Testing Library | markup matches core output, a11y attributes, `decorative`, ref forwarding, `renderToString` |
| react-native   | Jest + `jest-expo` + RN Testing Library | correct `Svg/G/Path/Circle` tree, a11y props, memoization |

## 9. CI/CD

- **`ci.yml`** (pull requests and pushes to `main`; Node 20 and 22): pnpm install (cached) →
  `biome check` → `typecheck` → `test` → `build` → publint + attw → size-limit → API
  Extractor check → docs build.
- **`release.yml`** (push to `main`): changesets action opens/updates the "Version Packages"
  PR; merging it publishes to npm with provenance (GitHub OIDC, `id-token: write`).
- **`docs.yml`** (push to `main`): builds `apps/docs` and deploys to GitHub Pages.

### Manual steps (owner)

1. Create the GitHub repository `josiqq/wobblies` (public).
2. Create an npm granular access token with publish rights for `@wobblies/*` and store it as
   the `NPM_TOKEN` repository secret.
3. Enable GitHub Pages with source "GitHub Actions".

## 10. Open questions

None at time of writing.

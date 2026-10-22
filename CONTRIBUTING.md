# Contributing to Wobblies

Thanks for helping out! This guide covers setup, the everyday workflow and the one rule that matters most: avatars must stay stable.

## Prerequisites

- Node 24 (see `.nvmrc`)
- pnpm 11, via corepack: `corepack enable`

## Setup

```sh
git clone https://github.com/josiqq/wobblies.git
cd wobblies
corepack enable
pnpm install
pnpm build
```

## Scripts

Run these from the repository root.

| Script               | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `pnpm build`         | Builds every package and app through Turborepo.                      |
| `pnpm test`          | Runs all test suites.                                                |
| `pnpm typecheck`     | Type-checks every package.                                           |
| `pnpm lint`          | Runs Biome checks.                                                   |
| `pnpm lint:fix`      | Runs Biome and applies fixes.                                        |
| `pnpm api:check`     | Verifies the public API against the committed API Extractor reports. |
| `pnpm api:update`    | Regenerates the API reports after an intentional API change.         |
| `pnpm size`          | Checks the bundle-size budget.                                       |
| `pnpm check:exports` | Validates the package `exports` maps.                                |
| `pnpm changeset`     | Creates a changeset.                                                 |
| `pnpm release`       | Builds the packages and publishes them (maintainers, run by CI).     |
| `pnpm gallery`       | Regenerates `assets/gallery.svg` used in the README.                 |

## Repository layout

```text
packages/core          @wobblies/core, the SVG generator
packages/react         @wobblies/react
packages/react-native  @wobblies/react-native
apps/docs              Documentation site and playground (Astro Starlight)
apps/expo-example      Example Expo app
scripts/               Repository tooling (gallery generator)
assets/                Generated assets for the README
.changeset/            Pending changesets
```

API Extractor reports live in `packages/*/etc/*.api.md`.

## Changesets

Every change that affects a published package needs a changeset:

```sh
pnpm changeset
```

Pick the affected packages and a bump type, and write a one-line summary. The three packages are released in fixed mode: they always share the same version. Commit the generated file in `.changeset/` with your change.

## The stability rule

The core promise of Wobblies is that the same input gives the same avatar. That is enforced by `packages/core/test/fixtures/stability.json` and the SVG snapshots in `packages/core/test/__snapshots__/`.
- Do not change `stability.json` or the SVG snapshots unless you mean to change what existing names look like.
- If you do, the change requires a **`major`** changeset.
- Regenerate the fixtures only on purpose, with `pnpm --filter @wobblies/core stability:update`, and review the diff carefully.

## API reports

If you change the public API of a package, run:

```sh
pnpm api:update
```

and commit the updated `packages/*/etc/*.api.md` files. CI runs `pnpm api:check` and fails when the reports are out of date.

## Commits

We use [Conventional Commits](https://www.conventionalcommits.org/), for example:

```text
feat(core): add a new body shape
fix(react): forward refs to the root svg
docs: clarify the React Native setup
```

## Code of Conduct

By participating you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

# @wobblies/core

Friendly, deterministic default avatars as SVG — zero dependencies, works everywhere.

The same name always produces the same avatar. The package never touches the DOM, so it runs in Node, browsers, workers and edge runtimes.

## Install

```sh
npm install @wobblies/core
```

## Usage

```ts
import { createAvatar } from "@wobblies/core";

const { svg } = createAvatar("Ana López", { mood: "happy", size: 64 });
document.querySelector("#avatar").innerHTML = svg;
```

Use `toDataUri(svg)` to get a `data:` URI for `<img src>` or CSS `url()`.

## Options

`createAvatar(name, options?)` accepts these optional fields:

| Option       | Type                                           | Default    | Description                                                                                                                                  |
| ------------ | ---------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `mood`       | `"idle" \| "happy" \| "sad" \| "mad"`          | `"idle"`   | Facial expression.                                                                                                                           |
| `background` | `"circle" \| "squircle" \| "square" \| "none"` | `"circle"` | Shape drawn behind the figure. `"none"` is transparent.                                                                                      |
| `size`       | `number`                                       | omitted    | `width`/`height` in pixels. Omitted or not a positive finite number gives a fluid SVG.                                                       |
| `title`      | `string`                                       | omitted    | Accessible `<title>` text (escaped).                                                                                                         |
| `animated`   | `boolean`                                      | `false`    | Adds CSS class hooks for blink, breathe and look animations. Pair with `ANIMATIONS_CSS` or `@wobblies/core/animations.css`.                  |
| `palette`    | `Partial<{ bg; body; eye }>`                   | derived    | CSS colour overrides; colours you leave out are derived from the name. Passed through unvalidated.                                           |
| `traits`     | `TraitOverrides`                               | derived    | Overrides for `shape`, `hue`, `tone`, `eyeGap`, `eyeSize` and `gaze`. Non-finite numbers are ignored; others are clamped to `[0, 0.999999]`. |

The result also exposes `nodes` (a primitive SVG render tree), `rootAttrs`, `palette` and `shape`, which UI adapters build on.

## Other platforms

- [`@wobblies/react`](https://www.npmjs.com/package/@wobblies/react) — React components
- [`@wobblies/react-native`](https://www.npmjs.com/package/@wobblies/react-native) — React Native components

## Documentation

Full docs: <https://josiqq.github.io/wobblies>

## License

MIT © josiqq

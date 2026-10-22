# @wobblies/react

React component for Wobblies — friendly, deterministic default avatars.

The same name always produces the same avatar. The component renders real React `<svg>` elements (no `dangerouslySetInnerHTML`), so it works with SSR and React Server Components.

## Install

```sh
npm install @wobblies/react
```

Requires `react >=18`.

## Usage

```tsx
import { Wobbly } from "@wobblies/react";

export function UserAvatar({ user }) {
  return <Wobbly name={user.name} mood="happy" size={48} />;
}
```

## Props

| Prop         | Type                                           | Default    | Description                                                                 |
| ------------ | ---------------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `name`       | `string`                                       | —          | Seed for the avatar. Required.                                              |
| `mood`       | `"idle" \| "happy" \| "sad" \| "mad"`          | `"idle"`   | Facial expression.                                                          |
| `background` | `"circle" \| "squircle" \| "square" \| "none"` | `"circle"` | Background shape.                                                           |
| `size`       | `number`                                       | fluid      | `width`/`height` in pixels. Omit for a fluid SVG.                           |
| `title`      | `string`                                       | —          | Accessible title; also used as `aria-label`.                                |
| `animated`   | `boolean`                                      | `false`    | Adds animation class hooks (see below).                                     |
| `palette`    | `Partial<{ bg, body, eye }>`                   | derived    | Colour overrides.                                                           |
| `traits`     | `TraitOverrides`                               | derived    | Overrides for name-derived traits.                                          |
| `decorative` | `boolean`                                      | `false`    | Hides the avatar from assistive technology (`aria-hidden`, no title/label). |

`width`, `height`, `viewBox` and `xmlns` are not accepted; use `size`. Any other props (`className`, `style`, `onClick`, `data-*`, …) are passed to the root `<svg>`, and a `ref` receives the `SVGSVGElement`.

## Animations

Set `animated` and import the stylesheet once:

```ts
import "@wobblies/core/animations.css";
```

## Next.js and React Server Components

`Wobbly` uses no hooks that require a client boundary beyond `useMemo`, no browser APIs and no effects, so it renders on the server. If your setup requires it, import it from a file marked `"use client"`.

## Documentation

https://josiqq.github.io/wobblies

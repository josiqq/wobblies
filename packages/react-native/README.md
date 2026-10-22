# @wobblies/react-native

React Native component for Wobblies — friendly, deterministic default avatars.

The same name always produces the same avatar. The component maps the avatar's render tree directly to `react-native-svg` elements (no SVG string parsing), so it works in Expo and bare React Native apps.

## Install

```sh
# Expo
npx expo install react-native-svg
npm install @wobblies/react-native

# Bare React Native
npm install @wobblies/react-native react-native-svg
```

Requires `react >=18`, `react-native >=0.72` and `react-native-svg >=13`.

## Usage

```tsx
import { Wobbly } from "@wobblies/react-native";

export function UserAvatar({ user }) {
  return <Wobbly name={user.name} mood="happy" size={48} />;
}
```

## Props

| Prop                 | Type                                           | Default         | Description                                                             |
| -------------------- | ---------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| `name`               | `string`                                       | —               | Seed for the avatar. Required.                                          |
| `mood`               | `"idle" \| "happy" \| "sad" \| "mad"`          | `"idle"`        | Facial expression.                                                      |
| `background`         | `"circle" \| "squircle" \| "square" \| "none"` | `"circle"`      | Background shape.                                                       |
| `size`               | `number`                                       | `40`            | Width and height in dp. Invalid values (`0`, negative, `NaN`) use `40`. |
| `title`              | `string`                                       | —               | Used as the default accessibility label.                                |
| `palette`            | `Partial<{ bg, body, eye }>`                   | derived         | Colour overrides.                                                       |
| `traits`             | `TraitOverrides`                               | derived         | Overrides for name-derived traits.                                      |
| `style`              | `StyleProp<ViewStyle>`                         | —               | Style for the root view.                                                |
| `accessibilityLabel` | `string`                                       | `title ?? name` | Screen-reader label. Overrides `title`.                                 |
| `decorative`         | `boolean`                                      | `false`         | Hides the avatar from assistive technology next to a visible name.      |
| `testID`             | `string`                                       | —               | Test identifier for the root view.                                      |

`animated` is not supported on React Native.

## Performance in lists

`Wobbly` is wrapped in `React.memo` and memoizes the generated avatar per `name`, `mood`, `background`, `palette` and `traits`. In `FlatList` rows, pass stable references for `palette`, `traits` and `style` (define them outside the render function or memoize them) so rows do not re-render needlessly.

## Compatibility

Ships ESM and CJS with TypeScript types, and a `react-native` entry pointing to the ESM build.

## Documentation

https://josiqq.github.io/wobblies

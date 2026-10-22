# expo-example

Private Expo (SDK 58) app that renders a `FlashList` of 200 Wobblies with `@wobblies/react-native`,
to verify the React Native adapter end to end.

```sh
pnpm install
pnpm turbo run build --filter=@wobblies/react-native   # builds the workspace packages first
pnpm --filter expo-example start
```

Use the header buttons to switch mood and background, and tap a row to preview it at 160 px.

import { type AvatarOptions, createAvatar, type SvgNode } from "@wobblies/core";
import { createElement, memo, type NamedExoticComponent, type ReactNode, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const DEFAULT_SIZE = 40;

/** Props for {@link Wobbly}. */
export type WobblyProps = Omit<AvatarOptions, "animated" | "size"> & {
  /** Seed for the avatar. The same name always produces the same avatar. */
  name: string;
  /** Width and height in dp. Defaults to `40`; invalid values (`0`, negative, `NaN`) also fall back to `40`. */
  size?: number;
  /** Style applied to the root `Svg` view. */
  style?: StyleProp<ViewStyle>;
  /** Screen-reader label. Defaults to `title ?? name`, or `"Avatar"` for an empty name. Ignored when `decorative` is set. */
  accessibilityLabel?: string;
  /** Hide the avatar from assistive technology (e.g. next to the person's visible name). */
  decorative?: boolean;
  /** Test identifier forwarded to the root view. */
  testID?: string;
};

/** Drops web-only attributes that have no meaning on react-native-svg components. */
function toNativeAttrs(attrs: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(attrs)) {
    if (key !== "class" && key !== "xmlns") out[key] = attrs[key] as string;
  }
  return out;
}

function renderNode(node: SvgNode, key: number): ReactNode {
  switch (node.tag) {
    case "title":
      return null;
    case "path":
      return createElement(Path, { key, ...toNativeAttrs(node.attrs) });
    case "circle":
      return createElement(Circle, { key, ...toNativeAttrs(node.attrs) });
    case "g":
      return createElement(
        G,
        { key, ...toNativeAttrs(node.attrs) },
        ...node.children.map(renderNode),
      );
    case "svg":
      return createElement(
        Svg,
        { key, ...toNativeAttrs(node.attrs) },
        ...node.children.map(renderNode),
      );
  }
}

function WobblyImpl({
  name,
  mood,
  background,
  title,
  palette,
  traits,
  size,
  style,
  accessibilityLabel,
  decorative,
  testID,
}: WobblyProps) {
  const avatar = useMemo(
    () => createAvatar(name, { mood, background, palette, traits }),
    [name, mood, background, palette, traits],
  );

  const dimension =
    typeof size === "number" && Number.isFinite(size) && size > 0 ? size : DEFAULT_SIZE;
  const a11y = decorative
    ? { accessible: false, importantForAccessibility: "no-hide-descendants" as const }
    : {
        accessible: true,
        accessibilityRole: "image" as const,
        accessibilityLabel: accessibilityLabel ?? title ?? (String(name ?? "") || "Avatar"),
      };

  return createElement(
    Svg,
    {
      viewBox: avatar.rootAttrs.viewBox,
      width: dimension,
      height: dimension,
      style,
      testID,
      ...a11y,
    },
    ...avatar.nodes.map(renderNode),
  );
}

/**
 * Renders a deterministic Wobbly avatar with `react-native-svg`.
 *
 * Memoized, so it is cheap to use in long lists.
 *
 * @example
 * ```tsx
 * import { Wobbly } from "@wobblies/react-native";
 *
 * <Wobbly name="Ana López" mood="happy" size={48} />
 * ```
 */
export const Wobbly: NamedExoticComponent<WobblyProps> = memo(WobblyImpl);
Wobbly.displayName = "Wobbly";

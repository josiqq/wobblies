import { type AvatarOptions, createAvatar, type SvgNode } from "@wobblies/core";
import { createElement, forwardRef, type ReactNode, type SVGProps, useMemo } from "react";

/**
 * Props for {@link Wobbly}. Extra props are forwarded to the root `<svg>` element.
 * `width`, `height`, `viewBox` and `xmlns` are not accepted: use `size` for dimensions.
 */
export type WobblyProps = Omit<AvatarOptions, "size"> & {
  /** Seed for the avatar. The same name always produces the same avatar. */
  name: string;
  /** `width`/`height` in pixels. Omitted (or not a positive finite number) → fluid SVG. */
  size?: number;
  /** Hide the avatar from assistive technology (e.g. next to the person's visible name). */
  decorative?: boolean;
} & Omit<
    SVGProps<SVGSVGElement>,
    keyof AvatarOptions | "name" | "ref" | "children" | "width" | "height" | "viewBox" | "xmlns"
  >;

function toReactAttrs(attrs: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(attrs)) {
    out[key === "class" ? "className" : key] = attrs[key] as string;
  }
  return out;
}

function renderNode(node: SvgNode, key: number): ReactNode {
  if (node.tag === "title") return createElement("title", { key }, node.text);
  const props = { key, ...toReactAttrs(node.attrs) };
  if (node.tag === "g" || node.tag === "svg") {
    return createElement(node.tag, props, ...node.children.map(renderNode));
  }
  return createElement(node.tag, props);
}

/**
 * Renders a deterministic Wobbly avatar as an inline `<svg>`.
 *
 * @example
 * ```tsx
 * import { Wobbly } from "@wobblies/react";
 *
 * <Wobbly name="Ana López" mood="happy" size={48} />
 * ```
 */
export const Wobbly = forwardRef<SVGSVGElement, WobblyProps>(function Wobbly(
  {
    name,
    mood,
    background,
    size,
    title,
    animated,
    palette,
    traits,
    decorative,
    className,
    ...rest
  },
  ref,
) {
  const avatar = useMemo(
    () =>
      createAvatar(name, {
        mood,
        background,
        size,
        title: decorative ? undefined : title,
        animated,
        palette,
        traits,
      }),
    [name, mood, background, size, title, decorative, animated, palette, traits],
  );

  const { class: rootClass, ...rootAttrs } = avatar.rootAttrs;
  const classes = [rootClass, className].filter(Boolean).join(" ");
  const { role: _role, "aria-label": _label, ...restNoA11y } = rest;
  const a11yProps = decorative
    ? { ...restNoA11y, "aria-hidden": true as const }
    : { role: "img", "aria-label": title ?? String(name ?? ""), ...rest };

  return createElement(
    "svg",
    {
      ...a11yProps,
      ...rootAttrs,
      className: classes || undefined,
      ref,
    },
    ...avatar.nodes.map(renderNode),
  );
});

Wobbly.displayName = "Wobbly";

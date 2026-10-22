/**
 * Deterministic default avatars as SVG. Zero dependencies; never touches the DOM.
 * @packageDocumentation
 */
export { ANIMATIONS_CSS } from "./animations";
export {
  type Avatar,
  type AvatarOptions,
  type Background,
  createAvatar,
  toDataUri,
} from "./avatar";
export type { Palette } from "./color";
export { SHAPES, type Shape } from "./layout";
export { MOODS, type Mood } from "./moods";
export type { SvgNode } from "./nodes";
export type { TraitOverrides } from "./traits";

/**
 * A node of the primitive SVG render tree produced by `createAvatar`.
 *
 * The tree holds drawing primitives only (no semantic geometry), so adapters can map it onto
 * their own SVG elements. Attribute values are unescaped strings in their output order.
 */
export type SvgNode =
  | { tag: "svg" | "g"; attrs: Record<string, string>; children: SvgNode[] }
  | { tag: "path" | "circle"; attrs: Record<string, string> }
  | { tag: "title"; text: string };

const ATTR_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/** Escapes `& < > "` for use inside a double-quoted attribute value. */
export const escapeAttr = (s: string): string => s.replace(/[&<>"]/g, (c) => ATTR_ESCAPES[c]);

/** Escapes `& < >` for use as element text content. */
export const escapeText = (s: string): string => s.replace(/[&<>]/g, (c) => ATTR_ESCAPES[c]);

function attrsToString(attrs: Record<string, string>): string {
  let out = "";
  for (const key of Object.keys(attrs)) out += ` ${key}="${escapeAttr(String(attrs[key]))}"`;
  return out;
}

function serializeNode(node: SvgNode): string {
  if (node.tag === "title") return `<title>${escapeText(node.text)}</title>`;
  const open = `<${node.tag}${attrsToString(node.attrs)}`;
  if (!("children" in node) || node.children.length === 0) return `${open}/>`;
  return `${open}>${node.children.map(serializeNode).join("")}</${node.tag}>`;
}

/** Serializes a root `<svg>` (its attributes and children) to a string. */
export function serialize(rootAttrs: Record<string, string>, nodes: SvgNode[]): string {
  return serializeNode({ tag: "svg", attrs: rootAttrs, children: nodes });
}

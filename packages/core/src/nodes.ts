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

/**
 * Characters that are not allowed anywhere in an XML 1.0 document: C0 controls other than
 * tab, line feed and carriage return; U+FFFE / U+FFFF; and lone (unpaired) surrogates, which the
 * `u` flag exposes as `\p{Cs}` code points (a valid surrogate pair is one non-`Cs` code point).
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching control characters is the point.
const XML_INVALID = /[\0-\x08\v\f\x0E-\x1F\uFFFE\uFFFF]|\p{Cs}/gu;

/** Replaces XML-invalid characters with U+FFFD so the SVG stays well-formed (and encodable). */
const sanitize = (s: string): string => s.replace(XML_INVALID, "\uFFFD");

/**
 * Escapes `& < > "` for use inside a double-quoted attribute value. XML-invalid characters
 * (lone surrogates, most C0 controls, U+FFFE/U+FFFF) become U+FFFD.
 */
export const escapeAttr = (s: string): string =>
  sanitize(s).replace(/[&<>"]/g, (c) => ATTR_ESCAPES[c]);

/**
 * Escapes `& < >` for use as element text content. XML-invalid characters (lone surrogates,
 * most C0 controls, U+FFFE/U+FFFF) become U+FFFD.
 */
export const escapeText = (s: string): string =>
  sanitize(s).replace(/[&<>]/g, (c) => ATTR_ESCAPES[c]);

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

import { render as rtlRender } from "@testing-library/react-native";
import { createAvatar, type SvgNode } from "@wobblies/core";
import type { TestInstance } from "test-renderer";
import { Wobbly } from "../src";

// Spy on the root <Svg> element's props (the host component only exposes derived props),
// while still rendering the real react-native-svg implementation.
const svgProps: Array<Record<string, unknown>> = [];
jest.mock("react-native-svg", () => {
  const React = require("react");
  const actual = jest.requireActual("react-native-svg");
  const Svg = (props: Record<string, unknown>) => {
    svgProps.push(props);
    return React.createElement(actual.default, props);
  };
  return { __esModule: true, ...actual, default: Svg };
});

function leaves(nodes: SvgNode[]): SvgNode[] {
  return nodes.flatMap((n) => {
    if (n.tag === "g" || n.tag === "svg") return leaves(n.children);
    return n.tag === "title" ? [] : [n];
  });
}

let view: Awaited<ReturnType<typeof rtlRender>>;
async function render(element: React.ReactElement) {
  view = await rtlRender(element);
}
function root() {
  return view.root as NonNullable<typeof view.root>;
}
function allHosts(predicate: (n: TestInstance) => boolean) {
  const r = root();
  return [r, ...r.queryAll(predicate)].filter(predicate);
}
function hostNodes(type: string) {
  return allHosts((n) => n.type === type);
}

beforeEach(() => {
  svgProps.length = 0;
});

describe("Wobbly (react-native)", () => {
  it("renders one Svg with Path/Circle elements matching the core nodes in order", async () => {
    await render(<Wobbly name="ana" />);
    const expected = leaves(createAvatar("ana").nodes);
    const expectedShapes = expected.filter((n) => n.tag === "path" || n.tag === "circle");
    expect(expectedShapes.length).toBeGreaterThan(0);

    expect(hostNodes("RNSVGSvgView")).toHaveLength(1);
    const shapes = allHosts((n) => n.type === "RNSVGPath" || n.type === "RNSVGCircle");
    expect(shapes).toHaveLength(expectedShapes.length);
    shapes.forEach((shape, i) => {
      const node = expectedShapes[i] as Extract<SvgNode, { tag: "path" | "circle" }>;
      if (node.tag === "path") {
        expect(shape.type).toBe("RNSVGPath");
        expect(shape.props.d).toBe(node.attrs.d);
      } else {
        expect(shape.type).toBe("RNSVGCircle");
        expect(String(shape.props.cx)).toBe(node.attrs.cx);
        expect(String(shape.props.cy)).toBe(node.attrs.cy);
        expect(String(shape.props.r)).toBe(node.attrs.r);
      }
    });
  });

  it("defaults to 40x40 with the core viewBox", async () => {
    await render(<Wobbly name="ana" />);
    const root = svgProps[0];
    expect(root?.width).toBe(40);
    expect(root?.height).toBe(40);
    expect(root?.viewBox).toBe("0 0 100 100");
  });

  it("honours a valid size", async () => {
    await render(<Wobbly name="ana" size={24} />);
    expect(svgProps[0]?.width).toBe(24);
    expect(svgProps[0]?.height).toBe(24);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "falls back to 40 for invalid size %p",
    async (size) => {
      await render(<Wobbly name="ana" size={size} />);
      expect(svgProps[0]?.width).toBe(40);
      expect(svgProps[0]?.height).toBe(40);
    },
  );

  it("is an accessible image labelled with the name by default", async () => {
    await render(<Wobbly name="ana" />);
    const host = hostNodes("RNSVGSvgView")[0];
    expect(host?.props.accessibilityRole).toBe("image");
    expect(host?.props.accessibilityLabel).toBe("ana");
  });

  it('labels an empty name "Avatar"', async () => {
    await render(<Wobbly name="" />);
    expect(hostNodes("RNSVGSvgView")[0]?.props.accessibilityLabel).toBe("Avatar");
  });

  it("uses title, and accessibilityLabel overrides it", async () => {
    await render(<Wobbly name="ana" title="Ana L." />);
    expect(hostNodes("RNSVGSvgView")[0]?.props.accessibilityLabel).toBe("Ana L.");
    await view.rerender(<Wobbly name="ana" title="Ana L." accessibilityLabel="Profile picture" />);
    expect(hostNodes("RNSVGSvgView")[0]?.props.accessibilityLabel).toBe("Profile picture");
  });

  it("hides the avatar from assistive technology when decorative", async () => {
    await render(<Wobbly name="ana" decorative accessibilityLabel="ignored" />);
    const host = hostNodes("RNSVGSvgView")[0];
    expect(host?.props.accessible).toBe(false);
    expect(host?.props.importantForAccessibility).toBe("no-hide-descendants");
    expect(host?.props.accessibilityLabel).toBeUndefined();
    expect(host?.props.accessibilityRole).toBeUndefined();
  });

  it("renders no title element and passes no class prop", async () => {
    await render(<Wobbly name="ana" title="Ana" />);
    expect(allHosts((n) => String(n.type).toLowerCase().includes("title"))).toHaveLength(0);
    expect(allHosts((n) => "class" in n.props || "className" in n.props)).toHaveLength(0);
  });

  it("does not throw for a missing name", async () => {
    await render(<Wobbly name={undefined as unknown as string} />);
    expect(hostNodes("RNSVGSvgView")).toHaveLength(1);
  });

  it("is a memo component", () => {
    expect((Wobbly as unknown as { $$typeof: symbol }).$$typeof).toBe(Symbol.for("react.memo"));
    expect(Wobbly.displayName).toBe("Wobbly");
  });
});

import { cleanup, fireEvent, render } from "@testing-library/react";
import { createAvatar, type SvgNode } from "@wobblies/core";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Wobbly } from "../src";

afterEach(cleanup);

function pathData(nodes: SvgNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.tag === "path") out.push(n.attrs.d as string);
    else if (n.tag === "g" || n.tag === "svg") out.push(...pathData(n.children));
  }
  return out;
}

describe("Wobbly", () => {
  it("renders the core render tree", () => {
    const { container } = render(<Wobbly name="ana" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const ds = [...container.querySelectorAll("path")].map((p) => p.getAttribute("d"));
    expect(ds).toEqual(pathData(createAvatar("ana").nodes));
    expect(ds.length).toBeGreaterThan(0);
  });

  it("has accessible defaults", () => {
    const { container } = render(<Wobbly name="ana" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    expect(svg?.getAttribute("aria-label")).toBe("ana");
  });

  it("uses title for label and a <title> child", () => {
    const { container } = render(<Wobbly name="ana" title="Ana López" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-label")).toBe("Ana López");
    expect(svg?.querySelector("title")?.textContent).toBe("Ana López");
  });

  it("hides decorative avatars", () => {
    const { container } = render(<Wobbly name="ana" title="Ana" decorative />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.hasAttribute("role")).toBe(false);
    expect(svg?.hasAttribute("aria-label")).toBe(false);
    expect(svg?.querySelector("title")).toBeNull();
  });

  it("applies size", () => {
    const { container } = render(<Wobbly name="ana" size={40} />);
    expect(container.querySelector("svg")?.getAttribute("width")).toBe("40");
  });

  it("forwards className, style, onClick and data attributes", () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <Wobbly
        name="ana"
        className="mine"
        style={{ opacity: 0.5 }}
        onClick={onClick}
        data-testid="w"
      />,
    );
    const svg = getByTestId("w");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.getAttribute("class")).toBe("mine");
    expect((svg as unknown as SVGSVGElement).style.opacity).toBe("0.5");
    fireEvent.click(svg);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges wobbly-root with className when animated", () => {
    const { container } = render(<Wobbly name="ana" animated className="mine" />);
    const cls = container.querySelector("svg")?.getAttribute("class")?.split(" ");
    expect(cls).toContain("wobbly-root");
    expect(cls).toContain("mine");
  });

  it("forwards the ref", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Wobbly name="ana" ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it("does not throw when name is undefined", () => {
    expect(() => render(<Wobbly name={undefined as unknown as string} />)).not.toThrow();
  });
});

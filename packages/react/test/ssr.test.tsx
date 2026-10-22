// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { Wobbly } from "../src";

it("renders to a string on the server", () => {
  expect(typeof window).toBe("undefined");
  const html = renderToString(<Wobbly name="ana" />);
  expect(html).toContain("<svg");
  expect(html).not.toContain("dangerouslySetInnerHTML");
});

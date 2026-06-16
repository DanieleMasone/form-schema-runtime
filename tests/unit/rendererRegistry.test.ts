import { describe, expect, it } from "vitest";
import { createRendererRegistry } from "../../src/renderer/rendererRegistry";
import type { FieldRenderer } from "../../src";

describe("rendererRegistry", () => {
  it("registers and retrieves custom field renderers", () => {
    const renderer: FieldRenderer = () => document.createElement("div");
    const registry = createRendererRegistry();

    registry.register("money", renderer);

    expect(registry.get("money")).toBe(renderer);
  });
});

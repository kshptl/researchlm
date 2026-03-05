import { describe, expect, it } from "vitest";

describe("workspace performance budget smoke", () => {
  it("keeps synthetic node update loop within budget", () => {
    const start = performance.now();
    const nodes = Array.from({ length: 500 }, (_, index) => ({
      id: index,
      value: `Node ${index}`,
    }));
    const mapped = nodes.map((node) => ({
      ...node,
      value: `${node.value} updated`,
    }));
    const elapsed = performance.now() - start;
    expect(mapped).toHaveLength(500);
    expect(elapsed).toBeLessThan(200);
  });
});

import { describe, expect, it } from "vitest";
import { extractTextToNode } from "@/features/graph-model/text-extraction";

describe("canvas operations", () => {
  it("creates a linked node from selected text", () => {
    const source = {
      id: "n1",
      workspaceId: "w1",
      canvasId: "c1",
      type: "generated" as const,
      content: "Generated content",
      position: { x: 10, y: 20 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const node = extractTextToNode(source, "  key phrase  ");
    expect(node.content).toBe("key phrase");
    expect(node.sourceNodeId).toBe("n1");
    expect(node.canvasId).toBe("c1");
  });
});

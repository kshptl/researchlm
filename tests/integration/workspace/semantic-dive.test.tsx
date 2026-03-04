import { describe, expect, it } from "vitest"
import { semanticDiveFromNode } from "@/features/hierarchy-model/semantic-dive"

describe("semantic dive", () => {
  it("creates a child canvas and hierarchy link", () => {
    const currentCanvas = {
      id: "c1",
      workspaceId: "w1",
      topic: "Root",
      depth: 0,
      createdAt: "",
      updatedAt: ""
    }

    const node = {
      id: "n1",
      workspaceId: "w1",
      canvasId: "c1",
      type: "topic" as const,
      content: "Transportation",
      position: { x: 0, y: 0 },
      createdAt: "",
      updatedAt: ""
    }

    const result = semanticDiveFromNode(node, currentCanvas)
    expect(result.canvas.parentCanvasId).toBe("c1")
    expect(result.link.childCanvasId).toBe(result.canvas.id)
  })
})

import { describe, expect, it } from "vitest"
import { deleteBranch } from "@/features/hierarchy-model/branch-delete"
import { wouldCreateCycle } from "@/features/hierarchy-model/state"

describe("hierarchy rules", () => {
  it("detects a cycle", () => {
    const cycle = wouldCreateCycle(
      [
        {
          id: "h1",
          workspaceId: "w1",
          parentCanvasId: "c1",
          childCanvasId: "c2",
          linkType: "subtopic",
          createdAt: new Date().toISOString()
        }
      ],
      "c2",
      "c1"
    )
    expect(cycle).toBe(true)
  })

  it("deletes descendants", () => {
    const result = deleteBranch(
      [
        { id: "c1", workspaceId: "w1", topic: "A", depth: 0, createdAt: "", updatedAt: "" },
        { id: "c2", workspaceId: "w1", topic: "B", parentCanvasId: "c1", depth: 1, createdAt: "", updatedAt: "" }
      ],
      [
        {
          id: "h1",
          workspaceId: "w1",
          parentCanvasId: "c1",
          childCanvasId: "c2",
          linkType: "subtopic",
          createdAt: ""
        }
      ],
      "c1"
    )

    expect(result.canvases).toHaveLength(0)
  })
})

import { describe, expect, it } from "vitest"
import { exportWorkspaceBackup, importWorkspaceBackup } from "@/features/persistence/workspace-backup"

describe("workspace hydration", () => {
  it("serializes and restores backup payload", () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      workspace: {
        id: "w1",
        title: "Workspace",
        rootCanvasId: "c1",
        activeCanvasId: "c1",
        version: 1,
        createdAt: "",
        updatedAt: ""
      },
      canvases: [],
      nodes: [],
      connections: [],
      hierarchyLinks: []
    }

    const hydrated = importWorkspaceBackup(exportWorkspaceBackup(backup))
    expect(hydrated.workspace.id).toBe("w1")
  })
})

import type { Canvas, Connection, GraphNode, HierarchyLink, Workspace } from "@/features/graph-model/types"

export interface WorkspaceBackup {
  version: number
  exportedAt: string
  workspace: Workspace
  canvases: Canvas[]
  nodes: GraphNode[]
  connections: Connection[]
  hierarchyLinks: HierarchyLink[]
}

export function exportWorkspaceBackup(backup: WorkspaceBackup): string {
  return JSON.stringify(backup)
}

export function importWorkspaceBackup(serialized: string): WorkspaceBackup {
  const parsed = JSON.parse(serialized) as WorkspaceBackup
  if (!parsed.workspace?.id) {
    throw new Error("Invalid backup payload")
  }
  return parsed
}

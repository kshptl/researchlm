import type { Canvas, GraphNode, HierarchyLink } from "@/features/graph-model/types"
import { createChildCanvas } from "@/features/hierarchy-model/state"

export function semanticDiveFromNode(node: GraphNode, currentCanvas: Canvas): { canvas: Canvas; link: HierarchyLink } {
  const child = createChildCanvas(currentCanvas, node.content)
  const link: HierarchyLink = {
    id: crypto.randomUUID(),
    workspaceId: currentCanvas.workspaceId,
    parentCanvasId: currentCanvas.id,
    childCanvasId: child.id,
    linkType: "subtopic",
    createdAt: new Date().toISOString()
  }

  return { canvas: child, link }
}

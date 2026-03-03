import type { Canvas, HierarchyLink } from "@/features/graph-model/types"

export function collectDescendants(links: HierarchyLink[], rootId: string): Set<string> {
  const collected = new Set<string>([rootId])
  let changed = true

  while (changed) {
    changed = false
    for (const link of links) {
      if (collected.has(link.parentCanvasId) && !collected.has(link.childCanvasId)) {
        collected.add(link.childCanvasId)
        changed = true
      }
    }
  }

  return collected
}

export function deleteBranch(canvases: Canvas[], links: HierarchyLink[], rootId: string) {
  const removeIds = collectDescendants(links, rootId)
  return {
    canvases: canvases.filter((canvas) => !removeIds.has(canvas.id)),
    links: links.filter((link) => !removeIds.has(link.parentCanvasId) && !removeIds.has(link.childCanvasId))
  }
}

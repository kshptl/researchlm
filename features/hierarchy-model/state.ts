import type { Canvas, HierarchyLink } from "@/features/graph-model/types"

export interface HierarchyState {
  canvases: Canvas[]
  links: HierarchyLink[]
}

export function createChildCanvas(parent: Canvas, topic: string): Canvas {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    workspaceId: parent.workspaceId,
    topic,
    parentCanvasId: parent.id,
    depth: parent.depth + 1,
    createdAt: now,
    updatedAt: now
  }
}

export function wouldCreateCycle(links: HierarchyLink[], parentCanvasId: string, childCanvasId: string): boolean {
  if (parentCanvasId === childCanvasId) {
    return true
  }

  const adjacency = new Map<string, string[]>()
  for (const link of links) {
    const list = adjacency.get(link.parentCanvasId) ?? []
    list.push(link.childCanvasId)
    adjacency.set(link.parentCanvasId, list)
  }

  adjacency.set(parentCanvasId, [...(adjacency.get(parentCanvasId) ?? []), childCanvasId])

  const seen = new Set<string>()
  const stack: string[] = [childCanvasId]

  while (stack.length) {
    const current = stack.pop()!
    if (current === parentCanvasId) {
      return true
    }
    if (seen.has(current)) {
      continue
    }
    seen.add(current)
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next)
    }
  }

  return false
}

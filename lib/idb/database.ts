import type { Canvas, Connection, GraphNode, HierarchyLink, Workspace } from "@/features/graph-model/types"

export const DB_NAME = "sensecape"
export const DB_VERSION = 1

type Stores = {
  workspaces: Workspace
  canvases: Canvas
  nodes: GraphNode
  connections: Connection
  hierarchyLinks: HierarchyLink
  settings: { id: string; value: unknown }
}

const STORE_NAMES: Array<keyof Stores> = [
  "workspaces",
  "canvases",
  "nodes",
  "connections",
  "hierarchyLinks",
  "settings"
]

export async function openDatabase(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      for (const store of STORE_NAMES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

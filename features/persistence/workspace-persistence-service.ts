import type { Workspace } from "@/features/graph-model/types"
import { persistenceRepository } from "@/features/persistence/repository"

const STORE = "workspaces"

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  await persistenceRepository.putRecord(STORE, workspace)
}

export async function loadWorkspace(id: string): Promise<Workspace | undefined> {
  return await persistenceRepository.getRecord<Workspace>(STORE, id)
}

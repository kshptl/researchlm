import type { SemanticViewState } from "@/features/generation/types"
import { persistenceRepository } from "@/features/persistence/repository"

const STORE = "settings"

export async function saveSemanticViewState(state: SemanticViewState): Promise<void> {
  await persistenceRepository.putRecord(STORE, {
    id: `semantic:${state.workspaceId}:${state.canvasId}`,
    value: state
  })
}

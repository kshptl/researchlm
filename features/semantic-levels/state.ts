import type { SemanticLevel } from "@/features/graph-model/types"

export interface SemanticState {
  mode: "auto" | "manual"
  level: SemanticLevel
}

export function levelFromZoom(zoom: number): SemanticLevel {
  if (zoom < 0.35) {
    return "keywords"
  }
  if (zoom < 0.55) {
    return "summary"
  }
  if (zoom < 0.75) {
    return "lines"
  }
  return "all"
}

export function resolveSemanticLevel(state: SemanticState, zoom: number): SemanticLevel {
  return state.mode === "manual" ? state.level : levelFromZoom(zoom)
}

import type { SemanticLevel } from "@/features/graph-model/types"

export function representationForLevel(content: string, level: SemanticLevel): string {
  const normalized = content.trim()
  if (level === "all") {
    return normalized
  }

  if (level === "lines") {
    return normalized
      .split(/\n+/)
      .map((line) => line.split(" ").slice(0, 6).join(" "))
      .join("\n")
  }

  if (level === "summary") {
    return normalized.split(" ").slice(0, 20).join(" ")
  }

  return normalized
    .split(/\W+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(", ")
}

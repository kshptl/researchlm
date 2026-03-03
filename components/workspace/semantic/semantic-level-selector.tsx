"use client"

import React from "react"
import type { SemanticLevel } from "@/features/graph-model/types"

type Props = {
  mode: "auto" | "manual"
  level: SemanticLevel
  onModeChange: (mode: "auto" | "manual") => void
  onLevelChange: (level: SemanticLevel) => void
}

const levels: SemanticLevel[] = ["all", "lines", "summary", "keywords"]

export function SemanticLevelSelector({ mode, level, onModeChange, onLevelChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => onModeChange("auto")}>
        Auto
      </button>
      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => onModeChange("manual")}>
        Manual
      </button>
      {mode === "manual"
        ? levels.map((semanticLevel) => (
            <button
              key={semanticLevel}
              type="button"
              className={`rounded border px-2 py-1 text-xs ${semanticLevel === level ? "bg-sky-100" : "bg-white"}`}
              onClick={() => onLevelChange(semanticLevel)}
            >
              {semanticLevel}
            </button>
          ))
        : null}
    </div>
  )
}

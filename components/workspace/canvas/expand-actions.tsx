"use client"

import React from "react"
import type { GenerationIntent } from "@/features/generation/types"

type Props = {
  disabled?: boolean
  onSelect: (intent: GenerationIntent) => void
}

const actions: Array<{ intent: GenerationIntent; label: string }> = [
  { intent: "prompt", label: "Prompt" },
  { intent: "explain", label: "Explain" },
  { intent: "questions", label: "Questions" },
  { intent: "subtopics", label: "Subtopics" }
]

export function ExpandActions({ disabled, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.intent}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action.intent)}
          className="rounded-md border border-[hsl(var(--border))] px-3 py-1 text-xs font-medium disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

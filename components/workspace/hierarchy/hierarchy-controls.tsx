"use client"

import React from "react"

type Props = {
  onAddBroadTopic: () => void
  onAddSubtopic: () => void
  onAddSibling: () => void
}

export function HierarchyControls({ onAddBroadTopic, onAddSubtopic, onAddSibling }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={onAddBroadTopic}>
        Broad topic
      </button>
      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={onAddSubtopic}>
        Subtopic
      </button>
      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={onAddSibling}>
        Sibling
      </button>
    </div>
  )
}

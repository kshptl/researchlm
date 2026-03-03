"use client"

import React from "react"

type Props = {
  status: "idle" | "saving" | "error"
  onRetry: () => void
}

export function PersistenceStatus({ status, onRetry }: Props) {
  if (status === "idle") {
    return <p className="text-xs text-slate-500">Local persistence ready</p>
  }

  if (status === "saving") {
    return <p className="text-xs text-slate-500">Saving workspace...</p>
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-red-600">Failed to save workspace</p>
      <button type="button" onClick={onRetry} className="rounded border px-2 py-1 text-xs">
        Retry
      </button>
    </div>
  )
}

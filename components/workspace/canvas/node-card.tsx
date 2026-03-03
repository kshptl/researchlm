"use client"

import React from "react"
import { useState } from "react"

type Props = {
  id: string
  content: string
  onChange: (id: string, content: string) => void
}

export function NodeCard({ id, content, onChange }: Props) {
  const [value, setValue] = useState(content)

  return (
    <article className="w-72 rounded-md border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
      <textarea
        className="h-24 w-full resize-none border-none bg-transparent text-sm outline-none"
        value={value}
        onChange={(event) => {
          const next = event.target.value
          setValue(next)
          onChange(id, next)
        }}
      />
    </article>
  )
}

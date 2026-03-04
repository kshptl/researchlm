"use client"

import React, { useState } from "react"

type Props = {
  onSubmit: (prompt: string) => void
  disabled?: boolean
  modelOptions?: Array<{ value: string; label: string }>
  selectedModelValue?: string
  onSelectModel?: (value: string) => void
}

export function CentralPromptBar({ onSubmit, disabled, modelOptions = [], selectedModelValue, onSelectModel }: Props) {
  const [value, setValue] = useState("")

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-[520px] max-w-[90vw]">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl">
          <p className="mb-2 text-sm font-medium text-slate-500">What would you like to explore?</p>
          {modelOptions.length > 0 && onSelectModel ? (
            <label className="mb-2 block text-xs text-slate-500">
              Model
              <select
                className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                value={selectedModelValue}
                onChange={(event) => onSelectModel(event.target.value)}
                disabled={disabled}
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const trimmed = value.trim()
              if (trimmed && !disabled) {
                onSubmit(trimmed)
                setValue("")
              }
            }}
          >
            <input
              autoFocus
              className="w-full text-lg outline-none placeholder:text-slate-300"
              placeholder="Type a topic or question..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={disabled}
            />
            <p className="mt-2 text-xs text-slate-400">Press Enter to start exploring</p>
          </form>
        </div>
      </div>
    </div>
  )
}

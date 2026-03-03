"use client"

import React, { useState } from "react"

type Props = {
  onSave: (value: { provider: string; type: "api-key" | "oauth"; credential: string }) => void
}

export function ProviderCredentialsForm({ onSave }: Props) {
  const [provider, setProvider] = useState("openai")
  const [type, setType] = useState<"api-key" | "oauth">("api-key")
  const [credential, setCredential] = useState("")

  return (
    <form
      className="space-y-2 rounded-md border border-[hsl(var(--border))] p-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ provider, type, credential })
      }}
    >
      <p className="text-xs font-semibold">Provider Credentials (BYOK)</p>
      <select value={provider} onChange={(event) => setProvider(event.target.value)} className="w-full rounded border p-1 text-xs">
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="gemini">Gemini</option>
        <option value="openrouter">OpenRouter</option>
        <option value="github-models">GitHub Models</option>
      </select>
      <select
        value={type}
        onChange={(event) => setType(event.target.value as "api-key" | "oauth")}
        className="w-full rounded border p-1 text-xs"
      >
        <option value="api-key">API key</option>
        <option value="oauth">OAuth token</option>
      </select>
      <input
        type="password"
        value={credential}
        onChange={(event) => setCredential(event.target.value)}
        className="w-full rounded border p-1 text-xs"
        placeholder="Enter provider credential"
      />
      <button type="submit" className="rounded border px-2 py-1 text-xs">
        Save credential
      </button>
    </form>
  )
}

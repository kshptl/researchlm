"use client"

import { useCallback, useState } from "react"
import type { GenerationIntent, GenerationRequest } from "@/features/generation/types"

type Options = {
  provider: GenerationRequest["provider"]
  model: string
  credential: string
}

export function useGeneration({ provider, model, credential }: Options) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string>()

  const runIntent = useCallback(
    async (intent: GenerationIntent, prompt: string): Promise<string> => {
      setError(undefined)
      setIsStreaming(true)

      try {
        const response = await fetch("/api/llm/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            model,
            intent,
            messages: [{ role: "user", content: prompt }],
            auth: { type: "api-key", credential }
          } satisfies GenerationRequest)
        })

        if (!response.ok || !response.body) {
          throw new Error("Unable to stream model response")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let text = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          text += decoder.decode(value, { stream: true })
        }

        return text
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown generation error"
        setError(message)
        throw err
      } finally {
        setIsStreaming(false)
      }
    },
    [credential, model, provider]
  )

  return {
    isStreaming,
    error,
    runIntent
  }
}

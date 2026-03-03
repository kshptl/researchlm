import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"

async function* streamGemini(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  yield { type: "start", data: { requestId: crypto.randomUUID(), provider: "gemini", model: request.model } }
  yield { type: "delta", data: { text: `Gemini response for: ${request.messages.at(-1)?.content ?? ""}` } }
  yield { type: "done", data: { finishReason: "stop" } }
}

export const geminiAdapter: ProviderAdapter = {
  name: "gemini",
  capabilities: { supportsTools: true, supportsJsonMode: false, supportsVision: true },
  stream: streamGemini
}

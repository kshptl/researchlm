import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"

async function* streamOpenRouter(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  yield { type: "start", data: { requestId: crypto.randomUUID(), provider: "openrouter", model: request.model } }
  yield { type: "delta", data: { text: `OpenRouter response for: ${request.messages.at(-1)?.content ?? ""}` } }
  yield { type: "done", data: { finishReason: "stop" } }
}

export const openRouterAdapter: ProviderAdapter = {
  name: "openrouter",
  capabilities: { supportsTools: true, supportsJsonMode: true, supportsVision: true },
  stream: streamOpenRouter
}

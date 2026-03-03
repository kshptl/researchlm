import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"

async function* streamAnthropic(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  yield {
    type: "start",
    data: { requestId: crypto.randomUUID(), provider: "anthropic", model: request.model, intent: request.intent }
  }
  yield { type: "delta", data: { text: `Anthropic response for: ${request.messages.at(-1)?.content ?? ""}` } }
  yield { type: "done", data: { finishReason: "stop" } }
}

export const anthropicAdapter: ProviderAdapter = {
  name: "anthropic",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: true,
    supportsVision: true
  },
  stream: streamAnthropic
}

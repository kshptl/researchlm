import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"

async function* streamOpenAi(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  yield {
    type: "start",
    data: { requestId: crypto.randomUUID(), provider: "openai", model: request.model, intent: request.intent }
  }
  yield { type: "delta", data: { text: `OpenAI response for: ${request.messages.at(-1)?.content ?? ""}` } }
  yield { type: "done", data: { finishReason: "stop" } }
}

export const openAiAdapter: ProviderAdapter = {
  name: "openai",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: true,
    supportsVision: true
  },
  stream: streamOpenAi
}

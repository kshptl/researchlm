import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"

async function* streamGitHubModels(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  yield { type: "start", data: { requestId: crypto.randomUUID(), provider: "github-models", model: request.model } }
  yield { type: "delta", data: { text: `GitHub Models response for: ${request.messages.at(-1)?.content ?? ""}` } }
  yield { type: "done", data: { finishReason: "stop" } }
}

export const githubModelsAdapter: ProviderAdapter = {
  name: "github-models",
  capabilities: { supportsTools: true, supportsJsonMode: true, supportsVision: false },
  stream: streamGitHubModels
}

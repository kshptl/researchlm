import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"
import { extractApiKeyFromAuth } from "@/lib/providers/auth"
import { parseSseDataLines } from "@/lib/providers/sse-parser"
import { joinProviderUrl } from "@/lib/providers/url"

async function* streamGitHubCopilot(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  const requestId = crypto.randomUUID()
  yield { type: "start", data: { requestId, provider: "github-copilot", model: request.model, intent: request.intent } }

  const token = request.auth.type === "oauth" ? request.auth.refresh || request.auth.access : extractApiKeyFromAuth(request)
  if (!token) {
    yield { type: "error", data: { message: "Missing GitHub Copilot credential" } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  const baseUrl = request.providerConfig?.apiBaseUrl ?? "https://api.githubcopilot.com"
  const endpoint = joinProviderUrl(baseUrl, "chat/completions")
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Openai-Intent": "conversation-edits",
      "x-initiator": "user",
      "User-Agent": "researchlm/0.1.0",
    },
    body: JSON.stringify({
      model: request.model,
      stream: true,
      messages: request.messages.map((message) => ({
        role: message.role === "tool" ? "user" : message.role,
        content: message.content,
      })),
    }),
  })

  if (!response.ok || !response.body) {
    const message = response.body ? await response.text() : "GitHub Copilot stream is unavailable"
    yield { type: "error", data: { message } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  for await (const chunk of parseSseDataLines(response.body)) {
    try {
      const parsed = JSON.parse(chunk) as {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>
      }
      const text = parsed.choices?.[0]?.delta?.content
      if (text) {
        yield { type: "delta", data: { text } }
      }
      if (parsed.choices?.[0]?.finish_reason) {
        yield { type: "done", data: { finishReason: parsed.choices[0].finish_reason } }
        return
      }
    } catch {
      continue
    }
  }

  yield { type: "done", data: { finishReason: "stop" } }
}

export const githubCopilotAdapter: ProviderAdapter = {
  name: "github-copilot",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: true,
    supportsVision: true,
  },
  stream: streamGitHubCopilot,
}

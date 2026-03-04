import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"
import { extractApiKeyFromAuth } from "@/lib/providers/auth"
import { parseSseDataLines } from "@/lib/providers/sse-parser"
import { joinProviderUrl } from "@/lib/providers/url"

function toOpenAiMessages(request: GenerationRequest): Array<{ role: string; content: string }> {
  return request.messages.map((message) => ({
    role: message.role === "tool" ? "user" : message.role,
    content: message.content,
  }))
}

async function* streamOpenAi(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  const requestId = crypto.randomUUID()
  yield {
    type: "start",
    data: { requestId, provider: request.provider, model: request.model, intent: request.intent },
  }

  const token = extractApiKeyFromAuth(request)
  if (!token) {
    yield { type: "error", data: { message: "Missing provider credential" } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  const baseUrl = request.providerConfig?.apiBaseUrl ?? "https://api.openai.com/v1"
  const endpoint = joinProviderUrl(baseUrl, "chat/completions")

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })
  if (request.auth.type === "oauth" && request.auth.accountId) {
    headers.set("ChatGPT-Account-Id", request.auth.accountId)
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: request.model,
      messages: toOpenAiMessages(request),
      stream: true,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    yield { type: "error", data: { message: body || `OpenAI request failed (${response.status})` } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  if (!response.body) {
    yield { type: "error", data: { message: "Provider did not return a stream body" } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  for await (const chunk of parseSseDataLines(response.body)) {
    try {
      const parsed = JSON.parse(chunk) as {
        choices?: Array<{
          delta?: { content?: string }
          finish_reason?: string | null
        }>
        usage?: {
          prompt_tokens?: number
          completion_tokens?: number
        }
      }

      const delta = parsed.choices?.[0]?.delta?.content
      if (delta) {
        yield { type: "delta", data: { text: delta } }
      }

      if (parsed.usage) {
        yield {
          type: "usage",
          data: {
            inputTokens: parsed.usage.prompt_tokens,
            outputTokens: parsed.usage.completion_tokens,
          },
        }
      }

      const finishReason = parsed.choices?.[0]?.finish_reason
      if (finishReason) {
        yield { type: "done", data: { finishReason } }
        return
      }
    } catch {
      continue
    }
  }

  yield { type: "done", data: { finishReason: "stop" } }
}

export const openAiAdapter: ProviderAdapter = {
  name: "openai",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: true,
    supportsVision: true,
  },
  stream: streamOpenAi,
}

import type { GenerationRequest } from "@/features/generation/types"
import type { NormalizedStreamEvent, ProviderAdapter } from "@/lib/providers/adapter-types"
import { parseSseDataLines } from "@/lib/providers/sse-parser"
import { joinProviderUrl } from "@/lib/providers/url"

function toAnthropicMessages(request: GenerationRequest): Array<{ role: "user" | "assistant"; content: string }> {
  return request.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }))
}

async function* streamAnthropic(request: GenerationRequest): AsyncGenerator<NormalizedStreamEvent, void, void> {
  const requestId = crypto.randomUUID()
  yield { type: "start", data: { requestId, provider: "anthropic", model: request.model, intent: request.intent } }

  const baseUrl = request.providerConfig?.apiBaseUrl ?? "https://api.anthropic.com/v1"
  const endpoint = joinProviderUrl(baseUrl, "messages")
  const systemPrompt = request.messages.find((message) => message.role === "system")?.content

  const headers = new Headers({
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  })

  if (request.auth.type === "oauth") {
    headers.set("authorization", `Bearer ${request.auth.access}`)
    headers.set("anthropic-beta", "oauth-2025-04-20")
  } else if (request.auth.type === "api-key") {
    headers.set("x-api-key", request.auth.credential)
  } else if (request.auth.type === "wellknown") {
    headers.set("authorization", `Bearer ${request.auth.token}`)
  } else {
    yield { type: "error", data: { message: "Unsupported auth type for Anthropic provider" } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: request.model,
      stream: true,
      messages: toAnthropicMessages(request),
      system: systemPrompt,
      max_tokens: 4096,
    }),
  })

  if (!response.ok || !response.body) {
    const message = response.body ? await response.text() : "Anthropic stream is unavailable"
    yield { type: "error", data: { message } }
    yield { type: "done", data: { finishReason: "error" } }
    return
  }

  for await (const chunk of parseSseDataLines(response.body)) {
    try {
      const parsed = JSON.parse(chunk) as {
        type?: string
        delta?: { text?: string; stop_reason?: string | null }
        usage?: { input_tokens?: number; output_tokens?: number }
      }

      if (parsed.type === "content_block_delta" && parsed.delta?.text) {
        yield { type: "delta", data: { text: parsed.delta.text } }
      }

      if (parsed.usage) {
        yield {
          type: "usage",
          data: {
            inputTokens: parsed.usage.input_tokens,
            outputTokens: parsed.usage.output_tokens,
          },
        }
      }

      if (parsed.type === "message_delta" && parsed.delta?.stop_reason) {
        yield { type: "done", data: { finishReason: parsed.delta.stop_reason } }
        return
      }
    } catch {
      continue
    }
  }

  yield { type: "done", data: { finishReason: "stop" } }
}

export const anthropicAdapter: ProviderAdapter = {
  name: "anthropic",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: true,
    supportsVision: true,
  },
  stream: streamAnthropic,
}

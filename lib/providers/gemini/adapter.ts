import type { GenerationRequest } from "@/features/generation/types";
import type {
  NormalizedStreamEvent,
  ProviderAdapter,
} from "@/lib/providers/adapter-types";
import { extractApiKeyFromAuth } from "@/lib/providers/auth";
import { joinProviderUrl } from "@/lib/providers/url";

function extractGeminiText(payload: unknown): string {
  const candidate = (
    payload as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    }
  )?.candidates?.[0];
  if (!candidate?.content?.parts) {
    return "";
  }

  return candidate.content.parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

async function* streamGemini(
  request: GenerationRequest,
): AsyncGenerator<NormalizedStreamEvent, void, void> {
  const requestId = crypto.randomUUID();
  yield {
    type: "start",
    data: {
      requestId,
      provider: request.provider,
      model: request.model,
      intent: request.intent,
    },
  };

  const apiKey = extractApiKeyFromAuth(request);
  if (!apiKey) {
    yield { type: "error", data: { message: "Missing Gemini API key" } };
    yield { type: "done", data: { finishReason: "error" } };
    return;
  }

  const baseUrl =
    request.providerConfig?.apiBaseUrl ??
    "https://generativelanguage.googleapis.com/v1beta";
  const endpoint = joinProviderUrl(
    baseUrl,
    `models/${request.model}:generateContent`,
  );
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: request.messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    yield {
      type: "error",
      data: {
        message: message || `Gemini request failed (${response.status})`,
      },
    };
    yield { type: "done", data: { finishReason: "error" } };
    return;
  }

  const payload = (await response.json()) as unknown;
  const text = extractGeminiText(payload);
  if (text) {
    yield { type: "delta", data: { text } };
  }

  yield { type: "done", data: { finishReason: "stop" } };
}

export const geminiAdapter: ProviderAdapter = {
  name: "gemini",
  capabilities: {
    supportsTools: true,
    supportsJsonMode: false,
    supportsVision: true,
  },
  stream: streamGemini,
};

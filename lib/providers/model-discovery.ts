import type { ProviderAuthCredential } from "@/lib/auth/auth-types"
import { getProviderById, listProviderModels } from "@/lib/providers/catalog"
import { joinProviderUrl } from "@/lib/providers/url"

export type ProviderModelOption = {
  id: string
  name: string
}

export type ProviderModelsResult = {
  providerId: string
  providerName: string
  models: ProviderModelOption[]
  source: "live" | "catalog-fallback"
  fetchedAt: string
  error?: string
}

type ProviderModelsInput = {
  providerId: string
  auth: ProviderAuthCredential
}

const LIVE_DISCOVERY_PROVIDER_IDS = new Set([
  "openai",
  "openrouter",
  "github-models",
  "github-copilot",
  "github-copilot-enterprise",
  "anthropic",
  "google",
  "gemini",
])

function dedupeAndSortModels(models: ProviderModelOption[]): ProviderModelOption[] {
  const seen = new Set<string>()
  const deduped: ProviderModelOption[] = []

  for (const model of models) {
    if (!model.id || seen.has(model.id)) {
      continue
    }
    seen.add(model.id)
    deduped.push(model)
  }

  return deduped.sort((left, right) => left.name.localeCompare(right.name))
}

function catalogModelsFor(providerId: string, providerName?: string): ProviderModelsResult {
  return {
    providerId,
    providerName: providerName ?? providerId,
    models: [],
    source: "catalog-fallback",
    fetchedAt: new Date().toISOString(),
  }
}

async function fetchOpenAiCompatibleModels(input: {
  baseUrl: string
  auth: ProviderAuthCredential
  includeCopilotHeaders?: boolean
}): Promise<ProviderModelOption[]> {
  const token = input.auth.type === "oauth" ? input.auth.access || input.auth.refresh : input.auth.type === "api" ? input.auth.key : input.auth.type === "wellknown" ? input.auth.token : ""
  if (!token) {
    return []
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })

  if (input.auth.type === "oauth" && input.auth.accountId) {
    headers.set("ChatGPT-Account-Id", input.auth.accountId)
  }

  if (input.includeCopilotHeaders) {
    headers.set("Openai-Intent", "conversation-panel")
    headers.set("x-initiator", "user")
    headers.set("User-Agent", "researchlm/0.1.0")
  }

  const response = await fetch(joinProviderUrl(input.baseUrl, "models"), {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Model discovery request failed (${response.status})`)
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: string; name?: string }>
  }

  if (!Array.isArray(payload.data)) {
    return []
  }

  return payload.data
    .filter((entry): entry is { id: string; name?: string } => typeof entry.id === "string" && entry.id.length > 0)
    .map((entry) => ({
      id: entry.id,
      name: entry.name && entry.name.length > 0 ? entry.name : entry.id,
    }))
}

async function fetchAnthropicModels(baseUrl: string, auth: ProviderAuthCredential): Promise<ProviderModelOption[]> {
  const headers = new Headers({
    "anthropic-version": "2023-06-01",
  })

  if (auth.type === "api") {
    headers.set("x-api-key", auth.key)
  } else if (auth.type === "oauth") {
    headers.set("authorization", `Bearer ${auth.access}`)
    headers.set("anthropic-beta", "oauth-2025-04-20")
  } else if (auth.type === "wellknown") {
    headers.set("authorization", `Bearer ${auth.token}`)
  } else {
    return []
  }

  const response = await fetch(joinProviderUrl(baseUrl, "models"), {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Model discovery request failed (${response.status})`)
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: string; display_name?: string }>
  }

  if (!Array.isArray(payload.data)) {
    return []
  }

  return payload.data
    .filter((entry): entry is { id: string; display_name?: string } => typeof entry.id === "string" && entry.id.length > 0)
    .map((entry) => ({
      id: entry.id,
      name: entry.display_name && entry.display_name.length > 0 ? entry.display_name : entry.id,
    }))
}

async function fetchGeminiModels(baseUrl: string, auth: ProviderAuthCredential): Promise<ProviderModelOption[]> {
  const key = auth.type === "api" ? auth.key : auth.type === "oauth" ? auth.access : auth.type === "wellknown" ? auth.token : ""
  if (!key) {
    return []
  }

  const endpoint = joinProviderUrl(baseUrl, "models")
  endpoint.searchParams.set("key", key)

  const response = await fetch(endpoint, {
    method: "GET",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Model discovery request failed (${response.status})`)
  }

  const payload = (await response.json()) as {
    models?: Array<{ name?: string; displayName?: string; supportedGenerationMethods?: string[] }>
  }

  if (!Array.isArray(payload.models)) {
    return []
  }

  return payload.models
    .filter((entry) => {
      if (!entry.name || !entry.name.includes("/")) {
        return false
      }
      const id = entry.name.split("/").pop() ?? ""
      if (!id.startsWith("gemini")) {
        return false
      }
      if (!Array.isArray(entry.supportedGenerationMethods)) {
        return true
      }
      return entry.supportedGenerationMethods.includes("generateContent")
    })
    .map((entry) => {
      const id = entry.name!.split("/").pop()!
      return {
        id,
        name: entry.displayName && entry.displayName.length > 0 ? entry.displayName : id,
      }
    })
}

async function fetchLiveModels(providerId: string, baseUrl: string, auth: ProviderAuthCredential): Promise<ProviderModelOption[]> {
  if (providerId === "anthropic") {
    return fetchAnthropicModels(baseUrl, auth)
  }
  if (providerId === "google" || providerId === "gemini") {
    return fetchGeminiModels(baseUrl, auth)
  }
  if (providerId === "github-copilot" || providerId === "github-copilot-enterprise") {
    return fetchOpenAiCompatibleModels({
      baseUrl,
      auth,
      includeCopilotHeaders: true,
    })
  }

  return fetchOpenAiCompatibleModels({
    baseUrl,
    auth,
  })
}

export async function discoverProviderModels(input: ProviderModelsInput): Promise<ProviderModelsResult> {
  const provider = await getProviderById(input.providerId)
  if (!provider) {
    return {
      ...catalogModelsFor(input.providerId),
      error: "Unknown provider",
    }
  }

  const providerId = provider.id
  const now = new Date().toISOString()
  const fallbackModels = dedupeAndSortModels(
    listProviderModels(provider).map((model) => ({
      id: model.id,
      name: model.name,
    })),
  )
  const shouldAttemptLive = LIVE_DISCOVERY_PROVIDER_IDS.has(providerId)
  const baseUrl = provider.apiBaseUrl

  if (!shouldAttemptLive || !baseUrl) {
    return {
      providerId,
      providerName: provider.name,
      models: fallbackModels,
      source: "catalog-fallback",
      fetchedAt: now,
    }
  }

  try {
    const models = dedupeAndSortModels(await fetchLiveModels(providerId, baseUrl, input.auth))
    return {
      providerId,
      providerName: provider.name,
      models,
      source: "live",
      fetchedAt: now,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Model discovery failed"
    return {
      providerId,
      providerName: provider.name,
      models: [],
      source: "live",
      fetchedAt: now,
      error: message,
    }
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest"
import { discoverProviderModels } from "@/lib/providers/model-discovery"
import { resetProviderCatalogCacheForTests } from "@/lib/providers/catalog"

describe("provider model discovery", () => {
  beforeEach(() => {
    resetProviderCatalogCacheForTests()
    vi.unstubAllGlobals()
  })

  it("fetches OpenAI models from live endpoint for active auth", async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          openai: {
            id: "openai",
            name: "OpenAI",
            api: "https://api.openai.com/v1",
            models: {},
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [{ id: "gpt-4o-mini" }, { id: "gpt-5.2" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await discoverProviderModels({
      providerId: "openai",
      auth: { type: "api", key: "sk-test" },
    })

    expect(result.source).toBe("live")
    expect(result.models.map((model) => model.id)).toEqual(["gpt-4o-mini", "gpt-5.2"])
  })

  it("returns an empty live list when provider model endpoint fails", async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          openai: {
            id: "openai",
            name: "OpenAI",
            api: "https://api.openai.com/v1",
            models: {},
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )
    fetchMock.mockResolvedValueOnce(new Response("invalid token", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    const result = await discoverProviderModels({
      providerId: "openai",
      auth: { type: "api", key: "bad-token" },
    })

    expect(result.source).toBe("live")
    expect(result.models).toEqual([])
    expect(result.error).toMatch(/invalid token|failed|401/i)
  })
})

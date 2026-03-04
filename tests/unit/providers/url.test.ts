import { describe, expect, it } from "vitest"
import { joinProviderUrl } from "@/lib/providers/url"

describe("joinProviderUrl", () => {
  it("preserves versioned path segments in the base URL", () => {
    expect(joinProviderUrl("https://api.openai.com/v1", "chat/completions").toString()).toBe(
      "https://api.openai.com/v1/chat/completions",
    )
    expect(joinProviderUrl("https://api.openai.com/v1/", "/chat/completions").toString()).toBe(
      "https://api.openai.com/v1/chat/completions",
    )
  })

  it("preserves nested API prefixes", () => {
    expect(joinProviderUrl("https://openrouter.ai/api/v1", "chat/completions").toString()).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    )
  })
})

import { beforeEach, describe, expect, it } from "vitest";
import {
  buildModelCacheKey,
  getCachedProviderModels,
  isProviderModelCacheStale,
  upsertCachedProviderModels,
} from "@/lib/providers/model-cache";

const STORAGE_KEY = "researchlm:provider-model-cache";

describe("provider model cache", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  });

  it("stores and retrieves models by provider and credential version", () => {
    upsertCachedProviderModels({
      providerId: "openai",
      providerName: "OpenAI",
      credentialVersion: "cred-1:2026-03-04T00:00:00.000Z",
      models: [{ id: "gpt-4o-mini", name: "GPT-4o mini" }],
      source: "live",
      updatedAt: Date.now(),
    });

    const cached = getCachedProviderModels(
      "openai",
      "cred-1:2026-03-04T00:00:00.000Z",
    );
    expect(cached?.models.map((model) => model.id)).toEqual(["gpt-4o-mini"]);
  });

  it("isolates cache entries per credential version", () => {
    upsertCachedProviderModels({
      providerId: "openai",
      providerName: "OpenAI",
      credentialVersion: "cred-1:older",
      models: [{ id: "gpt-4o-mini", name: "GPT-4o mini" }],
      source: "live",
      updatedAt: Date.now(),
    });

    upsertCachedProviderModels({
      providerId: "openai",
      providerName: "OpenAI",
      credentialVersion: "cred-2:newer",
      models: [{ id: "gpt-5.2", name: "GPT-5.2" }],
      source: "live",
      updatedAt: Date.now(),
    });

    expect(
      getCachedProviderModels("openai", "cred-1:older")?.models[0]?.id,
    ).toBe("gpt-4o-mini");
    expect(
      getCachedProviderModels("openai", "cred-2:newer")?.models[0]?.id,
    ).toBe("gpt-5.2");
    expect(buildModelCacheKey("openai", "cred-1:older")).not.toBe(
      buildModelCacheKey("openai", "cred-2:newer"),
    );
  });

  it("marks stale entries using TTL", () => {
    const stale = isProviderModelCacheStale(
      {
        providerId: "openai",
        providerName: "OpenAI",
        credentialVersion: "cred-1",
        models: [{ id: "gpt-4o-mini", name: "GPT-4o mini" }],
        source: "live",
        updatedAt: Date.now() - 10_000,
      },
      1_000,
    );
    expect(stale).toBe(true);
  });
});

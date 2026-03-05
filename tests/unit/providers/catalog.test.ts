import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getProviderCatalog,
  resetProviderCatalogCacheForTests,
  sortProvidersForSelection,
} from "@/lib/providers/catalog";

describe("provider catalog", () => {
  beforeEach(() => {
    resetProviderCatalogCacheForTests();
    vi.unstubAllGlobals();
  });

  it("falls back to built-in providers when remote catalog fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const catalog = await getProviderCatalog({ forceRefresh: true });
    expect(catalog.openai?.name).toBe("OpenAI");
    expect(catalog["amazon-bedrock"]?.name).toBe("Amazon Bedrock");
  });

  it("orders priority providers before alphabetic remainder", async () => {
    const sorted = sortProvidersForSelection([
      {
        id: "zeta",
        name: "Zeta",
        apiBaseUrl: "",
        envKeys: [],
        models: {},
        npmPackage: undefined,
      },
      {
        id: "openrouter",
        name: "OpenRouter",
        apiBaseUrl: "",
        envKeys: [],
        models: {},
        npmPackage: undefined,
      },
      {
        id: "anthropic",
        name: "Anthropic",
        apiBaseUrl: "",
        envKeys: [],
        models: {},
        npmPackage: undefined,
      },
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual([
      "anthropic",
      "openrouter",
      "zeta",
    ]);
  });
});

import type { ProviderModelOption } from "@/lib/providers/model-discovery";

export type CachedProviderModels = {
  providerId: string;
  providerName: string;
  credentialVersion: string;
  models: ProviderModelOption[];
  source: "live" | "catalog-fallback";
  updatedAt: number;
};

type CachePayload = {
  entries: CachedProviderModels[];
};

const STORAGE_KEY = "researchlm:provider-model-cache";
export const MODEL_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function hasLocalStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readPayload(): CachePayload {
  if (!hasLocalStorage()) {
    return { entries: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { entries: [] };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CachePayload>;
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { entries: [] };
    }
    return {
      entries: parsed.entries.filter((entry): entry is CachedProviderModels => {
        return (
          typeof entry?.providerId === "string" &&
          typeof entry?.providerName === "string" &&
          typeof entry?.credentialVersion === "string" &&
          typeof entry?.updatedAt === "number" &&
          (entry?.source === "live" || entry?.source === "catalog-fallback") &&
          Array.isArray(entry?.models)
        );
      }),
    };
  } catch {
    return { entries: [] };
  }
}

function writePayload(payload: CachePayload): void {
  if (!hasLocalStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function buildModelCacheKey(
  providerId: string,
  credentialVersion: string,
): string {
  return `${providerId}::${credentialVersion}`;
}

export function getCachedProviderModels(
  providerId: string,
  credentialVersion: string,
): CachedProviderModels | undefined {
  const key = buildModelCacheKey(providerId, credentialVersion);
  return readPayload().entries.find(
    (entry) =>
      buildModelCacheKey(entry.providerId, entry.credentialVersion) === key,
  );
}

export function upsertCachedProviderModels(entry: CachedProviderModels): void {
  const payload = readPayload();
  const key = buildModelCacheKey(entry.providerId, entry.credentialVersion);
  const filtered = payload.entries.filter(
    (current) =>
      buildModelCacheKey(current.providerId, current.credentialVersion) !== key,
  );
  filtered.push(entry);
  writePayload({
    entries: filtered,
  });
}

export function isProviderModelCacheStale(
  entry: CachedProviderModels,
  ttlMs: number = MODEL_CACHE_TTL_MS,
): boolean {
  return Date.now() - entry.updatedAt > ttlMs;
}

export function pruneProviderModelCache(
  maxAgeMs: number = MODEL_CACHE_TTL_MS * 7,
): void {
  const payload = readPayload();
  const next = payload.entries.filter(
    (entry) => Date.now() - entry.updatedAt <= maxAgeMs,
  );
  if (next.length === payload.entries.length) {
    return;
  }
  writePayload({
    entries: next,
  });
}

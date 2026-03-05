import type { GenerationRequest } from "@/features/generation/types";

export function extractApiKeyFromAuth(
  request: GenerationRequest,
): string | undefined {
  if (request.auth.type === "api-key") {
    return request.auth.credential;
  }
  if (request.auth.type === "wellknown") {
    return request.auth.token;
  }
  if (request.auth.type === "oauth") {
    return request.auth.access || request.auth.refresh;
  }
  return undefined;
}

export function isBedrockProvider(provider: string): boolean {
  return provider === "bedrock" || provider === "amazon-bedrock";
}

import type { GenerationRequest } from "@/features/generation/types"

const consumerTokenPatterns = [/^ghu_/i, /^ghs_/i, /^sk-cli/i, /^session_/i]

export function assertByokPolicy(request: GenerationRequest): void {
  const credential = request.auth.credential.trim()
  if (!credential) {
    throw new Error("Missing BYOK credential")
  }

  for (const pattern of consumerTokenPatterns) {
    if (pattern.test(credential)) {
      throw new Error("Consumer or CLI session tokens are not allowed")
    }
  }
}

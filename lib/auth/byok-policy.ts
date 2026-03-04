import type { GenerationRequest } from "@/features/generation/types"

const consumerTokenPatterns = [/^ghu_/i, /^ghs_/i, /^sk-cli/i, /^session_/i]
const revokedCredentialPatterns = [/^revoked:/i, /^permission-denied:/i]
const invalidCredentialPatterns = [/^invalid:/i, /^expired:/i]

export class CredentialPreflightError extends Error {
  readonly category: "auth" | "permission"
  readonly retryable: false

  constructor(category: "auth" | "permission", message: string) {
    super(message)
    this.category = category
    this.retryable = false
  }
}

export function assertByokPolicy(request: GenerationRequest): void {
  const candidates: string[] = []

  if (request.auth.type === "api-key") {
    const credential = request.auth.credential.trim()
    if (!credential) {
      throw new CredentialPreflightError("auth", "Missing BYOK credential")
    }
    candidates.push(credential)
  }

  if (request.auth.type === "oauth") {
    const access = request.auth.access.trim()
    const refresh = request.auth.refresh?.trim()
    if (!access && !refresh) {
      throw new CredentialPreflightError("auth", "Missing OAuth credential")
    }
    if (access) candidates.push(access)
    if (refresh) candidates.push(refresh)
  }

  if (request.auth.type === "wellknown") {
    if (!request.auth.token.trim()) {
      throw new CredentialPreflightError("auth", "Missing well-known auth token")
    }
    candidates.push(request.auth.token.trim())
  }

  if (request.auth.type === "aws-profile") {
    if (!request.auth.profile.trim()) {
      throw new CredentialPreflightError("auth", "Missing AWS profile")
    }
    candidates.push(request.auth.profile.trim())
  }

  if (request.auth.type === "aws-env-chain") {
    // No direct secret is required; credentials can come from AWS env/role chain.
    return
  }

  for (const value of candidates) {
    for (const pattern of consumerTokenPatterns) {
      if (pattern.test(value)) {
        throw new CredentialPreflightError("permission", "Consumer or CLI session tokens are not allowed")
      }
    }

    for (const pattern of revokedCredentialPatterns) {
      if (pattern.test(value)) {
        throw new CredentialPreflightError("permission", "Credential has been revoked or lacks permission")
      }
    }

    for (const pattern of invalidCredentialPatterns) {
      if (pattern.test(value)) {
        throw new CredentialPreflightError("auth", "Credential is invalid or expired")
      }
    }
  }
}

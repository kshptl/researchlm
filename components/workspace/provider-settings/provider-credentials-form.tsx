"use client"

import React, { useEffect, useMemo, useState } from "react"
import { getProviderAuthMethods, type ProviderAuthMethod } from "@/lib/auth/method-registry"
import type { ProviderAuthCredential } from "@/lib/auth/auth-types"

type CredentialSummary = {
  id: string
  provider: string
  status: "active" | "invalid" | "revoked"
  updatedAt: string
}

type ProviderOption = {
  id: string
  name: string
}

type SavePayload = {
  provider: string
  type: "api-key" | "oauth" | "aws-profile"
  credential: string
  authPayload?: ProviderAuthCredential
}

type Props = {
  onSave: (value: SavePayload) => void
  onReplace?: (value: { credentialId: string; credential: string }) => void
  onRevoke?: (credentialId: string) => void
  credentials?: CredentialSummary[]
}

type OAuthState = {
  sessionId: string
  method: ProviderAuthMethod
  verificationUrl?: string
  userCode?: string
  callbackInput?: string
  intervalSeconds?: number
  message?: string
}

const FALLBACK_PROVIDERS: ProviderOption[] = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "github-models", name: "GitHub Models" },
  { id: "github-copilot", name: "GitHub Copilot" },
  { id: "amazon-bedrock", name: "Amazon Bedrock" },
]

function mapMethodToLegacyType(method: ProviderAuthMethod): "api-key" | "oauth" | "aws-profile" {
  if (method.type === "oauth") {
    return "oauth"
  }
  if (method.type === "aws-profile") {
    return "aws-profile"
  }
  return "api-key"
}

function mapAuthToLegacyCredential(auth: ProviderAuthCredential): string {
  switch (auth.type) {
    case "api":
      return auth.key
    case "oauth":
      return auth.refresh || auth.access
    case "aws-profile":
      return auth.profile
    case "wellknown":
      return auth.token
    case "aws-env-chain":
      return auth.region ?? "aws-env-chain"
    default:
      return ""
  }
}

export function ProviderCredentialsForm({ onSave, onReplace, onRevoke, credentials = [] }: Props) {
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>(FALLBACK_PROVIDERS)
  const [provider, setProvider] = useState(FALLBACK_PROVIDERS[0]?.id ?? "openai")
  const [selectedMethodId, setSelectedMethodId] = useState<string>("")
  const [credential, setCredential] = useState("")
  const [oauthState, setOauthState] = useState<OAuthState | null>(null)
  const [oauthInput, setOauthInput] = useState("")
  const [copilotDeploymentType, setCopilotDeploymentType] = useState<"github.com" | "enterprise">("github.com")
  const [copilotEnterpriseUrl, setCopilotEnterpriseUrl] = useState("")
  const [replacementCredential, setReplacementCredential] = useState("")
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("")
  const [showSavedCredentials, setShowSavedCredentials] = useState(true)
  const savedCredentialsTriggerRef = React.useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof fetch !== "function") {
      return
    }

    let cancelled = false
    void fetch("/api/providers/catalog")
      .then(async (response) => {
        if (!response.ok) {
          return
        }
        const body = (await response.json()) as { providers?: Array<{ id: string; name: string }> }
        if (!body.providers || body.providers.length === 0 || cancelled) {
          return
        }
        setProviderOptions(
          body.providers.map((entry) => ({
            id: entry.id,
            name: entry.name,
          })),
        )
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const providerMethods = useMemo(() => getProviderAuthMethods(provider), [provider])
  const selectedMethod = useMemo(
    () => providerMethods.find((method) => method.id === selectedMethodId) ?? providerMethods[0],
    [providerMethods, selectedMethodId],
  )

  useEffect(() => {
    setSelectedMethodId(providerMethods[0]?.id ?? "")
    setOauthState(null)
    setOauthInput("")
    setCredential("")
  }, [provider, providerMethods])

  async function startOauthFlow(method: ProviderAuthMethod): Promise<void> {
    if (!method.oauthFlow) {
      return
    }

    const body: Record<string, string> = {
      action: method.oauthFlow.startAction,
    }

    if (provider === "github-copilot") {
      body.deploymentType = copilotDeploymentType
      if (copilotDeploymentType === "enterprise") {
        body.enterpriseUrl = copilotEnterpriseUrl
      }
    }

    const response = await fetch(`/api/auth/providers/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const payload = (await response.json()) as {
      status: "pending" | "ready" | "failed"
      message?: string
      sessionId?: string
      verificationUrl?: string
      authorizationUrl?: string
      userCode?: string
      intervalSeconds?: number
    }

    if (payload.status === "failed" || !payload.sessionId) {
      setOauthState({
        sessionId: "",
        method,
        message: payload.message ?? "Unable to start OAuth flow.",
      })
      return
    }

    setOauthState({
      sessionId: payload.sessionId,
      method,
      verificationUrl: payload.authorizationUrl ?? payload.verificationUrl,
      userCode: payload.userCode,
      intervalSeconds: payload.intervalSeconds,
      message: payload.message,
    })
  }

  async function completeOauthFlow(): Promise<void> {
    if (!oauthState?.method.oauthFlow?.completeAction || !oauthState.sessionId) {
      return
    }

    const response = await fetch(`/api/auth/providers/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: oauthState.method.oauthFlow.completeAction,
        sessionId: oauthState.sessionId,
        callbackInput: oauthInput,
      }),
    })

    const payload = (await response.json()) as {
      status: "success" | "failed"
      message?: string
      auth?: ProviderAuthCredential
    }

    if (payload.status !== "success" || !payload.auth) {
      setOauthState((current) => (current ? { ...current, message: payload.message ?? "OAuth authorization failed." } : current))
      return
    }

    onSave({
      provider,
      type: mapMethodToLegacyType(oauthState.method),
      credential: mapAuthToLegacyCredential(payload.auth),
      authPayload: payload.auth,
    })
    setOauthState(null)
    setOauthInput("")
  }

  async function pollOauthFlow(): Promise<void> {
    if (!oauthState?.method.oauthFlow?.pollAction || !oauthState.sessionId) {
      return
    }

    const response = await fetch(`/api/auth/providers/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: oauthState.method.oauthFlow.pollAction,
        sessionId: oauthState.sessionId,
      }),
    })

    const payload = (await response.json()) as {
      status: "success" | "pending" | "failed"
      message?: string
      intervalSeconds?: number
      auth?: ProviderAuthCredential
    }

    if (payload.status === "success" && payload.auth) {
      onSave({
        provider,
        type: mapMethodToLegacyType(oauthState.method),
        credential: mapAuthToLegacyCredential(payload.auth),
        authPayload: payload.auth,
      })
      setOauthState(null)
      setOauthInput("")
      return
    }

    setOauthState((current) =>
      current
        ? {
            ...current,
            intervalSeconds: payload.intervalSeconds ?? current.intervalSeconds,
            message: payload.message,
          }
        : current,
    )
  }

  function saveManualCredential(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    if (!selectedMethod) {
      return
    }

    if (selectedMethod.type === "aws-env-chain") {
      onSave({
        provider,
        type: "aws-profile",
        credential: "aws-env-chain",
        authPayload: {
          type: "aws-env-chain",
        },
      })
      setCredential("")
      return
    }

    if (!credential.trim()) {
      return
    }

    const payload: ProviderAuthCredential =
      selectedMethod.type === "aws-profile"
        ? { type: "aws-profile", profile: credential.trim() }
        : { type: "api", key: credential.trim() }

    onSave({
      provider,
      type: mapMethodToLegacyType(selectedMethod),
      credential: credential.trim(),
      authPayload: payload,
    })
    setCredential("")
  }

  return (
    <form className="space-y-2 rounded-md border border-[hsl(var(--border))] p-3" onSubmit={saveManualCredential}>
      <p className="text-xs font-semibold">Provider Credentials (BYOK)</p>

      <select value={provider} onChange={(event) => setProvider(event.target.value)} className="w-full rounded border p-1 text-xs">
        {providerOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      <select value={selectedMethod?.id ?? ""} onChange={(event) => setSelectedMethodId(event.target.value)} className="w-full rounded border p-1 text-xs">
        {providerMethods.map((method) => (
          <option key={method.id} value={method.id}>
            {method.label}
          </option>
        ))}
      </select>

      {selectedMethod?.description ? <p className="text-[11px] text-slate-600">{selectedMethod.description}</p> : null}

      {provider === "github-copilot" && selectedMethod?.id === "github-copilot-oauth" ? (
        <div className="space-y-1 rounded border border-slate-200 p-2">
          <label className="block text-[11px] font-semibold text-slate-600">GitHub deployment</label>
          <select
            value={copilotDeploymentType}
            onChange={(event) => setCopilotDeploymentType(event.target.value as "github.com" | "enterprise")}
            className="w-full rounded border p-1 text-xs"
          >
            <option value="github.com">GitHub.com</option>
            <option value="enterprise">GitHub Enterprise</option>
          </select>
          {copilotDeploymentType === "enterprise" ? (
            <input
              type="text"
              value={copilotEnterpriseUrl}
              onChange={(event) => setCopilotEnterpriseUrl(event.target.value)}
              className="w-full rounded border p-1 text-xs"
              placeholder="company.ghe.com"
            />
          ) : null}
        </div>
      ) : null}

      {selectedMethod?.type === "oauth" ? (
        <div className="space-y-2 rounded border border-slate-200 p-2">
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => void startOauthFlow(selectedMethod)}>
            Start OAuth
          </button>

          {oauthState?.verificationUrl ? (
            <p className="text-[11px] text-slate-700">
              Open:{" "}
              <a className="text-sky-700 underline" href={oauthState.verificationUrl} target="_blank" rel="noreferrer">
                {oauthState.verificationUrl}
              </a>
            </p>
          ) : null}
          {oauthState?.userCode ? <p className="text-[11px] text-slate-700">Code: {oauthState.userCode}</p> : null}

          {selectedMethod.oauthFlow?.completeAction ? (
            <div className="space-y-1">
              <input
                type="text"
                value={oauthInput}
                onChange={(event) => setOauthInput(event.target.value)}
                className="w-full rounded border p-1 text-xs"
                placeholder={selectedMethod.oauthFlow.callbackInputLabel ?? "Authorization code"}
              />
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => void completeOauthFlow()}>
                Complete OAuth
              </button>
            </div>
          ) : null}

          {selectedMethod.oauthFlow?.pollAction ? (
            <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => void pollOauthFlow()}>
              Poll Authorization
            </button>
          ) : null}

          {oauthState?.intervalSeconds ? (
            <p className="text-[11px] text-slate-600">Suggested poll interval: {oauthState.intervalSeconds}s</p>
          ) : null}
          {oauthState?.message ? <p className="text-[11px] text-rose-600">{oauthState.message}</p> : null}
        </div>
      ) : (
        <>
          {selectedMethod?.type !== "aws-env-chain" ? (
            <input
              type="password"
              value={credential}
              onChange={(event) => setCredential(event.target.value)}
              className="w-full rounded border p-1 text-xs"
              placeholder={selectedMethod?.placeholder ?? "Enter provider credential"}
            />
          ) : (
            <p className="text-[11px] text-slate-600">No credential entry required. This saves an AWS env/role-chain profile.</p>
          )}

          <button type="submit" className="rounded border px-2 py-1 text-xs">
            Save credential
          </button>
        </>
      )}

      {credentials.length > 0 ? (
        <section className="space-y-2 rounded border border-[hsl(var(--border))] p-2">
          <button
            ref={savedCredentialsTriggerRef}
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() => setShowSavedCredentials((current) => !current)}
          >
            {showSavedCredentials ? "Hide saved credentials" : "Manage saved credentials"}
          </button>

          {showSavedCredentials ? (
            <div className="space-y-2" role="region" aria-label="Saved credentials panel">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Saved credentials</p>
              <ul className="space-y-1">
                {credentials.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1 text-xs">
                    <span>
                      {item.provider} ({item.status})
                    </span>
                    <button type="button" className="rounded border px-2 py-0.5" onClick={() => setSelectedCredentialId(item.id)}>
                      Select
                    </button>
                  </li>
                ))}
              </ul>

              <input
                type="password"
                value={replacementCredential}
                onChange={(event) => setReplacementCredential(event.target.value)}
                className="w-full rounded border p-1 text-xs"
                placeholder="Replacement credential value"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  disabled={!selectedCredentialId || !replacementCredential}
                  onClick={() => {
                    if (!selectedCredentialId || !replacementCredential || !onReplace) {
                      return
                    }
                    onReplace({ credentialId: selectedCredentialId, credential: replacementCredential })
                    setReplacementCredential("")
                  }}
                >
                  Replace selected
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  disabled={!selectedCredentialId}
                  onClick={() => {
                    if (!selectedCredentialId || !onRevoke) {
                      return
                    }
                    onRevoke(selectedCredentialId)
                  }}
                >
                  Revoke selected
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => {
                    setShowSavedCredentials(false)
                    requestAnimationFrame(() => {
                      savedCredentialsTriggerRef.current?.focus()
                    })
                  }}
                >
                  Close panel
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </form>
  )
}

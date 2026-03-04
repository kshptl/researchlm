# Task Plan

- [x] Review feature input and extract core concepts from the provided PDF.
- [x] Determine short branch name and next feature number across remote, local, and specs sources.
- [x] Create feature branch and scaffold spec using specify script.
- [x] Draft complete feature specification in `specs/001-build-researchlm-app/spec.md`.
- [x] Validate specification quality and create checklist in `specs/001-build-researchlm-app/checklists/requirements.md`.
- [x] Run planning setup and generate `plan.md` for `001-build-researchlm-app`.
- [x] Complete Phase 0 research artifact at `specs/001-build-researchlm-app/research.md`.
- [x] Complete Phase 1 design artifacts: `data-model.md`, `contracts/`, and `quickstart.md`.
- [x] Update agent context via `.specify/scripts/bash/update-agent-context.sh opencode`.
- [x] Re-run plan workflow after UI clarifications with expanded front-end architecture detail.
- [x] Expand planning artifacts to cover advanced canvas/node UI scope and front-end contracts.
- [x] Re-run `/speckit.plan` after latest clarification pass and regenerate phase artifacts.
- [x] Tighten planning outputs to address latest analysis gaps (quality gates, extraction/retry UX, history panel, performance baseline definitions).
- [x] Regenerate `specs/001-build-researchlm-app/tasks.md` from latest clarified spec and refreshed plan artifacts.
- [x] Re-run `/speckit.plan` after final clarification updates and regenerate planning/design artifacts.

## Review

- Completed full spec for implementing the Researchlm-style multilevel exploration and sensemaking application described in the PDF.
- Confirmed no unresolved clarification markers remain.
- Prepared outputs for next phase (`/speckit.plan` or `/speckit.clarify`).
- Completed planning workflow through Phase 2 planning stop-point with constitution gates passing pre- and post-design.
- Refined planning depth for front-end requirements (three-pane layout, six node types, advanced canvas interactions, undo/redo depth, desktop-only scope).
- Rebuilt plan/research/data-model/contracts/quickstart from template after setup-plan reset and revalidated no unresolved planning placeholders.
- Replaced task plan with front-end-heavy, requirement-complete breakdown including explicit coverage for extraction flow, retry preservation UX, history panel UI, and formatting/static-analysis quality gates.
- Rebuilt plan outputs again after constitution/compliance and acceptance-coverage clarifications; confirmed no unresolved placeholders or clarification markers in planning artifacts.

## 2026-03-04 Provider Parity Mapping

- [x] Inventory all files/symbols hardcoding provider enums, provider options, and model lists.
- [x] Document auth schema limitations versus opencode-style provider requirements (OAuth, API key, well-known/API endpoints, provider metadata blobs).
- [x] Document runtime adapter limitations and required architectural changes for dynamic catalog-driven providers.
- [x] Map impacted tests plus missing tests required for safe migration.
- [x] Add review notes summarizing findings and verification evidence.

### Review

- Mapped hardcoded provider/model/auth enums across request schema, generation types, provider registry/adapters, settings UI, canvas model overrides, and tests.
- Identified auth model gaps for OAuth token lifecycle fields, provider API/well-known discovery metadata, and provider-specific credential/config payload support.
- Documented runtime architecture changes needed to support dynamic providers/models from a catalog source instead of compile-time provider wiring.
- Enumerated existing tests requiring migration updates and proposed missing unit/integration/contract suites for dynamic catalog + auth parity coverage.

## 2026-03-04 OpenCode Auth Parity Implementation

- [x] Add a dynamic provider catalog layer (models.dev fetch + local fallback + priority ordering).
- [x] Add auth method registry with OpenCode-style options (OpenAI OAuth browser/headless, GitHub Copilot OAuth, API-key fallback).
- [x] Migrate credential store to structured auth payloads with backward-compatible legacy record hydration.
- [x] Update generation and stream request contracts to dynamic provider IDs and structured auth.
- [x] Replace static provider adapter registry with catalog-driven runtime adapter selection.
- [x] Implement OpenAI and GitHub Copilot auth API routes needed by the settings form.
- [x] Refactor provider credentials form to use dynamic provider list and method list.
- [x] Update workspace generation wiring to stop hardcoding Bedrock provider defaults.
- [x] Extend sensitive-field log redaction for OAuth and provider-secret fields.
- [x] Update/add tests for catalog, auth method selection, credential migration, and dynamic stream validation.
- [x] Run `npm test` and `npm run lint`, then document implementation review outcomes.

### Review

- Added dynamic provider catalog loading via `models.dev` with fallback providers and priority ordering.
- Implemented OpenCode-style auth method registry and provider auth route handlers for OpenAI (browser/headless), Anthropic (oauth variants), and GitHub Copilot (device oauth).
- Migrated credential storage to structured payloads (`api`, `oauth`, `wellknown`, `aws-profile`, `aws-env-chain`) while upgrading legacy records in-place.
- Switched stream request parsing to dynamic provider IDs with structured auth unions and catalog-enriched provider runtime metadata.
- Reworked provider adapter registry to support aliasing/inference from provider catalog metadata and added real runtime adapters for OpenAI-compatible, Anthropic, Gemini, GitHub Models, and GitHub Copilot paths.
- Refactored provider settings form to dynamic provider and method sources with OAuth start/complete/poll UX and preserved saved-credential management behavior.
- Removed Bedrock hardcoding from canvas generation defaults and model override picker by sourcing models from catalog.
- Expanded secret redaction taxonomy for OAuth/token-specific fields.
- Added/updated tests:
  - `tests/unit/providers/catalog.test.ts`
  - `tests/unit/auth/method-registry.test.ts`
  - `tests/unit/persistence/credential-lifecycle.test.ts`
  - `tests/unit/persistence/log-redaction-policy.test.ts`
  - `tests/contract/llm-stream.contract.test.ts`
- Verification:
  - `npm test`: pass (52 files / 91 tests).
  - `npm run typecheck`: pass.
  - `npm run lint`: blocked by existing project toolchain mismatch (`next lint` on Next 16 resolves as invalid project directory `.../lint`).

## 2026-03-04 OpenAI No-Text Generation Fix

- [x] Trace end-to-end OpenAI generation path from UI payload to adapter stream parsing.
- [x] Reproduce and identify root cause for no-text output.
- [x] Fix provider endpoint URL construction so versioned base paths are preserved.
- [x] Ensure SSE `error` events propagate as surfaced generation failures instead of silent empty output.
- [x] Add regression tests for URL joining and stream error propagation.
- [x] Run verification (`npm test`, `npm run typecheck`) before claiming completion.

### Review

- Root cause identified in adapter endpoint construction: leading `/` in `new URL("/chat/completions", "https://api.openai.com/v1")` dropped `/v1`, causing provider errors and empty output.
- Added `joinProviderUrl()` helper and migrated OpenAI, Anthropic, OpenRouter, GitHub Models, GitHub Copilot, and Gemini adapters to it.
- Updated stream consumer to throw on SSE `error` events so failures surface in UI instead of silently returning blank text.
- Added tests:
  - `tests/unit/providers/url.test.ts`
  - `tests/unit/generation/stream-consumer.test.ts`
- Verification:
  - `npm test`: pass (54 files / 96 tests).
  - `npm run typecheck`: pass.

## 2026-03-04 Auth-Scoped Model Catalog

- [x] Add provider model discovery endpoint that resolves models using active auth context (not global catalog only).
- [x] Implement provider-specific live model fetchers where supported (OpenAI-compatible, Anthropic, Gemini) with strict fallback behavior.
- [x] Add client-side model cache keyed by provider + credential version with startup stale refresh policy.
- [x] Refactor canvas model source to use active credentials only and refresh on auth save/replace/revoke.
- [x] Ensure workspace default provider/model selection stays valid when active auth set changes.
- [x] Add/adjust tests for URL/model discovery and cache behavior.
- [x] Run verification (`npm test`, `npm run typecheck`) and document outcomes.

### Review

- Added auth-scoped model discovery route `POST /api/providers/models` that accepts provider/auth payloads and returns per-provider model lists.
- Added provider discovery service with live model listing for OpenAI-compatible providers, Anthropic, and Gemini, with strict no-broad-fallback behavior when live discovery fails.
- Added browser model cache keyed by `providerId + credentialVersion` with TTL and stale refresh logic.
- Updated canvas model loading to:
  - seed from cache on startup,
  - background-refresh stale/missing entries,
  - only include providers with active credentials,
  - refresh immediately when credentials change.
- Added initial prompt model picker so the first generated node can choose model/provider before first request.
- Added tests:
  - `tests/unit/providers/model-cache.test.ts`
  - `tests/unit/providers/model-discovery.test.ts`
- Verification:
  - `npm run typecheck`: pass.
  - Targeted suites pass (`provider model` + `workspace UI` + `generation flow`).
  - Full parallel `npm test` intermittently hits existing Vitest worker OOM in this environment (non-deterministic infra/resource issue).

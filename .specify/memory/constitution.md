<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - II. Testing Standards Are Non-Negotiable
  - III. User Experience Consistency Is Required
- Added sections:
  - V. Visual Quality Is a Release Gate
- Templates requiring updates:
  - ⚠ pending review: .specify/templates/plan-template.md
  - ⚠ pending review: .specify/templates/spec-template.md
  - ⚠ pending review: .specify/templates/tasks-template.md
- Runtime guidance updates:
  - ✅ no files found: README.md
  - ✅ no files found: docs/**/*.md
- Follow-up TODOs:
  - Reconcile templates with visual-gate wording if used by future speckit runs
-->

# ResearchLM Constitution

## Core Principles

### I. Code Quality Is Enforced
All production code MUST pass automated linting, formatting, and static analysis checks in
CI before merge. Changes MUST preserve or improve readability through clear naming,
cohesive module boundaries, and removal of dead code. Pull requests MUST include a brief
design rationale for non-trivial decisions and MUST not introduce avoidable duplication.
Rationale: strict quality gates reduce regression risk and keep the codebase maintainable.

### II. Testing Standards Are Non-Negotiable
Every change MUST include tests aligned to risk: unit tests for logic, integration tests for
component boundaries, and end-to-end or contract tests for user-critical flows and API
contracts. User-facing workflows with material UI states MUST include visual regression
coverage for approved baseline states. Bug fixes MUST include a regression test that fails
before the fix and passes after. CI MUST block merges on any failing required test suite,
including visual regression checks when applicable. Rationale: test rigor is the primary
control for correctness and long-term delivery speed.

### III. User Experience Consistency Is Required
User-facing changes MUST follow shared UX patterns for layout, interaction states,
terminology, accessibility, error messaging, and visual hierarchy. New UI behavior MUST
reuse established design tokens and component patterns unless an approved exception is
documented. Changed flows MUST be validated against quickstart or acceptance scenarios
for interaction and visual consistency. Intentional visual baseline changes MUST include
documented review approval, rationale, and linked requirements. Rationale: consistent UX
lowers user error rates and support burden.

### IV. Performance Budgets Are Defined and Verified
Features MUST define measurable performance requirements before implementation, including
latency and resource expectations relevant to the domain. Changes that affect hot paths MUST
include benchmark or profiling evidence and MUST not regress agreed budgets without explicit
approval and documented mitigation. CI or release checks MUST verify critical performance
thresholds where practical. Rationale: explicit budgets prevent hidden degradation.

### V. Visual Quality Is a Release Gate
Features with user-visible UI MUST define deterministic visual regression checks for critical
states and map them to feature requirements and user stories. Visual diffs MUST be reviewed;
unapproved diffs MUST block merge. Baseline updates MUST include approval owner,
rationale, date, and linked FR/US coverage references. Rationale: visual quality is a core
product requirement and requires objective, repeatable enforcement.

## Engineering Standards

- Definitions of done MUST include code quality checks, required test coverage updates,
  UX consistency validation, and performance verification artifacts.
- Definitions of done MUST include visual regression evidence for affected UI states,
  baseline/diff artifact retention, and documented approval for intentional baseline changes.
- Requirements in specs MUST use MUST/SHOULD language and include measurable acceptance
  criteria for UX and performance where applicable.
- Architecture and implementation plans MUST declare quality gates, test strategy,
  UX consistency approach, and performance budgets before development begins.

## Delivery Workflow & Quality Gates

1. Plan: identify affected quality, testing, UX, and performance obligations.
2. Implement: deliver incremental changes with updated tests and documentation.
3. Verify: run lint, static analysis, test suites, UX checks, visual regression checks, and performance checks.
4. Review: confirm constitution compliance, visual diff approval status, and traceability before approval and merge.
5. Release: document any approved exceptions, risks, and follow-up mitigations.

## Governance

This constitution is the authoritative engineering policy for the repository and supersedes
conflicting local practices.

Amendment procedure:
- Any amendment MUST include a proposed diff, rationale, impact assessment, and template
  synchronization updates.
- Amendments require approval by project maintainers and take effect on merge.

Versioning policy (semantic versioning):
- MAJOR: incompatible principle removals or redefinitions.
- MINOR: new principles or materially expanded governance requirements.
- PATCH: wording clarifications, typo fixes, and non-semantic refinements.

Compliance review expectations:
- Every plan, spec, task list, and pull request MUST include an explicit constitution
  compliance check.
- Every plan, spec, task list, and pull request for user-facing changes MUST include an
  explicit visual quality compliance check.
- Reviewers MUST block approval when mandatory requirements are unmet or unverified.
- Exceptions MUST be time-bounded, documented, and include a mitigation owner.

**Version**: 1.1.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-03

<!--
Sync Impact Report
- Version change: N/A -> 1.0.0
- Modified principles:
  - Principle 1 placeholder -> I. Production-Grade Code Quality
  - Principle 2 placeholder -> II. Mandatory Test Coverage and Reliability
  - Principle 3 placeholder -> III. Consistent User Experience Contracts
  - Principle 4 placeholder -> IV. Enforced Performance Budgets
  - Principle 5 placeholder -> V. Observable and Reviewable Delivery
- Added sections:
  - Engineering Standards
  - Development Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending (not present in repository): .specify/templates/commands/*.md
- Follow-up TODOs:
  - None
-->
# researchlm Constitution

## Core Principles

### I. Production-Grade Code Quality
All merged code MUST pass formatting, linting, and static analysis checks configured for
the repository. Pull requests MUST avoid dead code and TODO markers without linked issues,
and MUST keep modules readable through focused functions and explicit naming. Any exception
requires a documented rationale in the implementation plan.
Rationale: High signal code review and maintainability depend on consistent code quality
standards enforced before merge.

### II. Mandatory Test Coverage and Reliability
Every change MUST include automated tests at the appropriate level (unit, integration,
or contract) and MUST include at least one regression test for each bug fix. Tests for new
behavior MUST fail before implementation and pass after implementation. Flaky tests MUST be
fixed or removed before merge; quarantined tests are not considered compliance.
Rationale: Reliable delivery requires deterministic evidence that behavior works and remains
stable as the system evolves.

### III. Consistent User Experience Contracts
User-visible behavior MUST be consistent across equivalent workflows, including terminology,
error messaging, interaction patterns, and accessibility semantics already used by the
project. Spec documents MUST define acceptance criteria for UX behavior, and tasks MUST
include validation steps for these criteria before release.
Rationale: Predictable UX reduces user errors, support load, and rework.

### IV. Enforced Performance Budgets
Features MUST define measurable performance requirements in specifications before
implementation. Changes affecting runtime-critical paths MUST include benchmark or
profiling evidence that budgets are met for latency, throughput, and/or resource usage.
Performance regressions beyond documented thresholds MUST block release until corrected or
explicitly approved with a mitigation plan.
Rationale: Performance is a product requirement and must be managed with objective data.

### V. Observable and Reviewable Delivery
Plans, specs, and task lists MUST map requirements to test cases and verification steps.
Pull requests MUST include a compliance checklist referencing each constitution principle.
Releases MUST include notes describing behavior changes, known risks, and validation status.
Rationale: Traceability and review discipline ensure consistent quality decisions over time.

## Engineering Standards

- Specifications MUST include functional requirements, UX acceptance criteria, and explicit
  performance targets with measurable thresholds.
- Plans MUST define quality gates for linting, testing, UX validation, and performance
  verification before implementation starts.
- Tasks MUST include work items for automated tests, UX consistency checks, and performance
  validation for impacted user stories.
- Work that cannot satisfy a standard at implementation time MUST include a dated follow-up
  issue and an approved risk note.

## Development Workflow and Quality Gates

1. Specification phase: define user stories, UX consistency criteria, and measurable
performance outcomes.
2. Planning phase: complete constitution check; unresolved violations block plan approval.
3. Implementation phase: apply test-first workflow for changed behavior and maintain passing
quality gates locally before review.
4. Review phase: reviewers MUST verify constitution compliance and reject changes lacking
objective evidence.
5. Release phase: publish validation summary (tests, UX checks, performance results) with
known limitations and mitigation actions.

## Governance

This constitution overrides conflicting project habits and templates. Amendments require:
(1) a proposed change in a pull request, (2) explicit update of impacted templates and
guidance docs, and (3) reviewer approval with migration notes when workflow changes.

Versioning policy follows semantic versioning for governance:
- MAJOR: incompatible principle removals or redefinitions.
- MINOR: new principle/section or materially expanded guidance.
- PATCH: clarifications, wording improvements, and non-semantic refinements.

Compliance review expectations:
- Every pull request MUST include a constitution compliance check.
- Reviewers MUST confirm evidence for testing, UX consistency, and performance commitments.
- Violations MUST be resolved before merge or documented as approved exceptions with owners
  and due dates.

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02

---
document: Backend Architecture Contract — Generation Rules
project: "{{PROJECT_NAME}}"
version: 0.1.0
owner: "[Backend Solutions Architect name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Backend Architecture Contract: Generation Rules

**What this file is:** the rules the AI agent follows to draft a Backend Architecture
Contract for an Intent, during Mob Elaboration Phases 2–5 — what triggers producing one,
and what it must contain when it does.

**What this file is not:** not the worked example —
`docs/templates/samples/contracts/backend-architecture-contract.md` is the canonical
shape and sign-off format, filled in for `INTENT-004`. Not the draft/human-edit
relationship either — every generated contract is a starting framework, never a verdict;
see the AI-Native Engineering Model's §Mob Elaboration for how the Backend Solutions
Architect accepts, extends, or simplifies it before Sign-Off.

**Companion files:** [unit-breakdown-rules.md](./unit-breakdown-rules.md) (same
Elaboration session). The other five `*-architecture-contract-generation-rules.md` files
are siblings, one per role.

---

## 1. When This Contract Is Required

Any Intent with at least one Unit of Work touching the backend — an API/service layer, an
async worker or job runner, or a data-store schema. If none of an
Intent's Units touch these, this contract is not produced — logged the same way
`devops-architecture-contract-generation-rules.md` §1 logs a skip: the file states "not
pulled in" and why, rather than simply not existing.

## 2. Required Content

- **API Contract Exposed.** Full request/response shape for any new or changed endpoint,
  including error cases (4xx/5xx) — not just the happy path.
- **Shared Derivation Rules.** Anything another role (most often Frontend) needs to
  independently reproduce — a naming rule, an ID derivation — is defined once, here, and
  referenced elsewhere. It is never re-derived independently by the consuming role.
- **Data Model Touches.** Which tables/columns are written, and whether a migration is
  needed.
- **Components Touched (Design-Code Dictionary impact).** Named components this
  Intent's Backend work will add, move, or touch.
- **What This Contract Deliberately Excludes.** Anything the room discussed and
  explicitly deferred — stated, not silently dropped.
- **Sign-Off.**

## 3. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Companion to the five sibling `*-contract-generation-rules.md` files |

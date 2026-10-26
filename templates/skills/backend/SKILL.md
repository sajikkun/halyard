---
name: backend
description: Drafts the Backend Architecture Contract for an Intent, per backend-architecture-contract-generation-rules.md. Use when asked to run the Backend Skill or draft a Backend contract during Mob Elaboration.
invoked_by: Mob Elaboration (Ceremony 1), Phases 2–5
output: file — nvaid/intents/<INTENT-ID>/contracts/backend-architecture-contract.md
---

# Backend Skill

Drafts the Backend Architecture Contract for an Intent, per
`{{AIDLC_ROOT}}/backend-architecture-contract-generation-rules.md` — the shapes every
consuming role (most often Frontend) reproduces verbatim rather than re-deriving.

## Steps

1. Confirm this Intent has at least one Unit touching the backend — an API/service layer,
   an async worker, a data schema, or any server-side component — if none do, this
   contract is not produced; state that plainly rather than leaving the file absent
   with no explanation.
2. Write the full API Contract Exposed for any new or changed endpoint — request and
   response shape, including error cases (4xx/5xx), not just the happy path.
3. Define every Shared Derivation Rule (a naming rule, an ID derivation) exactly once
   here; never let a consuming role re-derive it independently.
4. State Data Model Touches — which tables/columns are written, and whether a migration
   is needed.
5. List components touched (Design-Code Dictionary impact).
6. State what this contract deliberately excludes — anything the room discussed and
   explicitly deferred, named rather than silently dropped.
7. Write `nvaid/intents/<INTENT-ID>/contracts/backend-architecture-contract.md`.

## Boundaries

- A draft, not a verdict — flag it awaiting the Backend Solutions Architect's Sign-Off;
  never present it as final.

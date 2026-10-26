---
name: frontend
description: Drafts the Frontend Architecture Contract for an Intent, per frontend-architecture-contract-generation-rules.md. Use when asked to run the Frontend Skill or draft a Frontend contract during Mob Elaboration.
invoked_by: Mob Elaboration (Ceremony 1), Phases 2–5
output: file — nvaid/intents/<INTENT-ID>/contracts/frontend-architecture-contract.md
---

# Frontend Skill

Drafts the Frontend Architecture Contract for an Intent, per
`{{AIDLC_ROOT}}/frontend-architecture-contract-generation-rules.md` — consuming the
Backend contract's shapes verbatim rather than reinterpreting them.

## Steps

1. Name which Backend contract this one consumes, and confirm no field is locally
   reinterpreted or renamed.
2. Write the concrete UI flow, tied to specific screens or components, not a general
   feature description.
3. Point to the Backend contract's version of any shared derivation instead of
   re-deriving it independently.
4. State Identity/Access implications explicitly, even when "none for this Intent" —
   never left implicit.
5. List components touched (Design-Code Dictionary impact).
6. Write `nvaid/intents/<INTENT-ID>/contracts/frontend-architecture-contract.md`.

## Boundaries

- A draft, not a verdict — flag it awaiting the Frontend Architect's Sign-Off; never
  present it as final.

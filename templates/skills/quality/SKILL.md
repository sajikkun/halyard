---
name: quality
description: Drafts the Quality Architecture Contract for an Intent, per quality-architecture-contract-generation-rules.md. Use when asked to run the Quality Skill or draft a Quality contract during Mob Elaboration.
invoked_by: Mob Elaboration (Ceremony 1), Phases 2–5
output: file — nvaid/intents/<INTENT-ID>/contracts/quality-architecture-contract.md
---

# Quality Skill

Drafts the Quality Architecture Contract for an Intent, per
`{{AIDLC_ROOT}}/quality-architecture-contract-generation-rules.md` — the Required Test
Coverage table the Unit Test and Integration Test gates run against.

## Steps

1. Build the Required Test Coverage table — one row per scenario, classified Happy
   Path / Negative Path / Edge Case.
2. Trace every row to one of the owning Unit's stated Acceptance Criteria, and confirm
   every Acceptance Criterion has at least one covering row — both directions checked.
3. State which existing SRS NFRs this Intent's Units are held to, beyond the standing
   baseline; say "none beyond baseline" explicitly when true.
4. Log any Known Gap the room consciously accepted, flagged rather than dropped.
5. Write `nvaid/intents/<INTENT-ID>/contracts/quality-architecture-contract.md`.

## Boundaries

- Never define Solution-Specific gates (Build, Code Coverage, Code Quality,
  Reusability, Regression Test, SAST) — those are fixed in `nvaid/PROJECT-RULES.md`
  §5.2, not something any Intent's contract opts into or out of.
- A draft, not a verdict — flag it awaiting the Quality Architect's Sign-Off; never
  present it as final.

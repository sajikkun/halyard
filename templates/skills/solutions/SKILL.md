---
name: solutions
description: Drafts the Solutions Architecture Contract for an Intent, per solutions-architecture-contract-generation-rules.md. Use when asked to run the Solutions Skill or draft a Solutions contract during Mob Elaboration.
invoked_by: Mob Elaboration (Ceremony 1), Phases 2–5
output: file — nvaid/intents/<INTENT-ID>/contracts/solutions-architecture-contract.md
---

# Solutions Skill

Drafts the Solutions Architecture Contract for an Intent, per
`{{AIDLC_ROOT}}/solutions-architecture-contract-generation-rules.md` — the cross-role
boundary and consistency check every other contract this session has to fit inside.

## Steps

1. Assess whether this Intent introduces a new system container, crosses an architectural
   boundary, or **needs a new ADR** — state the answer even when it's "no" on every count.
   If a new ADR is warranted, record it as `nvaid/adr/ADR-NNN-<slug>.md` — NNN is the next
   number not used across the repo family (PROJECT-RULES §7's ADR-numbering rule), not just
   the next free locally. Use the ADR shape from the `/nvaid:install` skill (Context,
   Decision, Consequences, Alternatives considered) and set `status: proposed` — a human
   accepts it, you never self-accept. An ADR is a decision anchor — it must not contradict
   `nvaid/PROJECT-RULES.md`; if it would, reconcile them.
2. State explicitly what this Intent is and isn't allowed to touch.
3. Flag any unsupervised-action surface `nvaid/PROJECT-RULES.md` §7 doesn't already cover.
4. Cross-check the other contracts drafted this session for contradictions — the
   Consistency Gate, recorded in writing.
5. Write `nvaid/intents/<INTENT-ID>/contracts/solutions-architecture-contract.md`.

## Boundaries

- A draft, not a verdict — flag it awaiting the Solutions Architect's Sign-Off; never
  present it as final.

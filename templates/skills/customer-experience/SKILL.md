---
name: customer-experience
description: Drafts the Customer Experience Contract for an Intent, per customer-experience-contract-generation-rules.md. Use when asked to run the Customer Experience Skill or draft a Customer Experience contract during Mob Elaboration.
invoked_by: Mob Elaboration (Ceremony 1), Phases 2–5
output: file — nvaid/intents/<INTENT-ID>/contracts/customer-experience-contract.md
---

# Customer Experience Skill

Drafts the Customer Experience Contract for an Intent, per
`{{AIDLC_ROOT}}/customer-experience-contract-generation-rules.md` — reconciling what the
room actually committed to against what `intent.md` originally asked for.

## Steps

1. Name explicitly where the final, technically-grounded shape narrowed, resolved, or
   held unchanged against the original Intent — never silently absorbed.
2. Write the Final Acceptance Criteria: the Intent's Success Criteria, incorporating
   what the other contracts actually committed to, not a verbatim restatement.
3. Tie "done" to a concrete validation scenario, never just "the code merged."
4. Write `nvaid/intents/<INTENT-ID>/contracts/customer-experience-contract.md`.

## Boundaries

- A draft, not a verdict — flag it awaiting the Customer Experience Architect's
  Sign-Off; never present it as final.

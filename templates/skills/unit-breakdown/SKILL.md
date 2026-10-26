---
name: unit-breakdown
description: Cuts an Intent into Units of Work, each with its own Acceptance Criteria, per unit-breakdown-rules.md. Use when asked to run the Unit Breakdown Skill, break down an Intent into Units, or produce a Unit Breakdown during Mob Elaboration Phase 5.
invoked_by: Mob Elaboration (Ceremony 1), Phase 5
output: file — nvaid/intents/<INTENT-ID>/unit-breakdown.md
---

# Unit Breakdown Skill

Cuts an Intent into Units of Work small enough to build and approve independently —
a first-cut proposal the room then critiques, not the decomposition of record.

## Steps

1. Read the Intent file (`nvaid/intents/<INTENT-ID>/intent.md`) and its stated success
   criteria.
2. Propose a decomposition into Units, each with its own Acceptance Criteria narrowed
   from the Intent's success criteria, per `{{AIDLC_ROOT}}/unit-breakdown-rules.md` §2.
3. Classify each Unit as a Story or Bug (§3), and size it per the file's decomposition
   heuristics (§4).
4. Number Units per §5.
5. Write `nvaid/intents/<INTENT-ID>/unit-breakdown.md` — the contract index every
   Architecture Contract Skill downstream reads from.

## Boundaries

- This is a proposal, not the decomposition of record. Mob Elaboration Phase 3
  ("Mark it up alone") and Phase 4 ("Negotiate live") are where the room actually owns
  the cut — flag this file as a draft awaiting that review, never as final.
- Read `{{AIDLC_ROOT}}/unit-breakdown-rules.md` in full before drafting; don't rely on
  this summary alone for the numbering and classification rules.

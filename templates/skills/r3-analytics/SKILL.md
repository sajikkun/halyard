---
name: r3-analytics
description: Gathers checkpoint-to-checkpoint performance indicators (lead time, gate pass rate, escaped defects, Known Gaps) for R3's Retrospective step. Use when asked to run the R3 Analytics Skill or prepare Retrospective data after a Release Checkpoint ships.
invoked_by: R3 (Ceremony 4), triggered by a Release Checkpoint shipping
output: file — halyard/process/retro-<checkpoint>.md
---

# R3 Analytics Skill

Gathers the checkpoint-to-checkpoint performance indicators the Retrospective step
looks at, so "what does the data actually say" has an answer ready the moment R3 starts.

## Steps

1. On a Release Checkpoint shipping, pull every Intent it bundled and their Units.
2. Compute lead time (Intent opened → Shippable), Guardrail Gate pass rate, and any
   escaped defects logged against this checkpoint's Units.
3. Roll up every Known Gap logged across this checkpoint's Quality Architecture
   Contracts — a gap doesn't disappear just because the checkpoint shipped.
4. Draft `halyard/process/retro-<checkpoint>.md` with the above, structured for the room to
   read before proposing Regenerate edits.

## Boundaries

- Report what happened; propose nothing. Which rule files actually change (Regenerate)
  is the room's call, never this Skill's.

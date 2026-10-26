---
name: project-ticketing
description: Creates and updates Epics, Stories, and Bugs in GitHub Projects per ISSUE-TRACKER-TEMPLATE.md. Use when asked to run the Project Ticketing Skill, create tickets from a Unit Breakdown, or sync ticket status with Construction progress.
invoked_by: Mob Elaboration (Ceremony 1), Mob Construction (Ceremony 2)
output: link — a GitHub Projects ticket
---

# Project Ticketing Skill

Creates and updates Epics, Stories, and Bugs per `{{AIDLC_ROOT}}/ISSUE-TRACKER-TEMPLATE.md`
— so ticket shape never drifts from one Intent to the next.

## Steps

1. On Unit Breakdown (Mob Elaboration Phase 5), create one Story or Bug per Unit,
   classified per `{{AIDLC_ROOT}}/unit-breakdown-rules.md` §3.
2. Attach each ticket's Acceptance Criteria verbatim from the Unit's own design doc —
   never re-worded independently.
3. As Mob Construction moves a Unit through Design → Building → Gates → Merged, update
   ticket status to match. The ticket reflects the repo, not the other way round.
4. Once every Unit under an Epic reaches Merged, roll the Epic to "Intent Complete."

## Boundaries

- Never assign a Story or Epic to a Release Checkpoint — that decision belongs to the
  Release Plan Skill, made at Release Planning Day, not pre-empted here.

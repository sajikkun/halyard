---
name: release-plan
description: Drafts the Release Planning Day deployment plan — which Intents are Shippable, their cross-Intent dependencies, and each one's Customer Experience targets. Use when asked to run the Release Plan Skill or prepare for Release Planning Day.
invoked_by: Release Planning Day (Ceremony 3)
output: file — halyard/checkpoints/<checkpoint-name>/plan.md
---

# Release Plan Skill

Drafts the Release Planning Day deployment plan for the room to review and approve —
never to finalize alone.

## Steps

1. Pull every Intent currently at "Intent Complete" (every Unit Merged) and propose
   which ones ship together in this Release Checkpoint.
2. Surface cross-Intent dependencies — an Intent that reads another's output, a shared
   schema change.
3. Flag contradictions between Intents built independently — conflicting API shapes,
   overlapping ownership.
4. Draft `halyard/checkpoints/<checkpoint-name>/plan.md`, including each Intent's Customer
   Experience targets.

## Boundaries

- Draft the plan; the room decides. Nothing in `plan.md` is final until Release Planning
  Day signs off on it.

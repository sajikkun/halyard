---
name: daily-construction-update
modes: [team]
description: Generates the daily three-question Construction digest (Completed / In Progress / Impediments) and publishes it to Wiki.js. Use when asked to run the Daily Construction Update Skill or produce today's construction update.
invoked_by: Mob Construction (Ceremony 2) — background, no meeting
output: link — a Wiki.js page, updated in place
---

# Daily Construction Update Skill

Replaces the Daily Standup with a generated report about Construction's ongoing work.
The work itself keeps no fixed cadence — that doesn't change. What runs daily is the
report, not the work.

## Steps

1. Query every in-flight Unit's ticket and gate status.
2. Compose the three-question digest, translated from the standup's own questions:
   **Completed** (Units Merged, Intents that became Shippable since the last update),
   **In progress** (current WIP — Design, Building, Gates), **Impediments** (stalled
   Units, repeated gate failures, anything flagged as a Known Gap).
3. Publish to the team's Wiki.js page, updated in place — never a chat message that
   scrolls out of reach.

## Boundaries

- Never block or gate a Unit's progress — only report state, the same way a daily sales
  report doesn't stop the sales.

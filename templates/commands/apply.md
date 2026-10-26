---
command: nvaid:apply
description: Generate per-repo unit design docs and open construction branches for an approved breakdown.
stage: "Fig. 2 Stage 4+ — Per-Role Authoring / Construction"
precondition: Decomposition Approved gate green (the stage-2 elaboration/ PR is merged on develop, rule 11)
---

# /nvaid:apply

## ⛔ Precondition: nvaid install must be complete

Read `nvaid/config.yml` and check the `install:` block. If `config`, `project_rules`, or
`design_code_dictionary` is not `true` (or the file is missing), **STOP** and tell the
user to run `/nvaid:install` first — name which flag(s) are false. Do not proceed until
all three are true.


Turn an **approved** unit-breakdown into construction-ready work: materialize each Unit's
design doc + construction branch **in the repo that owns it**, and hand off cleanly for
units owned by *other* repos.

## Precondition

Only run once the unit-breakdown is approved, meaning the stage-2 `elaboration/` PR is
merged and `unit-breakdown.md` exists on `origin/develop`. If it's still awaiting the gate,
stop.

## A session only touches its own repo

A session running `/nvaid:apply` sees and writes to **one repo — the one it's running in**
(this is the same single-repo boundary rule 14 relies on). The unit-breakdown may tag Units
for several Owning Repos. You must **not** try to write into another repo's working tree.
So apply splits the Units into two groups:

- **Units owned by THIS repo** (`Owning Repo` == this repo's `owning_repo` in
  `nvaid/config.yml`) — materialize them fully (steps 2–3 below).
- **Units owned by OTHER repos** — do **not** materialize locally. Hand them off (step 4).

## Steps

1. Read the approved `unit-breakdown.md`; split its Units by `Owning Repo` into "mine" vs.
   "others", using this repo's `owning_repo` from `nvaid/config.yml`.
2. **For each Unit owned by THIS repo:** generate
   `nvaid/intents/<repo-name>.<INTENT-ID>-<slug>/units/<UNIT-ID>-design.md` with the
   Unit's own Acceptance Criteria, referencing the relevant contracts (`covers_units`); and
   cut the construction branch (`feature/<story-id>-<slug>` or `bugfix/...`) per the
   `github` Skill.
3. Create/update the tracker items per `{{AIDLC_ROOT}}/ISSUE-TRACKER-TEMPLATE.md` (Epic per
   Intent, Story/Bug per Unit) — links, not pasted content.
4. **For each Unit owned by ANOTHER repo — hand off, don't reach in:** create the Unit's
   tracker Story in that repo via `gh ... --repo <owner>/<other-repo>` (the same cross-repo
   pattern the `pr-review` skill uses — never `cd` into another clone), tagged with its
   Owning Repo and Intent, so the work is visible on the shared board. Then list those Units
   for the user with the exact instruction: *"run `/nvaid:apply` inside `<other-repo>` to
   materialize its unit design docs + branches."* The owning repo's own session does the
   local materialization — this session only opens the cross-repo ticket and reports.
5. Hand off to Construction. Do not implement code here.

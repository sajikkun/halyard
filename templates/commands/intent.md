---
command: nvaid:intent
description: Draft an Intent (intent.md) — the business need and success criteria only, then STOP.
stage: "Fig. 2 Stage 1 — Intent captured, pre-Elaboration"
---

# /nvaid:intent

## ⛔ Precondition: nvaid install must be complete

Before doing anything, read `nvaid/config.yml` and check the `install:` block. If
`config`, `project_rules`, or `design_code_dictionary` is **not** `true` — or
`nvaid/config.yml` doesn't exist — **STOP** and tell the user:

> nvaid isn't fully installed in this project yet. Run `/nvaid:install` first — it scans
> the project and fills in config.yml, PROJECT-RULES.md, and DESIGN-CODE-DICTIONARY.md.
> Those documents are what this command relies on; drafting an Intent without them would
> produce hollow output.

Name which flag(s) are false. Do not proceed with any step below until all three are true.

---

Draft a new Intent from the user's description. Produce **only** `intent.md` — the
business need, who it's for, success criteria, and scope boundaries — then **stop**.

## Hard rule: generate the intent and nothing else

Do NOT generate contracts, a unit-breakdown, or any downstream artifact. The Intent must
be approved by the stakeholder (the **Intent Approved** gate) before anything
downstream is generated. Stopping here is the whole point of the gated workflow, not a
limitation — propose, don't dispose.

## Steps

1. Read this repo's `nvaid/PROJECT-RULES.md` for the project's operating guardrails and
   approved stack (guaranteed authored, since the install gate above has passed).
2. **Choose the Intent number — unique family-wide, not per-repo.** Two repos must never
   reuse the same number; they share one tracker board. Run the family-wide ID check
   defined in `nvaid/rules/family-rules.md` (the numbering rule) against the shared board
   named there, and take the next number not used by *any* repo in the family. If
   `nvaid/rules/family-rules.md` isn't present yet, say the family-wide check can't run and
   ask the user to confirm the number rather than guessing.
3. Write `nvaid/intents/<repo-name>.<INTENT-ID>-<slug>/intent.md` — `<repo-name>` is the repo's own GitHub name (the `<name>` in its `<owner>/<name>` entry in `family.repos`, e.g. `shop-backend`), not `owning_repo`. The prefix marks
   which repo owns the Intent, so the folder is unambiguous out of context (PROJECT-RULES §8,
   family rule 14). Contents: business need, who it's for,
   Intent-level success criteria (observable outcomes, not implementation), scope
   boundaries (name what's out of scope, don't silently drop it), and open questions for
   the room. Do not decide the technical shape here.
4. Flag the file as a draft awaiting stakeholder approval.
5. Open the **stage-1 PR** per the `github` Skill: an `intent/<intent-id>-<slug>` branch cut
   from `develop`, holding **`intent.md` only**. Approving and merging this PR **is** the
   Intent Approved gate. Contracts and the unit-breakdown never go in this PR — they go in
   a separate stage-2 PR. Stop.

## Next (do not run automatically)

After the stage-1 PR is approved and merged on `develop`: `/nvaid:contracts`, then
`/nvaid:breakdown`, on a new `elaboration/<intent-id>-<slug>` branch (the stage-2 PR).

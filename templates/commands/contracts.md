---
command: hyd:contracts
description: {{#team}}Draft the per-role Architecture Contracts for an approved Intent (Phases 2–5).{{/team}}{{#solo}}Draft design.md — one section per role — for an approved Intent.{{/solo}}
stage: "Mob Elaboration — Phases 2–5"
precondition: Intent Approved gate green (the stage-1 intent/ PR is merged on develop)
---

# /hyd:contracts

## ⛔ Precondition: halyard install must be complete

Read `halyard/config.yml` and check the `install:` block. If `config`, `project_rules`, or
`design_code_dictionary` is not `true` (or the file is missing), **STOP** and tell the
user to run `/hyd:install` first — name which flag(s) are false. Do not proceed until
all three are true.


{{#team}}
Draft the Architecture Contracts for an **already-approved** Intent, running each role's
contract Skill. The contracts are negotiated across Elaboration Phases 2–5 and **precede**
the unit-breakdown (which is the Phase 5 output) — run `/hyd:breakdown` after this.
{{/team}}
{{#solo}}
Draft `design.md` §1–§6 for an **already-approved** Intent, running each role's Skill for
its own section (`halyard/rules/solo-mode-rules.md` §3). The design **precedes** the unit
breakdown (§7) — run `/hyd:breakdown` after this.
{{/solo}}

## Precondition: the Intent is merged on `develop`

Only run once the **Intent Approved** gate has passed, meaning the stage-1 `intent/` PR
has been {{#team}}approved **and merged**{{/team}}{{#solo}}**merged** by the developer{{/solo}}. Check with `git fetch origin` that `intent.md` exists on
`origin/develop`. If it exists only on an open `intent/` branch or PR, stop and say the
Intent isn't approved yet.

## Steps

1. Cut the **stage-2** branch `elaboration/<intent-id>-<slug>` from `develop` per the
   `github` Skill (or reuse it if it already exists), and read the merged `intent.md`.
2. **Transcribe the Intent Approved gate into `intent.md`. This is the branch's first
   commit.** If `intent.md` still says `status: draft`, find the merged stage-1 PR
{{#team}}
   (`gh pr list --state merged --head intent/<intent-id>-<slug> --json number`) and read
   its approver and merge commit
   (`gh pr view <n> --json reviews,mergeCommit,mergedAt`). Then:
   - set `status: approved`,
   - update the status banner to cite the PR number, the approver and the merge commit,
   - add a change-log row,
   - commit it as `docs: elaborate INTENT-XXX — mark Intent approved (PR #<n>)`.

   This **transcribes** an approval that already happened. It never grants one. If the PR
   has no `APPROVED` review, stop and say so rather than flipping the status. Skip this
   step if `status:` is already `approved`.
{{/team}}
{{#solo}}
   (`gh pr list --state merged --head intent/<intent-id>-<slug> --json number`) and read
   who merged it and the merge commit
   (`gh pr view <n> --json state,mergedBy,mergeCommit,mergedAt`). Then:
   - set `status: approved`,
   - update the status banner to cite the PR number, who merged it, and the merge commit,
   - add a change-log row,
   - commit it as `docs: elaborate INTENT-XXX — mark Intent approved (PR #<n>)`.

   This **transcribes** an approval that already happened. It never grants one. In solo
   mode the merge is the approval, so no review is required, but if the PR isn't
   `MERGED`, stop and say so rather than flipping the status. Skip this step if `status:`
   is already `approved`.
{{/solo}}
{{#team}}
3. Run each required role Skill per its `*-architecture-contract-generation-rules.md`
   under `{{AIDLC_ROOT}}`: solutions, the relevant tier contract(s) (frontend / backend),
   quality, customer-experience. Pull a role in only if the Intent touches its domain;
   state "not pulled in" explicitly for the rest.
4. Write each to `halyard/intents/<repo-name>.<INTENT-ID>-<slug>/contracts/` (the Intent's
   existing folder) and commit them to the stage-2 branch.
5. Each contract is a **draft awaiting its Architect's sign-off** — never present as final.
   Read the architect roster from `halyard/config.yml` (`architects.<role>`) and flag each
   contract as "awaiting sign-off from <that named architect>". Never fill in a sign-off
   on an architect's behalf (propose, don't dispose). If a role has no named architect in
   config, state that its contract is not pulled in rather than inventing an owner.
{{/team}}
{{#solo}}
3. Create `halyard/intents/<repo-name>.<INTENT-ID>-<slug>/design.md` from the skeleton in
   `{{AIDLC_ROOT}}/solo-mode-rules.md` §3 (the Intent's existing folder).
4. Run each role Skill for its section, per its `*-architecture-contract-generation-rules.md`
   under `{{AIDLC_ROOT}}`: backend (§2) and frontend (§3) first, then any other tier (§4),
   then quality (§5) and customer-experience (§6), and solutions (§1) last, since §1 runs
   the Consistency Gate across the rest. A role the Intent doesn't touch keeps its heading
   and says "Not pulled in — <reason>". Leave §7 for `/hyd:breakdown`.
5. `design.md` is a **draft awaiting the developer's sign-off** — never present it as
   final. Flag it "awaiting sign-off from <`developer` in `halyard/config.yml`>" and leave
   `owner:` and §8 as placeholders (family rule 16). Commit it to the stage-2 branch.
{{/solo}}

## Next

`/hyd:breakdown` — cut the approved Intent into Units, informed by {{#team}}these contracts{{/team}}{{#solo}}`design.md` §1–§6{{/solo}}, on the
same stage-2 branch. It opens the stage-2 PR.

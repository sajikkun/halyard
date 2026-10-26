---
command: nvaid:contracts
description: Draft the per-role Architecture Contracts for an approved Intent (Phases 2–5).
stage: "Mob Elaboration — Phases 2–5"
precondition: Intent Approved gate green (the stage-1 intent/ PR is merged on develop)
---

# /nvaid:contracts

## ⛔ Precondition: nvaid install must be complete

Read `nvaid/config.yml` and check the `install:` block. If `config`, `project_rules`, or
`design_code_dictionary` is not `true` (or the file is missing), **STOP** and tell the
user to run `/nvaid:install` first — name which flag(s) are false. Do not proceed until
all three are true.


Draft the Architecture Contracts for an **already-approved** Intent, running each role's
contract Skill. The contracts are negotiated across Elaboration Phases 2–5 and **precede**
the unit-breakdown (which is the Phase 5 output) — run `/nvaid:breakdown` after this.

## Precondition: the Intent is merged on `develop`

Only run once the **Intent Approved** gate has passed, meaning the stage-1 `intent/` PR
has been approved **and merged**. Check with `git fetch origin` that `intent.md` exists on
`origin/develop`. If it exists only on an open `intent/` branch or PR, stop and say the
Intent isn't approved yet.

## Steps

1. Cut the **stage-2** branch `elaboration/<intent-id>-<slug>` from `develop` per the
   `github` Skill (or reuse it if it already exists), and read the merged `intent.md`.
2. **Transcribe the Intent Approved gate into `intent.md`. This is the branch's first
   commit.** If `intent.md` still says `status: draft`, find the merged stage-1 PR
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
3. Run each required role Skill per its `*-architecture-contract-generation-rules.md`
   under `{{AIDLC_ROOT}}`: solutions, the relevant tier contract(s) (frontend / backend),
   quality, customer-experience. Pull a role in only if the Intent touches its domain;
   state "not pulled in" explicitly for the rest.
4. Write each to `nvaid/intents/<repo-name>.<INTENT-ID>-<slug>/contracts/` (the Intent's
   existing folder) and commit them to the stage-2 branch.
5. Each contract is a **draft awaiting its Architect's sign-off** — never present as final.
   Read the architect roster from `nvaid/config.yml` (`architects.<role>`) and flag each
   contract as "awaiting sign-off from <that named architect>". Never fill in a sign-off
   on an architect's behalf (propose, don't dispose). If a role has no named architect in
   config, state that its contract is not pulled in rather than inventing an owner.

## Next

`/nvaid:breakdown` — cut the approved Intent into Units, informed by these contracts, on the
same stage-2 branch. It opens the stage-2 PR.

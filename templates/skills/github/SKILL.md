---
name: github
description: Branches (feature/bugfix/hotfix/intent/elaboration/chore, mapped to ticket or Intent IDs, or a slug for repo tooling), commits, opens pull requests, checks CI, self-reviews before requesting human review, iterates on review comments, and hands off to manual merge approval, following this repo's master/develop Git Flow. Use when asked to run the GitHub Skill, start work on a ticket or an Intent, push a Unit's work, do repo tooling/config work, open or update a pull request, address review comments, or check CI status.
invoked_by: Mob Construction (Ceremony 2), and Mob Elaboration (Ceremony 1) for its own intent/ and elaboration/ branches
output: link — a GitHub pull request
version: 5.0
---

# GitHub Skill

The procedure Mob Construction invokes to touch the repository — the same steps, every
Unit, every time. Covers the full loop: branch → commit → PR → self-review → human
review → iterate → manual merge. This Skill never merges anything itself.

## Branch model (Git Flow)

- **`master`** — the default, production branch. Nothing commits here directly; it only
  moves forward via an approved release merge from `develop`, or a hotfix.
- **`develop`** — the integration branch. Every feature and bugfix branch is cut from
  here and merges back here.
- **`feature/<story-id>`** — new capability, cut from `develop`. `<story-id>` is the
  GitHub Project story ID this Unit's ticket carries — e.g. `feature/142`. Add a short
  slug if the ID alone reads as opaque in a long branch list: `feature/142-branch-override`.
- **`bugfix/<bug-id>`** — fixes a Bug-classified ticket found before release, cut from
  `develop`, same ID convention as `feature/`.
- **`hotfix/<slug>`** — an emergency fix to what's already in production, cut from
  `master` directly (the one exception to "always branch from develop"), merged back
  into **both** `master` and `develop` so the fix isn't lost on the next release. No
  Unit exists yet when this starts — run the Unit Breakdown Skill retroactively to log
  one once the fix is in.
- **`intent/<intent-id>-<slug>`** — Elaboration **stage 1**, cut from `develop`: holds
  **`intent.md` only**. Approving and merging this PR is the **Intent Approved** gate.
  Contracts and the unit-breakdown never go here (they're stage 2, below), because
  `develop`'s branch protection dismisses an approval on every new push, so adding them
  to this PR would wipe the Intent approval. Not a Construction branch type — nothing here is code, so treating it as `feature/` would
  misdescribe what actually changed and would demand a Story ID that doesn't exist yet
  (a Unit of Work isn't decided until Elaboration produces `unit-breakdown.md` in the
  first place). Review on this branch's PR is the CX Architect (or relevant Architect)
  reading the artifact for content, not CI verifying code — the gates still run, but
  pass on a markdown-only diff as a no-op, not as a meaningful check of anything.
  Example: `intent/001-login-navigation-shell`.
- **`elaboration/<intent-id>-<slug>`** — Elaboration **stage 2**, cut from `develop`
  **after** the stage-1 `intent/` PR has merged: holds the per-role `contracts/` files
  and `unit-breakdown.md`. Approving and merging this PR is the **Decomposition
  Approved** gate. Same `<intent-id>-<slug>` as its stage-1 branch, and the same
  markdown-only review footing. Example: `elaboration/007-google-profile-photo`.
- **`chore/<slug>`** — repo tooling, config, or meta work with no application code and
  no Unit of Work behind it: a new Skill, a CI/CD workflow change, a convention update
  (this branch type's own addition was one). Cut from `develop`, same as `feature`/
  `bugfix`. This was already the de facto convention across every tooling PR in this
  repo before being written down here — `chore/ci-setup`, `chore/verify-bot-identity`,
  `chore/manual-deploy-trigger`, `chore/pr-review-skill`, `chore/pr-title-convention`,
  `chore/reconcile-spec-planning`, and others all predate this entry. This documents
  existing practice, not a new rule nobody's followed yet.

## Steps

### 1. Branch

Cut the branch per the model above, named by type and ticket ID (or Intent ID, for
`intent/` and `elaboration/`) so what's happening is visible in the branch list itself. Never commit
directly to `master` or `develop`.

### 2. Commit

One commit per meaningful step, not one giant diff, using Conventional Commits scoped
to the Unit:

```
<type>(<unit-id>): <what changed, imperative mood>
```

`<type>` is `feat`, `fix`, `refactor`, `test`, or `chore`. Example:
`feat(unit-004-02): add branch-override endpoint with slot-limit check`.

On an `intent/` branch there's no Unit ID yet to scope to — use `docs: draft
INTENT-XXX — <short title>` instead (no parenthesized scope). On an `elaboration/` branch,
use `docs: elaborate INTENT-XXX — <what was added>` (for example `docs: elaborate INTENT-007 —
draft contracts`). On a `chore/` branch
there's no Unit ID either, since there's no Unit of Work behind tooling/config changes —
use a plain `chore: <what changed, imperative mood>`, no parenthesized scope.

### 3. Open the pull request

Target `develop` (or `master` for a `hotfix/`). The PR body links the Unit's design doc
and its Quality Architecture Contract, and lists which Acceptance Criteria this PR
closes. Request the owning Architect (the human) as reviewer explicitly — never leave
the reviewer field empty.

**PR title format** — bracket tags, not a Conventional Commit prefix. Commits keep the
`<type>(<unit-id>):` style from step 2; the PR *title* uses this readable form instead:

```
[TYPE][TARGET][TICKET] <plain readable summary>
```

- **`[TYPE]`** — the work type, mapped from the commit type:
  `feat → [FEATURE]`, `fix → [FIX]`, `chore → [CHORE]`, `refactor → [REFACTOR]`,
  `test → [TEST]`, `docs → [DOCS]`.
- **`[TARGET]`** — the base branch this PR merges into:
  `develop → [DEV]`, UAT branch → `[UAT]`, `master → [PROD]`.
- **`[TICKET]`** — the ticket ID this Unit carries: the `UNIT-XXX-YY` Story/Bug
  (e.g. `[UNIT-004-02]`), or the `INTENT-XXX` Epic when the PR spans the whole Intent.
  These are the IDs from `{{AIDLC_ROOT}}/ISSUE-TRACKER-TEMPLATE.md`, mirrored into the GitHub
  Project. **Omit this tag entirely** when the change has no ticket (e.g. repo tooling or
  config) — never write an empty `[]`.
- **`<summary>`** — a plain, human-readable sentence under ~70 chars. No `type:` prefix.

Examples:
- `[FEATURE][DEV][UNIT-004-01] Add branch-override selector to the environment form`
- `[FIX][PROD][UNIT-004-02] Correct username derivation collision`
- `[CHORE][DEV] Replicate Claude skills to Kiro` *(no ticket → no third tag)*

### 4. Self-review before asking for human time

Before flagging for human review, re-read the diff once against the Unit's own
Acceptance Criteria and the Quality Architecture Contract's Required Test Coverage
table. Catch what's catchable here — a missing negative-path test, an unhandled error
case — so the human's review time goes to judgment calls, not things this Skill could
have caught itself.

### 5. Poll CI, self-correct on failure

On a Guardrail Gate failure, self-correct and push again. Never ask for review while a
gate is red.

### 6. Iterate on review comments

Once the human leaves review comments (`gh pr view <n> --comments` or the GitHub MCP
server's structured comment tools, if configured):

1. Read every open thread before changing anything — don't react comment-by-comment in
   isolation when they interact.
2. Address each with a targeted commit, not a rewrite of the whole diff.
3. Reply to each thread stating what changed, then re-request review. Never mark a
   thread resolved that this Skill left open-ended or partially addressed.

### 7. Hand off to Merge Approval

Once review is approved and every gate is green, flag the PR ready. Stop there. For a
`hotfix/`, note explicitly in the PR that a second merge into `develop` is still needed
after `master` receives this one — never assume the human will remember to ask for it.

### 8. Close out the ticket after the merge lands

The human merges, not this Skill (step 7) — so the ticket update happens the next time you
observe the PR has merged, not as part of opening it. This step exists because it is easy to
miss: a Construction PR merges but the board is left showing a stale `Backlog`, needing a
manual flip later. Closing the ticket is part of closing the Unit, not an optional follow-up.

Once a Construction PR has merged (confirm with `gh pr view <n> --json state,mergedAt`),
transcribe the resulting state onto the configured tracker (`project-ticketing` Skill steps
3–4 and `{{AIDLC_ROOT}}/ISSUE-TRACKER-TEMPLATE.md` §4):

1. Move each **Story** the PR delivered to **Merged**.
2. If — and only if — **every** child Story of its Epic is now Merged, roll the **Epic** to
   **Intent Complete**. Check the siblings first; don't flip the Epic on a partially-
   delivered Intent.

This is a **transcription of a merge that already happened**, not an approval the agent
grants — the same "propose, don't dispose" footing as every other ticket field it writes.
It never touches the Release Checkpoint (that's the Release Plan Skill's call —
`{{AIDLC_ROOT}}/ISSUE-TRACKER-TEMPLATE.md` §3). If you pick up work on an Intent and notice a
prior Unit's merge was never reconciled on the board, fix it then as part of this same step
rather than leaving it for another manual catch.

## Boundaries

- Never merge the pull request, and never approve its own PR — Merge Approval is a
  human gate this Skill can reach but not cross. (Repo branch protection enforces this
  independently of this instruction.)
- Never commit directly to `master` or `develop` — always through a typed branch, even
  for a one-line fix.
- Never resolve a review thread on the human's behalf.

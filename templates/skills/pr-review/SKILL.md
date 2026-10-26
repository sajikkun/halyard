---
name: pr-review
description: Evaluates an open pull request against this repo's established conventions (branch type, base branch, commit/PR-title format, CI gate status, path and file-shape conventions, PROJECT-RULES.md) and recommends one of three outcomes -- approve and merge, close and delete, or request changes -- with reasoning for each check. Never merges, approves, closes, deletes a branch, or submits a review itself; the human takes the actual action. Use when asked to review a pull request, evaluate a PR, or decide whether to approve, close, or request changes on one.
invoked_by: On demand, by request -- "review PR #N" or "run the PR Review Skill on PR #N"
output: a recommendation report to the conversation, plus a suggested review-comment draft. No file written, no GitHub action taken.
version: 1.0
---

# PR Review Skill

Reads a pull request against this repo's *current* conventions and recommends one of
three outcomes. The rules it checks against are never hardcoded here — they live in
`.claude/skills/github/SKILL.md` and `nvaid/PROJECT-RULES.md`, read fresh every
time, so this Skill can't drift out of sync with the conventions as they evolve.

**This Skill never takes the action it recommends.** It doesn't call `gh pr merge`,
`gh pr close`, `gh pr review --approve`, `gh pr review --request-changes`, or delete a
branch. It reports a recommendation and reasoning; a human reads it and acts.

## Steps

### 1. Gather the facts

```
gh pr view $ARGUMENTS --json title,body,headRefName,baseRefName,author,state,mergeable,reviewDecision,statusCheckRollup,files
gh pr diff $ARGUMENTS
```

Also re-read `.claude/skills/github/SKILL.md` (this repo's copy) and
`nvaid/PROJECT-RULES.md` before judging anything — the checks below are applied
against whatever those files currently say, not a memorized version of them.

### 2. Check branch type against actual content

- Does `headRefName` match one of the branch types `github/SKILL.md` currently defines
  (`feature/<story-id>`, `bugfix/<bug-id>`, `hotfix/<slug>`, `intent/<intent-id>-slug`, `elaboration/<intent-id>-slug`,
  or whatever it's since been extended to)?
- Does the branch **type** actually match what changed? Code changes on an `intent/`
  branch, contracts or a unit-breakdown on an `intent/` branch (they belong on the stage-2
  `elaboration/` branch), or a pure-documentation Elaboration artifact on a `feature/` branch, is a
  category error. A category error here means the PR is built on the wrong foundation
  and can't be fixed by pushing more commits to the same branch.

### 3. Check base branch

`develop` in almost every case; `master` only for a declared `hotfix/`. Anything else
is wrong regardless of how good the content is.

### 4. Check CI status

Every entry in `statusCheckRollup` must be a pass. Any `pending` or `failing` gate means
this isn't ready for a merge/close/request-changes decision yet at all — say so plainly
rather than forcing one of the three outcomes prematurely.

### 5. Check commit and PR-title format

Against whatever `github/SKILL.md` currently specifies (Conventional Commits for commit
messages; the PR title format, once one is defined). Stray artifacts from an unrelated
project or template — a ticket ID, a company name, placeholder text that was clearly
never adapted to this project — are a flag here even if the format is otherwise followed
correctly.

### 6. Check path and file-shape conventions

Compare every changed/added file's path against this repo's established shape
(`nvaid/intents/INTENT-XXX-slug/`, `.claude/skills/<name>/SKILL.md`, `deploy/`,
etc. — read from `PROJECT-RULES.md` and the existing repo tree, not assumed). A new
top-level convention appearing alongside an existing one for the same concept (two
different intent-tracking shapes, two different daily-report mechanisms) is a
duplication flag, not something to wave through because each one is internally
consistent.

### 7. Check for semantic duplication

Does this PR introduce a Skill, file, or concept that already exists under a different
name? Read the existing `.claude/skills/*/SKILL.md` descriptions and compare — a new
Skill whose description overlaps meaningfully with an existing one is worth flagging
even if no path literally collides.

### 8. Check the PR description itself

Per `github/SKILL.md` Step 3: does the body link the relevant design doc / contract and
name the Acceptance Criteria it closes, where applicable? A PR with no explanation of
what changed or why is weaker evidence for a decision, not a blocker on its own.

### 9. Synthesize one of three recommendations

- **Approve and merge** — every check above passes; nothing outstanding.
- **Close and delete** — a foundational defect (wrong branch type/category error, or
  fully superseded by other already-merged work) that pushing more commits can't fix.
  The right move is recutting on a corrected branch, not iterating in place.
- **Request changes** — the branch and approach are sound, but something specific and
  fixable is wrong (a stray example, a missing description detail, a failing test to
  correct). Iterating on the *same* branch is the right move here, unlike Close.

Output, in this order:

1. **Recommendation** — one of the three, in bold.
2. **Brief justification** — one sentence, the single core reason driving the verdict.
   Not a summary of every check — the one fact that would change the verdict if it
   weren't true.
3. **Reasoning per check** (pass / fail / flagged) — the full breakdown backing up the
   one-line justification, so the human can see exactly what it's based on, not just
   take the verdict on faith.

### 10. Draft a suggested review comment

Write the comment the human could paste in as-is, or edit — summarizing the finding(s)
driving the recommendation. Never post it — output it in the conversation only.

## Boundaries

- Never run `gh pr merge`, `gh pr close`, `gh pr review`, or delete a branch. Report
  and recommend; the human's own review submission and merge/close click is the action.
- Never treat "CI is green" alone as sufficient for Approve — CI verifies code
  correctness, not convention compliance, path correctness, or duplication, which are
  exactly what this Skill exists to catch that CI can't.
- Never soften a Close-and-delete finding into a Request-changes one to avoid
  recommending a branch be redone — a category error doesn't get smaller by wishing it
  were a smaller fix.

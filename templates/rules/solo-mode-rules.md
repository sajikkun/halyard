---
document: Solo-Mode Operating Rules
project: "{{PROJECT_NAME}}"
version: 1.0.0
status: generated
modes: [solo]
---

# Solo-Mode Operating Rules

This project runs halyard in **solo mode** (`halyard/config.yml` → `mode: solo`). One developer
(`config.yml` → `developer`) owns the whole lifecycle. The workflow keeps its order, its
human gates, and its rules. What changes is **who** signs off and **how many documents**
Elaboration produces.

The other rule files under `halyard/rules/` were written for a team, and they apply here
unchanged except for the role mapping below. Read them through this file.

## 1. Role mapping

Wherever a rule file, skill, or template names one of these, read it as **the developer**:

| Team wording | Solo meaning |
|---|---|
| Solutions / Frontend / Backend / Quality / Customer Experience Architect | the developer, wearing that role's hat |
| Process Facilitator, CX Architect (BA/PM) | the developer |
| "the room", Mob Elaboration Phases 2–5, "negotiate live" | the developer reviewing the draft alone |
| an Architect's Sign-Off on a contract | the developer's sign-off on that section of `design.md` |
| Release Planning Day, R3 | the developer, on their own schedule |

The role *lenses* stay. Each section of `design.md` still asks the questions its role's
contract-generation rules ask. One person answering all of them is the reason to keep them
written down, not a reason to skip them.

## 2. The guardrails don't relax

- **Propose, don't dispose** (PROJECT-RULES §7 rule 1) still holds. The AI never approves,
  merges, or signs off on the developer's behalf. Being the only human doesn't make the AI
  the second one.
- **Both Elaboration gates stay.** They are still PRs into `develop`, and the developer
  passes each one by **merging it themselves** (§4).
- **Multi-repo families stay.** A solo developer can split frontend and backend into
  separate repos, so one can be forked or made public on its own. `family.repos`, the
  family-wide Intent and ADR numbering (family rules 14–15), Owning Repo tags, and the
  cross-repo hand-off in `/hyd:apply` all apply exactly as in team mode.
- **Git Flow stays.** `master` is production, `develop` is ongoing integration work, and
  every change goes through a typed branch.

## 3. `design.md`: one document in place of the per-role contracts

A team produces one contract file per role plus a separate `unit-breakdown.md`. Solo mode
produces **one file**:

`halyard/intents/<repo-name>.<INTENT-ID>-<slug>/design.md`

Each section is drafted by that role's Skill and must meet **everything** its
`*-contract-generation-rules.md` requires. Only the container is different. A section whose
role isn't pulled in for this Intent keeps its heading and states
`Not pulled in — <one-line reason>` instead of disappearing.

```markdown
---
document: Design
intent: INTENT-XXX
title: "<Intent title>"
owner: "[developer name]"        # left as a placeholder: it records sign-off (family rule 16)
status: draft                     # draft → approved, only by transcribing the stage-2 merge
covers_units: []                  # every UNIT-ID in §7, kept in sync
last_updated: "[YYYY-MM-DD]"
---

# INTENT-XXX — <title> — Design

> Draft, awaiting the developer's sign-off (merge of the stage-2 elaboration/ PR).

## 1. Solutions
<!-- solutions-architecture-contract-generation-rules.md: boundaries, what this Intent may
     and may not touch, new containers, ADRs needed, and the Consistency Gate across §2–§6 -->

## 2. Backend
<!-- backend-architecture-contract-generation-rules.md: API contract (with error cases),
     shared derivation rules, data model touches and migrations, components touched,
     deliberate exclusions -->

## 3. Frontend
<!-- frontend-architecture-contract-generation-rules.md: which §2 shapes it consumes
     verbatim, concrete UI flow per screen/component, identity/access implications,
     components touched -->

## 4. Other tiers
<!-- platform, infra, mobile, data — one ### subsection per tier this Intent touches,
     or "None for this Intent" -->

## 5. Quality
<!-- quality-architecture-contract-generation-rules.md: Required Test Coverage table, every
     row traced to a §7 Acceptance Criterion and every criterion covered; NFRs; Known Gaps -->

## 6. Customer experience
<!-- customer-experience-contract-generation-rules.md: where the final shape narrowed or
     held against intent.md, Final Acceptance Criteria, concrete validation scenario -->

## 7. Unit breakdown
<!-- written by /hyd:breakdown per unit-breakdown-rules.md. One ### subsection per Owning
     Repo (the owning_repo values in the family: frontend, backend, platform, …). Each Unit:
     ID, Story|Bug, owning role, Acceptance Criteria, which §1–§6 sections it implements. -->

### 7.1 backend
### 7.2 frontend

## 8. Sign-off
| Gate | Status | Evidence |
|---|---|---|
| Intent Approved | [status] | stage-1 PR #[n], merged by [name], [commit], [date] |
| Decomposition Approved | [status] | stage-2 PR #[n], merged by [name], [commit], [date] |

## Change log
| Version | Date | Change | Author |
|---|---|---|---|
```

Rules for the file:

- **Order of drafting:** `/hyd:contracts` writes §1–§6. `/hyd:breakdown` writes §7 and
  then reconciles `covers_units` and the §5 test table against the final cut. A team's
  separate `unit-breakdown.md` doesn't exist in solo mode. §7 is the decomposition of
  record, and `/hyd:apply` reads it.
- **Grouping by repo is required in §7**, even when the family is a single repo. Splitting a
  repo later is then a matter of moving subsections, not re-cutting Units.
- **§2 is the single source of shared shapes.** §3 and §4 point at §2 rather than restating
  a field or a derivation, the same rule the team contracts follow across files.
- **§8 is filled only by transcription** (§4 below), never in advance.

## 4. Gates in solo mode

GitHub does not let anyone approve their own pull request, so a solo gate can't require an
`APPROVED` review. In solo mode **the developer's merge is the approval**:

| Gate | Passed when | Evidence the AI transcribes |
|---|---|---|
| Intent Approved | the stage-1 `intent/` PR is merged into `develop` | PR number, `mergedBy`, merge commit, date |
| Decomposition Approved | the stage-2 `elaboration/` PR (holding `design.md`) is merged into `develop` | same |
| Merge Approval (per Unit) | the Construction PR is merged | same |

Read the evidence with `gh pr view <n> --json state,mergedBy,mergeCommit,mergedAt`. An open,
closed-unmerged, or missing PR means the gate has **not** passed: stop and say so. The AI
opens these PRs and never merges them.

If `develop` has branch protection that requires an approving review, the developer can't
merge their own PR. Point this out and suggest setting the required approvals to 0 for
`develop`, keeping the required status checks. Never work around it by pushing straight to
`develop`.

## 5. Optional in solo mode

- **The tracker board.** Leave `family.project_board` empty to work without GitHub Projects.
  Then `design.md` §7 is the backlog, family rule 11's ticket steps are skipped, and
  cross-repo hand-offs become plain GitHub issues in the owning repo. If a board is set, the
  ticket rules apply as written, and every "owner/assigns/grants" column means the developer.
- **Release Checkpoints.** Use Milestones if you want to batch Intents into releases.
  Assigning one is still never automatic. The developer decides.
- **Daily construction updates.** Not shipped in solo mode. There's nobody to report to.

---
document: Issue Tracker Integration (GitHub Projects)
project: "{{PROJECT_NAME}}"
version: 0.4.0
owner: "[Process Facilitator name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Issue Tracker Integration

**What this file is:** the field shape and creation rules for how Fig. 2's Intent-to-Release
artifacts show up in GitHub Projects — one Epic per Intent, one Story or Bug per
Unit of Work, bundled for shipping by Release Checkpoint rather than by sprint — so the
tracker and the `halyard/` artifacts never disagree about what was decided.

**What this file is not:** not a replacement for `intent.md`, `unit-breakdown.md`, or any
contract file. The tracker is the *tracking* layer — status, ownership, checkpoint
placement, at-a-glance search. The artifacts are the *content* layer — what was actually
agreed, in full, versioned in git. A ticket field never carries content that only exists in
the ticket; if it's worth writing down, it's worth writing into the file the AI agent
actually reads, and the ticket links to it.

**Companion files:** [PROJECT-RULES.md](../PROJECT-RULES.md) §7 rule 11 is the operating
rule this file implements. [unit-breakdown-rules.md](./unit-breakdown-rules.md) governs
*how* a Unit of Work is decided and classified before it ever becomes the ticket
described here. The worked example in `docs/templates/samples/` is what every link below
would actually point at for `INTENT-004`.

**Why no sprints:** Scrum's sprint boundary is a batching mechanism for coordinating fixed
human capacity in fixed time boxes. Once a Unit of Work is small, AI-implemented, and gated
independently rather than committed to as part of a sprint's bundle, the fixed box adds
waiting without adding structure. This file uses continuous, pull-based flow instead — see
§3 for the checkpoint that replaces the sprint as the unit of release planning.

---

## 0. The Rule This File Exists to Enforce

A ticket holds three kinds of information, and only two of them belong in ticket fields:

1. **Tracking metadata** (status, gate state, checkpoint, owner) — belongs in ticket
   fields. This is what GitHub Projects boards are good at, and it's fine for it to live only
   there.
2. **Links to content** (the Intent, the contracts, the design docs) — belongs in ticket
   fields, as links, never as pasted text.
3. **The content itself** (what the API contract actually says, what the acceptance
   criteria actually are) — belongs *only* in the `halyard/` artifact. Pasting it into
   a ticket description creates a second copy that drifts the first time either one is
   edited without the other, and the AI agent isn't the one reading the ticket anyway — it
   reads the file.

## 1. Epic — one per Intent

Created by the AI agent immediately after the Decomposition Approved gate (Fig. 2, Stage
3) — not before, since the Epic's content depends on Joint Elaboration having actually
happened.

| Field | Value | Set By |
|---|---|---|
| Issue type | Epic | — |
| Title | `[<INTENT-ID>] <business objective, short>` | AI |
| Intent ID | e.g. `INTENT-004` | AI |
| Link — Intent | permalink to `intent.md` | AI |
| Link — Unit Breakdown | permalink to `unit-breakdown.md` | AI |
| Gate: Decomposition Approved | status / approver / date | AI transcribes the stage-2 `elaboration/` PR's approval and merge (family rule 11) — never grants it |
| Contracts produced | links only, e.g. Solutions / Backend / Frontend / Quality / CX &mdash; each to its own file | AI, from the Contracts Produced table in `unit-breakdown.md` |
| Role explicitly not pulled in | e.g. `devops: not pulled in — see devops-architecture-contract.md` | AI |
| Epic owner (accountable human) | Customer Experience Architect (BA/PM) | AI sets, human is the actual owner |
| Status | see §4 | AI, mechanically |
| Release Checkpoint | *(blank at creation)* | **Process Facilitator**, following the CX Architect's prioritized backlog — see §3 |

**Contracts live here, not on the Story.** Architecture Contracts are produced once per
Intent, at Joint Elaboration — they are never re-created per Unit of Work. A Story (§2)
links to whichever of *this* Epic's contracts are relevant to it, via that contract's own
`covers_units` field; it does not carry its own copy or its own contract.

**Worked example (`INTENT-004`):** Title `[INTENT-004] Developer Provisions a mycv
Environment with a Branch Override`; contracts linked for Solutions, Backend, Frontend,
Quality, and CX; DevOps flagged not pulled in, linking `devops-architecture-contract.md`.

## 2. Story or Bug — one per Unit of Work, child of its Intent's Epic

Created as a stub alongside the Epic (Stage 3), status `Backlog`; filled in as the owning
role's Per-Role Authoring (Stage 4) and its gate (Stage 5) complete. **One Unit of Work is
always exactly one Story or one Bug** — never a separate ticket type, never both. Which
one is decided by `unit-breakdown-rules.md` §3's classification rule (new/changed
capability &rarr; Story; existing shipped behavior violating its own spec &rarr; Bug), not
by the tracker.

| Field | Value | Set By |
|---|---|---|
| Issue type | `Story` or `Bug` — a GitHub Issue labeled `type:story` / `type:bug`, as a sub-issue of the Epic — per `unit-breakdown-rules.md` §3 | AI |
| Title | `[<UNIT-ID>] <short description>` | AI |
| Unit ID | e.g. `UNIT-004-02` | AI |
| Owning role | e.g. Backend Solutions Architect | AI, from `unit-breakdown.md` |
| Link — Unit design | permalink to `unit-XXX-design.md` | AI, added at Stage 4 |
| Link — Gate approval | permalink to `gate-approval-unit-XXX.md` | AI, added at Stage 5 |
| Relevant contracts | a **list** of links, one per Epic contract whose `covers_units` names this Unit &mdash; a Story routinely carries more than one | AI |
| Gate: Per-Unit Design Approved | status / approver / date | AI transcribes; owning Architect grants |
| Merge Approval | status / approver / date / PR link | AI transcribes; owning Architect grants |
| Status | see §4 | AI, mechanically |
| Release Checkpoint | *inherited from the parent Epic — not set independently* | — |

**A Story never carries its own Release Checkpoint.** All Units of Work under one Intent
ship in the same checkpoint as that Intent — splitting them across two checkpoints would
mean the Intent's own success criteria could be satisfied on one deploy and not the other,
which breaks the reason the Intent was decomposed as a whole in the first place.

**Sub-tasks are not a default part of this shape.** A Unit of Work is already sized to be
one AI-implementable increment (Fig. 2, Stage 6) — splitting it into sub-tasks by default
would just be re-inventing what the Unit boundary already does. Add a sub-task only if the
Unit's own design doc identifies a genuinely separable implementation chunk, and let that
doc, not the ticket, be the reason why.

## 3. Release Checkpoint — a bundle of Intents, not a date

Replaces the sprint as the unit of release planning. A Release Checkpoint is a **named,
content-defined set of Intents** assigned to ship together — mapped directly onto GitHub
Projects' native **Milestone** construct rather than a bespoke one. A Milestone already
carries the right semantics out of the box: a bundle of issues, a completion percentage,
and a close action — no custom issue type needed.

**Completion rule:** a Release Checkpoint is **Released** — deployment happens — only once
*every* Epic assigned to it has reached **Intent Complete**: every one of its child
Stories has reached `Merged`, and each Story's own Definition of Done (`PROJECT-RULES.md`
§5.1, which already includes the Design-Code Dictionary update) was satisfied on the way
there. This is deliberately all-or-nothing: one straggler Intent holds the whole checkpoint
back. That's a real tradeoff, not a hidden one — it buys a release that always contains a
coherent, fully-tested set of capabilities, at the cost of a fast Intent sometimes waiting
on a slow sibling. If that tradeoff stops being worth it for a given checkpoint, split it
into two smaller checkpoints — don't quietly ship a partial one.

**Who assigns what:**

- The **CX Architect (BA/PM)** decides which Intents belong together and in what order —
  this is the prioritized backlog they already own (see the Roles table).
- The **Process Facilitator** turns that priority into the actual checkpoint assignment
  (moving the Epic into the Milestone) and watches flow — if a checkpoint's
  scope stops looking realistic given current throughput, that's flagged, not silently
  absorbed by working longer hours.
- **Release Approval** (Fig. 2, Stage 10) is granted at the checkpoint level by the
  Solutions Architect + CX Architect, once every contained Epic shows Intent Complete —
  read Stage 10 in Fig. 2 as operating on the checkpoint, not on a single Intent in
  isolation.

## 4. Status — Story and Epic tracked separately

Kanban-shaped: continuous flow through named columns, not a sprint burndown. Suggested WIP
limits apply only at genuinely constrained (human-gated) columns — AI-only stages aren't a
shared human resource in the same way, so capping them is a pipeline-capacity question, not
a flow-discipline one.

### Story

| Status | Fig. 2 stage | Set by | Suggested WIP limit |
|---|---|---|---|
| Backlog | 3 &middot; Decomposition Approved | AI creates | none — it's the queue |
| Design In Progress | 4 &middot; Per-Role Authoring | AI | &asymp;1&ndash;2 per owning role in parallel |
| Design Approved | 5 &middot; Gate passed | AI transcribes; owning Architect grants | transient, no cap needed |
| In Progress | 6 &middot; Implementation | AI | pipeline-capacity bound, not human-bound |
| Gates Running | 7 &middot; Automated Gates (incl. self-correct loop) | AI / pipeline | pipeline-capacity bound |
| Merge Pending | 7 passed, awaiting 8 | AI | &asymp;1&ndash;2 per owning Architect &mdash; keeps approvals from queuing into a rubber-stamped batch |
| Merged | 8 &middot; Merge Approved | AI transcribes; owning Architect grants | &mdash; |

### Epic

| Status | Meaning | Set by |
|---|---|---|
| Backlog | Decomposition Approved, not yet assigned a Release Checkpoint | AI creates |
| In a Checkpoint | Assigned; child Stories in flight | Process Facilitator assigns; status itself rolls up automatically |
| Intent Complete | Every child Story is `Merged`, DoD satisfied on each | AI, mechanically, once true |
| Released | Its Release Checkpoint has been approved and deployed | AI transcribes; Solutions Architect + CX Architect grant, at the checkpoint (§3) |

## 5. Who Creates, Who Schedules

- **The AI agent creates and maintains every issue** — Epic and Story, every field in §1
  and §2 except Release Checkpoint — as a direct, mechanical byproduct of the artifacts it
  already produces. This is reversible (edit or close an issue, nothing breaks) and
  evidence-based (every field is a transcription of something already decided in a file),
  so it fits the same "propose, don't dispose" rule that governs the agent's other
  unsupervised actions — see `PROJECT-RULES.md` §7.
- **A human is the only one who assigns a Release Checkpoint** — see §3's split between the
  CX Architect (priority) and the Process Facilitator (the actual assignment and flow
  health). That's a scope and capacity call the agent has no real visibility into.
- **Gate and approval fields are transcriptions, not grants.** The AI agent writes
  "Design Approved: yes, [Architect], [date]" into the ticket only after that approval
  already exists in the corresponding `gate-approval-unit-XXX.md` file — it never sets an
  approval field as an independent action.

**Known limitation, stated plainly:** GitHub Projects has no built-in
permission that technically restricts *which fields* an integration can write — unlike a
git branch-protection rule, "AI never assigns a Release Checkpoint" is a process convention
enforced by this document and spot-checked at the Process Facilitator's regular review, not
a hard technical lock. If the harness's tracker integration ever supports scoped field
permissions, tighten this from convention to enforcement and update this section.

## 6. GitHub Projects — mechanics

| Concept | GitHub Projects |
|---|---|
| Epic | Tracking issue with native sub-issues, or a Project grouping field |
| Story / Bug | Issue, labeled `type:story` / `type:bug`, added as a sub-issue of the Epic |
| Custom fields (Intent ID, Gate status, etc.) | Project custom fields (single-select for status-like values) |
| Release Checkpoint | Milestone |
| Sprint / Iteration | Native field — **deliberately unused** under this flow model |
| Link to repo artifact | Link or reference the file path / permalink directly |

## 7. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Question raised while reviewing the Mob Elaboration Ceremony: how do Jira/GitHub tickets relate to these artifacts |
| 0.2.0 | [date] | Replaced Sprint/Iteration with Release Checkpoint (Fix Version / Milestone, bundling Intents, all-or-nothing completion); split the Story and Epic status enums; added WIP-limit guidance; clarified contracts are Intent-level, referenced per-Unit via `covers_units`, never duplicated per Story | Kanban-vs-Scrum discussion; clarifying question on Intent/Unit-of-Work/contract relationships |
| 0.3.0 | [date] | A Unit of Work is now explicitly Story *or* Bug, classified by `unit-breakdown-rules.md` §3; clarified a Story/Bug carries a list of contract links, not a single one | New companion file: `unit-breakdown-rules.md` |
| 0.4.0 | 2026-10-14 | Dropped Jira — GitHub Projects is the only PM tool. Removed the Jira column from the §6 mechanics table, the "Jira native types" cell, the Jira "Fix Version" release-construct row, and the dual-tool wording in the title and intro | Jhay Bagas (AI-assisted draft) |

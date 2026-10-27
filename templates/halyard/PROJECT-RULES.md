---
document: Project Standards & Engineering Rules
project: "<project name>"
version: 0.1.0
owner: "<owner name>"
last_updated: "<YYYY-MM-DD>"
status: draft
---

# <project> — Project Standards & Engineering Rules

> **Template dropped by `hyd init` — HAND-OWNED, fill this in.**
> `hyd update` never overwrites this file. It is intentionally project-specific:
> halyard ships the universal skills and contract/unit rules, but *this* file is where a
> developer records what is unique to this repo — the approved stack, the guardrails, the
> data rules. Delete these template notes once you have real content.

## 1. What this project is

<One short paragraph: the objective, this phase's scope, explicit non-goals. The "why"
an agent needs in the same file as the "how".>

## 2. Architecture principles & constraints

### 2.1 Approved technology stack

| Layer | Approved | Disallowed without an ADR |
|---|---|---|
| <e.g. Backend> | <language/framework> | <what's off-limits> |
| <e.g. Frontend> | <framework> | <what's off-limits> |
| <e.g. Data store> | <engine> | <what's off-limits> |

### 2.2 Non-negotiable constraints

- <e.g. deployment target, network posture, build output format — things an agent must
  not quietly change.>

### 2.3 Architecture Decision Records (ADRs)

<Where ADRs live and the rule to check them before proposing a change in an area one
already covers.>

## 3. Data rules

- <How tenant/user/domain data is handled; what the project's own data is vs. isn't;
  secret-handling discipline.>

## 4. Design & coding standards

- Follow the existing file/module layout; flag any new structural pattern.
- Documentation bar (docstrings, module responsibilities) applies to AI-generated code
  the same as human-authored.
- Linter/formatter config: <link once established>.

## 5. Quality & testing rules

### 5.1 Definition of Done (per Unit of Work)

- [ ] The Unit's stated Acceptance Criteria are met and each traces to a covering test.
- [ ] Static analysis / security scan passes with no unresolved High findings.
- [ ] Merge approved by {{#team}}the owning reviewer{{/team}}{{#solo}}the developer (by merging){{/solo}} on gate evidence.
- [ ] `halyard/DESIGN-CODE-DICTIONARY.md` updated for every component added/moved/removed.

### 5.2 Quality gates (CI gates that must pass before merge)

<List the gates CI enforces for this project — build, unit test, coverage floor,
code quality, security scan, etc. Keep project-wide gates here; per-Intent gates come
from each {{#team}}Quality Architecture Contract{{/team}}{{#solo}}`design.md` §5 Quality section{{/solo}}.>

## 6. Known gaps (do not silently resolve)

- <Open questions the agent must treat as questions, not assumptions to fill in.>

## 7. AI operating rules (guardrails, not suggestions)

Rules **1–10** below are this repo's universal guardrails (edit the bracketed specifics for
your project). Rules **11 and up are family-wide** and are maintained in the generated
`halyard/rules/family-rules.md` — do **not** restate them here; change them upstream in halyard.
They bind this repo exactly as 1–10 do.
{{#solo}}
This project runs in **solo mode**: read every rule, here and in `halyard/rules/`, through
`halyard/rules/solo-mode-rules.md`, which maps each team role to the developer.
{{/solo}}

1. **Propose, don't dispose.** Draft requirements, designs, code, and tests — a named
   human approves before anything is merged, deployed, or treated as final. Never approve
   your own gate.
2. **Ask before assuming.** If a requirement, data-handling rule, or architectural
   direction is ambiguous, ask a clarifying question rather than filling the gap with the
   most likely-sounding assumption.
3. **Respect existing decisions.** If a request conflicts with an accepted ADR, this file,
   or an already-approved design, flag the conflict explicitly rather than quietly
   resolving it either way.
4. **No unreviewed new dependencies.** Do not add a new library, service, or external API
   call without flagging it for {{#team}}the reviewing Architect{{/team}}{{#solo}}the developer{{/solo}}, even if it seems like the
   obviously correct tool.
5. **Off-limits without explicit approval:** production infrastructure config, deploy
   pipelines, anything under `[infra/prod/** — adjust to your layout]`.
6. **No sensitive data in context.** Never paste unmasked credentials or production data
   into a prompt or session.
7. **No destructive or irreversible actions without explicit confirmation for that
   specific action** — force-push, hard reset, dropping tables, bulk deletes. Never delete
   a file without confirming a backup exists or the file is committed under version
   control; when in doubt, move it aside instead of deleting it.
8. **Scope discipline.** Keep each unit of work scoped to one task. If a session's context
   grows large enough to risk losing earlier reasoning, checkpoint (commit, update
   artifacts) rather than pushing through in one long session.
9. **Artifact hygiene is part of the task.** Generating code without updating the
   corresponding `halyard/` artifacts — this file and the Design-Code Dictionary included —
   is an incomplete task, not a finished one.
10. **Identify AI-assisted changes as such** in commit messages and PR descriptions, so
    the reviewing human knows what to scrutinize. All AI-generated code is treated as
    untrusted until reviewed — the same standard applied to code from a new contributor.

**11 and up — family-wide rules.** See `halyard/rules/family-rules.md` (generated). It
covers ticketing (11), unit decomposition (12), contract generation (13), family-wide
Intent numbering (14), family-wide ADR numbering (15), and artifact-placeholder resolution
(16).

## 8. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1.0 | <YYYY-MM-DD> | Initial draft from the halyard template | <name> |

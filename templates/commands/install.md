---
command: hyd:install
description: Scan the project and fill in the three required halyard documents (config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md). Must run before /hyd:intent.
stage: "halyard onboarding — run once, first, before any workflow command"
blocks: [hyd:intent, hyd:contracts, hyd:breakdown, hyd:apply]
---

# /hyd:install

The **first** command to run after `hyd init`. `init` only drops empty templates; this
skill makes halyard actually usable by scanning the project and authoring the three required
documents. **Every other halyard workflow command is blocked until this completes** — running
`/hyd:intent` against unfilled templates would produce hollow, confidently-wrong output.

## Why this is a skill, not a CLI step

The CLI can detect facts (languages, frameworks from manifest files) but cannot author
*judgment*: a project's guardrails, its design patterns, what breaks if a given module
changes. That requires reading the actual code and reasoning about it — the agent's job,
not a file-scan's. This skill does that reading. A human reviews before it's marked done
(propose, don't dispose).

## Steps

1. **Scan the project.** Read manifest files (`package.json`, `pyproject.toml`, `go.mod`,
   lockfiles), the directory structure, config, CI workflows, and a representative sample
   of source to understand the stack, the architecture, and the conventions in use.

2. **Fill `halyard/config.yml`** — replace every `<placeholder>`:
   - `project_name`, `owning_repo` (frontend | backend | platform | other — infer from the
     code, confirm with the user if ambiguous).
   - `tech_stack` — fill from what you actually found in the manifests, not assumptions.
{{#team}}
   - `architects` — these are sign-off identities you cannot infer from code. **Ask the
     user** for the names; leave a role blank only if the user confirms it doesn't apply.
{{/team}}
{{#solo}}
   - `developer` — the one sign-off identity in solo mode. **Ask the user** for the name
     to record; don't infer it from `git config`.
   - `family.repos` — ask whether this project is (or will be) split across repos, e.g. a
     public backend and a private frontend. List every repo in the family, or just this one.
{{/solo}}
   - `context` — the short, always-on constraints worth repeating to every agent.

3. **Author `halyard/PROJECT-RULES.md`** — replace the template skeleton with real content:
   the approved stack and what's disallowed without an ADR, non-negotiable constraints,
   data rules, coding standards, the quality gates CI actually runs, and known gaps.
   Derive what you can from the code (e.g. the lint/test config that exists); for anything
   that is a *decision* rather than a fact (what's allowed, what's off-limits), propose it
   and flag it for the user to confirm — do not invent a guardrail the project hasn't made.
   - **§7 holds rules 1–10 only** (per-repo guardrails). The family-wide rules **11+** live
     in the generated `halyard/rules/family-rules.md` and are referenced, never restated,
     from §7. **Migration:** if this repo previously hand-copied the family rules (11–15)
     into its PROJECT-RULES — as some repos did before halyard managed them — **delete those
     hand-copied rules now** and keep only the §7 reference to `family-rules.md`. `halyard
     update` never touches PROJECT-RULES, so a leftover hand-copy would diverge from the
     synced family rules silently. Set `family.{owner,project_board,repos}` in
     `halyard/config.yml` so rules 14/15's family-wide checks resolve the right sibling set
     (not a blanket org list).

4. **Author `halyard/DESIGN-CODE-DICTIONARY.md`** — the technical README for the code:
   the design patterns and conventions in use (with real file examples), and the component
   map (concept → where it lives → what it depends on → what breaks if changed). This is
   narrative derived from reading the code; §1 references `config.yml`'s `tech_stack`
   rather than repeating it. Be honest in the "not yet mapped" section about coverage.

5. **Set up ADRs (Architecture Decision Records) — the project's decision anchors.**
   ADRs are where a significant decision is justified and preserved, so the project (and
   any future agent) can trace *why* a choice was made and revisit it later. Create them
   on demand, not as empty ceremony:
   - If authoring PROJECT-RULES (step 3) surfaced genuine, non-obvious decisions — an
     approved-stack choice, a deliberate constraint, something a reviewer might otherwise
     question — **create `halyard/adr/`** and seed one ADR per such decision using the
     template below. **Number them per the family-wide ADR-numbering rule** (the next
     number not already used across the repo family — see PROJECT-RULES §7); do NOT just
     start at `ADR-001` per repo, which collides on the shared board. These are decisions
     the project has already made — but see the status note below: you *draft* them, a
     human *accepts* them.
   - If the project is simple enough that no decision needs anchoring yet, **do not create
     an empty `adr/` folder** — just tell the user ADRs will be added when the first real
     decision arises (e.g. via the `solutions` skill flagging "needs a new ADR"). The
     folder appears when there's a decision to put in it.
   - Each ADR follows this shape:
     ```markdown
     ---
     adr: ADR-NNN
     title: "<the decision, stated as a choice>"
     status: proposed            # proposed | accepted | superseded by ADR-XXX
     date: "<YYYY-MM-DD>"
     ---
     # ADR-NNN — <title>
     ## Context
     <the forces at play: what problem/constraint prompted this decision>
     ## Decision
     <what was decided, stated plainly>
     ## Consequences
     <what this makes easier, what it makes harder, what it rules out>
     ## Alternatives considered
     <options weighed and why they lost — so the decision can be revisited with the same context>
     ```
   - **Every ADR you create starts `status: proposed`, never `accepted`.** You draft it; a
     named human (the Solutions Architect) accepts it — propose, don't dispose. Setting an
     ADR to `accepted` yourself is a rule-1 violation. Leave it `proposed` and say so.
   - A decision anchored in an ADR must not contradict `PROJECT-RULES.md`; if it does,
     reconcile them (an ADR can *drive* a rules change, recorded in the rules change log).

6. **Human review.** Present all documents (config, PROJECT-RULES, dictionary, any ADRs)
   for review. Per propose-don't-dispose, you draft; a human confirms. Do not self-approve.

7. **Flip the gate.** Only after the user confirms each document is genuinely filled (not
   placeholder text), set the matching flag in `config.yml`'s `install:` block to `true`:
   `config`, `project_rules`, `design_code_dictionary`. When all three are true, the
   workflow commands unblock. (ADRs are not a gate flag — they are created as decisions
   warrant, not required for the install to be complete.)

## Boundaries

- Facts come from the code; **decisions and sign-off identities come from the user** — ask,
  don't fabricate.
- Never set an `install:` flag to `true` on a document that still contains template
  `<placeholder>` text or that the user hasn't confirmed.
- **Create `halyard/adr/` only when there is a real decision to anchor** — never an empty
  folder for its own sake.

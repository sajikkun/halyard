---
document: Family-Wide AI Operating Rules
project: "{{PROJECT_NAME}}"
version: 1.0.0
status: generated
---

# Family-Wide AI Operating Rules (11+)

> These rules are cross-repo **identical** by design — every repo in the family carries the
> same text, which is why they live in this synced, generated file rather than in each
> repo's hand-owned PROJECT-RULES. A hand-edit here is a drift bug `nvaid validate` flags.

These extend `nvaid/PROJECT-RULES.md` §7 rules 1–10. Rules 1–10 are per-repo guardrails;
these are **family-wide** — they coordinate work *across* the repos listed in
`nvaid/config.yml` → `family`, so they must read identically everywhere.

Who the "family" is, and which shared board these rules reference, is **not hardcoded** —
it comes from `nvaid/config.yml`:

```yaml
family:
  repos: []            # the repos in this family (e.g. ["acme/shop-frontend", ...])
                       #   or a github_topic to resolve the set — NOT a blanket org list,
                       #   which would wrongly pull in unrelated repos (incl. nvaid itself).
  project_board: ""    # the shared tracker board these rules coordinate on (e.g. "19")
  owner: ""            # the org/owner that holds the board + repos
```

11. **Create and maintain issue-tracker tickets, but never assign one to a Release
    Checkpoint.** Per `nvaid/rules/ISSUE-TRACKER-TEMPLATE.md`: create the Epic (per Intent)
    and its Story/Bug children (per Unit of Work) as soon as the Decomposition Approved
    gate passes, keep their status/gate fields current, and link to the artifact that
    contains the content — never paste it into the ticket. Work flows continuously
    (Kanban), and Intents ship in content-defined **Release Checkpoints** (GitHub
    **Milestones**), not sprints. Checkpoint assignment is the CX Architect's priority
    call carried out by the Process Facilitator — never an automatic next step the agent
    takes. (GitHub Projects is the only tracker; there is no Jira in this family.)
    **Elaboration has two gates, each a PR merge on `develop`:** **Intent Approved** = the
    stage-1 `intent/` PR (holding `intent.md` only) is approved and merged; **Decomposition
    Approved** = the stage-2 `elaboration/` PR (holding `contracts/` and
    `unit-breakdown.md`) is approved and merged. They're separate PRs because branch
    protection dismisses an approval on every new push, so one PR can't carry both gates.

12. **Decompose an approved Intent into Units of Work** per
    `nvaid/rules/unit-breakdown-rules.md`. Classify each Unit as a Story or a Bug — never
    both, never neither — size it to one owning role and one implementation sitting, and
    never split a Unit just to give a second role something to own.

13. **Generate each role's Architecture Contract** per its own
    `nvaid/rules/<role>-architecture-contract-generation-rules.md` — what it must contain,
    and whether it's even required for this Intent. Every generated contract is a **draft,
    not a verdict**; the owning Architect accepts, extends, or simplifies it, and sign-off
    is against that final version, never the agent's first draft.

14. **An Intent's number is unique across the entire family, never per-repo.** Because
    every repo in the family feeds one shared board (`config.yml` → `family.project_board`),
    two Intents sharing a number — even in different repos — collide on the board and are
    indistinguishable. A new Intent takes the next number not already used by *any* repo in
    the family. Before assigning, check via `gh` (never a local read — a session rooted in
    one repo doesn't see another's):
    - the shared board (`gh project item-list <family.project_board> --owner <family.owner>`)
      for the highest `Intent ID` across all items, and
    - each **family** repo's open PRs for an in-flight `intent/` branch proposing a number
      at or above it. **Resolve the family set from `config.yml` → `family.repos` (or its
      github_topic), NOT from a blanket `gh repo list <owner>`** — a blanket org list pulls
      in unrelated repos (including nvaid itself and any future non-family project), whose
      numbers must not mix with the family's.
    The new number is one greater than the highest in use anywhere in the family. If `gh`
    isn't authenticated/reachable, stop and ask a human rather than proceed unverified.
    **Intent-folder naming:** name the folder `nvaid/intents/<repo-name>.<INTENT-ID>-<slug>/`.
    `<repo-name>` is the repo's own GitHub name (the `<name>` in its `<owner>/<name>` entry in `family.repos`, e.g. `shop-backend`), not `owning_repo`. The `<repo-name>.` prefix marks which repo owns the Intent so the folder is
    unambiguous out of context, and a cross-repo Intent keeps the same `<INTENT-ID>` in
    every repo it touches.

15. **An ADR's number is unique across the entire family, never per-repo** — same reasoning
    and the same `gh`-based, config-scoped family check as rule 14. A new ADR takes the next
    number not used by any family repo; it is created `status: proposed` and a named human
    accepts it (never self-accepted — rule 1).

16. **Artifact placeholder resolution.** When instantiating or editing a real `nvaid/`
    artifact (intent, contract, unit design, ADR, change-log row):
    - **Dates** — replace `[date]` / `[YYYY-MM-DD]` with the actual calendar date from the
      system clock (`date +%Y-%m-%d`). Do not guess it or trust a date restated in the
      prompt. Fill `last_updated` and every change-log row you touch, in `YYYY-MM-DD`.
    - **Authorship/attribution `[name]`** (e.g. a change-log `Author`) — **fill** with the
      person who triggered the work, resolved from `git config user.name` (else
      `gh api user --jq .name`, else `gh` login), written as `<author> (AI-assisted draft)`.
    - **Sign-off/ownership `[name]`** (the `owner:` field, Sign-Off tables, "accepted by")
      — **leave as placeholders.** Whoever triggered a draft has not signed off on it;
      filling these would falsely claim approval (rule 1). The test: a field that says *who
      wrote this* gets filled; a field that says *who approved/owns this* does not.

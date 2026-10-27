---
command: hyd:breakdown
description: Cut an approved Intent into Units of Work — the Phase 5 final cut, each unit tagged with its Owning Repo.
stage: "Mob Elaboration — Phase 5"
precondition: Intent merged on develop (stage 1) and contracts drafted on the elaboration/ branch
---

# /hyd:breakdown

## ⛔ Precondition: halyard install must be complete

Read `halyard/config.yml` and check the `install:` block. If `config`, `project_rules`, or
`design_code_dictionary` is not `true` (or the file is missing), **STOP** and tell the
user to run `/hyd:install` first — name which flag(s) are false. Do not proceed until
all three are true.


{{#team}}
Produce `unit-breakdown.md` — the **Phase 5 output**, the decomposition of record,
informed by the contracts from `/hyd:contracts`. This runs **after** contracts, not
before (the `unit-breakdown` Skill is Phase 5; the contract Skills are Phases 2–5).
{{/team}}
{{#solo}}
Write `design.md` §7, the unit breakdown — the decomposition of record, grouped by Owning
Repo and informed by §1–§6 from `/hyd:contracts`. This runs **after** contracts, not
before. In solo mode there's no separate `unit-breakdown.md`.
{{/solo}}

## Precondition

The stage-1 `intent/` PR must be merged on `develop` (Intent Approved), and `/hyd:contracts`
must have committed {{#team}}the contracts{{/team}}{{#solo}}`design.md` §1–§6{{/solo}} to the `elaboration/<intent-id>-<slug>` branch. If
`intent.md` isn't on `origin/develop` yet, or there's no stage-2 branch with {{#team}}contracts{{/team}}{{#solo}}`design.md`{{/solo}},
stop and say which is missing.

## Steps

{{#team}}
1. On the `elaboration/` branch, read `intent.md` and the drafted `contracts/`.
2. Run the `unit-breakdown` Skill per `{{AIDLC_ROOT}}/unit-breakdown-rules.md`: cut into
   Units each with its own Acceptance Criteria, classify Story or Bug, size per the rules.
3. Tag each Unit with its **Owning Repo** (frontend | backend | platform) — this is what
   assigns units across the family (proposal §7).
4. Reconcile each contract's `covers_units` against the final cut.
5. Write `halyard/intents/<repo-name>.<INTENT-ID>-<slug>/unit-breakdown.md`. Flag as a draft
   awaiting room critique (Phases 3–4) and the **Decomposition Approved** gate (rule 11).
6. Commit it and open the **stage-2 PR** per the `github` Skill (or push to it if it's
   already open). It holds `contracts/` and `unit-breakdown.md` only. Approving and merging
   it **is** the Decomposition Approved gate. Stop.
{{/team}}
{{#solo}}
1. On the `elaboration/` branch, read `intent.md` and `design.md` §1–§6.
2. Run the `unit-breakdown` Skill per `{{AIDLC_ROOT}}/unit-breakdown-rules.md`: cut into
   Units each with its own Acceptance Criteria, classify Story or Bug, size per the rules.
3. Tag each Unit with its **Owning Repo** — an `owning_repo` value from the family
   (frontend | backend | platform | …). Write §7 with one `###` subsection per Owning Repo,
   even if the family is a single repo, so a later repo split is a move, not a re-cut.
4. Reconcile `design.md`'s `covers_units` and the §5 test-coverage table against the final
   cut: every Unit's Acceptance Criteria covered, every test row traced to one.
5. Flag `design.md` as a draft awaiting the developer's review and the **Decomposition
   Approved** gate (family rule 11).
6. Commit it and open the **stage-2 PR** per the `github` Skill (or push to it if it's
   already open). It holds `design.md` only. The developer **merging** it **is** the
   Decomposition Approved gate. Never merge it yourself. Stop.
{{/solo}}

## Next

`/hyd:apply` — generate the per-repo unit design docs and open construction branches.

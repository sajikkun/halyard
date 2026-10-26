---
document: Quality Architecture Contract — Generation Rules
project: "{{PROJECT_NAME}}"
version: 0.5.0
owner: "[Quality Architect name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Quality Architecture Contract: Generation Rules

**What this file is:** the rules the AI agent follows to draft a Quality Architecture
Contract for an Intent, during Mob Elaboration Phases 2–5 — what triggers producing one,
and what it must contain when it does. This file owns the **Intent-Specific Gates** only
(`PROJECT-RULES.md` §5.2) — content that's regenerated fresh per Intent. It does not
define, and a generated contract must never redefine, the **Solution-Specific Gates**
(Build, Code Coverage, Code Quality, Reusability/Duplication, Regression Test, SAST) —
those are fixed codebase-wide thresholds set once in §5.2, not something any single
Intent opts into or out of.

**What this file is not:** not the worked example —
`docs/templates/samples/contracts/quality-architecture-contract.md` is the canonical
shape and sign-off format, filled in for `INTENT-004`. Not the draft/human-edit
relationship either — every generated contract is a starting framework, never a verdict;
see the AI-Native Engineering Model's §Mob Elaboration for how the Quality Architect
accepts, extends, or simplifies it before Sign-Off.

**Companion files:** [unit-breakdown-rules.md](./unit-breakdown-rules.md) (same
Elaboration session). The other five `*-architecture-contract-generation-rules.md` files
are siblings, one per role.

---

## 1. When This Contract Is Required

**Almost always.** Any Intent that reaches Implementation (Fig. 2 Stage 6) at all gets a
Quality Architecture Contract. The rare exception is an Intent whose Units are pure
documentation or process changes with no code path to test.

## 2. Required Content

- **Required Test Coverage table.** One row per meaningful scenario, and — this is the
  load-bearing rule, not a formatting preference — **every row traces to one of the
  owning Unit's own stated Acceptance Criteria** (`unit-XXX-design.md`, per
  `unit-breakdown-rules.md` §2), not surfaced independently from Elaboration discussion
  and hoped to line up. Each row is also classified by type — never left as an unlabeled
  list:
  - **Happy Path** — the primary success scenario(s).
  - **Negative Path** — deliberate invalid input, with a specific expected failure
    response (not just "it errors").
  - **Edge Case** — a boundary condition or ambiguous scenario that's neither a clean
    success nor a clean rejection. This is where a Known Gap most often originates — see
    below.

  **Both directions of the trace are checked, not just one:** every Acceptance
  Criterion gets at least one covering row, and every row names the criterion it
  verifies — or is marked explicitly supplementary rather than left looking like
  undocumented coverage. A criterion with no covering row is a Known Gap, logged below,
  not silently assumed to be "probably fine." The worked example demonstrates exactly
  this: one row in `quality-architecture-contract.md` traces to nothing, which is how
  its Known Gap got caught rather than missed.

  Collectively, this table is what `PROJECT-RULES.md` §5.2's Unit Test Gate (and, where
  more than one component is touched, the Integration Test Gate) run against — both
  Intent-Specific. See §5.2 for the full nine-gate taxonomy and where the line sits
  against the six fixed Solution-Specific gates this file never touches.
- **NFRs in Scope (Intent NFR gate).** Which of the SRS's existing non-functional
  requirements this Intent's Units are held to, *beyond* the solution-wide baseline
  §5.2 already sets; state "none beyond the standing baseline" explicitly when true,
  rather than leaving the section blank.
- **Known Gaps.** Anything the room identified as untested and consciously accepted —
  flagged, not silently dropped. Matches the worked example's `{user}`-derivation
  collision gap.
- **Definition of Done addition**, specific to this Intent, beyond `PROJECT-RULES.md`
  §5.1's standing checklist — only if this Intent actually needs one.
- **Sign-Off.**

## 3. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Companion to the five sibling `*-contract-generation-rules.md` files |
| 0.2.0 | [date] | Required Test Coverage rows must now be classified Happy Path / Negative Path / Edge Case, and explicitly tied to `PROJECT-RULES.md` §5.2's Unit/Integration Test Gates | Quality gate types were unspecified; §5.2 was a placeholder |
| 0.3.0 | [date] | Scoped this file to Intent-Specific Gates only; Solution-Specific Gates (Code Coverage, Code Quality, Reusability, SAST, Build) are fixed in §5.2 and out of scope for any generated contract | Gate taxonomy split into Intent-Specific vs. Solution-Specific categories |
| 0.4.0 | [date] | Required Test Coverage rows must now trace to the owning Unit's stated Acceptance Criteria in both directions — every criterion covered, every row justified | Should a Unit's acceptance criteria be the same thing its unit tests are based on? |
| 0.5.0 | [date] | Solution-Specific gate list now includes Regression Test (added in `PROJECT-RULES.md` §5.2) — six fixed gates, nine total | Should Quality Gates include a card for regression testing? |

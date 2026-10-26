---
document: Customer Experience Contract — Generation Rules
project: "{{PROJECT_NAME}}"
version: 0.1.0
owner: "[Customer Experience Architect name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Customer Experience Contract: Generation Rules

**What this file is:** the rules the AI agent follows to draft a Customer Experience
Contract for an Intent, during Mob Elaboration Phases 2–5 — what triggers producing one,
and what it must contain when it does.

**What this file is not:** not the worked example —
`docs/templates/samples/contracts/customer-experience-contract.md` is the canonical
shape and sign-off format, filled in for `INTENT-004`. Not the draft/human-edit
relationship either — every generated contract is a starting framework, never a verdict;
see the AI-Native Engineering Model's §Mob Elaboration for how the Customer Experience
Architect accepts, extends, or simplifies it before Sign-Off.

**Companion files:** [unit-breakdown-rules.md](./unit-breakdown-rules.md) (same
Elaboration session). The other five `*-architecture-contract-generation-rules.md` files
are siblings, one per role.

---

## 1. When This Contract Is Required

**Always.** Every Intent originates from, or must be validated against, a real business
need — the Customer Experience Architect is the one who closes that loop after the
technical contracts land, confirming the room's final shape still serves it.

## 2. Required Content

- **Reconciliation Against the Original Intent.** Where the final, technically-grounded
  shape narrowed, resolved, or held unchanged against what `intent.md` originally said —
  named explicitly, not silently absorbed into the acceptance criteria without comment.
- **Final Acceptance Criteria.** The technically-grounded version of the Intent's own
  Success Criteria, incorporating what the other contracts actually committed to — not a
  restatement of the Intent verbatim.
- **What "Done" Looks Like to the Business.** Tied to a concrete validation scenario, not
  "the code merged."
- **Sign-Off.**

## 3. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Companion to the five sibling `*-contract-generation-rules.md` files |

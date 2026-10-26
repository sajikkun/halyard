---
document: Solutions Architecture Contract — Generation Rules
project: "{{PROJECT_NAME}}"
version: 0.1.0
owner: "[Solutions Architect name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Solutions Architecture Contract: Generation Rules

**What this file is:** the rules the AI agent follows to draft a Solutions Architecture
Contract for an Intent, during Mob Elaboration Phases 2–5 — what triggers producing one,
and what it must contain when it does.

**What this file is not:** not the worked example —
`docs/templates/samples/contracts/solutions-architecture-contract.md` is the canonical
shape and sign-off format, filled in for `INTENT-004`. Not the draft/human-edit
relationship either — every generated contract is a starting framework, never a verdict;
see the AI-Native Engineering Model's §Mob Elaboration for how the Solutions Architect
accepts, extends, or simplifies it before Sign-Off.

**Companion files:** [unit-breakdown-rules.md](./unit-breakdown-rules.md) (same
Elaboration session). The other five `*-architecture-contract-generation-rules.md` files
are siblings, one per role.

---

## 1. When This Contract Is Required

**Always.** Every Intent gets a Solutions Architecture Contract, even when the honest
assessment is "no cross-cutting impact, no new ADR needed." This is the one contract
never marked "not pulled in" — someone has to always confirm nothing systemic was
missed, and that confirmation *is* the contract. An empty-looking assessment is a
completed one, not a skipped one.

## 2. Required Content

- **System-Level Assessment.** Does this Intent introduce a new system container, cross
  a boundary named in the SRS's System Containers (Fig. 2), or need a new ADR? State the
  answer plainly, including when it's "no" on every count — don't omit the section
  because the answer is negative.
- **What This Intent Is Allowed to Touch.** An explicit boundary statement: which
  containers/components are in scope for this Intent's Units of Work, and which are
  explicitly out.
- **AI-Agent Guardrail Implications.** Does this Intent introduce any unsupervised-action
  surface `PROJECT-RULES.md` §7 doesn't already cover — a new destructive operation, a
  new external API call, a new credential path? Flag it explicitly; don't assume the
  existing rules cover a case they were never written against.
- **Cross-Role Consistency Check.** Confirms the other contracts produced this session
  don't contradict each other — this is the Solutions Architect's half of Phase 6's
  Consistency Gate, recorded in writing rather than only spoken in the room.
- **Sign-Off.**

## 3. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Companion to the five sibling `*-contract-generation-rules.md` files |

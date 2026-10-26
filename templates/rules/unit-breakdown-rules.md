---
document: Unit of Work Decomposition Rules
project: "{{PROJECT_NAME}}"
version: 0.2.0
owner: "[Process Facilitator name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Unit of Work Decomposition Rules

**What this file is:** the rules the AI agent follows when proposing a Unit of Work
breakdown at Mob Elaboration Phase 2 (Strawman Review) — how to cut one Intent into
Units, how to classify each Unit as a Story or a Bug, and the sizing signals that say a
strawman is cut wrong before the room spends time negotiating around a bad boundary.

**What this file is not:** not the ticket field shape (`ISSUE-TRACKER-TEMPLATE.md`
governs that), not the ceremony's choreography (the AI-Native Engineering Model's
&sect; Mob Elaboration governs that), not the Intent template itself. This file governs
one specific judgment call: given an approved Intent, what its Units of Work are.

**Companion files:** [ISSUE-TRACKER-TEMPLATE.md](./ISSUE-TRACKER-TEMPLATE.md) is where a
Unit of Work, once decided here, becomes a ticket. [PROJECT-RULES.md](../PROJECT-RULES.md)
§7 rule 12 is the operating rule this file implements.

---

## 1. What a Unit of Work Is

The smallest slice of an Intent that can be:

- **designed** by one owning role, without needing another role's design to already
  exist first (though it may *reference* another role's contract),
- **gated** independently at Fig. 2's Stage 5 (Per-Unit Design Approved) and Stage 8
  (Merge Approval), without waiting on a sibling Unit's gate, and
- **implemented** by the AI agent in one sitting, without losing the earlier reasoning
  in its own context (`PROJECT-RULES.md` §7 rule 8, scope discipline).

A Unit of Work is never split further inside the ticket tracker by default
(`ISSUE-TRACKER-TEMPLATE.md` §2) — the Unit boundary *is* the atomic boundary. If a
"Unit" doesn't fit in one sitting, it was cut wrong; fix the cut, don't add sub-tasks
around it.

## 2. Acceptance Criteria — every Unit states its own

A Unit of Work carries its own Acceptance Criteria, stated once in its design doc
(`unit-XXX-design.md`, Fig. 2 Stage 4) — narrowed from the Intent's own Success Criteria
(`intent.md`) down to just this Unit's slice. Not a restatement of the whole Intent's
criteria on every Unit; each Unit states only the part of "done" that's actually its own
to satisfy.

**The traceability rule this exists to enforce:** the Quality Architecture Contract's
Required Test Coverage table (`quality-architecture-contract-generation-rules.md` §2) is
generated *from* this list, not surfaced independently and hoped to line up. Every
stated Acceptance Criterion gets at least one Happy Path, Negative Path, or Edge Case
test row that verifies it; every test row traces back to a criterion it verifies, or is
marked explicitly supplementary rather than left looking like undocumented coverage. A
criterion with no covering test row is a Known Gap (`PROJECT-RULES.md` §6) the same way
an untested edge case already is — not silently assumed to be "probably fine."

Without a named source, a Unit's tests and its actual "done" bar are two independently
populated lists that happen to usually agree — right up until they don't. This is the
rule that closes that gap. See the worked example: `unit-004-02-backend-design.md`'s
four Acceptance Criteria are what `quality-architecture-contract.md`'s test table
traces to, row by row — including the one row that traces to nothing, which is exactly
how that Unit's Known Gap got caught instead of missed.

## 3. Story or Bug — the classification rule

Every Unit of Work is exactly one of these two ticket types. Classify per Unit, not per
Intent — one Intent can produce a mix of both.

| Classify as | When | Example |
|---|---|---|
| **Story** | The Unit adds or changes a capability &mdash; net-new or intentionally different behavior | The branch-override selector itself (`UNIT-004-01`) |
| **Bug** | The Unit brings existing, already-shipped behavior back in line with a spec, contract, or FR it currently violates | A previously merged Unit's `{user}` derivation collides on two usernames in production |

**Boundary case:** a defect found *during* Construction of a Story, before that Story's
own Merge Approval, is fixed inside that same Unit — it does not spin out as a separate
Bug. Only a defect discovered *after* a Unit has already merged becomes its own Bug-type
Unit — under a fast, often single-Unit Intent of its own, or folded into a Known Gap per
`PROJECT-RULES.md` §6 if it isn't urgent enough to justify a full Mob Elaboration pass by
itself.

## 4. Decomposition Heuristics

Applied by the AI agent when proposing the Phase 2 strawman, and by the room when
critiquing it:

- **One primary owning role per Unit.** If a Unit's design would need two Architects to
  co-author it, it's two Units connected by a contract, not one Unit that spans both.
  This is what turns Fig. 2 Stage 4 into "&times;N roles in parallel" instead of one
  tangled design.
- **A shared dependency is a contract, not a split.** When two Units both need the same
  answer to something (the worked example's `{user}` derivation rule), that answer is
  negotiated once, in a contract, and referenced by both — never independently
  re-derived, and never used as a reason to merge the two Units into one.
- **Size to one sitting.** If a Unit's own design doc is trending toward the size of
  several of the worked examples combined, that's a smell the Unit is actually two.
- **Don't split to satisfy an org chart.** A Unit boundary is justified by an
  independent design-and-gate need, never by "everyone should have something to own."
  Splitting a naturally single-role, single-behavior change into two Units just to give
  a second role a ticket produces busywork, not independence.
- **Watch the Unit count as a signal, not a rule.** One Unit for an Intent that went
  through full Joint Elaboration is a sign the Intent probably didn't need the
  cross-role machinery at all. More than roughly six to eight Units is a sign the
  "Intent" was actually several Intents bundled together and should have been split
  before Elaboration, not after.

## 5. Numbering

`UNIT-<INTENT-NUMBER>-<sequence>`, zero-padded two digits — `UNIT-004-01`,
`UNIT-004-02`, matching the worked example in `docs/templates/samples/`. Sequence order
follows the order Units are listed in `unit-breakdown.md`, not build or gate order.

## 6. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Clarifying how Units of Work get decomposed, classified (Story/Bug), and sized, separate from how they're ticketed |
| 0.2.0 | [date] | Added §2: every Unit states its own Acceptance Criteria, and the Quality Architecture Contract's test coverage table must trace to them, not be surfaced independently | Should a Unit's acceptance criteria be the same thing its unit tests are based on? |

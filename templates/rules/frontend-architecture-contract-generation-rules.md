---
document: Frontend Architecture Contract — Generation Rules
project: "{{PROJECT_NAME}}"
version: 0.1.0
owner: "[Identity Access and Frontend Architect name]"
last_updated: "[YYYY-MM-DD]"
status: draft
---

# Frontend Architecture Contract: Generation Rules

**What this file is:** the rules the AI agent follows to draft a Frontend (Identity
Access and Frontend) Architecture Contract for an Intent, during Mob Elaboration Phases
2–5 — what triggers producing one, and what it must contain when it does.

**What this file is not:** not the worked example —
`docs/templates/samples/contracts/frontend-architecture-contract.md` is the canonical
shape and sign-off format, filled in for `INTENT-004`. Not the draft/human-edit
relationship either — every generated contract is a starting framework, never a verdict;
see the AI-Native Engineering Model's §Mob Elaboration for how the Identity Access and
Frontend Architect accepts, extends, or simplifies it before Sign-Off.

**Companion files:** [unit-breakdown-rules.md](./unit-breakdown-rules.md) (same
Elaboration session). The other five `*-architecture-contract-generation-rules.md` files
are siblings, one per role.

---

## 1. When This Contract Is Required

Any Intent with at least one Unit touching the frontend (web or mobile), a design
system component, or an identity/access/RBAC/SSO surface. Skipped only for Intents with
zero user-facing or access-model impact — rare, since most Intents eventually surface
somewhere in the UI.

## 2. Required Content

- **Consumes.** Which Backend contract (if any) this one consumes verbatim, with
  confirmation that no field is locally reinterpreted or renamed.
- **UI Flow.** The concrete step-by-step, tied to specific screens or components — not a
  general description of the feature.
- **Shared Derivations, Sourced Not Re-Derived.** Point to the Backend contract's version
  of anything both roles need (an ID derivation, a naming rule); never re-derive it
  independently.
- **Identity / Access Implications.** Stated explicitly even when the answer is "none for
  this Intent" — never left implicit. This is the one open risk area (SRS §9, no
  RBAC/SSO in POC scope) most likely to get silently assumed away if it isn't required in
  writing every time.
- **Components Touched (Design-Code Dictionary impact).**
- **Sign-Off.**

## 3. Change Log

| Version | Date | Change | Trigger |
|---|---|---|---|
| 0.1.0 | [date] | Initial version | Companion to the five sibling `*-contract-generation-rules.md` files |

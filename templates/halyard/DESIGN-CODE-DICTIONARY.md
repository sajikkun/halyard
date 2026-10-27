---
document: Design-Code Dictionary
project: "{{PROJECT_NAME}}"
version: 0.1.0
owner: "<owner name>"
maintained_by: AI agent — updated as part of any unit of work that touches a mapped component
last_updated: "<YYYY-MM-DD>"
status: draft
---

# {{PROJECT_NAME}} — Design-Code Dictionary

> **Template dropped by `hyd init` — HAND-OWNED, fill this in.**
> `hyd update` never overwrites this file. Delete these template notes once you have
> real content.

**What this file is:** a *technical README for the code* — the specs and design patterns
of this repository, and a live map from each named concept (a feature, a module, an
architectural component) to where it actually lives in the codebase and what else touches
it. It answers two questions without opening the source: **"where does this live?"** and
**"what breaks if I change it?"**

**What this file is not:**

- Not a replacement for reading the code when making a change — it is a navigation aid for
  deciding whether a change is safe and who should review it.
- Not a product spec. `halyard/PROJECT-RULES.md` says what to build and how; this file says
  where that intent actually landed, after the fact.
- Not a promise of completeness. §5 exists so this file can honestly state what it has not
  mapped yet, rather than implying coverage it doesn't have.

**Keep it current.** Updating this file for every component a change adds, moves, or
removes is part of the Definition of Done — a stale map is worse than none, because it is
trusted and wrong.

---

## 1. Tech stack & toolchain

The authoritative, structured stack lives in **`halyard/config.yml` → `tech_stack`** (that is
what agents and the CLI read). Don't duplicate it here — instead, add the *narrative* this
file is for: why each major choice was made, how the pieces fit together, and any
non-obvious interactions or constraints a contributor should know before changing them.

<e.g. "React + Vite for the SPA; Vitest chosen over Jest for ESM-native speed. The build
emits a static bundle served by nginx — see §2 and the Dockerfile. No SSR.">


## 2. Project structure

<A short orientation to the top-level directories — what each is for. Example:>

```
src/
  <area>/        <one line: what lives here>
  <area>/
test/
```

## 3. Design patterns & conventions

<The patterns a contributor (human or agent) must follow to stay consistent with the
codebase. Be specific — these are the rules an agent can't infer from a single file.
Examples:>

- **<Pattern name>** — <what it is, when to use it, where an example lives>.
- **State / data flow** — <how state is managed and data moves>.
- **Error handling** — <the project's convention>.
- **Naming** — <files, modules, symbols>.

## 4. Component map (design concept → code)

| Concept / feature | Lives in | Depends on | Changing it affects |
|---|---|---|---|
| <e.g. Auth session> | `src/auth/session.ts` | <modules> | <what breaks> |
| | | | |

## 5. Not yet mapped

<List components or areas that exist in the code but aren't documented above yet, so this
file is honest about its coverage. Keep this section — an empty "not yet mapped" is a
claim of full coverage, and should only be empty when that's actually true.>

- <none yet — fill the map as the code grows>

## 6. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1.0 | <YYYY-MM-DD> | Initial draft from the halyard template | <name> |

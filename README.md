# halyard

One CLI that installs an **AI-DLC** (AI Development Lifecycle) skills-and-workflow toolkit
into **any** coding agent, and houses a repo's intents, config, and design-code dictionary
in a single owned `halyard/` folder. It works for a whole team or for one developer
running the full lifecycle alone.

A halyard is the line that raises a sail. This tool raises work the same way, one stage at
a time: intent → design → breakdown → construction, with a human gate at each step.

| You'll see | Where |
|---|---|
| `halyard` | the npm package, and the `halyard/` folder in each repo |
| `hyd` | the command you type (`hyd init`) and the slash-command prefix (`/hyd:intent`) |

`halyard` also works as a command (`halyard init` is the same as `hyd init`).

Edit a skill once here, publish, and every consuming repo re-syncs with `hyd update` —
no more hand-copying skills between repositories, or between one agent's config and
another's (`.claude/`, `.kiro/`, `.cursor/`, …).

## Install & use

```bash
npm i -g @sajikkun/halyard     # or on demand: npx @sajikkun/halyard <command>

cd your-repo
hyd init                 # pick agents and a mode, inject skills + slash commands, drop halyard/
hyd update               # re-sync every configured agent to the installed halyard version
hyd validate             # CI gate: fail if generated files are stale or hand-edited
```

`init` flags:

```bash
hyd init --agents claude,kiro,cursor   # skip the prompt, name agents directly
hyd init --owning-repo frontend        # preset the config's owning_repo
hyd init --mode solo                   # skip the mode prompt: team | solo
hyd init --yes                         # non-interactive (AGENTS.md catch-all, team mode)
```

## Upgrading

Upgrading is **two steps**, because `hyd update` re-syncs a repo to the version of the
tool installed on your machine — it does not upgrade the tool itself:

```bash
# 1. upgrade the tool (once per machine, when a new version ships)
npm i -g @sajikkun/halyard@latest

# 2. re-sync each repo to the new version (run inside each repo)
hyd update
```

halyard checks npm (at most once a day, cached, non-blocking) and prints a one-line nudge
when a newer version is available — it never upgrades itself (the package manager owns the
tool's lifecycle). Silence the check with `HALYARD_NO_UPDATE_CHECK=1`.

Note: `hyd update` never touches hand-owned files (`config.yml`, `PROJECT-RULES.md`,
`DESIGN-CODE-DICTIONARY.md`, `intents/`). If a new version adds a config field, add it to
your `config.yml` by hand — the changelog will call these out.

## How it works

- **Full skill set, no profiles.** `init` injects every skill into each selected agent. A
  repo declares what it *is* in `halyard/config.yml` (`owning_repo`), rather than receiving a
  trimmed-down skill set.
- **Any coding agent.** `init` shows a multi-select. Each agent is a *path + format adapter*
  (`src/agents.ts`) over one neutral source — adding a new agent is a new registry entry,
  not new content. An `AGENTS.md` catch-all covers any tool that reads the cross-agent
  standard but has no bespoke adapter.
- **The `halyard/` folder is hand-owned, content only** — `config.yml`, `PROJECT-RULES.md`,
  `DESIGN-CODE-DICTIONARY.md`, and `intents/`. `update` never touches these. The *generated*
  skill/command files live in each agent's own directory and carry a "do not edit" header.
- **`PROJECT-RULES.md` and `DESIGN-CODE-DICTIONARY.md` are per-project templates**, not
  shipped content: `init` drops fill-in skeletons for a developer to own. halyard ships only
  the universal skills and the contract/unit-decomposition rules.
- **Drift is caught, not just avoided.** `validate` fails (exit 1) if a repo's generated
  files are stale (behind the installed version), missing, or hand-edited — turning silent
  divergence into a failing CI check.

## The workflow (slash commands)

`init` installs five commands. `/hyd:install` runs once; the other four run in order per
Intent, with a human gate after the intent and after the breakdown:

```
/hyd:install     scan the project and fill config.yml, PROJECT-RULES.md, the dictionary
/hyd:intent      draft the intent and open the stage-1 PR (intent.md only), then STOP
   ⏸  Intent Approved = stage-1 intent/ PR approved + merged
/hyd:contracts   draft the per-role architecture contracts on an elaboration/ branch
/hyd:breakdown   cut into units (each tagged with its owning repo) and open the stage-2 PR
   ⏸  Decomposition Approved = stage-2 elaboration/ PR approved + merged
/hyd:apply       generate per-repo unit docs + open construction branches
```

Contracts precede the breakdown deliberately (the contract skills run across the
elaboration phases; the unit-breakdown is their final output). In solo mode both land in
one `design.md` and the gates are your own merges (see below).

Agents without a separate command system (Kiro, Cursor, Copilot, …) get the same commands
as skills named `hyd-intent`, `hyd-contracts`, and so on.

Everything an Intent produces lives in the repo under `halyard/intents/`:

```
halyard/intents/
  shop-backend.001-login/          # <repo-name>.<INTENT-ID>-<slug>
    intent.md
    contracts/                     # team mode: one file per role
    unit-breakdown.md              # team mode
    design.md                      # solo mode: every role's section + the unit breakdown
    units/UNIT-001-01-design.md    # written by /hyd:apply
```

## Team or solo mode

`init` asks who runs the lifecycle, and records the answer as `mode:` in `halyard/config.yml`.
`update` and `validate` follow it.

| | Team | Solo |
|---|---|---|
| Sign-off | named `architects`, one per role | one `developer` |
| Elaboration output | one contract file per role + `unit-breakdown.md` | one `design.md`: a section per role (solutions, backend, frontend, other tiers, quality, CX) and the unit breakdown grouped by owning repo |
| Gates | stage-1 / stage-2 PRs, approved and merged | the same PRs, merged by the developer (GitHub won't let you approve your own PR) |
| Tracker board | required | optional (`family.project_board` empty = no tickets) |
| Daily construction update | shipped | not shipped |

Both modes keep the same command order, the two human gates, Git Flow with `develop`, and
multi-repo families. A solo developer can still split frontend and backend into separate
repos, for example to publish one and keep the other private.

Mode-specific template text lives in `{{#team}}…{{/team}}` / `{{#solo}}…{{/solo}}` blocks,
and a `modes: [team]` frontmatter line limits a whole file to some modes (`src/mode.ts`).
Solo mode also ships `halyard/rules/solo-mode-rules.md`, which maps every team role to the
developer and defines `design.md`.

To switch an existing repo, change `mode:` in `config.yml`, replace `architects:` with
`developer:` (or back), and run `hyd update`. Files the new mode doesn't ship are removed.

## Repository layout

```
halyard/
  package.json              # bins: hyd + halyard; ships dist/ + templates/
  tsconfig.json
  src/
    cli.ts                  # command wiring (commander)
    agents.ts               # the agent registry — 9 bespoke + an AGENTS.md catch-all
    paths.ts                # resolves the bundled templates/
    config.ts               # read/patch a repo's halyard/config.yml
    scaffold.ts             # drop the halyard/ folder + sync halyard/rules
    generate.ts             # neutral source -> per-agent files (+ drift diff)
    mode.ts                 # team/solo template blocks
    commands/
      init.ts               # agent multi-select + inject + scaffold halyard/
      update.ts             # re-sync configured agents
      validate.ts           # drift gate
  templates/                # the payload shipped in the package
    skills/                 # 12 skills (6 ceremony + frontend + backend + 4 tool)
    rules/                  # flow/rule files (contract-gen, unit-breakdown, tracker, family, solo-mode)
    commands/               # the 5 slash-command defs
    halyard/                # the folder init drops into a repo (all hand-owned)
      config.yml
      PROJECT-RULES.md      # fill-in template
      DESIGN-CODE-DICTIONARY.md  # fill-in template (a technical README for the code)
      intents/
```

### Skills included (`templates/skills/`)

- **Ceremony:** `customer-experience`, `solutions`, `quality`, `unit-breakdown`,
  `r3-analytics`, `release-plan`
- **Tier:** `frontend`, `backend`
- **Tool:** `github`, `project-ticketing`, `pr-review`, `daily-construction-update` (team mode only)

## Development

```bash
npm install
npm run typecheck
npm run dev -- init --agents claude   # run the CLI from source (tsx)
npm run build                          # bundle src/ -> dist/cli.js (tsup)
npm test                               # vitest
```

## Status & next steps

The CLI (`init` / `update` / `validate`) is implemented, runs end-to-end, and is covered
by `vitest` tests for the generator, config, rules sync, agent adapters, and both modes.
Still open:

- Confirm each agent's target path against its current docs before relying on its adapter
  (agent conventions change often; `AGENTS.md` is the safe default).
### Non-JS repos (Python, Go, etc.)

No special delivery path needed. halyard only *writes files* — skills, the guardrail
templates, and the `halyard/` folder — and exits; the output has no runtime dependency on
Node. A Python repo just runs the command once:

```bash
npx @sajikkun/halyard init
```

Nothing is added to the target project itself (no `devDependency`, no Node toolchain in
the repo). The only requirement is that Node is available on the developer's machine or CI
to invoke the CLI — a one-time "have Node installed to run a scaffolding tool" ask, not an
ongoing footprint. (A prebuilt binary or pipx wrapper was considered and dropped as
unnecessary.)

## License

[MIT](./LICENSE) © 2026 Jhay Bagas

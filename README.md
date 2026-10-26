# nvaid

One CLI that installs an **AI-DLC** (AI Development Lifecycle) skills-and-workflow toolkit
into **any** coding agent, and houses a repo's intents, config, and design-code dictionary
in a single owned `nvaid/` folder.

Edit a skill once here, publish, and every consuming repo re-syncs with `nvaid update` —
no more hand-copying skills between repositories, or between one agent's config and
another's (`.claude/`, `.kiro/`, `.cursor/`, …).

## Install & use

```bash
npm i -g nvaid     # or on demand: npx nvaid <command>

cd your-repo
nvaid init               # pick coding agents, inject skills + slash commands, drop nvaid/
nvaid update             # re-sync every configured agent to the installed nvaid version
nvaid validate           # CI gate: fail if generated files are stale or hand-edited
```

`init` flags:

```bash
nvaid init --agents claude,kiro,cursor   # skip the prompt, name agents directly
nvaid init --owning-repo frontend        # preset the config's owning_repo
nvaid init --yes                          # non-interactive (defaults to the AGENTS.md catch-all)
```

## Upgrading

Upgrading is **two steps**, because `nvaid update` re-syncs a repo to the version of the
tool installed on your machine — it does not upgrade the tool itself:

```bash
# 1. upgrade the tool (once per machine, when a new version ships)
npm i -g nvaid@latest

# 2. re-sync each repo to the new version (run inside each repo)
nvaid update
```

nvaid checks npm (at most once a day, cached, non-blocking) and prints a one-line nudge
when a newer version is available — it never upgrades itself (the package manager owns the
tool's lifecycle). Silence the check with `NVAID_NO_UPDATE_CHECK=1`.

Note: `nvaid update` never touches hand-owned files (`config.yml`, `PROJECT-RULES.md`,
`DESIGN-CODE-DICTIONARY.md`, `intents/`). If a new version adds a config field, add it to
your `config.yml` by hand — the changelog will call these out.

## How it works

- **Full skill set, no profiles.** `init` injects every skill into each selected agent. A
  repo declares what it *is* in `nvaid/config.yml` (`owning_repo`), rather than receiving a
  trimmed-down skill set.
- **Any coding agent.** `init` shows a multi-select. Each agent is a *path + format adapter*
  (`src/agents.ts`) over one neutral source — adding a new agent is a new registry entry,
  not new content. An `AGENTS.md` catch-all covers any tool that reads the cross-agent
  standard but has no bespoke adapter.
- **The `nvaid/` folder is hand-owned, content only** — `config.yml`, `PROJECT-RULES.md`,
  `DESIGN-CODE-DICTIONARY.md`, and `intents/`. `update` never touches these. The *generated*
  skill/command files live in each agent's own directory and carry a "do not edit" header.
- **`PROJECT-RULES.md` and `DESIGN-CODE-DICTIONARY.md` are per-project templates**, not
  shipped content: `init` drops fill-in skeletons for a developer to own. nvaid ships only
  the universal skills and the contract/unit-decomposition rules.
- **Drift is caught, not just avoided.** `validate` fails (exit 1) if a repo's generated
  files are stale (behind the installed version), missing, or hand-edited — turning silent
  divergence into a failing CI check.

## The workflow (slash commands)

`init` installs four gated commands. They run in order, with a human gate after the intent:

```
/nvaid:intent      draft the intent and open the stage-1 PR (intent.md only), then STOP
   ⏸  Intent Approved = stage-1 intent/ PR approved + merged
/nvaid:contracts   draft the per-role architecture contracts on an elaboration/ branch
/nvaid:breakdown   cut into units (each tagged with its owning repo) and open the stage-2 PR
   ⏸  Decomposition Approved = stage-2 elaboration/ PR approved + merged
/nvaid:apply       generate per-repo unit docs + open construction branches
```

Contracts precede the breakdown deliberately (the contract skills run across the
elaboration phases; the unit-breakdown is their final output).

## Repository layout

```
nvaid/
  package.json              # bin: nvaid; ships dist/ + templates/
  tsconfig.json
  src/
    cli.ts                  # command wiring (commander)
    agents.ts               # the agent registry — 9 bespoke + an AGENTS.md catch-all
    paths.ts                # resolves the bundled templates/
    config.ts               # read/patch a repo's nvaid/config.yml
    scaffold.ts             # drop the nvaid/ folder + sync nvaid/rules
    generate.ts             # neutral source -> per-agent files (+ drift diff)
    commands/
      init.ts               # agent multi-select + inject + scaffold nvaid/
      update.ts             # re-sync configured agents
      validate.ts           # drift gate
  templates/                # the payload shipped in the package
    skills/                 # 12 skills (6 ceremony + frontend + backend + 4 tool)
    rules/                  # 7 flow/rule files (contract-gen, unit-breakdown, tracker)
    commands/               # the 4 slash-command defs
    nvaid/                  # the folder init drops into a repo (all hand-owned)
      config.yml
      PROJECT-RULES.md      # fill-in template
      DESIGN-CODE-DICTIONARY.md  # fill-in template (a technical README for the code)
      intents/
```

### Skills included (`templates/skills/`)

- **Ceremony:** `customer-experience`, `solutions`, `quality`, `unit-breakdown`,
  `r3-analytics`, `release-plan`
- **Tier:** `frontend`, `backend`
- **Tool:** `github`, `project-ticketing`, `pr-review`, `daily-construction-update`

## Development

```bash
npm install
npm run typecheck
npm run dev -- init --agents claude   # run the CLI from source (tsx)
npm run build                          # bundle src/ -> dist/cli.js (tsup)
npm test                               # vitest
```

## Status & next steps

The CLI (`init` / `update` / `validate`) is implemented and runs end-to-end. Still open:

- Tests (`vitest`) for the generator and the agent adapters.
- Confirm each agent's target path against its current docs before relying on its adapter
  (agent conventions change often; `AGENTS.md` is the safe default).
### Non-JS repos (Python, Go, etc.)

No special delivery path needed. nvaid only *writes files* — skills, the guardrail
templates, and the `nvaid/` folder — and exits; the output has no runtime dependency on
Node. A Python repo just runs the command once:

```bash
npx nvaid init
```

Nothing is added to the target project itself (no `devDependency`, no Node toolchain in
the repo). The only requirement is that Node is available on the developer's machine or CI
to invoke the CLI — a one-time "have Node installed to run a scaffolding tool" ask, not an
ongoing footprint. (A prebuilt binary or pipx wrapper was considered and dropped as
unnecessary.)

/**
 * `hyd init` — onboard a repo.
 *
 * 1. Present a multi-select of coding agents (src/agents.ts).
 * 2. Choose the workflow mode: team (named architects) or solo (one developer).
 * 3. On confirm, inject the skill set + command defs for that mode into each chosen agent.
 * 4. Drop the halyard/ folder once: config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/.
 *
 * No profiles — the full skill set goes to every selected agent (proposal §14.1); the mode
 * only changes how the workflow is worded and which team-only ceremony skills ship.
 */
import * as p from "@clack/prompts";
import pc from "picocolors";
import { AGENTS, getAgent, type AgentTarget } from "../agents.js";
import { generateAgentFiles } from "../generate.js";
import { scaffoldHalyardFolder, syncRules } from "../scaffold.js";
import { hasConfig, setConfigFields } from "../config.js";
import { halyardVersion } from "../paths.js";
import { isMode, MODES, DEFAULT_MODE, type Mode } from "../mode.js";

export interface InitOptions {
  agents?: string[];
  owningRepo?: string;
  projectName?: string;
  mode?: string;
  yes?: boolean;
}

export async function runInit(opts: InitOptions): Promise<void> {
  const projectRoot = process.cwd();

  if (hasConfig(projectRoot) && !opts.yes) {
    const proceed = await p.confirm({
      message: "This repo already has halyard/config.yml. Re-run init anyway (update is usually what you want)?",
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Nothing changed. Run `hyd update` to re-sync agents.");
      return;
    }
  }

  // 1. choose agents
  let selected: AgentTarget[];
  if (opts.agents?.length) {
    selected = opts.agents.map(resolveAgentOrThrow);
  } else if (opts.yes) {
    selected = [getAgent("agents-md")!]; // safe default in non-interactive mode
  } else {
    p.intro(pc.bold("hyd init"));
    const choice = await p.multiselect({
      message: "Select the coding agents to set up (space to toggle, enter to confirm):",
      options: AGENTS.map((a) => ({ value: a.id, label: a.label, hint: a.skillsPath })),
      required: true,
    });
    if (p.isCancel(choice)) {
      p.cancel("Cancelled.");
      return;
    }
    selected = (choice as string[]).map(resolveAgentOrThrow);
  }

  // 2. choose the workflow mode
  let mode: Mode;
  if (opts.mode !== undefined) {
    if (!isMode(opts.mode)) throw new Error(`Unknown mode: "${opts.mode}". Known: ${MODES.join(", ")}`);
    mode = opts.mode;
  } else if (opts.yes) {
    mode = DEFAULT_MODE;
  } else {
    const choice = await p.select({
      message: "Who runs the lifecycle in this project?",
      options: [
        { value: "team", label: "Team", hint: "named architects sign off each contract; gates are approved PRs" },
        { value: "solo", label: "Solo developer", hint: "you own every role; one design.md; gates are your own merges" },
      ],
      initialValue: DEFAULT_MODE,
    });
    if (p.isCancel(choice)) {
      p.cancel("Cancelled.");
      return;
    }
    mode = choice as Mode;
  }

  // 3. inject skills + commands
  const gen = await generateAgentFiles({ projectRoot, agents: selected, force: false, mode });

  // 4. scaffold the halyard/ folder + the shared rules
  const scaffolded = await scaffoldHalyardFolder(projectRoot, mode);
  await syncRules(projectRoot, mode);

  // record config
  await setConfigFields(projectRoot, {
    mode,
    agents: selected.map((a) => a.id),
    owning_repo: opts.owningRepo ?? "<set-me>",
    ...(opts.projectName ? { project_name: opts.projectName } : {}),
    generated_with: await halyardVersion(),
  });

  // 5. report
  p.note(
    [
      `agents:   ${selected.map((a) => a.label).join(", ")}`,
      `mode:     ${mode}`,
      `written:  ${gen.written.length} agent files` + (gen.skipped.length ? `, ${gen.skipped.length} skipped (existing)` : ""),
      `halyard/:   ${scaffolded.length ? scaffolded.length + " files created" : "already present"}`,
    ].join("\n"),
    "Done",
  );
  p.outro(
    [
      "Next, in your AI chat — run this FIRST:",
      "  /hyd:install         scan the project, fill config.yml + PROJECT-RULES + dictionary",
      "",
      "The workflow commands are blocked until /hyd:install completes:",
      ...(mode === "solo"
        ? [
            "  /hyd:intent \"...\"   draft the intent, then STOP until you merge its PR",
            "  /hyd:contracts       after the merge — draft design.md (one section per role)",
            "  /hyd:breakdown       add the unit breakdown to design.md (grouped by repo)",
            "  /hyd:apply           generate per-repo unit docs + branches",
          ]
        : [
            "  /hyd:intent \"...\"   draft the intent, then STOP for stakeholder approval",
            "  /hyd:contracts       after approval — draft the per-role contracts",
            "  /hyd:breakdown       cut into units (tagged by owning repo)",
            "  /hyd:apply           generate per-repo unit docs + branches",
          ]),
    ].join("\n"),
  );
}

function resolveAgentOrThrow(id: string): AgentTarget {
  const a = getAgent(id);
  if (!a) throw new Error(`Unknown agent id: "${id}". Known: ${AGENTS.map((x) => x.id).join(", ")}`);
  return a;
}

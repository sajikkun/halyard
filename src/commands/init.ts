/**
 * `nvaid init` — onboard a repo.
 *
 * 1. Present a multi-select of coding agents (src/agents.ts).
 * 2. On confirm, inject the full skill set + command defs into each chosen agent.
 * 3. Drop the nvaid/ folder once: config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/.
 *
 * No profiles — the full skill set goes to every selected agent (proposal §14.1).
 */
import * as p from "@clack/prompts";
import pc from "picocolors";
import { AGENTS, getAgent, type AgentTarget } from "../agents.js";
import { generateAgentFiles } from "../generate.js";
import { scaffoldNvaidFolder, syncRules } from "../scaffold.js";
import { hasConfig, setConfigFields } from "../config.js";
import { nvaidVersion } from "../paths.js";

export interface InitOptions {
  agents?: string[];
  owningRepo?: string;
  projectName?: string;
  yes?: boolean;
}

export async function runInit(opts: InitOptions): Promise<void> {
  const projectRoot = process.cwd();

  if (hasConfig(projectRoot) && !opts.yes) {
    const proceed = await p.confirm({
      message: "This repo already has nvaid/config.yml. Re-run init anyway (update is usually what you want)?",
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Nothing changed. Run `nvaid update` to re-sync agents.");
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
    p.intro(pc.bold("nvaid init"));
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

  // 2. inject skills + commands
  const gen = await generateAgentFiles({ projectRoot, agents: selected, force: false });

  // 3. scaffold the nvaid/ folder + the shared rules
  const scaffolded = await scaffoldNvaidFolder(projectRoot);
  await syncRules(projectRoot);

  // record config
  await setConfigFields(projectRoot, {
    agents: selected.map((a) => a.id),
    owning_repo: opts.owningRepo ?? "<set-me>",
    ...(opts.projectName ? { project_name: opts.projectName } : {}),
    generated_with: await nvaidVersion(),
  });

  // 4. report
  p.note(
    [
      `agents:   ${selected.map((a) => a.label).join(", ")}`,
      `written:  ${gen.written.length} agent files` + (gen.skipped.length ? `, ${gen.skipped.length} skipped (existing)` : ""),
      `nvaid/:   ${scaffolded.length ? scaffolded.length + " files created" : "already present"}`,
    ].join("\n"),
    "Done",
  );
  p.outro(
    [
      "Next, in your AI chat — run this FIRST:",
      "  /nvaid:install         scan the project, fill config.yml + PROJECT-RULES + dictionary",
      "",
      "The workflow commands are blocked until /nvaid:install completes:",
      "  /nvaid:intent \"...\"   draft the intent, then STOP for stakeholder approval",
      "  /nvaid:contracts       after approval — draft the per-role contracts",
      "  /nvaid:breakdown       cut into units (tagged by owning repo)",
      "  /nvaid:apply           generate per-repo unit docs + branches",
    ].join("\n"),
  );
}

function resolveAgentOrThrow(id: string): AgentTarget {
  const a = getAgent(id);
  if (!a) throw new Error(`Unknown agent id: "${id}". Known: ${AGENTS.map((x) => x.id).join(", ")}`);
  return a;
}

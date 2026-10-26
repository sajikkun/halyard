/**
 * `nvaid update` — re-sync a repo's agent files to the installed nvaid version.
 *
 * Reads which agents are configured from nvaid/config.yml and regenerates their files
 * wholesale. Never touches the hand-owned members of nvaid/ (config.yml,
 * PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/). It DOES refresh nvaid/rules/,
 * which is generated content the skills reference. Proposal §14.3 clobber contract.
 */
import * as p from "@clack/prompts";
import pc from "picocolors";
import { getAgent, type AgentTarget } from "../agents.js";
import { generateAgentFiles, cleanAgentDirs } from "../generate.js";
import { syncRules } from "../scaffold.js";
import { hasConfig, readConfig, setConfigFields } from "../config.js";
import { nvaidVersion } from "../paths.js";

export async function runUpdate(): Promise<void> {
  const projectRoot = process.cwd();

  if (!hasConfig(projectRoot)) {
    throw new Error("No nvaid/config.yml here. Run `nvaid init` first.");
  }

  const cfg = await readConfig(projectRoot);
  if (!cfg.agents.length) {
    throw new Error("config.yml lists no agents. Run `nvaid init` to select some.");
  }

  const agents: AgentTarget[] = cfg.agents.map((id) => {
    const a = getAgent(id);
    if (!a) throw new Error(`config.yml references unknown agent "${id}".`);
    return a;
  });

  const version = await nvaidVersion();
  p.intro(pc.bold(`nvaid update → ${version}`));

  // clean the generated command subdirs, then regenerate everything (force overwrite)
  await cleanAgentDirs(projectRoot, agents);
  const gen = await generateAgentFiles({ projectRoot, agents, force: true });
  await syncRules(projectRoot);

  await setConfigFields(projectRoot, { generated_with: version });

  p.note(
    [
      `agents:   ${agents.map((a) => a.label).join(", ")}`,
      `rewrote:  ${gen.written.length} agent files`,
      `rules:    refreshed nvaid/rules/`,
      `was:      ${cfg.generated_with || "unknown"}  →  now: ${version}`,
    ].join("\n"),
    "Updated",
  );
  p.outro("Hand-owned files (config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/) untouched.");
}

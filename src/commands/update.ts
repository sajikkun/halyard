/**
 * `hyd update` — re-sync a repo's agent files to the installed halyard version.
 *
 * Reads which agents are configured from halyard/config.yml and regenerates their files
 * wholesale. Never touches the hand-owned members of halyard/ (config.yml,
 * PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/). It DOES refresh halyard/rules/,
 * which is generated content the skills reference. Proposal §14.3 clobber contract.
 */
import * as p from "@clack/prompts";
import pc from "picocolors";
import { getAgent, type AgentTarget } from "../agents.js";
import { generateAgentFiles, cleanAgentDirs } from "../generate.js";
import { syncRules } from "../scaffold.js";
import { hasConfig, readConfig, setConfigFields } from "../config.js";
import { halyardVersion } from "../paths.js";

export async function runUpdate(): Promise<void> {
  const projectRoot = process.cwd();

  if (!hasConfig(projectRoot)) {
    throw new Error("No halyard/config.yml here. Run `hyd init` first.");
  }

  const cfg = await readConfig(projectRoot);
  if (!cfg.agents.length) {
    throw new Error("config.yml lists no agents. Run `hyd init` to select some.");
  }

  const agents: AgentTarget[] = cfg.agents.map((id) => {
    const a = getAgent(id);
    if (!a) throw new Error(`config.yml references unknown agent "${id}".`);
    return a;
  });

  const version = await halyardVersion();
  p.intro(pc.bold(`hyd update → ${version}`));

  // clean the generated command subdirs, then regenerate everything (force overwrite)
  await cleanAgentDirs(projectRoot, agents, cfg.mode);
  const gen = await generateAgentFiles({ projectRoot, agents, force: true, mode: cfg.mode });
  await syncRules(projectRoot, cfg.mode);

  await setConfigFields(projectRoot, { generated_with: version });

  p.note(
    [
      `agents:   ${agents.map((a) => a.label).join(", ")}`,
      `mode:     ${cfg.mode}`,
      `rewrote:  ${gen.written.length} agent files`,
      `rules:    refreshed halyard/rules/`,
      `was:      ${cfg.generated_with || "unknown"}  →  now: ${version}`,
    ].join("\n"),
    "Updated",
  );
  p.outro("Hand-owned files (config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/) untouched.");
}

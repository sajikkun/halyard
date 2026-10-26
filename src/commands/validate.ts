/**
 * `nvaid validate` — drift guard, intended as a CI gate.
 *
 * Fails (exit 1) if a repo's generated agent files are stale (behind the installed nvaid
 * version), missing, or hand-edited. Turns silent drift — the 0.13-vs-0.12 situation that
 * motivated nvaid — into a failing check.
 */
import pc from "picocolors";
import { getAgent, type AgentTarget } from "../agents.js";
import { diffAgentFiles } from "../generate.js";
import { diffRules } from "../scaffold.js";
import { hasConfig, readConfig } from "../config.js";
import { nvaidVersion } from "../paths.js";

export async function runValidate(): Promise<number> {
  const projectRoot = process.cwd();

  if (!hasConfig(projectRoot)) {
    console.error(pc.red("✗ No nvaid/config.yml here. Run `nvaid init` first."));
    return 1;
  }

  const cfg = await readConfig(projectRoot);
  const agents: AgentTarget[] = [];
  for (const id of cfg.agents) {
    const a = getAgent(id);
    if (!a) {
      console.error(pc.red(`✗ config.yml references unknown agent "${id}".`));
      return 1;
    }
    agents.push(a);
  }

  const version = await nvaidVersion();
  let failed = false;

  // version pin check
  if (cfg.generated_with && cfg.generated_with !== version) {
    console.error(
      pc.yellow(
        `⚠ generated with nvaid ${cfg.generated_with}, installed is ${version}. Run \`nvaid update\`.`,
      ),
    );
    failed = true;
  }

  // content drift check — agent files (skills + commands) AND the synced rules
  const agentDrift = await diffAgentFiles({ projectRoot, agents, force: true });
  const ruleDrift = await diffRules(projectRoot);
  const drift = [...agentDrift, ...ruleDrift];
  if (drift.length) {
    console.error(pc.red(`✗ ${drift.length} generated file(s) stale or hand-edited:`));
    for (const f of drift) console.error(pc.red(`    ${f}`));
    console.error(pc.dim("  Run `nvaid update` to regenerate (hand edits belong in the nvaid source, not here)."));
    failed = true;
  }

  if (failed) return 1;
  console.log(
    pc.green(`✓ nvaid ${version}: ${agents.length} agent(s) + rules in sync, no drift.`),
  );
  return 0;
}

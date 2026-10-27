#!/usr/bin/env node
/**
 * halyard CLI entry point.
 *
 * Commands:
 *   hyd init       onboard a repo: pick agents, inject skills, drop the halyard/ folder
 *   hyd update     re-sync agent files to the installed halyard version
 *   hyd validate   fail if generated files are stale or hand-edited (CI gate)
 *
 * Command logic lives in src/commands/*; this file only wires argument parsing.
 */
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runUpdate } from "./commands/update.js";
import { runValidate } from "./commands/validate.js";
import { halyardVersion } from "./paths.js";
import { notifyIfOutdated } from "./updateNotifier.js";

const program = new Command();

program
  .name("hyd")
  .description("halyard — install an AI-DLC skills + workflow toolkit into any coding agent")
  .version(await halyardVersion());

program
  .command("init")
  .description("Onboard this repo: select coding agents, inject skills, create the halyard/ folder")
  .option("--agents <ids>", "comma-separated agent ids (skips the prompt)", (v) => v.split(","))
  .option("--owning-repo <tier>", "owning_repo value written to config.yml")
  .option("--project-name <name>", "project_name value written to config.yml")
  .option("--mode <mode>", "workflow mode: team (named architects) or solo (one developer)")
  .option("-y, --yes", "accept defaults, no prompts (CI)")
  .action(async (opts) => {
    await runInit({
      agents: opts.agents,
      owningRepo: opts.owningRepo,
      projectName: opts.projectName,
      mode: opts.mode,
      yes: opts.yes,
    });
  });

program
  .command("update")
  .description("Re-sync agent files to the installed halyard version")
  .action(async () => {
    await runUpdate();
  });

program
  .command("validate")
  .description("Fail if generated agent files are stale or hand-edited")
  .action(async () => {
    const code = await runValidate();
    await notifyIfOutdated(); // run before exiting, else it'd be skipped
    process.exit(code);
  });

program
  .parseAsync()
  .then(async () => {
    // runs for commands that return normally (init, update); validate exits on its own above
    await notifyIfOutdated();
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });

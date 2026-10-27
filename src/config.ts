/**
 * Read / write a consuming repo's halyard/config.yml.
 *
 * This file is hand-owned, but init/update manage the `agents` and `generated_with`
 * fields. We parse and re-serialize carefully; we do NOT round-trip comments (the YAML
 * lib would drop them), so update rewrites only via setConfigFields which preserves the
 * on-disk text and surgically patches the two managed keys.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { HALYARD_DIR_NAME, CONFIG_FILE } from "./paths.js";
import { isMode, DEFAULT_MODE, type Mode } from "./mode.js";

export interface TechStack {
  languages: string[];
  runtime: string;
  frameworks: string[];
  package_manager: string;
  build: string;
  test: string;
  lint_format: string;
  database: string;
  deploy: string;
  additional: Record<string, string>;
}

export interface InstallStatus {
  config: boolean;
  project_rules: boolean;
  design_code_dictionary: boolean;
}

export interface HalyardConfig {
  schema: string;
  /** team (named architects) or solo (one developer owns every role) */
  mode: Mode;
  install: InstallStatus;
  project_name: string;
  owning_repo: string;
  tech_stack: TechStack;
  agents: string[];
  context: string;
  generated_with: string;
}

/** True only when all three required documents have been authored by /hyd:install. */
export function isInstalled(c: HalyardConfig): boolean {
  return c.install.config && c.install.project_rules && c.install.design_code_dictionary;
}

const EMPTY_STACK: TechStack = {
  languages: [],
  runtime: "",
  frameworks: [],
  package_manager: "",
  build: "",
  test: "",
  lint_format: "",
  database: "",
  deploy: "",
  additional: {},
};

export function configPath(projectRoot: string): string {
  return join(projectRoot, HALYARD_DIR_NAME, CONFIG_FILE);
}

export function hasConfig(projectRoot: string): boolean {
  return existsSync(configPath(projectRoot));
}

export async function readConfig(projectRoot: string): Promise<HalyardConfig> {
  const raw = await readFile(configPath(projectRoot), "utf8");
  const parsed = parse(raw) ?? {};
  const install = parsed.install ?? {};
  return {
    schema: parsed.schema ?? "halyard/v1",
    // configs written before modes existed are team configs
    mode: isMode(parsed.mode) ? parsed.mode : DEFAULT_MODE,
    install: {
      config: install.config === true,
      project_rules: install.project_rules === true,
      design_code_dictionary: install.design_code_dictionary === true,
    },
    project_name: parsed.project_name ?? "",
    owning_repo: parsed.owning_repo ?? "",
    tech_stack: { ...EMPTY_STACK, ...(parsed.tech_stack ?? {}) },
    agents: Array.isArray(parsed.agents) ? parsed.agents : [],
    context: parsed.context ?? "",
    generated_with: parsed.generated_with ?? "",
  };
}

/**
 * Patch the two init/update-managed keys in-place, preserving the rest of the file text
 * (comments included). Minimal and line-oriented on purpose.
 */
export async function setConfigFields(
  projectRoot: string,
  fields: { agents?: string[]; owning_repo?: string; generated_with?: string; project_name?: string; mode?: Mode },
): Promise<void> {
  const path = configPath(projectRoot);
  let text = await readFile(path, "utf8");

  if (fields.mode !== undefined) {
    text = replaceScalar(text, "mode", `"${fields.mode}"`);
  }
  if (fields.project_name !== undefined) {
    text = replaceScalar(text, "project_name", `"${fields.project_name}"`);
  }
  if (fields.owning_repo !== undefined) {
    text = replaceScalar(text, "owning_repo", `"${fields.owning_repo}"`);
  }
  if (fields.generated_with !== undefined) {
    text = replaceScalar(text, "generated_with", `"${fields.generated_with}"`);
  }
  if (fields.agents !== undefined) {
    text = replaceAgents(text, fields.agents);
  }

  await writeFile(path, text, "utf8");
}

function replaceScalar(text: string, key: string, value: string): string {
  const re = new RegExp(`^(${key}:).*$`, "m");
  return re.test(text) ? text.replace(re, `$1 ${value}`) : `${text}\n${key}: ${value}\n`;
}

/** Replace the `agents:` block (either `agents: []` or a multi-line list). */
function replaceAgents(text: string, agents: string[]): string {
  const flow = agents.length ? `[${agents.map((a) => `"${a}"`).join(", ")}]` : "[]";
  // match `agents:` plus any following `- ...` list lines
  const re = /^agents:.*(?:\n[ \t]*-.*)*$/m;
  const line = `agents: ${flow}`;
  return re.test(text) ? text.replace(re, line) : `${text}\n${line}\n`;
}

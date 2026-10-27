/**
 * Resolves the location of the bundled templates/ directory, both when running from
 * src/ (dev) and from dist/ (published package).
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/** templates/ ships at the package root, one level up from both src/ and dist/ */
export const TEMPLATES_DIR = resolve(here, "..", "templates");

export const SKILLS_SRC = resolve(TEMPLATES_DIR, "skills");
export const RULES_SRC = resolve(TEMPLATES_DIR, "rules");
export const COMMANDS_SRC = resolve(TEMPLATES_DIR, "commands");
export const HALYARD_FOLDER_SRC = resolve(TEMPLATES_DIR, "halyard");

/** the single owned folder halyard drops into a consuming repo */
export const HALYARD_DIR_NAME = "halyard";
export const CONFIG_FILE = "config.yml";

/** token in neutral skill sources, substituted per agent at generate time */
export const AIDLC_ROOT_TOKEN = "{{AIDLC_ROOT}}";

/** this halyard build's version, read from the package.json that ships with it */
export async function halyardVersion(): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(resolve(TEMPLATES_DIR, "..", "package.json"), "utf8"));
  return pkg.version as string;
}

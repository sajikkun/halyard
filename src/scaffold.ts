/**
 * Scaffolds the hand-owned halyard/ folder and the shared rules into a consuming repo.
 *
 * halyard/ (config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/) is copied
 * from templates/halyard once at init (mode blocks resolved) and never touched again by update.
 *
 * halyard/rules/ (the contract-gen + unit-breakdown + tracker rules the skills reference
 * via {{AIDLC_ROOT}}) is copied from templates/rules and IS refreshed by update.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { HALYARD_FOLDER_SRC, RULES_SRC, HALYARD_DIR_NAME } from "./paths.js";
import { withHeader } from "./header.js";
import { renderMode, appliesToMode, DEFAULT_MODE, type Mode } from "./mode.js";

/** Copy templates/halyard -> <root>/halyard, skipping files that already exist. */
export async function scaffoldHalyardFolder(projectRoot: string, mode: Mode = DEFAULT_MODE): Promise<string[]> {
  const dest = join(projectRoot, HALYARD_DIR_NAME);
  await mkdir(dest, { recursive: true });
  const written: string[] = [];
  await copyTreeSkipExisting(HALYARD_FOLDER_SRC, dest, written, mode);
  return written;
}

/** The rule files this mode ships, rendered with the do-not-edit header. */
async function renderedRules(mode: Mode): Promise<{ shipped: Map<string, string>; excluded: string[] }> {
  const shipped = new Map<string, string>();
  const excluded: string[] = [];
  for (const name of await readdir(RULES_SRC)) {
    const raw = await readFile(join(RULES_SRC, name), "utf8");
    if (appliesToMode(raw, mode)) shipped.set(name, withHeader(renderMode(raw, mode)));
    else excluded.push(name);
  }
  return { shipped, excluded };
}

/**
 * Sync templates/rules -> <root>/halyard/rules (refreshed on update). Each rule file is
 * written WITH the "do not edit" header (frontmatter-safe), so it's a clearly-generated,
 * drift-checkable file — not a raw copy. A hand-edit is then caught by `diffRules`.
 */
export async function syncRules(projectRoot: string, mode: Mode = DEFAULT_MODE): Promise<void> {
  const dest = join(projectRoot, HALYARD_DIR_NAME, "rules");
  await mkdir(dest, { recursive: true });
  const { shipped, excluded } = await renderedRules(mode);
  for (const [name, body] of shipped) {
    await writeFile(join(dest, name), body, "utf8");
  }
  // a rule file the other mode ships is halyard-owned, so a mode switch removes it
  for (const name of excluded) {
    await rm(join(dest, name), { force: true });
  }
}

/**
 * Compare the repo's halyard/rules/* against freshly header-stamped source. Returns the
 * list of rule files that are missing, stale (behind the installed halyard), or hand-edited.
 * This closes the gap where syncRules copied rules but nothing ever validated them.
 */
export async function diffRules(projectRoot: string, mode: Mode = DEFAULT_MODE): Promise<string[]> {
  const dest = join(projectRoot, HALYARD_DIR_NAME, "rules");
  const drift: string[] = [];
  const { shipped, excluded } = await renderedRules(mode);
  for (const name of excluded) {
    const target = join(dest, name);
    if (existsSync(target)) drift.push(`${relative(projectRoot, target)} (not used in ${mode} mode)`);
  }
  for (const [name, expected] of shipped) {
    const target = join(dest, name);
    if (!existsSync(target)) {
      drift.push(`${relative(projectRoot, target)} (missing)`);
      continue;
    }
    if ((await readFile(target, "utf8")) !== expected) drift.push(relative(projectRoot, target));
  }
  return drift;
}

async function copyTreeSkipExisting(src: string, dest: string, written: string[], mode: Mode): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      await mkdir(d, { recursive: true });
      await copyTreeSkipExisting(s, d, written, mode);
    } else {
      if (existsSync(d)) continue; // hand-owned: never clobber
      await writeFile(d, renderMode(await readFile(s, "utf8"), mode), "utf8");
      written.push(d);
    }
  }
}

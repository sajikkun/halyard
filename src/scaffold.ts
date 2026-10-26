/**
 * Scaffolds the hand-owned nvaid/ folder and the shared rules into a consuming repo.
 *
 * nvaid/ (config.yml, PROJECT-RULES.md, DESIGN-CODE-DICTIONARY.md, intents/) is copied
 * from templates/nvaid once at init and never touched again by update.
 *
 * nvaid/rules/ (the contract-gen + unit-breakdown + tracker rules the skills reference
 * via {{AIDLC_ROOT}}) is copied from templates/rules and IS refreshed by update.
 */
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { NVAID_FOLDER_SRC, RULES_SRC, NVAID_DIR_NAME } from "./paths.js";
import { withHeader } from "./header.js";

/** Copy templates/nvaid -> <root>/nvaid, skipping files that already exist. */
export async function scaffoldNvaidFolder(projectRoot: string): Promise<string[]> {
  const dest = join(projectRoot, NVAID_DIR_NAME);
  await mkdir(dest, { recursive: true });
  const written: string[] = [];
  await copyTreeSkipExisting(NVAID_FOLDER_SRC, dest, written);
  return written;
}

/**
 * Sync templates/rules -> <root>/nvaid/rules (refreshed on update). Each rule file is
 * written WITH the "do not edit" header (frontmatter-safe), so it's a clearly-generated,
 * drift-checkable file — not a raw copy. A hand-edit is then caught by `diffRules`.
 */
export async function syncRules(projectRoot: string): Promise<void> {
  const dest = join(projectRoot, NVAID_DIR_NAME, "rules");
  await mkdir(dest, { recursive: true });
  for (const name of await readdir(RULES_SRC)) {
    const body = await readFile(join(RULES_SRC, name), "utf8");
    await writeFile(join(dest, name), withHeader(body), "utf8");
  }
}

/**
 * Compare the repo's nvaid/rules/* against freshly header-stamped source. Returns the
 * list of rule files that are missing, stale (behind the installed nvaid), or hand-edited.
 * This closes the gap where syncRules copied rules but nothing ever validated them.
 */
export async function diffRules(projectRoot: string): Promise<string[]> {
  const dest = join(projectRoot, NVAID_DIR_NAME, "rules");
  const drift: string[] = [];
  for (const name of await readdir(RULES_SRC)) {
    const expected = withHeader(await readFile(join(RULES_SRC, name), "utf8"));
    const target = join(dest, name);
    if (!existsSync(target)) {
      drift.push(`${relative(projectRoot, target)} (missing)`);
      continue;
    }
    if ((await readFile(target, "utf8")) !== expected) drift.push(relative(projectRoot, target));
  }
  return drift;
}

async function copyTreeSkipExisting(src: string, dest: string, written: string[]): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      await mkdir(d, { recursive: true });
      await copyTreeSkipExisting(s, d, written);
    } else {
      if (existsSync(d)) continue; // hand-owned: never clobber
      await cp(s, d);
      written.push(d);
    }
  }
}

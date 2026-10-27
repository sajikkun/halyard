import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { renderMode, appliesToMode, MODES } from "../src/mode.js";
import { generateAgentFiles, diffAgentFiles, cleanAgentDirs } from "../src/generate.js";
import { scaffoldHalyardFolder, syncRules, diffRules } from "../src/scaffold.js";
import { getAgent } from "../src/agents.js";

const claude = getAgent("claude")!;

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "halyard-mode-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function walk(root: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(root, { withFileTypes: true })) {
    const p = join(root, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

describe("renderMode", () => {
  it("keeps the matching block and drops the other, tag lines included", () => {
    const src = "a\n{{#team}}\nteam line\n{{/team}}\n{{#solo}}\nsolo line\n{{/solo}}\nb\n";
    expect(renderMode(src, "team")).toBe("a\nteam line\nb\n");
    expect(renderMode(src, "solo")).toBe("a\nsolo line\nb\n");
  });

  it("resolves inline blocks within a line", () => {
    const src = "merged by {{#team}}the reviewer{{/team}}{{#solo}}you{{/solo}}.";
    expect(renderMode(src, "team")).toBe("merged by the reviewer.");
    expect(renderMode(src, "solo")).toBe("merged by you.");
  });

  it("strips the modes: frontmatter line", () => {
    expect(renderMode("---\nname: x\nmodes: [team]\n---\nbody", "team")).toBe("---\nname: x\n---\nbody");
  });
});

describe("appliesToMode", () => {
  it("is true without a modes: line", () => {
    expect(appliesToMode("---\nname: x\n---\n", "solo")).toBe(true);
    expect(appliesToMode("no frontmatter", "solo")).toBe(true);
  });

  it("honours a modes: list in frontmatter", () => {
    const body = "---\nname: x\nmodes: [team]\n---\n";
    expect(appliesToMode(body, "team")).toBe(true);
    expect(appliesToMode(body, "solo")).toBe(false);
  });

  it("ignores a modes: line outside the frontmatter", () => {
    expect(appliesToMode("---\nname: x\n---\nmodes: [team]\n", "solo")).toBe(true);
  });
});

describe.each(MODES)("%s mode output", (mode) => {
  it("leaves no unresolved mode tags or modes: lines in any generated file", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode });
    await scaffoldHalyardFolder(dir, mode);
    await syncRules(dir, mode);
    for (const f of await walk(dir)) {
      const body = await readFile(f, "utf8");
      expect(body, f).not.toMatch(/\{\{[#/](team|solo)\}\}/);
      expect(body, f).not.toMatch(/^modes:/m);
    }
  });

  it("scaffolds a config.yml that parses and records the mode's sign-off identities", async () => {
    await scaffoldHalyardFolder(dir, mode);
    const cfg = parse(await readFile(join(dir, "halyard/config.yml"), "utf8"));
    if (mode === "solo") {
      expect(cfg.developer).toBe("<name>");
      expect(cfg.architects).toBeUndefined();
    } else {
      expect(cfg.architects.solutions).toBe("<name>");
      expect(cfg.developer).toBeUndefined();
    }
  });

  it("is drift-free right after generating", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode });
    await mkdir(join(dir, "halyard"), { recursive: true });
    await syncRules(dir, mode);
    expect(await diffAgentFiles({ projectRoot: dir, agents: [claude], force: true, mode })).toEqual([]);
    expect(await diffRules(dir, mode)).toEqual([]);
  });
});

describe("solo mode", () => {
  it("ships solo-mode-rules.md and drops the team-only daily update skill", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode: "solo" });
    await mkdir(join(dir, "halyard"), { recursive: true });
    await syncRules(dir, "solo");
    expect(existsSync(join(dir, "halyard/rules/solo-mode-rules.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude/skills/daily-construction-update"))).toBe(false);
  });

  it("has the contracts command write design.md and gate on the merge, not a review", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode: "solo" });
    const cmd = await readFile(join(dir, ".claude/commands/hyd/contracts.md"), "utf8");
    expect(cmd).toContain("design.md");
    expect(cmd).toContain("mergedBy");
    expect(cmd).not.toContain("APPROVED");
    expect(cmd).not.toContain("architects.<role>");
  });

  it("keeps multi-repo support and the develop branch", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode: "solo" });
    const apply = await readFile(join(dir, ".claude/commands/hyd/apply.md"), "utf8");
    expect(apply).toContain("Units owned by OTHER repos");
    const github = await readFile(join(dir, ".claude/skills/github/SKILL.md"), "utf8");
    expect(github).toContain("**`develop`**");
  });
});

describe("team mode", () => {
  it("ships no solo rules and keeps the per-role contracts", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode: "team" });
    await mkdir(join(dir, "halyard"), { recursive: true });
    await syncRules(dir, "team");
    expect(existsSync(join(dir, "halyard/rules/solo-mode-rules.md"))).toBe(false);
    expect(existsSync(join(dir, ".claude/skills/daily-construction-update/SKILL.md"))).toBe(true);
    const cmd = await readFile(join(dir, ".claude/commands/hyd/contracts.md"), "utf8");
    expect(cmd).toContain("architects.<role>");
    expect(cmd).not.toContain("design.md");
  });
});

describe("switching modes", () => {
  it("team → solo: update removes team-only files, and validate flags leftovers", async () => {
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: false, mode: "team" });
    await mkdir(join(dir, "halyard"), { recursive: true });
    await syncRules(dir, "team");

    // before cleaning, the solo diff sees the team-only skill as drift
    const drift = await diffAgentFiles({ projectRoot: dir, agents: [claude], force: true, mode: "solo" });
    expect(drift.some((d) => d.includes("daily-construction-update") && d.includes("not used in solo mode"))).toBe(true);

    // what `hyd update` does
    await cleanAgentDirs(dir, [claude], "solo");
    await generateAgentFiles({ projectRoot: dir, agents: [claude], force: true, mode: "solo" });
    await syncRules(dir, "solo");
    expect(existsSync(join(dir, ".claude/skills/daily-construction-update"))).toBe(false);
    expect(await diffAgentFiles({ projectRoot: dir, agents: [claude], force: true, mode: "solo" })).toEqual([]);
    expect(await diffRules(dir, "solo")).toEqual([]);
  });

  it("solo → team: syncRules removes solo-mode-rules.md", async () => {
    await mkdir(join(dir, "halyard"), { recursive: true });
    await syncRules(dir, "solo");
    expect(await diffRules(dir, "team")).toContainEqual(expect.stringContaining("not used in team mode"));
    await syncRules(dir, "team");
    expect(existsSync(join(dir, "halyard/rules/solo-mode-rules.md"))).toBe(false);
  });
});

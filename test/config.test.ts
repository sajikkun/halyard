import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  readConfig,
  setConfigFields,
  hasConfig,
  isInstalled,
  configPath,
  type HalyardConfig,
} from "../src/config.js";

// A representative config.yml with the comments, the tech_stack list fields, the
// architects block, and the install gate — i.e. the shape the field-patcher must not break.
const SAMPLE = `# halyard project config — HAND-OWNED.
schema: halyard/v1

install:
  config: false
  project_rules: false
  design_code_dictionary: false

project_name: "<set-me>"
owning_repo: "<set-at-init>"

tech_stack:
  languages: []                 # e.g. ["TypeScript"]
  runtime: ""
  frameworks: []
  package_manager: ""
  build: ""
  test: ""
  lint_format: ""
  database: ""
  deploy: ""
  additional: {}

architects:
  solutions: "<name>"
  frontend: "<name>"
  backend: "<name>"
  quality: "<name>"
  customer_experience: "<name>"

agents: []

context: ""

generated_with: "0.2.0"
`;

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "halyard-cfg-"));
  await mkdir(join(dir, "halyard"), { recursive: true });
  await writeFile(configPath(dir), SAMPLE, "utf8");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("hasConfig", () => {
  it("true when halyard/config.yml exists, false otherwise", async () => {
    expect(hasConfig(dir)).toBe(true);
    const empty = await mkdtemp(join(tmpdir(), "halyard-empty-"));
    expect(hasConfig(empty)).toBe(false);
    await rm(empty, { recursive: true, force: true });
  });
});

describe("readConfig", () => {
  it("parses the install gate flags (all false in the template)", async () => {
    const c = await readConfig(dir);
    expect(c.install).toEqual({ config: false, project_rules: false, design_code_dictionary: false });
  });

  it("coerces missing/odd install values to false (never undefined)", async () => {
    await writeFile(configPath(dir), "schema: halyard/v1\n", "utf8");
    const c = await readConfig(dir);
    expect(c.install).toEqual({ config: false, project_rules: false, design_code_dictionary: false });
  });

  it("fills tech_stack defaults for absent fields", async () => {
    const c = await readConfig(dir);
    expect(c.tech_stack.languages).toEqual([]);
    expect(c.tech_stack.additional).toEqual({});
    expect(c.tech_stack.runtime).toBe("");
  });

  it("reads agents as an array even when empty", async () => {
    const c = await readConfig(dir);
    expect(c.agents).toEqual([]);
  });
});

describe("isInstalled", () => {
  const base: HalyardConfig = {
    schema: "halyard/v1",
    mode: "team",
    install: { config: true, project_rules: true, design_code_dictionary: true },
    project_name: "x",
    owning_repo: "frontend",
    tech_stack: {
      languages: [], runtime: "", frameworks: [], package_manager: "",
      build: "", test: "", lint_format: "", database: "", deploy: "", additional: {},
    },
    agents: ["claude"],
    context: "",
    generated_with: "0.2.0",
  };

  it("true only when all three flags are true", () => {
    expect(isInstalled(base)).toBe(true);
  });

  it("false if any single flag is false", () => {
    expect(isInstalled({ ...base, install: { ...base.install, config: false } })).toBe(false);
    expect(isInstalled({ ...base, install: { ...base.install, project_rules: false } })).toBe(false);
    expect(isInstalled({ ...base, install: { ...base.install, design_code_dictionary: false } })).toBe(false);
  });
});

describe("readConfig — mode", () => {
  it("defaults to team when config.yml predates modes", async () => {
    expect((await readConfig(dir)).mode).toBe("team");
  });

  it("falls back to team for an unknown mode value", async () => {
    await writeFile(configPath(dir), SAMPLE.replace("schema: halyard/v1", 'schema: halyard/v1\nmode: "pair"'), "utf8");
    expect((await readConfig(dir)).mode).toBe("team");
  });

  it("setConfigFields adds the mode key when absent, then patches it in place", async () => {
    await setConfigFields(dir, { mode: "solo" });
    expect((await readConfig(dir)).mode).toBe("solo");
    await setConfigFields(dir, { mode: "team" });
    const text = await readFile(configPath(dir), "utf8");
    expect(text.match(/^mode:/gm)).toHaveLength(1);
    expect((await readConfig(dir)).mode).toBe("team");
  });
});

describe("setConfigFields — surgical patching", () => {
  it("patches the managed scalars", async () => {
    await setConfigFields(dir, { project_name: "demo", owning_repo: "frontend", generated_with: "0.2.2" });
    const c = await readConfig(dir);
    expect(c.project_name).toBe("demo");
    expect(c.owning_repo).toBe("frontend");
    expect(c.generated_with).toBe("0.2.2");
  });

  it("sets the agents list without confusing the tech_stack list fields above it", async () => {
    // regression: the agents regex could over-match the languages:/frameworks: lists
    await setConfigFields(dir, { agents: ["claude", "kiro"] });
    const c = await readConfig(dir);
    expect(c.agents).toEqual(["claude", "kiro"]);
    // tech_stack must be untouched
    expect(c.tech_stack.languages).toEqual([]);
    expect(c.tech_stack.frameworks).toEqual([]);
    expect(c.tech_stack.additional).toEqual({});
  });

  it("preserves comments and the architects block", async () => {
    await setConfigFields(dir, { agents: ["claude"], owning_repo: "backend" });
    const text = await readFile(configPath(dir), "utf8");
    expect(text).toContain("# halyard project config — HAND-OWNED.");
    expect(text).toContain("architects:");
    expect(text).toContain('customer_experience: "<name>"');
    // the install block survives untouched
    expect(text).toContain("design_code_dictionary: false");
  });

  it("does not touch fields it wasn't asked to change", async () => {
    await setConfigFields(dir, { project_name: "only-this" });
    const c = await readConfig(dir);
    expect(c.project_name).toBe("only-this");
    expect(c.owning_repo).toBe("<set-at-init>"); // unchanged
    expect(c.generated_with).toBe("0.2.0"); // unchanged
  });

  it("replacing agents twice is idempotent (list stays a flow array, not nested)", async () => {
    await setConfigFields(dir, { agents: ["claude", "kiro"] });
    await setConfigFields(dir, { agents: ["cursor"] });
    const c = await readConfig(dir);
    expect(c.agents).toEqual(["cursor"]);
    const text = await readFile(configPath(dir), "utf8");
    // exactly one agents: line
    expect(text.match(/^agents:/gm)?.length).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import { AGENTS, getAgent } from "../src/agents.js";

describe("agent registry", () => {
  it("has unique ids", () => {
    const ids = AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent has a non-empty label and skillsPath", () => {
    for (const a of AGENTS) {
      expect(a.label.length).toBeGreaterThan(0);
      expect(a.skillsPath.length).toBeGreaterThan(0);
    }
  });

  it("every agent's skillsPath ends in a skills directory", () => {
    // all agents follow the Agent Skills <name>/SKILL.md layout under a skills dir
    for (const a of AGENTS) {
      expect(a.skillsPath).toMatch(/skills$/);
    }
  });

  it("includes the AGENTS.md catch-all (bespoke: false) exactly once", () => {
    const catchAlls = AGENTS.filter((a) => !a.bespoke);
    expect(catchAlls).toHaveLength(1);
    expect(catchAlls[0]!.instructionsFile).toBe("AGENTS.md");
  });

  it("no agent scatters files into the repo root (skillsPath is never '.')", () => {
    // regression: the catch-all/aider once used '.' and littered the root
    for (const a of AGENTS) {
      expect(a.skillsPath).not.toBe(".");
    }
  });

  it("getAgent resolves known ids and returns undefined for unknown", () => {
    expect(getAgent("claude")?.id).toBe("claude");
    expect(getAgent("kiro")?.id).toBe("kiro");
    expect(getAgent("agents-md")?.id).toBe("agents-md");
    expect(getAgent("nope")).toBeUndefined();
  });

  it("covers the agents the proposal commits to", () => {
    const ids = AGENTS.map((a) => a.id);
    for (const expected of ["claude", "kiro", "cursor", "copilot", "windsurf", "amazonq", "cline", "gemini", "aider", "agents-md"]) {
      expect(ids).toContain(expected);
    }
  });
});

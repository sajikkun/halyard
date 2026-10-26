/**
 * Agent registry — the single source of truth for every coding agent nvaid can target.
 *
 * Every agent now follows the Agent Skills open standard: a skill is a directory
 * `<name>/SKILL.md` whose frontmatter `name` matches the folder. So the only thing that
 * varies per agent is WHERE its skills directory lives. (Verified across Claude, Kiro,
 * Cursor, Windsurf, Copilot, Cline, Gemini, Aider — all use the <name>/SKILL.md layout.)
 *
 * Paths MUST be re-confirmed against each agent's current docs over time (conventions
 * move fast). `.agents/skills` is the emerging neutral cross-tool location and is the
 * catch-all default.
 */

export interface AgentTarget {
  /** stable key used in config.yml + the init multi-select */
  id: string;
  /** label shown in the init prompt */
  label: string;
  /** the agent's skills directory, relative to project root — holds <name>/SKILL.md dirs */
  skillsPath: string;
  /**
   * Where AI-invocable slash-command defs go, if the agent has a command system distinct
   * from its skills. When set, nvaid commands are written as `<commandsPath>/nvaid/<name>`
   * so they invoke as `/nvaid:<name>`. When omitted, the nvaid commands are emitted as
   * ordinary skills in skillsPath (under the Agent Skills model a command is just an
   * invocable skill), reachable as `/<name>`.
   */
  commandsPath?: string;
  /** where the root instruction file goes, if the agent uses one */
  instructionsFile?: string;
  /** false = covered by the AGENTS.md / .agents standard rather than a bespoke adapter */
  bespoke: boolean;
}

export const AGENTS: AgentTarget[] = [
  {
    id: "claude",
    label: "Claude Code",
    skillsPath: ".claude/skills",
    commandsPath: ".claude/commands", // /nvaid:install resolves from .claude/commands/nvaid/install.md
    instructionsFile: "CLAUDE.md",
    bespoke: true,
  },
  {
    id: "kiro",
    label: "Kiro",
    skillsPath: ".kiro/skills",
    instructionsFile: ".kiro/steering/nvaid.md",
    bespoke: true,
  },
  {
    id: "cursor",
    label: "Cursor",
    skillsPath: ".cursor/skills", // cursor.com/docs/skills
    bespoke: true,
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    skillsPath: ".github/skills", // docs.github.com — project skills in .github/skills
    instructionsFile: ".github/copilot-instructions.md",
    bespoke: true,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    skillsPath: ".windsurf/skills", // docs.windsurf.com/windsurf/cascade/skills
    bespoke: true,
  },
  {
    id: "amazonq",
    label: "Amazon Q",
    skillsPath: ".amazonq/skills",
    bespoke: true,
  },
  {
    id: "cline",
    label: "Cline",
    skillsPath: ".cline/skills", // docs.cline.bot/customization/skills
    instructionsFile: ".clinerules",
    bespoke: true,
  },
  {
    id: "gemini",
    label: "Gemini Code Assist",
    skillsPath: ".gemini/skills", // geminicli.com/docs/cli/skills
    bespoke: true,
  },
  {
    id: "aider",
    label: "Aider",
    skillsPath: ".agents/skills", // neutral cross-tool skills location
    instructionsFile: "AGENTS.md",
    bespoke: true,
  },
  {
    id: "agents-md",
    label: "Any Agent-Skills / AGENTS.md tool (catch-all)",
    skillsPath: ".agents/skills", // the emerging neutral standard (per GitHub Copilot docs)
    instructionsFile: "AGENTS.md",
    bespoke: false,
  },
];

export function getAgent(id: string): AgentTarget | undefined {
  return AGENTS.find((a) => a.id === id);
}

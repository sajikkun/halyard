/**
 * Workflow mode — `team` (named architects, review-approved gates) or `solo` (one
 * developer owns every role and signs off every gate by merging).
 *
 * Templates stay a single neutral source. Mode-specific text is wrapped in
 *   {{#team}} ... {{/team}}   and   {{#solo}} ... {{/solo}}
 * blocks, resolved at generate time so an agent only ever sees its own mode's
 * instructions. A block may sit on its own lines (the tag lines vanish with it) or inline.
 *
 * A whole template can be limited to some modes with a frontmatter line such as
 * `modes: [team]`; the generator skips it in other modes and strips the line otherwise.
 */

export type Mode = "team" | "solo";
export const MODES: Mode[] = ["team", "solo"];
export const DEFAULT_MODE: Mode = "team";

export function isMode(v: unknown): v is Mode {
  return v === "team" || v === "solo";
}

const LINE_BLOCK = /^[ \t]*\{\{#(team|solo)\}\}[ \t]*\n([\s\S]*?)^[ \t]*\{\{\/\1\}\}[ \t]*(?:\n|$)/gm;
const INLINE_BLOCK = /\{\{#(team|solo)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
const MODES_LINE = /^modes:[ \t]*\[([^\]]*)\][ \t]*\n/m;

/** Resolve mode blocks and drop the `modes:` frontmatter line. */
export function renderMode(body: string, mode: Mode): string {
  return body
    .replace(MODES_LINE, "")
    .replace(LINE_BLOCK, (_m, tag: string, inner: string) => (tag === mode ? inner : ""))
    .replace(INLINE_BLOCK, (_m, tag: string, inner: string) => (tag === mode ? inner : ""));
}

/** False when the template's frontmatter `modes: [...]` excludes this mode. */
export function appliesToMode(body: string, mode: Mode): boolean {
  if (!body.startsWith("---\n")) return true;
  const end = body.indexOf("\n---", 4);
  const front = end === -1 ? body : body.slice(0, end + 1);
  const m = MODES_LINE.exec(front);
  if (!m) return true;
  const listed = (m[1] ?? "").split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
  return listed.includes(mode);
}

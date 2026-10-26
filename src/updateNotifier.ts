/**
 * Lightweight "a newer nvaid is available" notifier.
 *
 * Checks npm for the latest published version and, if the running CLI is behind, prints a
 * one-line nudge with the upgrade command. Deliberately NOT a self-upgrade — the package
 * manager owns the tool's lifecycle (see README). This only informs.
 *
 * Behaviour that keeps it well-mannered:
 *   - cached: queries npm at most once per CHECK_INTERVAL (default 1 day)
 *   - non-blocking: a short timeout; never delays or fails the real command
 *   - silent on any error (offline, registry down, bad JSON) — a notifier must never break a command
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";
import { nvaidVersion } from "./paths.js";

const PKG = "nvaid";
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once a day
const FETCH_TIMEOUT_MS = 1500;

interface CacheShape {
  lastCheck: number;
  latest: string;
}

function cacheFile(): string {
  // ~/.cache/nvaid or a temp fallback; a stale/missing cache just means we re-check.
  const base = process.env.XDG_CACHE_HOME || join(homedir(), ".cache");
  return join(base || tmpdir(), "nvaid", "update-check.json");
}

async function readCache(): Promise<CacheShape | null> {
  try {
    return JSON.parse(await readFile(cacheFile(), "utf8")) as CacheShape;
  } catch {
    return null;
  }
}

async function writeCache(c: CacheShape): Promise<void> {
  try {
    const f = cacheFile();
    await mkdir(join(f, ".."), { recursive: true });
    await writeFile(f, JSON.stringify(c), "utf8");
  } catch {
    /* cache is best-effort; ignore write failures */
  }
}

/** Fetch the latest published version from the npm registry, with a hard timeout. */
async function fetchLatest(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    // Note: the abbreviated-metadata accept header is for the full packument path
    // (/<pkg>), NOT /<pkg>/latest — sending it here returns an empty body. Plain GET.
    const res = await fetch(`https://registry.npmjs.org/${PKG}/latest`, {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

/** semver-ish "is a strictly newer than b" — handles X.Y.Z, ignores pre-release nuances. */
function isNewer(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => parseInt(n, 10));
  const pb = b.split(".").map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

/**
 * Check for a newer version and print a nudge if one exists. Safe to call at the end of
 * any command: it awaits a cached/fast check and never throws.
 */
export async function notifyIfOutdated(): Promise<void> {
  if (process.env.NVAID_NO_UPDATE_CHECK) return; // escape hatch for CI/scripts

  const current = await nvaidVersion();
  const cache = await readCache();
  const now = Date.now();

  let latest: string | null = null;
  if (cache && now - cache.lastCheck < CHECK_INTERVAL_MS) {
    latest = cache.latest;
  } else {
    latest = await fetchLatest();
    if (latest) await writeCache({ lastCheck: now, latest });
  }

  if (!latest || !isNewer(latest, current)) return;

  const line = (s: string) => process.stderr.write(s + "\n");
  line("");
  line(pc.yellow(`  ┌─ nvaid update available ─────────────────────────────`));
  line(pc.yellow("  │ ") + `${pc.dim(current)} → ${pc.green(latest)}`);
  line(pc.yellow("  │ ") + `run: ${pc.cyan(`npm i -g ${PKG}@latest`)}`);
  line(pc.yellow("  │ ") + pc.dim(`then re-sync your repo: nvaid update`));
  line(pc.yellow(`  └──────────────────────────────────────────────────────`));
}

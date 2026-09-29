#!/usr/bin/env -S npx --yes tsx
/**
 * Pull PostHog LLM traces/sessions with HogQL through posthog-cli.
 *
 * Defaults:
 * - mode: both traces + sessions
 * - window: last 24h UTC
 *
 * Handles CLI query command drift:
 * - posthog-cli query run
 * - posthog-cli exp query run
 */

import { existsSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

type Mode = "traces" | "sessions" | "both";

type Options = {
  mode: Mode;
  window: string;
  fromTs?: string;
  toTs?: string;
  limit: number;
  cliBin: string;
  output?: string;
  dryRun: boolean;
};

type WindowRange = {
  start: Date;
  end: Date;
};

type QueryCommands = {
  run: string[];
  check: string[];
  surface: "top-level" | "experimental";
};

const DEFAULT_WINDOW = "24h";
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 50000;
const EVENT_NAMES = ["$ai_generation", "$ai_span", "$ai_embedding"] as const;

class SkillError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillError";
  }
}

function usage(): string {
  return [
    "Usage:",
    "  npx --yes tsx scripts/pull_posthog_llm_sql.ts [options]",
    "",
    "Options:",
    "  --mode <traces|sessions|both>   Dataset to pull (default: both)",
    "  --window <duration>             Relative lookback: <number><m|h|d|w> (default: 24h)",
    "  --from <iso8601>                Explicit UTC start (requires --to)",
    "  --to <iso8601>                  Explicit UTC end (requires --from)",
    "  --limit <number>                Max rows/query (default: 1000, max: 50000)",
    "  --cli-bin <path-or-command>     CLI executable prefix (default: posthog-cli)",
    "  --output <path>                 Write JSONL output to file (default: stdout)",
    "  --dry-run                       Print resolved commands + SQL only",
    "  -h, --help                      Show help",
  ].join("\n");
}

function parseArgs(argv: string[]): Options {
  const args = [...argv];
  const opts: Options = {
    mode: "both",
    window: DEFAULT_WINDOW,
    limit: DEFAULT_LIMIT,
    cliBin: process.env.POSTHOG_CLI_BIN ?? "posthog-cli",
    dryRun: false,
  };

  const takeValue = (flag: string): string => {
    const value = args.shift();
    if (!value) {
      throw new SkillError(`Missing value for ${flag}.`);
    }
    return value;
  };

  while (args.length > 0) {
    const arg = args.shift() as string;

    switch (arg) {
      case "--mode": {
        const value = takeValue("--mode");
        if (value !== "traces" && value !== "sessions" && value !== "both") {
          throw new SkillError("--mode must be one of: traces, sessions, both.");
        }
        opts.mode = value;
        break;
      }
      case "--window":
        opts.window = takeValue("--window");
        break;
      case "--from":
        opts.fromTs = takeValue("--from");
        break;
      case "--to":
        opts.toTs = takeValue("--to");
        break;
      case "--limit": {
        const raw = takeValue("--limit");
        const parsed = Number.parseInt(raw, 10);
        if (!Number.isFinite(parsed)) {
          throw new SkillError("--limit must be an integer.");
        }
        opts.limit = parsed;
        break;
      }
      case "--cli-bin":
        opts.cliBin = takeValue("--cli-bin");
        break;
      case "--output":
        opts.output = takeValue("--output");
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "-h":
      case "--help":
        console.log(usage());
        process.exit(0);
      default:
        throw new SkillError(`Unknown argument: ${arg}`);
    }
  }

  if (opts.limit <= 0) {
    throw new SkillError("--limit must be greater than 0.");
  }
  if (opts.limit > MAX_LIMIT) {
    throw new SkillError(`--limit cannot exceed ${MAX_LIMIT}.`);
  }

  return opts;
}

function parseDurationMs(window: string): number {
  const match = window.match(/^\s*(\d+)\s*([mhdw])\s*$/);
  if (!match) {
    throw new SkillError(
      "Invalid --window format. Use <number><m|h|d|w>, for example 24h, 7d, 90m.",
    );
  }

  const amount = Number.parseInt(match[1] ?? "", 10);
  const unit = match[2];
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new SkillError("--window amount must be greater than 0.");
  }

  const minute = 60_000;
  switch (unit) {
    case "m":
      return amount * minute;
    case "h":
      return amount * 60 * minute;
    case "d":
      return amount * 24 * 60 * minute;
    case "w":
      return amount * 7 * 24 * 60 * minute;
    default:
      throw new SkillError("Unsupported duration unit.");
  }
}

function parseIsoUtc(value: string): Date {
  const normalized = value.trim();
  const hasTz = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const candidate = hasTz ? normalized : `${normalized}Z`;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    throw new SkillError(`Invalid ISO timestamp: ${value}`);
  }
  return parsed;
}

function resolveWindow(opts: Options): WindowRange {
  const hasFrom = Boolean(opts.fromTs);
  const hasTo = Boolean(opts.toTs);

  if (hasFrom !== hasTo) {
    throw new SkillError("--from and --to must be provided together.");
  }

  let start: Date;
  let end: Date;

  if (opts.fromTs && opts.toTs) {
    start = parseIsoUtc(opts.fromTs);
    end = parseIsoUtc(opts.toTs);
  } else {
    const lookbackMs = parseDurationMs(opts.window);
    end = new Date();
    start = new Date(end.getTime() - lookbackMs);
  }

  if (start.getTime() >= end.getTime()) {
    throw new SkillError("Resolved window is invalid: start must be before end.");
  }

  return { start, end };
}

function ensurePrereqs(): void {
  const hasEnvAuth = Boolean(process.env.POSTHOG_CLI_API_KEY) && Boolean(process.env.POSTHOG_CLI_PROJECT_ID);
  const credsFile = path.join(os.homedir(), ".posthog", "credentials.json");

  if (hasEnvAuth || existsSync(credsFile)) {
    return;
  }

  throw new SkillError(
    "PostHog CLI credentials not found. Run `posthog-cli login` first, or set " +
      "POSTHOG_CLI_API_KEY and POSTHOG_CLI_PROJECT_ID.",
  );
}

function commandWorks(cmd: string[]): boolean {
  const probe = spawnSync(cmd[0] as string, cmd.slice(1), {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (typeof probe.status === "number") {
    return probe.status === 0;
  }

  return false;
}

function resolvePrefixes(cliBin: string): string[][] {
  const prefixes: string[][] = [[cliBin]];
  const localBin = path.join(process.cwd(), "node_modules", "@posthog", "cli", "node_modules", ".bin_real", "posthog-cli");
  if (existsSync(localBin) && localBin !== cliBin) {
    prefixes.push([localBin]);
  }

  const deduped: string[][] = [];
  const seen = new Set<string>();
  for (const prefix of prefixes) {
    const key = prefix.join("\u0000");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(prefix);
  }
  return deduped;
}

function tryResolveQueryCommands(prefixes: string[][]): QueryCommands | null {
  for (const prefix of prefixes) {
    const topRun = [...prefix, "query", "run", "--help"];
    if (commandWorks(topRun)) {
      return {
        run: [...prefix, "query", "run"],
        check: [...prefix, "query", "check"],
        surface: "top-level",
      };
    }

    const expRun = [...prefix, "exp", "query", "run", "--help"];
    if (commandWorks(expRun)) {
      return {
        run: [...prefix, "exp", "query", "run"],
        check: [...prefix, "exp", "query", "check"],
        surface: "experimental",
      };
    }
  }
  return null;
}

function installPosthogCli(): void {
  process.stderr.write("posthog-cli not found. Installing with `npm install @posthog/cli`...\n");
  const install = spawnSync("npm", ["install", "@posthog/cli"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (install.status !== 0) {
    const detail = (install.stderr || install.stdout || "Unknown npm error").trim();
    throw new SkillError(`Failed to install @posthog/cli via npm: ${detail}`);
  }
}

function detectQueryCommands(cliBin: string): QueryCommands {
  const firstPrefixes = resolvePrefixes(cliBin);
  const firstMatch = tryResolveQueryCommands(firstPrefixes);
  if (firstMatch) {
    return firstMatch;
  }

  installPosthogCli();

  const secondPrefixes = resolvePrefixes(cliBin);
  const secondMatch = tryResolveQueryCommands(secondPrefixes);
  if (secondMatch) {
    return secondMatch;
  }

  const checked = secondPrefixes.map((x) => x.join(" ")).join(", ");
  throw new SkillError(
    `Unable to detect a working PostHog query command after npm install. Checked prefixes: ${checked}.`,
  );
}

function sqlQuote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function sqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function eventInClause(): string {
  return EVENT_NAMES.map((name) => sqlQuote(name)).join(", ");
}

function buildTracesQuery(range: WindowRange, limit: number): string {
  const startSql = sqlQuote(sqlDateTime(range.start));
  const endSql = sqlQuote(sqlDateTime(range.end));

  return `SELECT
  nullIf(toString(properties.$ai_trace_id), '') AS trace_id,
  min(timestamp) AS first_ts,
  max(timestamp) AS last_ts,
  uniq(distinct_id) AS distinct_ids,
  count() AS total_events,
  countIf(event = '$ai_generation') AS generation_events,
  countIf(event = '$ai_span') AS span_events,
  countIf(event = '$ai_embedding') AS embedding_events,
  countIf(
    toIntOrZero(toString(properties.$ai_is_error)) = 1
    OR lower(toString(properties.$ai_status)) IN ('error', 'failed')
  ) AS error_events,
  sum(toIntOrZero(toString(properties.$ai_input_tokens))) AS input_tokens,
  sum(toIntOrZero(toString(properties.$ai_output_tokens))) AS output_tokens
FROM events
WHERE
  event IN (${eventInClause()})
  AND timestamp >= toDateTime(${startSql})
  AND timestamp < toDateTime(${endSql})
  AND nullIf(toString(properties.$ai_trace_id), '') IS NOT NULL
GROUP BY trace_id
ORDER BY last_ts DESC
LIMIT ${limit}`;
}

function buildSessionsQuery(range: WindowRange, limit: number): string {
  const startSql = sqlQuote(sqlDateTime(range.start));
  const endSql = sqlQuote(sqlDateTime(range.end));

  return `SELECT
  coalesce(
    nullIf(toString(properties.$ai_session_id), ''),
    concat('distinct:', toString(distinct_id))
  ) AS session_id,
  min(timestamp) AS first_ts,
  max(timestamp) AS last_ts,
  any(toString(distinct_id)) AS sample_distinct_id,
  uniq(distinct_id) AS distinct_ids,
  uniqIf(
    nullIf(toString(properties.$ai_trace_id), ''),
    nullIf(toString(properties.$ai_trace_id), '') IS NOT NULL
  ) AS trace_count,
  count() AS total_events,
  countIf(event = '$ai_generation') AS generation_events,
  countIf(event = '$ai_span') AS span_events,
  countIf(event = '$ai_embedding') AS embedding_events,
  countIf(
    toIntOrZero(toString(properties.$ai_is_error)) = 1
    OR lower(toString(properties.$ai_status)) IN ('error', 'failed')
  ) AS error_events,
  sum(toIntOrZero(toString(properties.$ai_input_tokens))) AS input_tokens,
  sum(toIntOrZero(toString(properties.$ai_output_tokens))) AS output_tokens
FROM events
WHERE
  event IN (${eventInClause()})
  AND timestamp >= toDateTime(${startSql})
  AND timestamp < toDateTime(${endSql})
GROUP BY session_id
ORDER BY last_ts DESC
LIMIT ${limit}`;
}

function runQuery(command: string[], sql: string, dryRun: boolean): string[] {
  if (dryRun) {
    console.log(`$ ${[...command, sql].map((part) => JSON.stringify(part)).join(" ")}`);
    return [];
  }

  const proc = spawnSync(command[0] as string, [...command.slice(1), sql], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (proc.status !== 0) {
    const detail = (proc.stderr || proc.stdout || "Unknown CLI error").trim();
    throw new SkillError(`PostHog query failed: ${detail}`);
  }

  if (proc.stderr.trim().length > 0) {
    process.stderr.write(`${proc.stderr.trim()}\n`);
  }

  return proc.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function emit(lines: string[], kind: "trace" | "session", annotateKind: boolean): string[] {
  return lines.map((line) => {
    if (!annotateKind) {
      return line;
    }

    try {
      const parsed = JSON.parse(line) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return JSON.stringify({ kind, ...(parsed as Record<string, unknown>) });
      }
      return line;
    } catch {
      return line;
    }
  });
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const range = resolveWindow(opts);
  const commands = detectQueryCommands(opts.cliBin);
  if (!opts.dryRun) {
    ensurePrereqs();
  }

  const tracesSql = buildTracesQuery(range, opts.limit);
  const sessionsSql = buildSessionsQuery(range, opts.limit);

  if (opts.dryRun) {
    console.log(`# resolved_surface=${commands.surface}`);
    console.log(`# window_start_utc=${range.start.toISOString()}`);
    console.log(`# window_end_utc=${range.end.toISOString()}`);
    console.log(`# syntax_check_cmd=${commands.check.join(" ")}`);
  }

  const allLines: string[] = [];

  if (opts.mode === "traces" || opts.mode === "both") {
    const traceLines = runQuery(commands.run, tracesSql, opts.dryRun);
    allLines.push(...emit(traceLines, "trace", opts.mode === "both"));
  }

  if (opts.mode === "sessions" || opts.mode === "both") {
    const sessionLines = runQuery(commands.run, sessionsSql, opts.dryRun);
    allLines.push(...emit(sessionLines, "session", opts.mode === "both"));
  }

  const output = allLines.join("\n");

  if (opts.output) {
    writeFileSync(opts.output, output.length > 0 ? `${output}\n` : "", { encoding: "utf8" });
  } else if (output.length > 0) {
    process.stdout.write(`${output}\n`);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

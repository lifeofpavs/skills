---
name: "posthog-llm-sql-analytics"
description: "Pull PostHog LLM analytics traces and sessions via HogQL SQL using PostHog CLI. Use when the user asks to query/export/analyze LLM observability data for default last 24 hours, 7 days, or arbitrary time ranges. Do not use for SDK instrumentation setup or dashboard-only edits without data extraction."
---

# PostHog LLM SQL Analytics

## Overview

Use this skill to pull raw trace/session rows from PostHog LLM analytics with SQL through `posthog-cli`.

Default behavior:
- Window: last `24h` (UTC)
- Mode: both traces and sessions
- Output: raw JSONL rows

## Prerequisites

- PostHog CLI available (`posthog-cli` in `PATH`, or local `node_modules/@posthog/cli` in current repo)
- Required auth before querying:
  - Local interactive use: run `posthog-cli login`
  - CI/non-interactive alternative: set env vars
  - `POSTHOG_CLI_API_KEY`
  - `POSTHOG_CLI_PROJECT_ID`
  - Optional: `POSTHOG_CLI_HOST`
- API key scope: `query:read`
- Runtime for TypeScript script: `tsx` (`npx --yes tsx` is supported)
- If PostHog CLI is missing, the script auto-installs it with `npm install @posthog/cli`

## Required Workflow

### Step 0: Required login/auth

Run this first for local usage:

```bash
posthog-cli login
```

If interactive login is not possible (CI/automation), use env auth instead:

```bash
export POSTHOG_CLI_API_KEY="<personal_api_key>"
export POSTHOG_CLI_PROJECT_ID="<project_id>"
export POSTHOG_CLI_HOST="https://us.posthog.com" # optional
```

### Step 1: Choose time window

- Default: no flags (last `24h`)
- Preset 7 days: `--window 7d`
- Arbitrary duration: `--window 36h`, `--window 90m`, `--window 2w`
- Explicit range: `--from <ISO8601> --to <ISO8601>`

### Step 2: Run the pull script

Use the script from this skill:

```bash
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts
```

If `posthog-cli` is missing, this step automatically runs:

```bash
npm install @posthog/cli
```

Examples:

```bash
# Default: last 24h, traces + sessions
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts

# Last 7 days, traces only
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts --mode traces --window 7d

# Arbitrary window
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts --mode sessions --window 36h

# Explicit UTC range
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts \
  --from 2026-02-20T00:00:00Z \
  --to 2026-02-25T00:00:00Z

# Inspect resolved SQL/command only
npx --yes tsx <path-to-skill>/scripts/pull_posthog_llm_sql.ts --dry-run
```

### Step 3: Return raw rows

- Return JSONL directly.
- For `--mode both`, each JSON row is tagged with `"kind":"trace"` or `"kind":"session"`.
- Do not summarize unless the user asks.

## Query Model

- Base table: `events`
- LLM event filter: `'$ai_generation'`, `'$ai_span'`, `'$ai_embedding'`
- Trace rollup: grouped by `properties.$ai_trace_id`
- Session rollup: grouped by `coalesce(properties.$ai_session_id, distinct_id fallback)`

Detailed notes: `references/posthog-llm-hogql.md`

## CLI Compatibility Rule

PostHog CLI command layout can vary by version. The script auto-detects and runs whichever exists:

- `posthog-cli query run` (top-level)
- `posthog-cli exp query run` (experimental path)

## Troubleshooting

- `credentials not found`: run `posthog-cli login` or set env vars.
- `unable to detect query command`: install/update `@posthog/cli` and verify `posthog-cli --help`.
- large windows timing out: narrow window or lower `--limit`.
- missing session IDs: script falls back to `distinct_id` grouping.

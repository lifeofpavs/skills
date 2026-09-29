# PostHog LLM HogQL Notes

## Scope

This skill pulls LLM analytics from the `events` table using HogQL via PostHog CLI query commands.

## Event model used

The queries focus on these LLM analytics event families:

- `$ai_generation`
- `$ai_span`
- `$ai_embedding`

These are used as the base filter for both trace and session rollups.

## Trace rollup strategy

- Group key: `properties.$ai_trace_id`
- Window filter: `timestamp >= <start_utc>` and `timestamp < <end_utc>`
- Core aggregates:
  - first/last timestamp
  - event counts by family
  - token sums (`$ai_input_tokens`, `$ai_output_tokens`)
  - error count heuristic (`$ai_is_error` or `$ai_status` in `error|failed`)

## Session rollup strategy

- Primary key: `properties.$ai_session_id`
- Fallback key if session id missing: `distinct_id`
- Core aggregates:
  - first/last timestamp
  - trace cardinality inside session
  - event/token/error aggregates

## CLI compatibility caveat

PostHog CLI query command layout can differ by installed version/build:

- `posthog-cli query run` (top-level)
- `posthog-cli exp query run` (experimental namespace)

The script auto-detects available command paths before execution.

## Time window behavior

- Default: last `24h` in UTC
- Preset example: `7d`
- Arbitrary examples: `36h`, `90m`, `2w`
- Explicit override: `--from` and `--to` ISO timestamps (UTC assumed if offset omitted)

## Operational limits

- Default `--limit`: `1000`
- Hard max `--limit`: `50000`
- For large windows, prefer narrowing the window and paginating by time.

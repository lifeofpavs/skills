# Claude / Anthropic Prompt Techniques

Use this file for Claude 4.x prompts, Anthropic model configuration, and Claude-specific tool or subagent behavior.

## Provider Pattern

Claude's latest models, including Opus 4.7, Opus 4.6, Sonnet 4.6, and Haiku 4.5, are trained for precise instruction following. Behaviors that previous models did implicitly often need to be requested explicitly. Opus 4.7 is more literal than 4.6 and will not silently generalize an instruction it was not given.

Use Claude-specific patterns when:

- XML tags help scope independent instruction blocks.
- `effort` and adaptive thinking should control reasoning depth.
- Tool and subagent triggering need careful calibration.
- Prompt examples can include hidden reasoning patterns in a controlled harness.

If you need Claude to apply an instruction broadly, state the scope explicitly, such as "Apply this formatting to every section, not just the first one."

## Response Length

Opus 4.7 calibrates response length to task complexity: shorter on simple lookups, longer on open-ended analysis. If your product depends on a certain verbosity, state it directly.

```text
# To decrease verbosity
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.

# To increase verbosity
Provide thorough, detailed responses with examples and edge cases explored.
```

## Reasoning Controls

### Effort Parameter

The `effort` parameter replaces manual `budget_tokens` for controlling intelligence vs. token spend. This is more important for Opus 4.7 than prior models.

| Level | Use case |
|---|---|
| `max` | Intelligence-demanding tasks, but may show diminishing returns or overthinking |
| `xhigh` | Best for most coding and agentic use cases |
| `high` | Balances token usage and intelligence; minimum for intelligence-sensitive work |
| `medium` | Cost-sensitive use cases trading off intelligence |
| `low` | Short, scoped tasks and latency-sensitive workloads |

Opus 4.7 respects effort levels strictly, especially at `low`. At `low` and `medium`, it scopes work to what was asked. If you observe shallow reasoning on complex problems, raise effort rather than prompting around it.

### Adaptive Thinking

Claude 4.6+ uses adaptive thinking (`thinking: {type: "adaptive"}`), where Claude dynamically decides when and how much to reason. It calibrates based on `effort` and query complexity.

```python
# Recommended: adaptive thinking
client.messages.create(
    model="claude-opus-4-7",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "xhigh"},
    messages=[{"role": "user", "content": "..."}],
)
```

To steer thinking frequency:

```text
# If thinking too often
Extended thinking adds latency and should only be used when it will meaningfully
improve answer quality, typically for problems that require multi-step reasoning.
When in doubt, respond directly.

# If under-thinking
This task involves multi-step reasoning. Carefully evaluate the problem before responding.
```

When extended thinking is disabled, Claude Opus 4.5 is particularly sensitive to the word "think" and its variants. Use "consider", "evaluate", "reason through", or "assess" instead. This is less of an issue on 4.6+ with adaptive thinking enabled.

## Tool Use

Claude 4.x, especially Sonnet 4.6, aggressively parallelises tool calls. Explicitly state when parallel calls are desired and when calls must be sequential because later arguments depend on earlier results.

Claude 4.5+ is more responsive to system prompts than earlier Claude models. If prompts were tuned to prevent under-triggering, you may now see over-triggering. Dial back aggressive language:

```text
# Was necessary for older models, now over-triggers on 4.5+
CRITICAL: You MUST use this tool when...

# Better for Claude 4.x
Use this tool when...
```

Opus 4.7 uses tools less often than 4.6, preferring reasoning instead. To increase tool usage:

- Raise `effort` to `high` or `xhigh`.
- Explicitly describe when and how to use specific tools.
- Replace blanket defaults with targeted trigger conditions.

## Structured Outputs

Use provider-native structured output features when the consumer is code, an evaluation runner, or another agent. Prefer structured outputs or direct instructions over prefilled assistant messages for output formatting.

For schema design, avoid patterns known to produce root-level `oneOf` or other unsupported JSON Schema shapes in Anthropic tool schemas. In this repo, LLM tool and agent schemas use Zod v3.

## Prefill Migration

Prefilled responses on the last assistant turn are deprecated starting with Claude 4.6. Migration paths:

- Output formatting: use Structured Outputs or direct instructions.
- Eliminating preambles: "Respond directly without preamble. Do not start with phrases like 'Here is...'"
- Continuations: move to a user message such as "Your previous response was interrupted and ended with `[text]`. Continue from where you left off."
- Context hydration: inject via user turns or tools.

## Subagent Orchestration

Claude 4.x can delegate to subagents proactively.

Requirements:

1. Subagent tools must be available and well-described in their tool definitions.
2. No explicit instruction to delegate is needed for many tasks.
3. Opus 4.7 spawns fewer subagents by default than 4.6, so give explicit guidance on when subagents are desirable.
4. Opus 4.6 may spawn subagents when a direct approach suffices.

If delegation is too aggressive or too conservative:

```text
Use subagents when tasks can run in parallel, require isolated context, or involve
independent workstreams that don't need to share state. For simple tasks, sequential
operations, single-file edits, or tasks where you need to maintain context across
steps, work directly rather than delegating.
```

## Long-Horizon Tasks

Claude 4.5+ tracks remaining token budget. If your harness compacts or refreshes context automatically, tell Claude so it does not stop early and so it persists state before compaction.

## Few-Shot And Review Calibration

For Claude-only harnesses, multishot examples can include reasoning patterns when appropriate and safe. For cross-provider prompts, prefer concise rationales or decision summaries.

Opus 4.7 has high recall and precision for bug finding. If a review prompt says "only report high-severity issues" or "be conservative," Opus 4.7 may find bugs but not report them because they fall below the stated bar.

```text
Report every issue you find, including ones you are uncertain about or consider
low-severity. Do not filter for importance or confidence at this stage; a separate
verification step will do that. Your goal here is coverage.
```

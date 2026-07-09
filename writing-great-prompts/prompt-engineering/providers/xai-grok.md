# xAI Grok Prompt Techniques

Use this file for xAI Grok 4.x prompts, automatic reasoning behavior, Grok multi-agent settings, xAI tool calling, and xAI structured outputs.

## Provider Pattern

xAI Grok models use direct system and user instructions, with OpenAI-compatible API surfaces available for common chat, Responses API, tool calling, and structured output flows. Treat that compatibility as a transport convenience, not proof that every OpenAI control has the same semantics.

Use xAI-specific patterns when:

- Relying on Grok 4.x reasoning models that reason automatically without a prompt-only workaround.
- Choosing Grok 4.20 multi-agent for research-like work where `reasoning.effort` selects agent count.
- Using function calling, where parallel function calls are enabled by default.
- Using structured outputs and need to keep schemas within xAI-supported JSON Schema features.
- Using long-context prompts where explicit sectioning and clear output contracts matter more than provider-specific formatting tricks.

## Response Length

xAI Grok output length depends on the model, token limits, reasoning/tool use, and prompt specificity. For support, routing, and extraction tasks, keep output contracts tight and avoid relying on personality or style defaults.

## Reasoning Controls

For current Grok 4 / Grok 4.20 / Grok 4.1 fast reasoning models, do not prompt around missing `reasoning_effort` controls and do not pass unsupported effort parameters. These models reason automatically. For simple low-latency work, use a non-reasoning or fast model variant when available rather than trying to disable reasoning in the prompt.

For `grok-4.20-multi-agent`, use `reasoning.effort` only when you intentionally want to choose agent count:

- `low` or `medium`: 4 agents for focused queries and faster research.
- `high` or `xhigh`: 16 agents for comprehensive, multi-perspective research.

Prompt Grok to expose only useful reasoning summaries:

```text
Return the answer, key assumptions, and verification performed. Do not include
private chain-of-thought or internal agent deliberation.
```

## Tool Use

Define function tools with clear names, descriptions, and JSON Schema parameters. Parallel function calling is enabled by default, so tool loops must process every tool call returned in a response before continuing.

Built-in xAI tools execute server-side, while custom function tools pause execution for application-side handling. Keep prompts explicit about which tool families are available and who executes them.

Calibrate tool use with concrete trigger conditions:

- Which facts require tools.
- Which facts can be answered from context.
- Whether the model should ask for clarification or call a tool when required parameters are missing.
- Whether independent custom function calls should be processed in parallel by the application.

## Structured Outputs

Use xAI structured outputs for JSON-shaped responses across extraction, routing, and tool-augmented workflows. Keep schemas simple and validate after receipt.

xAI supports common JSON Schema shapes including objects, arrays, enums, and `anyOf`, but does not currently support `allOf`; some length and array cardinality constraints are also unsupported. Avoid assuming an OpenAI-accepted schema will be accepted unchanged.

## OpenAI-Compatible API Caveats

OpenAI-compatible SDK/API usage for xAI does not mean OpenAI-specific controls, response semantics, or schema support are identical.

Before porting an OpenAI prompt or config to xAI:

- Check whether the target Grok model supports the same reasoning parameters.
- Check whether the structured output schema uses unsupported features such as `allOf`.
- Check whether function-call handling processes all parallel tool calls before continuing.
- Keep prompts direct, sectioned, and explicit about output contracts.

## Long-Horizon Tasks

Do not assume the model knows the harness will compact or preserve state. State the lifecycle explicitly: how context is refreshed, where persistent notes live, and what the model should reload before continuing.

## Few-Shot Examples

Prefer concise rationales or decision summaries rather than hidden chain-of-thought or internal agent deliberation.

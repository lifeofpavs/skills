# OpenAI Prompt Techniques

Use this file for GPT-5.x prompts, OpenAI Responses API workflows, OpenAI reasoning controls, Structured Outputs, and function calling.

## Provider Pattern

OpenAI GPT-5.x guidance emphasizes outcome-first prompts, clean separation of instructions from context, and API-level controls over prompt hacks.

Use OpenAI-specific patterns when:

- Using the Responses API for stateful, tool-using, multimodal workflows.
- Preserving reasoning context between turns instead of forcing the model to re-derive state.
- Choosing `reasoning.effort` and output verbosity for latency/cost/quality tradeoffs.
- Using Structured Outputs with JSON Schema for deterministic machine-readable data.
- Using function calling for actions and external data access.

For OpenAI reasoning models, avoid asking for hidden chain-of-thought. Ask for a concise rationale, decision trace, or final answer plus key assumptions instead. Put stable behavior in system/developer instructions, put task-specific inputs in user messages, and prefer schema enforcement over "return valid JSON" prose.

## Response Length

OpenAI GPT-5.x models support verbosity controls through API parameters in addition to prompt text. Use API-level verbosity when the application needs a stable global default, then use prompt instructions for local task-specific style.

## Reasoning Controls

Tune reasoning through API controls instead of asking for hidden chain-of-thought. Use lower effort for simple classification, routing, and extraction; use higher effort for coding, planning, math, multi-hop tool use, and ambiguous debugging.

```text
For hard tasks, ask for:
- the final answer or patch
- key assumptions
- verification performed
- concise rationale only when useful to the user

Avoid asking for:
- hidden chain-of-thought
- exhaustive private reasoning
- verbose step-by-step narration when the output should be machine-consumed
```

Preserve reasoning context in stateful OpenAI workflows where possible. If using the Responses API, pass prior response context according to the API pattern rather than summarizing everything back into the prompt.

## Tool Use

Prefer function calling for actions, lookups, and external state. Keep function schemas tight, make required fields explicit, and use Structured Outputs when the goal is data generation rather than tool execution.

Validate tool arguments before execution and validate model-generated structured data after receipt.

Calibrate tool use with concrete trigger conditions:

- Which facts require tools.
- Which facts can be answered from context.
- Whether the model should ask for clarification or call a tool when required parameters are missing.
- Whether independent calls may run in parallel.

## Structured Outputs

Use Structured Outputs with JSON Schema when you need reliable machine-readable responses. Prefer this for classification, extraction, routing, test results, and agent handoffs.

Use function calling when the model needs to choose and invoke actions. Use structured output when the model needs to produce data.

Always validate outputs with the application schema even when provider schema mode is enabled.

## Long-Horizon Tasks

Do not assume the model knows the harness will compact or preserve state. State the lifecycle explicitly: how context is refreshed, where persistent notes live, and what the model should reload before continuing.

## Few-Shot Examples

Prefer concise rationales or decision summaries rather than hidden chain-of-thought. Keep examples close to the production task and schema.

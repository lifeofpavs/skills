# Gemini Prompt Techniques

Use this file for Gemini prompts, system instructions, thinking controls, structured output, tool calling, and multimodal prompt design.

## Provider Pattern

Gemini guidance emphasizes clear task/context/examples, explicit format constraints, and API-level configuration for thinking, structured output, and tools.

Use Gemini-specific patterns when:

- Setting system instructions separately from user task content.
- Choosing a thinking level or thinking budget for Gemini reasoning models.
- Using `responseSchema` / structured output with supported schema features.
- Using function calling and returning validated tool responses back to the model.
- Working with multimodal inputs where prompt text should identify what to inspect.

Keep prompts direct and complete: define the role, goal, relevant context, examples if needed, and exact output format. Use thinking controls for hard reasoning tasks, but disable or lower thinking for simple extraction/classification when latency matters.

## Response Length

Gemini output length depends on prompt specificity, token limits, and thinking configuration. For structured extraction, explicitly define the fields and use structured output where possible instead of relying on examples alone.

## Thinking Controls

For Gemini reasoning models, use thinking level or thinking budget controls when available. Raise thinking for complex reasoning, code changes, multi-document synthesis, and tool-heavy workflows. Lower or disable thinking for simple extraction, classification, rewrite, and format-conversion tasks where latency matters.

Prompt Gemini to expose only useful summaries of reasoning:

```text
Return the answer, the assumptions that affect correctness, and any verification
steps you performed. Do not include private chain-of-thought.
```

## Tool Use

Define functions with clear names, descriptions, and parameter schemas. Return tool results as data, not instructions, and include only the fields needed for the next model step.

When Gemini can call multiple functions, state whether independent calls may be parallelized or whether calls must be sequential because later arguments depend on earlier results.

Calibrate tool use with concrete trigger conditions:

- Which facts require tools.
- Which facts can be answered from context.
- Whether the model should ask for clarification or call a tool when required parameters are missing.

## Structured Outputs

Use Gemini structured output with supported schema features for JSON-shaped responses. Keep schemas simple, avoid ambiguous unions, and verify that optional fields and enum constraints behave as expected in your SDK/version.

For unsupported schema needs, simplify the schema or add application-side validation and repair.

## Multimodal Prompts

For multimodal inputs, prompt text should identify what to inspect, what to ignore, and what output format to produce. Avoid assuming the model will infer the target object, frame, or comparison criteria from the image alone.

## Long-Horizon Tasks

Do not assume the model knows the harness will compact or preserve state. State the lifecycle explicitly: how context is refreshed, where persistent notes live, and what the model should reload before continuing.

## Few-Shot Examples

Prefer concise rationales or decision summaries rather than hidden chain-of-thought. Keep examples close to the production task and schema.

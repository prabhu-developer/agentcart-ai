import { env } from "@/lib/env";

export interface OpenRouterToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: OpenRouterToolCall[];
}

interface OpenRouterResponseChoice {
  message?: {
    role?: "assistant";
    content?: string | null;
    tool_calls?: OpenRouterToolCall[];
  };
  finish_reason?: string;
}

interface OpenRouterApiResponse {
  choices?: OpenRouterResponseChoice[];
  error?: {
    message?: string;
    code?: number | string;
  };
}

/**
 * Basic completion (used for health checks and simple prompts)
 */
export async function createAICompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> {
  const result = await callOpenRouterAgent(messages, undefined, { timeoutMs: 15_000 });
  if (!result.content) {
    throw new Error("OpenRouter returned an empty response");
  }
  return result.content;
}

/**
 * Advanced OpenRouter completion with function calling / tools support
 */
export async function callOpenRouterAgent(
  messages: OpenRouterMessage[],
  tools?: unknown[],
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<{
  content: string | null;
  tool_calls?: OpenRouterToolCall[];
  finishReason?: string;
}> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const combinedSignal = options?.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const bodyPayload: Record<string, unknown> = {
    model: env.OPENROUTER_MODEL,
    messages,
    temperature: 0.2,
  };

  if (tools && tools.length > 0) {
    bodyPayload.tools = tools;
    bodyPayload.tool_choice = "auto";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-OpenRouter-Title": "AgentCart AI",
    },
    body: JSON.stringify(bodyPayload),
    cache: "no-store",
    signal: combinedSignal,
  });

  const data = (await response.json()) as OpenRouterApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message || `OpenRouter request failed with status: ${response.status}`
    );
  }

  const choice = data.choices?.[0];
  const choiceMessage = choice?.message;

  if (!choiceMessage) {
    throw new Error("OpenRouter returned no message choices");
  }

  return {
    content: choiceMessage.content || null,
    tool_calls: choiceMessage.tool_calls,
    finishReason: choice.finish_reason,
  };
}

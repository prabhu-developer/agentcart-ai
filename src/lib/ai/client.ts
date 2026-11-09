import { env } from "@/lib/env";

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

type OpenRouterResponse = {
    choices?: {
        message?: {
            content?: string;
        };
    }[];
    error?: {
        message?: string;
    };
};

export async function createAICompletion(
    messages: ChatMessage[],
): Promise<string> {
    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-OpenRouter-Title": "AgentCart AI",
            },
            body: JSON.stringify({
                model: env.OPENROUTER_MODEL,
                messages,
                temperature: 0.2,
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
        },
    );

    const data = (await response.json()) as OpenRouterResponse;

    if (!response.ok) {
        throw new Error(
            data.error?.message ||
            `OpenRouter request failed: ${response.status}`,
        );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("OpenRouter returned an empty response");
    }

    return content;
}
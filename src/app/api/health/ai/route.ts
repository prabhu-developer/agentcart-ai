import { NextResponse } from "next/server";

import { createAICompletion } from "@/lib/ai/client";
import { env } from "@/lib/env";

export async function GET() {
    try {
        const message = await createAICompletion([
            {
                role: "user",
                content: "Reply with exactly: AgentCart AI connected",
            },
        ]);

        return NextResponse.json({
            success: true,
            provider: "openrouter",
            model: env.OPENROUTER_MODEL,
            message,
        });
    } catch (error) {
        console.error("OpenRouter health check failed:", error);

        const isTimeout =
            error instanceof Error &&
            (error.name === "TimeoutError" ||
                error.name === "AbortError");

        return NextResponse.json(
            {
                success: false,
                provider: "openrouter",
                message: isTimeout
                    ? "AI request timed out"
                    : "OpenRouter connection failed",
            },
            { status: isTimeout ? 504 : 502 },
        );
    }
}
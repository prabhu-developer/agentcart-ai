import { NextResponse } from "next/server";

import {
    GEMINI_MODEL,
    getGeminiClient,
} from "@/lib/ai/client";

export async function GET() {
    try {
        const ai = getGeminiClient();

        const interaction: any = await ai.interactions.create({
            model: GEMINI_MODEL,
            input: "Reply with exactly: AgentCart AI connected",
        });

        const textOutput = interaction.outputs?.find(
            (output: any) => output.type === "text",
        );

        return NextResponse.json({
            success: true,
            provider: "gemini",
            model: GEMINI_MODEL,
            message:
                textOutput?.text ?? "Gemini connected successfully",
        });
    } catch (error) {
        console.error("Gemini health check failed:", error);

        return NextResponse.json(
            {
                success: false,
                provider: "gemini",
                message: "AI provider connection failed",
            },
            { status: 500 },
        );
    }
}
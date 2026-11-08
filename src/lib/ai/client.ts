import { env } from "@/lib/env";
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient() {
    if (!client) {
        client = new GoogleGenAI({
            apiKey: env.GEMINI_API_KEY,
        });
    }

    return client;
}

export const GEMINI_MODEL: string = env.GEMINI_MODEL!;
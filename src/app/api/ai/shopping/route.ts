import { NextRequest, NextResponse } from "next/server";
import { agentRequestSchema } from "@/features/agent/schemas/agent-contracts";
import { runShoppingAgent } from "@/features/agent/services/shopping-agent";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = agentRequestSchema.parse(json);

    const result = await runShoppingAgent(validated);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("AI Shopping Agent Route Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          type: "error",
          error: "Invalid request payload",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal AI shopping agent error";

    return NextResponse.json(
      {
        success: false,
        type: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}

import { z } from "zod";
import { Product, BudgetAnalysis } from "@/features/shopping/types";

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

export const agentRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long"),
  history: z.array(chatHistoryMessageSchema).default([]),
  sessionId: z.string().trim().optional(),
});

export type AgentRequest = z.infer<typeof agentRequestSchema>;
export type ChatHistoryMessage = z.infer<typeof chatHistoryMessageSchema>;

export type AgentResponseType = "recommendation" | "clarification" | "message" | "error";

export interface AgentResponse {
  success: boolean;
  type: AgentResponseType;
  message: string;
  recommendedProducts?: Product[];
  comparisonProducts?: Product[];
  budgetAnalysis?: BudgetAnalysis;
  clarificationOptions?: string[];
  suggestedQueries?: string[];
  toolsCalled?: string[];
  error?: string;
}

import { connectDB } from "@/lib/db/connect";
import {
  AgentRequest,
  AgentResponse,
  AgentResponseType,
} from "../schemas/agent-contracts";
import { AGENT_SYSTEM_PROMPT } from "../prompts/system-prompt";
import {
  AGENT_TOOL_DEFINITIONS,
  executeToolByName,
} from "../tools";
import {
  callOpenRouterAgent,
  OpenRouterMessage,
} from "@/lib/ai/client";
import { extractShoppingRequirements } from "./requirement-extractor";
import {
  getProductByIdOrSlug,
  listProducts,
} from "@/features/products/services/product-service";
import { BudgetAnalysis, Product } from "@/features/shopping/types";

const MAX_TOOL_ROUNDS = 5;
const MAX_TOTAL_TOOLS = 8;
const AGENT_TIMEOUT_MS = 15_000;

export async function runShoppingAgent(
  request: AgentRequest
): Promise<AgentResponse> {
  await connectDB();

  const userText = request.message.trim();
  const requirements = extractShoppingRequirements(userText);

  // If user query is clearly a greeting or vague inquiry, respond immediately with clarification options
  if (requirements.isClarificationNeeded) {
    return {
      success: true,
      type: "clarification",
      message:
        requirements.clarificationQuestion ||
        "I'm your personal shopping assistant. Tell me what you'd like to find, your budget, or choose from one of our popular setups below:",
      clarificationOptions: requirements.clarificationOptions,
      recommendedProducts: [],
      toolsCalled: [],
    };
  }

  const toolsCalled: string[] = [];
  const discoveredProductIds = new Set<string>();
  let calculatedBudget: BudgetAnalysis | undefined = undefined;
  let comparisonProducts: Product[] = [];

  // Build conversation messages for OpenRouter
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: AGENT_SYSTEM_PROMPT,
    },
  ];

  // Include recent history (up to last 6 messages)
  const recentHistory = (request.history || []).slice(-6);
  for (const hist of recentHistory) {
    messages.push({
      role: hist.role,
      content: hist.content,
    });
  }

  // Add current user prompt
  messages.push({
    role: "user",
    content: userText,
  });

  let assistantText = "";
  let toolRound = 0;
  let totalToolsRun = 0;

  try {
    const timeoutSignal = AbortSignal.timeout(AGENT_TIMEOUT_MS);

    while (toolRound < MAX_TOOL_ROUNDS && totalToolsRun < MAX_TOTAL_TOOLS) {
      toolRound += 1;

      const completion = await callOpenRouterAgent(
        messages,
        AGENT_TOOL_DEFINITIONS,
        { timeoutMs: AGENT_TIMEOUT_MS, signal: timeoutSignal }
      );

      const toolCalls = completion.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        // Model reached final response without requesting more tools
        assistantText = completion.content || "";
        break;
      }

      // Append assistant's turn with tool_calls
      messages.push({
        role: "assistant",
        content: completion.content || null,
        tool_calls: toolCalls,
      });

      // Execute each tool call requested
      for (const call of toolCalls) {
        if (totalToolsRun >= MAX_TOTAL_TOOLS) break;
        totalToolsRun += 1;

        const toolName = call.function.name;
        toolsCalled.push(toolName);

        const execution = await executeToolByName(
          toolName,
          call.function.arguments
        );

        // Record any product IDs found in tool output
        if (execution.success && execution.result) {
          const res = execution.result as Record<string, unknown>;

          if (toolName === "search_products" && Array.isArray(res.products)) {
            for (const p of res.products as { id: string }[]) {
              if (p?.id) discoveredProductIds.add(p.id);
            }
          } else if (
            toolName === "get_product_details" &&
            res.product &&
            typeof res.product === "object"
          ) {
            const p = res.product as { id: string };
            if (p.id) discoveredProductIds.add(p.id);
          } else if (
            toolName === "compare_products" &&
            Array.isArray(res.products)
          ) {
            for (const p of res.products as { id: string }[]) {
              if (p?.id) discoveredProductIds.add(p.id);
            }
          } else if (
            toolName === "calculate_budget" &&
            res.budgetAnalysis &&
            typeof res.budgetAnalysis === "object"
          ) {
            calculatedBudget = res.budgetAnalysis as BudgetAnalysis;
          }
        }

        // Append tool result message
        messages.push({
          role: "tool",
          name: toolName,
          tool_call_id: call.id,
          content: JSON.stringify(
            execution.success ? execution.result : { error: execution.error }
          ),
        });
      }
    }
  } catch (llmError) {
    // If OpenRouter call times out or throws, we log and fall back to our deterministic pipeline
    console.warn("OpenRouter tool loop encountered an error, activating deterministic fallback:", llmError);
  }

  // --- DETERMINISTIC FALLBACK PIPELINE ---
  // If the model did not execute any tools, or did not discover products for a shopping query:
  if (discoveredProductIds.size === 0) {
    // 1. Search products for detected needs
    const searchTerms =
      requirements.detectedNeeds.length > 0
        ? requirements.detectedNeeds.join(" ")
        : userText;

    const listRes = await listProducts({
      search: searchTerms,
      category: requirements.categoryHints[0],
      maxPrice: requirements.budgetLimit || undefined,
      inStock: true,
      limit: 4,
    });

    if (listRes.products.length > 0) {
      listRes.products.forEach((p) => discoveredProductIds.add(p.id));
      toolsCalled.push("search_products (fallback)");
    } else {
      // If no exact keyword match, fetch featured in-stock products
      const fallbackList = await listProducts({
        category: requirements.categoryHints[0],
        inStock: true,
        limit: 4,
      });
      fallbackList.products.forEach((p) => discoveredProductIds.add(p.id));
    }
  }

  // --- AUTHORITATIVE MONGODB PRODUCT REVALIDATION ---
  // Never trust IDs or prices from AI text; re-query authoritative MongoDB documents
  const candidateIds = Array.from(discoveredProductIds);
  const verifiedProducts: Product[] = [];

  for (const id of candidateIds) {
    if (verifiedProducts.length >= 6) break;
    const verified = await getProductByIdOrSlug(id);
    if (verified && verified.inStock) {
      verifiedProducts.push({
        id: verified.id,
        slug: verified.slug,
        name: verified.name,
        brand: verified.brand,
        category: verified.category,
        price: verified.price,
        priceMinor: verified.priceMinor,
        currency: verified.currency,
        description: verified.description,
        rating: verified.rating,
        reviewCount: verified.reviewCount,
        inStock: verified.inStock,
        stockCount: verified.stockCount,
        images: verified.images,
        specifications: verified.specifications,
        pros: verified.pros,
        cons: verified.cons,
        highlights: verified.highlights,
      });
    }
  }

  // If compare was requested or we have 2+ products, create comparison set
  if (verifiedProducts.length >= 2) {
    comparisonProducts = verifiedProducts.slice(0, 2);
  }

  // Authoritative Budget Calculation
  let budgetAnalysis: BudgetAnalysis | undefined = calculatedBudget;

  if (verifiedProducts.length > 0) {
    const totalMinor = verifiedProducts.reduce((sum, p) => sum + p.priceMinor, 0);
    const totalCost = Number((totalMinor / 100).toFixed(2));
    const targetBudget =
      requirements.budgetLimit ||
      (budgetAnalysis?.budget
        ? budgetAnalysis.budget
        : totalCost > 500
        ? 1000
        : 500);

    const targetBudgetMinor = Math.round(targetBudget * 100);
    const differenceMinor = targetBudgetMinor - totalMinor;
    const difference = Math.abs(Number((differenceMinor / 100).toFixed(2)));

    const status =
      differenceMinor > 0
        ? "under_budget"
        : differenceMinor === 0
        ? "within_budget"
        : "slightly_over";

    budgetAnalysis = {
      total: totalCost,
      budget: targetBudget,
      status,
      difference,
      breakdown: verifiedProducts.map((p) => ({
        label: p.name,
        amount: p.price,
      })),
    };
  }

  // Build clean final explanation text if empty
  if (!assistantText || assistantText.trim().length === 0) {
    if (verifiedProducts.length > 0) {
      const budgetPhrase = budgetAnalysis
        ? ` with a verified total of $${budgetAnalysis.total.toFixed(
            2
          )} (saving $${budgetAnalysis.difference.toFixed(2)} under your $${
            budgetAnalysis.budget
          } target)`
        : "";

      assistantText = `I analyzed your request and queried our real MongoDB catalog. Here is a curated set of ${verifiedProducts.length} verified products${budgetPhrase}. All prices and inventory are confirmed live.`;
    } else {
      assistantText = `I searched our catalog for "${userText}", but couldn't find matching active items. Try searching for "ergonomic chair", "mechanical keyboard", or "home office setup".`;
    }
  }

  const responseType: AgentResponseType =
    verifiedProducts.length > 0 ? "recommendation" : "message";

  return {
    success: true,
    type: responseType,
    message: assistantText,
    recommendedProducts: verifiedProducts,
    comparisonProducts: comparisonProducts.length > 0 ? comparisonProducts : undefined,
    budgetAnalysis,
    toolsCalled,
    suggestedQueries: [
      "Compare key specifications",
      "Are there more affordable alternatives?",
      "Add recommended bundle to cart",
    ],
  };
}

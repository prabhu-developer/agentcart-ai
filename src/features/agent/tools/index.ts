import { executeSearchProducts } from "./search-products";
import { executeGetProductDetails } from "./get-product-details";
import { executeCompareProducts } from "./compare-products";
import { executeCheckInventory } from "./check-inventory";
import { executeCalculateBudget } from "./calculate-budget";

export const AGENT_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description:
        "Search the authoritative MongoDB product catalog with text keywords, category, brand, price constraints, and stock status. Use this tool first to discover matching products.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keyword search query (e.g., 'ergonomic chair', 'mechanical keyboard', '4k monitor').",
          },
          category: {
            type: "string",
            description: "Category slug: 'workspace', 'electronics', 'audio', 'accessories', 'furniture', or 'lifestyle'.",
          },
          brand: {
            type: "string",
            description: "Brand name or slug (e.g. 'KeyCraft', 'Dell', 'Logitech', 'Herman Miller').",
          },
          minPrice: {
            type: "number",
            description: "Minimum product price in USD.",
          },
          maxPrice: {
            type: "number",
            description: "Maximum product price in USD.",
          },
          inStock: {
            type: "boolean",
            description: "Only return products currently in stock.",
          },
          limit: {
            type: "number",
            description: "Maximum number of products to return (default 5, max 10).",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_product_details",
      description:
        "Retrieve authoritative, comprehensive technical specifications, full descriptions, pros, cons, and live inventory for a specific product by its ID or slug.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The product ID or slug to inspect.",
          },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_products",
      description:
        "Generate an authoritative side-by-side comparison matrix for 2 to 4 products, aligning their technical specifications, price differences, and ratings.",
      parameters: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of 2 to 4 product IDs or slugs to compare side-by-side.",
          },
        },
        required: ["productIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_inventory",
      description:
        "Verify live real-time stock levels, inventory counts, and out-of-stock statuses for up to 20 products before recommending them.",
      parameters: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "List of product IDs or slugs to check inventory for.",
          },
        },
        required: ["productIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_budget",
      description:
        "Calculate exact minor-unit financial totals, itemized breakdown, and remaining budget for a proposed bundle of items. Always run this before stating a bundle is within budget.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string", description: "Product ID or slug" },
                quantity: { type: "number", description: "Quantity (default 1)" },
              },
              required: ["productId"],
            },
            description: "List of items to include in the calculation.",
          },
          budgetLimit: {
            type: "number",
            description: "The customer's stated target budget in USD (e.g. 1000).",
          },
        },
        required: ["items", "budgetLimit"],
      },
    },
  },
];

export async function executeToolByName(
  name: string,
  rawArgs: unknown
): Promise<{ success: boolean; result: unknown; error?: string }> {
  try {
    let parsedArgs = rawArgs;
    if (typeof rawArgs === "string") {
      try {
        parsedArgs = JSON.parse(rawArgs);
      } catch {
        parsedArgs = {};
      }
    }

    switch (name) {
      case "search_products": {
        const output = await executeSearchProducts(parsedArgs);
        return { success: true, result: output };
      }
      case "get_product_details": {
        const output = await executeGetProductDetails(parsedArgs);
        return { success: true, result: output };
      }
      case "compare_products": {
        const output = await executeCompareProducts(parsedArgs);
        return { success: true, result: output };
      }
      case "check_inventory": {
        const output = await executeCheckInventory(parsedArgs);
        return { success: true, result: output };
      }
      case "calculate_budget": {
        const output = await executeCalculateBudget(parsedArgs);
        return { success: true, result: output };
      }
      default:
        return {
          success: false,
          result: null,
          error: `Unknown tool name: ${name}. Available tools: search_products, get_product_details, compare_products, check_inventory, calculate_budget.`,
        };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      result: null,
      error: `Tool execution failed for ${name}: ${errorMsg}`,
    };
  }
}

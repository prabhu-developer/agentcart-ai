import {
  ShoppingRequirements,
  shoppingRequirementsSchema,
} from "../schemas/requirements-schema";

const KNOWN_CATEGORIES = [
  "workspace",
  "electronics",
  "audio",
  "accessories",
  "furniture",
  "lifestyle",
];

const KNOWN_ITEMS: Record<string, { category: string; terms: string[] }> = {
  monitor: { category: "electronics", terms: ["monitor", "screen", "display", "4k"] },
  keyboard: {
    category: "electronics",
    terms: ["keyboard", "keychron", "mechanical keyboard", "typing"],
  },
  mouse: { category: "electronics", terms: ["mouse", "trackball", "pointing", "pointer"] },
  chair: {
    category: "furniture",
    terms: ["chair", "ergonomic chair", "seat", "seating", "lumbar"],
  },
  desk: {
    category: "furniture",
    terms: ["desk", "standing desk", "sit-stand", "tabletop"],
  },
  headphones: {
    category: "audio",
    terms: ["headphone", "headphones", "headset", "earbuds", "earphones", "anc"],
  },
  light: {
    category: "accessories",
    terms: ["light", "desk lamp", "screenbar", "monitor light", "lighting"],
  },
  mat: {
    category: "accessories",
    terms: ["desk mat", "mouse pad", "pad", "leather pad"],
  },
  backpack: {
    category: "lifestyle",
    terms: ["backpack", "bag", "carrier", "commute"],
  },
  bottle: {
    category: "lifestyle",
    terms: ["bottle", "water bottle", "tumbler", "flask"],
  },
};

/**
 * Extracts structured shopping requirements from natural language text.
 */
export function extractShoppingRequirements(userText: string): ShoppingRequirements {
  const lower = userText.toLowerCase().trim();

  // 1. Detect if query is overly vague / greeting
  const isGreetingOrVague =
    lower.length < 5 ||
    /^(hi|hello|hey|greetings|help|shop|what can you do|start)\b/i.test(lower) &&
      !/(under|budget|\$|monitor|chair|desk|audio|laptop)/i.test(lower);

  if (isGreetingOrVague) {
    return shoppingRequirementsSchema.parse({
      detectedNeeds: [],
      categoryHints: [],
      budgetLimit: null,
      currency: "USD",
      priorities: [],
      isClarificationNeeded: true,
      clarificationQuestion:
        "What are you shopping for today?",
      clarificationOptions: [
        "Home office setup under $1,000",
        "Mechanical keyboards & mice",
        "Noise-cancelling headphones",
        "Ergonomic chair & desk",
      ],
    });
  }

  // 2. Budget extraction (e.g. "under $1,000", "<$500", "budget of 800", "$1500 limit")
  let budgetLimit: number | null = null;
  const budgetRegexes = [
    /(?:under|below|max|budget(?:\s+of)?|upto|up\s+to|within|less\s+than)\s*\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i,
    /\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)\s*(?:budget|limit|max)/i,
    /\$([0-9]{1,3}(?:,[0-9]{3})*)/i,
  ];

  for (const regex of budgetRegexes) {
    const match = lower.match(regex);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0 && parsed <= 50_000) {
        budgetLimit = parsed;
        break;
      }
    }
  }

  // 3. Detect needs and categories
  const detectedNeeds: string[] = [];
  const categorySet = new Set<string>();

  for (const [itemKey, config] of Object.entries(KNOWN_ITEMS)) {
    const hasTerm = config.terms.some((term) => lower.includes(term));
    if (hasTerm) {
      detectedNeeds.push(itemKey);
      categorySet.add(config.category);
    }
  }

  // Check explicit category mentions
  for (const cat of KNOWN_CATEGORIES) {
    if (lower.includes(cat)) {
      categorySet.add(cat);
    }
  }

  // 4. Priorities detection
  const priorities: string[] = [];
  if (lower.includes("ergo") || lower.includes("posture") || lower.includes("lumbar")) {
    priorities.push("ergonomics");
  }
  if (lower.includes("wire") || lower.includes("bluetooth") || lower.includes("cordless")) {
    priorities.push("wireless");
  }
  if (lower.includes("value") || lower.includes("budget") || lower.includes("affordable")) {
    priorities.push("value for money");
  }
  if (lower.includes("quality") || lower.includes("reliable") || lower.includes("durab")) {
    priorities.push("quality & reliability");
  }
  if (lower.includes("gaming") || lower.includes("rgb") || lower.includes("fps")) {
    priorities.push("gaming");
  }
  if (lower.includes("quiet") || lower.includes("silent") || lower.includes("office")) {
    priorities.push("quiet typing & environment");
  }

  return shoppingRequirementsSchema.parse({
    detectedNeeds,
    categoryHints: Array.from(categorySet),
    budgetLimit,
    currency: "USD",
    priorities,
    isClarificationNeeded: false,
    clarificationQuestion: null,
    clarificationOptions: [],
  });
}

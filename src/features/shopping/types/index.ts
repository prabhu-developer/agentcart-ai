export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "workspace" | "electronics" | "audio" | "accessories" | "furniture" | "lifestyle";
  price: number;
  priceMinor: number;
  currency: string;
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  specifications: Record<string, string>;
  pros: string[];
  cons: string[];
  highlights: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type BudgetStatus = "within_budget" | "under_budget" | "slightly_over";

export interface BudgetAnalysis {
  total: number;
  budget: number;
  status: BudgetStatus;
  difference: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text: string;
  recommendedProducts?: Product[];
  comparisonProducts?: Product[];
  budgetAnalysis?: BudgetAnalysis;
}

export interface ShoppingSession {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  itemCount: number;
  initialPrompt?: string;
}

export interface ShoppingScenario {
  id: string;
  title: string;
  tagline: string;
  description: string;
  targetBudget: number;
  image: string;
  category: string;
  prompt: string;
  featuredProducts: Product[];
}

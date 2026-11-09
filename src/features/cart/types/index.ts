import { Product as FrontendProduct } from "@/features/shopping/types";

export interface AuthoritativeCartItem {
  productId: string;
  name: string;
  brand: string;
  images: string[];
  price: number;
  priceMinor: number;
  currency: string;
  quantity: number;
  lineTotal: number;
  lineTotalMinor: number;
  inStock: boolean;
  availableStock: number;
  isAvailable: boolean;
  validationIssue?: string;
  product: FrontendProduct;
}

export interface AuthoritativeCart {
  id: string;
  currency: string;
  items: AuthoritativeCartItem[];
  totalItems: number;
  subtotal: number;
  subtotalMinor: number;
  formattedSubtotal: string;
  isValidForCheckout: boolean;
  validationIssues: string[];
  updatedAt: string;
}

export interface CheckoutPreparation {
  cartId: string;
  currency: string;
  subtotal: number;
  subtotalMinor: number;
  formattedSubtotal: string;
  totalItems: number;
  items: AuthoritativeCartItem[];
  isValid: boolean;
  issues: string[];
  taxNotCalculated: boolean;
  shippingNotCalculated: boolean;
  preparationTimestamp: string;
}

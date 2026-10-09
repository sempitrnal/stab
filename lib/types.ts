export type ProductType = "apparel" | "accessory" | "music";

export interface Variant {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  dimensions: string | null;
  price_cents: number | null;
  stock: number;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: ProductType;
  price_cents: number;
  images: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
  variants?: Variant[];
}

export type OrderStatus =
  | "pending"
  | "half_paid"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "gcash" | "bank_transfer" | "paypal";

export type PaymentType = "full" | "down";

export type ShippingMethod =
  | "pickup"
  | "maxim_lalamove"
  | "jnt"
  | "international";

export interface Address {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  postal?: string;
  country?: string;
  pin?: string;
}

export interface Order {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  social_handle: string | null;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  proof_of_payment: string | null;
  shipping_method: ShippingMethod;
  address: Address | null;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  title: string;
  variant_label: string | null;
  image: string | null;
  qty: number;
  unit_price_cents: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  variantId: string;
  variantLabel: string;
  unitPriceCents: number;
  image: string | null;
  qty: number;
  maxStock: number;
}

export type Locale = "vi" | "en";

export type Product = {
  id: number;
  slug: string;
  name: string;
  image: string;
  images?: string[];
  category: string;
  price: string;
  salePrice?: string | null;
  featured: boolean;
  isNew: boolean;
  description?: string;
  material?: string;
  dimensions?: string;
  status?: "active" | "draft" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id?: number;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  sortOrder?: number;
  status?: "active" | "draft";
};

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready_to_ship"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "store" | "cod";

export type OrderItem = {
  product_slug?: string;
  product_name: string;
  image?: string;
  price?: string;
  quantity: number;
};

export type Order = {
  id?: string;
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
  product_slug?: string;
  product_name?: string;
  quantity: number;
  items?: OrderItem[];
  payment_method?: PaymentMethod;
  status?: OrderStatus;
  revenue_amount?: number;
  created_at?: string;
  updated_at?: string;
};

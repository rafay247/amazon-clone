export type SessionUser = { id: string; name: string; email: string } | null;

export type Address = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
};

export type Payment =
  | { type: "card"; brand: string; last4: string; name: string; exp: string }
  | { type: "cod" };

export type OrderItem = {
  id: number;
  product_id: number;
  title: string;
  slug: string;
  image: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  number: string;
  status: "placed" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Omit<Address, "id" | "is_default">;
  payment: Payment;
  delivery_date: string;
  created_at: string;
  order_items: OrderItem[];
};

export type Role =
  | "user"
  | "supplier"
  | "supplier-admin"
  | "superadmin"
  | "delivery";

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  phone?: string;
  pfp?: string;
  password?: string;
  verified: boolean;
  registrationDate: string;
  supplierId?: string; // If role is supplier-admin
  businessName?: string;
  documents?: Record<string, boolean>; // Simulated check for uploaded docs
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  active: boolean;
  joinedAt: string;
}

export interface Product {
  id: string;
  supplierId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  nonRefundable?: boolean; // Some products cannot be refunded
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  supplierId: string;
  refundable?: boolean; // If false, item cannot be refunded
  refunded?: boolean; // Marked when refund has been processed
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cod" | "card";
  status: "placed" | "delivered" | "refunded" | "disposed";
  createdAt: string;
  date?: string; // Legacy field from the API
  deliveredAt?: string;
  deliveredBy?: string;
  refundedAt?: string;
  disposedAt?: string;
}

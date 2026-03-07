
export type Role = 'user' | 'supplier' | 'supplier-admin' | 'superadmin' | 'delivery';

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  phone?: string;
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
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'card';
  status: 'placed' | 'delivered';
  createdAt: string;
  deliveredAt?: string;
  deliveredBy?: string;
}

export type Section = 'dashboard' | 'pos' | 'inventory' | 'stock' | 'users' | 'reports' | 'cd';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  lowStockThreshold?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string with time
  amount: number;
  items: { productId: string; productName: string; quantity: number; price: number }[];
}

export interface User {
  id?: string;
  username: string;
  firstName: string;
  surname: string;
  role: 'Admin' | 'Manager' | 'CEO' | 'Staff Worker';
  email: string;
  phone: string;
  address: string;
}

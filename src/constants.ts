import { Product, Sale, User } from './types';

export const LOW_STOCK_THRESHOLD = 20;

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    username: 'admin@sarisari.com', 
    firstName: 'Aling', 
    surname: 'Nena', 
    role: 'Admin', 
    email: 'admin@sarisari.com', 
    phone: '09123456789', 
    address: '123 Sari-Sari St.' 
  },
  { 
    id: '2', 
    username: 'manager@sarisari.com', 
    firstName: 'Juan', 
    surname: 'Dela Cruz', 
    role: 'Manager', 
    email: 'manager@sarisari.com', 
    phone: '09123456780', 
    address: '456 Market St.' 
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Liboog', price: 80, stock: 24, category: 'Beverage', lowStockThreshold: 30 },
  { id: '2', name: 'Pale Pilsen', price: 46, stock: 15, category: 'Beverage', lowStockThreshold: 20 },
  { id: '3', name: 'Century Tuna', price: 35, stock: 45, category: 'Canned Goods', lowStockThreshold: 10 },
  { id: '4', name: 'Lucky Me Noodles', price: 15, stock: 10, category: 'Instant Food', lowStockThreshold: 25 },
  { id: '5', name: 'Nescafe 3-in-1', price: 10, stock: 300, category: 'Beverage', lowStockThreshold: 50 },
];

export const MOCK_SALES: Sale[] = [
  { 
    id: '1', 
    date: '2026-02-28T08:30:00', 
    amount: 160, 
    items: [
      { productId: '1', productName: 'Liboog', quantity: 2, price: 80 }
    ] 
  },
  { 
    id: '2', 
    date: '2026-02-28T09:15:00', 
    amount: 92, 
    items: [
      { productId: '2', productName: 'Pale Pilsen', quantity: 2, price: 46 }
    ] 
  },
  { 
    id: '3', 
    date: '2026-02-28T10:45:00', 
    amount: 394, 
    items: [
      { productId: '3', productName: 'Century Tuna', quantity: 10, price: 35 },
      { productId: '4', productName: 'Lucky Me Noodles', quantity: 2, price: 15 },
      { productId: '5', productName: 'Nescafe 3-in-1', quantity: 1, price: 14 }
    ] 
  },
  { id: '4', date: '2026-02-21T12:00:00', amount: 380, items: [] },
  { id: '5', date: '2026-02-22T12:00:00', amount: 740, items: [] },
  { id: '6', date: '2026-02-23T12:00:00', amount: 950, items: [] },
  { id: '7', date: '2026-02-24T12:00:00', amount: 580, items: [] },
  { id: '8', date: '2026-02-25T12:00:00', amount: 810, items: [] },
];

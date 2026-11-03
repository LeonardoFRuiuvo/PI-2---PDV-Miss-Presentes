export interface Product {
  id: string;
  name: string;
  categories: string[];
  sku?: string;
  stock: number;
  price: number;
  imageUrl?: string;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleRecord {
  id: string;
  paymentMethod: 'pix' | 'cash' | 'debit' | 'credit';
  subtotal: number;
  discount: number;
  interest: number;
  total: number;
  installments: number;
  amountReceived?: number;
  changeGiven: number;
  itemCount: number;
  createdAt: string;
}

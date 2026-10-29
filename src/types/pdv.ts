export interface Product {
  id: string;
  name: string;
  categories: string[];
  sku?: string | number; // Padrão '0' se não especificado
  stock: number; // Quantidade de itens no estoque
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

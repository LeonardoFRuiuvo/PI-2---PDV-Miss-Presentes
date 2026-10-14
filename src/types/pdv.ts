export interface Product {
  id: string;
  name: string;
  category: string;
  sku?: string | number; // Padrão '0' se não especificado
  stock: number; // Quantidade de itens no estoque
  price: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

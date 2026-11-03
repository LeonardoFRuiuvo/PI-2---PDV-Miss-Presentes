import { CartItem, Product, SaleRecord, StockHistoryEntry } from '../types/pdv';

const API_BASE = '/api/v1';

interface ApiEnvelope<T> {
  data: T;
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: {
    page: number;
    pages: number;
  };
}

interface ProductResponse {
  id: string;
  name: string;
  sku: string | null;
  categories: string[];
  stock: number;
  price: string;
  image_url: string | null;
}

interface StockMovementResponse {
  id: string;
  product_id: string;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  created_at: string;
}

interface SaleResponse {
  id: string;
  payment_method: SaleRecord['paymentMethod'];
  subtotal: string;
  discount: string;
  interest: string;
  total: string;
  installments: number;
  amount_received: string | null;
  change_given: string;
  items: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    unit_price: string;
    quantity: number;
    line_total: string;
  }>;
  created_at: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  categories: string[];
  stock: number;
  price: number;
  image?: File;
}

export interface UpdateProductInput {
  name: string;
  sku: string;
  categories: string[];
  price: number;
}

export interface CreateSaleInput {
  payment_method: SaleRecord['paymentMethod'];
  installments: number;
  discount_type: 'amount' | 'percentage';
  discount_value: number;
  interest_type: 'amount' | 'percentage';
  interest_value: number;
  amount_received?: number;
  items: Array<{ product_id: string; quantity: number }>;
}

function mapProduct(product: ProductResponse): Product {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku ?? undefined,
    categories: product.categories,
    stock: product.stock,
    price: Number(product.price),
    imageUrl: product.image_url ?? undefined,
  };
}

function mapStockMovement(movement: StockMovementResponse): StockHistoryEntry {
  return {
    id: movement.id,
    productId: movement.product_id,
    productName: movement.product_name,
    previousStock: movement.previous_stock,
    newStock: movement.new_stock,
    changedAt: movement.created_at,
  };
}

function mapSale(sale: SaleResponse): SaleRecord {
  return {
    id: sale.id,
    paymentMethod: sale.payment_method,
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    interest: Number(sale.interest),
    total: Number(sale.total),
    installments: sale.installments,
    amountReceived: sale.amount_received === null ? undefined : Number(sale.amount_received),
    changeGiven: Number(sale.change_given),
    itemCount: sale.items.reduce((total, item) => total + item.quantity, 0),
    createdAt: sale.created_at,
  };
}

async function requestPayload<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null
      && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : `A API respondeu com erro HTTP ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const payload = await requestPayload<ApiEnvelope<T>>(path, init);
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) {
    throw new Error('A resposta da API não contém os dados esperados.');
  }
  return payload.data;
}

async function mutate<T>(path: string, init: RequestInit): Promise<T> {
  const csrf = await request<{ csrf_token: string }>('/csrf/');
  const headers = new Headers(init.headers);
  headers.set('X-CSRFToken', csrf.csrf_token);
  return request<T>(path, { ...init, headers });
}

async function getAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let pages = 1;

  do {
    const result = await requestPayload<PaginatedEnvelope<T>>(
      `${path}${path.includes('?') ? '&' : '?'}page=${page}&page_size=100`,
    );
    items.push(...result.data);
    pages = result.pagination.pages;
    page += 1;
  } while (page <= pages);

  return items;
}

export async function listProducts(): Promise<Product[]> {
  const products = await getAllPages<ProductResponse>('/products/');
  return products.map(mapProduct);
}

export async function listCategories(): Promise<string[]> {
  const categories = await request<Array<{ id: number; name: string }>>('/categories/');
  return categories.map((category) => category.name);
}

export async function listStockMovements(): Promise<StockHistoryEntry[]> {
  const movements = await getAllPages<StockMovementResponse>('/stock-movements/');
  return movements.map(mapStockMovement);
}

export async function listSales(): Promise<SaleRecord[]> {
  const sales = await getAllPages<SaleResponse>('/sales/');
  return sales.map(mapSale);
}

export async function createStockMovement(productId: string, quantityDelta: number): Promise<void> {
  await mutate('/stock-movements/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, quantity_delta: quantityDelta }),
  });
}

export async function createProduct(input: CreateProductInput): Promise<void> {
  if (input.image) {
    const body = new FormData();
    body.set('name', input.name);
    body.set('sku', input.sku);
    body.set('price', String(input.price));
    body.set('stock', String(input.stock));
    body.set('categories', JSON.stringify(input.categories));
    body.set('image', input.image);
    await mutate('/products/', { method: 'POST', body });
    return;
  }

  await mutate('/products/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateProduct(productId: string, input: UpdateProductInput): Promise<void> {
  await mutate(`/products/${productId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function createSale(input: CreateSaleInput, idempotencyKey: string): Promise<void> {
  await mutate('/sales/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
  });
}

export function cartItemsToSaleItems(items: CartItem[]): CreateSaleInput['items'] {
  return items.map(({ product, quantity }) => ({
    product_id: product.id,
    quantity,
  }));
}

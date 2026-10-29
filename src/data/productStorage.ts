import { Product } from '../types/pdv';
import { PRODUCTS } from './products';

const STORAGE_KEY = 'miss-presentes-products';

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;
  return typeof product.id === 'string'
    && typeof product.name === 'string'
    && Array.isArray(product.categories)
    && product.categories.every((category) => typeof category === 'string')
    && (typeof product.sku === 'string' || typeof product.sku === 'number' || product.sku === undefined)
    && typeof product.stock === 'number'
    && Number.isInteger(product.stock)
    && product.stock >= 0
    && typeof product.price === 'number'
    && (typeof product.imageUrl === 'string' || product.imageUrl === undefined);
}

export function loadProducts(): Product[] {
  const storedProducts = window.localStorage.getItem(STORAGE_KEY);
  if (storedProducts === null) {
    return PRODUCTS;
  }

  const parsedProducts: unknown = JSON.parse(storedProducts);
  if (!Array.isArray(parsedProducts)) {
    throw new Error('O cache de produtos precisa ser uma lista.');
  }
  const compatibleProducts = parsedProducts.map((value) => {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const storedProduct = value as Record<string, unknown>;
    if (typeof storedProduct.category === 'string' && storedProduct.categories === undefined) {
      const { category, ...product } = storedProduct;
      return { ...product, categories: [category] };
    }
    return value;
  });

  if (!compatibleProducts.every(isProduct)) {
    throw new Error('O cache contém um ou mais produtos inválidos.');
  }

  return compatibleProducts;
}

export function saveProducts(products: Product[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

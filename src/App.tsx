/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CheckoutModal } from './components/CheckoutModal';
import { InventoryPage } from './components/InventoryPage';
import { ProductCard } from './components/ProductCard';
import { SidebarCart } from './components/SidebarCart';
import { loadProducts, saveProducts } from './data/productStorage';
import { PRODUCTS } from './data/products';
import { Product, CartItem, StockHistoryEntry } from './types/pdv';

interface InventoryState {
  products: Product[];
  stockHistory: StockHistoryEntry[];
}

function createEventId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [initialInventoryState] = useState(() => {
    let products = PRODUCTS;
    let productsReady = true;
    let productLoadError: string | undefined;
    try {
      products = loadProducts();
    } catch (error) {
      console.error('Não foi possível carregar os produtos do armazenamento local.', error);
      productsReady = false;
      productLoadError = 'Não foi possível carregar os produtos salvos. Os produtos de exemplo estão sendo exibidos.';
    }

    return {
      inventory: { products, stockHistory: [] },
      productsReady,
      error: productLoadError,
    };
  });
  const [inventory, setInventory] = useState<InventoryState>(initialInventoryState.inventory);
  const [productsReady] = useState(initialInventoryState.productsReady);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem('miss-presentes-theme') === 'dark';
    } catch (error) {
      console.error('Não foi possível carregar a preferência de tema.', error);
      return false;
    }
  });
  const [currentPage, setCurrentPage] = useState<'pos' | 'inventory'>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [storageError, setStorageError] = useState<string | undefined>(initialInventoryState.error);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Carrinho de itens (conceito base funcional e intuitivo)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      window.localStorage.setItem('miss-presentes-theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Não foi possível salvar a preferência de tema.', error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!productsReady) {
      return;
    }

    try {
      saveProducts(inventory.products);
    } catch (error) {
      console.error('Não foi possível salvar os produtos no armazenamento local.', error);
      setStorageError('Não foi possível salvar as alterações no navegador. Verifique o espaço disponível e as permissões de armazenamento.');
    }
  }, [inventory.products, productsReady]);

  const products = inventory.products;
  const categories = [...new Set(products.flatMap((product) => product.categories))];

  // Filtragem simples dos produtos
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === null || product.categories.includes(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Adicionar item ao carrinho
  const handleAddToCart = (product: Product) => {
    const availableProduct = products.find((item) => item.id === product.id);
    if (!availableProduct || availableProduct.stock <= 0) {
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= availableProduct.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, product: availableProduct, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: availableProduct, quantity: 1 }];
    });
  };

  // Remover item do carrinho
  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Limpar todos os itens do carrinho
  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleStockChange = (productId: string, stock: number) => {
    const changedAt = new Date().toISOString();
    const eventId = createEventId();

    setInventory((current) => {
      const currentProduct = current.products.find((product) => product.id === productId);
      if (!currentProduct || currentProduct.stock === stock) {
        return current;
      }

      const historyEntry: StockHistoryEntry = {
        id: `stock-${eventId}`,
        productId,
        productName: currentProduct.name,
        previousStock: currentProduct.stock,
        newStock: stock,
        changedAt,
      };

      return {
        products: current.products.map((product) =>
          product.id === productId ? { ...product, stock } : product
        ),
        stockHistory: [historyEntry, ...current.stockHistory],
      };
    });
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) return [item];
        if (stock <= 0) return [];
        return [{ ...item, quantity: Math.min(item.quantity, stock) }];
      })
    );
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setInventory((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    }));
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === updatedProduct.id ? { ...item, product: updatedProduct } : item
      )
    );
  };

  const handleProductCreate = (product: Product) => {
    const changedAt = new Date().toISOString();
    const historyEntry: StockHistoryEntry = {
      id: `stock-${createEventId()}`,
      productId: product.id,
      productName: product.name,
      previousStock: 0,
      newStock: product.stock,
      changedAt,
    };

    setInventory((current) => ({
      products: [...current.products, product],
      stockHistory: product.stock > 0
        ? [historyEntry, ...current.stockHistory]
        : current.stockHistory,
    }));
  };

  if (currentPage === 'inventory') {
    return (
      <InventoryPage
        products={products}
        categories={categories}
        stockHistory={inventory.stockHistory}
        onStockChange={handleStockChange}
        onProductUpdate={handleProductUpdate}
        onProductCreate={handleProductCreate}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode((current) => !current)}
        onBack={() => setCurrentPage('pos')}
        storageError={storageError}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/70 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* 1. Cabeçalho (Miss Presentes com espaço para busca e código) */}
      <Header
        onSearchChange={setSearchTerm}
        onInventoryClick={() => setCurrentPage('inventory')}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode((current) => !current)}
      />

      {/* 2. Área Principal com Grid de Peças e Barra Lateral do Carrinho */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Painel de Produtos */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6">
          {/* Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === null
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-700'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid dos Produtos de Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </main>

        {/* 3. Barra Lateral com o Ícone do Carrinho e Botão de Remover Itens */}
        <SidebarCart
          items={cartItems}
          onCheckout={() => setIsCheckoutOpen(true)}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
        />
      </div>
      {isCheckoutOpen && (
        <CheckoutModal
          items={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}

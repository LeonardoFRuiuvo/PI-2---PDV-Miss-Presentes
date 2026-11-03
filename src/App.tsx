/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CheckoutModal } from './components/CheckoutModal';
import { InventoryPage } from './components/InventoryPage';
import { ProductCard } from './components/ProductCard';
import { SidebarCart } from './components/SidebarCart';
import {
  createProduct,
  createSale,
  createStockMovement,
  CreateProductInput,
  CreateSaleInput,
  listCategories,
  listProducts,
  listSales,
  listStockMovements,
  updateProduct,
} from './data/api';
import { CartItem, Product, SaleRecord, StockHistoryEntry } from './types/pdv';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string>();
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshData = useCallback(async () => {
    const [nextProducts, nextCategories, nextMovements, nextSales] = await Promise.all([
      listProducts(),
      listCategories(),
      listStockMovements(),
      listSales(),
    ]);

    setProducts(nextProducts);
    setCategories(nextCategories);
    setStockHistory(nextMovements);
    setSales(nextSales);
    setCartItems((currentItems) => currentItems.flatMap((item) => {
      const currentProduct = nextProducts.find((product) => product.id === item.product.id);
      if (!currentProduct || currentProduct.stock <= 0) return [];
      return [{
        product: currentProduct,
        quantity: Math.min(item.quantity, currentProduct.stock),
      }];
    }));
  }, []);

  useEffect(() => {
    let active = true;
    refreshData()
      .catch((error: unknown) => {
        if (active) {
          setApiError(error instanceof Error ? error.message : 'Não foi possível conectar à API.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      window.localStorage.setItem('miss-presentes-theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Não foi possível salvar a preferência de tema.', error);
    }
  }, [isDarkMode]);

  const runMutation = async (operation: () => Promise<void>): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    setApiError(undefined);
    try {
      await operation();
    } catch (error) {
      let message = error instanceof Error ? error.message : 'Não foi possível salvar a alteração.';
      try {
        await refreshData();
      } catch (refreshError) {
        const reason = refreshError instanceof Error ? refreshError.message : 'erro desconhecido';
        message = `${message} Não foi possível atualizar os dados: ${reason}`;
      }
      setApiError(message);
      setIsSaving(false);
      return false;
    }

    try {
      await refreshData();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'erro desconhecido';
      setApiError(`A alteração foi registrada, mas não foi possível atualizar os dados: ${reason}`);
    } finally {
      setIsSaving(false);
    }
    return true;
  };

  const reloadData = async () => {
    setIsLoading(true);
    setApiError(undefined);
    try {
      await refreshData();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Não foi possível conectar à API.');
    } finally {
      setIsLoading(false);
    }
  };

  const productCategories = [...new Set(products.flatMap((product) => product.categories))];
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === null || product.categories.includes(selectedCategory);
    const query = searchTerm.toLocaleLowerCase();
    const matchesSearch = product.name.toLocaleLowerCase().includes(query)
      || (product.sku?.toLocaleLowerCase().includes(query) ?? false);
    return matchesCategory && matchesSearch;
  });

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

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleStockChange = async (productId: string, stock: number): Promise<boolean> => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock === stock) return true;
    return runMutation(() => createStockMovement(productId, stock - product.stock));
  };

  const handleProductUpdate = async (updatedProduct: Product): Promise<boolean> => {
    return runMutation(() => updateProduct(updatedProduct.id, {
      name: updatedProduct.name,
      sku: updatedProduct.sku ?? '',
      price: updatedProduct.price,
      categories: updatedProduct.categories,
    }));
  };

  const handleProductCreate = async (product: CreateProductInput): Promise<boolean> => {
    return runMutation(() => createProduct(product));
  };

  const handleCheckout = async (sale: CreateSaleInput, idempotencyKey: string): Promise<void> => {
    if (isSaving) throw new Error('Uma operação já está sendo processada.');
    setIsSaving(true);
    setApiError(undefined);
    try {
      await createSale(sale, idempotencyKey);
    } catch (error) {
      let message = error instanceof Error ? error.message : 'Não foi possível registrar a venda.';
      try {
        await refreshData();
      } catch (refreshError) {
        const reason = refreshError instanceof Error ? refreshError.message : 'erro desconhecido';
        message = `${message} Não foi possível atualizar os dados: ${reason}`;
      }
      setApiError(message);
      setIsSaving(false);
      throw new Error(message);
    }

    setCartItems([]);
    setIsCheckoutOpen(false);
    try {
      await refreshData();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'erro desconhecido';
      setApiError(`A venda foi registrada, mas não foi possível atualizar os dados: ${reason}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100/70 font-sans text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Carregando dados do banco de dados…
      </div>
    );
  }

  if (currentPage === 'inventory') {
    return (
      <InventoryPage
        products={products}
        categories={categories}
        stockHistory={stockHistory}
        sales={sales}
        onStockChange={handleStockChange}
        onProductUpdate={handleProductUpdate}
        onProductCreate={handleProductCreate}
        isSaving={isSaving}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode((current) => !current)}
        onBack={() => setCurrentPage('pos')}
        apiError={apiError}
        onReload={reloadData}
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
      {apiError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <span>{apiError}</span>
          <button type="button" onClick={reloadData} className="font-semibold underline underline-offset-2">
            Recarregar dados
          </button>
        </div>
      )}

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
            {productCategories.map((cat) => (
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

          {filteredProducts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-6 text-center dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {products.length === 0
                  ? 'Cadastre os produtos pelo gerenciamento de estoque para começar.'
                  : 'Tente outra busca ou selecione uma categoria diferente.'}
              </p>
              {products.length === 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('inventory')}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-amber-700"
                >
                  Abrir gerenciamento de estoque
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
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
          onConfirm={handleCheckout}
          isSubmitting={isSaving}
        />
      )}
    </div>
  );
}

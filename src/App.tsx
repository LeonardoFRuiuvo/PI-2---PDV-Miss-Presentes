/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { SidebarCart } from './components/SidebarCart';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { Product, CartItem } from './types/pdv';

export default function App() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Carrinho de itens (conceito base funcional e intuitivo)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Categorias das peças da Miss Presentes
  const categories = ['Todos', 'Colares', 'Pulseiras', 'Brincos', 'Anéis', 'Conjuntos', 'Embalagens'];

  // Filtragem simples dos produtos
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Adicionar item ao carrinho
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
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

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-800">
      {/* 1. Cabeçalho (Miss Presentes com espaço para busca e código) */}
      <Header onSearchChange={setSearchTerm} />

      {/* 2. Área Principal com Grid de Peças e Barra Lateral do Carrinho */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Painel de Produtos */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6">
          {/* Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
        />
      </div>
    </div>
  );
}

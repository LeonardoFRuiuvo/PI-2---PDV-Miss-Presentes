import React from 'react';
import { Gem, Plus } from 'lucide-react';
import { Product } from '../types/pdv';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0;

  // O código SKU por padrão exibe 0 até que um código seja adicionado
  const displaySku = product.sku !== undefined && product.sku !== null && product.sku !== ''
    ? product.sku
    : 0;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border shadow-2xs transition-all duration-200 ${
        isOutOfStock
          ? 'border-slate-300 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-950/70'
          : 'border-slate-200 bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900'
      }`}
      aria-label={isOutOfStock ? `${product.name}, sem estoque` : product.name}
    >
      {/* Seção para a Imagem do Produto */}
      <div className={`relative flex aspect-4/3 w-full items-center justify-center overflow-hidden border-b ${
        isOutOfStock
          ? 'border-slate-200 bg-slate-200/70 dark:border-slate-800 dark:bg-slate-900'
          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'
      }`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400 dark:text-slate-500">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700/80 dark:bg-amber-950/50 dark:text-amber-300">
              <Gem className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Imagem do Produto
            </span>
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1">
          {product.categories.map((category) => (
            <span
              key={category}
              className="rounded border border-slate-100 bg-white/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300"
            >
              {category}
            </span>
          ))}
        </div>
        {isOutOfStock && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md border border-slate-300 bg-slate-800/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white dark:border-slate-600 dark:bg-slate-950/90">
            Sem estoque
          </span>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className={`flex flex-1 flex-col justify-between gap-3 p-4 ${isOutOfStock ? 'text-slate-600 dark:text-slate-400' : ''}`}>
        <div>
          {/* Código SKU e Estoque */}
          <div className="mb-1.5 flex items-center justify-between font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <span className="font-normal text-slate-400 dark:text-slate-500">SKU: </span>
              {displaySku}
            </span>
            <span className={`text-[11px] font-medium ${
              isOutOfStock ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {isOutOfStock ? 'Sem estoque' : `Estoque: ${product.stock} un`}
            </span>
          </div>

          {/* Nome do Produto */}
          <h3 className={`text-sm font-semibold leading-snug ${
            isOutOfStock ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
          }`}>
            {product.name}
          </h3>
        </div>

        {/* Preço e Botão de Adição ao Carrinho */}
        <div className={`mt-auto flex items-center justify-between gap-2 border-t pt-2.5 ${
          isOutOfStock ? 'border-slate-200 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800'
        }`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
              Preço
            </span>
            <span className={`text-sm font-bold tabular-nums ${
              isOutOfStock ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botão de Adição para Adicionar ao Carrinho */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart?.(product)}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 active:bg-black disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300 dark:bg-amber-700 dark:hover:bg-amber-600 dark:active:bg-amber-800 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 dark:disabled:hover:bg-slate-700"
            aria-label={isOutOfStock ? `${product.name} sem estoque` : `Adicionar ${product.name} ao carrinho`}
            title={isOutOfStock ? 'Produto sem estoque' : 'Adicionar ao carrinho'}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isOutOfStock ? 'Indisponível' : 'Adicionar'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

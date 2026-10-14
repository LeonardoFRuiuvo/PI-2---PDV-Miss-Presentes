import React from 'react';
import { Gem, Plus } from 'lucide-react';
import { Product } from '../types/pdv';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // O código SKU por padrão exibe 0 até que um código seja adicionado
  const displaySku = product.sku !== undefined && product.sku !== null && product.sku !== ''
    ? product.sku
    : 0;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-200">
      {/* Seção para a Imagem do Produto */}
      <div className="relative aspect-4/3 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700/80 flex items-center justify-center">
              <Gem className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Imagem do Produto
            </span>
          </div>
        )}

        {/* Categoria sutil */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-white/95 px-2 py-0.5 rounded border border-slate-100 shadow-2xs">
          {product.category}
        </span>
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Código SKU e Estoque */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums mb-1.5">
            <span className="font-semibold text-slate-700">
              <span className="text-slate-400 font-normal">SKU: </span>
              {displaySku}
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Estoque: {product.stock} un
            </span>
          </div>

          {/* Nome do Produto */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Preço e Botão de Adição ao Carrinho */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-medium text-slate-400">
              Preço
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botão de Adição para Adicionar ao Carrinho */}
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

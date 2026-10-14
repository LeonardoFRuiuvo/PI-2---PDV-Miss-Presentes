import React from 'react';
import { ShoppingCart, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from '../types/pdv';

interface SidebarCartProps {
  items?: CartItem[];
  onCheckout?: () => void;
  onRemoveItem?: (productId: string) => void;
  onClearCart?: () => void;
}

export const SidebarCart: React.FC<SidebarCartProps> = ({
  items = [],
  onCheckout,
  onRemoveItem,
  onClearCart,
}) => {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0">
      {/* Cabeçalho da Barra Lateral com o Ícone do Carrinho */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Carrinho
            </h2>
            <p className="text-[11px] text-slate-400">
              Itens da venda
            </p>
          </div>
        </div>

        {/* Botão de Limpar Carrinho (visível quando há itens) */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Remover todos os itens do carrinho"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Área Central: Lista de Itens com Botão de Remoção */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-start">
        {items.length === 0 ? (
          <div className="m-auto text-center max-w-xs space-y-2 py-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-slate-600">
              Carrinho vazio
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Adicione itens pelo botão dos produtos para compor a venda.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {items.map((cartItem) => (
              <div
                key={cartItem.product.id}
                className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="truncate text-left pr-2 flex-1">
                  <div className="font-medium text-slate-800 truncate">
                    {cartItem.product.name}
                  </div>
                  <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                    SKU: {cartItem.product.sku ?? 0} · Qtd: {cartItem.quantity}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-bold text-slate-900 tabular-nums">
                    R$ {(cartItem.product.price * cartItem.quantity).toFixed(2)}
                  </div>

                  {/* Botão para Remover Item do Carrinho */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem?.(cartItem.product.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remover item do carrinho"
                    aria-label={`Remover ${cartItem.product.name} do carrinho`}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo da Venda */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/40 space-y-3">
        <div className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ 0,00</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
            <span>Total</span>
            <span>R$ 0,00</span>
          </div>
        </div>

        {/* Botão de Conclusão (Conceito Base) */}
        <button
          type="button"
          onClick={onCheckout}
          className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Finalizar Venda
        </button>
      </div>
    </aside>
  );
};

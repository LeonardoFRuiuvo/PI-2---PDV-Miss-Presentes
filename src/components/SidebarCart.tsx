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
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const formattedSubtotal = subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:w-80">
      {/* Cabeçalho da Barra Lateral com o Ícone do Carrinho */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
            {totalItemsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-amber-700">
                {totalItemsCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Carrinho
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Itens da venda
            </p>
          </div>
        </div>

        {/* Botão de Limpar Carrinho (visível quando há itens) */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="cursor-pointer text-[11px] font-medium text-slate-400 transition-colors hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Carrinho vazio
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              Adicione itens pelo botão dos produtos para compor a venda.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {items.map((cartItem) => (
              <div
                key={cartItem.product.id}
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div className="truncate text-left pr-2 flex-1">
                  <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {cartItem.product.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    SKU: {cartItem.product.sku ?? 0} · Qtd: {cartItem.quantity}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    R$ {(cartItem.product.price * cartItem.quantity).toFixed(2)}
                  </div>

                  {/* Botão para Remover Item do Carrinho */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem?.(cartItem.product.id)}
                    className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
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
      <div className="space-y-3 border-t border-slate-200 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="space-y-1.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {formattedSubtotal}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            <span>Total</span>
            <span>R$ {formattedSubtotal}</span>
          </div>
        </div>

        {/* Botão de Conclusão (Conceito Base) */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-amber-700 dark:hover:bg-amber-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          Finalizar Venda
        </button>
      </div>
    </aside>
  );
};

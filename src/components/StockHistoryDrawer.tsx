import React, { useEffect, useState } from 'react';
import { ArrowDownUp, Clock3, History, X } from 'lucide-react';
import { StockHistoryEntry } from '../types/pdv';

interface StockHistoryDrawerProps {
  history: StockHistoryEntry[];
  onClose: () => void;
}

export const StockHistoryDrawer: React.FC<StockHistoryDrawerProps> = ({ history, onClose }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="ml-auto flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 id="history-title" className="text-base font-bold text-slate-900 dark:text-slate-100">Histórico</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acompanhe as movimentações</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex gap-1 border-b border-slate-200 px-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            aria-pressed={activeTab === 'stock'}
            className={`border-b-2 px-3 py-3 text-xs font-semibold ${
              activeTab === 'stock'
                ? 'border-amber-700 text-amber-800 dark:border-amber-400 dark:text-amber-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Estoque
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            aria-pressed={activeTab === 'transactions'}
            className={`border-b-2 px-3 py-3 text-xs font-semibold ${
              activeTab === 'transactions'
                ? 'border-amber-700 text-amber-800 dark:border-amber-400 dark:text-amber-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Transações
          </button>
        </div>

        {activeTab === 'stock' ? (
          <div className="flex-1 overflow-y-auto p-5">
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Alterações mais recentes aparecem primeiro.
            </p>
            {history.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <ArrowDownUp className="mb-3 h-6 w-6 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Nenhuma alteração registrada</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ajustes de estoque aparecerão aqui.</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {history.map((entry) => {
                  const difference = entry.newStock - entry.previousStock;
                  return (
                    <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.productName}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {entry.previousStock} → {entry.newStock} unidades
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                          difference > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}>
                          {difference > 0 ? '+' : ''}{difference}
                        </span>
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <Clock3 className="h-3 w-3" />
                        {new Intl.DateTimeFormat('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(entry.changedAt))}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <History className="mb-3 h-6 w-6 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Histórico de transações</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Será preenchido quando o fluxo de finalização e registro de vendas estiver implementado.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

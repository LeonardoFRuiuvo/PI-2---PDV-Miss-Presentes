import React from 'react';
import { Sparkles, Search, Barcode, PackagePlus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  onInventoryClick?: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  onInventoryClick,
  isDarkMode,
  onThemeToggle,
}) => {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 md:grid-cols-[1fr_minmax(0,32rem)_1fr]">
        {/* Identificação da Loja (Miss Presentes) */}
        <div className="flex items-center gap-3 md:row-start-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-700/10 text-amber-800 shadow-2xs dark:border-amber-700/50 dark:text-amber-300">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Miss Presentes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ponto de Venda (PDV)
            </p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <Barcode className="w-4 h-4 stroke-[1.8]" />
            </div>
            <input
              type="text"
              placeholder="Buscar peça ou código..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-amber-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>
        </div>

        <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-2 md:col-start-3">
          <button
            type="button"
            onClick={onInventoryClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <PackagePlus className="h-4 w-4 stroke-[1.8]" />
            <span className="hidden sm:inline">Alterar estoque</span>
          </button>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  );
};

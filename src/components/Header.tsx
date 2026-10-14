import React from 'react';
import { Sparkles, Search, Barcode } from 'lucide-react';

interface HeaderProps {
  onSearchChange?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Identificação da Loja (Miss Presentes) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-700/10 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-2xs">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Miss Presentes
            </h1>
            <p className="text-xs text-slate-500">
              Ponto de Venda (PDV)
            </p>
          </div>
        </div>

        {/* Espaço reservado para desenvolvimento posterior: Busca e Código de Barras */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-4 h-4 stroke-[1.8]" />
            </div>
            <input
              type="text"
              placeholder="Buscar peça ou código..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

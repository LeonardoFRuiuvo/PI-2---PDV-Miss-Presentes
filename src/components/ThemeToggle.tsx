import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    aria-pressed={isDarkMode}
    title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
  >
    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
  </button>
);

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, History, Minus, PackagePlus, Pencil, Plus, Sparkles, Tag, X } from 'lucide-react';
import { Product, StockHistoryEntry } from '../types/pdv';
import { NewProductModal } from './NewProductModal';
import { StockHistoryDrawer } from './StockHistoryDrawer';
import { ThemeToggle } from './ThemeToggle';

interface InventoryPageProps {
  products: Product[];
  categories: string[];
  stockHistory: StockHistoryEntry[];
  onStockChange: (productId: string, stock: number) => void;
  onProductUpdate: (product: Product) => void;
  onProductCreate: (product: Product) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onBack: () => void;
  storageError?: string;
}

interface InventoryProductCardProps {
  product: Product;
  categories: string[];
  onStockChange: (productId: string, stock: number) => void;
  onProductUpdate: (product: Product) => void;
}

const InventoryProductCard: React.FC<InventoryProductCardProps> = ({
  product,
  categories,
  onStockChange,
  onProductUpdate,
}) => {
  const [stockValue, setStockValue] = useState(String(product.stock));
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Product>(product);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    setStockValue(String(product.stock));
  }, [product.stock]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(product);
    }
  }, [product, isEditing]);

  const updateStock = (value: string) => {
    setStockValue(value);
  };

  const finishEditing = () => {
    if (/^\d+$/.test(stockValue) && Number.isSafeInteger(Number(stockValue))) {
      onStockChange(product.id, Number(stockValue));
    } else {
      setStockValue(String(product.stock));
    }
  };

  const toggleCategory = (category: string) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const addCategory = () => {
    const category = newCategory.trim();
    if (category && !draft.categories.some((item) => item.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      setDraft((current) => ({ ...current, categories: [...current.categories, category] }));
    }
    setNewCategory('');
  };

  const saveProduct = () => {
    if (!draft.name.trim() || !Number.isFinite(draft.price) || draft.price < 0) {
      return;
    }
    onProductUpdate({
      ...draft,
      name: draft.name.trim(),
      sku: draft.sku === '' ? undefined : draft.sku,
      categories: [...new Set(draft.categories)],
    });
    setIsEditing(false);
  };

  return (
    <article className="flex h-full min-h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <PackagePlus className="h-5 w-5 stroke-[1.8]" />
        </div>
        {isEditing ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={saveProduct}
              aria-label={`Salvar alterações de ${product.name}`}
              disabled={!draft.name.trim() || !Number.isFinite(draft.price) || draft.price < 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700 text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(product);
                setIsEditing(false);
              }}
              aria-label={`Cancelar edição de ${product.name}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={`Editar produto ${product.name}`}
            title="Editar produto"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-700 dark:hover:bg-amber-950/50 dark:hover:text-amber-300"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Nome do produto
              <input
                type="text"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              SKU
              <input
                type="text"
                value={draft.sku ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Preço (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  price: event.target.value === '' ? Number.NaN : Number(event.target.value),
                }))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tags / categorias</legend>
              <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                {[...new Set([...categories, ...draft.categories])].map((category) => (
                  <label
                    key={category}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      draft.categories.includes(category)
                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="sr-only"
                    />
                    {category}
                  </label>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addCategory();
                    }
                  }}
                  placeholder="Criar nova tag"
                  aria-label="Nome da nova tag"
                  className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                  aria-label="Adicionar tag"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Tag className="h-3.5 w-3.5" />
                </button>
              </div>
            </fieldset>
          </div>
        ) : (
          <>
            <p className="mb-1 font-mono text-xs text-slate-400 dark:text-slate-500">SKU: {product.sku || 0}</p>
            <h2 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{product.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.map((category) => (
                <span key={category} className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {category}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <label htmlFor={`stock-${product.id}`} className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Quantidade em estoque
        </label>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label={`Diminuir estoque de ${product.name}`}
            onClick={() => onStockChange(product.id, Math.max(0, product.stock - 1))}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id={`stock-${product.id}`}
            type="number"
            min="0"
            step="1"
            value={stockValue}
            onChange={(event) => updateStock(event.target.value)}
            onBlur={finishEditing}
            aria-label={`Quantidade em estoque de ${product.name}`}
            className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold tabular-nums text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="button"
            aria-label={`Aumentar estoque de ${product.name}`}
            onClick={() => onStockChange(product.id, product.stock + 1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products,
  categories,
  stockHistory,
  onStockChange,
  onProductUpdate,
  onProductCreate,
  isDarkMode,
  onThemeToggle,
  onBack,
  storageError,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCreateProduct = (product: Product) => {
    onProductCreate(product);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-700/10 text-amber-800 dark:border-amber-700/50 dark:text-amber-300">
          <Sparkles className="h-5 w-5 stroke-[1.8]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Miss Presentes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciamento de estoque</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao PDV
        </button>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <History className="h-4 w-4" />
          Histórico
        </button>
      </div>
    </header>

    <main className="p-4 md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Estoque de produtos</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Atualize a quantidade disponível de cada produto.</p>
      </div>

      {storageError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {storageError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <InventoryProductCard
            key={product.id}
            product={product}
            categories={categories}
            onStockChange={onStockChange}
            onProductUpdate={onProductUpdate}
          />
        ))}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Adicionar novo produto"
          className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-5 text-center transition-colors hover:border-amber-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-amber-700 dark:hover:bg-slate-900"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar novo produto</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cadastrar produto no estoque</p>
        </button>
      </div>
    </main>
      {isCreateModalOpen && (
        <NewProductModal
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateProduct}
        />
      )}
      {isHistoryOpen && (
        <StockHistoryDrawer
          history={stockHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

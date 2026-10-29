import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Tag, X } from 'lucide-react';
import { Product } from '../types/pdv';

interface NewProductModalProps {
  categories: string[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const NewProductModal: React.FC<NewProductModalProps> = ({ categories, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const addCategory = () => {
    const category = newCategory.trim();
    if (category && !selectedCategories.some((item) => item.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      setSelectedCategories((current) => [...current, category]);
    }
    setNewCategory('');
  };

  const handleImage = (file?: File) => {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('A imagem deve ter no máximo 2 MB para ser armazenada no navegador.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      } else {
        setImageError('Não foi possível ler o arquivo de imagem.');
      }
    };
    reader.onerror = () => setImageError('Falha ao ler a imagem. Tente selecionar o arquivo novamente.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0
      || !Number.isInteger(parsedStock) || parsedStock < 0) {
      return;
    }

    const productId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    onSave({
      id: `prod-${productId}`,
      name: name.trim(),
      sku: sku.trim() || undefined,
      categories: selectedCategories,
      price: parsedPrice,
      stock: parsedStock,
      imageUrl,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-product-title"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900"
      >
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
            <div>
              <h2 id="new-product-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">Adicionar produto</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preencha as informações para cadastrar a peça.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar cadastro"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 md:col-span-2">
              Nome do produto <span className="text-red-600">*</span>
              <input
                autoFocus
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Colar de pérolas"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              SKU / código
              <input
                type="text"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="Opcional"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Preço (R$) <span className="text-red-600">*</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0,00"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Quantidade em estoque <span className="text-red-600">*</span>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Tags / categorias</legend>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        selectedCategories.includes(category)
                          ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="sr-only"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              )}
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
                  placeholder="Criar uma nova tag"
                  aria-label="Criar nova tag"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                  aria-label="Adicionar tag à lista"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
              {selectedCategories.length > 0 && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Selecionadas: {selectedCategories.join(', ')}
                </p>
              )}
            </fieldset>

            <div className="md:col-span-2">
              <span className="mb-2 block text-xs font-medium text-slate-600">Imagem do produto</span>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleImage(event.dataTransfer.files[0]);
                }}
                className={`relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                  isDragging ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Prévia do produto" className="max-h-48 rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(undefined);
                        setImageError('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-3 text-xs font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remover imagem
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-7 w-7 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Arraste uma imagem até aqui</p>
                    <p className="my-1 text-xs text-slate-500 dark:text-slate-400">ou</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
                    >
                      selecione pelo gerenciador de arquivos
                    </button>
                    <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">Imagem até 2 MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImage(event.target.files?.[0])}
                  className="sr-only"
                  aria-label="Selecionar imagem do produto"
                />
              </div>
              {imageError && <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-400">{imageError}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800 md:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || price === '' || !Number.isFinite(Number(price)) || Number(price) < 0
                || !Number.isInteger(Number(stock)) || Number(stock) < 0}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <Plus className="h-3.5 w-3.5" />
              Cadastrar produto
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

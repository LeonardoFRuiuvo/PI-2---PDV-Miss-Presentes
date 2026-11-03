import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, CreditCard, QrCode, X } from 'lucide-react';
import { cartItemsToSaleItems, CreateSaleInput } from '../data/api';
import { CartItem } from '../types/pdv';

type PaymentMethod = 'pix' | 'cash' | 'debit' | 'credit';
type DiscountType = 'amount' | 'percentage';
type InterestType = 'amount' | 'percentage';

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onConfirm: (sale: CreateSaleInput, idempotencyKey: string) => Promise<void>;
  isSubmitting: boolean;
}

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof QrCode }[] = [
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
  { id: 'debit', label: 'Débito', icon: CreditCard },
  { id: 'credit', label: 'Crédito', icon: CreditCard },
];

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const getInstallmentAmounts = (total: number, count: number): number[] => {
  const totalInCents = Math.round(total * 100);
  const baseAmount = Math.floor(totalInCents / count);
  const extraCents = totalInCents % count;

  return Array.from({ length: count }, (_, index) =>
    (baseAmount + (index < extraCents ? 1 : 0)) / 100
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [interestType, setInterestType] = useState<InterestType>('percentage');
  const [interestValue, setInterestValue] = useState('');
  const [installments, setInstallments] = useState('1');
  const [cashReceived, setCashReceived] = useState('');
  const [submitError, setSubmitError] = useState<string>();
  const [isConfirming, setIsConfirming] = useState(false);
  const idempotencyKey = useRef<string | undefined>(undefined);
  const lastRequestFingerprint = useRef<string | undefined>(undefined);

  const subtotal = useMemo(
    () => roundCurrency(items.reduce((total, item) => total + item.product.price * item.quantity, 0)),
    [items],
  );
  const parsedDiscount = Math.max(0, Number(discountValue) || 0);
  const discount = roundCurrency(Math.min(
    subtotal,
    discountType === 'percentage' ? subtotal * Math.min(parsedDiscount, 100) / 100 : parsedDiscount,
  ));
  const total = roundCurrency(Math.max(0, subtotal - discount));
  const parsedInterest = Math.max(0, Number(interestValue) || 0);
  const interest = paymentMethod === 'credit'
    ? roundCurrency(interestType === 'percentage' ? total * parsedInterest / 100 : parsedInterest)
    : 0;
  const finalTotal = roundCurrency(total + interest);
  const parsedCashReceived = Number(cashReceived) || 0;
  const change = Math.max(0, parsedCashReceived - total);
  const installmentCount = Math.max(1, Math.min(12, Number(installments) || 1));
  const installmentAmounts = getInstallmentAmounts(finalTotal, installmentCount);
  const smallestInstallment = Math.min(...installmentAmounts);
  const largestInstallment = Math.max(...installmentAmounts);
  const installmentLabel = smallestInstallment === largestInstallment
    ? `${installmentCount}x de ${formatCurrency(smallestInstallment)}`
    : `${installmentCount}x de ${formatCurrency(smallestInstallment)} a ${formatCurrency(largestInstallment)}`;

  const handleConfirm = async () => {
    if (isConfirming || isSubmitting) return;
    if ((discountType === 'percentage' && parsedDiscount > 100)
      || (discountType === 'amount' && parsedDiscount > subtotal)) {
      setSubmitError('O desconto deve estar entre zero e o subtotal da venda.');
      return;
    }
    if (paymentMethod === 'credit' && interestType === 'percentage' && parsedInterest > 1000) {
      setSubmitError('O percentual de juros não pode ultrapassar 1000%.');
      return;
    }
    if (paymentMethod === 'cash' && cashReceived !== '' && parsedCashReceived < total) {
      setSubmitError('O valor recebido não pode ser menor que o total da venda.');
      return;
    }

    setIsConfirming(true);
    setSubmitError(undefined);
    try {
      const sale: CreateSaleInput = {
        payment_method: paymentMethod,
        installments: paymentMethod === 'credit' ? installmentCount : 1,
        discount_type: discountType,
        discount_value: parsedDiscount,
        interest_type: paymentMethod === 'credit' ? interestType : 'amount',
        interest_value: paymentMethod === 'credit' ? parsedInterest : 0,
        ...(paymentMethod === 'cash' && cashReceived !== ''
          ? { amount_received: parsedCashReceived }
          : {}),
        items: cartItemsToSaleItems(items),
      };
      const fingerprint = JSON.stringify(sale);
      if (!idempotencyKey.current || lastRequestFingerprint.current !== fingerprint) {
        idempotencyKey.current = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        lastRequestFingerprint.current = fingerprint;
      }
      await onConfirm(sale, idempotencyKey.current);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível registrar a venda.');
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting && !isConfirming) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirming, isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting && !isConfirming) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
          <div>
            <h2 id="checkout-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">Finalizar venda</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revise os valores e escolha a forma de pagamento.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isConfirming}
            aria-label="Fechar finalização"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr] md:p-6">
          <div className="space-y-5">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Forma de pagamento
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={paymentMethod === id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-colors ${
                      paymentMethod === id
                        ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {paymentMethod === 'credit' && (
              <div className="space-y-4">
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Juros do cartão
                  </h3>
                  <div className="flex gap-2">
                    <select
                      aria-label="Tipo de juros"
                      value={interestType}
                      onChange={(event) => setInterestType(event.target.value as InterestType)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="percentage">% do total</option>
                      <option value="amount">Valor (R$)</option>
                    </select>
                    <input
                      aria-label={interestType === 'percentage' ? 'Juros percentual' : 'Juros em reais'}
                      type="number"
                      min="0"
                      max={interestType === 'percentage' ? 1000 : undefined}
                      step={interestType === 'percentage' ? '0.01' : '0.01'}
                      value={interestValue}
                      onChange={(event) => setInterestValue(event.target.value)}
                      placeholder={interestType === 'percentage' ? 'Ex.: 5' : '0,00'}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {interestType === 'percentage'
                      ? 'Percentual aplicado ao total após o desconto.'
                      : 'Valor total de juros adicionado à venda.'}
                  </p>
                </section>

                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Parcelamento
                  <select
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => {
                      const amounts = getInstallmentAmounts(finalTotal, count);
                      const minAmount = Math.min(...amounts);
                      const maxAmount = Math.max(...amounts);
                      const label = minAmount === maxAmount
                        ? `${count}x de ${formatCurrency(minAmount)}`
                        : `${count}x de ${formatCurrency(minAmount)} a ${formatCurrency(maxAmount)}`;
                      return <option key={count} value={count}>{label}</option>;
                    })}
                  </select>
                  <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                    Juros e parcelas são estimativas informadas manualmente, sem integração com a operadora.
                  </span>
                </label>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Valor recebido (opcional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder="0,00"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {parsedCashReceived > 0 && (
                  <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                    {parsedCashReceived < total
                      ? `Faltam ${formatCurrency(total - parsedCashReceived)}`
                      : `Troco: ${formatCurrency(change)}`}
                  </span>
                )}
              </label>
            )}

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Desconto
              </h3>
              <div className="flex gap-2">
                <select
                  aria-label="Tipo de desconto"
                  value={discountType}
                  onChange={(event) => setDiscountType(event.target.value as DiscountType)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="amount">R$</option>
                  <option value="percentage">%</option>
                </select>
                <input
                  aria-label={discountType === 'amount' ? 'Desconto em reais' : 'Desconto percentual'}
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  placeholder={discountType === 'amount' ? '0,00' : '0'}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                O desconto não pode ultrapassar o subtotal da venda.
              </p>
            </section>
          </div>

          <section className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Resumo da venda</h3>
            <div className="max-h-48 flex-1 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-3 text-xs">
                  <span className="min-w-0 text-slate-600 dark:text-slate-300">
                    <span className="font-medium">{item.product.name}</span>
                    <span className="ml-1 text-slate-400">× {item.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-700 dark:text-slate-200">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Desconto</span>
                <span className="tabular-nums">− {formatCurrency(discount)}</span>
              </div>
              {paymentMethod === 'credit' && (
                <div className="flex justify-between text-amber-800 dark:text-amber-300">
                  <span>Juros</span>
                  <span className="tabular-nums">+ {formatCurrency(interest)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                <span>{paymentMethod === 'credit' ? 'Total no crédito' : 'Total'}</span>
                <span className="tabular-nums">{formatCurrency(finalTotal)}</span>
              </div>
              {paymentMethod === 'credit' && (
                <p className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  {installmentLabel}
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-100 px-5 py-4 dark:border-slate-800 md:px-6">
          {submitError && (
            <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {submitError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              O estoque e os valores serão validados e registrados pelo servidor.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isConfirming}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Voltar ao carrinho
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting || isConfirming || items.length === 0}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                {isSubmitting || isConfirming ? 'Registrando...' : 'Confirmar venda'}
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};

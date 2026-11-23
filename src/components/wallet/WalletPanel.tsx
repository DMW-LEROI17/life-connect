'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createWalletTransactionAction } from '@/actions/wallet';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatFcfa } from '@/lib/format';
import type { WalletTransactionRow } from '@/types/db';

const OPERATORS = [
  {
    value: 'orange_money',
    label: 'Orange Money',
    color: 'bg-[#FF7900]',
    text: 'text-white',
  },
  {
    value: 'mtn_momo',
    label: 'MTN MoMo',
    color: 'bg-[#FFCB05]',
    text: 'text-[#1A1A1A]',
  },
];

export function WalletPanel({
  balance,
  transactions,
}: {
  balance: number;
  transactions: WalletTransactionRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'recharge' | 'retrait'>('recharge');
  const [operator, setOperator] = useState('orange_money');
  const [amount, setAmount] = useState('5000');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.set('type', tab);
    formData.set('provider', operator);
    formData.set('amount', amount);
    formData.set('phone', phone);

    const result = await createWalletTransactionAction(formData);

    if (!result.ok) {
      setError(result.error);
    } else {
      setMessage(result.message ?? 'Opération enregistrée.');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-navy-900 p-5 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Solde LIFE WALLET
        </p>
        <p className="mt-1 text-4xl font-black tracking-tight">
          {formatFcfa(balance)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('recharge')}
            className={`min-h-11 rounded-xl text-sm font-semibold ${
              tab === 'recharge'
                ? 'bg-white text-navy-900'
                : 'bg-white/10 text-white'
            }`}
          >
            Recharger
          </button>
          <button
            type="button"
            onClick={() => setTab('retrait')}
            className={`min-h-11 rounded-xl text-sm font-semibold ${
              tab === 'retrait'
                ? 'bg-white text-navy-900'
                : 'bg-white/10 text-white'
            }`}
          >
            Retirer
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <p className="text-sm font-bold">
          {tab === 'recharge' ? 'Recharger le portefeuille' : 'Demander un retrait'}
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {OPERATORS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setOperator(item.value)}
              className={`rounded-xl border p-3 text-left ${
                operator === item.value
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-line'
              }`}
            >
              <span
                className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-black ${item.color} ${item.text}`}
              >
                {item.label}
              </span>
              <span className="mt-1 block text-[10px] text-muted">
                Paiement mobile
              </span>
            </button>
          ))}
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Montant (FCFA)
          </span>
          <input
            type="number"
            min={100}
            max={1000000}
            step={100}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="input-lc"
            required
          />
        </label>

        <label className="mt-2 block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Numéro {operator === 'orange_money' ? 'Orange' : 'MTN'}
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="6XX XX XX XX"
            className="input-lc"
          />
        </label>

        {error ? (
          <p className="mt-2 rounded-xl border border-urgent-500/30 bg-urgent-50 p-2.5 text-xs font-medium text-urgent-600 dark:bg-urgent-500/10">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-2 rounded-xl border border-teal-500/30 bg-teal-50 p-2.5 text-xs font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
            {message}
          </p>
        ) : null}

        <Button type="submit" className="mt-3 w-full" disabled={loading}>
          {loading ? <Spinner /> : <Icon name="send" size={18} />}
          {tab === 'recharge' ? 'Demander la recharge' : 'Demander le retrait'}
        </Button>

        <p className="mt-2 text-center text-[10px] text-muted">
          Aucun débit réel n’est effectué automatiquement. L’administrateur
          confirme l’opération après le paiement mobile.
        </p>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm font-bold">Historique</p>
        {transactions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Aucune transaction.</p>
        ) : (
          <div className="mt-2 divide-y divide-line">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <p className="text-sm font-semibold">
                    {transaction.type === 'recharge'
                      ? 'Recharge'
                      : transaction.type === 'retrait'
                        ? 'Retrait'
                        : transaction.type}
                  </p>
                  <p className="text-[10px] text-muted">
                    {transaction.provider === 'orange_money'
                      ? 'Orange Money'
                      : transaction.provider === 'mtn_momo'
                        ? 'MTN MoMo'
                        : transaction.provider}{' '}
                    · {transaction.status}
                  </p>
                </div>
                <p
                  className={`text-sm font-bold ${
                    transaction.type === 'recharge'
                      ? 'text-teal-600 dark:text-teal-300'
                      : 'text-urgent-600'
                  }`}
                >
                  {transaction.type === 'recharge' ? '+' : '-'}
                  {formatFcfa(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
